import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";
import {
  titleEnum,
  genderEnum,
  bloodGroupEnum,
  marriedStatusEnum,
  userStatusName,
} from "@src/utils/constants";
import {
  permissionWithIdSchema,
  roleWithIdSchema,
} from "./roleAndPermission.schemaTypes";
import { tenantWithIdSchema } from "./tenant.schemaTypes";

/** @description ZOD SCHEMAS */
export const userAuthSchema = z.object({
  userId: z.number().int(),
  authEmail: z.string().email("Invalid email"),
  isPlatformUser: z.boolean().default(false),
  statusId: z.number().int(),
  userTenants: z.array(tenantWithIdSchema).optional(),
});

export const baseUserSchema = z.object({
  title: titleEnum.optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  middleName: z.string().min(2).optional(),
  maidenName: z.string().optional(),
  gender: genderEnum.optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, should be YYYY-MM-DD")
    .optional(),
  bloodGroup: bloodGroupEnum.optional(),
  marriedStatus: marriedStatusEnum.optional(),
  authEmail: z.string().email("Invalid email").optional(),
  phone: z.string().min(10).optional(),
  password: z.string().optional(),
  bio: z.string().optional(),
});

// lookupTypeWithIdSchema
export const userWithIdSchema = baseUserSchema.extend({
  id: z.number().int(),
  authEmail: z.string().optional(), // Email for authentication from user_auths
  hashPassword: z.string().optional(),
  isPlatformUser: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  lastPasswordChangedAt: z.string().optional(),
  statusId: z.number().int().optional(),
  statusName: userStatusName,
});

export const userWithTenantRolesAndPermissionsSchema = userWithIdSchema.extend({
  platformRoles: z.array(roleWithIdSchema).optional(),
  tenantRoles: z.array(roleWithIdSchema).optional(),
  platformPermissions: z.array(permissionWithIdSchema).optional(),
  tenantPermissions: z.array(permissionWithIdSchema).optional(),
});

export const userDataWithHashPasswordSchema = userWithIdSchema.extend({
  hashPassword: z.string(),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
});

export const userLoginResponseSchema = z.object({
  token: z.string(),
  userId: z.number().int(),
  email: z.string().email(),
});

export const userSignupSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password should be at least 6 characters long"),
});

export const userSignupServiceSchema = baseUserSchema
  .extend({
    hashPassword: z.string(),
    password: z.string().optional(),
    statusId: z.number().int().optional(),
    tenantId: z.number().int().optional(),
  })
  .omit({
    password: true, // Remove password field since we use hashPassword instead
  });

export const userUpdatePasswordSchema = z.object({
  password: z.string().min(6, "Password should be at least 6 characters long"),
});

export const createUserSchema = baseUserSchema.extend({
  tenantId: z.number().int().min(1, "Tenant ID is required"),
});

export const updateUserStatusAndRolesSchema = z.object({
  statusId: z.number().int(),
  roleIds: z.array(z.number().int()),
});

export const saveUserContactsSchema = z.object({
  personalEmail: z.string().email().optional(),
  personalPhone: z.string().optional(),
  alternativePhone: z.string().optional(),
  emergencyPhone1: z.string().optional(),
  emergencyPhone2: z.string().optional(),
});

export const saveUserJobDetailsSchema = z.object({
  hiringDate: z.string().optional(),
  joiningDate: z.string().optional(),
  probationPeriodMonths: z.number().int().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  userId: z.string().optional(),
  ctc: z.number().optional(),
  reportingManagerId: z.number().int().optional(),
});

export const updateUserAuthEmailSchema = z.object({
  authEmail: z.string().email("Invalid email format"),
});

export const getUsersCountQuerySchema = z.object({
  searchText: z.string().trim().optional(),
});

export const getUsersCountResponseSchema = z.object({
  count: z.number(),
});

/** @description SCHEMAS TYPES */
export type UserAuthSchema = z.infer<typeof userAuthSchema>;
export type BaseUserSchema = z.infer<typeof baseUserSchema>;
export type UserWithIdSchema = z.infer<typeof userWithIdSchema>;
export type UserWithTenantRolesAndPermissionsSchema = z.infer<
  typeof userWithTenantRolesAndPermissionsSchema
>;
export type UserDataWithHashPasswordSchema = z.infer<
  typeof userDataWithHashPasswordSchema
>;

export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type UserSignupSchema = z.infer<typeof userSignupSchema>;
export type UserSignupServiceSchema = z.infer<typeof userSignupServiceSchema>;
export type UserUpdatePasswordSchema = z.infer<typeof userUpdatePasswordSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserStatusAndRolesSchema = z.infer<
  typeof updateUserStatusAndRolesSchema
>;
export type SaveUserContactsSchema = z.infer<typeof saveUserContactsSchema>;
export type SaveUserJobDetailsSchema = z.infer<typeof saveUserJobDetailsSchema>;
export type UpdateUserAuthEmailSchema = z.infer<
  typeof updateUserAuthEmailSchema
>;
export type GetUsersCountQuerySchema = z.infer<typeof getUsersCountQuerySchema>;
export type GetUsersCountResponseSchema = z.infer<
  typeof getUsersCountResponseSchema
>;

/** @description OPENAPI SCHEMAS REGISTRATION */
oasRegisterSchemas([
  { schemaName: "UserAuthSchema", schema: userAuthSchema },
  { schemaName: "BaseUserSchema", schema: baseUserSchema },
  { schemaName: "UserLoginSchema", schema: userLoginSchema },
  { schemaName: "UserLoginResponseSchema", schema: userLoginResponseSchema },
  { schemaName: "UserSignupSchema", schema: userSignupSchema },
  { schemaName: "UserUpdatePasswordSchema", schema: userUpdatePasswordSchema },
  { schemaName: "UserSignupServiceSchema", schema: userSignupServiceSchema },
  { schemaName: "CreateUserSchema", schema: createUserSchema },
  {
    schemaName: "UpdateUserStatusAndRolesSchema",
    schema: updateUserStatusAndRolesSchema,
  },
  { schemaName: "SaveUserContactsSchema", schema: saveUserContactsSchema },
  { schemaName: "SaveUserJobDetailsSchema", schema: saveUserJobDetailsSchema },
  {
    schemaName: "UpdateUserAuthEmailSchema",
    schema: updateUserAuthEmailSchema,
  },
  {
    schemaName: "GetUsersCountQuerySchema",
    schema: getUsersCountQuerySchema,
  },
  {
    schemaName: "GetUsersCountResponseSchema",
    schema: getUsersCountResponseSchema,
  },
]);
