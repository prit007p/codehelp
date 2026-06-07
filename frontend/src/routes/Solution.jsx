import React, { useState, useEffect } from 'react';
import axios from 'axios.config';
import { Link, useLocation } from 'react-router-dom';
import Editor from '../components/Editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Solution = () => {
  const location = useLocation();
  const { submissionId, problemId } = location.state || {};

  const [solutionDetails, setSolutionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'testcases'

  useEffect(() => {
    if (!submissionId) {
      setError("No submission ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchSolution = async () => {
      try {
        const response = await axios.get(`/api/problems/submission/${submissionId}`);
        setSolutionDetails(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch solution details.");
        setIsLoading(false);
      }
    };

    fetchSolution();
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg text-muted-foreground">Loading solution details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg text-destructive">Error: {error}</p>
      </div>
    );
  }

  if (!solutionDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-foreground">
        <p className="text-lg text-muted-foreground">Solution not found.</p>
      </div>
    );
  }

  const {
    problemname,
    problemTitle,
    code,
    language,
    status,
    runtime,
    memory,
    result = [],
  } = solutionDetails;
  const title = problemTitle || problemname || 'Problem';

  const renderStatusBadge = (submissionStatus) => {
    let colorClass = 'bg-muted text-muted-foreground';
    switch (submissionStatus) {
      case 'Accepted':
        colorClass = 'bg-green-500/20 text-green-600';
        break;
      case 'Wrong Answer':
      case 'Runtime Error':
        colorClass = 'bg-destructive/20 text-destructive';
        break;
      case 'Time Limit Exceeded':
        colorClass = 'bg-yellow-500/20 text-yellow-600';
        break;
      case 'Compilation Error':
        colorClass = 'bg-purple-500/20 text-purple-600';
        break;
      default:
        break;
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{submissionStatus}</span>;
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-background px-3 py-6 pt-20 text-foreground sm:px-5 lg:px-6">
      <Card className="mb-6 rounded-lg bg-card p-3 shadow-md sm:p-6">
        <CardHeader className="p-0 pb-4 sm:p-6 sm:pt-0">
          <CardTitle className="mb-2 break-words text-2xl font-bold leading-tight text-card-foreground sm:text-3xl">Solution for: 
            {problemId ? (
              <Link to={`/problem/${problemId}`} className="text-primary hover:underline">
                {title}
              </Link>
            ) : (
              title
            )}
          </CardTitle>
          <CardContent className="flex flex-wrap items-center gap-3 p-0 pt-2 text-sm text-muted-foreground sm:gap-4 sm:text-base">
            <p>Language: <span className="font-semibold text-foreground">{language}</span></p>
            <p>Status: {renderStatusBadge(status)}</p>
            <p>Runtime: <span className="font-semibold text-foreground">{runtime || 'N/A'} ms</span></p>
            <p>Memory: <span className="font-semibold text-foreground">{memory || 'N/A'} KB</span></p>
          </CardContent>
        </CardHeader>

        <div className="mb-4 border-b border-border">
          <nav className="-mb-px flex gap-3 overflow-x-auto sm:gap-8" aria-label="Tabs">
            <Button
              variant="ghost"
              className={`
                ${activeTab === 'code' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
                whitespace-nowrap px-1 py-4 text-base font-medium focus:outline-none sm:text-lg
              `}
              onClick={() => setActiveTab('code')}
            >
              Submitted Code
            </Button>
            <Button
              variant="ghost"
              className={`
                ${activeTab === 'testcases' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
                whitespace-nowrap px-1 py-4 text-base font-medium focus:outline-none sm:text-lg
              `}
              onClick={() => setActiveTab('testcases')}
            >
              Test Cases
            </Button>
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'code' && (
            <div className="border border-border rounded-md overflow-hidden">
              <Editor height="min(70vh, 500px)" language={language.toLowerCase()} code={code} setCode={() => {}} readOnly={true} />
            </div>
          )}

          {activeTab === 'testcases' && (
            <div className="space-y-4">
              {result.length > 0 ? (
                result.map((testCase, index) => (
                  <Card key={index} className="border border-border rounded-lg bg-card shadow-sm p-4">
                    <CardTitle className="text-xl font-semibold text-card-foreground mb-2">Test Case {testCase.testCase || index + 1}</CardTitle>
                    <CardContent className="p-0 pt-2">
                      <p className="font-medium text-foreground">Received Output:</p>
                      <pre className="bg-muted p-2 rounded-md text-sm whitespace-pre-wrap mb-2 text-muted-foreground">{testCase.output || 'N/A'}</pre>
                      <p className={`font-semibold mt-2 ${testCase.correct ? 'text-green-600' : 'text-destructive'}`}>Status: {testCase.correct ? 'Passed' : 'Failed'}</p>
                      {testCase.error && <p className="font-semibold text-destructive mt-2">Error: {testCase.error}</p>}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No test case details available for this submission.</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Solution; 
