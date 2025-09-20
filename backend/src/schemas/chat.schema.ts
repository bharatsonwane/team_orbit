import { z } from 'zod';

export const chatMessageSchema = z
  .object({
    senderId: z.string().uuid({ message: 'Invalid sender ID' }),
    receiverId: z.string().uuid({ message: 'Invalid receiver ID' }),
    message: z.string().min(1, 'Message is required'),
    mediaUrl: z.string().url().optional(),
  })
  .openapi('ChatMessage'); // ✅

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
