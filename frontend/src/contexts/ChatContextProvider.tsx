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
  ChatChannel,
  SendMessageData,
  EditMessageData,
  AddReactionData,
  CreateChatChannelSchema,
  ChatUser,
  ChannelState,
  ChannelStateMap,
} from "../schemas/chatSchema";
import { getDummyChatData, dummyChatUsers } from "../utils/dummyChat";
import {
  mapApiChannelToChatChannel,
  mapApiMessageToChatMessage,
} from "../utils/chatUtils";
import type { AppDispatch } from "@/redux/store";
import {
  fetchChatChannelsAction,
  sendChannelMessageAction,
  fetchChannelMessagesAction,
} from "@/redux/actions/chatActions";
import { useAuthService } from "./AuthContextProvider";
import { getUsersAction } from "@/redux/actions/userActions";
import type { TenantUser } from "@/schemas/userSchema";

// Chat Context Type
export interface ChatContextType {
  // Shared State
  channelStateMap: ChannelStateMap; // channelId -> ChannelState
  selectedChannelId: number | null;
  chatUsers: ChatUser[]; // Array of all chat users for lookups
  isLoading: boolean;
  error: string | null;

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
  channelStateMap: new Map(),
  selectedChannelId: null,
  chatUsers: [],
  isLoading: false,
  error: null,
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
    members: [],
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
  const [channelStateMap, setChannelStateMap] = useState<ChannelStateMap>(
    new Map()
  );
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(
    null
  );
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { loggedInUser } = useAuthService();

