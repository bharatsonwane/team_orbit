/**
 * Socket.IO Event Names
 * Centralized constants for all socket event names to avoid typos and ensure consistency
 */

export const chatSocketEvents = {
  // Client -> Server events (listened by server)
  CHAT_JOIN_USER_CHAT_CHANNELS: "chat:joinUserChatChannels",
  CHAT_JOIN_CHANNEL: "chat:joinChannel",
  CHAT_LEAVE_CHANNEL: "chat:leaveChannel",
  CHAT_SEND: "chat:send",
  CHAT_TYPING: "chat:typing",

  // Server -> Client events (emitted by server)
  CHAT_NEW_MESSAGE: "chat:new_message",
  CHAT_TYPING_UPDATE: "chat:typing:update",
  CHAT_CHANNEL_UPDATED: "chat:channel_updated",
  CHAT_ERROR: "error",
} as const;

export const notificationSocketEvents = {
  // Client -> Server events (listened by server)
  NOTIFICATION_READ: "notification:read",

  // Server -> Client events (emitted by server)
  NOTIFICATION_READ_UPDATE: "notification:read:update",
  NOTIFICATION_NEW: "notification:new",
} as const;

export const dataRefreshSocketEvents = {
  // Client -> Server events (listened by server)
  REFRESH_REQUEST: "refresh:request",

  // Server -> Client events (emitted by server)
  REFRESH_UPDATE: "refresh:update",
  USER_CREATED: "user:created",
} as const;
