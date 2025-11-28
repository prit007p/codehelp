import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';
const secret_key = process.env.secret_key;

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user === null) {
            return res.json({ message: 'Invalid email or password' ,status:false});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ message: 'Invalid email or password' ,status:false});
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username,role: user.role },
            secret_key,
            { expiresIn: '7d' }
        );
        res.cookie('token', token, {
            httpOnly: false,       
            sameSite: 'lax',       
            secure: false          
        });
        res.json({user: { _id: user._id, username: user.username, email: user.email,role: user.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

export default router;
