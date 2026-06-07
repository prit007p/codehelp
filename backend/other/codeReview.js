const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const countMatches = (code, pattern) => (code.match(pattern) || []).length;

const getIndentDepth = (line) => {
  const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
  return leadingWhitespace.replace(/\t/g, '    ').length;
};

const getComplexitySignals = (code) => {
  const branchCount = countMatches(code, /\b(if|else if|switch|case|catch|elif|except)\b/g);
  const loopCount = countMatches(code, /\b(for|while|do)\b/g);
  const logicalCount = countMatches(code, /(&&|\|\||\band\b|\bor\b)/g);

  return {
    branchCount,
    loopCount,
    logicalCount,
    estimatedComplexity: branchCount + loopCount + logicalCount + 1,
  };
};

const addSuggestion = (suggestions, severity, title, detail) => {
  suggestions.push({ severity, title, detail });
};

const reviewGenericCode = ({ code, lines, nonEmptyLines, language }) => {
  const suggestions = [];
  const strengths = [];
  const maxLineLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const commentLines = lines.filter(line => /^\s*(\/\/|#|\/\*|\*|--)/.test(line)).length;
  const longLineCount = lines.filter(line => line.length > 120).length;
  const maxIndentDepth = lines.reduce((max, line) => Math.max(max, getIndentDepth(line)), 0);
  const duplicateLineCount = (() => {
    const seen = new Map();
    for (const line of lines.map(line => line.trim()).filter(line => line.length > 12)) {
      seen.set(line, (seen.get(line) || 0) + 1);
    }
    return Array.from(seen.values()).filter(count => count > 1).length;
  })();
  const complexity = getComplexitySignals(code);

  if (nonEmptyLines < 4) {
    addSuggestion(suggestions, 'medium', 'Very small solution', 'The code is extremely short. Double-check edge cases and whether all required input is handled.');
  }

  if (longLineCount > 0) {
    addSuggestion(suggestions, 'low', 'Long lines', `${longLineCount} line(s) exceed 120 characters. Break them up to improve readability.`);
  }

  if (maxIndentDepth >= 16) {
    addSuggestion(suggestions, 'medium', 'Deep nesting', 'The solution has deep indentation. Consider early returns or helper functions to flatten the flow.');
  }

  if (duplicateLineCount > 1) {
    addSuggestion(suggestions, 'low', 'Repeated code', 'Several non-trivial lines repeat. A helper function may reduce mistakes and make the solution easier to review.');
  }

  if (/\b(TODO|FIXME|HACK)\b/i.test(code)) {
    addSuggestion(suggestions, 'medium', 'Unfinished marker found', 'Remove TODO/FIXME/HACK comments or finish that part before submitting.');
  }

  if (complexity.estimatedComplexity > 14) {
    addSuggestion(suggestions, 'medium', 'High control-flow complexity', 'There are many branches or loops. Split the logic into smaller named steps if possible.');
  }

  if (commentLines > 0 && nonEmptyLines > 20) {
    strengths.push('Includes some comments to explain intent.');
  }

  if (maxLineLength <= 100) {
    strengths.push('Line lengths are easy to scan.');
  }

  if (maxIndentDepth < 16) {
    strengths.push('Control flow is not deeply nested.');
  }

  if (complexity.loopCount > 0 || complexity.branchCount > 0) {
    strengths.push('Uses explicit control flow, which should make dry runs straightforward.');
  }

  return {
    suggestions,
    strengths,
    metrics: {
      language,
      lines: lines.length,
      nonEmptyLines,
      commentLines,
      maxLineLength,
      maxIndentDepth,
      duplicateLineCount,
      ...complexity,
    },
  };
};

const reviewLanguageSpecificCode = ({ language, code, suggestions, strengths }) => {
  if (language === 'javascript') {
    if (/\bvar\b/.test(code)) {
      addSuggestion(suggestions, 'medium', 'Prefer let or const', 'Use let/const instead of var to avoid function-scope surprises.');
    }
    if (/[^=!]==[^=]|!=[^=]/.test(code)) {
      addSuggestion(suggestions, 'medium', 'Use strict equality', 'Prefer === and !== so type coercion does not hide bugs.');
    }
    if (countMatches(code, /\bconsole\.log\s*\(/g) > 4) {
      addSuggestion(suggestions, 'low', 'Many debug prints', 'Remove extra console.log calls before final submission unless output format requires them.');
    }
    if (/\bconst\b|\blet\b/.test(code)) {
      strengths.push('Uses block-scoped variables.');
    }
  }

  if (language === 'python3') {
    if (/\beval\s*\(/.test(code)) {
      addSuggestion(suggestions, 'high', 'Avoid eval', 'eval can execute unexpected input. Parse input explicitly instead.');
    }
    if (/\bexcept\s*:/.test(code)) {
      addSuggestion(suggestions, 'medium', 'Broad exception handler', 'Catch specific exceptions so real bugs are not hidden.');
    }
    if (/\binput\s*\(/.test(code) && !/\bsys\.stdin\b/.test(code) && code.split('\n').length > 25) {
      addSuggestion(suggestions, 'low', 'Consider faster input', 'For larger inputs, sys.stdin.readline can be faster than repeated input().');
    }
    if (/\bdef\s+\w+\s*\(/.test(code)) {
      strengths.push('Uses functions to organize logic.');
    }
  }

  if (language === 'cpp') {
    if (/\busing\s+namespace\s+std\s*;/.test(code)) {
      addSuggestion(suggestions, 'low', 'Namespace pollution', 'using namespace std is common in contests, but explicit std:: keeps larger codebases clearer.');
    }
    if (/\bendl\b/.test(code)) {
      addSuggestion(suggestions, 'low', 'Avoid unnecessary flushing', 'Use "\\n" instead of endl when you do not need to flush output.');
    }
    if (/\bint\s+\w+\s*\[\s*\w+\s*\]/.test(code)) {
      addSuggestion(suggestions, 'medium', 'Variable-length array', 'Prefer vector<T> for dynamic sizes; VLAs are not standard C++.');
    }
    if (/#include\s*<bits\/stdc\+\+\.h>/.test(code)) {
      strengths.push('Uses a contest-friendly include setup.');
    }
  }

  if (language === 'c') {
    if (/\bgets\s*\(/.test(code)) {
      addSuggestion(suggestions, 'high', 'Unsafe input function', 'gets is unsafe. Use fgets with a buffer size.');
    }
    if (/scanf\s*\(\s*"%s"/.test(code)) {
      addSuggestion(suggestions, 'medium', 'Unbounded string scan', 'Add a width limit to scanf("%s") or use fgets.');
    }
    if (/#include\s*<stdio\.h>/.test(code)) {
      strengths.push('Includes the standard I/O header explicitly.');
    }
  }

  if (language === 'java') {
    if (!/class\s+Main\b/.test(code)) {
      addSuggestion(suggestions, 'high', 'Class name must be Main', 'Piston Java submissions usually need a Main class to compile correctly.');
    }
    if (/\bScanner\b/.test(code) && code.split('\n').length > 35) {
      addSuggestion(suggestions, 'low', 'Scanner can be slow', 'For large inputs, BufferedReader or a custom fast scanner can improve performance.');
    }
    if (/public\s+static\s+void\s+main/.test(code)) {
      strengths.push('Defines a clear Java entry point.');
    }
  }
};

export const reviewCode = ({ language, code }) => {
  const normalizedCode = String(code || '');
  const lines = normalizedCode.split(/\r?\n/);
  const nonEmptyLines = lines.filter(line => line.trim()).length;
  const generic = reviewGenericCode({
    code: normalizedCode,
    lines,
    nonEmptyLines,
    language,
  });

  const suggestions = [...generic.suggestions];
  const strengths = [...generic.strengths];
  reviewLanguageSpecificCode({ language, code: normalizedCode, suggestions, strengths });

  if (suggestions.length === 0) {
    strengths.push('No major style or safety issues found by the local reviewer.');
  }

  const severityPenalty = suggestions.reduce((total, suggestion) => {
    if (suggestion.severity === 'high') return total + 18;
    if (suggestion.severity === 'medium') return total + 10;
    return total + 4;
  }, 0);

  const score = clamp(100 - severityPenalty, 0, 100);
  const highCount = suggestions.filter(suggestion => suggestion.severity === 'high').length;
  const mediumCount = suggestions.filter(suggestion => suggestion.severity === 'medium').length;

  return {
    score,
    summary: highCount
      ? 'Fix the high-priority issues before submitting.'
      : mediumCount
        ? 'Good start. A few changes would make this safer and cleaner.'
        : 'Looks clean from the local review checks.',
    strengths: strengths.slice(0, 5),
    suggestions,
    metrics: generic.metrics,
    checklist: [
      { label: 'Code is non-empty', passed: nonEmptyLines > 0 },
      { label: 'No high-priority issues', passed: highCount === 0 },
      { label: 'Readable line length', passed: generic.metrics.maxLineLength <= 120 },
      { label: 'Moderate complexity', passed: generic.metrics.estimatedComplexity <= 14 },
    ],
  };
};
