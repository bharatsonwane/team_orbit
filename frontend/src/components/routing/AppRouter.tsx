import React, { type ReactNode } from 'react';
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
import { type AuthRoute, RouteGuardRenderer } from './RouteGuardRenderer';
import { userRoleKeys, type UserRoleName } from '@/utils/constants';

// Import pages
import HomeScreen from '../../pages/dashboard/Home';
import Login from '../../pages/auth/Login';
import Signup from '../../pages/auth/Signup';
import Dashboard from '../../pages/dashboard/Dashboard';
import Profile from '../../pages/profile/Profile';
import Admin from '../../pages/admin/Admin';
import SuperAdmin from '../../pages/admin/SuperAdmin';
import Tenants from '../../pages/tenant/Tenants';
import TenantDetail from '../../pages/tenant/TenantDetail';
import { ComingSoon } from '../ComingSoon';
import { AppLayout } from '@/components/AppLayout';
import type { BreadcrumbLayoutProps } from '@/components/AppLayout';

export interface SidebarRouteWithChildren {
  isShownInSidebar: boolean; // default to false
  title: string;
  allowedRoles: UserRoleName[]; // adjust to (keyof typeof roleKeys)[] if roleKeys is an enum/object
  path?: string; // Made optional for parent navigation items
  description?: string;
  href?: string;
  element?: ReactNode;
  childItems?: SidebarRouteWithChildren[]; // recursive
  icon?: LucideIcon; // or React.ComponentType<any> if not fixed to Lucide
  breadcrumbs?: BreadcrumbLayoutProps[];
}

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
        allowedRoles: item.allowedRoles,
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
    allowedRoles: [],
    title: 'Login',
    description: 'User login page',
  },
  {
    path: '/signup',
    element: <Signup />,
    allowedRoles: [],
    title: 'Sign Up',
    description: 'User registration page',
  },
];

export const platformSidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    isShownInSidebar: true,
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    path: '/dashboard',
    allowedRoles: [userRoleKeys.ANY],
    element: <Dashboard />,
  },
  {
    isShownInSidebar: true,
    title: 'Platform Management',
    icon: Home,
    allowedRoles: [
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
    ],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Tenants',
        href: '/tenant-list',
        path: '/tenant-list',
        icon: Home,
        allowedRoles: [
          userRoleKeys.PLATFORM_SUPER_ADMIN,
          userRoleKeys.PLATFORM_ADMIN,
        ],
        element: <Tenants />,
        breadcrumbs: [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tenants' },
        ],
      },
    ],
  },
  {
    isShownInSidebar: true,
    title: 'Multi-Tenant',
    icon: Building2,
    allowedRoles: [
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_SUPER_ADMIN,
    ],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Workspace Settings',
        href: '/workspace/settings',
        path: '/workspace/settings',
        icon: Settings,
        allowedRoles: [
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Workspace Settings'
            description='Configure your workspace settings and preferences.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Branding',
        href: '/workspace/branding',
        path: '/workspace/branding',
        icon: FileText,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Branding'
            description='Customize your workspace branding and appearance.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Domain Config',
        href: '/workspace/domain',
        path: '/workspace/domain',
        icon: Shield,
        allowedRoles: [userRoleKeys.PLATFORM_SUPER_ADMIN],
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
    isShownInSidebar: true,
    path: '/profile',
    element: <Profile />,
    allowedRoles: [userRoleKeys.ANY],
    title: 'Profile',
    description: 'User profile management',
  },
  {
    isShownInSidebar: true,
    path: '/admin',
    element: <Admin />,
    allowedRoles: [
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_SUPER_ADMIN,
    ],
    title: 'Admin',
    description: 'Admin dashboard',
  },
  {
    isShownInSidebar: true,
    path: '/super-admin',
    element: <SuperAdmin />,
    allowedRoles: [userRoleKeys.PLATFORM_SUPER_ADMIN],
    title: 'Super Admin',
    description: 'Super admin dashboard',
  },
  {
    isShownInSidebar: true,
    path: '/tenant/:id',
    element: <TenantDetail />,
    allowedRoles: [
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_SUPER_ADMIN,
    ],
    title: 'Tenant Detail',
    description: 'View tenant details and manage users',
  },
];

