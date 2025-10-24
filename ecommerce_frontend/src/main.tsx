// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configuración global para desarrollo
if (import.meta.env.DEV) {
  console.log('🚀 E-Commerce Frontend iniciado en modo desarrollo');
  console.log('🔗 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
