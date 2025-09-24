// Database transaction constants
export const dbTransactionKeys = {
  BEGIN: 'BEGIN',
  COMMIT: 'COMMIT',
  ROLLBACK: 'ROLLBACK',
};

export const lookupTypeKeys = {
  USER_ROLE: 'USER_ROLE',
  USER_STATUS: 'USER_STATUS',
  TENANT_STATUS: 'TENANT_STATUS',
  CHAT_TYPE: 'CHAT_TYPE',
};

export const userRoleKeys = {
  ANY: 'ANY',
  PLATFORM_SUPER_ADMIN: 'PLATFORM_SUPER_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  PLATFORM_USER: 'PLATFORM_USER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_MANAGER: 'TENANT_MANAGER',
  TENANT_USER: 'TENANT_USER',
} as const;

export type UserRoleKey = typeof userRoleKeys[keyof typeof userRoleKeys];
export const userRoleList: UserRoleKey[] = Object.values(userRoleKeys);

export const userStatusKeys = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
  ARCHIVED: 'ARCHIVED',
};

export const tenantStatusKeys = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
  ARCHIVED: 'ARCHIVED',
};

export const chatTypeKeys = {
  ONE_TO_ONE: 'ONE_TO_ONE',
  GROUP: 'GROUP',
};
