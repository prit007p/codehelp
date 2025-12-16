import Solution from './routes/Solution';
import Profile from './pages/profile';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import ProblemslistPage from './pages/ProblemslistPage';
import RegisterPage from './pages/RegisterPage';
import SingleProblemPage from './pages/SingleProblemPage';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import Chats from './pages/chats';
import ChatPage from './pages/ChatPage';
import SubmissionPage from './pages/SubmissionPage';

import { Toaster } from 'sonner';

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme === "system" ? undefined : theme} />;
}

function App() {
  const navbarHeight = '4.5rem';
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register");
  const applyPaddingTop = showNavbar && location.pathname !== '/Chats';

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="w-full">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Home />} />
          <Route path='/Landing' element={<Landing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/solution" element={<Solution />} />
          <Route path="/problems" element={<ProblemslistPage />} />
          <Route path="/problem/:problemId" element={<SingleProblemPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/Chats' element={<Chats />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/submission" element={<SubmissionPage />} />
        </Routes>
      </div>
      <ThemedToaster />
    </>
  );
}

export default App;