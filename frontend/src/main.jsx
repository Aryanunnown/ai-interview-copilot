import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { RouterProvider } from 'react-router-dom';
import { AppThemeProvider } from './app/providers/AppThemeProvider.jsx';
import { router } from './app/router.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <CssBaseline />
      <RouterProvider router={router} />
    </AppThemeProvider>
  </React.StrictMode>,
);
