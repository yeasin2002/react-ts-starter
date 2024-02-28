import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home, NotFound, RootErrorBoundary } from './page';

const router = createBrowserRouter([
  { path: '/', Component: Home, errorElement: <RootErrorBoundary /> },
  { path: '*', Component: NotFound },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
