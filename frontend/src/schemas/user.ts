import { z } from "zod";
import { lookupItemSchema } from "./lookup";
import { userRoleName } from "@/utils/constants";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  tenantId: z.number().optional(),
  roles: z.array(
    lookupItemSchema.extend({
      name: userRoleName,
    })
  ),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Detailed user schema (for GET /api/user/:id)
export const detailedUserSchema = z.object({
  id: z.number(),
  title: z.string().nullable().optional(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string().nullable().optional(),
  maidenName: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  bloodGroup: z.string().nullable().optional(),
  marriedStatus: z.string().nullable().optional(),
  email: z.string().email(),
  phone: z.string(),
  bio: z.string().nullable().optional(),
  tenantId: z.number(),
  statusId: z.number(),
  statusName: z.string(),
  statusLabel: z.string(),
  roles: z.array(
    lookupItemSchema.extend({
      name: userRoleName,
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DetailedUser = z.infer<typeof detailedUserSchema>;

// Login credentials schema
export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

// Register data schema
export const registerDataSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterData = z.infer<typeof registerDataSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      user: userSchema,
      token: z.string(),
    })
    .nullable(),
  message: z.string().optional(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Create user form schema (accepts strings from form inputs)
export const createUserFormSchema = z.object({
  title: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (!val || val === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a title",
        });
      } else if (!["Mr", "Mrs", "Ms"].includes(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a valid title",
        });
      }
    }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleName: z.string().min(2).optional().or(z.literal("")),
  maidenName: z.string().min(2).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional(),
  marriedStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().optional().or(z.literal("")),
  tenantId: z.number().min(1, "Tenant ID is required"),
  statusId: z.string().min(1, "Status is required"), // Accept string from select
  roleIds: z.string().refine(val => {
    if (!val) return false;
    const roleIds = val
      .split(",")
      .map(Number)
      .filter(n => !isNaN(n));
    return roleIds.length > 0;
  }, "At least one role is required"),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema> & {
  title?: "Mr" | "Mrs" | "Ms" | "";
};

// Create user request schema (transforms form data for API)
export const createUserRequestSchema = createUserFormSchema.transform(data => {
  // Format dob as YYYY-MM-DD if it's a Date object or ISO string
  let formattedDob = data.dob;
  if (data.dob && data.dob !== "") {
    const date = new Date(data.dob);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      formattedDob = `${year}-${month}-${day}`;
    }
  }

  return {
    ...data,
    dob: formattedDob,
    statusId: Number(data.statusId), // Convert string to number for API
    roleIds: data.roleIds
      ? data.roleIds
          .split(",")
          .map(Number)
          .filter(n => !isNaN(n))
      : [], // Convert string to array of numbers
  };
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

// Update user form schema (for profile updates only - password, status, and roles handled separately)
export const updateUserFormSchema = z.object({
  title: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val && val !== "" && !["Mr", "Mrs", "Ms"].includes(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a valid title",
        });
      }
    }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  middleName: z.string().min(2).optional().or(z.literal("")),
  maidenName: z.string().min(2).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .optional()
    .or(z.literal("")),
  marriedStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed"])
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  bio: z.string().optional().or(z.literal("")),
});

export type UpdateUserFormData = z.infer<typeof updateUserFormSchema>;

// Update user request schema (transforms form data for API)
export const updateUserRequestSchema = updateUserFormSchema.transform(data => {
  // Format dob as YYYY-MM-DD if it's a Date object or ISO string
  let formattedDob = data.dob;
  if (data.dob && data.dob !== "") {
    const date = new Date(data.dob);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      formattedDob = `${year}-${month}-${day}`;
    }
  }

  return {
    ...data,
    dob: formattedDob,
  };
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

// Update user password schema
export const updateUserPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type UpdateUserPasswordFormData = z.infer<
  typeof updateUserPasswordSchema
>;

// Login response interface
export interface LoginResponse {
  user: User;
  token: string;
}
