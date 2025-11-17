import React, { type ReactNode } from "react";
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
  User,
  type LucideIcon,
} from "lucide-react";
import { type AuthRoute, RouteGuardRenderer } from "./RouteGuardRenderer";
import { userRoleKeys, type UserRoleName } from "@/utils/constants";

// Import pages
import TenantHome from "../../pages/tenant/TenantHome";
import Login from "../../pages/auth/Login";
import Signup from "../../pages/auth/Signup";
import PlatformDashboard from "../../pages/platform/PlatformDashboard";
import Profile from "../../pages/profile/Profile";
import Tenants from "@/pages/platform/tenant/Tenants";
import TenantDetail from "@/pages/platform/tenant/TenantDetail";
import TenantUsers from "@/pages/platform/tenant/TenantUsers";
import PlatformNotifications from "../../pages/platform/notification/PlatformNotifications";
import TenantNotifications from "../../pages/tenant/TenantNotifications";
import { ComingSoon } from "../ComingSoon";
import { AppLayout } from "@/components/AppLayout";
import type { BreadcrumbLayoutProps } from "@/components/AppLayout";
import TenantDepartments from "@/pages/platform/tenant/TenantDepartments";
import TenantDesignations from "@/pages/platform/tenant/TenantDesignations";
import ChatPage from "@/pages/tenant/chat/ChatPage";

export interface SidebarRouteWithChildren {
  title: string;
  isShownInSidebar: boolean; // default to false
  icon?: LucideIcon; // or React.ComponentType<any> if not fixed to Lucide
  href?: string;
  path?: string; // Made optional for parent navigation items
  allowedRoles: UserRoleName[]; // adjust to (keyof typeof roleKeys)[] if roleKeys is an enum/object
  element?: ReactNode;
  description?: string;
  childItems?: SidebarRouteWithChildren[]; // recursive
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
    path: "/login",
    element: <Login />,
    allowedRoles: [],
    title: "Login",
    description: "User login page",
  },
  {
    path: "/signup",
    element: <Signup />,
    allowedRoles: [],
    title: "Sign Up",
    description: "User registration page",
  },
];

export const platformSidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    title: "Dashboard",
    isShownInSidebar: true,
    icon: Home,
    href: "/platform/dashboard",
    path: "/platform/dashboard",
    allowedRoles: [userRoleKeys.ANY],
    element: <PlatformDashboard />,
  },
  {
    title: "Platform Management",
    isShownInSidebar: true,
    icon: Home,
    allowedRoles: [
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
    ],
    href: "/tenant/:tenantId/home",
    path: "/tenant/:tenantId/home",
    element: <TenantHome />,
  },
  {
    title: "Tenant Management",
    isShownInSidebar: true,
    icon: Home,
    allowedRoles: [
      userRoleKeys.PLATFORM_SUPER_ADMIN,
      userRoleKeys.PLATFORM_ADMIN,
    ],
    childItems: [
      {
        title: "Tenants",
        isShownInSidebar: true,
        icon: Home,
        href: "/platform/tenant-list",
        path: "/platform/tenant-list",
        allowedRoles: [
          userRoleKeys.PLATFORM_SUPER_ADMIN,
          userRoleKeys.PLATFORM_ADMIN,
        ],
        element: <Tenants />,
        breadcrumbs: [
          { label: "Dashboard", href: "/platform/dashboard" },
          { label: "Tenants" },
        ],
      },
    ],
  },
  {
    title: "Profile",
    isShownInSidebar: true,
    href: "/platform/profile",
    path: "/platform/profile",
    allowedRoles: [userRoleKeys.ANY],
    element: <Profile />,
    description: "User profile management",
  },
  {
    title: "Tenant Detail",
    isShownInSidebar: false,
    href: "/platform/tenant/:id",
    path: "/platform/tenant/:id",
    allowedRoles: [
      userRoleKeys.PLATFORM_ADMIN,
      userRoleKeys.PLATFORM_SUPER_ADMIN,
    ],
    element: <TenantDetail />,
    description: "View tenant details and manage users",
  },
  {
    title: "Notifications",
    isShownInSidebar: true,
    icon: Bell,
    href: "/platform/notifications",
    path: "/platform/notifications",
    allowedRoles: [userRoleKeys.ANY],
    element: <PlatformNotifications />,
    description: "Platform notifications",
  },
];

