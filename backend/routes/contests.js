import express from 'express';
import mongoose from 'mongoose';
import Contest from '../models/Contest.js';
import ContestSubmission from '../models/ContestSubmission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { executeCode } from '../other/pistonClient.js';
import { createMemoryRateLimiter } from '../other/rateLimit.js';
import {
  publicJudgeResult,
  sanitizeSubmission,
  validateExecutionRequest,
} from '../other/codeExecution.js';

const router = express.Router();
const contestSubmissionLimiter = createMemoryRateLimiter({
  windowMs: 60_000,
  max: 20,
  message: 'Too many contest submissions. Please wait a minute before trying again.',
});

const problemPublicFields = 'problemName difficulty description examples constraints tags';
const problemListFields = 'problemName difficulty tags';

const getContestStatus = (contest) => {
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'running';
};

const isParticipant = (contest, userId) => (
  contest.participants?.some(participantId => String(participantId) === String(userId))
);

const serializeContest = (contest, userId) => {
  const status = getContestStatus(contest);
  const participantCount = contest.participants?.length || 0;

  return {
    ...contest.toObject(),
    status,
    participantCount,
    isRegistered: userId ? isParticipant(contest, userId) : false,
  };
};

const sanitizeContestSubmission = sanitizeSubmission;

const getContestOr404 = async (contestId, populateProblems = false) => {
  if (!mongoose.Types.ObjectId.isValid(contestId)) {
    return null;
  }

  const query = Contest.findById(contestId);
  if (populateProblems) {
    query.populate('problems', problemListFields);
  }

  return query.exec();
};

const ensureProblemInContest = (contest, problemId) => (
  contest.problems?.some(problemRef => String(problemRef._id || problemRef) === String(problemId))
);

router.get('/', async (req, res) => {
  try {
    const contests = await Contest.find({ isPublic: true })
      .sort({ startTime: -1 })
      .populate('problems', problemListFields);

    res.json(contests.map(contest => serializeContest(contest, req.user.userId)));
  } catch (err) {
    console.error('Error fetching contests:', err);
    res.status(500).json({ message: 'Server error while fetching contests' });
  }
});

router.get('/:contestId', async (req, res) => {
  try {
    const contest = await getContestOr404(req.params.contestId, true);

    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json(serializeContest(contest, req.user.userId));
  } catch (err) {
    console.error('Error fetching contest:', err);
    res.status(500).json({ message: 'Server error while fetching contest' });
  }
});

router.post('/:contestId/register', async (req, res) => {
  try {
    const contest = await getContestOr404(req.params.contestId);

    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (getContestStatus(contest) === 'ended') {
      return res.status(400).json({ message: 'Contest has already ended' });
    }

    const updatedContest = await Contest.findByIdAndUpdate(
      contest._id,
      { $addToSet: { participants: req.user.userId } },
      { new: true }
    );

    res.json({
      message: 'Registered for contest',
      contest: serializeContest(updatedContest || contest, req.user.userId),
    });
  } catch (err) {
    console.error('Error registering for contest:', err);
    res.status(500).json({ message: 'Server error while registering for contest' });
  }
});

router.get('/:contestId/problems', async (req, res) => {
  try {
    const contest = await getContestOr404(req.params.contestId, true);

    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (getContestStatus(contest) === 'upcoming') {
      return res.status(403).json({ message: 'Problems unlock when the contest starts' });
    }

    if (!isParticipant(contest, req.user.userId)) {
      return res.status(403).json({ message: 'Register before viewing contest problems' });
    }

    res.json(contest.problems || []);
  } catch (err) {
    console.error('Error fetching contest problems:', err);
    res.status(500).json({ message: 'Server error while fetching contest problems' });
  }
});

router.get('/:contestId/problems/:problemId', async (req, res) => {
  try {
    const contest = await getContestOr404(req.params.contestId);

    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (getContestStatus(contest) === 'upcoming') {
      return res.status(403).json({ message: 'Problem unlocks when the contest starts' });
    }

    if (!isParticipant(contest, req.user.userId)) {
      return res.status(403).json({ message: 'Register before viewing this problem' });
    }

    if (!ensureProblemInContest(contest, req.params.problemId)) {
      return res.status(404).json({ message: 'Problem is not part of this contest' });
    }

    const problem = await Problem.findById(req.params.problemId).select(problemPublicFields);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json(problem);
  } catch (err) {
    console.error('Error fetching contest problem:', err);
    res.status(500).json({ message: 'Server error while fetching contest problem' });
  }
});

