import express from 'express';
const app = express();
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import 'dotenv/config.js';
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
import profile from './routes/profile.js';
import discussion_socket_io from './other/discussion_socketio.js';
import middleware from './other/middleware.js';
import compileRoutes from './routes/compile.js';
import userRoutes from './routes/users.js';
import chats from './routes/chats.js';
import psl_msg from './routes/psl_msg.js';
import cloudnairy from './other/cloudnairy.js';

// Environment variables
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// MongoDB connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected',mongoUri))
  .catch(err => console.error('MongoDB connection error:', err));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  FRONTEND_URL
].filter(Boolean); 

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/questionid',middleware, questionex);
app.use('/api/problems/',middleware, problemRoutes);
app.use('/api/compile', middleware, compileRoutes);
app.use('/api/profile', middleware, profile);
app.use('/api/get-signature', middleware, cloudnairy);
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/chats', middleware, chats);
app.use('/api/psl_msg', middleware, psl_msg);

// Socket.IO setup
discussion_socket_io(io);

// Health check endpoint for Render/Vercel
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});