export const tenantSidebarNavigationItems: SidebarRouteWithChildren[] = [
  {
    title: "Home",
    isShownInSidebar: true,
    href: "/tenant/:tenantId/home",
    path: "/tenant/:tenantId/home",
    allowedRoles: [userRoleKeys.ANY],
    element: <TenantHome />,
    description: "Application home page",
  },
  {
    title: "Organization Management",
    isShownInSidebar: true,
    icon: Users,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: "Users",
        isShownInSidebar: true,
        icon: Users,
        href: "/tenant/:tenantId/users",
        path: "/tenant/:tenantId/users",
        allowedRoles: [userRoleKeys.ANY],
        element: <TenantUsers />,
        description: "Browse and manage all users in your organization",
      },
      {
        title: "Departments",
        isShownInSidebar: true,
        icon: Building2,
        href: "/tenant/:tenantId/departments",
        path: "/tenant/:tenantId/departments",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: <TenantDepartments />,
        description: "Manage organizational departments and structure.",
        // <ComingSoon
        //   title="Departments"
        //   description="Manage organizational departments and structure."
        // />
      },
      {
        title: "Designations",
        isShownInSidebar: true,
        icon: Building2,
        href: "/tenant/:tenantId/designations",
        path: "/tenant/:tenantId/designations",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: <TenantDesignations />,
        description: "Manage organizational designations and structure.",
        // <ComingSoon
        //   title="Departments"
        //   description="Manage organizational departments and structure."
        // />
      },
      {
        title: "Teams",
        isShownInSidebar: true,
        icon: Users,
        href: "/tenant/:tenantId/teams",
        path: "/tenant/:tenantId/teams",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Teams"
            description="View and manage team structures and memberships."
          />
        ),
      },
    ],
  },
  {
    title: "Attendance & Leave",
    isShownInSidebar: true,
    icon: Clock,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: "Check In/Out",
        isShownInSidebar: true,
        icon: Clock,
        href: "/tenant/:tenantId/attendance/checkin",
        path: "/tenant/:tenantId/attendance/checkin",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Check In/Out"
            description="Clock in and out for your work shifts with automated attendance tracking."
          />
        ),
      },
      {
        title: "Attendance Logs",
        isShownInSidebar: true,
        icon: BarChart3,
        href: "/tenant/:tenantId/attendance/logs",
        path: "/tenant/:tenantId/attendance/logs",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Attendance Logs"
            description="View your attendance history and records."
          />
        ),
      },
      {
        title: "Leave Requests",
        isShownInSidebar: true,
        icon: Calendar,
        href: "/tenant/:tenantId/leave/requests",
        path: "/tenant/:tenantId/leave/requests",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Leave Requests"
            description="Submit and manage your leave requests."
          />
        ),
      },
      {
        title: "Leave Approvals",
        isShownInSidebar: true,
        icon: UserCheck,
        href: "/tenant/:tenantId/leave/approvals",
        path: "/tenant/:tenantId/leave/approvals",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Leave Approvals"
            description="Review and approve user leave requests."
          />
        ),
      },
      {
        title: "Analytics",
        isShownInSidebar: true,
        icon: BarChart3,
        href: "/tenant/:tenantId/attendance/analytics",
        path: "/tenant/:tenantId/attendance/analytics",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Attendance Analytics"
            description="View detailed attendance analytics and reports."
          />
        ),
      },
    ],
  },
  {
    title: "Training & Learning",
    isShownInSidebar: true,
    icon: GraduationCap,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: "Training Programs",
        isShownInSidebar: true,
        icon: BookOpen,
        href: "/tenant/:tenantId/training/programs",
        path: "/tenant/:tenantId/training/programs",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Training Programs"
            description="Create and manage training programs for users."
          />
        ),
      },
      {
        title: "My Learning",
        isShownInSidebar: true,
        icon: GraduationCap,
        href: "/tenant/:tenantId/training/my-learning",
        path: "/tenant/:tenantId/training/my-learning",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="My Learning"
            description="Track your personal learning progress and courses."
          />
        ),
      },
      {
        title: "Assessments",
        isShownInSidebar: true,
        icon: FileText,
        href: "/tenant/:tenantId/training/assessments",
        path: "/tenant/:tenantId/training/assessments",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Assessments"
            description="Take quizzes and assessments for your training."
          />
        ),
      },
      {
        title: "Certificates",
        isShownInSidebar: true,
        icon: Award,
        href: "/tenant/:tenantId/training/certificates",
        path: "/tenant/:tenantId/training/certificates",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Certificates"
            description="View and download your earned certificates."
          />
        ),
      },
      {
        title: "Progress Tracking",
        isShownInSidebar: true,
        icon: BarChart3,
        href: "/tenant/:tenantId/training/progress",
        path: "/tenant/:tenantId/training/progress",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Progress Tracking"
            description="Track user training progress and completion."
          />
        ),
      },
    ],
  },
  {
    title: "Social Network",
    isShownInSidebar: true,
    icon: Hash,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: "Newsfeed",
        isShownInSidebar: true,
        icon: Hash,
        href: "/tenant/:tenantId/social/feed",
        path: "/tenant/:tenantId/social/feed",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Newsfeed"
            description="Stay updated with company news and colleague posts."
          />
        ),
      },
      {
        title: "Announcements",
        isShownInSidebar: true,
        icon: Bell,
        href: "/tenant/:tenantId/social/announcements",
        path: "/tenant/:tenantId/social/announcements",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Announcements"
            description="Create and manage company announcements."
          />
        ),
      },
      {
        title: "Polls & Surveys",
        isShownInSidebar: true,
        icon: BarChart3,
        href: "/tenant/:tenantId/social/polls",
        path: "/tenant/:tenantId/social/polls",
        allowedRoles: [userRoleKeys.ANY],
        element: (
          <ComingSoon
            title="Polls & Surveys"
            description="Participate in company polls and surveys."
          />
        ),
      },
      {
        title: "Company Updates",
        isShownInSidebar: true,
        icon: FileText,
        href: "/tenant/:tenantId/social/updates",
        path: "/tenant/:tenantId/social/updates",
        allowedRoles: [
          userRoleKeys.TENANT_ADMIN,
          userRoleKeys.TENANT_MANAGER,
          userRoleKeys.PLATFORM_ADMIN,
          userRoleKeys.PLATFORM_SUPER_ADMIN,
        ],
        element: (
          <ComingSoon
            title="Company Updates"
            description="Manage company updates and communications."
          />
        ),
      },
    ],
  },
  {
    title: "Chats",
    isShownInSidebar: true,
    icon: MessageSquare,
    allowedRoles: [userRoleKeys.ANY],
    childItems: [
      {
        title: "Direct Chats",
        isShownInSidebar: true,
        icon: User,
        href: "/tenant/:tenantId/chat/direct",
        path: "/tenant/:tenantId/chat/direct",
        allowedRoles: [userRoleKeys.ANY],
        element: <ChatPage channelType="direct" />,
      },
      {
        title: "Group Chat",
        isShownInSidebar: true,
        icon: Users,
        href: "/tenant/:tenantId/chat/group",
        path: "/tenant/:tenantId/chat/group",
        allowedRoles: [userRoleKeys.ANY],
        element: <ChatPage channelType="group" />,
      },
    ],
  },
  {
    title: "Settings",
    isShownInSidebar: true,
    icon: Settings,
    href: "/tenant/:tenantId/settings",
    path: "/tenant/:tenantId/settings",
    allowedRoles: [userRoleKeys.ANY],
    element: (
      <ComingSoon
        title="Settings"
        description="Manage your account and application settings."
      />
    ),
  },
  {
    title: "Notifications",
    isShownInSidebar: true,
    icon: Bell,
    href: "/tenant/:tenantId/notifications",
    path: "/tenant/:tenantId/notifications",
    allowedRoles: [userRoleKeys.ANY],
    element: <TenantNotifications />,
    description: "Tenant notifications",
  },
  {
    title: "Tenant Profile",
    isShownInSidebar: false,
    href: "/tenant/:tenantId/profile",
    path: "/tenant/:tenantId/profile",
    allowedRoles: [userRoleKeys.ANY],
    element: <Profile />,
    description: "User profile management",
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
    path: "/*",
    element: (
      <AppLayout>
        <RouteGuardRenderer routes={protectedRouteList} />
      </AppLayout>
    ),
    allowedRoles: [userRoleKeys.ANY],
    title: "Page Not Found",
    description: "The page you are looking for does not exist.",
  },
];
