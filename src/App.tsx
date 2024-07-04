import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, NotFound, RootErrorBoundary } from './page';
import PWABadge from './PWABadge';

const router = createBrowserRouter([
  { path: '/', Component: Home, errorElement: <RootErrorBoundary /> },
  { path: '*', Component: NotFound },
]);

const App = () => {
  // return <RouterProvider router={router} />;
  return (
    <>
      <RouterProvider router={router} />
      <PWABadge />
    </>
  );
};

export default App;
