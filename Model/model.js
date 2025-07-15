import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName:  {type: String, required: true},
    email:     {type: String, required: true},
    password:  {type: String, required: true},
    profile:   {type: String, default: null },
    createdOn: {type: Date, default: Date.now}
})

export const userModel = mongoose.model('ChatUser', userSchema) 