  // Initialize with hardcoded dummy data and load channels from API
  const loadChannels = useCallback(async () => {
    setIsLoading(true);

    // First, process dummy data
    const next = new Map<number, ChannelState>();
    const dummyChatData = getDummyChatData(loggedInUser?.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(dummyChatData).forEach((channelData: any) => {
      const channelId = channelData.channelId;

      // Map messages and add sender field, and fix reaction user types
      // Note: dummy data messages don't have sender, so we add it here
      const messages: ChatMessage[] =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((channelData.messages || []) as any[]).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (msg: any) => ({
            ...msg,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reactions: (msg.reactions || []).map((reaction: any) => ({
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
        messages.length > 0 ? messages[messages.length - 1] : undefined;

      next.set(channelId, {
        channelId,
        messages,
        hasMore: channelData.hasMore ?? true,
        loading: channelData.loading ?? false,
        error: channelData.error ?? null,
        typingUserIds: channelData.typingUserIds ?? [],
        lastFetchedAt: channelData.lastFetchedAt ?? new Date().toISOString(),
        name: channelData.name,
        description: channelData.description,
        type: (channelData.type as "direct" | "group") ?? "group",
        image: channelData.image,
        members: channelData.members ?? [],
        unreadCount: channelData.unreadCount ?? 0,
        createdAt: channelData.createdAt ?? new Date().toISOString(),
        updatedAt: channelData.updatedAt ?? new Date().toISOString(),
        lastMessage,
      });
    });

    // Then, load channels from API and merge with dummy data
    try {
      const apiChannels = await dispatch(fetchChatChannelsAction()).unwrap();
      const userList = await dispatch(
        getUsersAction({
          page: 1,
          limit: 99,
          searchText: "",
        })
      ).unwrap();
      // Convert TenantUser[] to ChatUser[]
      const apiChatUsers: ChatUser[] = userList.map((user: TenantUser) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email || user.authEmail,
        avatar: undefined,
        status: "online" as const,
      }));
      // Merge API users with dummyChatUsers (all users are unique, no conflicts)
      const chatUsersList: ChatUser[] = [...dummyChatUsers, ...apiChatUsers];
      setChatUsers(chatUsersList);
      const mappedChannels = apiChannels.map(mapApiChannelToChatChannel);

      mappedChannels.forEach(channel => {
        const existing = next.get(channel.id) || {
          channelId: channel.id,
          messages: [],
          hasMore: true,
          loading: false,
          error: null,
          typingUserIds: [],
        };
        next.set(channel.id, {
          ...existing,
          name: channel.name,
          description: channel.description,
          type: channel.type,
          image: channel.avatar,
          members: channel.members ?? [],
          unreadCount: existing.unreadCount ?? 0,
          createdAt: channel.createdAt,
          updatedAt: channel.updatedAt,
          lastMessage: existing.lastMessage,
        });
      });
    } catch (e) {
      setError(
        typeof e === "string" ? e : "Unable to load channels. Please try again."
      );
    } finally {
      setIsLoading(false);
    }

    // Set state once with all data
    setChannelStateMap(next);
  }, [loggedInUser, dispatch]);

  useEffect(() => {
    if (loggedInUser) {
      void loadChannels();
    }
  }, [loggedInUser, loadChannels]);

  // Mark as read
  const markAsRead = useCallback((channelId: number) => {
    // Update channel unread count
    setChannelStateMap(prev => {
      const existing = prev.get(channelId);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(channelId, { ...existing, unreadCount: 0 });
      return next;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:mark_as_read", { channelId });
  }, []);

  // Send message
  const sendMessage = useCallback(
    (data: SendMessageData) => {
      if (!data.channelId || (!data.text && !data.mediaUrl)) return;

      if (!loggedInUser) {
        setError("You must be logged in to send messages.");
        return;
      }

      const channelId = data.channelId;
      const previousChannelState = channelStateMap.get(channelId);

      const tempId = Date.now();
      const now = new Date().toISOString();

      const optimisticMessage: ChatMessage = {
        id: tempId,
        messageCreatedAt: now,
        channelId,
        senderUserId: loggedInUser?.id || 0,
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
        const existing = prev.get(channelId);
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
        const next = new Map(prev);
        next.set(channelId, nextState);
        return next;
      });

      // Update meta on channel state
      setChannelStateMap(prev => {
        const existing = prev.get(channelId);
        if (!existing) return prev;
        const next = new Map(prev);
        next.set(channelId, {
          ...existing,
          lastMessage: optimisticMessage,
          updatedAt: now,
        });
        return next;
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

          const persistedMessage = mapApiMessageToChatMessage(
            result,
            loggedInUser
          );

          setChannelStateMap(prev => {
            const existing = prev.get(channelId);
            if (!existing) return prev;
            const updated = existing.messages.map(message =>
              message.id === tempId ? persistedMessage : message
            );
            const next = new Map(prev);
            next.set(channelId, { ...existing, messages: updated });
            return next;
          });

          // Update channel meta with persisted message
          setChannelStateMap(prev => {
            const existing = prev.get(channelId);
            if (!existing) return prev;
            const next = new Map(prev);
            next.set(channelId, {
              ...existing,
              lastMessage: persistedMessage,
              updatedAt: persistedMessage.updatedAt,
            });
            return next;
          });
        } catch (err) {
          setChannelStateMap(prev => {
            const existing = prev.get(channelId);
            if (!existing) return prev;
            const updated = existing.messages.filter(
              message => message.id !== tempId
            );
            const next = new Map(prev);
            next.set(channelId, { ...existing, messages: updated });
            return next;
          });

          // Rollback channel meta if needed
          if (previousChannelState) {
            setChannelStateMap(prev => {
              const existing = prev.get(channelId);
              if (!existing) return prev;
              const next = new Map(prev);
              next.set(channelId, {
                ...existing,
                lastMessage: previousChannelState.lastMessage,
                updatedAt: previousChannelState.updatedAt ?? existing.updatedAt,
              });
              return next;
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
    [channelStateMap, dispatch, loggedInUser]
  );

  // Edit message
  const editMessage = useCallback((data: EditMessageData) => {
    setChannelStateMap(prev => {
      const existing = prev.get(data.channelId);
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
      const next = new Map(prev);
      next.set(data.channelId, { ...existing, messages: updated });
      return next;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:edit_message", data);
  }, []);

  // Delete message
  const deleteMessage = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      const now = new Date().toISOString();
      setChannelStateMap(prev => {
        const existing = prev.get(channelId);
        if (!existing) return prev;
        const updated = existing.messages.map(msg =>
          msg.id === messageId && msg.messageCreatedAt === messageCreatedAt
            ? { ...msg, isDeleted: true, deletedAt: now }
            : msg
        );
        const next = new Map(prev);
        next.set(channelId, { ...existing, messages: updated });
        return next;
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
      const existing = prev.get(data.channelId);
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
      const next = new Map(prev);
      next.set(data.channelId, { ...existing, messages: updated });
      return next;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:add_reaction", data);
  }, []);

  // Remove reaction
  const removeReaction = useCallback(
    (messageId: number, messageCreatedAt: string, channelId: number) => {
      setChannelStateMap(prev => {
        const existing = prev.get(channelId);
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
        const next = new Map(prev);
        next.set(channelId, { ...existing, messages: updated });
        return next;
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
        const state = channelStateMap.get(channel.id);
        if (!state || state.messages.length === 0) {
          const load = async () => {
            try {
              const results = await dispatch(
                fetchChannelMessagesAction({ channelId: channel.id, limit: 50 })
              ).unwrap();
              const mapped = results
                .map(msg => mapApiMessageToChatMessage(msg, loggedInUser))
                .reverse(); // oldest first
              setChannelStateMap(prev => {
                const next = new Map(prev);
                next.set(channel.id, {
                  channelId: channel.id,
                  messages: mapped,
                  hasMore: results.length >= 50,
                  loading: false,
                  error: null,
                  typingUserIds: [],
                  lastFetchedAt: new Date().toISOString(),
                });
                return next;
              });
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
    [channelStateMap, dispatch, loggedInUser, markAsRead]
  );

  // Set typing indicator
  const setTyping = useCallback((channelId: number, isTyping: boolean) => {
    const userId = 1; // Current user ID (replace with real)
    setChannelStateMap(prev => {
      const existing =
        prev.get(channelId) ||
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
      const next = new Map(prev);
      next.set(channelId, { ...existing, typingUserIds });
      return next;
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
      // Get max channel ID from channelStateMap
      const existingIds = Array.from(channelStateMap.keys());
      const newChannelId =
        existingIds.length > 0 ? Math.max(...existingIds) + 1 : 200;
      const now = new Date().toISOString();

      const welcomeMessage: ChatMessage = {
        id: newChannelId * 1000,
        messageCreatedAt: now,
        channelId: newChannelId,
        senderUserId: loggedInUser?.id || 0,
        text: `Welcome to #${data.name}!`,
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        reactions: [],
        readBy: [1],
      };

      // Create members array from channelUserIds (including current user)
      const members: number[] = [
        // Current user (logged in user)
        ...(loggedInUser ? [loggedInUser.id] : []),
        // Other members
        ...data.channelUserIds,
      ];

      const newChannel: ChatChannel = {
        id: newChannelId,
        name: data.name,
        description: data.description?.trim() || undefined,
        type: data.type ?? "group",
        avatar: `https://api.dicebear.com/7.x/shapes/svg?radius=50&seed=${encodeURIComponent(
          data.name
        )}`,
        members,
        unreadCount: 0,
        createdAt: now,
        updatedAt: now,
        lastMessage: welcomeMessage,
      };

      setChannelStateMap(prev => {
        const next = new Map(prev);
        next.set(newChannelId, {
          channelId: newChannelId,
          messages: [welcomeMessage],
          hasMore: true,
          loading: false,
          error: null,
          typingUserIds: [],
          lastFetchedAt: new Date().toISOString(),
        });
        return next;
      });
      setSelectedChannelId(newChannel.id);
      markAsRead(newChannel.id);

      return newChannel;
    },
    [channelStateMap, markAsRead, loggedInUser]
  );

  const value = useMemo<ChatContextType>(
    () => ({
      channelStateMap,
      selectedChannelId,
      chatUsers,
      isLoading,
      error,
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
      channelStateMap,
      selectedChannelId,
      chatUsers,
      isLoading,
      error,
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
