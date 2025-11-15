import { z } from "zod";

// Channel schema (for group chats - will be used later)
const channelTypeEnum = z.enum(["direct", "group"]);

// Create Channel schema
export const createChatChannelSchema = z.object({
  name: z
    .string()
    .min(3, "Channel name must be at least 3 characters")
    .max(50, "Channel name should be under 50 characters"),
  description: z
    .string()
    .max(200, "Description should be under 200 characters")
    .optional()
    .or(z.literal("")),
  image: z.string().max(500).optional(),
  type: channelTypeEnum,
  channelUserIds: z
    .array(z.number())
    .min(1, "Select at least one member to invite"),
});

// Chat User schema
export const chatUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  status: z.enum(["online", "offline", "away"]).default("offline"),
  lastSeen: z.string().optional(),
});

export type ChatUser = z.infer<typeof chatUserSchema>;

// Message Reaction schema
export const messageReactionSchema = z.object({
  id: z.number(),
  messageId: z.number(),
  messageCreatedAt: z.string(),
  userId: z.number(),
  user: chatUserSchema,
  reaction: z.string(), // Emoji or string
  createdAt: z.string(),
});

export type MessageReaction = z.infer<typeof messageReactionSchema>;

// Chat Message schema (without replyToMessage to avoid circular reference)
const chatMessageSchemaBase = z.object({
  id: z.number(),
  messageCreatedAt: z.string(), // For composite key with backend
  channelId: z.number(),
  senderId: z.number(),
  sender: chatUserSchema,
  replyToMessageId: z.number().optional(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  isEdited: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reactions: z.array(messageReactionSchema).default([]),
  readBy: z.array(z.number()).default([]), // Array of user IDs who read
});

// Chat Message type
export type ChatMessage = z.infer<typeof chatMessageSchemaBase> & {
  replyToMessage?: ChatMessage; // Optional nested reply message
};

// Export schema for validation
export const chatMessageSchema = chatMessageSchemaBase.extend({
  replyToMessage: z.custom<ChatMessage>().optional(),
});

// Conversation schema (for direct chats)
export const conversationSchema = z.object({
  id: z.string(), // composite key: "dm_${userId1}_${userId2}"
  channelId: z.number(),
  participant: chatUserSchema,
  lastMessage: chatMessageSchema.optional(),
  unreadCount: z.number().default(0),
  updatedAt: z.string(),
});

export type Conversation = z.infer<typeof conversationSchema>;

export const chatChannelSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  type: channelTypeEnum.default("direct"),
  avatar: z.string().optional(),
  memberCount: z.number(),
  lastMessage: chatMessageSchema.optional(),
  unreadCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ChatChannel = z.infer<typeof chatChannelSchema>;

export const chatChannelListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  type: channelTypeEnum,
  image: z.string().nullable().optional(),
  createdBy: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  memberCount: z.number().int().nonnegative(),
  isCurrentUserAdmin: z.boolean().optional(),
});

export const chatChannelListResponseSchema = z.array(chatChannelListItemSchema);

export type ChatChannelListItem = z.infer<typeof chatChannelListItemSchema>;
export type ChatChannelListResponse = z.infer<
  typeof chatChannelListResponseSchema
>;

// Send Message schema
export const sendMessageSchema = z.object({
  channelId: z.number(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  replyToMessageId: z.number().optional(),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;

// Edit Message schema
export const editMessageSchema = z.object({
  messageId: z.number(),
  messageCreatedAt: z.string(),
  channelId: z.number(),
  text: z.string().min(1, "Message cannot be empty"),
});

export type EditMessageData = z.infer<typeof editMessageSchema>;

// Add Reaction schema
export const addReactionSchema = z.object({
  messageId: z.number(),
  messageCreatedAt: z.string(),
  channelId: z.number(),
  reaction: z.string().min(1, "Reaction is required"),
});

export type AddReactionData = z.infer<typeof addReactionSchema>;

export const chatChannelMemberSchema = z.object({
  userId: z.number(),
  isAdmin: z.boolean(),
});

export type CreateChatChannelSchema = z.infer<typeof createChatChannelSchema>;

export type ChatChannelMember = z.infer<typeof chatChannelMemberSchema>;
