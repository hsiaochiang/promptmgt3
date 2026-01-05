import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SyncProvider } from './features/sync/SyncProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </React.StrictMode>
);
