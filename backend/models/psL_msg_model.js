import mongoose from 'mongoose';

const messageContentSchema = new mongoose.Schema({
    SenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ReciverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Sendername: {
        type: String,
        required: true
    },
    recivername: {
        type: String,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Psl_msg_model = new mongoose.Schema({
    user1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    user2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    messages:{
        type:[messageContentSchema],
        default:[]
    }
});

export default mongoose.model('Psl_msg_model',Psl_msg_model);