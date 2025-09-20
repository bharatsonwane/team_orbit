import { Link, useLocation } from 'react-router-dom';
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
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthService } from '@/contexts/AuthContextProvider';
import { roleKeys } from '@/utils/constants';
import type { UserRole } from '@/schemas/user';

// Default company info - can be made configurable later
const companyInfo = {
  name: 'TeamOrbit Inc.',
  logo: '/logos/teamorbit.png',
};

const navigationItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    authRoles: [roleKeys.any],
  },
  {
    title: 'Multi-Tenant',
    icon: Building2,
    authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
    items: [
      {
        title: 'Workspace Settings',
        href: '/workspace/settings',
        icon: Settings,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Branding',
        href: '/workspace/branding',
        icon: FileText,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Domain Config',
        href: '/workspace/domain',
        icon: Shield,
        authRoles: [roleKeys.platformSuperAdmin],
      },
    ],
  },
  {
    title: 'Employee Management',
    icon: Users,
    authRoles: [roleKeys.any],
    items: [
      {
        title: 'Employee Directory',
        href: '/employees',
        icon: Users,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Onboarding',
        href: '/employees/onboarding',
        icon: UserCheck,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Departments',
        href: '/departments',
        icon: Building2,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Teams',
        href: '/teams',
        icon: Users,
        authRoles: [roleKeys.any],
      },
    ],
  },
  {
    title: 'Attendance & Leave',
    icon: Clock,
    authRoles: [roleKeys.any],
    items: [
      {
        title: 'Check In/Out',
        href: '/attendance/checkin',
        icon: Clock,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Attendance Logs',
        href: '/attendance/logs',
        icon: BarChart3,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Leave Requests',
        href: '/leave/requests',
        icon: Calendar,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Leave Approvals',
        href: '/leave/approvals',
        icon: UserCheck,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Analytics',
        href: '/attendance/analytics',
        icon: BarChart3,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
    ],
  },
  {
    title: 'Training & Learning',
    icon: GraduationCap,
    authRoles: [roleKeys.any],
    items: [
      {
        title: 'Training Programs',
        href: '/training/programs',
        icon: BookOpen,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'My Learning',
        href: '/training/my-learning',
        icon: GraduationCap,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Assessments',
        href: '/training/assessments',
        icon: FileText,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Certificates',
        href: '/training/certificates',
        icon: Award,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Progress Tracking',
        href: '/training/progress',
        icon: BarChart3,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
    ],
  },
  {
    title: 'Social Network',
    icon: Hash,
    authRoles: [roleKeys.any],
    items: [
      {
        title: 'Newsfeed',
        href: '/social/feed',
        icon: Hash,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Announcements',
        href: '/social/announcements',
        icon: Bell,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
      {
        title: 'Polls & Surveys',
        href: '/social/polls',
        icon: BarChart3,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Company Updates',
        href: '/social/updates',
        icon: FileText,
        authRoles: [roleKeys.tenantAdmin, roleKeys.tenantManager, roleKeys.platformAdmin, roleKeys.platformSuperAdmin],
      },
    ],
  },
  {
    title: 'Team Chat',
    icon: MessageSquare,
    authRoles: [roleKeys.any],
    items: [
      {
        title: 'Messages',
        href: '/chat/messages',
        icon: MessageSquare,
        authRoles: [roleKeys.any],
      },
      {
        title: 'Team Channels',
        href: '/chat/channels',
        icon: Hash,
        authRoles: [roleKeys.any],
      },
      {
        title: 'File Sharing',
        href: '/chat/files',
        icon: FileText,
        authRoles: [roleKeys.any],
      },
    ],
  },
  {
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    authRoles: [roleKeys.any],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    authRoles: [roleKeys.any],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { loggedInUser } = useAuthService();

  const isActiveLink = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Check if user has access to a navigation item
  const hasAccess = (authRoles: UserRole[]) => {
    if (!loggedInUser) return false;
    
    // Handle the ANY role - if ANY is in allowed roles, grant access
    if (authRoles.includes(roleKeys.any as UserRole)) return true;
    
    // Check if user's role is in the allowed roles
    return authRoles.includes(loggedInUser.role as UserRole);
  };

  // Filter navigation items based on user role
  const filterNavigationItems = (items: typeof navigationItems) => {
    return items.filter(item => {
      // Check if user has access to the main item
      if (!hasAccess(item.authRoles)) return false;

      // If item has sub-items, filter them too
      if (item.items) {
        const filteredSubItems = item.items.filter(subItem => 
          hasAccess(subItem.authRoles)
        );
        // Only show parent if it has at least one accessible sub-item
        return filteredSubItems.length > 0;
      }

      return true;
    }).map(item => {
      // Filter sub-items for items that have them
      if (item.items) {
        return {
          ...item,
          items: item.items.filter(subItem => hasAccess(subItem.authRoles))
        };
      }
      return item;
    });
  };

  const filteredNavigationItems = filterNavigationItems(navigationItems);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">TeamOrbit</span>
            <span className="truncate text-xs text-muted-foreground block">
              {companyInfo.name}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigationItems.map((item) => {
                if (item.items) {
                  return (
                    <Collapsible key={item.title} asChild className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={cn(
                              "w-full",
                              item.items.some((subItem) => isActiveLink(subItem.href)) &&
                                "bg-accent text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveLink(subItem.href)}
                                >
                                  <Link to={subItem.href}>
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isActiveLink(item.href!)}
                    >
                      <Link to={item.href!}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={loggedInUser?.first_name} />
            <AvatarFallback>
              {loggedInUser?.first_name && loggedInUser?.last_name
                ? `${loggedInUser.first_name[0]}${loggedInUser.last_name[0]}`
                : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">
              {loggedInUser?.first_name && loggedInUser?.last_name
                ? `${loggedInUser.first_name} ${loggedInUser.last_name}`
                : 'User'}
            </span>
            <span className="truncate text-xs text-muted-foreground block">
              {loggedInUser?.role || 'Employee'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
