import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import type { Conversation, ChatChannel } from "@/schemas/chat";

interface ChatMessageViewProps {
  conversation?: Conversation;
  channel?: ChatChannel;
}

export function ChatMessageView({
  conversation,
  channel,
}: ChatMessageViewProps) {
  const channelId = conversation?.channelId || channel?.id;
  if (!channelId) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <ChatHeader conversation={conversation} channel={channel} />

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessageList channelId={channelId} />
      </div>

      {/* Input */}
      <ChatMessageInput conversation={conversation} channel={channel} />
    </div>
  );
}
