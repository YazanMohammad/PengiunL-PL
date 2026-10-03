import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { apiSession } from './api/session';
import { ApiSessionGate } from './components/ApiSessionGate';
import './index.css';

apiSession.initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApiSessionGate allowDevelopmentEntry={import.meta.env.DEV}>
      <App />
    </ApiSessionGate>
  </React.StrictMode>
);
