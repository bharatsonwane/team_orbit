import z from 'zod';

export const lookupSchema = z.object({
    id: z.number().int(),
    name: z.string().min(1).max(100),
    label: z.string().min(1).max(255),
    description: z.string().optional(),
    isSystem: z.boolean(),
    sortOrder: z.number().int().default(0),
    createdBy: z.number().int().optional(),
    lookupTypeId: z.number().int(),
  });
  

export type Lookup = z.infer<typeof lookupSchema>;