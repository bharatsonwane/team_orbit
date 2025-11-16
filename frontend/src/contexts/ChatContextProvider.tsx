import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useDispatch } from "react-redux";
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
  ChannelState,
  ChannelStateMap,
} from "../schemas/chat";
import { dummyChatData, dummyChatUsers } from "../utils/dummyChat";
import type { AppDispatch } from "@/redux/store";
import {
  fetchChatChannelsAction,
  sendChannelMessageAction,
  fetchChannelMessagesAction,
} from "@/redux/actions/chatActions";
import { useAuthService } from "./AuthContextProvider";

// Chat Context Type
export interface ChatContextType {
  // State - direct
  conversations: Conversation[];

  // State - Group Chat
  channels: ChatChannel[];
  selectedChannel: ChatChannel | null;

  // Shared State
  channelStateMap: ChannelStateMap; // channelId -> ChannelState
  isLoading: boolean;
  error: string | null;

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
  channels: [],
  selectedChannel: null,
  channelStateMap: {},
  isLoading: false,
  error: null,
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
  const [channelStateMap, setChannelStateMap] = useState<ChannelStateMap>({});
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { loggedInUser } = useAuthService();

  console.log("bharat-channelStateMap", channelStateMap);

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

  // Helper to get sender user from senderUserId
  const getSenderUser = useCallback(
    (senderUserId: number): ChatUser => {
      // If it's the current user, use buildSenderFromUser
      if (loggedInUser && senderUserId === loggedInUser.id) {
        return buildSenderFromUser();
      }
      // Otherwise, look up from dummyChatUsers
      const user = dummyChatUsers.find(u => u.id === senderUserId);
      if (user) {
        return user;
      }
      // Fallback
      return {
        id: senderUserId,
        name: `User ${senderUserId}`,
        email: `user${senderUserId}@example.com`,
        status: "online",
      };
    },
    [loggedInUser, buildSenderFromUser]
  );

