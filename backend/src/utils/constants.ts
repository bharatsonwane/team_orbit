import { z } from 'zod';

// Database transaction constants
export const dbTransactionKeys = {
  BEGIN: 'BEGIN',
  COMMIT: 'COMMIT',
  ROLLBACK: 'ROLLBACK',
};
export const dbTransactionName = z.enum(Object.values(dbTransactionKeys));
export type DbTransactionName = z.infer<typeof dbTransactionName>;

export const lookupTypeKeys = {
  USER_ROLE: 'USER_ROLE',
  USER_STATUS: 'USER_STATUS',
  TENANT_STATUS: 'TENANT_STATUS',
  CHAT_TYPE: 'CHAT_TYPE',
};
export const lookupTypeName = z.enum(Object.values(lookupTypeKeys));
export type LookupTypeName = z.infer<typeof lookupTypeName>;

export const userRoleKeys = {
  ANY: 'ANY',
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  PLATFORM_USER: 'PLATFORM_USER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MANAGER: 'TENANT_MANAGER',
  TENANT_USER: 'TENANT_USER',
} as const;
export const userRoleName = z.enum(Object.values(userRoleKeys));
/*export type UserRoleName = (typeof userRoleKeys)[keyof typeof userRoleKeys];*/
export type UserRoleName = z.infer<typeof userRoleName>;

export const userStatusKeys = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
  ARCHIVED: 'ARCHIVED',
};
export const userStatusName = z.enum(Object.values(userStatusKeys));
export type UserStatusName = z.infer<typeof userStatusName>;

export const tenantStatusKeys = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
  ARCHIVED: 'ARCHIVED',
};
export const tenantStatusName = z.enum(Object.values(tenantStatusKeys));
export type TenantStatusName = z.infer<typeof tenantStatusName>;

export const chatTypeKeys = {
  ONE_TO_ONE: 'ONE_TO_ONE',
  GROUP: 'GROUP',
};
export const chatTypeName = z.enum(Object.values(chatTypeKeys));
export type ChatTypeName = z.infer<typeof chatTypeName>;
