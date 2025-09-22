import { z } from 'zod';
import {
  oasRegisterSchemas,
  oasRegistry,
} from '../openApiSpecification/openAPIDocumentGenerator';

/**@description Base user schema with common fields */
export const baseUserSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms']).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().min(1).optional(),
  maidenName: z.string().min(1).optional(),
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

  // Contact Information
  email: z.string().email('Invalid email'),
  phone: z.string().min(10),

  // Additional Information
  bio: z.string().optional(),
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
  .extend({
    password: z
      .string()
      .min(6, 'Password should be at least 6 characters long'),
  })
  .merge(
    z.object({
      // Override firstName and lastName to have stricter validation for signup
      firstName: z.string().min(2),
      lastName: z.string().min(2),
    })
  );
export type UserSignupSchema = z.infer<typeof userSignupSchema>;
// oasRegistry.register('UserSignup', userSignupSchema);

export const userSignupServiceSchema = userSignupSchema
  .extend({
    hashPassword: z.string(),
    statusId: z.number().int().optional(),
    tenantId: z.number().int().optional(),
  })
  .omit({
    password: true, // Remove password field since we use hashPassword instead
  });
export type UserSignupServiceSchema = z.infer<typeof userSignupServiceSchema>;

/**@description User update password schema */
export const userUpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Password should be at least 6 characters long'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10),
});
export type UserUpdatePasswordSchema = z.infer<typeof userUpdatePasswordSchema>;

/**@description Full user schema with system fields */
export const userSchema = baseUserSchema
  .extend({
    id: z.number().int().optional(),
    password: z
      .string()
      .min(6, 'Password should be at least 6 characters long')
      .optional(),
    profilePicture: z.string().optional(),
    statusId: z.number().int().optional(),
  })
  .merge(
    z.object({
      // Override required fields to be optional for full user schema
      email: z.string().email('Invalid email').optional(),
      // Override marriedStatus to match database constraint (only Single/Married in userSchema)
      marriedStatus: z.enum(['Single', 'Married']).optional(),
      // Make title and gender required in full user schema
      title: z.enum(['Mr', 'Mrs', 'Ms']),
      gender: z.enum(['Male', 'Female', 'Other']),
      dob: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          'Invalid date format, should be YYYY-MM-DD'
        ),
      bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    })
  );
export type UserSchema = z.infer<typeof userSchema>;

/**@description User update schema - all fields optional */
export const userUpdateSchema = baseUserSchema.partial().merge(
  z.object({
    // Override marriedStatus to match database constraint (only Single/Married in update)
    marriedStatus: z.enum(['Single', 'Married']).optional(),
  })
);
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

/**@description User data schema for internal operations */
export const userDataSchema = baseUserSchema
  .extend({
    id: z.number().int().optional(),
    password: z.string().optional(),
    hashPassword: z.string().optional(),
    profilePicture: z.string().optional(),
    statusId: z.number().int().optional(),
    tenantId: z.number().int().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .merge(
    z.object({
      // Make all fields optional for UserData
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email('Invalid email').optional(),
      phone: z.string().min(10).optional(),
      dob: z.string().optional(),
    })
  );
export type UserDataSchema = z.infer<typeof userDataSchema>;

/**@description User profile schema for API responses */
export const userProfileSchema = baseUserSchema
  .extend({
    id: z.number().int(),
    profilePicture: z.string().nullable(),
    statusId: z.number().int(),
    statusName: z.string().nullable(),
    statusLabel: z.string().nullable(),
    tenantId: z.number().int().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    password: z.string().optional(), // Optional for when includePassword is false
    userRoles: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          label: z.string(),
          lookupTypeId: z.number().int(),
        })
      )
      .optional(),
  })
  .merge(
    z.object({
      // Override baseUserSchema fields to match database nullability
      title: z.enum(['Mr', 'Mrs', 'Ms']).nullable(),
      middleName: z.string().nullable(),
      maidenName: z.string().nullable(),
      gender: z.enum(['Male', 'Female', 'Other']).nullable(),
      dob: z.string(), // Required in profile
      bloodGroup: z
        .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .nullable(),
      marriedStatus: z
        .enum(['Single', 'Married', 'Divorced', 'Widowed'])
        .nullable(),
      bio: z.string().nullable(),
    })
  );
export type UserProfileSchema = z.infer<typeof userProfileSchema>;

/**@description Application user interface */
export interface AppUser {
  id?: number | null;
  title: 'Mr' | 'Mrs' | 'Ms';
  firstName: string;
  lastName: string;
  middleName: string;
  maidenName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  marriedStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  email: string;
  phone: string;
  password: string;
  bio: string;
  statusId: number;
  tenantId: number;
  userRoles: number[];
}

oasRegisterSchemas([
  { schemaName: 'BaseUserSchema', schema: baseUserSchema },
  { schemaName: 'UserLoginSchema', schema: userLoginSchema },
  { schemaName: 'UserSignupSchema', schema: userSignupSchema },
  { schemaName: 'UserUpdatePasswordSchema', schema: userUpdatePasswordSchema },
  { schemaName: 'UserSchema', schema: userSchema },
  { schemaName: 'UserSignupServiceSchema', schema: userSignupServiceSchema },
  { schemaName: 'UserUpdateSchema', schema: userUpdateSchema },
  { schemaName: 'UserDataSchema', schema: userDataSchema },
  { schemaName: 'UserProfileSchema', schema: userProfileSchema },
]);
