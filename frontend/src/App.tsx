import { Routes, Route, Navigate } from "react-router-dom";
import { mainRouteList } from "./components/routing/AppRoutes";
import { RouteGuardRenderer } from "./components/routing/RouteGuardRenderer";
import {
  platformPermissionKeys,
  tenantPermissionKeys,
} from "./utils/constants";

function App() {
  return (
    <Routes>
      {mainRouteList.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteGuardRenderer
              key={route.path}
              allowedPlatformPermissions={route.allowedPlatformPermissions}
              allowedTenantPermissions={route.allowedTenantPermissions}
            >
              {route.element}
            </RouteGuardRenderer>
          }
        />
      ))}

      {/* Catch-all route for undefined routes - Redirect to Dashboard */}
      <Route
        path="*"
        element={
          <RouteGuardRenderer
            allowedPlatformPermissions={[platformPermissionKeys.ANY]}
            allowedTenantPermissions={[tenantPermissionKeys.ANY]}
          >
            <Navigate to="/platform/dashboard" replace />
          </RouteGuardRenderer>
        }
      />
    </Routes>
  );
}

export default App;
