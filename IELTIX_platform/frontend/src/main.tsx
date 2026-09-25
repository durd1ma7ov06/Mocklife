import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ExamProvider } from './context/ExamContext.js';
import { UserProvider } from './context/UserContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ExamProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ExamProvider>
    </ThemeProvider>
  </React.StrictMode>
);
