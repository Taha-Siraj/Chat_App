import express  from 'express';
import { userModel } from '../Model/model.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import 'dotenv/config'


const router = express.Router()
const SECRET = process.env.SECRET_KEY;

//signup API
router.post("/signup", async (req, res) => {
  let {firstName , lastName , email , password} = req.body;
  if(!firstName || !lastName || !email || !password){
    res.status(404).send({message: "All Field required"})
    return
  }
  email = email.toLowerCase();
  try {
    let exisEmail = await userModel.findOne({email})
    if(exisEmail){
      return res.status(404).send({message: "User Already exist with this email"})
    } 
    const salt = bcrypt.genSaltSync(10);    
    const hash = bcrypt.hashSync(password, salt);
    let result = await userModel.create({
        firstName,
        lastName,
        email,
        password: hash
    });
    const {password: _p, ...saveUser} = result._doc
    res.status(201).send({message: "User Created Account sucessFully", saveUser})
  }
  catch (error) {
    res.status(500).send({message: "internel server error"})
    console.log(error);
  }
});


// login API
router.post('/login', async(req, res) => {
    let {email , password} = req.body;
    if(!email || !password){
    return  res.status(404).send({message: "All field requried"});  
    } 

    email = email.toLowerCase();

    try {
    let user = await userModel.findOne({email});
    if(!user){
        return res.status(404).send({message: "User Not found with this Email"}
    )}

    let isMatched = bcrypt.compareSync(password, user.password);
    if(!isMatched){
        return res.status(404).send({message: "Wrong Password"})
    }

    let token = jwt.sign({
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bio: user.Bio,
        profile: user.profile,
    }, SECRET, {expiresIn: "1d"})

    res.cookie('token', token,{
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    })
    const { password: _p, ...userWithoutPassword } = user._doc
    res.status(200).send({message: "User SucessFully Login", user: userWithoutPassword});
    } catch (error) {
    res.status(500).send({message: "internel server error"})
    console.log(error)
    }
})


// Logout API
router.post('/logout', (req , res) => {
    res.clearCookie('token',{
        maxAge: 1,
        httpOnly: true,
        secure: true,
    })
    res.status(200).send({msg: "User Logout"});
});


export default router;
