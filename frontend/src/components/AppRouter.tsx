import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthService } from '@/contexts/AuthContextProvider';
import type { AuthRoute } from '../schemas/authRoute';
import { hasRoleAccess } from '../utils/authHelper';
import type { UserRole } from '../schemas/user';
import { roleKeys } from '../utils/constants';

// Import pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import SuperAdmin from '../pages/SuperAdmin';
import { ComingSoon } from './ComingSoon';
import { AppLayout } from '@/components/AppLayout';

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
      Object.values(roleKeys).includes(role as UserRole)
    ) as UserRole[];

    // Special case for ANY role
    if (authRoles.includes(roleKeys.any)) {
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  return <>{children}</>;
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

export const protectedRouteList: AuthRoute[] = [
  {
    path: '/super-admin',
    element: <SuperAdmin />,
    authRoles: [roleKeys.platformSuperAdmin],
    title: 'Super Admin',
    description: 'Super admin control panel',
  },

  // Multi-Tenant Management - Super Admin Only
  {
    path: '/workspace/domain',
    element: <ComingSoon title="Domain Configuration" description="Configure domain settings and DNS configuration." />,
    authRoles: [roleKeys.platformSuperAdmin],
    title: 'Domain Configuration',
    description: 'Configure domain settings and DNS',
  },
  {
    path: '/admin',
    element: <Admin />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Admin Dashboard',
    description: 'Admin management panel',
  },

  // Multi-Tenant Management - Admin & Super Admin
  {
    path: '/workspace/settings',
    element: <ComingSoon title="Workspace Settings" description="Configure your workspace settings and preferences." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Workspace Settings',
    description: 'Configure workspace settings',
  },
  {
    path: '/workspace/branding',
    element: <ComingSoon title="Branding" description="Customize your workspace branding and appearance." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Branding',
    description: 'Customize workspace branding',
  },

  // Employee Management - Admin Level
  {
    path: '/employees/onboarding',
    element: <ComingSoon title="Employee Onboarding" description="Manage the employee onboarding process and documentation." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Employee Onboarding',
    description: 'Manage employee onboarding process',
  },
  {
    path: '/departments',
    element: <ComingSoon title="Departments" description="Manage organizational departments and structure." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Departments',
    description: 'Manage organizational departments',
  },

  // Attendance & Leave - Admin Level
  {
    path: '/leave/approvals',
    element: <ComingSoon title="Leave Approvals" description="Review and approve employee leave requests." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Leave Approvals',
    description: 'Review and approve leave requests',
  },
  {
    path: '/attendance/analytics',
    element: <ComingSoon title="Attendance Analytics" description="View detailed attendance analytics and reports." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Attendance Analytics',
    description: 'View attendance analytics and reports',
  },

  // Training & Learning - Admin Level
  {
    path: '/training/programs',
    element: <ComingSoon title="Training Programs" description="Create and manage training programs for employees." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Training Programs',
    description: 'Create and manage training programs',
  },
  {
    path: '/training/progress',
    element: <ComingSoon title="Progress Tracking" description="Track employee training progress and completion." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Progress Tracking',
    description: 'Track employee training progress',
  },

  // Social Network - Admin Level
  {
    path: '/social/announcements',
    element: <ComingSoon title="Announcements" description="Create and manage company announcements." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Announcements',
    description: 'Create and manage company announcements',
  },
  {
    path: '/social/updates',
    element: <ComingSoon title="Company Updates" description="Manage company updates and communications." />,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    title: 'Company Updates',
    description: 'Manage company updates and communications',
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    authRoles: [roleKeys.any],
    title: 'Dashboard',
    description: 'User dashboard',
  },
  {
    path: '/profile',
    element: <Profile />,
    authRoles: [roleKeys.any],
    title: 'Profile',
    description: 'User profile management',
  },

  // Employee Management - User Level
  {
    path: '/employees',
    element: (
      <ComingSoon
        title='Employee Directory'
        description='Browse and search through all employees in your organization.'
      />
    ),
    authRoles: [roleKeys.any],
    title: 'Employee Directory',
    description: 'Browse and search employees',
  },
  {
    path: '/teams',
    element: (
      <ComingSoon
        title='Teams'
        description='View and manage team structures and memberships.'
      />
    ),
    authRoles: [roleKeys.any],
    title: 'Teams',
    description: 'View team structures',
  },

  // Attendance & Leave - User Level
  {
    path: '/attendance/checkin',
    element: (
      <ComingSoon
        title='Check In/Out'
        description='Clock in and out for your work shifts with automated attendance tracking.'
      />
    ),
    authRoles: [roleKeys.any],
    title: 'Check In/Out',
    description: 'Daily attendance check-in/out',
  },
  {
    path: '/attendance/logs',
    element: <ComingSoon title="Attendance Logs" description="View your attendance history and records." />,
    authRoles: [roleKeys.any],
    title: 'Attendance Logs',
    description: 'View attendance history',
  },
  {
    path: '/leave/requests',
    element: <ComingSoon title="Leave Requests" description="Submit and manage your leave requests." />,
    authRoles: [roleKeys.any],
    title: 'Leave Requests',
    description: 'Submit and manage leave requests',
  },

  // Training & Learning - User Level
  {
    path: '/training/my-learning',
    element: <ComingSoon title="My Learning" description="Track your personal learning progress and courses." />,
    authRoles: [roleKeys.any],
    title: 'My Learning',
    description: 'Personal learning progress',
  },
  {
    path: '/training/assessments',
    element: <ComingSoon title="Assessments" description="Take quizzes and assessments for your training." />,
    authRoles: [roleKeys.any],
    title: 'Assessments',
    description: 'Take quizzes and assessments',
  },
  {
    path: '/training/certificates',
    element: <ComingSoon title="Certificates" description="View and download your earned certificates." />,
    authRoles: [roleKeys.any],
    title: 'Certificates',
    description: 'View earned certificates',
  },

  // Social Network - User Level
  {
    path: '/social/feed',
    element: <ComingSoon title="Newsfeed" description="Stay updated with company news and colleague posts." />,
    authRoles: [roleKeys.any],
    title: 'Newsfeed',
    description: 'Company newsfeed and updates',
  },
  {
    path: '/social/polls',
    element: <ComingSoon title="Polls & Surveys" description="Participate in company polls and surveys." />,
    authRoles: [roleKeys.any],
    title: 'Polls & Surveys',
    description: 'Participate in polls and surveys',
  },

  // Team Chat - User Level
  {
    path: '/chat/messages',
    element: <ComingSoon title="Messages" description="Send and receive private messages with colleagues." />,
    authRoles: [roleKeys.any],
    title: 'Messages',
    description: 'Private messaging',
  },
  {
    path: '/chat/channels',
    element: <ComingSoon title="Team Channels" description="Join team channels and group conversations." />,
    authRoles: [roleKeys.any],
    title: 'Team Channels',
    description: 'Team group conversations',
  },
  {
    path: '/chat/files',
    element: <ComingSoon title="File Sharing" description="Share and access files with your team." />,
    authRoles: [roleKeys.any],
    title: 'File Sharing',
    description: 'Share files with team',
  },

  // General - User Level
  {
    path: '/notifications',
    element: <ComingSoon title="Notifications" description="View and manage your notifications." />,
    authRoles: [roleKeys.any],
    title: 'Notifications',
    description: 'View notifications',
  },
  {
    path: '/settings',
    element: <ComingSoon title="Settings" description="Manage your account and application settings." />,
    authRoles: [roleKeys.any],
    title: 'Settings',
    description: 'Account and app settings',
  },
  {
    path: '/',
    element: <Home />,
    authRoles: [roleKeys.any],
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
    authRoles: [roleKeys.any],
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },
];
