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
import type { ChatMessage } from "@/schemas/chatSchema";
import { useChat } from "@/contexts/ChatContextProvider";
import { getSenderUser } from "@/utils/chatUtils";
import { useAuthService } from "@/contexts/AuthContextProvider";
import { MoreVertical, Reply, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { MessageReactions } from "./MessageReactions";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
}

export function MessageBubble({
  message,
  showAvatar = true,
}: MessageBubbleProps) {
  const { editMessage, deleteMessage, addReaction, removeReaction, chatUsers } =
    useChat();
  const { loggedInUser } = useAuthService();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");

  const sender = getSenderUser(message.senderUserId, loggedInUser, chatUsers);
  const isCurrentUser =
    loggedInUser && message.senderUserId === loggedInUser.id;
  const isDeleted = message.isDeleted;

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      editMessage({
        messageId: message.id,
        messageCreatedAt: message.messageCreatedAt,
        channelId: message.channelId,
        text: editText.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage(message.id, message.messageCreatedAt, message.channelId);
  };

  const handleReaction = (reaction: string) => {
    const existingReaction = message.reactions.find(
      r => r.userId === 1 && r.reaction === reaction
    );

    if (existingReaction) {
      removeReaction(message.id, message.messageCreatedAt, message.channelId);
    } else {
      addReaction({
        messageId: message.id,
        messageCreatedAt: message.messageCreatedAt,
        channelId: message.channelId,
        reaction,
      });
    }
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
          <AvatarImage src={sender.avatar} alt={sender.name} />
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
          "flex flex-col gap-1 max-w-[70%]",
          !showAvatar && (isCurrentUser ? "ml-10" : "mr-10")
        )}
      >
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
            isDeleted && "opacity-60 italic"
          )}
        >
          {/* Reply Preview */}
          {message.replyToMessage && (
            <div className="mb-2 pb-2 border-b border-border/50">
              <div className="text-xs font-medium opacity-75">
                {getSenderUser(
                  message.replyToMessage.senderUserId,
                  loggedInUser,
                  chatUsers
                ).name}
              </div>
              <div className="text-xs opacity-60 truncate">
                {message.replyToMessage.text || "Media"}
              </div>
            </div>
          )}

          {/* Message Content */}
          {isDeleted ? (
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

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <MessageReactions
              reactions={message.reactions}
              onReactionClick={handleReaction}
            />
          )}

          {/* Actions Menu */}
          {!isDeleted && isCurrentUser && (
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
                  onClick={handleDelete}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.createdAt)}
          </span>
          {isCurrentUser && message.readBy.length > 1 && (
            <span className="text-xs text-muted-foreground">✓ Read</span>
          )}
        </div>
      </div>
    </div>
  );
}
