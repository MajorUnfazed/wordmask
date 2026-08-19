import React from "react"
import ReactDOM from "react-dom/client"
import './styles/globals.css'
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Register the service worker for installability + offline shell. Production
// only, so it never fights Vite's dev server / HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* PWA is progressive enhancement — ignore registration failures */
    })
  })
}