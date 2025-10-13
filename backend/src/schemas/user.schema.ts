import { z } from "zod";
import { oasRegisterSchemas } from "../openApiSpecification/openAPIDocumentGenerator";
import { baseLookupSchema } from "./lookup.schema";
import {
  titleEnum,
  genderEnum,
  bloodGroupEnum,
  marriedStatusEnum,
  userStatusName,
} from "../utils/constants";

/**
 * @description ZOD SCHEMAS
 */
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
  email: z.string().email("Invalid email"),
  phone: z.string().min(10),
  password: z.string().optional(),
  bio: z.string().optional(),
});

// lookupTypeWithTrackingSchema
export const userWithTrackingSchema = baseUserSchema.extend({
  id: z.number().int(),
  hashPassword: z.string().optional(),
  isPlatformUser: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  archivedAt: z.string().nullable().optional(),
  lastPasswordChangedAt: z.string().optional(),
  statusId: z.number().int().optional(),
  statusName: userStatusName,
  tenantId: z.number().int().optional(),
  roleIds: z.array(z.number().int()).optional(),
  roles: z.array(baseLookupSchema).optional(),
});

export const userDataWithHashPasswordSchema = userWithTrackingSchema.extend({
  hashPassword: z.string(),
});

export const userLoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string(),
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

/**
 * @description SCHEMAS TYPES
 */
export type BaseUserSchema = z.infer<typeof baseUserSchema>;
export type UserWithTrackingSchema = z.infer<typeof userWithTrackingSchema>;
export type UserDataWithHashPasswordSchema = z.infer<
  typeof userDataWithHashPasswordSchema
>;

export type UserLoginSchema = z.infer<typeof userLoginSchema>;
export type UserSignupSchema = z.infer<typeof userSignupSchema>;
export type UserSignupServiceSchema = z.infer<typeof userSignupServiceSchema>;
export type UserUpdatePasswordSchema = z.infer<typeof userUpdatePasswordSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;

/**
 * @description OPENAPI SCHEMAS REGISTRATION
 */
oasRegisterSchemas([
  { schemaName: "BaseUserSchema", schema: baseUserSchema },
  { schemaName: "UserLoginSchema", schema: userLoginSchema },
  { schemaName: "UserSignupSchema", schema: userSignupSchema },
  { schemaName: "UserUpdatePasswordSchema", schema: userUpdatePasswordSchema },
  { schemaName: "UserSignupServiceSchema", schema: userSignupServiceSchema },
  { schemaName: "CreateUserSchema", schema: createUserSchema },
]);
