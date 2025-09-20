import type { UserRole } from '../schemas/user';

/**
 * Interface for hasRoleAccess function parameters
 */
export interface RoleAccessOptions {
  allowedRoles?: UserRole[];
  userRoles?: UserRole[];
}

/**
 * Checks if any of the allowed roles match the user's roles
 * @param options - Object containing allowedRoles and userRoles (both default to empty arrays)
 * @returns true if any allowed role matches any user role, false otherwise
 */
export function hasRoleAccess({
  allowedRoles = [],
  userRoles = [],
}: RoleAccessOptions = {}): boolean {
  if (allowedRoles.length === 0) {
    return true; // No restrictions, allow access
  }

  if (userRoles.length === 0) {
    return false; // No user roles, deny access
  }

  return allowedRoles.some(allowedRole => userRoles.includes(allowedRole));
}
