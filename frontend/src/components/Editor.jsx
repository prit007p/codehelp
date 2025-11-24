import MonacoEditor from '@monaco-editor/react';
import { useTheme } from "@/components/theme-provider";

const Editor = ({language, input, setinput, height = "100%"}) => {
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";

  return (
    <MonacoEditor
      height={height}
      width="100%"
      language={language}
      value={input}
      onChange={(value) => setinput(value)}
      theme={editorTheme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        smoothScrolling: true,
      }}
    />
  );
};

export default Editor;