import express from 'express';
import { msgModel } from '../Model/model.js';



export function Chatrouter(io) {
 
  
    const router = express.Router();
router.post('/chat/:id', async(req, res) => {
  const senderId = req.params.id;
  const reciverId = req.body.token.user_id;
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
    io.emit(`${senderId}-${reciverId}`, result);
    res.status(201).send({msg: "sent msg", result})
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
    });

    res.status(200).send({ msg: "message found", conversion: usermsg });
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal server error" });
  }
});
return router;
}



