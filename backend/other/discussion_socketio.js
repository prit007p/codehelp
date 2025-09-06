import problemDiscussionSchema from '../models/problemdiscussion.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
import PsL_msg_model from '../models/psL_msg_model.js';
import User from '../models/User.js';

const JWT_KEY = process.env.secret_key;

const discussion_socket_io = (io) => {
    io.on('connection', (socket) => {

        socket.on('send_discussion_message', ({ discussionId, text, timestamp, token }) => {
            const decode = jwt.verify(token, JWT_KEY);
            const username = decode.username;
            const newDiscussionMessage = new problemDiscussionSchema({
                discussionId,
                username,
                text,
                timestamp
            });
            console.log(newDiscussionMessage);
            newDiscussionMessage.save();

            socket.to(discussionId).emit('receive_discussion_message', {
                username,
                text,
                timestamp
            });
        });
        
        socket.on('join_discussion_room', (roomid) => {
            socket.join(roomid);
        })

        socket.on('join-pslroom', (roomid) => {
            socket.join(roomid);
        })
        
        socket.on('prsnl_msg', async (data) => {
            const { roomid, senderId, reciverId, msg } = data;

            const sender = await User.findById(senderId);
            const receiver = await User.findById(reciverId);

            if (!sender || !receiver) {
                console.error("Sender or Receiver not found");
                return;
            }

            const Sendername = sender.username;
            const recivername = receiver.username;

            const sortedIds = [senderId, reciverId].sort();
            const user1 = sortedIds[0];
            const user2 = sortedIds[1];

            let chat = await PsL_msg_model.findOne({
                $or: [
                    { user1: user1, user2: user2 },
                    { user1: user2, user2: user1 }
                ]
            });

            if (!chat) {
                chat = new PsL_msg_model({
                    user1,
                    user2,
                    messages: []
                });
            }

            const new_message_content = {
                SenderId: senderId,
                ReciverId: reciverId,
                Sendername: Sendername,
                recivername: recivername,
                msg: msg,
                timestamp: new Date()
            };

            chat.messages.push(new_message_content);
            await chat.save();

            io.to(roomid).emit('per_msg', new_message_content);
        })

    })
};

export default discussion_socket_io;