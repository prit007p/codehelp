import mongoose from 'mongoose';

const message = new mongoose.Schema({
    Sendername:String,
    recivername:String,
    msg:String,
    timestamp:{type:Date,default:Date.now()}
});

export default mongoose.model('message',message);