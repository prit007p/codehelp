import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BrowserRouter as Router } from "react-router-dom"
import axios from "axios"
import { ThemeProvider } from "./components/theme-provider"

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 302 || error.response.status === 307 || error.response.status === 308)) {
      // The backend sent a redirect, typically to /login
      // Redirect the user to the login page
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </Router>
)
