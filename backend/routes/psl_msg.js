import express from 'express';
const router = express.Router();
import axios from 'axios';
import Psl_msg from '../models/psL_msg_model.js';

router.get('/messages/:id',async(req,res)=>{
    const user1Id = req.user.userId; 
    const user2Id = req.params.id;
    try {
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