  // Initialize with hardcoded dummy data on mount
  useEffect(() => {
    setChannelStateMap(prev => {
      const next = { ...prev };

      // Process each channel from dummyChatData
      Object.values(dummyChatData).forEach(channelData => {
        const channelId = channelData.channelId;

        // Map messages and add sender field, and fix reaction user types
        const messages: ChatMessage[] = (channelData.messages || []).map(
          msg => ({
            ...msg,
            sender: getSenderUser(msg.senderUserId),
            reactions: (msg.reactions || []).map(reaction => ({
              ...reaction,
              user: {
                ...reaction.user,
                status: (reaction.user.status || "online") as
                  | "online"
                  | "offline"
                  | "away",
              },
            })),
          })
        );

        // Get last message if available
        const lastMessage =
          messages.length > 0
            ? {
                ...messages[messages.length - 1],
                sender: getSenderUser(
                  messages[messages.length - 1].senderUserId
                ),
              }
            : undefined;

        next[channelId] = {
          channelId,
          messages,
          hasMore: channelData.hasMore ?? true,
          loading: channelData.loading ?? false,
          error: channelData.error ?? null,
          typingUserIds: channelData.typingUserIds ?? [],
          lastFetchedAt: channelData.lastFetchedAt ?? new Date().toISOString(),
          name: channelData.name,
          description: (channelData as { description?: string }).description,
          type: (channelData.type as "direct" | "group") ?? "group",
          image: channelData.image,
          memberCount: channelData.memberCount ?? 0,
          unreadCount: channelData.unreadCount ?? 0,
          createdAt: channelData.createdAt ?? new Date().toISOString(),
          updatedAt: channelData.updatedAt ?? new Date().toISOString(),
          lastMessage,
        };
      });
      return next;
    });
  }, [getSenderUser]);

  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const apiChannels = await dispatch(fetchChatChannelsAction()).unwrap();
        const mappedChannels = apiChannels.map(mapApiChannelToChatChannel);
        setChannelStateMap(prev => {
          const next = { ...prev };
          mappedChannels.forEach(channel => {
            const existing = next[channel.id] || {
              channelId: channel.id,
              messages: [],
              hasMore: true,
              loading: false,
              error: null,
              typingUserIds: [],
            };
            next[channel.id] = {
              ...existing,
              name: channel.name,
              description: channel.description,
              type: channel.type,
              image: channel.avatar,
              memberCount: channel.memberCount,
              unreadCount: existing.unreadCount ?? 0,
              createdAt: channel.createdAt,
              updatedAt: channel.updatedAt,
              lastMessage: existing.lastMessage,
            };
          });
          return next;
        });
      } catch (e) {
        setError(
          typeof e === "string"
            ? e
            : "Unable to load channels. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadChannels();
  }, [dispatch, mapApiChannelToChatChannel]);

  // Derive channels list for sidebar from channelStateMap
  const channels: ChatChannel[] = useMemo(() => {
    const list: ChatChannel[] = Object.values(channelStateMap).map(s => ({
      id: s.channelId,
      name: s.name ?? `Channel ${s.channelId}`,
      description: s.description,
      type: (s.type as "direct" | "group") ?? "group",
      avatar:
        s.image ||
        `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
          s.name ?? String(s.channelId)
        )}`,
      memberCount: s.memberCount ?? 0,
      lastMessage: s.lastMessage,
      unreadCount: s.unreadCount ?? 0,
      createdAt: s.createdAt ?? new Date().toISOString(),
      updatedAt: s.updatedAt ?? s.lastFetchedAt ?? new Date().toISOString(),
    }));
    // Sort by updatedAt desc
    return list.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [channelStateMap]);

  // Derive conversations list from channelStateMap (direct messages only)
  const conversations: Conversation[] = useMemo(() => {
    return Object.values(channelStateMap)
      .filter(s => s.type === "direct")
      .map(s => {
        // Create a Conversation from ChannelState
        // For direct messages, we need to reconstruct participant info
        // Since we don't store participant id/email in channelStateMap,
        // we create a minimal participant from available data
        const participant: ChatUser = {
          id: s.channelId, // This is approximate, but works for UI
          name: s.name ?? `User ${s.channelId}`,
          email: s.name
            ? `${s.name.toLowerCase().replace(/\s+/g, ".")}@example.com`
            : `user${s.channelId}@example.com`,
          avatar: s.image,
          status: "online" as const,
        };
        return {
          id: `dm_1_${s.channelId}`, // Composite key for conversation
          channelId: s.channelId,
          participant,
          lastMessage: s.lastMessage,
          unreadCount: s.unreadCount ?? 0,
          updatedAt: s.updatedAt ?? s.lastFetchedAt ?? new Date().toISOString(),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [channelStateMap]);

  // Mark as read
  const markAsRead = useCallback((channelId: number) => {
    // Update channel unread count
    setChannelStateMap(prev => {
      const existing = prev[channelId];
      if (!existing) return prev;
      return {
        ...prev,
        [channelId]: { ...existing, unreadCount: 0 },
      };
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:mark_as_read", { channelId });
  }, []);

  // Select conversation (converts to channel and uses selectChannel)
  const selectConversation = useCallback(
    (conversation: Conversation | null) => {
      if (!conversation) {
        setSelectedChannelId(null);
        return;
      }
      // Select underlying channel for this conversation
      setSelectedChannelId(conversation.channelId);
      markAsRead(conversation.channelId);
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
      const previousChannelState = channelStateMap[channelId];

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

      setChannelStateMap(prev => {
        const existing = prev[channelId];
        const messages = existing?.messages || [];
        const nextState: ChannelState = {
          channelId,
          messages: [...messages, optimisticMessage],
          hasMore: existing?.hasMore ?? true,
          loading: false,
          error: null,
          typingUserIds: existing?.typingUserIds ?? [],
          lastFetchedAt: existing?.lastFetchedAt,
          lastReadAt: existing?.lastReadAt,
        };
        return { ...prev, [channelId]: nextState };
      });

      // Update meta on channel state
      setChannelStateMap(prev => {
        const existing = prev[channelId];
        if (!existing) return prev;
        return {
          ...prev,
          [channelId]: {
            ...existing,
            lastMessage: optimisticMessage,
            updatedAt: now,
          },
        };
      });

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

          setChannelStateMap(prev => {
            const existing = prev[channelId];
            if (!existing) return prev;
            const updated = existing.messages.map(message =>
              message.id === tempId ? persistedMessage : message
            );
            return {
              ...prev,
              [channelId]: { ...existing, messages: updated },
            };
          });

          // Update channel meta with persisted message
          setChannelStateMap(prev => {
            const existing = prev[channelId];
            if (!existing) return prev;
            return {
              ...prev,
              [channelId]: {
                ...existing,
                lastMessage: persistedMessage,
                updatedAt: persistedMessage.updatedAt,
              },
            };
          });
        } catch (err) {
          setChannelStateMap(prev => {
            const existing = prev[channelId];
            if (!existing) return prev;
            const updated = existing.messages.filter(
              message => message.id !== tempId
            );
            return {
              ...prev,
              [channelId]: { ...existing, messages: updated },
            };
          });

          // Rollback channel meta if needed
          if (previousChannelState) {
            setChannelStateMap(prev => {
              const existing = prev[channelId];
              if (!existing) return prev;
              return {
                ...prev,
                [channelId]: {
                  ...existing,
                  lastMessage: previousChannelState.lastMessage,
                  updatedAt:
                    previousChannelState.updatedAt ?? existing.updatedAt,
                },
              };
            });
          }

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
      channelStateMap,
      dispatch,
      loggedInUser,
      mapApiMessageToChatMessage,
    ]
  );

  // Edit message
  const editMessage = useCallback((data: EditMessageData) => {
    setChannelStateMap(prev => {
      const existing = prev[data.channelId];
      if (!existing) return prev;
      const updated = existing.messages.map(msg =>
        msg.id === data.messageId &&
        msg.messageCreatedAt === data.messageCreatedAt
          ? {
              ...msg,
              text: data.text,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            }
          : msg
      );
      return { ...prev, [data.channelId]: { ...existing, messages: updated } };
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:edit_message", data);
  }, []);

  // Delete message
  const deleteMessage = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      const now = new Date().toISOString();
      setChannelStateMap(prev => {
        const existing = prev[channelId];
        if (!existing) return prev;
        const updated = existing.messages.map(msg =>
          msg.id === messageId && msg.messageCreatedAt === messageCreatedAt
            ? { ...msg, isDeleted: true, deletedAt: now }
            : msg
        );
        return { ...prev, [channelId]: { ...existing, messages: updated } };
      });

      // TODO: Emit socket event to backend
      // socket.emit("chat:delete_message", { messageId, messageCreatedAt, channelId });
    },
    []
  );

  // Add reaction
  const addReaction = useCallback((data: AddReactionData) => {
    const now = new Date().toISOString();
    setChannelStateMap(prev => {
      const existing = prev[data.channelId];
      if (!existing) return prev;
      const updated = existing.messages.map(msg => {
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
                    status: "online" as const,
                  },
                  reaction: data.reaction,
                  createdAt: now,
                },
              ],
            };
          }
        }
        return msg;
      });
      return { ...prev, [data.channelId]: { ...existing, messages: updated } };
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:add_reaction", data);
  }, []);

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      setChannelStateMap(prev => {
        const existing = prev[channelId];
        if (!existing) return prev;
        const updated = existing.messages.map(msg =>
          msg.id === messageId && msg.messageCreatedAt === messageCreatedAt
            ? {
                ...msg,
                reactions: msg.reactions.filter(
                  r => !(r.userId === 1 && r.messageId === messageId)
                ),
              }
            : msg
        );
        return { ...prev, [channelId]: { ...existing, messages: updated } };
      });

      // TODO: Emit socket event to backend
      // socket.emit("chat:remove_reaction", { messageId, messageCreatedAt, channelId });
    },
    []
  );

  // Select channel (for group chat)
  const selectChannel = useCallback(
    (channel: ChatChannel | null) => {
      if (!channel) {
        setSelectedChannelId(null);
        return;
      }

      setSelectedChannelId(channel.id);
      markAsRead(channel.id);

      if (channel) {
        // Load messages only if we don't already have them cached
        const state = channelStateMap[channel.id];
        if (!state || state.messages.length === 0) {
          const load = async () => {
            try {
              const results = await dispatch(
                fetchChannelMessagesAction({ channelId: channel.id, limit: 50 })
              ).unwrap();
              const mapped = results.map(mapApiMessageToChatMessage).reverse(); // oldest first
              setChannelStateMap(prev => ({
                ...prev,
                [channel.id]: {
                  channelId: channel.id,
                  messages: mapped,
                  hasMore: results.length >= 50,
                  loading: false,
                  error: null,
                  typingUserIds: [],
                  lastFetchedAt: new Date().toISOString(),
                },
              }));
            } catch (e) {
              setError(
                typeof e === "string"
                  ? e
                  : "Failed to load messages. Please try again."
              );
            }
          };
          void load();
        }
      }
    },
    [channelStateMap, dispatch, mapApiMessageToChatMessage, markAsRead]
  );

  // Derive selectedChannel from selectedChannelId and channels list
  const selectedChannel: ChatChannel | null = useMemo(() => {
    if (selectedChannelId == null) return null;
    return channels.find(c => c.id === selectedChannelId) ?? null;
  }, [channels, selectedChannelId]);

  // Set typing indicator
  const setTyping = useCallback((channelId: number, isTyping: boolean) => {
    const userId = 1; // Current user ID (replace with real)
    setChannelStateMap(prev => {
      const existing =
        prev[channelId] ||
        ({
          channelId,
          messages: [],
          hasMore: true,
          loading: false,
          error: null,
          typingUserIds: [],
        } as ChannelState);
      let typingUserIds = existing.typingUserIds ?? [];
      if (isTyping) {
        if (!typingUserIds.includes(userId)) {
          typingUserIds = [...typingUserIds, userId];
        }
      } else {
        typingUserIds = typingUserIds.filter(id => id !== userId);
      }
      return { ...prev, [channelId]: { ...existing, typingUserIds } };
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

      setChannelStateMap(prev => ({
        ...prev,
        [newChannelId]: {
          channelId: newChannelId,
          messages: [welcomeMessage],
          hasMore: true,
          loading: false,
          error: null,
          typingUserIds: [],
          lastFetchedAt: new Date().toISOString(),
        },
      }));
      setSelectedChannelId(newChannel.id);
      markAsRead(newChannel.id);

      return newChannel;
    },
    [channels, markAsRead]
  );

  const value = useMemo<ChatContextType>(
    () => ({
      conversations,
      channels,
      selectedChannel,
      channelStateMap,
      isLoading,
      error,
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
      channels,
      selectedChannel,
      channelStateMap,
      conversations,
      isLoading,
      error,
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
