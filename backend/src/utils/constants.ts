import { z } from "zod";

export const bloodGroupEnum = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);
export type BloodGroupEnum = z.infer<typeof bloodGroupEnum>;

export const marriedStatusEnum = z.enum([
  "Single",
  "Married",
  "Divorced",
  "Widowed",
]);
export type MarriedStatusEnum = z.infer<typeof marriedStatusEnum>;

export const titleEnum = z.enum(["Mr", "Mrs", "Ms"]);
export type TitleEnum = z.infer<typeof titleEnum>;

export const genderEnum = z.enum(["Male", "Female", "Other"]);
export type GenderEnum = z.infer<typeof genderEnum>;

export const dbTransactionKeys = {
  BEGIN: "BEGIN",
  COMMIT: "COMMIT",
  ROLLBACK: "ROLLBACK",
};
export const dbTransactionName = z.enum(Object.values(dbTransactionKeys));
export type DbTransactionName = z.infer<typeof dbTransactionName>;

export const lookupTypeKeys = {
  USER_STATUS: "USER_STATUS",
  TENANT_STATUS: "TENANT_STATUS",
  CHAT_TYPE: "CHAT_TYPE",
};
export const lookupTypeName = z.enum(Object.values(lookupTypeKeys));
export type LookupTypeName = z.infer<typeof lookupTypeName>;

export const userStatusKeys = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  ARCHIVED: "ARCHIVED",
};
export const userStatusName = z.enum(Object.values(userStatusKeys));
export type UserStatusName = z.infer<typeof userStatusName>;

export const tenantStatusKeys = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  DEACTIVATED: "DEACTIVATED",
  ARCHIVED: "ARCHIVED",
};
export const tenantStatusName = z.enum(Object.values(tenantStatusKeys));
export type TenantStatusName = z.infer<typeof tenantStatusName>;

export const chatTypeKeys = {
  ONE_TO_ONE: "ONE_TO_ONE",
  GROUP: "GROUP",
};
export const chatTypeName = z.enum(Object.values(chatTypeKeys));
export type ChatTypeName = z.infer<typeof chatTypeName>;

export const platformRoleKeys = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;
export const platformRoleName = z.enum(Object.values(platformRoleKeys));
/*export type PlatformRoleName = (typeof platformRoleKeys)[keyof typeof platformRoleKeys];*/
export type PlatformRoleName = z.infer<typeof platformRoleName>;

export const tenantRoleKeys = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
} as const;
export const tenantRoleName = z.enum(Object.values(tenantRoleKeys));
/*export type TenantRoleName = (typeof tenantRoleKeys)[keyof typeof tenantRoleKeys];*/
export type TenantRoleName = z.infer<typeof tenantRoleName>;

// Platform-level permissions (stored in main schema)
export const platformPermissionKeys = {
  // User permissions
  USER_CREATE: "USER_CREATE",
  USER_READ: "USER_READ",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",
  // Tenant permissions
  TENANT_CREATE: "TENANT_CREATE",
  TENANT_READ: "TENANT_READ",
  TENANT_UPDATE: "TENANT_UPDATE",
  TENANT_DELETE: "TENANT_DELETE",
} as const;

// Tenant-level permissions (stored in tenant schema)
export const tenantPermissionKeys = {
  // Project permissions
  PROJECT_CREATE: "PROJECT_CREATE",
  PROJECT_READ: "PROJECT_READ",
  PROJECT_UPDATE: "PROJECT_UPDATE",
  PROJECT_DELETE: "PROJECT_DELETE",
} as const;

// Platform permission name enum and type
export const platformPermissionName = z.enum(
  Object.values(platformPermissionKeys)
);
export type PlatformPermissionName = z.infer<typeof platformPermissionName>;

// Tenant permission name enum and type
export const tenantPermissionName = z.enum(Object.values(tenantPermissionKeys));
export type TenantPermissionName = z.infer<typeof tenantPermissionName>;
