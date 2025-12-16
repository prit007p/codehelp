import express from 'express';
const app = express();
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from "socket.io";
import 'dotenv/config.js';
const server = createServer(app);
import login from './routes/login.js';
import register from './routes/register.js';
import mongoose from 'mongoose';
import problemRoutes from './routes/problems.js';
import cookieParser from 'cookie-parser';
import profile from './routes/profile.js';
import discussion_socket_io from './other/discussion_socketio.js';
import middleware from './other/middleware.js';
import compileRoutes from './routes/compile.js';
import chats from './routes/chats.js';
import psl_msg from './routes/psl_msg.js';
import cloudnairy from './other/cloudnairy.js';
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import Problemdiscussion from './models/problemdiscussion.js';
import User from './models/User.js';
import Problem from './models/Problem.js';
import submission from './models/submission.js';
import messageuser from './models/messageuser.js';

const mongoUri = process.env.MONGO_URI;
const PORT = process.env.PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
})

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected', mongoUri))
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

app.use(cookieParser());
app.use(express.json());




const adminOptions = {
    resources: [Problem, User, submission, Problemdiscussion, messageuser],
}

const admin = new AdminJS(adminOptions)
const adminRouter = AdminJSExpress.buildRouter(admin)
app.use(admin.options.rootPath, adminRouter)



// app.use( middleware,isadmin, adminRoutes);
app.use('/api/problems/', middleware, problemRoutes);
app.use('/api/compile', middleware, compileRoutes);
app.use('/api/profile', middleware, profile);
app.use('/api/get-signature', middleware, cloudnairy);
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/chats', middleware, chats);
app.use('/api/psl_msg', middleware, psl_msg);

discussion_socket_io(io);

server.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});