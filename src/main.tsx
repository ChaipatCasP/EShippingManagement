import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/globals.css'
import { initializeApiEnvironment } from './api'

// Initialize API environment
initializeApiEnvironment().catch(error => {
  console.error('Failed to initialize API environment:', error);
  // ใน development mode อนุญาตให้ทำงานต่อได้
  if (import.meta.env.PROD) {
    throw error;
  }
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
