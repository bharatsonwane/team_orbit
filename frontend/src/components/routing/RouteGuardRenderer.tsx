import { Fragment, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { hasRoleAccess } from "@/utils/authHelper";
import type { UserRoleName } from "@/utils/constants";

export interface AuthRoute {
  title: string;
  allowedRoles: UserRoleName[]; // adjust to (keyof typeof roleKeys)[] if roleKeys is an enum/object
  path: string; // Made optional for parent navigation items
  description?: string;
  element: ReactNode;
}

export interface RouteGuardRendererProps {
  children?: React.ReactNode;
  allowedRoles?: UserRoleName[];
  routes?: AuthRoute[];
}

export const RouteGuardRenderer: React.FC<RouteGuardRendererProps> = ({
  children,
  allowedRoles = [],
  routes = [],
}) => {
  const { loggedInUser } = useAuthService();

  const isAuthorized = hasRoleAccess({
    allowedRoleNames: allowedRoles,
    userRoles: loggedInUser?.roles || [],
  });

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You are not authorized to access this page.
          </p>
          <div className="space-x-4">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go Home
            </a>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  } else if (routes.length > 0) {
    return (
      <Routes>
        {routes.map(route => (
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
      </Routes>
    );
  }

  return <Fragment>{children}</Fragment>;
};
