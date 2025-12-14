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
  profilePictureUrl: z.string().optional(),
  status: z.enum(["online", "offline", "away"]).default("offline"),
  lastSeen: z.string().optional(),
});

export type ChatUser = z.infer<typeof chatUserSchema>;

// Message Reaction schema (for frontend use)
export const messageReactionSchema = z.object({
  id: z.number(),
  messageId: z.number().optional(), // Optional for API response
  messageCreatedAt: z.string().optional(), // Optional for API response
  userId: z.number(),
  reaction: z.string(), // Emoji or string
  createdAt: z.string(),
});

export type MessageReaction = z.infer<typeof messageReactionSchema>;

// Message Receipt schema
export const messageReceiptSchema = z.object({
  id: z.number(),
  userId: z.number(),
  deliveredAt: z.string().nullable(),
  readAt: z.string().nullable(),
});

export type MessageReceipt = z.infer<typeof messageReceiptSchema>;

// Chat Message schema (without replyToMessage to avoid circular reference)
const chatMessageSchemaBase = z.object({
  id: z.number(),
  chatChannelId: z.number(),
  senderUserId: z.number(),
  replyToMessageId: z.number().optional().nullable(),
  text: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  isEdited: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  archivedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reactions: z.array(messageReactionSchema).default([]),
  receipt: z.array(messageReceiptSchema).default([]), // Array of receipt objects
  senderSocketId: z.string().optional(), // Socket ID of the sender device
  tempId: z.number().optional(), // Temporary ID for matching sent messages
});

// Chat Message type
export type ChatMessage = z.infer<typeof chatMessageSchemaBase> & {
  replyToMessage?: ChatMessage; // Optional nested reply message
};

// Export schema for validation
export const chatMessageSchema = chatMessageSchemaBase.extend({
  replyToMessage: z.custom<ChatMessage>().optional(),
});

// API payload types
export type SendChannelMessagePayload = {
  chatChannelId: number;
  text?: string;
  mediaUrl?: string;
  replyToMessageId?: number;
  tempId?: number; // Temporary ID for matching sent messages
  socketId?: string; // Socket ID of the sending device
};

export type FetchChannelMessagesParam = {
  chatChannelId: number;
  before?: string;
  limit?: number;
};

// Per-channel UI state
export type ChannelState = {
  chatChannelId: number;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  typingUsers: { userId: number; typedAt: string }[];
  lastReadAt?: string;
  // channel metadata for sidebar/UX
  name?: string;
  description?: string;
  type?: "direct" | "group";
  image?: string;
  members?: number[]; // Array of user IDs
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ChannelStateMap = Map<number, ChannelState>;

// Conversation schema (for direct chats)
export const conversationSchema = z.object({
  id: z.string(), // composite key: "dm_${userId1}_${userId2}"
  chatChannelId: z.number(),
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
  members: z.array(z.number()), // Array of user IDs
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
  members: z.array(z.number()), // Array of user IDs
  isCurrentUserAdmin: z.boolean().optional(),
});

export const chatChannelListResponseSchema = z.array(chatChannelListItemSchema);

export type ChatChannelListItem = z.infer<typeof chatChannelListItemSchema>;
export type ChatChannelListResponse = z.infer<
  typeof chatChannelListResponseSchema
>;

// Send Message schema
export const sendMessageSchema = z.object({
  chatChannelId: z.number(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  replyToMessageId: z.number().optional(),
  tempId: z.number().optional(), // Temporary ID for matching sent messages
  socketId: z.string().optional(), // Socket ID of the sending device
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;

// Edit Message schema
export const editMessageSchema = z.object({
  messageId: z.number(),
  chatChannelId: z.number(),
  text: z.string().min(1, "Message cannot be empty"),
});

export type EditMessageData = z.infer<typeof editMessageSchema>;

// Add Reaction schema
export const addReactionSchema = z.object({
  messageId: z.number(),
  chatChannelId: z.number(),
  reaction: z.string().min(1, "Reaction is required"),
  socketId: z.string().optional(),
});

export type AddReactionData = z.infer<typeof addReactionSchema>;

// Archive Message schema
export const archiveMessageSchema = z.object({
  messageId: z.number(),
  chatChannelId: z.number(),
  socketConnectionId: z.string().optional(),
});

export type ArchiveMessageData = z.infer<typeof archiveMessageSchema>;

export const chatChannelMemberSchema = z.object({
  userId: z.number(),
  isAdmin: z.boolean(),
});

export type CreateChatChannelSchema = z.infer<typeof createChatChannelSchema>;

export type ChatChannelMember = z.infer<typeof chatChannelMemberSchema>;
