import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { mainRouteList } from "./components/routing/AppRoutes";
import { RouteGuardRenderer } from "./components/routing/RouteGuardRenderer";
import { userRoleKeys } from "./utils/constants";
import { getLookupListAction } from "./redux/actions/lookupAction";
import type { AppDispatch } from "./redux/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  // Dispatch lookup list action when app loads initially
  useEffect(() => {
    dispatch(getLookupListAction());
  }, [dispatch]);

  return (
    <Routes>
      {mainRouteList.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RouteGuardRenderer
              key={route.path}
              allowedRoles={route.allowedRoles}
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
          <RouteGuardRenderer allowedRoles={[userRoleKeys.ANY]}>
            <Navigate to="/platform/dashboard" replace />
          </RouteGuardRenderer>
        }
      />
    </Routes>
  );
}

export default App;
