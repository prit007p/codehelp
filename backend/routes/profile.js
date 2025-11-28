import express from 'express';
const router = express.Router();
import User from '../models/User.js';

router.get('/',async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({message: 'token expired',status:false});
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

router.put('/', async (req, res) => {
  const { username, email, avatar } = req.body;
  const currentUsername = req.user.username;

  try {
    const userToUpdate = await User.findOne({ username: currentUsername });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username !== userToUpdate.username) {
      const existingUserWithUsername = await User.findOne({ username });
      if (existingUserWithUsername) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      userToUpdate.username = username;
    }

    if (email && email !== userToUpdate.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
      userToUpdate.email = email;
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

router.post('/add-friend', async (req, res) => {
  const username = req.body.username;
  const currentUserId = req.user.username;

  try {
    const currentUser = await User.findOne({username : currentUserId}); 
    const friendToAdd = await User.findOne({ username }); 
    if (!currentUser || !friendToAdd) {
      return res.json({ message: 'User or friend not found' });
    }

    if (currentUser._id.toString() === friendToAdd._id.toString()) {
      return res.json({ message: 'Cannot add yourself as a friend' });
    }

    if (!Array.isArray(currentUser.friends)) currentUser.friends = [];
    if (currentUser.friends.includes(friendToAdd._id)) {
      return res.json({ message: 'Already friends with this user' });
    }

    currentUser.friends.push(friendToAdd._id);
    await currentUser.save();

    res.status(200).json({ message: 'Friend added successfully!' });
  } catch (err) {
    console.error('Error adding friend:', err);
    res.status(500).json({ message: 'Server error while adding friend' });
  }
});

router.get('/findfriend', async (req, res) => {
  const query = req.query.findfriend; 

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email');
    res.json(users);
  } catch (err) {
    console.error('Error searching users from profile:', err);
    res.status(500).json({ message: 'Server error during user search from profile' });
  }
});

export default router;
