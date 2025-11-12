import { z } from "zod";

// Individual lookup item schema
export const lookupItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  category: z.string().nullable(),
  description: z.string().nullable(),
  isSystem: z.boolean(),
  sortOrder: z.number(),
  createdBy: z.number().nullable(),
  lookupTypeId: z.number(),
  isArchived: z.boolean(),
});

// Lookup type schema (contains array of lookups)
export const lookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  isSystem: z.boolean(),
  createdAt: z.string(),
  lookups: z.array(lookupItemSchema),
});

// Lookup list response schema (array of lookup types)
export const lookupListResponseSchema = z.array(lookupTypeSchema);

// TypeScript types
export type LookupItem = z.infer<typeof lookupItemSchema>;
export type LookupType = z.infer<typeof lookupTypeSchema>;
export type LookupListResponse = z.infer<typeof lookupListResponseSchema>;
