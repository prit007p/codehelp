import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const supportedLanguages = [
  { name: 'nodejs', version: '18.15.0', displayName: 'Javascript', editorLanguage: 'javascript' },
  { name: 'python3', version: '3.10.0', displayName: 'Python', editorLanguage: 'python' },
  { name: 'cpp', version: '10.2.0', displayName: 'C++', editorLanguage: 'cpp' },
  { name: 'java', version: '15.0.2', displayName: 'Java', editorLanguage: 'java' },
  { name: 'c', version: '10.2.0', displayName: 'C', editorLanguage: 'c' },
  { name: 'ruby', version: '3.0.1', displayName: 'Ruby', editorLanguage: 'ruby' },
  { name: 'go', version: '1.16.2', displayName: 'Go', editorLanguage: 'go' },
  // Add more based on your Piston instance's GET /api/v2/runtimes output
];

const Selector = ({ selectedLanguage, setSelectedLanguage }) => {
  const handleChange = (newLanguageName) => {
    const language = supportedLanguages.find(lang => lang.name === newLanguageName);
    if (language) {
      setSelectedLanguage(language);
    }
  };

  return (
    <div className="relative">
      <Select
        value={selectedLanguage.name}
        onValueChange={handleChange}
        className="block appearance-none w-full py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none cursor-pointer"
      >
          <SelectTrigger className="w-[100%]">
        <SelectValue placeholder={selectedLanguage.displayName} />
      </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {supportedLanguages.map((language) => (
              <SelectItem key={language.name} value={language.name}>
                {language.displayName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Selector