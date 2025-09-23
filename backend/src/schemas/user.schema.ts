import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

/**@description Base user schema with common fields */
export const baseUserSchema = z.object({
  id: z.number().int().optional(),
  title: z.enum(['Mr', 'Mrs', 'Ms']).optional(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  middleName: z.string().min(2).optional(),
  maidenName: z.string().min(2).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, should be YYYY-MM-DD')
    .optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  marriedStatus: z
    .enum(['Single', 'Married', 'Divorced', 'Widowed'])
    .optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10),
  password: z.string().optional(),
  hashPassword: z.string().optional(),
  lastPasswordChangedAt: z.string().optional(),
  bio: z.string().optional(),
  statusId: z.number().int().optional(),
  tenantId: z.number().int().optional(),
  userRoles: z.array(z.number().int()).optional(),
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
export const userSignupSchema = baseUserSchema.extend({
  password: z.string().min(6, 'Password should be at least 6 characters long'),
});

export type UserSignupSchema = z.infer<typeof userSignupSchema>;
// oasRegistry.register('UserSignup', userSignupSchema);

export const userSignupServiceSchema = userSignupSchema
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
