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
    <div className="container mx-auto p-4 bg-background">
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>

      {isLoadingSubmissions && <p>Loading submissions...</p>}
      {errorSubmissions && <p className="text-red-500">Error: {errorSubmissions}</p>}

      {!isLoadingSubmissions && !errorSubmissions && submissions.length === 0 && (
        <p>No submissions yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <Card key={submission._id} className="">
            <CardHeader>
              <CardTitle>{submission.problemname}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Language:</strong> {submission.language}</p>
              <p><strong>Status:</strong> {submission.status}</p>
              <p><strong>Remark:</strong> {submission.remark || 'N/A'}</p>
              <Button
                onClick={() => setSelectedSubmission(submission)}
                className="mt-4"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Submission Details for {selectedSubmission.problemname}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>X</Button>
            </CardHeader>
            <CardContent>
              <p><strong>Language:</strong> {selectedSubmission.language}</p>
              <p><strong>Status:</strong> {selectedSubmission.status}</p>
              <p><strong>Remark:</strong> {selectedSubmission.remark || 'N/A'}</p>
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