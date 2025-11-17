import { ChatProvider } from "@/contexts/ChatContextProvider";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChannelList } from "@/components/chat/channels/ChannelList";
import { ChatMessageView } from "@/components/chat/messages/ChatMessageView";
import { ChatEmptyState } from "@/components/chat/layout/ChatEmptyState";
import { useChat } from "@/contexts/ChatContextProvider";

function DirectChatContent() {
  const { selectedChannel } = useChat();

  return (
    <ChatLayout
      sidebar={<ChannelList channelType="direct" />}
      mainContent={
        selectedChannel ? (
          <ChatMessageView channel={selectedChannel} channelType="direct" />
        ) : (
          <ChatEmptyState
            title="Select a conversation"
            description="Choose a conversation from the list to start chatting."
          />
        )
      }
    />
  );
}

export default function DirectChat() {
  return (
    <ChatProvider>
      <DirectChatContent />
    </ChatProvider>
  );
}
