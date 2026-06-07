import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios.config';
import { Play, Trophy } from 'lucide-react';
import Editor from '@/components/Editor';
import Selector, { supportedLanguages } from '@/components/Selector';
import CodeReviewPanel from '@/components/CodeReviewPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const defaultCodeSnippets = {
  javascript: 'console.log("Hello, JavaScript!");',
  python: 'print("Hello, Python!")',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}',
};

const ContestProblemPage = () => {
  const { contestId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState(supportedLanguages[0]);
  const [code, setCode] = useState(defaultCodeSnippets[supportedLanguages[0].editorLanguage] || '');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCode(defaultCodeSnippets[language.editorLanguage] || `// Start typing your ${language.displayName} code here...`);
  }, [language]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/contests/${contestId}/problems/${problemId}`);
        setProblem(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load contest problem');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [contestId, problemId]);

  const submitCode = async () => {
    if (!code.trim()) {
      setError('Please write code before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const response = await axios.post(`/api/contests/${contestId}/problems/${problemId}/submit`, {
        language: language.name,
        version: language.version,
        files: [{ content: code }],
      });
      setSubmission(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <p className="text-center text-muted-foreground">Loading problem...</p>
      </main>
    );
  }

  if (!problem) {
    return (
      <main className="min-h-screen bg-background px-4 py-20 text-foreground">
        <Card className="mx-auto max-w-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-destructive">{error || 'Problem not found'}</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-3 py-20 text-foreground sm:px-5 lg:px-6">
      <section className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="min-w-0 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link to={`/contest/${contestId}`} className="text-sm font-medium text-primary hover:underline">
                  Back to contest
                </Link>
                <CardTitle className="mt-3 break-words text-2xl font-black sm:text-3xl">{problem.problemName}</CardTitle>
              </div>
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                {problem.difficulty}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap break-words leading-7">{problem.description}</CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap break-words leading-7">{problem.constraints || 'No constraints provided.'}</CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {problem.examples?.length ? problem.examples.map((example, index) => (
                  <div key={index} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold">Input</p>
                    <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-sm">{example.input}</pre>
                    <p className="mt-3 text-sm font-semibold">Output</p>
                    <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-sm">{example.output}</pre>
                    {example.explanation && (
                      <p className="mt-3 text-sm text-muted-foreground">{example.explanation}</p>
                    )}
                  </div>
                )) : (
                  <p className="text-muted-foreground">No examples provided.</p>
                )}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
	          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Contest Editor</CardTitle>
              <Selector selectedLanguage={language} setSelectedLanguage={setLanguage} />
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <Editor language={language.editorLanguage} input={code} height="min(58vh, 560px)" setinput={setCode} />
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Link to={`/contest/${contestId}/leaderboard`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </Button>
                </Link>
                <Button onClick={submitCode} disabled={submitting} className="w-full sm:w-auto">
                  <Play className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
	          </Card>

	          <CodeReviewPanel code={code} language={language.name} version={language.version} />

	          {(error || submission) && (
            <Card className={error ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}>
              <CardHeader>
                <CardTitle>{error ? 'Submission Error' : 'Latest Contest Submission'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {error ? (
                  <p className="text-destructive">{error}</p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-bold">{submission.status}</p>
                      </div>
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="font-bold">{submission.score}/100</p>
                      </div>
                      <div className="rounded-lg bg-background p-3">
                        <p className="text-xs text-muted-foreground">Remark</p>
                        <p className="font-bold">{submission.remark || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">Result</th>
                            <th className="px-3 py-2 text-left">Output</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submission.result?.map((test, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="px-3 py-2">{index + 1}</td>
                              <td className={`px-3 py-2 font-semibold ${test.correct ? 'text-green-600' : 'text-destructive'}`}>
                                {test.correct ? 'Passed' : 'Failed'}
                              </td>
                              <td className="px-3 py-2">
                                <pre className="max-w-md overflow-x-auto whitespace-pre-wrap break-words">{test.output || 'No output'}</pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
};

export default ContestProblemPage;
