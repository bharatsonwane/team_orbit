import React, {
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
} from "../schemas/userSchema";
import { envVariable } from "../config/envVariable";
import { publicRouteList } from "../components/routing/AppRoutes";
import getAxios from "../utils/axiosApi";
import {
  getUserProfileAction,
  loginAction,
} from "../redux/actions/userActions";
import { store, type AppDispatch } from "../redux/store";
import { platformRoleList } from "@/utils/constants";
import { getTenantIdFromUrl } from "@/utils/tenantHelper";
import { getLookupListAction } from "@/redux/actions/lookupAction";
import { useDispatch } from "react-redux";
import { getTenantLookupListAction } from "@/redux/actions/tenantLookupActions";
import { getTenantAction } from "@/redux/actions/tenantActions";

// Auth context type
export interface AuthContextType {
  loggedInUser: User | null;
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
  loggedInUser: null,
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

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const tenantIdFromUrl = getTenantIdFromUrl();

  /** Compute tenantId based on user role */
  const { tenantId, hasPlatformRole } = useMemo(() => {
    let tenantId = null;
    let hasPlatformRole = false;

    if (loggedInUser) {
      /* Check if user has platform roles */
      hasPlatformRole = loggedInUser.roles?.some(role =>
        platformRoleList.includes(
          role.name as (typeof platformRoleList)[number]
        )
      );

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
  }, [loggedInUser, location.pathname]);

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
    if (tenantIdFromUrl) {
      dispatch(getTenantLookupListAction());
      dispatch(getTenantAction(tenantIdFromUrl));
    }
  }, [dispatch, tenantIdFromUrl]);

  const manageUserSessionAndAuthNavigation = async () => {
    const publicRoutes = publicRouteList.map(route => route.path);
    const token = Cookies.get(envVariable.JWT_STORAGE_KEY);

    if (token) {
      if (!loggedInUser) {
        try {
          /* Get user details using the token */
          const userData = await dispatch(getUserProfileAction()).unwrap();

          if (userData && userData) {
            setLoggedInUser(userData);
          }
        } catch (error: unknown) {
          /* Token might be invalid/expired, remove it */
          Cookies.remove(envVariable.JWT_STORAGE_KEY);
          setLoggedInUser(null);
          console.error("Failed to restore user session:  ", error);
        } finally {
          setIsLoading(false);
        }
      } else if (loggedInUser) {
        if (
          location.pathname === "/" ||
          publicRoutes.includes(location.pathname)
        ) {
          if (hasPlatformRole) {
            navigate("/platform/dashboard", { replace: true });
          } else {
            /* Navigate to tenant home with tenantId */
            navigate(`/tenant/${tenantId}/home`, { replace: true });
          }
        } else if (
          !hasPlatformRole &&
          tenantIdFromUrl &&
          tenantIdFromUrl !== tenantId
        ) {
          /* Tenant users: Check if they're trying to access a different tenant
             and Redirect to their own tenant
          */
          navigate(`/tenant/${tenantId}/home`, { replace: true });
        }
      }
    } else {
      if (
        location.pathname === "/" ||
        !publicRoutes.includes(location.pathname)
      ) {
        navigate("/login", { replace: true });
      }
    }
  };

  /** Login function - handles all auth logic */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await store.dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(result)) {
        /* Login successful - handle localStorage and state */
        const user = result.payload.user;
        const token = result.payload.token;

        /* Store token in localStorage */
        Cookies.set(envVariable.JWT_STORAGE_KEY, token);

        /* Update local state */
        setLoggedInUser(user);
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
    loggedInUser,
    isLoading,
    error,
    tenantId,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
