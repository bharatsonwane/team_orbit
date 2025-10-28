import React, { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Building2, ChevronRight, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { useSelector } from "react-redux";
import { selectNotificationCount } from "@/redux/slices/notificationSlice";

// Default company info - can be made configurable later
const companyInfo = {
  name: "TeamOrbit Inc.",
  logo: "/logos/teamorbit.png",
};

import {
  platformSidebarNavigationItems,
  tenantSidebarNavigationItems,
  type SidebarRouteWithChildren,
} from "./routing/AppRoutes";
import { filterNavigationItems } from "@/utils/sidebarHelper";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loggedInUser, logout, tenantId } = useAuthService();

  // Get notification count from Redux store
  const unreadCount = useSelector(selectNotificationCount);

  // Helper function to replace :tenantId with actual tenantId
  const resolveTenantPath = (href: string): string => {
    if (href.includes(":tenantId")) {
      const actualTenantId = tenantId || loggedInUser?.tenantId || 1;
      return href.replace(":tenantId", String(actualTenantId));
    }
    return href;
  };

  const isActiveLink = (href: string) => {
    const resolvedHref = resolveTenantPath(href);
    return (
      location.pathname === resolvedHref ||
      location.pathname.startsWith(resolvedHref + "/")
    );
  };

  const filteredSidebarItems: SidebarRouteWithChildren[] = (() => {
    if (!loggedInUser) {
      return [];
    }

    let sidebarNavigationItems: SidebarRouteWithChildren[] =
      tenantSidebarNavigationItems;

    // Show platform sidebar if pathname starts with "platform"
    if (location.pathname.startsWith("/platform")) {
      sidebarNavigationItems = platformSidebarNavigationItems;
    }

    const items = filterNavigationItems({
      loggedInUser: loggedInUser,
      items: sidebarNavigationItems,
    });
    return items;
  })();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavigateToProfile = () => {
    // Determine if we're in platform or tenant context
    const isPlatformContext = location.pathname.startsWith("/platform");

    if (isPlatformContext) {
      navigate("/platform/profile");
    } else {
      const actualTenantId = tenantId || loggedInUser?.tenantId || 1;
      navigate(`/tenant/${actualTenantId}/profile`);
    }
  };

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
              {filteredSidebarItems.map(item => (
                <Fragment
                  key={`sidebar_item_${item.title}_${item.isShownInSidebar}`}
                >
                  {item.childItems &&
                  item.childItems.length > 0 &&
                  item.isShownInSidebar ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={cn(
                              "w-full cursor-pointer",
                              item.childItems.some(
                                subItem =>
                                  subItem.href && isActiveLink(subItem.href)
                              ) && "bg-accent text-accent-foreground"
                            )}
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
                                  <Link
                                    to={
                                      subItem.href
                                        ? resolveTenantPath(subItem.href)
                                        : "#"
                                    }
                                  >
                                    {subItem.icon && (
                                      <subItem.icon className="h-4 w-4" />
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
                  ) : item.isShownInSidebar ? (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={item.href ? isActiveLink(item.href) : false}
                      >
                        <Link
                          to={item.href ? resolveTenantPath(item.href) : "#"}
                        >
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ) : null}
                </Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-2 hover:bg-accent"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="" alt={loggedInUser?.firstName} />
                <AvatarFallback>
                  {loggedInUser?.firstName && loggedInUser?.lastName
                    ? `${loggedInUser.firstName[0]}${loggedInUser.lastName[0]}`
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-sm leading-tight min-w-0">
                <div className="truncate font-medium">
                  {loggedInUser?.firstName && loggedInUser?.lastName
                    ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
                    : "User"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {loggedInUser?.roles
                    ? Array.isArray(loggedInUser.roles)
                      ? loggedInUser.roles
                          .map(role => role.label || role)
                          .join(", ")
                      : loggedInUser.roles
                    : "User"}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNavigateToProfile}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
