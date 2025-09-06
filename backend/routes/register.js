import express from 'express';
const router = express.Router();
import axios from 'axios';
import userModel from '../models/User.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();
const secret_key = process.env.secret_key;

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check for existing user by email or username
        const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(password, salt);

        // Let MongoDB generate the _id (ObjectId)
        const newuser = new userModel({ username, email, password: hash_password });
        await newuser.save();

        // Create JWT with user._id as userId
        
        const token = jwt.sign(
            { userId: newuser._id, username: newuser.username },
            secret_key,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: false, // set to true for security in production
            sameSite: 'lax',
            secure: false
        });

        res.json({ success: true, user: { _id: newuser._id, username: newuser.username, email: newuser.email }, token });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error: ' + err.message });
        }
        res.status(500).json({ message: 'Something went wrong!!' });
    }
});

export default router;