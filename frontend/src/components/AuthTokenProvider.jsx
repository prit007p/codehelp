import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setClerkTokenGetter } from "@/lib/clerkToken";

const AuthTokenProvider = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setClerkTokenGetter(() => getToken());
      return () => setClerkTokenGetter(null);
    }

    setClerkTokenGetter(null);
  }, [getToken, isLoaded, isSignedIn]);

  return children;
};

export default AuthTokenProvider;
