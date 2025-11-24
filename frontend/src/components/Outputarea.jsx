import React from 'react';

const Outputarea = ({ output }) => {
  const outputBg = output.includes("Error") ? "bg-red-100" : "bg-gray-100";
  const outputColor = output.includes("Error") ? "text-red-800" : "text-gray-800";

  return (
    <div className={`p-4 rounded-md shadow-md ${outputBg} ${outputColor} overflow-auto whitespace-pre-wrap font-mono`}>
      {output || "Your code output will appear here."}
    </div>
  );
};

export default Outputarea;