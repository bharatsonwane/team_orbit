import React, {
  useEffect,
  createContext,
  useContext,
  useState,
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
  ChatChannelListItem,
  FetchChannelMessagesParam,
} from "../schemas/chatSchema";
import { dummyChatUsers, setDummyChatData } from "../utils/dummyChat";
import type { AppDispatch } from "@/redux/store";
import {
  fetchChatChannelsAction,
  sendChannelMessageAction,
  fetchChannelMessagesAction,
} from "@/redux/actions/chatActions";
import { useAuthService } from "./AuthContextProvider";
import { SocketManager } from "@/lib/socketManager";
import { getUsersAction } from "@/redux/actions/userActions";
import type { TenantUser } from "@/schemas/userSchema";

// Chat Context Type
export interface ChatContextType {
  // Shared State
  channelStateMap: ChannelStateMap; // chatChannelId -> ChannelState
  selectedChannelId: number | null;
  chatUsers: ChatUser[]; // Array of all chat users for lookups
  isLoading: boolean;
  error: string | null;

  // Actions - Group Chat
  handleSelectChannel: (channel: ChatChannel | null) => void;
  handleCreateChannel: (data: CreateChatChannelSchema) => ChatChannel;

  // Shared Actions
  handleSendMessage: (data: SendMessageData) => void;
  handleEditMessage: (data: EditMessageData) => void;
  handleDeleteMessage: (messageId: number, chatChannelId: number) => void;
  handleAddReaction: (data: AddReactionData) => void;
  handleRemoveReaction: (messageId: number, chatChannelId: number) => void;
  handleMarkAsRead: (chatChannelId: number) => void;
  handleSetTyping: (chatChannelId: number, isTyping: boolean) => void;
  handleClearError: () => void;
}

