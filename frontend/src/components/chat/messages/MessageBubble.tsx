import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/utils/chatUtils";
import type { ChatMessage } from "@/schemaTypes/chatSchemaTypes";
import { useChat } from "@/contexts/ChatContextProvider";
import { getSenderUser } from "@/utils/chatUtils";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { MessageReactions } from "./MessageReactions";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  showAvatar = true,
}: MessageBubbleProps) {
  const {
    handleEditMessage,
    handleArchiveMessage,
    handleReaction,

    chatUsers,
  } = useChat();
  const { loggedInUser } = useAuthService();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [showReactions, setShowReactions] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sender = getSenderUser(message.senderUserId, loggedInUser!, chatUsers);
  const isCurrentUser =
    loggedInUser && message.senderUserId === loggedInUser.id;
  const isArchived = message.isArchived;

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      handleEditMessage({
        messageId: message.id,
        chatChannelId: message.chatChannelId,
        text: editText.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleReactionClick = async (reaction: string) => {
    await handleReaction({
      messageId: message.id,
      chatChannelId: message.chatChannelId,
      reaction,
    });
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 200); // 200ms delay
  };

  return (
    <div
      className={cn(
        "flex gap-2 group",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={sender.profilePictureUrl} alt={sender.name} />
          <AvatarFallback className="text-xs">
            {sender.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[70%] relative",
          !showAvatar && (isCurrentUser ? "ml-10" : "mr-10")
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hover Reactions Popup - Above entire message container */}
        {!isArchived && showReactions && (
          <div
            className={cn(
              "absolute -top-10 bg-background border border-border rounded-lg shadow-xl px-2 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200",
              isCurrentUser ? "right-0" : "left-0"
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <MessageReactions
              reactions={[]}
              onReactionClick={handleReactionClick}
              showSmiley={false}
              showCommonReactions={true}
            />
          </div>
        )}

        {/* Sender Name */}
        {showAvatar && (
          <span className="text-xs font-medium px-2">
            {isCurrentUser ? "You" : sender.name}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-lg px-3 py-2 relative",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            isArchived && "opacity-60 italic"
          )}
        >
          {/* Reply Preview */}
          {message.replyToMessage && (
            <div className="mb-2 pb-2 border-b border-border/50">
              <div className="text-xs font-medium opacity-75">
                {
                  getSenderUser(
                    message.replyToMessage.senderUserId,
                    loggedInUser!,
                    chatUsers
                  ).name
                }
              </div>
              <div className="text-xs opacity-60 truncate">
                {message.replyToMessage.text || "Media"}
              </div>
            </div>
          )}

          {/* Message Content */}
          {isArchived ? (
            <span className="text-xs">Message deleted</span>
          ) : isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={e => {
                if (e.key === "Enter") handleEdit();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditText(message.text || "");
                }
              }}
              autoFocus
              className="w-full bg-transparent border-none outline-none text-sm"
            />
          ) : (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.text}
              {message.isEdited && (
                <span className="text-xs opacity-60 ml-1">(edited)</span>
              )}
            </div>
          )}

          {/* Media */}
          {message.mediaUrl && (
            <img
              src={message.mediaUrl}
              alt="Message media"
              className="mt-2 rounded-md max-w-full h-auto"
            />
          )}

          {/* Actions Menu */}
          {!isArchived && isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                    isCurrentUser &&
                      "text-primary-foreground hover:bg-primary-foreground/20"
                  )}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleArchiveMessage({
                      messageId: message.id,
                      chatChannelId: message.chatChannelId,
                    });
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Reactions - Show existing reactions outside bubble */}
        {message.reactions.length > 0 && (
          <div className="px-2">
            <MessageReactions
              reactions={message.reactions}
              onReactionClick={handleReactionClick}
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>
          {isCurrentUser && message.receipt.length > 1 && (
            <span className="text-xs text-muted-foreground">✓ Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
