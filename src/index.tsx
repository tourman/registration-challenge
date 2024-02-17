import React from 'react';
import { createRoot } from 'react-dom/client';
import GlobalStyles from 'styles/global';
import App from './App';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
    <GlobalStyles />
  </React.StrictMode>,
);