const defaultContext: ChatContextType = {
  channelStateMap: new Map(),
  selectedChannelId: null,
  chatUsers: [],
  isLoading: false,
  error: null,
  handleSelectChannel: () => {},
  handleSendMessage: () => {},
  handleEditMessage: () => {},
  handleDeleteMessage: () => {},
  handleAddReaction: () => {},
  handleRemoveReaction: () => {},
  handleMarkAsRead: () => {},
  handleSetTyping: () => {},
  handleClearError: () => {},
  handleCreateChannel: () => ({
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
  const { loggedInUser, tenantId } = useAuthService();

  useEffect(() => {
    if (loggedInUser?.id && tenantId) {
      void handleLoadChannels();
      void handleLoadUsers();
    } else if (!tenantId) {
      void handleResetChatData();
    }

    return () => {
      void handleResetChatData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUser?.id, tenantId]);

  useEffect(() => {
    const socket = SocketManager.socketInstance;
    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:channel_updated", handleChannelUpdated);

    // Join selected channel when socket connects
    if (selectedChannelId && tenantId) {
      socket.emit("chat:joinChannel", {
        tenantId,
        chatChannelId: selectedChannelId,
      });
    }

    return () => {
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:channel_updated", handleChannelUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  const handleResetChatData = () => {
    setChannelStateMap(new Map());
    setSelectedChannelId(null);
    setChatUsers([]);
    setIsLoading(false);
    setError(null);
  };

  // Listen for new messages
  const handleNewMessage = (data: ChatMessage) => {
    const message: ChatMessage = {
      id: data.id,
      chatChannelId: data.chatChannelId,
      senderUserId: data.senderUserId,
      replyToMessageId: data.replyToMessageId ?? undefined,
      text: data.text ?? undefined,
      mediaUrl: data.mediaUrl ?? undefined,
      isEdited: data.isEdited ?? false,
      isDeleted: data.isDeleted ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      reactions: [],
      receipt: data.receipt ?? [],
    };
    setChannelStateMap(prev => {
      const existing = prev.get(message.chatChannelId)!;

      // Check if message already exists (avoid duplicates)
      const messageExists = existing.messages.some(
        msg => msg.id === message.id
      );
      if (messageExists) {
        return prev;
      }
      // Add new message to the end of messages array
      const updated = {
        ...existing,
        messages: [...existing.messages, message],
        updatedAt: message.updatedAt,
      };
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(message.chatChannelId, updated);
      return tempChannelStateMap;
    });
  };

  // Listen for channel updates (when user is added to a new channel)
  const handleChannelUpdated = (data: {
    chatChannelId: number;
    name?: string;
    description?: string;
    type?: "direct" | "group";
    image?: string;
    members?: number[];
  }) => {
    setChannelStateMap(prev => {
      const existing = prev.get(data.chatChannelId);
      if (existing) {
        // Channel already exists, just update it
        const updated = {
          ...existing,
          name: data.name ?? existing.name,
          description: data.description ?? existing.description,
          type: data.type ?? existing.type,
          image: data.image ?? existing.image,
          members: data.members ?? existing.members,
        };
        const tempChannelStateMap = new Map(prev);
        tempChannelStateMap.set(data.chatChannelId, updated);
        return tempChannelStateMap;
      } else {
        // New channel, add it to state
        const newChannelState: ChannelState = {
          chatChannelId: data.chatChannelId,
          messages: [],
          loading: false,
          error: null,
          typingUserIds: [],
          name: data.name ?? "",
          type: data.type ?? "group",
          description: data.description,
          image: data.image,
          members: data.members ?? [],
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const tempChannelStateMap = new Map(prev);
        tempChannelStateMap.set(data.chatChannelId, newChannelState);
        return tempChannelStateMap;
      }
    });

    // Reload channels to get full channel data
    void handleLoadChannels();
  };

  const handleLoadUsers = async () => {
    try {
      const userList = await dispatch(
        getUsersAction({
          page: 1,
          limit: 99,
          searchText: "",
        })
      ).unwrap();

      const apiChatUsers: ChatUser[] = userList.map((user: TenantUser) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email || user.authEmail,
        avatar: undefined,
        status: "online" as const,
      }));

      const chatUsersList: ChatUser[] = [...dummyChatUsers, ...apiChatUsers];
      setChatUsers(chatUsersList);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleLoadChannels = async () => {
    const tempChannelStateMap = new Map<number, ChannelState>();
    try {
      setIsLoading(true);
      setDummyChatData({
        channelStateMap: tempChannelStateMap,
        loggedInUserId: loggedInUser?.id || 0,
      });

      const apiChannels = await dispatch(fetchChatChannelsAction()).unwrap();

      apiChannels.forEach((channel: ChatChannelListItem) => {
        const existingChannel = tempChannelStateMap.get(channel.id);

        if (existingChannel) {
          tempChannelStateMap.set(channel.id, {
            ...existingChannel,
            unreadCount: existingChannel.unreadCount ?? 0,
            updatedAt: channel.updatedAt,
          });
        } else {
          tempChannelStateMap.set(channel.id, {
            chatChannelId: channel.id,
            messages: [],
            loading: false,
            error: null,
            typingUserIds: [],
            name: channel.name,
            description: channel.description ?? undefined,
            type: channel.type as "direct" | "group",
            image: channel.image ?? undefined,
            members: channel.members ?? [],
            unreadCount: 0,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt,
          });
        }
      });
    } catch (e) {
      setError(
        typeof e === "string" ? e : "Unable to load channels. Please try again."
      );
    } finally {
      setIsLoading(false);
    }

    // Set state once with all data
    setChannelStateMap(tempChannelStateMap);

    /**@description Join socket rooms for all loaded channels */
    if (SocketManager.socketInstance && tenantId) {
      const channelIds = Array.from(tempChannelStateMap.keys());
      channelIds.forEach(chatChannelId => {
        SocketManager.socketInstance.emit("chat:joinChannel", {
          tenantId,
          chatChannelId,
        });
      });
    }
  };

  // Mark as read
  const handleMarkAsRead = (chatChannelId: number) => {
    // Update channel unread count
    setChannelStateMap(prev => {
      const existing = prev.get(chatChannelId);
      if (!existing) return prev;
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, { ...existing, unreadCount: 0 });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:mark_as_read", { chatChannelId });
  };

  /**@description Send message*/
  const handleSendMessage = (data: SendMessageData) => {
    if (!data.chatChannelId || (!data.text && !data.mediaUrl)) return;

    if (!loggedInUser) {
      setError("You must be logged in to send messages.");
      return;
    }

    const chatChannelId = data.chatChannelId;
    const previousChannelState = channelStateMap.get(chatChannelId);

    const tempId = Date.now();
    const now = new Date().toISOString();

    const tempNewMessage: ChatMessage = {
      id: tempId,
      chatChannelId,
      senderUserId: loggedInUser?.id || 0,
      replyToMessageId: data.replyToMessageId,
      text: data.text,
      mediaUrl: data.mediaUrl,
      isEdited: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      reactions: [],
      receipt: [],
    };

    setChannelStateMap(prev => {
      const existing = prev.get(chatChannelId);
      const messages = existing?.messages || [];
      const nextState: ChannelState = {
        chatChannelId,
        messages: [...messages, tempNewMessage],
        loading: false,
        error: null,
        typingUserIds: existing?.typingUserIds ?? [],
        lastReadAt: existing?.lastReadAt,
      };
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, nextState);
      return tempChannelStateMap;
    });

    // Update channel updatedAt
    setChannelStateMap(prev => {
      const existing = prev.get(chatChannelId);
      if (!existing) return prev;
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existing,
        updatedAt: now,
      });
      return tempChannelStateMap;
    });

    const send = async () => {
      try {
        const result = await dispatch(
          sendChannelMessageAction({
            chatChannelId,
            text: data.text,
            mediaUrl: data.mediaUrl,
            replyToMessageId: data.replyToMessageId,
          })
        ).unwrap();

        const persistedMessage: ChatMessage = {
          ...result,
          text: result.text ?? undefined,
          mediaUrl: result.mediaUrl ?? undefined,
          replyToMessageId: result.replyToMessageId ?? undefined,
          reactions:
            result.reactions?.map(r => ({
              ...r,
              messageId: result.id, // Add messageId to reactions
            })) ?? [],
          receipt: result.receipt ?? [],
          isEdited: false,
          isDeleted: false,
        };

        setChannelStateMap(prev => {
          const existing = prev.get(chatChannelId);
          if (!existing) return prev;
          const updated = existing.messages.map(message =>
            message.id === tempId ? persistedMessage : message
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existing,
            messages: updated,
          });
          return tempChannelStateMap;
        });

        // Update channel updatedAt
        setChannelStateMap(prev => {
          const existing = prev.get(chatChannelId);
          if (!existing) return prev;
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existing,
            updatedAt: persistedMessage.updatedAt,
          });
          return tempChannelStateMap;
        });
      } catch (err) {
        setChannelStateMap(prev => {
          const existing = prev.get(chatChannelId);
          if (!existing) return prev;
          const updated = existing.messages.filter(
            message => message.id !== tempId
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existing,
            messages: updated,
          });
          return tempChannelStateMap;
        });

        // Rollback channel updatedAt if needed
        if (previousChannelState) {
          setChannelStateMap(prev => {
            const existing = prev.get(chatChannelId);
            if (!existing) return prev;
            const tempChannelStateMap = new Map(prev);
            tempChannelStateMap.set(chatChannelId, {
              ...existing,
              updatedAt: previousChannelState.updatedAt ?? existing.updatedAt,
            });
            return tempChannelStateMap;
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
  };

  // Edit message
  const handleEditMessage = (data: EditMessageData) => {
    setChannelStateMap(prev => {
      const existing = prev.get(data.chatChannelId);
      if (!existing) return prev;
      const updated = existing.messages.map(msg =>
        msg.id === data.messageId
          ? {
              ...msg,
              text: data.text,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            }
          : msg
      );
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(data.chatChannelId, {
        ...existing,
        messages: updated,
      });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:edit_message", data);
  };

  // Delete message
  const handleDeleteMessage = (messageId: number, chatChannelId: number) => {
    const now = new Date().toISOString();
    setChannelStateMap(prev => {
      const existing = prev.get(chatChannelId);
      if (!existing) return prev;
      const updated = existing.messages.map(msg =>
        msg.id === messageId ? { ...msg, isDeleted: true, deletedAt: now } : msg
      );
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existing,
        messages: updated,
      });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:delete_message", { messageId, messageCreatedAt, chatChannelId });
  };

  // Add reaction
  const handleAddReaction = (data: AddReactionData) => {
    const now = new Date().toISOString();
    setChannelStateMap(prev => {
      const existing = prev.get(data.chatChannelId);
      if (!existing) return prev;
      const updated = existing.messages.map(msg => {
        if (msg.id === data.messageId) {
          const existingReaction = msg.reactions.find(
            r =>
              r.userId === (loggedInUser?.id || 0) &&
              r.messageId === data.messageId
          );

          if (existingReaction) {
            // Update existing reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.userId === (loggedInUser?.id || 0) &&
                r.messageId === data.messageId
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
                  userId: loggedInUser?.id || 0,
                  reaction: data.reaction,
                  createdAt: now,
                },
              ],
            };
          }
        }
        return msg;
      });
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(data.chatChannelId, {
        ...existing,
        messages: updated,
      });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:add_reaction", data);
  };

  // Remove reaction
  const handleRemoveReaction = (messageId: number, chatChannelId: number) => {
    setChannelStateMap(prev => {
      const existing = prev.get(chatChannelId);
      if (!existing) return prev;
      const updated = existing.messages.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: msg.reactions.filter(
                r => !(r.userId === 1 && r.messageId === messageId)
              ),
            }
          : msg
      );
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existing,
        messages: updated,
      });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:remove_reaction", { messageId, messageCreatedAt, chatChannelId });
  };

  /**@description Load channel messages from API*/
  const handleLoadChannelMessages = async ({
    chatChannelId,
  }: {
    chatChannelId: number;
    limit?: number;
  }) => {
    try {
      const existing = channelStateMap.get(chatChannelId);

      const loadMessageBefore = existing?.messages[0]?.createdAt;

      const query: FetchChannelMessagesParam = {
        chatChannelId,
        before: loadMessageBefore ? loadMessageBefore : undefined,
        limit: 50,
      };
      const messages = await dispatch(
        fetchChannelMessagesAction(query)
      ).unwrap();
      if (messages.length > 0) {
        // Update channelStateMap with messages
        setChannelStateMap(prev => {
          const tempChannelStateMap = new Map(prev);
          const current = tempChannelStateMap.get(chatChannelId) || {
            chatChannelId,
            messages: [],
            loading: false,
            error: null,
            typingUserIds: [],
          };
          const tempMessages = [...messages, ...current.messages];
          tempChannelStateMap.set(chatChannelId, {
            ...current,
            messages: tempMessages,
            loading: false,
          });
          return tempChannelStateMap;
        });
      }
    } catch (e) {
      console.error("Failed to load messages from API:", e);
    }
  };

  /**@description Select a channel and load its messages*/
  const handleSelectChannel = (channel: ChatChannel | null) => {
    if (!channel) {
      return;
    }

    setSelectedChannelId(channel.id);

    // Join channel via socket
    if (SocketManager.socketInstance && tenantId) {
      SocketManager.socketInstance.emit("chat:joinChannel", {
        tenantId,
        chatChannelId: channel.id,
      });
    }

    // handleMarkAsRead(channel.id);
    void handleLoadChannelMessages({ chatChannelId: channel.id });
  };

  // Set typing indicator
  const handleSetTyping = (chatChannelId: number, isTyping: boolean) => {
    console.log("bharat-handleSetTyping");
    const userId = 1; // Current user ID (replace with real)
    setChannelStateMap(prev => {
      const existing =
        prev.get(chatChannelId) ||
        ({
          chatChannelId,
          messages: [],
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
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, { ...existing, typingUserIds });
      return tempChannelStateMap;
    });

    // TODO: Emit socket event to backend
    // socket.emit("chat:typing", { chatChannelId, isTyping });
  };

  // Clear error
  const handleClearError = () => {
    setError(null);
  };

  // Create new channel
  const handleCreateChannel = (data: CreateChatChannelSchema): ChatChannel => {
    // Get max channel ID from channelStateMap
    const existingIds = Array.from(channelStateMap.keys());
    const newChannelId =
      existingIds.length > 0 ? Math.max(...existingIds) + 1 : 200;
    const now = new Date().toISOString();

    const welcomeMessage: ChatMessage = {
      id: newChannelId * 1000,
      chatChannelId: newChannelId,
      senderUserId: loggedInUser?.id || 0,
      text: `Welcome to #${data.name}!`,
      isEdited: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      reactions: [],
      receipt: [],
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
    };

    setChannelStateMap(prev => {
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(newChannelId, {
        chatChannelId: newChannelId,
        messages: [welcomeMessage],
        loading: false,
        error: null,
        typingUserIds: [],
      });
      return tempChannelStateMap;
    });
    setSelectedChannelId(newChannel.id);
    handleMarkAsRead(newChannel.id);

    return newChannel;
  };

  console.log("bharat123");

  const value = useMemo<ChatContextType>(
    () => ({
      channelStateMap,
      selectedChannelId,
      chatUsers,
      isLoading,
      error,
      handleSelectChannel,
      handleSendMessage,
      handleEditMessage,
      handleDeleteMessage,
      handleAddReaction,
      handleRemoveReaction,
      handleMarkAsRead,
      handleSetTyping,
      handleClearError,
      handleCreateChannel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelStateMap, selectedChannelId, chatUsers, isLoading, error]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
