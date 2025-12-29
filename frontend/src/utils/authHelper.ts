import type { LookupItem } from "@/schemaTypes/lookupSchemaTypes";
import {
  platformPermissionKeys,
  tenantPermissionKeys,
} from "@/utils/constants";

/**
 * Checks if user has any of the required permissions
 * @param options - Object containing allowedPermissions (platform and tenant) and user permissions
 * @returns true if user has any of the required permissions, false otherwise
 */
export function hasPermissionAccess({
  allowedPlatformPermissions,
  allowedTenantPermissions,
  userPlatformPermissions,
  userTenantPermissions,
}: {
  allowedPlatformPermissions?: string[];
  allowedTenantPermissions?: string[];
  userPlatformPermissions?: string[];
  userTenantPermissions?: string[];
}): boolean {
  // If no permissions required, allow access
  const hasPlatformRestrictions =
    allowedPlatformPermissions && allowedPlatformPermissions.length > 0;
  const hasTenantRestrictions =
    allowedTenantPermissions && allowedTenantPermissions.length > 0;

  if (!hasPlatformRestrictions && !hasTenantRestrictions) {
    return true; // No restrictions, allow access
  }

  // Check for ANY permission
  if (
    (hasPlatformRestrictions &&
      allowedPlatformPermissions?.includes(platformPermissionKeys.ANY)) ||
    (hasTenantRestrictions &&
      allowedTenantPermissions?.includes(tenantPermissionKeys.ANY))
  ) {
    return true;
  }

  // Check platform permissions
  if (hasPlatformRestrictions) {
    const hasPlatformAccess = allowedPlatformPermissions?.some(permission =>
      userPlatformPermissions?.includes(permission)
    );
    if (hasPlatformAccess) {
      return true;
    }
  }

  // Check tenant permissions
  if (hasTenantRestrictions) {
    const hasTenantAccess = allowedTenantPermissions?.some(permission =>
      userTenantPermissions?.includes(permission)
    );
    if (hasTenantAccess) {
      return true;
    }
  }

  // If we have restrictions but no access, deny
  return false;
}
