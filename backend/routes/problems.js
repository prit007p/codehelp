import express from 'express';
const router = express.Router();
import Problem from '../models/Problem.js';
import Message from '../models/problemdiscussion.js';
import SubmissionModel from '../models/submission.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { executeCode } from '../other/pistonClient.js';
import { createMemoryRateLimiter } from '../other/rateLimit.js';
import {
  publicJudgeResult,
  sanitizeSubmission,
  validateExecutionRequest,
} from '../other/codeExecution.js';

const problemListFields = 'problemName difficulty tags createdAt updatedAt';
const problemPublicFields = 'problemName difficulty description examples constraints tags createdAt updatedAt';
const submissionLimiter = createMemoryRateLimiter({
  windowMs: 60_000,
  max: 20,
  message: 'Too many submissions. Please wait a minute before trying again.',
});

const getProblemStatuses = async (userId) => {
  const submissions = await SubmissionModel.find({ userId })
    .select('problemId status remark createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const byProblem = new Map();

  for (const submission of submissions) {
    const problemKey = String(submission.problemId);
    const existing = byProblem.get(problemKey);

    if (!existing || submission.status === 'Accepted') {
      byProblem.set(problemKey, {
        status: submission.status,
        remark: submission.remark || '',
      });
    }
  }

  return byProblem;
};

router.get('/', async (req, res) => {
  try {
    const [problems, problemStatuses] = await Promise.all([
      Problem.find().select(problemListFields).lean(),
      getProblemStatuses(req.user.userId),
    ]);

    res.json(problems.map(problem => ({
      ...problem,
      ...(problemStatuses.get(String(problem._id)) || { status: 'Unsolved', remark: '' }),
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/submission',async (req, res) => {
  try{
    const userId = req.user.userId;
    const usersubmission = await SubmissionModel.find({userId }).sort({ createdAt: -1 });
    res.json(usersubmission.map(sanitizeSubmission));
  }
  catch(err){
    console.log("error in frtching submission",err);
    res.status(500).json({ message: 'Server error while fetching submissions' });
  }
  
});

router.get('/submission/:submissionId', async (req, res) => {
  try {
    const submission = await SubmissionModel.findOne({
      _id: req.params.submissionId,
      userId: req.user.userId,
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(sanitizeSubmission(submission));
  } catch (err) {
    console.error("error in fetching submission", err);
    res.status(500).json({ message: 'Server error while fetching submission' });
  }
});

router.get('/:problemId', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId).select(problemPublicFields);
    if (!problem) {
      return res.status(404).json({ msg: 'Problem not found' });
    }
    res.json(problem);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Problem not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

router.get('/:problemId/discussions', async (req, res) => {
  try {
    const discussionId = req.params.problemId;
    const messages = await Message.find({ discussionId });
    
    if (!messages) {
      return res.json({});
    }
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/:problemId/submit', submissionLimiter, async (req, res) => {
  try {
    const validation = validateExecutionRequest(req.body);
    if (validation.error) {
      return res.status(400).json({ error: validation.error, message: validation.error });
    }

    const execution = validation.value;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const problemId = req.params.problemId;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    const testCases = problem.testCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ error: 'This problem has no judge test cases configured.' });
    }

    const result = [];
    let status = "Accepted";
    let remark = "All test cases passed";
    for (const [index, testCase] of testCases.entries()) {
      try {
        const pistonPayload = {
          language: execution.language,
          version: execution.version,
          files: execution.files,
          stdin: testCase.input || '',
        };

        const pistonResponse = await executeCode(pistonPayload);

        const output = pistonResponse.run.stdout || '';
        const stderr = pistonResponse.run.stderr || '';
        if (!stderr && output.trim() === testCase.output.trim()) {
          result.push(publicJudgeResult({ index, output, correct: true }));
        }
        else if (stderr) {
          result.push(publicJudgeResult({ index, output: stderr, correct: false }));
          status = "Compilation Error";
          remark = "Compilation Error"
          break;
        }
        else {
          result.push(publicJudgeResult({ index, output, correct: false }));
          status = "Wrong Answer";
          remark = "Wrong Output";
          break;
        }
        
      } catch (err) {
        console.error('Error calling Piston API:', err.upstream || err.message);
        return res.status(err.status || 500).json({
          message: err.message,
          error: err.message
        });
      }
    }
    user.totalSubmissions += 1;
    if (status === "Accepted") {
      user.acceptedSubmissions += 1;
      if (!user.solvedQuestions.includes(problemId)) {
        user.solvedQuestions.push(problemId);
        user.numberOfQuestionsSolved = user.solvedQuestions.length;
      }
    }

    const userId = req.user.userId;
    const code = execution.files[0].content;
    await user.save();
    const newSubmission = new SubmissionModel({
      problemId,
      problemname:problem.problemName,
      userId,
      username:user.username,
      code,
      language: execution.languageKey,
      status,
      remark,
      result
    });
    await newSubmission.save();
    res.status(201).json(sanitizeSubmission(newSubmission));
  } catch (err) {
    console.error('Error in submission:', err);
    res.status(500).json({ error: 'Server error during submission' });
  }
});

router.get('/:problemId/submissions', async (req, res) => {
  const userId = req.user.userId;
  const usersubmission = await SubmissionModel.find({ problemId: req.params.problemId, userId });
  // console.log(usersubmission);
  res.json(usersubmission.map(sanitizeSubmission));
})

export default router; 
