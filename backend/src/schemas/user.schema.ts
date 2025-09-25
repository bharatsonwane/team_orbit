import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';
import { baseLookupSchema } from './lookup.schema';
import {
  titleEnum,
  genderEnum,
  bloodGroupEnum,
  marriedStatusEnum,
} from '../utils/constants';

/**@description Base user schema with common fields */
export const baseUserSchema = z.object({
  id: z.number().int().optional(),
  title: titleEnum.optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  middleName: z.string().min(2).optional(),
  maidenName: z.string().min(2).optional(),
  gender: genderEnum.optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, should be YYYY-MM-DD')
    .optional(),
  bloodGroup: bloodGroupEnum.optional(),
  marriedStatus: marriedStatusEnum.optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10),
  password: z.string().optional(),
  hashPassword: z.string().optional(),
  lastPasswordChangedAt: z.string().optional(),
  bio: z.string().optional(),
  statusId: z.number().int().optional(),
  tenantId: z.number().int().optional(),
  roleIds: z.array(z.number().int()).optional(),
  roles: z.array(baseLookupSchema).optional(),
});
export type BaseUserSchema = z.infer<typeof baseUserSchema>;

/**@description user Login schema */
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
});
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
// oasRegistry.register('UserLogin', userLoginSchema);

/**@description user signup schema */
export const userSignupSchema = baseUserSchema
  .omit({
    id: true,
    roleIds: true,
    roles: true,
    statusId: true,
    tenantId: true,
  })
  .extend({
    password: z
      .string()
      .min(6, 'Password should be at least 6 characters long'),
  });

export type UserSignupSchema = z.infer<typeof userSignupSchema>;
// oasRegistry.register('UserSignup', userSignupSchema);

export const userSignupServiceSchema = baseUserSchema
  .extend({
    hashPassword: z.string(),
  })
  .omit({
    password: true, // Remove password field since we use hashPassword instead
  });
export type UserSignupServiceSchema = z.infer<typeof userSignupServiceSchema>;

/**@description User update password schema */
export const userUpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Password should be at least 6 characters long'),
});
export type UserUpdatePasswordSchema = z.infer<typeof userUpdatePasswordSchema>;

oasRegisterSchemas([
  { schemaName: 'BaseUserSchema', schema: baseUserSchema },
  { schemaName: 'UserLoginSchema', schema: userLoginSchema },
  { schemaName: 'UserSignupSchema', schema: userSignupSchema },
  { schemaName: 'UserUpdatePasswordSchema', schema: userUpdatePasswordSchema },
  { schemaName: 'UserSignupServiceSchema', schema: userSignupServiceSchema },
]);
