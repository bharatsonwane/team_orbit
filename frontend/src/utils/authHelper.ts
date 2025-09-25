import { userRoleKeys, type UserRoleKey } from '@/schemas/user';
/**
 * Checks if any of the allowed roles match the user's roles
 * @param options - Object containing allowedRoles and userRoles (both default to empty arrays)
 * @returns true if any allowed role matches any user role, false otherwise
 */
export function hasRoleAccess({
  allowedRoleNames,
  userRoleNames,
}: {
  allowedRoleNames?: UserRoleKey[];
  userRoleNames?: UserRoleKey[];
}): boolean {
  if (allowedRoleNames?.length === 0) {
    return true; // No restrictions, allow access
  } else if (!userRoleNames || userRoleNames?.length === 0) {
    return false;
  } else if (allowedRoleNames?.includes(userRoleKeys.ANY)) {
    return true;
  } else {
    const isAuthorized = allowedRoleNames?.some(allowedRole =>
      userRoleNames?.includes(allowedRole)
    );
    return isAuthorized ?? false;
  }
}
