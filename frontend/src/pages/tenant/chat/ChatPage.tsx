import { useMemo } from "react";
import { ChatLayout } from "@/components/chat/layout/ChatLayout";
import { ChannelList } from "@/components/chat/channels/ChannelList";
import { ChatMessageView } from "@/components/chat/messages/ChatMessageView";
import { ChatEmptyState } from "@/components/chat/layout/ChatEmptyState";
import { useChat } from "@/contexts/ChatContextProvider";
import type { ChatChannel } from "@/schemas/chatSchema";

interface ChatPageProps {
  channelType: "group" | "direct";
}

export default function ChatPage({ channelType = "group" }: ChatPageProps) {
  const { channelStateMap, selectedChannelId } = useChat();

  // Derive selectedChannel from selectedChannelId and channelStateMap
  const selectedChannel: ChatChannel | null = useMemo(() => {
    if (selectedChannelId == null) return null;
    const state = channelStateMap.get(selectedChannelId);
    if (!state) return null;

    // Derive lastMessage from messages array (last item)
    const lastMessage =
      state.messages.length > 0
        ? state.messages[state.messages.length - 1]
        : undefined;

    return {
      id: state.chatChannelId,
      name: state.name ?? `Channel ${state.chatChannelId}`,
      description: state.description,
      type: (state.type as "direct" | "group") ?? "group",
      avatar:
        state.image ||
        `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
          state.name ?? String(state.chatChannelId)
        )}`,
      members: state.members ?? [],
      lastMessage,
      unreadCount: state.unreadCount ?? 0,
      createdAt: state.createdAt ?? new Date().toISOString(),
      updatedAt: state.updatedAt ?? new Date().toISOString(),
    };
  }, [channelStateMap, selectedChannelId]);

  const emptyStateTitle =
    channelType === "direct" ? "Select a conversation" : "Select a channel";
  const emptyStateDescription =
    channelType === "direct"
      ? "Choose a conversation from the list to start chatting."
      : "Choose a channel from the list to start chatting.";

  return (
    <ChatLayout
      sidebar={<ChannelList channelType={channelType} />}
      mainContent={
        selectedChannel ? (
          <ChatMessageView
            channel={selectedChannel}
            channelType={channelType}
          />
        ) : (
          <ChatEmptyState
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )
      }
    />
  );
}
