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
  USER_ROLE: "USER_ROLE",
  USER_STATUS: "USER_STATUS",
  TENANT_STATUS: "TENANT_STATUS",
  CHAT_TYPE: "CHAT_TYPE",
};
export const lookupTypeName = z.enum(Object.values(lookupTypeKeys));
export type LookupTypeName = z.infer<typeof lookupTypeName>;

export const tenantLookupTypeKeys = {
  CONTACT_TYPE: "CONTACT_TYPE",
  DEPARTMENT: "DEPARTMENT",
  DESIGNATION: "DESIGNATION",
};
export const tenantLookupTypeName = z.enum(Object.values(tenantLookupTypeKeys));
export type TenantLookupTypeName = z.infer<typeof tenantLookupTypeName>;

export const userRoleCategoryKeys = {
  PLATFORM: "PLATFORM",
  TENANT: "TENANT",
};

export const userRoleKeys = {
  ANY: "ANY",
  PLATFORM_SUPER_ADMIN: "PLATFORM_SUPER_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  PLATFORM_USER: "PLATFORM_USER",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_MANAGER: "TENANT_MANAGER",
  TENANT_USER: "TENANT_USER",
} as const;
export const userRoleName = z.enum(Object.values(userRoleKeys));
/*export type UserRoleName = (typeof userRoleKeys)[keyof typeof userRoleKeys];*/
export type UserRoleName = z.infer<typeof userRoleName>;

export const platformRoleList = [
  userRoleKeys.PLATFORM_SUPER_ADMIN,
  userRoleKeys.PLATFORM_ADMIN,
  userRoleKeys.PLATFORM_USER,
];

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
