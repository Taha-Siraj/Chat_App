import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import  {userModel, msgModel, callLogModel, statusModel}  from './Model/model.js';
import { upload, uploadAttachment } from './cloudinary.js';
import authApi from './api/auth.js'
import {Chatrouter} from './api/message.js'
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*"} });
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

const ipRequests = {};
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const timeWindow = 60 * 1000;
  const maxRequests = 120;
  
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  }
  
  ipRequests[ip] = ipRequests[ip].filter(timestamp => now - timestamp < timeWindow);
  
  if (ipRequests[ip].length >= maxRequests) {
    return res.status(429).send({ message: "Too many requests. Please try again later." });
  }
  
  ipRequests[ip].push(now);
  next();
};

app.use('/api/v1', rateLimiter);
const SECRET = process.env.SECRET_KEY;
mongoose.connect(process.env.MONGO_DB).then(() => {console.log("DB is connencted")});


app.use('/api/v1/', authApi)

//MiddleWare
app.use('/api/v1/*splat', (req, res, next) => {
  const token = req.cookies.token;
  console.log("token", token)
  if(!token){
   return res.status(401).send({message: "Unauthorized"})
  }
  jwt.verify(token, SECRET, (err, decodeData) => {
    if(!err){
      const nowDate = new Date().getTime() / 1000;
      if(decodeData.exp < nowDate){
        res.status(401);
        res.clearCookie('token', '', {
          maxAge: 1,
          httpOnly: true,
          secure: false
        })
        res.send({message: "token expire"});
      }else{
        req.body = {...req.body , token: decodeData};
        console.log("decodeData", decodeData)
        next()
      }
    } else{
      res.status(401).send({message: "invalid token"})
    }
});

// Status updates APIs
app.post('/api/v1/status', uploadAttachment.single('file'), async (req, res) => {
  try {
    const userId = req.body.token.user_id;
    const caption = req.body.caption || '';
    if (!req.file) {
      return res.status(400).send({ message: "File is required" });
    }
    const fileUrl = req.file.path || req.file.url;
    const newStatus = await statusModel.create({
      user: userId,
      imageUrl: fileUrl,
      caption
    });
    res.status(200).send({ message: "Status uploaded", status: newStatus });
  } catch (e) {
    console.error("Status upload error:", e);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get('/api/v1/status', async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeStatuses = await statusModel.find({ createdOn: { $gte: cutoff } })
      .populate('user', 'firstName lastName profile')
      .sort({ createdOn: -1 });

    const userStatusMap = {};
    activeStatuses.forEach(s => {
      if (!s.user) return;
      const uId = s.user._id.toString();
      if (!userStatusMap[uId]) {
        userStatusMap[uId] = {
          userId: uId,
          userName: `${s.user.firstName} ${s.user.lastName}`,
          profile: s.user.profile,
          stories: []
        };
      }
      userStatusMap[uId].stories.push({
        id: s._id,
        url: s.imageUrl,
        caption: s.caption,
        time: s.createdOn
      });
    });

    res.status(200).send({ statuses: Object.values(userStatusMap) });
  } catch (e) {
    console.error("Status fetch error:", e);
    res.status(500).send({ message: "Internal server error" });
  }
});

//User reload API
app.get('/api/v1/userprofile', async (req, res) => {
  let userId; 
  if(req.query.user_id){
    userId = req.query.user_id
  }else{
    userId = req.body.token.user_id;
  }

  console.log("req.body.token", req.body)
  try {
    let user = await userModel.findById(userId , {password: 0});
    res.status(200).send({msg: "user found", user:{
      user_id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profile: user.profile,
      phoneNumber: user.phoneNumber,
      bio: user.Bio,
    }})
  } catch (error) {
    res.status(500).send({msg: "internel Server error"})
    console.log(error)
  }
});

// All user API
app.get('/api/v1/allusers', async (req, res) => {
  try {
    let user = await userModel.find({} , {password: 0})
    res.status(200).send({msg : "User found" , user})
  } catch (error) {
    res.status(500).send({msg: "internel server error"})
    console.log(error);
  }
});


app.put('/api/v1/updateprofile/:id', async (req, res) => {
  const id = req.params.id;
  let  {firstName , lastName , email, phoneNumber, Bio} = req.body;
  if (phoneNumber) {
  phoneNumber = Number(phoneNumber);
  if (isNaN(phoneNumber)) {
    return res.status(400).send({ message: "Invalid phone number" });
  }
 }

  if(!firstName || !lastName || !email){
    res.status(404).send({message: "All Field required"})
    return
  }
  try {
    let updatedProfile = await userModel.findByIdAndUpdate(id,{
      firstName,
      lastName,
      email,
      phoneNumber,
      Bio},
      {new: true}
    )
    if(!updatedProfile){
    return res.status(404).send({msg: "User not found"})
    }
    res.status(200).send({msg: "updated profile" , updatedProfile})
  } catch (error) {
    res.status(500).send({msg: "internel server error"})
    console.log(error)
  }
})

app.put('/api/v1/profile-pic/:id', upload.single('image') , async (req, res) => {
  let id = req.params.id;
  try {
    console.log(req.file);
    const updatedUser = await userModel.findByIdAndUpdate(id,
       { profile: req.file.path },)
      res.status(200).send({message: 'Profile image updated', data: updatedUser})
  } catch (error) {
     console.error(error);
    res.status(500).json({message: 'Server error' });
  }
})

const userSockets = {};
const userStatuses = {}; // { [userId]: { status: 'online' | 'offline', lastSeen: Date } }
io.userSockets = userSockets;

app.use('/api/v1', Chatrouter(io))

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    const registerUser = async (uId) => {
        if (!uId || uId === 'undefined') return;
        
        if (!userSockets[uId]) {
            userSockets[uId] = new Set();
        }
        userSockets[uId].add(socket.id);
        socket.userId = uId;
        
        userStatuses[uId] = { status: 'online', lastSeen: new Date() };
        io.emit('status-update', { userId: uId, status: 'online' });
        socket.emit('initial-statuses', userStatuses);
        
        try {
            await msgModel.updateMany({ to: uId, status: 'sent' }, { status: 'delivered' });
        } catch (err) {
            console.error("Error updating delivered status on connect:", err);
        }
        
        console.log(`Registered user ${uId} on socket ${socket.id}`);
    };

    // Register user when query parameters contain userId
    const initialUserId = socket.handshake.query.userId;
    if (initialUserId && initialUserId !== 'undefined') {
        registerUser(initialUserId);
    }

    socket.on('register', (uId) => {
        if (uId) {
            // Clean up old registration if exists
            if (socket.userId && socket.userId !== uId && userSockets[socket.userId]) {
                userSockets[socket.userId].delete(socket.id);
                if (userSockets[socket.userId].size === 0) {
                    delete userSockets[socket.userId];
                    userStatuses[socket.userId] = { status: 'offline', lastSeen: new Date() };
                    io.emit('status-update', { userId: socket.userId, status: 'offline', lastSeen: new Date() });
                }
            }
            registerUser(uId);
        }
    });

    socket.on('typing', ({ to, isTyping }) => {
        if (socket.userId && to) {
            const targets = userSockets[to];
            if (targets) {
                targets.forEach(socketId => {
                    io.to(socketId).emit('typing-status', { from: socket.userId, isTyping });
                });
            }
        }
    });

    socket.on('get-user-status', (targetUserId) => {
        const status = userStatuses[targetUserId] || { status: 'offline', lastSeen: null };
        socket.emit('status-update', { userId: targetUserId, status: status.status, lastSeen: status.lastSeen });
    });

    socket.on('viewing-chat', async ({ chatId }) => {
        socket.activeChat = chatId;
        if (socket.userId && chatId) {
            try {
                await msgModel.updateMany(
                    { from: chatId, to: socket.userId, status: { $ne: 'read' } },
                    { status: 'read' }
                );
                // Notify the sender that their messages to this user have been read
                const targets = userSockets[chatId];
                if (targets) {
                    targets.forEach(socketId => {
                        io.to(socketId).emit('messages-read', { readerId: socket.userId });
                    });
                }
            } catch (err) {
                console.error("Error updating viewing-chat status:", err);
            }
        }
    });

    socket.on('call-user', ({ userToCall, signalData, from, type }) => {
        console.log(`Forwarding call offer from ${from} to ${userToCall} (${type})`);
        const targets = userSockets[userToCall];
        if (targets) {
            targets.forEach(socketId => {
                io.to(socketId).emit('incoming-call', { signal: signalData, from, type });
            });
        }
    });

    socket.on('accept-call', ({ to, signalData }) => {
        console.log(`Forwarding call acceptance to ${to}`);
        const targets = userSockets[to];
        if (targets) {
            targets.forEach(socketId => {
                io.to(socketId).emit('call-accepted', { signal: signalData });
            });
        }
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        const targets = userSockets[to];
        if (targets) {
            targets.forEach(socketId => {
                io.to(socketId).emit('ice-candidate', { candidate });
            });
        }
    });

    socket.on('end-call', ({ to }) => {
        console.log(`Forwarding hangup/rejection to ${to}`);
        const targets = userSockets[to];
        if (targets) {
            targets.forEach(socketId => {
                io.to(socketId).emit('call-ended');
            });
        }
    });

    socket.on('message-reaction', ({ to, msgId, emoji }) => {
        if (socket.userId && to) {
            const targets = userSockets[to];
            if (targets) {
                targets.forEach(socketId => {
                    io.to(socketId).emit('message-reaction-received', { msgId, emoji });
                });
            }
        }
    });

    socket.on("disconnect", (reason) => {
        console.log("Client disconnected:", socket.id, "Reason:", reason);
        if (socket.userId && userSockets[socket.userId]) {
            userSockets[socket.userId].delete(socket.id);
            if (userSockets[socket.userId].size === 0) {
                delete userSockets[socket.userId];
                userStatuses[socket.userId] = { status: 'offline', lastSeen: new Date() };
                io.emit('status-update', { userId: socket.userId, status: 'offline', lastSeen: new Date() });
            }
        }
    });

});


server.listen(5004, () => {
  console.log("Server Is running port 5004")
})