import Navbar from './components/Navbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import { RedirectToSignIn, useAuth } from '@clerk/react';
import { lazy, Suspense } from 'react';

import { Toaster } from 'sonner';

const Solution = lazy(() => import('./routes/Solution'));
const Profile = lazy(() => import('./pages/profile'));
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProblemslistPage = lazy(() => import('./pages/ProblemslistPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SingleProblemPage = lazy(() => import('./pages/SingleProblemPage'));
const Landing = lazy(() => import('./pages/Landing'));
const Chats = lazy(() => import('./pages/chats'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SubmissionPage = lazy(() => import('./pages/SubmissionPage'));

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme === "system" ? undefined : theme} />;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      Loading...
    </div>
  );
}

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith("/login") && !location.pathname.startsWith("/register");

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="w-full">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/" element={<Home />} />
            <Route path='/Landing' element={<Landing />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/solution" element={<RequireAuth><Solution /></RequireAuth>} />
            <Route path="/problems" element={<RequireAuth><ProblemslistPage /></RequireAuth>} />
            <Route path="/problem/:problemId" element={<RequireAuth><SingleProblemPage /></RequireAuth>} />
            <Route path='/register/*' element={<RegisterPage />} />
            <Route path='/Chats' element={<RequireAuth><Chats /></RequireAuth>} />
            <Route path="/chat/:id" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/submission" element={<RequireAuth><SubmissionPage /></RequireAuth>} />
          </Routes>
        </Suspense>
      </div>
      <ThemedToaster />
    </>
  );
}

export default App;
