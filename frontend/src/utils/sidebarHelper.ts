import type { SidebarRouteWithChildren } from "@/components/routing/AppRoutes";
import { hasRoleAccess } from "./authHelper";
import type { User } from "@/schemaAndTypes/userSchema";

// Recursive function to filter navigation items based on user role
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
    const isAuthorized = hasRoleAccess({
      allowedRoleNames: item.allowedRoles,
      userRoles: loggedInUser?.roles || [],
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
