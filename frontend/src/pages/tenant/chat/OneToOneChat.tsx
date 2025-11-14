import { ChatProvider } from "@/contexts/ChatContextProvider";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ConversationList } from "@/components/chat/conversations/ConversationList";
import { ChatMessageView } from "@/components/chat/messages/ChatMessageView";
import { ChatEmptyState } from "@/components/chat/layout/ChatEmptyState";
import { useChat } from "@/contexts/ChatContextProvider";

function OneToOneChatContent() {
  const { selectedConversation } = useChat();

  return (
    <ChatLayout
      sidebar={<ConversationList />}
      mainContent={
        selectedConversation ? (
          <ChatMessageView
            conversation={selectedConversation}
            channel={undefined}
          />
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

export default function OneToOneChat() {
  return (
    <ChatProvider>
      <OneToOneChatContent />
    </ChatProvider>
  );
}
