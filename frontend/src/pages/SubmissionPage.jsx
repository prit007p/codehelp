import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios.config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SubmissionPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [errorSubmissions, setErrorSubmissions] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const navigate = useNavigate();
  async function fetchSubmission() {

    setIsLoadingSubmissions(true);
    setErrorSubmissions(null);
    try {
      const response = await axios.get('/api/problems/submission');
      if (response.data.status === false) {
        navigate('/login');
      }
      setSubmissions(response.data);
      console.log(response.data);
    } catch (err) {
      setErrorSubmissions('Failed to fetch submissions.');
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }
  useEffect(() => {
    fetchSubmission();
  }, []);
  return (
    <div className="mx-auto min-h-screen max-w-6xl bg-background px-3 py-6 pt-20 sm:px-5 lg:px-6">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">My Submissions</h1>

      {isLoadingSubmissions && <p>Loading submissions...</p>}
      {errorSubmissions && <p className="text-red-500">Error: {errorSubmissions}</p>}

      {!isLoadingSubmissions && !errorSubmissions && submissions.length === 0 && (
        <p>No submissions yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <Card key={submission._id} className="min-w-0">
            <CardHeader>
              <CardTitle className="break-words text-xl">{submission.problemname}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="break-words"><strong>Language:</strong> {submission.language}</p>
              <p className="break-words"><strong>Status:</strong> {submission.status}</p>
              <p className="break-words"><strong>Remark:</strong> {submission.remark || 'N/A'}</p>
              <Button
                onClick={() => setSelectedSubmission(submission)}
                className="mt-4 w-full sm:w-auto"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 p-3 sm:p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="break-words text-xl sm:text-2xl">Submission Details for {selectedSubmission.problemname}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>X</Button>
            </CardHeader>
            <CardContent>
              <p className="break-words"><strong>Language:</strong> {selectedSubmission.language}</p>
              <p className="break-words"><strong>Status:</strong> {selectedSubmission.status}</p>
              <p className="break-words"><strong>Remark:</strong> {selectedSubmission.remark || 'N/A'}</p>
              <h3 className="text-lg font-semibold mt-4">Code:</h3>
              <pre className="bg-muted p-2 rounded overflow-x-auto">{selectedSubmission.code}</pre>
              <h3 className="text-lg font-semibold mt-4">Test Results:</h3>
              {selectedSubmission.result.map((test, index) => (
                <Card key={index} className="mt-2 p-2">
                  <p><strong>Test Case {index + 1}:</strong> {test.correct ? 'Correct' : 'Incorrect'}</p>
                  <p><strong>Input:</strong> {test.input || 'N/A'}</p>
                  <p><strong>Output:</strong> {test.output || 'N/A'}</p>
                  <p><strong>Expected:</strong> {test.expected || 'N/A'}</p>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SubmissionPage;
