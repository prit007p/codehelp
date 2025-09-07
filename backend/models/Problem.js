import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  explanation: { type: String, default: '' }
});

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  problemName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  examples: [exampleSchema], 
  constraints: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{ type: String, trim: true }], 
  testCases: [testCaseSchema], 
  imageUrls: [{ type: String, trim: true }] 
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem; 