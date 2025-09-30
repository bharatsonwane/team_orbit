// Example: App.tsx with routing hooks
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import RouteGuardRenderer from '../components/AppRouter';
import { mainRouteList } from '../utils/route/routes';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Example: Track page views
  useEffect(() => {
    console.log('Page view:', location.pathname);
    // You could send analytics here
  }, [location.pathname]);

  // Example: Handle 404 redirects
  useEffect(() => {
    const validPaths = mainRouteList.map(route => route.path);
    if (!validPaths.includes(location.pathname) && location.pathname !== '/') {
      console.log('Invalid route, redirecting to home');
      navigate('/');
    }
  }, [location.pathname, navigate]);

  // Example: Route-based logic
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div>
      {/* Example: Show different content based on route */}
      {isAuthPage && (
        <div className='bg-blue-50 p-2 text-center text-sm'>
          Welcome! Please login or create an account.
        </div>
      )}

      {isAdminPage && (
        <div className='bg-yellow-50 p-2 text-center text-sm'>
          Admin Area - Restricted Access
        </div>
      )}

      <Routes>
        {mainRouteList.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteGuardRenderer key={route.path} authRoles={route.authRoles}>
                {route.element}
              </RouteGuardRenderer>
            }
          />
        ))}
      </Routes>
    </div>
  );
}

export default App;
