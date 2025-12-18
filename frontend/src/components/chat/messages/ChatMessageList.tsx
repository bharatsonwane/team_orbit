import { useEffect, useRef, useMemo } from "react";
import { useChat } from "@/contexts/ChatContextProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Separator } from "@/components/ui/separator";
import { groupMessagesByDate } from "@/utils/chatUtils";

interface ChatMessageListProps {
  chatChannelId: number;
}

export function ChatMessageList({ chatChannelId }: ChatMessageListProps) {
  const { channelsState, chatUsers } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use useMemo to ensure we get the latest state and React detects changes
  const channelState = useMemo(() => {
    return channelsState[chatChannelId];
  }, [channelsState, chatChannelId]);

  const conversationMessages = useMemo(() => {
    return channelState?.messages || [];
  }, [channelState]);

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(conversationMessages);
  }, [conversationMessages]);

  const typingUsersData = channelState?.typingUsers || [];

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

        <TypingIndicator
          typingUsersData={typingUsersData}
          chatUsers={chatUsers}
        />

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
