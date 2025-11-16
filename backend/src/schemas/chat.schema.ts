import { z } from "zod";
import { oasRegisterSchemas } from "@src/openApiSpecification/openAPIDocumentGenerator";

/** @description ZOD SCHEMAS */
export const createChatChannelSchema = z.object({
  name: z
    .string()
    .min(3, "Channel name must be at least 3 characters")
    .max(60, "Channel name should be under 60 characters"),
  description: z
    .string()
    .max(300, "Description should be under 300 characters")
    .optional(),
  image: z.string().url().max(500).optional(),
  type: z.enum(["direct", "group"]),
  channelUserIds: z
    .array(z.number().int())
    .min(1, "Select at least one member to invite"),
});

export const chatChannelSchema = createChatChannelSchema.extend({
  id: z.number().int(),
  createdBy: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const chatChannelListQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "Search must be at least 1 character")
    .max(100, "Search should be under 100 characters")
    .optional(),
  type: z.enum(["direct", "group"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const chatChannelListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: z.enum(["direct", "group"]),
  description: z.string().nullable(),
  image: z.string().nullable(),
  createdBy: z.number().int().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  memberCount: z.number().int().nonnegative(),
  isCurrentUserAdmin: z.boolean(),
});

export const chatChannelListResponseSchema = z.array(chatChannelListItemSchema);

export const sendChatMessageSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Message must contain at least 1 character")
      .max(5000, "Message is too long")
      .optional(),
    mediaUrl: z.string().url().max(1000).optional(),
    replyToMessageId: z.number().int().positive().optional(),
  })
  .refine(data => data.text || data.mediaUrl, {
    message: "Either text or mediaUrl is required",
    path: ["text"],
  });

export const chatMessageSchema = z.object({
  id: z.number().int().optional(),
  text: z.string().min(1, "Message is required").optional(),
  mediaUrl: z.string().url().optional(),
  replyToMessageId: z.number().int().optional(),
  reaction: z.record(z.string(), z.any()).optional(),
  channelId: z.number().int().optional(),
  senderUserId: z.number().int().optional(),
  deliveredTo: z.array(z.number().int()).optional(),
  readBy: z.array(z.number().int()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const chatMessageListQuerySchema = z.object({
  before: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const chatMessageListResponseSchema = z.array(chatMessageSchema);

/** @description SCHEMAS TYPES */
export type CreateChatChannelSchema = z.infer<typeof createChatChannelSchema>;
export type ChatChannelSchema = z.infer<typeof chatChannelSchema>;
export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
export type ChatChannelListQuerySchema = z.infer<
  typeof chatChannelListQuerySchema
>;
export type ChatChannelListItemSchema = z.infer<
  typeof chatChannelListItemSchema
>;
export type SendChatMessageSchema = z.infer<typeof sendChatMessageSchema>;
export type ChatMessageListQuerySchema = z.infer<
  typeof chatMessageListQuerySchema
>;

/** @description OPENAPI SCHEMAS REGISTRATION */
oasRegisterSchemas([
  { schemaName: "CreateChatChannelSchema", schema: createChatChannelSchema },
  { schemaName: "ChatChannelSchema", schema: chatChannelSchema },
  { schemaName: "ChatMessageSchema", schema: chatMessageSchema },
  { schemaName: "SendChatMessageSchema", schema: sendChatMessageSchema },
  {
    schemaName: "ChatChannelListQuerySchema",
    schema: chatChannelListQuerySchema,
  },
  {
    schemaName: "ChatChannelListItemSchema",
    schema: chatChannelListItemSchema,
  },
  {
    schemaName: "ChatChannelListResponseSchema",
    schema: chatChannelListResponseSchema,
  },
  {
    schemaName: "ChatMessageListQuerySchema",
    schema: chatMessageListQuerySchema,
  },
  {
    schemaName: "ChatMessageListResponseSchema",
    schema: chatMessageListResponseSchema,
  },
]);
