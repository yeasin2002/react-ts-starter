import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { App } from '@/App';
import './index.css';
import { NotFound, RootErrorBoundary } from './page';

const router = createBrowserRouter([
  { path: '/', Component: App, errorElement: <RootErrorBoundary /> },
  { path: '*', Component: NotFound },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />;
  </React.StrictMode>,
);
