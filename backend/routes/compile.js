import express from 'express';
const router = express.Router();
import { executeCode } from '../other/pistonClient.js';
import { validateExecutionRequest } from '../other/codeExecution.js';
import { createMemoryRateLimiter } from '../other/rateLimit.js';

const codeRunLimiter = createMemoryRateLimiter({
  windowMs: 60_000,
  max: 30,
  message: 'Too many code runs. Please wait a minute before trying again.',
});

router.post('/', codeRunLimiter, async (req, res) => {
  const { testCase } = req.body;
  const runRequest = testCase
    ? {
        language: testCase.language,
        version: testCase.version,
        files: [{ content: testCase.code || '' }],
        stdin: testCase.input || '',
      }
    : {
        language: req.body?.language,
        version: req.body?.version,
        files: req.body?.files,
        stdin: req.body?.stdin || '',
      };

  const validation = validateExecutionRequest({
    language: runRequest.language,
    version: runRequest.version,
    files: runRequest.files,
  });

  if (validation.error) {
    return res.status(400).json({ message: validation.error, error: validation.error });
  }

  const execution = validation.value;
  const pistonPayload = {
    language: execution.language,
    version: execution.version,
    files: execution.files,
    stdin: runRequest.stdin,
  };
  try {
    const pistonResponse = await executeCode(pistonPayload);
    res.json({ message: "Test case received", output: pistonResponse.run});
  } catch (error) {
    console.error("Error calling Piston API:", error.upstream || error.message);
    res.status(error.status || 500).json({
      message: error.message,
      error: error.message
    });
  }
});

export default router;
