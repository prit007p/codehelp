import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  problems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.pre('validate', function validateContestTime(next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

export default mongoose.model('Contest', contestSchema);
