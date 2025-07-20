import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import  {userModel}  from './Model/model.js';
import { upload } from './cloudinary.js';
import authApi from './api/auth.js'
import {Chatrouter} from './api/message.js'
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: "*"} });
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
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
          secure: true
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
  })
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

app.use('/api/v1', Chatrouter(io))

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
  
     socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });
});




// const _dirname = path.resolve();
// app.use('/', express.static(path.join(_dirname, '/frontend/dist')));
// app.use('/*splat', express.static(path.join(_dirname, '/frontend/dist')));

server.listen(5004, () => {
  console.log("Server Is running port 5004")
})