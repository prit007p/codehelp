import mongoose from 'mongoose';

const problemDiscussionSchema = new mongoose.Schema({
    discussionId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('ProblemDiscussion', problemDiscussionSchema);