router.post('/:contestId/problems/:problemId/submit', contestSubmissionLimiter, async (req, res) => {
  try {
    const validation = validateExecutionRequest(req.body);
    if (validation.error) {
      return res.status(400).json({ message: validation.error, error: validation.error });
    }
    const execution = validation.value;

    const contest = await getContestOr404(req.params.contestId);
    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    if (getContestStatus(contest) !== 'running') {
      return res.status(403).json({ message: 'Submissions are allowed only while the contest is running' });
    }

    if (!isParticipant(contest, req.user.userId)) {
      return res.status(403).json({ message: 'Register before submitting to this contest' });
    }

    if (!ensureProblemInContest(contest, req.params.problemId)) {
      return res.status(404).json({ message: 'Problem is not part of this contest' });
    }

    const [problem, user] = await Promise.all([
      Problem.findById(req.params.problemId),
      User.findById(req.user.userId),
    ]);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const testCases = problem.testCases || [];
    if (testCases.length === 0) {
      return res.status(400).json({ message: 'This problem has no judge test cases configured' });
    }

    const result = [];
    let passedCount = 0;
    let remark = '';

    for (const testCase of testCases) {
      const pistonPayload = {
        language: execution.language,
        version: execution.version,
        files: execution.files,
        stdin: testCase.input || '',
      };

      try {
        const pistonResponse = await executeCode(pistonPayload);
        const stdout = pistonResponse.run?.stdout || '';
        const stderr = pistonResponse.run?.stderr || '';
        const correct = !stderr && stdout.trim() === testCase.output.trim();

        if (correct) {
          passedCount += 1;
        } else if (stderr && !remark) {
          remark = 'Runtime or compilation error';
        } else if (!remark) {
          remark = 'Wrong output';
        }

        result.push(publicJudgeResult({
          index: result.length,
          output: stdout || stderr,
          correct,
        }));
      } catch (err) {
        console.error('Contest Piston error:', err.upstream || err.message);
        return res.status(err.status || 500).json({
          message: err.message,
          error: err.message,
        });
      }
    }

    const score = Math.round((passedCount / testCases.length) * 100);
    const status = passedCount === testCases.length ? 'Accepted' : (remark === 'Runtime or compilation error' ? 'Compilation Error' : 'Wrong Answer');
    if (status === 'Accepted') {
      remark = 'All test cases passed';
    }

    const contestSubmission = new ContestSubmission({
      contestId: contest._id,
      problemId: problem._id,
      problemname: problem.problemName,
      userId: user._id,
      username: user.username,
      code: execution.files[0].content,
      language: execution.languageKey,
      status,
      score,
      remark,
      result,
    });

    await contestSubmission.save();
    res.status(201).json(sanitizeContestSubmission(contestSubmission));
  } catch (err) {
    console.error('Error in contest submission:', err);
    res.status(500).json({ message: 'Server error during contest submission' });
  }
});

router.get('/:contestId/leaderboard', async (req, res) => {
  try {
    const contest = await getContestOr404(req.params.contestId);

    if (!contest || !contest.isPublic) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const submissions = await ContestSubmission.find({ contestId: contest._id })
      .sort({ submittedAt: 1 })
      .lean();

    const byUser = new Map();

    for (const submission of submissions) {
      const userKey = String(submission.userId);
      const problemKey = String(submission.problemId);

      if (!byUser.has(userKey)) {
        byUser.set(userKey, {
          userId: userKey,
          username: submission.username,
          problems: new Map(),
          lastSubmissionTime: submission.submittedAt,
        });
      }

      const row = byUser.get(userKey);
      const existingBest = row.problems.get(problemKey);
      const isBetterScore = !existingBest || submission.score > existingBest.score;
      const isEarlierTie = existingBest && submission.score === existingBest.score && new Date(submission.submittedAt) < new Date(existingBest.submittedAt);

      if (isBetterScore || isEarlierTie) {
        row.problems.set(problemKey, {
          problemId: problemKey,
          problemname: submission.problemname,
          score: submission.score,
          status: submission.status,
          submittedAt: submission.submittedAt,
        });
      }

      if (!row.lastSubmissionTime || new Date(submission.submittedAt) > new Date(row.lastSubmissionTime)) {
        row.lastSubmissionTime = submission.submittedAt;
      }
    }

    const leaderboard = Array.from(byUser.values()).map(row => {
      const problemScores = Array.from(row.problems.values());
      const totalScore = problemScores.reduce((sum, problemScore) => sum + problemScore.score, 0);
      const problemsSolved = problemScores.filter(problemScore => problemScore.status === 'Accepted').length;

      return {
        userId: row.userId,
        username: row.username,
        totalScore,
        problemsSolved,
        lastSubmissionTime: row.lastSubmissionTime,
        problemScores,
      };
    }).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
      return new Date(a.lastSubmissionTime || 0) - new Date(b.lastSubmissionTime || 0);
    }).map((row, index) => ({
      rank: index + 1,
      ...row,
    }));

    res.json({
      contestId: contest._id,
      status: getContestStatus(contest),
      leaderboard,
    });
  } catch (err) {
    console.error('Error fetching contest leaderboard:', err);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

export default router;
