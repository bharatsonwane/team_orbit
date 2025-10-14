import { userRoleKeys } from "./constants";

/**
 * Validates if a user has permission to create users with the specified roles
 * @param params - Object containing current user role names and target role names
 * @param params.currentUserRoleNames - Array of role names for the current user
 * @param params.targetRoleNames - Array of role names that the user wants to assign
 * @returns boolean - true if permission is granted, false otherwise
 */
export const hasRolePermission = ({
  currentUserRoleNames,
  targetRoleNames,
}: {
  currentUserRoleNames: string[];
  targetRoleNames: (string | undefined)[];
}): boolean => {
  // Filter out undefined role names
  const validTargetRoles = targetRoleNames.filter(
    (role): role is string => role !== undefined
  );

  // PLATFORM_SUPER_ADMIN can create any role
  if (currentUserRoleNames.includes(userRoleKeys.PLATFORM_SUPER_ADMIN)) {
    return true;
  }

  // PLATFORM_ADMIN can create PLATFORM_USER, TENANT_ADMIN, TENANT_MANAGER, TENANT_USER
  if (currentUserRoleNames.includes(userRoleKeys.PLATFORM_ADMIN)) {
    const allowedRoles = [
      userRoleKeys.PLATFORM_USER,
      userRoleKeys.TENANT_ADMIN,
      userRoleKeys.TENANT_MANAGER,
      userRoleKeys.TENANT_USER,
    ];
    return validTargetRoles.every(role => allowedRoles.includes(role as any));
  }

  // TENANT_ADMIN can create TENANT_MANAGER, TENANT_USER
  if (currentUserRoleNames.includes(userRoleKeys.TENANT_ADMIN)) {
    const allowedRoles = [
      userRoleKeys.TENANT_MANAGER,
      userRoleKeys.TENANT_USER,
    ];
    return validTargetRoles.every(role => allowedRoles.includes(role as any));
  }

  // PLATFORM_USER and TENANT_USER cannot create any users
  return false;
};
