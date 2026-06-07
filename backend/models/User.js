import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  solvedQuestions: {
    type: [String],
    default: [],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
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
  role:{
    type:String,
    default:"user",
    enum:["user","admin"]
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User; 
