import express from 'express';
const router = express.Router();
import Psl_msg from '../models/psL_msg_model.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

router.get('/messages/:id',async(req,res)=>{
    const user1Id = req.user.userId; 
    const user2Id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(user2Id)) {
        return res.status(400).json({ message: 'Invalid user id' });
    }

    try {
        const currentUser = await User.findById(user1Id).select('friends');
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFriend = currentUser.friends.some(friendId => String(friendId) === String(user2Id));
        if (!isFriend) {
            return res.status(403).json({ message: 'You can only view chats with friends' });
        }

        const chat = await Psl_msg.findOne({
            $or: [
                { user1: user1Id, user2: user2Id },
                { user1: user2Id, user2: user1Id }
            ]
        });
        if (chat) {
            res.json(chat.messages);
        } else {
            res.json([]); 
        }
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages', error: err.message });
    }
});

export default router;
