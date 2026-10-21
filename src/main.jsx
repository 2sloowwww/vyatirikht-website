import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './css/base.css';
import './css/chrome.css';
import './css/hero.css';
import './css/chapters.css';
import './css/grow.css';
import './css/contact.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
