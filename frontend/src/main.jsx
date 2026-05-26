import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BrowserRouter as Router } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { ClerkProvider } from "@clerk/react"
import AuthTokenProvider from "./components/AuthTokenProvider"
// Import API client to initialize it (interceptors are configured in config/api.js)
// import "./config/api"

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={clerkPublishableKey}
    signInUrl="/login"
    signUpUrl="/register"
  >
    <Router>
      <AuthTokenProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </AuthTokenProvider>
    </Router>
  </ClerkProvider>
)
