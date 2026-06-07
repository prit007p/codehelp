import express from 'express';
import User from '../models/User.js';
import PslMessage from '../models/psL_msg_model.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    try{
        const user = await User.findById(req.user.userId).populate('friends', 'username email avatar');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friendsWithLastMessage = await Promise.all(user.friends.map(async (friend) => {
            const chat = await PslMessage.findOne({
                $or: [
                    { user1: user._id, user2: friend._id },
                    { user1: friend._id, user2: user._id }
                ]
            }).select({ messages: { $slice: -1 } }).lean();

            const lastMessage = chat?.messages?.[0];
            return { ...friend.toObject(), lastMessage: lastMessage ? lastMessage.msg : null };
        }));
        res.json(friendsWithLastMessage);
    }    
    catch(err){
        console.log("error in finding friends in Chats",err);
        res.status(500).json({ message: 'Server error while fetching chats' });
    }
})

export default router;
