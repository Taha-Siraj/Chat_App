import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName:  {type: String, required: true},
    email:     {type: String, required: true},
    password:  {type: String, required: true},
    profile:   {type: String, default: null },
    phoneNumber: {type: Number, default: null },
    Bio: {type: String, default: null },
    createdOn: {type: Date, default: Date.now}
})

export const userModel = mongoose.model('ChatUser', userSchema) 

const msgSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    text: {type: String, ref: 'users', required: true},
    imageUrl: {type: String},
    createdOn: { type: Date, default: Date.now }
})

export const msgModel = mongoose.model('Message', msgSchema)
