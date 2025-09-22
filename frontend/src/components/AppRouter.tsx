import React, { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthService } from '@/contexts/AuthContextProvider';
import { hasRoleAccess } from '../utils/authHelper';
import type { UserRole } from '../schemas/user';
import { userRoleKeys } from '../utils/constants';

import {
  Building2,
  Users,
  Clock,
  GraduationCap,
  MessageSquare,
  Bell,
  Settings,
  Home,
  UserCheck,
  Calendar,
  BookOpen,
  Award,
  Hash,
  FileText,
  BarChart3,
  Shield,
  type LucideIcon,
} from 'lucide-react';

// Import pages
import HomeScreen from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import SuperAdmin from '../pages/SuperAdmin';
import TenantManagement from '../pages/TenantManagement';
import { ComingSoon } from './ComingSoon';
import { AppLayout } from '@/components/AppLayout';

export interface AuthRoute {
  title: string;
  authRoles: string[]; // adjust to (keyof typeof roleKeys)[] if roleKeys is an enum/object
  path: string; // Made optional for parent navigation items
  description?: string;
  element: ReactNode;
}

export interface SidebarRouteWithChildren {
  title: string;
  authRoles: string[]; // adjust to (keyof typeof roleKeys)[] if roleKeys is an enum/object
  path?: string; // Made optional for parent navigation items
  description?: string;
  href?: string;
  element?: ReactNode;
  childItems?: SidebarRouteWithChildren[]; // recursive
  icon?: LucideIcon; // or React.ComponentType<any> if not fixed to Lucide
}

interface RouteGuardRendererProps {
  children?: React.ReactNode;
  authRoles?: string[];
  routes?: AuthRoute[];
}

export const RouteGuardRenderer: React.FC<RouteGuardRendererProps> = ({
  children,
  authRoles = [],
  routes = [],
}) => {
  const { loggedInUser } = useAuthService();

  const checkUserAuthorization = (): boolean => {
    if (authRoles.length === 0) {
      // If no auth roles, return true (public route)
      return true;
    }

    if (!loggedInUser) {
      return false;
    }

    // Convert string roles to UserRole type
    const allowedRoles = authRoles.filter(role =>
      Object.values(userRoleKeys).includes(role as UserRole)
    ) as UserRole[];

    // Special case for ANY role
    if (authRoles.includes(userRoleKeys.ANY)) {
      return true;
    }

    // Use the new hasRoleAccess helper
    return hasRoleAccess({
      allowedRoles,
      userRoles: [loggedInUser.role],
    });
  };

  const isAuthorized = checkUserAuthorization();

  if (!isAuthorized) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Access Denied
          </h1>
          <p className='text-muted-foreground mb-6'>
            You are not authorized to access this page.
          </p>
          <div className='space-x-4'>
            <a
              href='/'
              className='inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
            >
              Go Home
            </a>
            <a
              href='/login'
              className='inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-accent'
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
              <RouteGuardRenderer key={route.path} authRoles={route.authRoles}>
                {route.element}
              </RouteGuardRenderer>
            }
          />
        ))}
        {/* Catch-all for undefined routes - redirect to dashboard */}
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    );
  }

  return <>{children}</>;
};

// Helper function to flatten navigation items and extract routes
const flattenNavigationItems = (
  items: SidebarRouteWithChildren[]
): AuthRoute[] => {
  const routes: AuthRoute[] = [];

  items.forEach(item => {
    // If item has path and element, it's a route
    if (item.path && item.element) {
      // Convert SidebarRouteWithChildren to AuthRoute
      const route: AuthRoute = {
        title: item.title,
        authRoles: item.authRoles,
        path: item.path,
        description: item.description,
        element: item.element,
      };
      routes.push(route);
    }

    // If item has childItems, recursively flatten them
    if (item.childItems) {
      routes.push(...flattenNavigationItems(item.childItems));
    }
  });

  return routes;
};
/**@description Public routes (no authentication required) */
export const publicRouteList: AuthRoute[] = [
  {
    path: '/login',
    element: <Login />,
    authRoles: [],
    title: 'Login',
    description: 'User login page',
  },
  {
    path: '/signup',
    element: <Signup />,
    authRoles: [],
    title: 'Sign Up',
    description: 'User registration page',
  },
];

