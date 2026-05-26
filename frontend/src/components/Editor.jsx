import MonacoEditor from '@monaco-editor/react';
import { useTheme } from "@/components/theme-provider";

const Editor = ({language, input, code, setinput, setCode, height = "100%", readOnly = false}) => {
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? "vs-dark" : "vs-light";
  const value = input ?? code ?? "";
  const handleChange = (nextValue) => {
    if (setinput) setinput(nextValue ?? "");
    if (setCode) setCode(nextValue ?? "");
  };

  return (
    <MonacoEditor
      height={height}
      width="100%"
      language={language}
      value={value}
      onChange={handleChange}
      theme={editorTheme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        smoothScrolling: true,
        readOnly,
      }}
    />
  );
};

export default Editor;
