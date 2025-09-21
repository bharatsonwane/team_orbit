import { Link, useLocation } from 'react-router-dom';
import { Building2, ChevronRight } from 'lucide-react';
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

import { sidebarNavigationItems, type SidebarRouteWithChildren } from './AppRouter';

export function AppSidebar() {
  const location = useLocation();
  const { loggedInUser } = useAuthService();

  const isActiveLink = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    );
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
  const filterNavigationItems = (items: SidebarRouteWithChildren[]) => {
    return items
      .filter(item => {
        // Check if user has access to the main item
        if (!hasAccess(item.authRoles)) return false;

        // If item has childItems, filter them too
        if (item.childItems) {
          const filteredSubItems = item.childItems.filter(subItem =>
            hasAccess(subItem.authRoles)
          );
          // Only show parent if it has at least one accessible child
          return filteredSubItems.length > 0;
        }

        return true;
      })
      .map(item => {
        // Filter childItems for items that have them
        if (item.childItems) {
          return {
            ...item,
            childItems: item.childItems.filter(subItem => hasAccess(subItem.authRoles)),
          };
        }
        return item;
      });
  };

  const filteredNavigationItems = filterNavigationItems(sidebarNavigationItems);

  return (
    <Sidebar className='border-r'>
      <SidebarHeader className='border-b p-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Building2 className='h-4 w-4' />
          </div>
          <div className='flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold'>TeamOrbit</span>
            <span className='truncate text-xs text-muted-foreground block'>
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
              {filteredNavigationItems.map(item => {
                if (item.childItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={cn(
                              'w-full',
                              item.childItems.some(subItem =>
                                subItem.href && isActiveLink(subItem.href)
                              ) && 'bg-accent text-accent-foreground'
                            )}
                          >
                            {item.icon && <item.icon className='h-4 w-4' />}
                            <span>{item.title}</span>
                            <ChevronRight className='ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.childItems.map(subItem => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subItem.href ? isActiveLink(subItem.href) : false}
                                >
                                  <Link to={subItem.href || '#'}>
                                    {subItem.icon && <subItem.icon className='h-4 w-4' />}
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
                      isActive={item.href ? isActiveLink(item.href) : false}
                    >
                      <Link to={item.href || '#'}>
                        {item.icon && <item.icon className='h-4 w-4' />}
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

      <SidebarFooter className='border-t p-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='' alt={loggedInUser?.first_name} />
            <AvatarFallback>
              {loggedInUser?.first_name && loggedInUser?.last_name
                ? `${loggedInUser.first_name[0]}${loggedInUser.last_name[0]}`
                : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-medium'>
              {loggedInUser?.first_name && loggedInUser?.last_name
                ? `${loggedInUser.first_name} ${loggedInUser.last_name}`
                : 'User'}
            </span>
            <span className='truncate text-xs text-muted-foreground block'>
              {loggedInUser?.role || 'Employee'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
