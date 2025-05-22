import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ React 18 import
import App from './App';
import './index.css'; // ✅ Your styles

const container = document.getElementById('root');
const root = createRoot(container); // ✅ Use only createRoot once
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
