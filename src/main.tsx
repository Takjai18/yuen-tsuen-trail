import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { STORAGE_KEYS, type ThemeName } from './trail.ts'

const savedTheme = localStorage.getItem(STORAGE_KEYS.theme)
const initialTheme: ThemeName = savedTheme === 'sun' || savedTheme === 'dark' ? savedTheme : 'day'
document.documentElement.dataset.theme = initialTheme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
