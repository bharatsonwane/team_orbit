import type {
  ChatMessage,
  ChatChannel,
  ChatChannelListItem,
  ChatUser,
} from "../schemas/chatSchema";
import type { User } from "../schemas/userSchema";

/**
 * Format message time
 * @param timestamp - The timestamp to format
 * @returns The formatted time
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  // Show date if older than a week
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Format conversation time
 * @param timestamp - The timestamp to format
 * @returns The formatted time
 */
export const formatConversationTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    // Today - show time
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Group messages by date
 * @param messages - The messages to group
 * @returns The grouped messages
 */
export const groupMessagesByDate = (
  messages: ChatMessage[]
): Record<string, ChatMessage[]> => {
  const grouped: Record<string, ChatMessage[]> = {};

  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const dateKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });

  return grouped;
};

/**
 * Map API channel list item to ChatChannel
 * @param channel - The API channel list item
 * @returns The mapped ChatChannel
 */
export const mapApiChannelToChatChannel = (
  channel: ChatChannelListItem
): ChatChannel => ({
  id: channel.id,
  name: channel.name,
  description: channel.description ?? undefined,
  type: channel.type,
  avatar:
    channel.image ||
    `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
      channel.name
    )}`,
  members: channel.members ?? [],
  lastMessage: undefined,
  unreadCount: 0,
  createdAt: channel.createdAt,
  updatedAt: channel.updatedAt,
});

/**
 * Build sender user from logged in user
 * @param loggedInUser - The logged in user object
 * @returns The ChatUser object
 */
export const buildSenderFromUser = (loggedInUser: User | null): ChatUser => {
  if (!loggedInUser) {
    return {
      id: 0,
      name: "Unknown",
      email: "",
      status: "online",
    };
  }

  const fullName = `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim();

  return {
    id: loggedInUser.id,
    name: fullName || loggedInUser.firstName || loggedInUser.email,
    email: loggedInUser.email,
    status: "online",
  };
};

/**
 * Get sender user from senderUserId
 * @param senderUserId - The sender user ID
 * @param loggedInUser - The logged in user object
 * @param chatUsers - Array of all chat users for lookups
 * @returns The ChatUser object
 */
export const getSenderUser = (
  senderUserId: number,
  loggedInUser: User | null,
  chatUsers: ChatUser[] = []
): ChatUser => {
  // If it's the current user, use buildSenderFromUser
  if (loggedInUser && senderUserId === loggedInUser.id) {
    return buildSenderFromUser(loggedInUser);
  }
  // Otherwise, look up from chatUsers
  const user = chatUsers.find(u => u.id === senderUserId);
  if (user) {
    return user;
  }
  // Final fallback (should not happen if chatUsers is properly populated)
  return {
    id: senderUserId,
    name: `User ${senderUserId}`,
    email: `user${senderUserId}@example.com`,
    status: "online",
  };
};
