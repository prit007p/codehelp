import React, { useState, useEffect } from 'react';
import axios from 'axios.config';
// Remove Chakra UI imports
// import { Box, Flex, VStack, HStack, Select, Button as ChakraButton, Text, Heading, Textarea, useToast, CircularProgress, Grid, GridItem } from '@chakra-ui/react';
import Editor from '../components/Editor';
import Selector, { supportedLanguages } from '../components/Selector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Default code snippets for languages
const defaultCodeSnippets = {
  javascript: 'console.log("Hello, JavaScript!");',
  python: 'print("Hello, Python!")',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}',
  ruby: 'puts "Hello, Ruby!"',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}',
};

const CodeEditor = () => {
  const [language, setLanguage] = useState(supportedLanguages[0]);
  const [code, setCode] = useState(defaultCodeSnippets[supportedLanguages[0].editorLanguage] || "");
  const [output, setOutput] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState('output'); // 'output' or 'input'

  // Define outputBg and outputColor based on the output content
  // const outputBg = output.includes("Error") ? "bg-red-100" : "bg-gray-100";
  // const outputColor = output.includes("Error") ? "text-red-800" : "text-gray-800";

  // Replaced useToast with a simple alert function
  const showToast = ({ title, description, status }) => {
    if (title) alert(`${title}${description ? '\n' + description : ''}`);
  };

  useEffect(() => {
    setCode(defaultCodeSnippets[language.editorLanguage] || `// Start typing your ${language.displayName} code here...`);
  }, [language]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      showToast({ title: "Code is empty", description: "Please write some code to run.", status: "warning" });
      return;
    }
    setIsLoading(true);
    setOutput(""); // Clear previous output

    try {
      const payload = {
        language: language.name,
        version: language.version,
        files: [{ content: code }],
        stdin: userInput,
      };

      const response = (await axios.post(`/api/compile`, payload)).data;
      console.log("Response Data from Backend:", response);

      if (response.output) {
        const runOutput = response.output;
        if (runOutput.stderr) {
          setOutput(runOutput.stderr);
          showToast({ title: "Execution Error", description: "Your code encountered an error.", status: "error" });
        } else {
          setOutput(runOutput.stdout);
          showToast({ title: "Execution Successful", description: "Code ran successfully.", status: "success" });
        }
      } else if (response.error) {
        setOutput(`Error from Backend: ${response.error}`);
        showToast({ title: "API Error", description: response.error, status: "error" });
      } else {
        setOutput("Unknown error occurred.");
        showToast({ title: "Unknown Error", description: "An unknown error occurred during compilation.", status: "error" });
      }
    } catch (err) {
      let errorMessage = "Could not connect to the compilation service.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setOutput(`Execution Failed: ${errorMessage}`);
      showToast({ title: "API Error", description: errorMessage, status: "error" });
      setDisplayMode('output'); // Still switch to output view to show the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndInput = () => {
    setOutput("");
    // setUserInput(""); // Optionally clear previous stdin or keep it
    setDisplayMode('input');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 flex-1">
        {/* Code Editor Section */}
        <Card className="col-span-1 lg:col-span-2 p-4 flex flex-col">
          <CardHeader className="flex-row justify-between items-center pb-4">
            <CardTitle className="text-2xl font-semibold text-card-foreground">Code Editor</CardTitle>
            <div className="flex space-x-4">
              <Selector language={language} setLanguage={setLanguage} />
              <Button onClick={handleSubmit} disabled={isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isLoading ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Editor language={language.editorLanguage} code={code} setCode={setCode} className="min-h-[400px] border border-border rounded-md" />
          </CardContent>
        </Card>

        {/* Output/Input and Controls Section */}
        <Card className="col-span-1 lg:col-span-2 p-4 flex flex-col">
          <CardHeader className="flex-row justify-between items-center pb-4">
            <CardTitle className="text-2xl font-semibold text-card-foreground">
              {displayMode === 'input' ? 'User Input (stdin)' : 'Output'}
            </CardTitle>
            <Button onClick={handleResetAndInput} variant="outline" className="text-primary hover:bg-primary/10">
              {displayMode === 'input' ? 'Show Output' : 'Provide New Input / Clear Output'}
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {displayMode === 'input' ? (
              <div className="flex flex-col space-y-4 flex-1">
                <p className="text-sm text-muted-foreground mt-0 mb-2">Enter input for your code here (if any). This will be provided to your program on execution.</p>
                <Input
                  as="textarea"
                  placeholder="Enter input for your program..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="font-mono text-md flex-1 min-h-[200px] p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="self-end bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? 'Running...' : 'Run with this Input'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 flex-1">
                <pre
                  className={`p-3 rounded-md flex-1 overflow-y-auto font-mono whitespace-pre-wrap break-all min-h-[200px] ${output.includes("Error") ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}
                >
                  {isLoading ? <p className="text-primary">Loading...</p> : (output || "No output produced.")}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeEditor;