import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {
  ChatMessage,
  Conversation,
  ChatChannel,
  SendMessageData,
  EditMessageData,
  AddReactionData,
  CreateChatChannelSchema,
  ChatChannelListItem,
  ChatUser,
  ChatMessageApiResponse,
} from "../schemas/chat";
import {
  generateMockConversations,
  generateMockMessages,
} from "../utils/chatUtils";
import type { AppDispatch, RootState } from "@/redux/store";
import {
  fetchChatChannelsAction,
  sendChannelMessageAction,
} from "@/redux/actions/chatActions";
import { useAuthService } from "./AuthContextProvider";

// Chat Context Type
export interface ChatContextType {
  // State - direct
  conversations: Conversation[];
  selectedConversation: Conversation | null;

  // State - Group Chat
  channels: ChatChannel[];
  selectedChannel: ChatChannel | null;

  // Shared State
  messages: Record<number, ChatMessage[]>; // channelId -> messages
  typingUsers: Record<number, number[]>; // channelId -> userIds who are typing
  isLoading: boolean;
  error: string | null;
  socketConnected: boolean;

  // Actions - direct
  selectConversation: (conversation: Conversation | null) => void;

  // Actions - Group Chat
  selectChannel: (channel: ChatChannel | null) => void;
  createChannel: (data: CreateChatChannelSchema) => ChatChannel;

  // Shared Actions
  sendMessage: (data: SendMessageData) => void;
  editMessage: (data: EditMessageData) => void;
  deleteMessage: (
    messageId: number,
    messageCreatedAt: string,
    channelId: number
  ) => void;
  addReaction: (data: AddReactionData) => void;
  removeReaction: (
    messageId: number,
    messageCreatedAt: string,
    channelId: number
  ) => void;
  markAsRead: (channelId: number) => void;
  setTyping: (channelId: number, isTyping: boolean) => void;
  clearError: () => void;
}

const defaultContext: ChatContextType = {
  conversations: [],
  selectedConversation: null,
  channels: [],
  selectedChannel: null,
  messages: {},
  typingUsers: {},
  isLoading: false,
  error: null,
  socketConnected: false,
  selectConversation: () => {},
  selectChannel: () => {},
  sendMessage: () => {},
  editMessage: () => {},
  deleteMessage: () => {},
  addReaction: () => {},
  removeReaction: () => {},
  markAsRead: () => {},
  setTyping: () => {},
  clearError: () => {},
  createChannel: () => ({
    id: 0,
    name: "",
    description: "",
    type: "group",
    avatar: "",
    memberCount: 0,
    unreadCount: 0,
    createdAt: "",
    updatedAt: "",
  }),
};

export const ChatContext = createContext<ChatContextType>(defaultContext);

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(
    null
  );
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<number, number[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [socketConnected] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const {
    channels: apiChannels,
    loading: channelsLoading,
    error: channelsError,
  } = useSelector((state: RootState) => state.chat);
  const { loggedInUser } = useAuthService();

  const buildSenderFromUser = useCallback((): ChatUser => {
    if (!loggedInUser) {
      return {
        id: 0,
        name: "Unknown",
        email: "",
        status: "online",
      };
    }

    const fullName =
      `${loggedInUser.firstName} ${loggedInUser.lastName}`.trim();

    return {
      id: loggedInUser.id,
      name: fullName || loggedInUser.firstName || loggedInUser.email,
      email: loggedInUser.email,
      status: "online",
    };
  }, [loggedInUser]);

  const mapApiMessageToChatMessage = useCallback(
    (message: ChatMessageApiResponse): ChatMessage => ({
      id: message.id,
      messageCreatedAt: message.createdAt,
      channelId: message.channelId,
      senderUserId: message.senderUserId,
      sender: buildSenderFromUser(),
      replyToMessageId: message.replyToMessageId ?? undefined,
      text: message.text ?? undefined,
      mediaUrl: message.mediaUrl ?? undefined,
      isEdited: false,
      isDeleted: false,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      reactions: [],
      readBy: message.readBy ?? [],
    }),
    [buildSenderFromUser]
  );

  const mapApiChannelToChatChannel = useCallback(
    (channel: ChatChannelListItem): ChatChannel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description ?? undefined,
      type: channel.type,
      avatar:
        channel.image ||
        `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
          channel.name
        )}`,
      memberCount: channel.memberCount,
      lastMessage: undefined,
      unreadCount: 0,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    }),
    []
  );

  // Initialize with dummy data on mount
  React.useEffect(() => {
    // direct conversations
    const mockConversations = generateMockConversations();
    const mockMessages: Record<number, ChatMessage[]> = {};

    // Generate messages for each conversation
    mockConversations.forEach((conversation: Conversation) => {
      mockMessages[conversation.channelId] = generateMockMessages(
        conversation.channelId,
        conversation.participant.id
      );
    });

    setConversations(mockConversations);
    setMessages(mockMessages);
  }, []);

  React.useEffect(() => {
    dispatch(fetchChatChannelsAction());
  }, [dispatch]);

  React.useEffect(() => {
    if (channelsError) {
      setError(channelsError);
    }
  }, [channelsError]);

  React.useEffect(() => {
    if (!apiChannels) return;
    const mappedChannels = apiChannels.map(mapApiChannelToChatChannel);
    setChannels(mappedChannels);
    setMessages(prev => {
      const next = { ...prev };
      mappedChannels.forEach(channel => {
        if (!next[channel.id]) {
          next[channel.id] = [];
        }
      });
      return next;
    });
  }, [apiChannels, mapApiChannelToChatChannel]);

  // Mark as read
  const markAsRead = useCallback((channelId: number) => {
    // Update conversation unread count
    setConversations(prev =>
      prev.map(conv =>
        conv.channelId === channelId ? { ...conv, unreadCount: 0 } : conv
      )
    );

    // Update channel unread count
    setChannels(prev =>
      prev.map(channel =>
        channel.id === channelId ? { ...channel, unreadCount: 0 } : channel
      )
    );

    // TODO: Emit socket event to backend
    // socket.emit("chat:mark_as_read", { channelId });
  }, []);

  // Select conversation
  const selectConversation = useCallback(
    (conversation: Conversation | null) => {
      setSelectedConversation(conversation);
      if (conversation) {
        markAsRead(conversation.channelId);
      }
    },
    [markAsRead]
  );

  // Send message
  const sendMessage = useCallback(
    (data: SendMessageData) => {
      if (!data.channelId || (!data.text && !data.mediaUrl)) return;

      if (!loggedInUser) {
        setError("You must be logged in to send messages.");
        return;
      }

      const channelId = data.channelId;
      const previousChannelState = channels.find(
        channel => channel.id === channelId
      );
      const previousConversationState = conversations.find(
        conversation => conversation.channelId === channelId
      );

      const tempId = Date.now();
      const now = new Date().toISOString();
      const sender = buildSenderFromUser();

      const optimisticMessage: ChatMessage = {
        id: tempId,
        messageCreatedAt: now,
        channelId,
        senderUserId: sender.id,
        sender,
        replyToMessageId: data.replyToMessageId,
        text: data.text,
        mediaUrl: data.mediaUrl,
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        reactions: [],
        readBy: [],
      };

      setMessages(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), optimisticMessage],
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv.channelId === channelId
            ? { ...conv, lastMessage: optimisticMessage, updatedAt: now }
            : conv
        )
      );

      setChannels(prev =>
        prev.map(channel =>
          channel.id === channelId
            ? { ...channel, lastMessage: optimisticMessage, updatedAt: now }
            : channel
        )
      );

      const send = async () => {
        try {
          const result = await dispatch(
            sendChannelMessageAction({
              channelId,
              text: data.text,
              mediaUrl: data.mediaUrl,
              replyToMessageId: data.replyToMessageId,
            })
          ).unwrap();

          const persistedMessage = mapApiMessageToChatMessage(result);

          setMessages(prev => ({
            ...prev,
            [channelId]: (prev[channelId] || []).map(message =>
              message.id === tempId ? persistedMessage : message
            ),
          }));

          setConversations(prev =>
            prev.map(conv =>
              conv.channelId === channelId &&
              conv.lastMessage &&
              conv.lastMessage.id === tempId
                ? {
                    ...conv,
                    lastMessage: persistedMessage,
                    updatedAt: persistedMessage.updatedAt,
                  }
                : conv
            )
          );

          setChannels(prev =>
            prev.map(channel =>
              channel.id === channelId &&
              channel.lastMessage &&
              channel.lastMessage.id === tempId
                ? {
                    ...channel,
                    lastMessage: persistedMessage,
                    updatedAt: persistedMessage.updatedAt,
                  }
                : channel
            )
          );
        } catch (err) {
          setMessages(prev => ({
            ...prev,
            [channelId]: (prev[channelId] || []).filter(
              message => message.id !== tempId
            ),
          }));

          setConversations(prev =>
            prev.map(conv =>
              conv.channelId === channelId &&
              conv.lastMessage &&
              conv.lastMessage.id === tempId
                ? {
                    ...conv,
                    lastMessage: previousConversationState?.lastMessage,
                    updatedAt:
                      previousConversationState?.updatedAt ?? conv.updatedAt,
                  }
                : conv
            )
          );

          setChannels(prev =>
            prev.map(channel =>
              channel.id === channelId &&
              channel.lastMessage &&
              channel.lastMessage.id === tempId
                ? {
                    ...channel,
                    lastMessage: previousChannelState?.lastMessage,
                    updatedAt:
                      previousChannelState?.updatedAt ?? channel.updatedAt,
                  }
                : channel
            )
          );

          setError(
            typeof err === "string"
              ? err
              : "Failed to send message. Please try again."
          );
        }
      };

      void send();
    },
    [
      buildSenderFromUser,
      channels,
      conversations,
      dispatch,
      loggedInUser,
      mapApiMessageToChatMessage,
    ]
  );

  // Edit message
  const editMessage = useCallback((data: EditMessageData) => {
    setMessages(prev => ({
      ...prev,
      [data.channelId]: (prev[data.channelId] || []).map(msg =>
        msg.id === data.messageId &&
        msg.messageCreatedAt === data.messageCreatedAt
          ? {
              ...msg,
              text: data.text,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            }
          : msg
      ),
    }));

    // TODO: Emit socket event to backend
    // socket.emit("chat:edit_message", data);
  }, []);

  // Delete message
  const deleteMessage = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      const now = new Date().toISOString();
      setMessages(prev => ({
        ...prev,
        [channelId]: (prev[channelId] || []).map(msg =>
          msg.id === messageId && msg.messageCreatedAt === messageCreatedAt
            ? { ...msg, isDeleted: true, deletedAt: now }
            : msg
        ),
      }));

      // TODO: Emit socket event to backend
      // socket.emit("chat:delete_message", { messageId, messageCreatedAt, channelId });
    },
    []
  );

  // Add reaction
  const addReaction = useCallback((data: AddReactionData) => {
    const now = new Date().toISOString();
    setMessages(prev => ({
      ...prev,
      [data.channelId]: (prev[data.channelId] || []).map(msg => {
        if (
          msg.id === data.messageId &&
          msg.messageCreatedAt === data.messageCreatedAt
        ) {
          const existingReaction = msg.reactions.find(
            r => r.userId === 1 && r.messageId === data.messageId
          );

          if (existingReaction) {
            // Update existing reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.userId === 1 && r.messageId === data.messageId
                  ? { ...r, reaction: data.reaction, createdAt: now }
                  : r
              ),
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [
                ...msg.reactions,
                {
                  id: Date.now(),
                  messageId: data.messageId,
                  messageCreatedAt: data.messageCreatedAt,
                  userId: 1,
                  user: {
                    id: 1,
                    name: "You",
                    email: "you@example.com",
                    status: "online",
                  },
                  reaction: data.reaction,
                  createdAt: now,
                },
              ],
            };
          }
        }
        return msg;
      }),
    }));

    // TODO: Emit socket event to backend
    // socket.emit("chat:add_reaction", data);
  }, []);

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      setMessages(prev => ({
        ...prev,
        [channelId]: (prev[channelId] || []).map(msg =>
          msg.id === messageId && msg.messageCreatedAt === messageCreatedAt
            ? {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.userId === 1 && r.messageId === messageId)
                ),
              }
            : msg
        ),
      }));

      // TODO: Emit socket event to backend
      // socket.emit("chat:remove_reaction", { messageId, messageCreatedAt, channelId });
    },
    []
  );

  // Select channel (for group chat)
  const selectChannel = useCallback(
    (channel: ChatChannel | null) => {
      setSelectedChannel(channel);
      if (channel) {
        markAsRead(channel.id);
      }
    },
    [markAsRead]
  );

  // Set typing indicator
  const setTyping = useCallback((channelId: number, isTyping: boolean) => {
    setTypingUsers(prev => {
      const currentTyping = prev[channelId] || [];
      const userId = 1; // Current user ID

      if (isTyping) {
        if (!currentTyping.includes(userId)) {
          return { ...prev, [channelId]: [...currentTyping, userId] };
        }
      } else {
        return {
          ...prev,
          [channelId]: currentTyping.filter(id => id !== userId),
        };
      }
      return prev;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:typing", { channelId, isTyping });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create new channel
  const createChannel = useCallback(
    (data: CreateChatChannelSchema): ChatChannel => {
      const newChannelId =
        channels.length > 0
          ? Math.max(...channels.map(channel => channel.id)) + 1
          : 200;
      const now = new Date().toISOString();

      const welcomeMessage: ChatMessage = {
        id: newChannelId * 1000,
        messageCreatedAt: now,
        channelId: newChannelId,
        senderUserId: 1,
        sender: {
          id: 1,
          name: "You",
          email: "you@example.com",
          status: "online",
        },
        text: `Welcome to #${data.name}!`,
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        reactions: [],
        readBy: [1],
      };

      const newChannel: ChatChannel = {
        id: newChannelId,
        name: data.name,
        description: data.description?.trim() || undefined,
        type: data.type ?? "group",
        avatar: `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
          data.name
        )}`,
        memberCount: data.channelUserIds.length + 1,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMessage: welcomeMessage,
      };

      setChannels(prev => [newChannel, ...prev]);
      setMessages(prev => ({
        ...prev,
        [newChannelId]: [welcomeMessage],
      }));
      setSelectedChannel(newChannel);
      markAsRead(newChannel.id);

      return newChannel;
    },
    [channels, markAsRead]
  );

  const value = useMemo<ChatContextType>(
    () => ({
      conversations,
      selectedConversation,
      channels,
      selectedChannel,
      messages,
      typingUsers,
      isLoading: channelsLoading,
      error,
      socketConnected,
      selectConversation,
      selectChannel,
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      removeReaction,
      markAsRead,
      setTyping,
      clearError,
      createChannel,
    }),
    [
      conversations,
      selectedConversation,
      channels,
      selectedChannel,
      messages,
      typingUsers,
      channelsLoading,
      error,
      socketConnected,
      selectConversation,
      selectChannel,
      sendMessage,
      editMessage,
      deleteMessage,
      addReaction,
      removeReaction,
      markAsRead,
      setTyping,
      clearError,
      createChannel,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
