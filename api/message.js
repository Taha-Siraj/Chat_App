import express from 'express';
import { msgModel } from '../Model/model.js';



export function Chatrouter(io) {
 
  
  const router = express.Router();
  router.post('/chat/:id', async(req, res) => {
  const reciverId = req.params.id;
  const senderId = req.body.token.user_id;
  const {message} = req.body;
  try {
    if (!reciverId || !senderId || !message) {
      return res.status(400).send({ msg: "Missing fields" });
    }
    let result = await msgModel.create({
      from: senderId,
      to: reciverId,
      text: message
    })
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

return router;
}



