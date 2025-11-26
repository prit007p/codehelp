import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { BrowserRouter as Router } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
// Import API client to initialize it (interceptors are configured in config/api.js)
// import "./config/api"

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </Router>
)
