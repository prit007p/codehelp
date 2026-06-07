import express from 'express';
import { validateExecutionRequest } from '../other/codeExecution.js';
import { reviewCode } from '../other/codeReview.js';
import { createMemoryRateLimiter } from '../other/rateLimit.js';

const router = express.Router();

const codeReviewLimiter = createMemoryRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: 'Too many code review requests. Please wait a minute before trying again.',
});

router.post('/', codeReviewLimiter, (req, res) => {
  const validation = validateExecutionRequest(req.body);

  if (validation.error) {
    return res.status(400).json({ message: validation.error, error: validation.error });
  }

  const execution = validation.value;
  const review = reviewCode({
    language: execution.languageKey,
    code: execution.files[0].content,
  });

  return res.json(review);
});

export default router;
