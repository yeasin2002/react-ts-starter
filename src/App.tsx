import { BrowserRouter, Route, Routes } from 'react-router';
import { PWABadge } from './components';
import { Home, NotFound, RootErrorBoundary } from './page';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
          errorElement={<RootErrorBoundary />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <PWABadge />
    </BrowserRouter>
  );
};

export default App;
