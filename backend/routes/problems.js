import express from 'express';
const router = express.Router();
import Problem from '../models/Problem.js';
import Message from '../models/problemdiscussion.js';
import axios from 'axios';
import SubmissionModel from '../models/submission.js';
import mongoose from 'mongoose';
import User from '../models/User.js';


router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/submission',async (req, res) => {
  try{
    const userId = req.user.userId;
    const usersubmission = await SubmissionModel.find({userId });
    console.log(usersubmission);
    res.json(usersubmission);
  }
  catch(err){
    console.log("error in frtching submission",err);
  }
  
});

router.get('/:problemId', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.problemId);
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

router.post('/:problemId/submit', async (req, res) => {
  try {
    const { language, version, files} = req.body;
    const username = req.user.username;
    const user = await User.findOne({username});


    if (!language || !version || !files || !Array.isArray(files) || files.length === 0 || !files[0].content) {
      return res.status(400).json({ error: 'Missing required fields: language, version, or file content.' });
    }

    const problemId = req.params.problemId;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    const testCases = problem.testCases;
    const result = [];
    let status = "Accepted";
    let remark = "";
    for (const testCase of testCases) {
      try {
        const pistonPayload = {
          language: language,
          version: version,
          files: files.map(file => ({
            content: file.content
          })),
          stdin: testCase.input || '',
        };

        const pistonResponse = await axios.post('https://emkc.org/api/v2/piston/execute', pistonPayload);

        const output = pistonResponse.data.run.stdout || '';
        if (output.trim() === testCase.output.trim()) {
          result.push({
            input: testCase.input,
            output: output,
            expected: testCase.output,
            correct: true
          })
          user.acceptedSubmissions++; 
          user.totalSubmissions++;
        }
        else if (pistonResponse.data.run.stderr) {
          result.push({
            input: testCase.input,
            output: output,
            expected: testCase.output,
            correct: false,
          })
          status = "Unaccepted";
          remark = "Compilation Error"
          user.totalSubmissions++;
          break;
        }
        else {
          result.push({
            input: testCase.input,
            output: output,
            expected: testCase.output,
            correct: false,
          })
          status = "Unaccepted";
          remark = "Wrong Output";
          user.totalSubmissions++;
          break;
        }
        
      } catch (err) {
        console.error('Error calling Piston API:', err.response ? err.response.data : err.message);
        if (err.response && err.response.data && err.response.data.message) {
          return res.status(err.response.status || 500).json({ error: err.response.data.message });
        }
        return res.status(500).json({ error: 'Failed to compile or execute code via Piston API.' });
      }
    }
    console.log(result);
    const userId = req.user.userId;
    const code = files[0].content;
    const userDoc = await User.findById(userId);
    const problemDoc = await Problem.findById(problemId);
    const newSubmission = new SubmissionModel({
      problemId,
      problemname:problemDoc.problemName,
      userId,
      username:userDoc.username,
      code,
      language,
      status,
      remark,
      result
    });
    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (err) {
    console.error('Error in submission:', err);
    res.status(500).json({ error: 'Server error during submission' });
  }
});

router.get('/:problemId/submissions', async (req, res) => {
  const userId = req.user.userId;
  const usersubmission = await SubmissionModel.find({ problemId: req.params.problemId, userId });
  // console.log(usersubmission);
  res.json(usersubmission);
})

export default router; 