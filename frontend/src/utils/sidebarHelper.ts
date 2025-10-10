import type { SidebarRouteWithChildren } from "@/components/routing/AppRoutes";
import { hasRoleAccess } from "./authHelper";
import type { User } from "@/schemas/user";

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

export const matchRoutePattern = (pattern: string, path: string): boolean => {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  // Lengths must match
  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, i) => {
    // if pattern part starts with ":" it's a dynamic segment → always matches
    if (part.startsWith(":")) {
      return true;
    }
    // else must be exact match
    return part === pathParts[i];
  });
};
