import problemDiscussionSchema from '../models/problemdiscussion.js';
import 'dotenv/config.js';
import PsL_msg_model from '../models/psL_msg_model.js';
import User from '../models/User.js';
import { verifyToken } from '@clerk/backend';
import { getOrCreateUserFromClerk } from './clerkUser.js';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';

const MAX_MESSAGE_LENGTH = 2000;
const getPrivateRoomId = (userA, userB) => [String(userA), String(userB)].sort().join('');
const cleanMessage = (message) => String(message || '').trim().slice(0, MAX_MESSAGE_LENGTH);

const areFriends = async (userId, friendId) => {
    const user = await User.findById(userId).select('friends');
    return Boolean(user?.friends?.some(id => String(id) === String(friendId)));
};

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
            try {
            const messageText = cleanMessage(text);
            if (!messageText || !mongoose.Types.ObjectId.isValid(discussionId)) {
                return;
            }

            const problemExists = await Problem.exists({ _id: discussionId });
            if (!problemExists) {
                return;
            }

            const username = socket.appUser.username;
            const newDiscussionMessage = new problemDiscussionSchema({
                discussionId,
                username,
                text: messageText,
                timestamp
            });
            await newDiscussionMessage.save();

            socket.to(discussionId).emit('receive_discussion_message', {
                username,
                text: messageText,
                timestamp
            });
            } catch (err) {
                console.error('Error handling discussion message:', err);
            }
        });
        
        socket.on('join_discussion_room', async (roomid) => {
            try {
            if (!mongoose.Types.ObjectId.isValid(roomid)) {
                return;
            }

            const problemExists = await Problem.exists({ _id: roomid });
            if (problemExists) {
                socket.join(roomid);
            }
            } catch (err) {
                console.error('Error joining discussion room:', err);
            }
        })

        socket.on('join-pslroom', async (roomid) => {
            try {
            const currentUser = await User.findById(socket.appUser._id).select('friends');
            const canJoin = currentUser?.friends?.some(friendId => getPrivateRoomId(currentUser._id, friendId) === roomid);
            if (canJoin) {
                socket.join(roomid);
            }
            } catch (err) {
                console.error('Error joining personal room:', err);
            }
        })
        
        socket.on('prsnl_msg', async (data) => {
            try {
            const { reciverId, msg } = data;
            const senderId = socket.appUser._id;
            const messageText = cleanMessage(msg);

            if (!messageText || !mongoose.Types.ObjectId.isValid(reciverId)) {
                return;
            }

            if (!(await areFriends(senderId, reciverId))) {
                return;
            }

            const sender = await User.findById(senderId);
            const receiver = await User.findById(reciverId);

            if (!sender || !receiver) {
                console.error("Sender or Receiver not found");
                return;
            }

            const Sendername = sender.username;
            const recivername = receiver.username;

            const sortedIds = [String(senderId), String(reciverId)].sort();
            const user1 = sortedIds[0];
            const user2 = sortedIds[1];
            const roomid = getPrivateRoomId(senderId, reciverId);

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
                msg: messageText,
                timestamp: new Date()
            };

            chat.messages.push(new_message_content);
            await chat.save();

            io.to(roomid).emit('per_msg', new_message_content);
            } catch (err) {
                console.error('Error handling personal message:', err);
            }
        })

    })
};

export default discussion_socket_io;
