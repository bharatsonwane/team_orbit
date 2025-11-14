import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/schemas/chat";
import { formatConversationTime } from "@/utils/chatUtils";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationListItem({
  conversation,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  const { participant, lastMessage, unreadCount, updatedAt } = conversation;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "bg-accent border-r-2 border-primary"
      )}
    >
      {/* Avatar */}
      <Avatar className="w-12 h-12">
        <AvatarImage src={participant.avatar} alt={participant.name} />
        <AvatarFallback>
          {participant.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{participant.name}</h3>
          {lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatConversationTime(updatedAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">
              {lastMessage.isDeleted ? (
                <span className="italic">Message deleted</span>
              ) : (
                lastMessage.text || "Media"
              )}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No messages yet
            </p>
          )}
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
