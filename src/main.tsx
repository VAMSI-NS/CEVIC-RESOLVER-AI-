import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Skip to main content — accessibility */}
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
    <App />
  </React.StrictMode>,
)
