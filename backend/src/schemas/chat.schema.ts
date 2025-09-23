import { z } from 'zod';
import { oasRegisterSchemas } from '../openApiSpecification/openAPIDocumentGenerator';

export const chatMessageSchema = z
  .object({
    id: z.number().int().optional(),
    text: z.string().min(1, 'Message is required'),
    media: z.string().url().optional(),
    reaction: z.record(z.string(), z.any()).optional(),
    channelId: z.number().int().optional(),
    senderUserId: z.number().int().optional(),
    deliveredTo: z.array(z.number().int()).optional(),
    readBy: z.array(z.number().int()).optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
  })
  .openapi('ChatMessage'); // ✅

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;

oasRegisterSchemas([
  { schemaName: 'ChatMessageSchema', schema: chatMessageSchema },
]);
