import express from 'express';
import User from '../models/User.js';
import message from '../models/messageuser.js';
const router = express.Router();

router.get('/',async (req,res)=>{
    const username = req.user.username;
    try{
        const user = await User.findOne({username});
        const friendsWithLastMessage = await Promise.all(user.friends.map(async (friend) => {
            const lastMessage = await message.findOne({
                $or: [
                    { Sendername: username, recivername: friend.username },
                    { Sendername: friend.username, recivername: username }
                ]
            }).sort({ timestamp: -1 }).limit(1);
            return { ...friend.toObject(), lastMessage: lastMessage ? lastMessage.msg : null };
        }));
        res.json(friendsWithLastMessage);
    }    
    catch(err){
        console.log("error in finding friends in Chats",err);
    }
})

export default router;