export const tenantSidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    isShownInSidebar: true,
    path: '/home',
    element: <HomeScreen />,
    allowedRoles: [userRoleKeys.ANY],
    title: 'Home',
    description: 'Application home page',
  },
  {
    isShownInSidebar: true,
    title: 'Employee Management',
    icon: Users,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Employee Directory',
        href: '/employees',
        path: '/employees',
        icon: Users,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Employee Directory'
            description='Browse and search through all employees in your organization.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Onboarding',
        href: '/employees/onboarding',
        path: '/employees/onboarding',
        icon: UserCheck,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Employee Onboarding'
            description='Manage the employee onboarding process and documentation.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Departments',
        href: '/departments',
        path: '/departments',
        icon: Building2,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Departments'
            description='Manage organizational departments and structure.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Teams',
        href: '/teams',
        path: '/teams',
        icon: Users,
        allowedRoles: [userRoleKeys.ANY],
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
    isShownInSidebar: true,
    title: 'Attendance & Leave',
    icon: Clock,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Check In/Out',
        href: '/attendance/checkin',
        path: '/attendance/checkin',
        icon: Clock,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Check In/Out'
            description='Clock in and out for your work shifts with automated attendance tracking.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Attendance Logs',
        href: '/attendance/logs',
        path: '/attendance/logs',
        icon: BarChart3,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Attendance Logs'
            description='View your attendance history and records.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Leave Requests',
        href: '/leave/requests',
        path: '/leave/requests',
        icon: Calendar,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Leave Requests'
            description='Submit and manage your leave requests.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Leave Approvals',
        href: '/leave/approvals',
        path: '/leave/approvals',
        icon: UserCheck,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Leave Approvals'
            description='Review and approve employee leave requests.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Analytics',
        href: '/attendance/analytics',
        path: '/attendance/analytics',
        icon: BarChart3,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
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
    isShownInSidebar: true,
    title: 'Training & Learning',
    icon: GraduationCap,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Training Programs',
        href: '/training/programs',
        path: '/training/programs',
        icon: BookOpen,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Training Programs'
            description='Create and manage training programs for employees.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'My Learning',
        href: '/training/my-learning',
        path: '/training/my-learning',
        icon: GraduationCap,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='My Learning'
            description='Track your personal learning progress and courses.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Assessments',
        href: '/training/assessments',
        path: '/training/assessments',
        icon: FileText,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Assessments'
            description='Take quizzes and assessments for your training.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Certificates',
        href: '/training/certificates',
        path: '/training/certificates',
        icon: Award,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Certificates'
            description='View and download your earned certificates.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Progress Tracking',
        href: '/training/progress',
        path: '/training/progress',
        icon: BarChart3,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
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
    isShownInSidebar: true,
    title: 'Social Network',
    icon: Hash,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Newsfeed',
        href: '/social/feed',
        path: '/social/feed',
        icon: Hash,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Newsfeed'
            description='Stay updated with company news and colleague posts.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Announcements',
        href: '/social/announcements',
        path: '/social/announcements',
        icon: Bell,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title='Announcements'
            description='Create and manage company announcements.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Polls & Surveys',
        href: '/social/polls',
        path: '/social/polls',
        icon: BarChart3,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Polls & Surveys'
            description='Participate in company polls and surveys.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Company Updates',
        href: '/social/updates',
        path: '/social/updates',
        icon: FileText,
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
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
    isShownInSidebar: true,
    title: 'Team Chat',
    icon: MessageSquare,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        isShownInSidebar: true,
        title: 'Messages',
        href: '/chat/messages',
        path: '/chat/messages',
        icon: MessageSquare,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Messages'
            description='Send and receive private messages with colleagues.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'Team Channels',
        href: '/chat/channels',
        path: '/chat/channels',
        icon: Hash,
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title='Team Channels'
            description='Join team channels and group conversations.'
          />
        ),
      },
      {
        isShownInSidebar: true,
        title: 'File Sharing',
        href: '/chat/files',
        path: '/chat/files',
        icon: FileText,
        allowedRoles: [userRoleKeys.ANY],
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
    isShownInSidebar: true,
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    path: '/notifications',
    allowedRoles: [userRoleKeys.ANY],
    element: (
      <ComingSoon
        title='Notifications'
        description='View and manage your notifications.'
      />
    ),
  },
  {
    isShownInSidebar: true,
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    path: '/settings',
    allowedRoles: [userRoleKeys.ANY],
    element: (
      <ComingSoon
        title='Settings'
        description='Manage your account and application settings.'
      />
    ),
  },
  {
    isShownInSidebar: false,
    path: 'tenant/profile',
    element: <Profile />,
    allowedRoles: [userRoleKeys.ANY],
    title: 'Tenant Profile',
    description: 'User profile management',
  },
];

// Extract routes from navigation items
export const platformNavigationRoutes: AuthRoute[] = flattenNavigationItems(
  platformSidebarNavigationItems
);

export const tenantNavigationRoutes: AuthRoute[] = flattenNavigationItems(
  tenantSidebarNavigationItems
);

const protectedRouteList: AuthRoute[] = [
  ...platformNavigationRoutes,
  ...tenantNavigationRoutes,
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
    allowedRoles: [userRoleKeys.ANY],
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },
];
