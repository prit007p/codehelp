import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaPlay, FaTrash, FaPlus, FaChevronDown, FaTimes } from 'react-icons/fa';
import Editor from '../components/Editor';
import Selector, { supportedLanguages } from '../components/Selector';
import DiscussionChat from '../components/DiscussionChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const defaultCodeSnippets = {
  javascript: 'console.log("Hello, JavaScript!");',
  python: 'print("Hello, Python!")',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}',
  ruby: 'puts "Hello, Ruby!"',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}',
};

const SingleProblemPage = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [isLoadingProblem, setIsLoadingProblem] = useState(true);
  const [errorProblem, setErrorProblem] = useState(null);


  const [language, setLanguage] = useState(supportedLanguages[0]);
  const [code, setCode] = useState(defaultCodeSnippets[supportedLanguages[0].editorLanguage] || "");
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const showToast = ({ title, description, status }) => {
    if (title) alert(`${title}${description ? '\n' + description : ''}`);
  };

  const [activeTab, setActiveTab] = useState('problem');
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [errorSubmissions, setErrorSubmissions] = useState(null);
  const [testCases, setTestCases] = useState([{ id: Date.now(),code: code, input: '',language: language.editorLanguage,version: language.version, expectedOutput: '', receivedOutput: '', isExecuting: false, status: null, isOpen: false }]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId) return;
      setIsLoadingProblem(true);
      try {
        const response = await axios.get(`/api/problems/${problemId}`);
        setProblem(response.data);
        // console.log(response.data);
        setErrorProblem(null);
      } catch (err) {
        setErrorProblem(err.response?.data?.msg || err.message || 'Failed to fetch problem details');
        setProblem(null);
      } finally {
        setIsLoadingProblem(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    setCode(defaultCodeSnippets[language.editorLanguage] || `// Start typing your ${language.displayName} code here...`);
  }, [language]);

  const handleRuntest = async (testCase) => {
    if (!code.trim()) {
      showToast({ title: "Code is empty", description: "Please write some code to run.", status: "warning" });
      return;
    }

    setTestCases(prev => prev.map(tc => 
      tc.id === testCase.id ? { ...tc, isExecuting: true, isOpen: true } : tc
    ));

    try{
      testCase.language = language.editorLanguage;
      testCase.version = language.version;
      testCase.code = code;
      // console.log("this is code", code);
      // console.log("this is testCase", testCase);

      
      const responseData = (await axios.post(`/api/compile`, {testCase})).data;
      console.log("Response Data from Backend:", responseData);

      let receivedOutputContent = "";
      let testPassed = false;

      if (responseData.output) {
          const runOutput = responseData.output;

          if (runOutput.stderr) {
              receivedOutputContent = runOutput.stderr;
              testPassed = false;
          } else if (runOutput.stdout) {
              receivedOutputContent = runOutput.stdout;
              const cleanedReceivedOutput = receivedOutputContent.trim();
              const cleanedExpectedOutput = testCase.expectedOutput.trim();
              testPassed = cleanedReceivedOutput === cleanedExpectedOutput;
          }
           else {
              receivedOutputContent = "";
              testPassed = false;
          }
      } else if (responseData.error) {
          receivedOutputContent = `Error from Backend: ${responseData.error}`;
          testPassed = false;
      } else {
          receivedOutputContent = "Unknown error occurred.";
          testPassed = false;
      }

      setTestCases(prev => prev.map(tc => 
        tc.id === testCase.id ? { 
          ...tc, 
          receivedOutput: receivedOutputContent,
          status: testPassed ? "Accepted" : "Failed",
          isExecuting: false 
        } : tc
      ));

      if(testPassed){
        showToast({ title: "Test case passed", description: "", status: "success" });
      }
      else{
        showToast({ title: "Test case failed", description: "", status: "error" });
      }
    }
    catch(err){
      let errorMessage = "Error during execution.";
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = `Backend Error: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setTestCases(prev => prev.map(tc => 
        tc.id === testCase.id ? { 
          ...tc, 
          receivedOutput: errorMessage, 
          status: "Failed",
          isExecuting: false 
        } : tc
      ));
      showToast({ title: "Error in running test case", description: errorMessage, status: "error" });
    }
    
  };

  const handleNewTestcase = () => {
    setTestCases(prev => [...prev, { id: Date.now(),code: code, input: '',language: language.editorLanguage,version: language.version, expectedOutput: '', receivedOutput: '', isExecuting: false, status: null, isOpen: false }]);
  };

  const handleDeleteTestcase = (id) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const handleTestcaseInputChange = (id, field, value) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? { ...tc, [field]: value } : tc));
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleRunAllTestCases = async () => {
    if (!code.trim()) {
      showToast({ title: "Code is empty", description: "Please write some code to run all test cases.", status: "warning" });
      return;
    }

    setIsExecutingCode(true);

    try {
      for (const testCase of testCases) {
        await handleRuntest(testCase);
        await delay(500);
      }
      showToast({ title: "All test cases executed!", description: "", status: "success" });
    } catch (error) {
      showToast({ title: "Error running all test cases", description: error.message, status: "error" });
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      showToast({ title: "Code is empty", description: "Please write some code to submit.", status: "warning" });
      return;
    }
    
    setIsExecutingCode(true);
    try {
      const payload = {
        language: language.name,
        version: language.version,
        files: [{ content: code }],
      };
    
      const response = (await axios.post(`/api/problems/${problemId}/submit`, payload)).data;
      console.log(response);
      if (response.status ===  'Accepted') {
        showToast({ title: "All test cases passed!", description: "", status: "success" });
      }
      else {
        showToast({ title: response.remark, description: "", status: "warning" });
      }
    } catch (err) {
      let errorMessage = "Could not connect to the submission service.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      showToast({ title: "Submission Error", description: errorMessage, status: "error" });
    } finally {
      setIsExecutingCode(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'submissions' && problemId) {
      setIsLoadingSubmissions(true);
      setErrorSubmissions(null);
      axios.get(`/api/problems/${problemId}/submissions`)
        .then(res => {
          setSubmissions(res.data || []);
        })
        .catch(err => {
          setErrorSubmissions(err.response?.data?.message || err.message || 'Failed to fetch submissions');
        })
        .finally(() => setIsLoadingSubmissions(false));
    }
  }, [activeTab, problemId]);

  const handleToggleAccordion = (id) => {
    setTestCases(prev => prev.map(tc => 
      tc.id === id ? { ...tc, isOpen: !tc.isOpen } : tc
    ));
  };

  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const closeSubmissionModal = () => {
    setIsSubmissionModalOpen(false);
    setSelectedSubmission(null);
  };

  useEffect(() => {
    if (selectedSubmission) {
      setIsSubmissionModalOpen(true);
    }
  }, [selectedSubmission]);

  if (isLoadingProblem) {
    return (
      <Card className="flex justify-center items-center h-[calc(100vh - 7.5rem)] p-5">
        <CardContent>
          <p className="text-xl font-semibold">Loading problem...</p>
        </CardContent>
      </Card>
    );
  }

  if (errorProblem) {
    return (
      <Card className="p-5 m-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <CardContent className="p-0">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">Error fetching problem: {errorProblem}</span>
        </CardContent>
      </Card>
    );
  }

  if (!problem) {
    return (
      <Card className="p-5 m-5 text-center">
        <CardContent>
          <p>Problem not found.</p>
        </CardContent>
      </Card>
    );
  }

  const visibleExamples = problem.examples;

  return (
    <Card className="min-h-screen bg-background text-foreground rounded-none shadow-none border-none  gap-4">
      <CardContent className="p-0 md:p-4 rounded-none shadow-none border-none">
  
        {/* Left Column */}
        <Card className="p-4 rounded-none shadow-none border-none col-span-1 ">
          <Card className="shadow-none">
            {problem && (
              <CardHeader>
                <CardTitle className="text-3xl font-bold">{problem.problemName}</CardTitle>
              </CardHeader>
            )}
  
            <CardContent className="h-fit">
              <Card className="mb-4 shadow-none">
                <CardContent className="flex space-x-2 p-4">
                  {["problem", "submissions", "discussion"].map(tab => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? "default" : "secondary"}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </CardContent>
              </Card>
  
              {activeTab === "problem" && (
                <Card className=" rounded-none shadow-none border-none">
                  <CardContent className="space-y-4 ">
                    <Card className=" shadow-none">
                      <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                      <CardContent>{problem.description}</CardContent>
                    </Card>
                    <Card className=" shadow-none">
                      <CardHeader><CardTitle>Constraints</CardTitle></CardHeader>
                      <CardContent>{problem.constraints}</CardContent>
                    </Card>
                    <Card className=" rounded-none shadow-none border-none p-0 m-0">
                      <CardHeader  className="p-3"><CardTitle>Testcases</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        {problem.examples?.length ? problem.examples.map((example, idx) => (
                          <Card key={idx} className="mb-2 shadow-none p-0">
                            <CardContent className="p-5">
                              <Card className="rounded-none shadow-none border-none p-0">
                                <CardHeader className="p-1"><CardTitle>Input</CardTitle></CardHeader>
                                <CardContent className="p-1">{example.input}</CardContent>
                              </Card>
                              <Card className="rounded-none shadow-none border-none p-0">
                                <CardHeader  className="p-1"><CardTitle>Output</CardTitle></CardHeader>
                                <CardContent className="p-1">{example.output}</CardContent>
                              </Card>
                            </CardContent>
                          </Card>
                        )) : (
                          <p className="text-muted-foreground">No examples provided.</p>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}
  
              {activeTab === "submissions" && (
                <Card className="shadow-none rounded-none border-none">
                  <CardHeader><CardTitle>Submissions</CardTitle></CardHeader>
                  <CardContent>
                    {isLoadingSubmissions ? (
                      <p>Loading submissions...</p>
                    ) : errorSubmissions ? (
                      <p className="text-destructive">Error: {errorSubmissions}</p>
                    ) : submissions.length === 0 ? (
                      <p>No submissions yet.</p>
                    ) : (
                      <Card className="shadow-none">
                        <CardContent className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left">Problem Name</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Language</th>
                                <th className="px-4 py-2 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submissions.map(sub => (
                                <tr 
                                  key={sub._id} 
                                  className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                                  onClick={() => setSelectedSubmission(sub)}
                                >
                                  <td className="px-4 py-2 font-medium">{sub.problemname}</td>
                                  <td className="px-4 py-2">{sub.status}</td>
                                  <td className="px-4 py-2">{sub.language}</td>
                                  <td className="px-4 py-2">{new Date(sub.timestamp).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              )}
  
              {activeTab === "discussion" && (
                <Card className=" rounded-none shadow-none border-none  h-fit">
                  <CardContent className="p-0">
                    <DiscussionChat problemId={problemId} />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </Card>
  
        {/* Right Column */}
        {activeTab !== "discussion" && (
        <Card className="p-4 flex-col col-span-1 border-none">
          <Card className="flex-1 mb-4 shadow-none">
            <CardHeader className="flex justify-between">
              <CardTitle>Code Editor</CardTitle>
              <Selector selectedLanguage={language} setSelectedLanguage={setLanguage} />
            </CardHeader>
            <CardContent>
              <Editor language={language.editorLanguage} input={code} height='50vh' setinput={setCode} className="min-h-[300px] border rounded" />
            </CardContent>
          </Card>
  
          <Card className="shadow-none">
            <CardHeader><CardTitle>Test Cases</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {testCases.map((tc, idx) => (
                <Card key={tc.id} className="shadow-none border">
                  <CardHeader className="flex flex-row items-center justify-between cursor-pointer p-4" onClick={() => handleToggleAccordion(tc.id)}>
                    <CardTitle className="text-lg">Test Case {idx + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {tc.status && <span className={`px-2 py-1 rounded-full text-xs ${tc.status === 'Accepted' ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive'}`}>{tc.status}</span>}
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTestcase(tc.id); }} className="border-destructive text-destructive hover:bg-destructive/10">
                        <FaTrash className="mr-2"/>Delete
                      </Button>
                    </div>
                  </CardHeader>
                  {tc.isOpen && (
                    <CardContent className="space-y-3 p-4 pt-0">
                      <div className="space-y-1">
                        <Label htmlFor={`input-${tc.id}`}>Input</Label>
                        <Input id={`input-${tc.id}`} value={tc.input} onChange={(e) => handleTestcaseInputChange(tc.id, 'input', e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`expected-${tc.id}`}>Expected</Label>
                        <Input id={`expected-${tc.id}`} value={tc.expectedOutput} onChange={(e) => handleTestcaseInputChange(tc.id, 'expectedOutput', e.target.value)} />
                      </div>
                      {tc.receivedOutput && (
                        <div className="space-y-1">
                          <Label>Received Output</Label>
                          <pre className={`p-3 rounded-md text-sm overflow-x-auto ${tc.status === 'Accepted' ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive'}`}>{tc.receivedOutput}</pre>
                        </div>
                      )}
                      <Button onClick={() => handleRuntest(tc)} disabled={tc.isExecuting} className="mt-2">
                        {tc.isExecuting ? "Running..." : "Run"}
                      </Button>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 p-4">
              <Button onClick={handleNewTestcase} variant="outline" className="flex items-center space-x-2">
                <FaPlus />
                <span>Add Test Case</span>
              </Button>
              <Button onClick={handleRunAllTestCases} disabled={isExecutingCode} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white">
                <FaPlay />
                <span>{isExecutingCode ? "Running All..." : "Run All Tests"}</span>
              </Button>
              <Button onClick={handleSubmitCode} disabled={isExecutingCode} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white">
                <FaPlay />
                <span>{isExecutingCode ? "Submitting..." : "Submit Code"}</span>
              </Button>
            </CardFooter>
          </Card>
        </Card>
      )}
      </CardContent>
      
      {/* Modal */}
      {isSubmissionModalOpen && selectedSubmission && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-2xl font-bold">Submission Details</CardTitle>
              <Button onClick={closeSubmissionModal} variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="rounded-lg p-4 shadow-sm"><CardContent className="p-0"><strong>Status:</strong> <span className={`font-semibold ${selectedSubmission.status === 'Accepted' ? 'text-green-600' : 'text-red-600'}`}>{selectedSubmission.status}</span></CardContent></Card>
                <Card className="rounded-lg p-4 shadow-sm"><CardContent className="p-0"><strong>Language:</strong> {selectedSubmission.language}</CardContent></Card>
                <Card className="rounded-lg p-4 shadow-sm"><CardContent className="p-0"><strong>Submitted At:</strong> {new Date(selectedSubmission.timestamp).toLocaleString()}</CardContent></Card>
                {selectedSubmission.remark && <Card className="rounded-lg p-4 shadow-sm"><CardContent className="p-0"><strong>Remark:</strong> {selectedSubmission.remark}</CardContent></Card>}
              </div>
              <Card className="rounded-lg p-4 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-lg font-semibold">Submitted Code</CardTitle></CardHeader>
                <CardContent className="p-0"><pre className="p-4 rounded-md text-sm overflow-x-auto">{selectedSubmission.code}</pre></CardContent>
              </Card>
              
            </CardContent>
          </Card>
        </Card>
      )}
    </Card>
  );
  
}
export default SingleProblemPage;