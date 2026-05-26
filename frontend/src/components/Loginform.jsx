import { SignIn } from '@clerk/react';

const LoginForm = () => (
  <SignIn
    routing="path"
    path="/login"
    signUpUrl="/register"
    fallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/"
  />
);

export default LoginForm;
