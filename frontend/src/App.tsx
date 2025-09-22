import { Routes, Route, Navigate } from 'react-router-dom';
import { RouteGuardRenderer, mainRouteList} from './components/AppRouter';
import { userRoleKeys } from './utils/constants';

function App() {
  return (
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
      
      {/* Catch-all route for undefined routes - Redirect to Dashboard */}
      <Route
        path="*"
        element={
          <RouteGuardRenderer authRoles={[userRoleKeys.ANY]}>
            <Navigate to="/dashboard" replace />
          </RouteGuardRenderer>
        }
      />
    </Routes>
  );
}

export default App;
