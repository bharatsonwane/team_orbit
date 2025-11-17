import type { LookupItem } from "@/schemas/lookupSchema";
import { userRoleKeys, type UserRoleName } from "@/utils/constants";
/**
 * Checks if any of the allowed roles match the user's roles
 * @param options - Object containing allowedRoles and userRoles (both default to empty arrays)
 * @returns true if any allowed role matches any user role, false otherwise
 */
export function hasRoleAccess({
  allowedRoleNames,
  userRoles,
}: {
  allowedRoleNames?: UserRoleName[];
  userRoles?: LookupItem[];
}): boolean {
  if (allowedRoleNames?.length === 0) {
    return true; // No restrictions, allow access
  } else if (!userRoles || userRoles?.length === 0) {
    return false;
  } else if (allowedRoleNames?.includes(userRoleKeys.ANY)) {
    return true;
  } else {
    const isAuthorized = allowedRoleNames?.some(allowedRole =>
      userRoles?.some(userRole => userRole.name === allowedRole)
    );
    return isAuthorized ?? false;
  }
}
