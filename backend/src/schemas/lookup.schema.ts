import { z } from 'zod';

const lookupSchema = z.object({
  id: z.number(),
  label: z.string(),
});

export type LookupSchema = z.infer<typeof lookupSchema>;

export const lookupTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  lookups: z.array(lookupSchema),
});
export type LookupTypeSchema = z.infer<typeof lookupTypeSchema>;

export const lookupListSchema = z.array(lookupTypeSchema);
export type LookupListSchema = z.infer<typeof lookupListSchema>;

export interface LookupType {
  lookupType: string;
  lookups: { label: string }[];
}

export interface Lookup {
  id: number;
  label: string;
  lookupTypeId: number;
  lookupTypeName: string;
}
