import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatChannel } from "@/schemas/chatSchema";
import { formatConversationTime } from "@/utils/chatUtils";
import { Hash, Lock } from "lucide-react";

interface ChannelListItemProps {
  channel: ChatChannel;
  isSelected: boolean;
  onClick: () => void;
}

export function ChannelListItem({
  channel,
  isSelected,
  onClick,
}: ChannelListItemProps) {
  const { name, description, lastMessage, unreadCount, updatedAt, type } =
    channel;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "bg-accent border-r-2 border-primary"
      )}
    >
      {/* Avatar/Icon */}
      <Avatar className="w-12 h-12">
        {channel.avatar ? (
          <AvatarImage src={channel.avatar} alt={name} />
        ) : (
          <AvatarFallback className="bg-muted">
            {type === "private" ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Hash className="w-5 h-5 text-muted-foreground" />
            )}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">#{name}</h3>
            {type === "private" && (
              <Lock className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
          {lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatConversationTime(updatedAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {lastMessage ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                <span className="font-medium">
                  {lastMessage.senderUserId === 1
                    ? "You"
                    : lastMessage.sender.name}
                  :
                </span>{" "}
                {lastMessage.isDeleted ? (
                  <span className="italic">Message deleted</span>
                ) : (
                  lastMessage.text || "Media"
                )}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {description || "No messages yet"}
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
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {channel.memberCount}{" "}
            {channel.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </div>
    </div>
  );
}
