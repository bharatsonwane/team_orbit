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
  authEmail: z.string(), // Email for authentication/login
  email: z.string().email().optional(), // From user_contacts (for backward compatibility)
  phone: z.string().optional(), // From user_contacts (for backward compatibility)
  bio: z.string().nullable().optional(),
  isPlatformUser: z.boolean().default(false),
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

// Create user form schema (accepts strings from form inputs - profile only, password/status/roles set separately)
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
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .optional()
    .or(z.literal("")), // Optional, will be stored in user_contacts
  bio: z.string().optional().or(z.literal("")),
  tenantId: z.number().min(1, "Tenant ID is required"),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

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
  email: z.string().email("Invalid email").optional().or(z.literal("")), // From user_contacts
  phone: z
    .string()
    .min(10, "Phone must be at least 10 characters")
    .optional()
    .or(z.literal("")), // From user_contacts
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

// ==================== WIZARD SCHEMAS ====================

// Step 1: Personal Information Schema
export const userPersonalInformationSchema = z.object({
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
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  dob: z.string().optional().or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""])
    .optional(),
  marriedStatus: z
    .enum(["Single", "Married", "Divorced", "Widowed", ""])
    .optional(),
  bio: z.string().optional().or(z.literal("")),
  tenantId: z.number().optional(),
});

export type UserPersonalInformationFormData = z.infer<
  typeof userPersonalInformationSchema
>;

// Step 2: Contact Information Schema
export const userContactInformationSchema = z.object({
  personalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  personalPhone: z.string().optional().or(z.literal("")),
  alternativePhone: z.string().optional().or(z.literal("")),
  emergencyPhone1: z.string().optional().or(z.literal("")),
  emergencyPhone2: z.string().optional().or(z.literal("")),
});

export type UserContactInformationFormData = z.infer<
  typeof userContactInformationSchema
>;

// Step 3: Job Details Schema
export const userJobDetailsSchema = z.object({
  hiringDate: z.string().optional().or(z.literal("")),
  joiningDate: z.string().optional().or(z.literal("")),
  probationPeriodMonths: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  userId: z.string().optional().or(z.literal("")),
  ctc: z.string().optional().or(z.literal("")),
  reportingManagerId: z.string().optional().or(z.literal("")),
});

export type UserJobDetailsFormData = z.infer<typeof userJobDetailsSchema>;

// Combined Wizard Schema (nested structure)
export const userWizardSchema = z.object({
  personal: userPersonalInformationSchema,
  contacts: userContactInformationSchema,
  job: userJobDetailsSchema,
});

export type UserWizardFormData = z.infer<typeof userWizardSchema>;

// Stricter schema for create mode
export const createUserWizardSchema = userWizardSchema.extend({
  contacts: userContactInformationSchema.extend({
    personalEmail: z.string().email("Invalid email"), // Required for create
  }),
  personal: userPersonalInformationSchema.extend({
    tenantId: z.number().min(1, "Tenant ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .refine(val => ["Mr", "Mrs", "Ms"].includes(val), {
        message: "Please select a valid title",
      }),
  }),
});

export type CreateUserWizardFormData = z.infer<typeof createUserWizardSchema>;
