import { SignUp } from '@clerk/react';

const RegisterPage = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 text-foreground">
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      fallbackRedirectUrl="/"
      signInFallbackRedirectUrl="/"
    />
  </div>
);

export default RegisterPage;
