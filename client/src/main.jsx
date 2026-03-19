import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvier } from './context/authContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvier>
      <App />
    </AuthProvier>
  </StrictMode>,
)