export const sidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    path: '/dashboard',
    authRoles: [userRoleKeys.ANY],
    element: <Dashboard />,
  },
  {
    title: 'Platform Management',
    icon: Building2,
    authRoles: [
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
    ],
    childItems: [
      {
        title: 'Tenant Management',
        href: '/tenant-management',
        path: '/tenant-management',
        icon: Building2,
        authRoles: [
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
        ],
        element: <TenantManagement />,
      },
    ],
  },
  {
    title: 'Multi-Tenant',
    icon: Building2,
    authRoles: [
      userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
      userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
    ],
    childItems: [
      {
        title: 'Workspace Settings',
        href: '/workspace/settings',
        path: '/workspace/settings',
        icon: Settings,
        authRoles: [
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Workspace Settings'
            description='Configure your workspace settings and preferences.'
          />
        ),
      },
      {
        title: 'Branding',
        href: '/workspace/branding',
        path: '/workspace/branding',
        icon: FileText,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Branding'
            description='Customize your workspace branding and appearance.'
          />
        ),
      },
      {
        title: 'Domain Config',
        href: '/workspace/domain',
        path: '/workspace/domain',
        icon: Shield,
        authRoles: [userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN],
        element: (
          <ComingSoon
            title='Domain Configuration'
            description='Configure domain settings and DNS configuration.'
          />
        ),
      },
    ],
  },
  {
    title: 'Employee Management',
    icon: Users,
    authRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: 'Employee Directory',
        href: '/employees',
        path: '/employees',
        icon: Users,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Employee Directory'
            description='Browse and search through all employees in your organization.'
          />
        ),
      },
      {
        title: 'Onboarding',
        href: '/employees/onboarding',
        path: '/employees/onboarding',
        icon: UserCheck,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Employee Onboarding'
            description='Manage the employee onboarding process and documentation.'
          />
        ),
      },
      {
        title: 'Departments',
        href: '/departments',
        path: '/departments',
        icon: Building2,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Departments'
            description='Manage organizational departments and structure.'
          />
        ),
      },
      {
        title: 'Teams',
        href: '/teams',
        path: '/teams',
        icon: Users,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Teams'
            description='View and manage team structures and memberships.'
          />
        ),
      },
    ],
  },
  {
    title: 'Attendance & Leave',
    icon: Clock,
    authRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: 'Check In/Out',
        href: '/attendance/checkin',
        path: '/attendance/checkin',
        icon: Clock,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Check In/Out'
            description='Clock in and out for your work shifts with automated attendance tracking.'
          />
        ),
      },
      {
        title: 'Attendance Logs',
        href: '/attendance/logs',
        path: '/attendance/logs',
        icon: BarChart3,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Attendance Logs'
            description='View your attendance history and records.'
          />
        ),
      },
      {
        title: 'Leave Requests',
        href: '/leave/requests',
        path: '/leave/requests',
        icon: Calendar,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Leave Requests'
            description='Submit and manage your leave requests.'
          />
        ),
      },
      {
        title: 'Leave Approvals',
        href: '/leave/approvals',
        path: '/leave/approvals',
        icon: UserCheck,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Leave Approvals'
            description='Review and approve employee leave requests.'
          />
        ),
      },
      {
        title: 'Analytics',
        href: '/attendance/analytics',
        path: '/attendance/analytics',
        icon: BarChart3,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Attendance Analytics'
            description='View detailed attendance analytics and reports.'
          />
        ),
      },
    ],
  },
  {
    title: 'Training & Learning',
    icon: GraduationCap,
    authRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: 'Training Programs',
        href: '/training/programs',
        path: '/training/programs',
        icon: BookOpen,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Training Programs'
            description='Create and manage training programs for employees.'
          />
        ),
      },
      {
        title: 'My Learning',
        href: '/training/my-learning',
        path: '/training/my-learning',
        icon: GraduationCap,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='My Learning'
            description='Track your personal learning progress and courses.'
          />
        ),
      },
      {
        title: 'Assessments',
        href: '/training/assessments',
        path: '/training/assessments',
        icon: FileText,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Assessments'
            description='Take quizzes and assessments for your training.'
          />
        ),
      },
      {
        title: 'Certificates',
        href: '/training/certificates',
        path: '/training/certificates',
        icon: Award,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Certificates'
            description='View and download your earned certificates.'
          />
        ),
      },
      {
        title: 'Progress Tracking',
        href: '/training/progress',
        path: '/training/progress',
        icon: BarChart3,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Progress Tracking'
            description='Track employee training progress and completion.'
          />
        ),
      },
    ],
  },
  {
    title: 'Social Network',
    icon: Hash,
    authRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: 'Newsfeed',
        href: '/social/feed',
        path: '/social/feed',
        icon: Hash,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Newsfeed'
            description='Stay updated with company news and colleague posts.'
          />
        ),
      },
      {
        title: 'Announcements',
        href: '/social/announcements',
        path: '/social/announcements',
        icon: Bell,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Announcements'
            description='Create and manage company announcements.'
          />
        ),
      },
      {
        title: 'Polls & Surveys',
        href: '/social/polls',
        path: '/social/polls',
        icon: BarChart3,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Polls & Surveys'
            description='Participate in company polls and surveys.'
          />
        ),
      },
      {
        title: 'Company Updates',
        href: '/social/updates',
        path: '/social/updates',
        icon: FileText,
        authRoles: [
          userRoleKeys.USER_ROLE_TENANT_ADMIN,
          userRoleKeys.USER_ROLE_TENANT_MANAGER,
          userRoleKeys.USER_ROLE_PLATFORM_ADMIN,
          userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Company Updates'
            description='Manage company updates and communications.'
          />
        ),
      },
    ],
  },
  {
    title: 'Team Chat',
    icon: MessageSquare,
    authRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: 'Messages',
        href: '/chat/messages',
        path: '/chat/messages',
        icon: MessageSquare,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Messages'
            description='Send and receive private messages with colleagues.'
          />
        ),
      },
      {
        title: 'Team Channels',
        href: '/chat/channels',
        path: '/chat/channels',
        icon: Hash,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Team Channels'
            description='Join team channels and group conversations.'
          />
        ),
      },
      {
        title: 'File Sharing',
        href: '/chat/files',
        path: '/chat/files',
        icon: FileText,
        authRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='File Sharing'
            description='Share and access files with your team.'
          />
        ),
      },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    path: '/notifications',
    authRoles: [userRoleKeys.ANY],
    element: (
      <ComingSoon
        title='Notifications'
        description='View and manage your notifications.'
      />
    ),
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    path: '/settings',
    authRoles: [userRoleKeys.ANY],
    element: (
      <ComingSoon
        title='Settings'
        description='Manage your account and application settings.'
      />
    ),
  },
];

