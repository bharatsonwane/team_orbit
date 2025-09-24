import { userRoleKeys, type UserRoleKey } from '@/schemas/user';

/**
 * Interface for hasRoleAccess function parameters
 */
export interface RoleAccessOptions {
  allowedRoles?: UserRoleKey[];
  userRoles?: UserRoleKey[];
}

/**
 * Checks if any of the allowed roles match the user's roles
 * @param options - Object containing allowedRoles and userRoles (both default to empty arrays)
 * @returns true if any allowed role matches any user role, false otherwise
 */
export function hasRoleAccess({
  allowedRoles,
  userRoles,
}: RoleAccessOptions): boolean {
  if (allowedRoles?.length === 0) {
    return true; // No restrictions, allow access
  }

  if (
    allowedRoles?.includes(userRoleKeys.ANY) &&
    userRoles?.length &&
    userRoles.length > 0
  ) {
    return true;
  }

  const isAuthorized = allowedRoles?.some(allowedRole =>
    userRoles?.includes(allowedRole)
  );

  return isAuthorized ?? false;
}
