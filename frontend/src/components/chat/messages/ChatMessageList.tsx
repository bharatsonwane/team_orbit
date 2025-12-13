import { useEffect, useRef, useMemo } from "react";
import { useChat } from "@/contexts/ChatContextProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Separator } from "@/components/ui/separator";
import { groupMessagesByDate } from "@/utils/chatUtils";

interface ChatMessageListProps {
  chatChannelId: number;
}

export function ChatMessageList({ chatChannelId }: ChatMessageListProps) {
  const { channelStateMap } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use useMemo to ensure we get the latest state and React detects changes
  const channelState = useMemo(() => {
    return channelStateMap.get(chatChannelId);
  }, [channelStateMap, chatChannelId]);

  const conversationMessages = useMemo(() => {
    return channelState?.messages || [];
  }, [channelState]);

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(conversationMessages);
  }, [conversationMessages]);

  const typingUserIds = channelState?.typingUserIds || [];

  // Debug logging
  useEffect(() => {
    console.log("ChatMessageList - chatChannelId:", chatChannelId);
    console.log("ChatMessageList - channelState:", channelState);
    console.log(
      "ChatMessageList - conversationMessages:",
      conversationMessages
    );
    console.log(
      "ChatMessageList - channelStateMap size:",
      channelStateMap.size
    );
    console.log(
      "ChatMessageList - channelStateMap keys:",
      Array.from(channelStateMap.keys())
    );
  }, [chatChannelId, channelState, conversationMessages, channelStateMap]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  return (
    <ScrollArea className="h-full w-full p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            <div className="flex items-center gap-4 mb-4">
              <Separator className="flex-1" />
              <span className="text-xs font-medium text-muted-foreground px-2">
                {dateKey}
              </span>
              <Separator className="flex-1" />
            </div>

            {dateMessages.map((message, index) => {
              const prevMessage = index > 0 ? dateMessages[index - 1] : null;
              const showAvatar =
                !prevMessage ||
                prevMessage.senderUserId !== message.senderUserId ||
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() >
                  300000; // 5 minutes

              return (
                <MessageBubble
                  key={`${message.id}-${message.createdAt}-${index}`}
                  message={message}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUserIds.length > 0 && (
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
            <span className="text-xs text-muted-foreground">typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
