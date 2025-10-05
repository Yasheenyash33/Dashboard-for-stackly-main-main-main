import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: '/src/main.jsx', // Changed from main.tsx to main.jsx
    },
  },
}
