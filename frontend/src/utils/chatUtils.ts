import type {
  ChatUser,
  ChatMessage,
  Conversation,
  ChatChannel,
} from "../schemas/chatSchema";
import { dummyChatUsers } from "./dummyChat";

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