export const otherProtectedRouteList: AuthRoute[] = [
  {
    path: '/profile',
    element: <Profile />,
    authRoles: [userRoleKeys.ANY],
    title: 'Profile',
    description: 'User profile management',
  },
  {
    path: '/admin',
    element: <Admin />,
    authRoles: [userRoleKeys.USER_ROLE_PLATFORM_ADMIN, userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN],
    title: 'Admin',
    description: 'Admin dashboard',
  },
  {
    path: '/super-admin',
    element: <SuperAdmin />,
    authRoles: [userRoleKeys.USER_ROLE_PLATFORM_SUPER_ADMIN],
    title: 'Super Admin',
    description: 'Super admin dashboard',
  },
];

// Extract routes from navigation items
const navigationRoutes: AuthRoute[] = flattenNavigationItems(
  sidebarNavigationItems
);

export const protectedRouteList: AuthRoute[] = [
  ...navigationRoutes,
  ...otherProtectedRouteList,
  {
    path: '/',
    element: <HomeScreen />,
    authRoles: [userRoleKeys.ANY],
    title: 'Home',
    description: 'Application home page',
  },
];

/**@description Main route list with nested routes */
export const mainRouteList: AuthRoute[] = [
  // Public routes
  ...publicRouteList,

  {
    path: '/*',
    element: (
      <AppLayout>
        <RouteGuardRenderer routes={protectedRouteList} />
      </AppLayout>
    ),
    authRoles: [userRoleKeys.ANY],
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },
];
