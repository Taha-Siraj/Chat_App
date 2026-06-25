import express from 'express';
import { msgModel, callLogModel } from '../Model/model.js';
import { uploadAttachment } from '../cloudinary.js';

export function Chatrouter(io) {
  const router = express.Router();

  // Attachment upload route (must be defined BEFORE wildcard :id route)
  router.post('/chat/upload', uploadAttachment.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ msg: "No file uploaded" });
      }
      res.status(200).send({ 
        msg: "File uploaded successfully", 
        fileUrl: req.file.path,
        fileName: req.file.originalname 
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).send({ msg: "File upload failed" });
    }
  });

  router.post('/chat/:id', async(req, res) => {
  const reciverId = req.params.id;
  const senderId = req.body.token.user_id;
  const {message, fileUrl, fileType} = req.body;
  try {
    if (!reciverId || !senderId || (!message && !fileUrl)) {
      return res.status(400).send({ msg: "Missing fields" });
    }
    let initialStatus = 'sent';
    const recipientSocketIds = io.userSockets[reciverId];
    if (recipientSocketIds && recipientSocketIds.size > 0) {
      initialStatus = 'delivered';
      for (const socketId of recipientSocketIds) {
        const sock = io.sockets.sockets.get(socketId);
        if (sock && sock.activeChat === senderId) {
          initialStatus = 'read';
          break;
        }
      }
    }

    let result = await msgModel.create({
      from: senderId,
      to: reciverId,
      text: message || "",
      fileUrl: fileUrl || null,
      fileType: fileType || 'text',
      status: initialStatus
    });
    let conversation = await msgModel.findById(result._id)
    .populate({path: 'from', select: "firstName lastName email"})
    .populate({path: 'to', select: "firstName lastName email"})
    .exec();
    io.emit(`${senderId}-${reciverId}`, conversation);
    io.emit(`personal-channel-${reciverId}`, conversation)
    res.status(201).send({msg: "sent msg", conversation})
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).send({ msg: "Internal server error" });
    
  }
})

router.get("/conversation/:id", async (req, res) => {
  const reciverId = req.params.id;
  const senderId = req.body.token.user_id;
 
  try {
    let usermsg = await msgModel.find({
      $or: [
        { from: reciverId, to: senderId },
        { from: senderId, to: reciverId }
      ]
    })
    .populate({path: 'from', select: "firstName lastName email"})
    .populate({path: 'to', select: "firstName lastName email"})
    .exec();
    res.status(200).send({ msg: "message found", conversion: usermsg });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal server error" });
  }
});

  // Get call history logs
  router.get('/calllogs', async (req, res) => {
    const userId = req.body.token.user_id;
    try {
      const logs = await callLogModel.find({
        $or: [{ caller: userId }, { receiver: userId }]
      })
      .populate({ path: 'caller', select: 'firstName lastName email profile' })
      .populate({ path: 'receiver', select: 'firstName lastName email profile' })
      .sort({ createdOn: -1 })
      .exec();
      res.status(200).send({ msg: "Call logs found", logs });
    } catch (error) {
      console.error("Fetch call logs error:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });

  // Create call log entry
  router.post('/calllogs', async (req, res) => {
    const userId = req.body.token.user_id;
    const { receiverId, type, status, duration } = req.body;
    try {
      if (!receiverId || !status) {
        return res.status(400).send({ msg: "Missing fields" });
      }
      const newLog = await callLogModel.create({
        caller: userId,
        receiver: receiverId,
        type: type || 'audio',
        status,
        duration: duration || 0
      });
      const populatedLog = await callLogModel.findById(newLog._id)
      .populate({ path: 'caller', select: 'firstName lastName email profile' })
      .populate({ path: 'receiver', select: 'firstName lastName email profile' })
      .exec();
      res.status(201).send({ msg: "Call log recorded", log: populatedLog });
    } catch (error) {
      console.error("Record call log error:", error);
      res.status(500).send({ msg: "Internal server error" });
    }
  });

return router;
}




