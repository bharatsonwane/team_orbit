import { z } from "zod";

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  sortOrder: z.number(),
  isArchived: z.boolean(),
});
export type Role = z.infer<typeof roleSchema>;

export const permissionSchema = z.object({
  id: z.number(),
  roleId: z.number(),
  name: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  sortOrder: z.number(),
  isArchived: z.boolean(),
});
