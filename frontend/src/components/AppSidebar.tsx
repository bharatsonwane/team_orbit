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

// Default company info - can be made configurable later
const companyInfo = {
  name: 'TeamOrbit Inc.',
  logo: '/logos/teamorbit.png',
};

import {
  sidebarNavigationItems,
  type SidebarRouteWithChildren,
} from './AppRouter';
import { hasRoleAccess } from '@/utils/authHelper';
import type { UserRoleKey } from '@/schemas/user';

export function AppSidebar() {
  const location = useLocation();
  const { loggedInUser } = useAuthService();

  const isActiveLink = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    );
  };

  // Recursive function to filter navigation items based on user role
  const filterNavigationItems = (
    items: SidebarRouteWithChildren[]
  ): SidebarRouteWithChildren[] => {
    const filteredItems: SidebarRouteWithChildren[] = [];

    // Step 1: Iterate through each navigation item
    for (const item of items) {
      // Step 2: Check if user has access to the main item
      const isAuthorized = hasRoleAccess({
        allowedRoleNames: item.allowedRoles,
        userRoleNames: loggedInUser?.roles?.map(role => role.name as UserRoleKey) || [],
      });

      if (!isAuthorized) {
        continue;
      }

      // Step 3: Handle child items recursively
      let filteredChildItems: SidebarRouteWithChildren[] = [];
      if (item.childItems && item.childItems.length > 0) {
        filteredChildItems = filterNavigationItems(item.childItems);
      }

      const filteredItem: SidebarRouteWithChildren = {
        ...item,
        childItems: filteredChildItems,
      };
      filteredItems.push(filteredItem);
    }

    // Step 6: Return the filtered items
    return filteredItems;
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
                              item.childItems.some(
                                subItem =>
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
                                  isActive={
                                    subItem.href
                                      ? isActiveLink(subItem.href)
                                      : false
                                  }
                                >
                                  <Link to={subItem.href || '#'}>
                                    {subItem.icon && (
                                      <subItem.icon className='h-4 w-4' />
                                    )}
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
              {loggedInUser?.roles
                ? Array.isArray(loggedInUser.roles)
                  ? loggedInUser.roles.map(role => role.name || role).join(', ')
                  : loggedInUser.roles
                : 'Employee'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
