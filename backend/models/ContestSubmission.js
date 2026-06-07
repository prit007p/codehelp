import mongoose from 'mongoose';

const contestSubmissionSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    required: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  problemname: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    default: '',
  },
  result: {
    type: Array,
    default: [],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

contestSubmissionSchema.index({ contestId: 1, userId: 1, problemId: 1 });
contestSubmissionSchema.index({ contestId: 1, score: -1, submittedAt: 1 });

export default mongoose.model('ContestSubmission', contestSubmissionSchema);
