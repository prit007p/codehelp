import express from 'express';
const router = express.Router();
import User from '../models/User.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async(req, res) => {
    try {
        const user = await User.findById(req.user.userId).populate('friends', 'username email avatar');
        if (!user) {
            return res.status(401).json({ message: 'User not found', status: false });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});

router.put('/', async(req, res) => {
    const { username, email, avatar } = req.body;

    try {
        const userToUpdate = await User.findById(req.user.userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        const nextUsername = String(username || '').trim();
        if (nextUsername && nextUsername !== userToUpdate.username) {
            if (nextUsername.length < 3 || nextUsername.length > 32) {
                return res.status(400).json({ message: 'Username must be between 3 and 32 characters.' });
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(nextUsername)) {
                return res.status(400).json({ message: 'Username can only contain letters, numbers, underscores, and hyphens.' });
            }

            const existingUserWithUsername = await User.findOne({ username: nextUsername });
            if (existingUserWithUsername) {
                return res.status(409).json({ message: 'Username already taken.' });
            }
            userToUpdate.username = nextUsername;
        }

        if (email && normalizeEmail(email) !== normalizeEmail(userToUpdate.email)) {
            return res.status(400).json({ message: 'Email is managed by Clerk and cannot be changed here.' });
        }

        if (avatar) {
            userToUpdate.avatar = avatar;
        }

        await userToUpdate.save();
        res.status(200).json(userToUpdate);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});

router.post('/add-friend', async(req, res) => {
    const username = req.body.username;

    try {
        const currentUser = await User.findById(req.user.userId);
        const friendToAdd = await User.findOne({ username });
        if (!currentUser || !friendToAdd) {
            return res.json({ message: 'User or friend not found' });
        }

        if (currentUser._id.toString() === friendToAdd._id.toString()) {
            return res.json({ message: 'Cannot add yourself as a friend' });
        }

        if (!Array.isArray(currentUser.friends)) currentUser.friends = [];
        if (currentUser.friends.some(friendId => friendId.equals(friendToAdd._id))) {
            return res.json({ message: 'Already friends with this user' });
        }

        await Promise.all([
            User.updateOne({ _id: currentUser._id }, { $addToSet: { friends: friendToAdd._id } }),
            User.updateOne({ _id: friendToAdd._id }, { $addToSet: { friends: currentUser._id } }),
        ]);

        res.status(200).json({ message: 'Friend added successfully!' });
    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ message: 'Server error while adding friend' });
    }
});

router.get('/findfriend', async(req, res) => {
    const query = String(req.query.findfriend || '').trim();

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    if (query.length > 64) {
        return res.status(400).json({ message: 'Search query is too long' });
    }

    try {
        const escapedQuery = escapeRegex(query);
        const users = await User.find({
            _id: { $ne: req.user.userId },
            $or: [
                { username: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } }
            ]
        }).select('username email avatar').limit(10);
        res.json(users);
    } catch (err) {
        console.error('Error searching users from profile:', err);
        res.status(500).json({ message: 'Server error during user search from profile' });
    }
});

export default router;
