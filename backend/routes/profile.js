import express from 'express';
const router = express.Router();
import User from '../models/User.js';

router.get('/',async (req, res) => {
  try {
    const username = req.user.username;
    // Populate friends with username, avatar, and _id
    const user = await User.findOne({ username }).populate('friends', 'username avatar _id');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Route to update user profile
router.put('/', async (req, res) => {
  const { username, email, avatar } = req.body;
  const currentUsername = req.user.username; // Assuming req.user is populated by authentication middleware

  try {
    const userToUpdate = await User.findOne({ username: currentUsername });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for unique username if it's being changed
    if (username && username !== userToUpdate.username) {
      const existingUserWithUsername = await User.findOne({ username });
      if (existingUserWithUsername) {
        return res.status(409).json({ message: 'Username already taken.' });
      }
      userToUpdate.username = username;
    }

    // Check for unique email if it's being changed
    if (email && email !== userToUpdate.email) {
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail) {
        return res.status(409).json({ message: 'Email already registered.' });
      }
      userToUpdate.email = email;
    }

    // Update avatar if provided
    if (avatar) {
      userToUpdate.avatar = avatar;
    }

    await userToUpdate.save();
    res.status(200).json(userToUpdate); // Send back the updated user object
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Route to add a friend
router.post('/add-friend', async (req, res) => {
  const username = req.body.username;
  const currentUserId = req.user.username; // Get the ID of the current logged-in user

  try {
    const currentUser = await User.findOne({username : currentUserId}); // Find the current user by ID
    const friendToAdd = await User.findOne({ username }); // Find the friend by username
    if (!currentUser || !friendToAdd) {
      return res.json({ message: 'User or friend not found' });
    }

    // Prevent adding self as friend
    if (currentUser._id.toString() === friendToAdd._id.toString()) {
      return res.json({ message: 'Cannot add yourself as a friend' });
    }

    // Check if already friends with the current user
    if (!Array.isArray(currentUser.friends)) currentUser.friends = [];
    if (currentUser.friends.includes(friendToAdd._id)) {
      return res.json({ message: 'Already friends with this user' });
    }

    // Add friend to current user's friends list
    currentUser.friends.push(friendToAdd._id);
    await currentUser.save();

    res.status(200).json({ message: 'Friend added successfully!' });
  } catch (err) {
    console.error('Error adding friend:', err);
    res.status(500).json({ message: 'Server error while adding friend' });
  }
});

// Route to search for users in profile page
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