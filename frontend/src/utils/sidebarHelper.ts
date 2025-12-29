import type { SidebarRouteWithChildren } from "@/components/routing/AppRoutes";
import { hasPermissionAccess } from "./authHelper";
import type { User } from "@/schemaTypes/userSchemaTypes";

// Recursive function to filter navigation items based on user permissions
export const filterNavigationItems = ({
  loggedInUser,
  items,
}: {
  loggedInUser: User | null;
  items: SidebarRouteWithChildren[];
}): SidebarRouteWithChildren[] => {
  const filteredItems: SidebarRouteWithChildren[] = [];

  // Step 1: Iterate through each navigation item
  for (const item of items) {
    // Step 2: Check if user has access to the main item
    const isAuthorized = hasPermissionAccess({
      allowedPlatformPermissions: item.allowedPlatformPermissions,
      allowedTenantPermissions: item.allowedTenantPermissions,
      userPlatformPermissions: loggedInUser?.platformPermissions,
      userTenantPermissions: loggedInUser?.tenantPermissions,
    });

    if (!isAuthorized) {
      continue;
    }

    // Step 3: Handle child items recursively
    let filteredChildItems: SidebarRouteWithChildren[] = [];
    if (item.childItems && item.childItems.length > 0) {
      filteredChildItems = filterNavigationItems({
        loggedInUser,
        items: item.childItems,
      });
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
