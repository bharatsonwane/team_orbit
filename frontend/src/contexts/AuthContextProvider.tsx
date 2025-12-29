import React, {
  Fragment,
  useState,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../schemaTypes/userSchemaTypes";
import { envVariable } from "../config/envVariable";
import { publicRouteList } from "../components/routing/AppRoutes";
import getAxios from "../utils/axiosApi";
import {
  getUserProfileAction,
  loginAction,
} from "../redux/actions/userActions";
import { store, type AppDispatch } from "../redux/store";
import { getTenantIdFromUrl } from "@/utils/tenantHelper";
import { getLookupListAction } from "@/redux/actions/lookupAction";
import { useDispatch } from "react-redux";
import { getTenantLookupListAction } from "@/redux/actions/tenantLookupActions";
import { getTenantAction } from "@/redux/actions/tenantActions";
import { SocketManager } from "@/lib/socketManager";
import { LoadingOverlay } from "@/components/ui/loading-indicator";

// Auth context type
export interface AuthContextType {
  loggedInUser: User | null | undefined;
  isLoading: boolean;
  error: string | null;
  /** for platform users, this is the tenantId from the url */
  tenantId: number | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const defaultContext: AuthContextType = {
  loggedInUser: undefined,
  isLoading: false,
  error: null,
  tenantId: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
};

/** Create context */
export const AuthContext = createContext<AuthContextType | undefined>(
  defaultContext
);

export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }

  return context;
};

/** Auth provider component */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const [loggedInUser, setLoggedInUser] = useState<User | null | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const tenantIdFromUrl = getTenantIdFromUrl();

  /** Compute tenantId based on user type */
  const { tenantId, hasPlatformRole } = useMemo(() => {
    let tenantId = null;
    let hasPlatformRole = false;

    if (loggedInUser) {
      /* Check if user is platform user (from isPlatformUser flag or has platform permissions) */
      hasPlatformRole =
        loggedInUser.isPlatformUser === true ||
        (loggedInUser.platformPermissions &&
          loggedInUser.platformPermissions.length > 0) ||
        false;

      if (hasPlatformRole) {
        /* Platform users: Get tenantId from URL (to access different tenants) */
        tenantId = tenantIdFromUrl;
      } else {
        /* Tenant users: Always use their own tenantId (cannot access other tenants) */
        tenantId = loggedInUser.tenantId || null;
      }
    } else {
      /* No user logged in: Try to get tenantId from URL */
      tenantId = tenantIdFromUrl;
    }

    return { tenantId, hasPlatformRole };
  }, [loggedInUser, location.pathname, tenantIdFromUrl]);

  /** Handle automatic navigation based on auth state */
  useEffect(() => {
    manageUserSessionAndAuthNavigation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser, location.pathname, navigate]);

  // Dispatch lookup list action when app loads initially
  useEffect(() => {
    dispatch(getLookupListAction());
  }, [dispatch]);

  useEffect(() => {
    if (tenantIdFromUrl && loggedInUser?.id) {
      void SocketManager.connect({ tenantId: tenantIdFromUrl });
      dispatch(getTenantLookupListAction());
      dispatch(getTenantAction(tenantIdFromUrl));
    }
  }, [dispatch, tenantIdFromUrl, loggedInUser?.id]);

  const manageUserSessionAndAuthNavigation = async () => {
    const publicRoutes = publicRouteList.map(route => route.path);
    const isPublicRoute = publicRoutes.includes(location.pathname);
    const isRootPath = location.pathname === "/";
    const token = Cookies.get(envVariable.JWT_STORAGE_KEY);

    if (!token) {
      /* No token: set user to null and redirect to login if not on public route */
      setLoggedInUser(null);

      if (isRootPath || !isPublicRoute) {
        navigate("/login", { replace: true });
      }
    } else if (loggedInUser === undefined || loggedInUser === null) {
      /* Token exists but no user: restore session */
      try {
        // Get tenantId from URL if available (for platform users)
        const tenantIdForProfile = tenantIdFromUrl || undefined;
        const userData = await dispatch(
          getUserProfileAction(tenantIdForProfile)
        ).unwrap();
        setLoggedInUser(userData || null);
      } catch (error: unknown) {
        Cookies.remove(envVariable.JWT_STORAGE_KEY);
        setLoggedInUser(null);
        console.error("Failed to restore user session:", error);
      }
    } else if (isRootPath || isPublicRoute) {
      /* User logged in: Redirect from public routes to appropriate dashboard */
      const targetPath = hasPlatformRole
        ? "/platform/dashboard"
        : `/tenant/${tenantId}/home`;
      navigate(targetPath, { replace: true });
    } else if (
      !hasPlatformRole &&
      tenantIdFromUrl &&
      tenantIdFromUrl !== tenantId
    ) {
      /* Tenant users: prevent access to other tenants */
      navigate(`/tenant/${tenantId}/home`, { replace: true });
    }
    setIsLoading(false);
  };

  /** Login function - handles all auth logic */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await store.dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(result)) {
        /* Login successful - handle localStorage and state */
        const { token, userId } = result.payload;

        /* Store token in localStorage */
        Cookies.set(envVariable.JWT_STORAGE_KEY, token);

        /* Fetch full user profile with permissions */
        try {
          const userData = await dispatch(getUserProfileAction()).unwrap();
          setLoggedInUser(userData || null);
        } catch (profileError) {
          console.error("Failed to fetch user profile:", profileError);
          // Even if profile fetch fails, we have the token, so set a minimal user
          setLoggedInUser({
            id: userId,
            email: result.payload.email,
            firstName: "",
            lastName: "",
            createdAt: "",
            updatedAt: "",
          } as User);
        }

        setIsLoading(false);
        setError(null);
      } else {
        /* Login failed */
        setLoggedInUser(null);
        setIsLoading(false);
        setError(result.payload as string);
      }
    } catch (error: unknown) {
      setLoggedInUser(null);
      setIsLoading(false);
      setError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again."
      );
    }
  };

  /** Register function */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAxios().post<AuthResponse>(
        "/auth/register",
        data
      );

      if (response.data.success) {
        Cookies.set(envVariable.JWT_STORAGE_KEY, response.data.data!.token);
        setLoggedInUser(response.data.data!.user);
        setIsLoading(false);
        setError(null);
      } else {
        setLoggedInUser(null);
        setIsLoading(false);
        setError(response.data.message || "Registration failed");
      }
    } catch (error: unknown) {
      setLoggedInUser(null);
      setIsLoading(false);
      setError(
        error instanceof Error
          ? error.message
          : "Network error. Please try again."
      );
    }
  };

  /** Logout function */
  const logout = () => {
    Cookies.remove(envVariable.JWT_STORAGE_KEY);
    setLoggedInUser(null);
    setIsLoading(false);
    setError(null);
    navigate("/login", { replace: true });
  };

  /** Clear error function */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    loggedInUser: loggedInUser,
    isLoading,
    error,
    tenantId,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <Fragment>
      {loggedInUser !== undefined ? (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
      ) : (
        <LoadingOverlay />
      )}
    </Fragment>
  );
};
