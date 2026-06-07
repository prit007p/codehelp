const MAX_FILES = 1;
const MAX_CODE_BYTES = Number(process.env.MAX_CODE_BYTES || 50000);
const MAX_OUTPUT_BYTES = Number(process.env.MAX_OUTPUT_BYTES || 20000);

export const supportedExecutionLanguages = Object.freeze({
  javascript: {
    key: 'javascript',
    pistonLanguage: 'javascript',
    version: '18.15.0',
    aliases: ['js', 'node', 'nodejs', 'node-javascript', 'node-js'],
  },
  python3: {
    key: 'python3',
    pistonLanguage: 'python3',
    version: '3.10.0',
    aliases: ['python', 'py', 'py3', 'python3.10'],
  },
  cpp: {
    key: 'cpp',
    pistonLanguage: 'cpp',
    version: '10.2.0',
    aliases: ['c++', 'g++'],
  },
  c: {
    key: 'c',
    pistonLanguage: 'c',
    version: '10.2.0',
    aliases: ['gcc'],
  },
  java: {
    key: 'java',
    pistonLanguage: 'java',
    version: '15.0.2',
    aliases: [],
  },
});

const languageLookup = new Map(
  Object.values(supportedExecutionLanguages).flatMap((language) => [
    [language.key, language],
    [language.pistonLanguage, language],
    ...language.aliases.map((alias) => [alias, language]),
  ])
);

const normalizeLanguage = (language) => String(language || '').trim().toLowerCase();

const truncateOutput = (value) => {
  const output = String(value || '');
  if (Buffer.byteLength(output, 'utf8') <= MAX_OUTPUT_BYTES) {
    return output;
  }

  return `${output.slice(0, MAX_OUTPUT_BYTES)}\n...[output truncated]`;
};

export const validateExecutionRequest = ({ language, version, files } = {}) => {
  const languageConfig = languageLookup.get(normalizeLanguage(language));

  if (!languageConfig) {
    return {
      error: `Unsupported language. Allowed languages: ${Object.keys(supportedExecutionLanguages).join(', ')}`,
    };
  }

  if (version && String(version).trim() !== languageConfig.version) {
    return {
      error: `Unsupported ${languageConfig.key} version. Expected ${languageConfig.version}.`,
    };
  }

  if (!Array.isArray(files) || files.length === 0) {
    return { error: 'At least one source file is required.' };
  }

  if (files.length > MAX_FILES) {
    return { error: `Only ${MAX_FILES} source file is supported per run.` };
  }

  const sanitizedFiles = files.map((file) => ({
    content: typeof file?.content === 'string' ? file.content : '',
  }));

  if (!sanitizedFiles[0].content.trim()) {
    return { error: 'Source code cannot be empty.' };
  }

  const totalBytes = sanitizedFiles.reduce(
    (sum, file) => sum + Buffer.byteLength(file.content, 'utf8'),
    0
  );

  if (totalBytes > MAX_CODE_BYTES) {
    return { error: `Source code is too large. Limit is ${MAX_CODE_BYTES} bytes.` };
  }

  return {
    value: {
      language: languageConfig.pistonLanguage,
      languageKey: languageConfig.key,
      version: languageConfig.version,
      files: sanitizedFiles,
    },
  };
};

export const publicJudgeResult = ({ index, output, correct }) => ({
  testCase: index + 1,
  output: truncateOutput(output),
  correct: Boolean(correct),
});

export const sanitizeSubmission = (submission) => {
  const raw = submission?.toObject ? submission.toObject() : submission;

  if (!raw) return raw;

  return {
    ...raw,
    result: (raw.result || []).map((testResult, index) => publicJudgeResult({
      index,
      output: testResult.output,
      correct: testResult.correct,
    })),
  };
};
