import { useMemo } from "react";
import type { ChatUser } from "@/schemas/chatSchema";

interface TypingIndicatorProps {
  typingUsersData: { userId: number; typedAt: string }[];
  chatUsers: ChatUser[];
}

export function TypingIndicator({
  typingUsersData,
  chatUsers,
}: TypingIndicatorProps) {
  // Filter active typing users (within last 20 seconds) and get their names
  const activeTypingUsers = useMemo(() => {
    const now = Date.now();
    const timeoutThreshold = 20 * 1000; // 20 seconds

    return typingUsersData
      .filter(typingUser => {
        const typedAtTime = new Date(typingUser.typedAt).getTime();
        return now - typedAtTime < timeoutThreshold;
      })
      .map(typingUser => {
        const user = chatUsers.find(u => u.id === typingUser.userId);
        return user ? user.name : `User ${typingUser.userId}`;
      })
      .filter(Boolean);
  }, [typingUsersData, chatUsers]);

  if (activeTypingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex gap-1 px-3 py-2 bg-muted rounded-lg">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        <div
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <div
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {activeTypingUsers.length === 1
          ? `${activeTypingUsers[0]} is typing...`
          : activeTypingUsers.length === 2
            ? `${activeTypingUsers[0]} and ${activeTypingUsers[1]} are typing...`
            : `${activeTypingUsers[0]} and ${activeTypingUsers.length - 1} others are typing...`}
      </span>
    </div>
  );
}
