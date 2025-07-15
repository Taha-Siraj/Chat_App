import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import  {userModel}  from './Model/model.js';

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser())
app.use(express.json())


const SECRET = process.env.SECRET_KEY


mongoose.connect(process.env.MONGO_DB).then(() => {console.log("DB is connencted")});

//signup API
app.post("/api/v1/signup", async (req, res) => {
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
app.post('/api/v1/login', async(req, res) => {
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
app.post('/api/v1/logout', (req , res) => {
    res.clearCookie('token',{
        maxAge: 1,
        httpOnly: true,
        secure: true,
    })
    res.status(200).send({msg: "User Logout"});
});

//MiddleWare

app.use('/api/v1/*splat', (req, res, next) => {
  const token = req.cookies.token;
  console.log(token)
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
})

//User reload API
app.get('/api/v1/userprofile', async (req, res) => {
  const id = req.body?.token?.user_id;
  try {
    let user = await userModel.findById(id , {password: 0});
    res.status(200).send({msg: "user Login", user:{
      user_id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profile: user.profile,
    }})
  } catch (error) {
     console.log(error)
     res.status(500).send({msg: "internel Server error"})
  }
})

// All user API
app.get('/api/v1/allusers', async (req, res) => {
  try {
    let user = await userModel.find({} , {password: 0})
    res.status(200).send({msg : "User found" , user})
  } catch (error) {
    res.status(500).send({msg: "internel server error"})
    console.log(error);
  }
})


const _dirname = path.resolve();
app.use('/', express.static(path.join(_dirname, '/frontend/dist')));
app.use('/*splat', express.static(path.join(_dirname, '/frontend/dist')));

app.listen(5004, () => {
  console.log("Server Is running port 5004")
});