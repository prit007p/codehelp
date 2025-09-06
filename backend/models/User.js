import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  solvedQuestions: {
    type: [String], // Assuming solved questions are stored as an array of strings (e.g., question IDs)
    default: [],
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  totalSubmissions: {
    type: Number,
    default: 0,
  },
  acceptedSubmissions: {
    type: Number,
    default: 0,
  },
  numberOfQuestionsSolved: {
    type: Number,
    default: 0,
  },
  friends: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  avatar: {
    type: String,
  }
});

const User = mongoose.model('User', userSchema);

export default User; 