import { z } from 'zod';
import { docRegistry } from '../openApiSpecification/openAPIDocumentGenerator';

/**@description user Login schema */
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
});
export type UserLoginSchema = z.infer<typeof userLoginSchema>;
docRegistry.register('UserLogin', userLoginSchema);

/**@description user signup schema */
export const userSignupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password should be at least 6 characters long'),
  phone: z.string().min(10),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});
export type UserSignupSchema = z.infer<typeof userSignupSchema>;
docRegistry.register('UserSignup', userSignupSchema);

export const userUpdatePasswordSchema = z.object({
  password: z.string().min(6, 'Password should be at least 6 characters long'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10),
});
export type UserUpdatePasswordSchema = z.infer<typeof userUpdatePasswordSchema>;
docRegistry.register('UserUpdatePassword', userUpdatePasswordSchema);

/**@description User schema */
export const userSchema = z.object({
  id: z.number().int().optional(),
  title: z.enum(['Mr', 'Mrs', 'Ms']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleName: z.string().optional(),
  maidenName: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, should be YYYY-MM-DD'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  marriedStatus: z.enum(['Single', 'Married']),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().min(10),
  password: z
    .string()
    .min(6, 'Password should be at least 6 characters long')
    .optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  userStatusLookupId: z.number().int().optional(),
  userRoleLookupId: z.number().int().optional(),
});
export type UserSchema = z.infer<typeof userSchema>;
docRegistry.register('User', userSchema);

/**@description User Update schema */
export const userUpdateSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms']).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  maidenName: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, should be YYYY-MM-DD')
    .optional(),
  bloodGroup: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  marriedStatus: z.enum(['Single', 'Married']).optional(),
  bio: z.string().optional(),
});
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
docRegistry.register('UserUpdate', userUpdateSchema);

export interface AppUser {
  id?: number | null;
  title: string;
  firstName: string;
  lastName: string;
  middleName: string;
  maidenName: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  marriedStatus: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
  userStatus: string;
  tenantId: number;
  userRoles: number[];
}
