import problemDiscussionSchema from '../models/problemdiscussion.js';
import 'dotenv/config.js';
import PsL_msg_model from '../models/psL_msg_model.js';
import User from '../models/User.js';
import { verifyToken } from '@clerk/backend';
import { getOrCreateUserFromClerk } from './clerkUser.js';

const getVerifyOptions = (allowedOrigins) => {
    const options = {
        secretKey: process.env.CLERK_SECRET_KEY,
        authorizedParties: allowedOrigins,
    };

    if (process.env.CLERK_JWT_KEY) {
        options.jwtKey = process.env.CLERK_JWT_KEY;
    }

    return options;
};

const discussion_socket_io = (io, allowedOrigins = []) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const verifiedToken = await verifyToken(token, getVerifyOptions(allowedOrigins));
            const appUser = await getOrCreateUserFromClerk(verifiedToken.sub);

            socket.clerkUserId = verifiedToken.sub;
            socket.appUser = appUser;
            next();
        } catch (err) {
            console.error('Socket authentication failed:', err.message);
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {

        socket.on('send_discussion_message', async ({ discussionId, text, timestamp }) => {
            const username = socket.appUser.username;
            const newDiscussionMessage = new problemDiscussionSchema({
                discussionId,
                username,
                text,
                timestamp
            });
            await newDiscussionMessage.save();

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
            const { roomid, reciverId, msg } = data;
            const senderId = socket.appUser._id;

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
