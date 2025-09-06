import express from 'express';
const router = express.Router();
import axios from 'axios';

router.post('/', async (req, res) => {
  const { testCase } = req.body;
  const pistonPayload = {
    language: testCase.language,
    version: testCase.version,
    files: [{ content: testCase.code }],
    stdin: testCase.input || '',
  };
  try {
    const pistonResponse = await axios.post('https://emkc.org/api/v2/piston/execute', pistonPayload);
    res.json({ message: "Test case received", output: pistonResponse.data.run});
  } catch (error) {
    console.error("Error calling Piston API:", error.message,testCase);
    res.status(500).json({ message: "Failed to compile/execute code ", error: error.message });
  }
});

export default router;