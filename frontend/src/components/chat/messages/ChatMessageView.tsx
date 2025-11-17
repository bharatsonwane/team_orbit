import { ChatHeader } from "../layout/ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatMessageInput } from "./ChatMessageInput";
import type { ChatChannel } from "@/schemas/chatSchema";

interface ChatMessageViewProps {
  channel: ChatChannel;
  channelType: "group" | "direct";
}

export function ChatMessageView({
  channel,
  channelType,
}: ChatMessageViewProps) {
  const channelId = channel?.id;
  if (!channelId) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <ChatHeader channel={channel} channelType={channelType} />

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatMessageList channelId={channelId} />
      </div>

      {/* Input */}
      <ChatMessageInput channel={channel} />
    </div>
  );
}
