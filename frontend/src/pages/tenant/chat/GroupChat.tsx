import { ChatProvider } from "@/contexts/ChatContextProvider";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChannelList } from "@/components/chat/channels/ChannelList";
import { ChatMessageView } from "@/components/chat/messages/ChatMessageView";
import { ChatEmptyState } from "@/components/chat/layout/ChatEmptyState";
import { useChat } from "@/contexts/ChatContextProvider";

function GroupChatContent() {
  const { selectedChannel } = useChat();

  return (
    <ChatLayout
      sidebar={<ChannelList channelType="group" />}
      mainContent={
        selectedChannel ? (
          <ChatMessageView channel={selectedChannel} channelType="group" />
        ) : (
          <ChatEmptyState
            title="Select a channel"
            description="Choose a channel from the list to start chatting."
          />
        )
      }
    />
  );
}

export default function GroupChat() {
  return (
    <ChatProvider>
      <GroupChatContent />
    </ChatProvider>
  );
}
