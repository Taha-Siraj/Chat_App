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

export const userModel = mongoose.model('users', userSchema) 

const msgSchema = new mongoose.Schema({
    from: { type:  mongoose.ObjectId, ref: 'users', required: true },
    to: { type:  mongoose.ObjectId, ref: 'users', required: true },
    text: { type: String, default: "" },
    imageUrl: { type: String },
    fileUrl: { type: String, default: null },
    fileType: { type: String, enum: ['text', 'image', 'video', 'audio', 'document'], default: 'text' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    createdOn: { type: Date, default: Date.now }
})

msgSchema.index({ from: 1, to: 1 });
msgSchema.index({ to: 1, from: 1 });
msgSchema.index({ createdOn: -1 });

export const msgModel = mongoose.model('Message', msgSchema)

const callLogSchema = new mongoose.Schema({
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    status: { type: String, enum: ['missed', 'rejected', 'answered'], required: true },
    duration: { type: Number, default: 0 }, // in seconds
    createdOn: { type: Date, default: Date.now }
})

callLogSchema.index({ caller: 1, receiver: 1 });
callLogSchema.index({ receiver: 1, caller: 1 });
callLogSchema.index({ createdOn: -1 });

export const callLogModel = mongoose.model('CallLog', callLogSchema)

const statusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: "" },
    createdOn: { type: Date, default: Date.now }
})

statusSchema.index({ user: 1 });
statusSchema.index({ createdOn: -1 });

export const statusModel = mongoose.model('Status', statusSchema)

