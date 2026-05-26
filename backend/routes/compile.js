import express from 'express';
const router = express.Router();
import { executeCode } from '../other/pistonClient.js';

router.post('/', async (req, res) => {
  const { testCase } = req.body;
  const pistonPayload = {
    language: testCase.language,
    version: testCase.version,
    files: [{ content: testCase.code }],
    stdin: testCase.input || '',
  };
  try {
    const pistonResponse = await executeCode(pistonPayload);
    res.json({ message: "Test case received", output: pistonResponse.run});
  } catch (error) {
    console.error("Error calling Piston API:", error.upstream || error.message, testCase);
    res.status(error.status || 500).json({
      message: error.message,
      error: error.message
    });
  }
});

export default router;
