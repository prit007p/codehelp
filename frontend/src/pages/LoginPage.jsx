import { SignIn } from '@clerk/react';

const LoginPage = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 text-foreground">
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/register"
      fallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    />
  </div>
);

export default LoginPage;
