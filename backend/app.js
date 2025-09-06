import express from 'express';
const app = express();
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from "socket.io";
const server = createServer(app);
import login from './routes/login.js';
import questionex from './routes/solution.js';
import register from './routes/register.js';
import mongoose from 'mongoose';
import Message from './models/messageuser.js';
import User from './models/User.js';
import solutionSocket from './other/persaonal-msg-socket.js';
import problemRoutes from './routes/problems.js';
import problemDiscussionSchema from './models/problemdiscussion.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
const secret_key = 'maha_dev'
import profile from './routes/profile.js';
import discussion_socket_io from './other/discussion_socketio.js';
import middleware from './other/middleware.js';
import compileRoutes from './routes/compile.js';
import userRoutes from './routes/users.js';
import chats from './routes/chats.js';
import psl_msg from './routes/psl_msg.js';
import cloudnairy from './other/cloudnairy.js';


app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/questionid',middleware, questionex);
app.use('/api/problems/',middleware, problemRoutes);
app.use('/api/compile',middleware, compileRoutes);

app.use('/api/profile',middleware,profile);
app.use('/api/get-signature',middleware,cloudnairy);
app.use('/api/register', register);
app.use('/api/login', login);

app.use('/api/chats',middleware,chats);
// app.use('/api/psl_msg',middleware,Psl_msg_model);
app.use('/api/psl_msg',middleware,psl_msg);
discussion_socket_io(io);

server.listen(3002, () => {
  console.log('server running at http://localhost:3002');
});






