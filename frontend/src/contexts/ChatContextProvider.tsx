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
} from "../schemaAndTypes/chatSchema";
import { dummyChatUsers, setDummyChatData } from "../utils/dummyChat";
import type { AppDispatch } from "@/redux/store";
import {
  fetchChatChannelsAction,
  sendChannelMessageAction,
  fetchChannelMessagesAction,
  MessageReactionAction,
  archiveChatMessageAction,
  updateChannelMessageAction,
} from "@/redux/actions/chatActions";
import { useAuthService } from "./AuthContextProvider";
import { SocketManager } from "@/lib/socketManager";
import { getUsersAction } from "@/redux/actions/userActions";
import type { TenantUser } from "@/schemaAndTypes/userSchema";

// Chat Context Type
export interface ChatContextType {
  // Shared State
  channelStateMap: ChannelStateMap; // chatChannelId -> ChannelState
  selectedChannelId: number | null;
  chatUsers: ChatUser[]; // Array of all chat users for lookups
  isLoading: boolean;
  error: string | null;

  // Actions - Group Chat
  handleSelectChannel: ({ channelId }: { channelId: number }) => void;
  handleCreateChannel: (data: CreateChatChannelSchema) => ChatChannel;

  // Shared Actions
  handleSendMessage: (data: SendMessageData) => void;
  handleEditMessage: (data: EditMessageData) => void;
  handleArchiveMessage: ({
    messageId,
    chatChannelId,
  }: {
    messageId: number;
    chatChannelId: number;
  }) => void;
  handleReaction: (data: AddReactionData) => Promise<void>;
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
  handleArchiveMessage: () => {},
  handleReaction: async () => {},
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
    SocketManager.socketIo.on("chat:new_message", handleNotifyChatMessage);
    SocketManager.socketIo.on(
      "chat:message_archived",
      handleNotifyChatMessageArchived
    );
    SocketManager.socketIo.on(
      "chat:message_update",
      handleNotifyChatMessageUpdate
    );
    SocketManager.socketIo.on("chat:reaction_update", handleNotifyChatReaction);
    SocketManager.socketIo.on(
      "chat:channel_updated",
      handleNotifyChannelUpdated
    );
    SocketManager.socketIo.on("chat:typing:update", handleNotifyTypingUpdate);
    return () => {
      SocketManager.socketIo.off("chat:new_message", handleNotifyChatMessage);
      SocketManager.socketIo.off(
        "chat:message_archived",
        handleNotifyChatMessageArchived
      );
      SocketManager.socketIo.off(
        "chat:message_update",
        handleNotifyChatMessageUpdate
      );
      SocketManager.socketIo.off(
        "chat:reaction_update",
        handleNotifyChatReaction
      );
      SocketManager.socketIo.off(
        "chat:channel_updated",
        handleNotifyChannelUpdated
      );
      SocketManager.socketIo.off(
        "chat:typing:update",
        handleNotifyTypingUpdate
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetChatData = () => {
    setChannelStateMap(new Map());
    setSelectedChannelId(null);
    setChatUsers([]);
    setIsLoading(false);
    setError(null);
  };

  // Listen for new messages
  const handleNotifyChatMessage = (
    data: ChatMessage & { senderSocketId?: string; tempId?: number }
  ) => {
    const currentSocketId = SocketManager.socketIo?.id;
    const isSentByThisDevice = data.senderSocketId === currentSocketId;

    const message: ChatMessage = {
      id: data.id,
      chatChannelId: data.chatChannelId,
      senderUserId: data.senderUserId,
      replyToMessageId: data.replyToMessageId ?? undefined,
      text: data.text ?? undefined,
      mediaUrl: data.mediaUrl ?? undefined,
      isEdited: data.isEdited ?? false,
      isArchived: data.isArchived ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      reactions: data.reactions ?? [],
      receipt: data.receipt ?? [],
    };

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(message.chatChannelId);
      if (!existingChannelData) return prev;

      // Check if message already exists (avoid duplicates)
      const messageExists = existingChannelData.messages.some(
        msg => msg.id === message.id
      );
      if (messageExists) {
        return prev;
      }

      const existingMessageIndex = existingChannelData.messages.findIndex(
        msg => msg.id === data.tempId || msg.id === message.id
      );

      const messages = [...existingChannelData.messages];

      if (existingMessageIndex !== -1) {
        messages[existingMessageIndex] = message;
      } else {
        messages.push(message);
      }

      // Add new message to the end of messages array
      const tempChannelData = {
        ...existingChannelData,
        messages,
        updatedAt: message.updatedAt,
      };
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(message.chatChannelId, tempChannelData);
      return tempChannelStateMap;
    });
  };

  const handleNotifyChatMessageArchived = ({
    messageId,
    chatChannelId,
    senderSocketId,
    archivedAt,
  }: {
    messageId: number;
    chatChannelId: number;
    archivedAt: string;
    senderSocketId?: string;
  }) => {
    const currentSocketId = SocketManager.socketIo?.id;
    const isSentByThisDevice = senderSocketId === currentSocketId;

    // Don't update state for reactions sent by this device (already optimistically updated)
    if (isSentByThisDevice) return;

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId)!;
      const tempMessages = existingChannelData.messages.map(msg =>
        msg.id == messageId
          ? { ...msg, isArchived: true, archivedAt: archivedAt }
          : msg
      );
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existingChannelData,
        messages: tempMessages,
        updatedAt: new Date().toISOString(),
      });
      return tempChannelStateMap;
    });
  };

  // Handle incoming message updates from socket
  const handleNotifyChatMessageUpdate = ({
    messageId,
    chatChannelId,
    senderSocketId,
    updatedMessage,
  }: {
    messageId: number;
    chatChannelId: number;
    senderSocketId?: string;
    updatedMessage: ChatMessage;
  }) => {
    const currentSocketId = SocketManager.socketIo?.id;
    const isSentByThisDevice = senderSocketId === currentSocketId;

    // Don't update state for updates sent by this device (already optimistically updated)
    if (isSentByThisDevice) return;

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId);
      if (!existingChannelData) return prev;

      const tempMessages = existingChannelData.messages.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              text: updatedMessage.text,
              mediaUrl: updatedMessage.mediaUrl,
              isEdited: true,
              updatedAt: updatedMessage.updatedAt || new Date().toISOString(),
            }
          : msg
      );

      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existingChannelData,
        messages: tempMessages,
        updatedAt: new Date().toISOString(),
      });
      return tempChannelStateMap;
    });
  };

  // Handle incoming reaction updates from socket
  const handleNotifyChatReaction = (data: {
    messageId: number;
    chatChannelId: number;
    userId: number;
    reactionId: number;
    reaction: string;
    action: "add" | "remove" | "update";
    senderSocketId?: string;
  }) => {
    const currentSocketId = SocketManager.socketIo?.id;
    const isSentByThisDevice = data.senderSocketId === currentSocketId;

    // Don't update state for reactions sent by this device (already optimistically updated)
    if (isSentByThisDevice) return;

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(data.chatChannelId);
      if (!existingChannelData) return prev;

      const messages = [...existingChannelData.messages];
      const messageIndex = messages.findIndex(msg => msg.id == data.messageId);

      if (messageIndex === -1) return prev;

      const message = { ...messages[messageIndex] };
      const reactions = [...(message.reactions || [])];
      const reactionIndex = reactions.findIndex(
        r => r.reaction === data.reaction && r.userId === data.userId
      );

      if (data.action === "remove") {
        if (reactionIndex !== -1) {
          reactions.splice(reactionIndex, 1);
        }
      } else if (data.action === "add" || data.action === "update") {
        if (reactionIndex !== -1) {
          reactions[reactionIndex] = {
            ...reactions[reactionIndex],
            reaction: data.reaction,
          };
        } else {
          reactions.push({
            id: data.reactionId,
            userId: data.userId,
            reaction: data.reaction,
            createdAt: new Date().toISOString(),
          });
        }
      }

      message.reactions = reactions;
      messages[messageIndex] = message;

      const tempChannelData = {
        ...existingChannelData,
        messages,
        updatedAt: new Date().toISOString(),
      };

      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(data.chatChannelId, tempChannelData);
      return tempChannelStateMap;
    });
  };

  // Listen for channel updates (when user is added to a new channel)
  const handleNotifyChannelUpdated = (data: {
    chatChannelId: number;
    name?: string;
    description?: string;
    type?: "direct" | "group";
    image?: string;
    members?: number[];
  }) => {
    setChannelStateMap(prev => {
      const existingChannelData = prev.get(data.chatChannelId);
      if (existingChannelData) {
        // Channel already exists, just update it
        const tempChannelData = {
          ...existingChannelData,
          name: data.name ?? existingChannelData.name,
          description: data.description ?? existingChannelData.description,
          type: data.type ?? existingChannelData.type,
          image: data.image ?? existingChannelData.image,
          members: data.members ?? existingChannelData.members,
        };
        const tempChannelStateMap = new Map(prev);
        tempChannelStateMap.set(data.chatChannelId, tempChannelData);
        return tempChannelStateMap;
      } else {
        // New channel, add it to state
        const newChannelState: ChannelState = {
          chatChannelId: data.chatChannelId,
          messages: [],
          loading: false,
          error: null,
          typingUsers: [],
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

  // Handle incoming typing events from socket
  const handleNotifyTypingUpdate = (data: {
    userId: number;
    chatChannelId: number;
    isTyping: boolean;
    senderSocketId?: string;
  }) => {
    const currentSocketId = SocketManager.socketIo?.id;
    const isSentByThisDevice = data.senderSocketId === currentSocketId;

    // Don't update state for typing events sent by this device
    if (isSentByThisDevice) return;

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(data.chatChannelId)!;
      const typingUsers = existingChannelData.typingUsers ?? [];
      let newTypingUserIds = [...typingUsers];

      const userTypingIndex = newTypingUserIds.findIndex(
        item => item.userId == data.userId
      );

      if (data.isTyping) {
        // Add user to typing list if not already there

        const userTypingData = {
          userId: data.userId,
          typedAt: new Date().toISOString(),
        };

        if (userTypingIndex === -1) {
          newTypingUserIds.push(userTypingData);
        } else {
          newTypingUserIds[userTypingIndex] = userTypingData;
        }
      } else if (userTypingIndex != -1) {
        // Remove user from typing list
        newTypingUserIds.splice(userTypingIndex, 1);
      }

      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(data.chatChannelId, {
        ...existingChannelData,
        typingUsers: newTypingUserIds,
        updatedAt: new Date().toISOString(),
      });
      return tempChannelStateMap;
    });
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

  /**@description Join socketIo rooms for all user's chat channels*/
  const handleJoinUsersChatChannelsRooms = ({
    userId,
    tenantId,
  }: {
    userId: number;
    tenantId: number;
  }) => {
    if (!SocketManager.socketIo || !tenantId) {
      return;
    }
    SocketManager.socketIo.emit("chat:joinUserChatChannels", {
      tenantId,
      userId,
    });
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

      await Promise.all(
        apiChannels.map(async (channel: ChatChannelListItem) => {
          const existingChannel = tempChannelStateMap.get(channel.id);

          const channelMessages = await handleLoadChannelMessages({
            chatChannelId: channel.id,
            isInitialLoading: true,
          });

          if (existingChannel) {
            tempChannelStateMap.set(channel.id, {
              ...existingChannel,
              messages: [
                ...(channelMessages ? channelMessages : []),
                ...existingChannel.messages,
              ],
              unreadCount: existingChannel.unreadCount ?? 0,
              updatedAt: channel.updatedAt,
            });
          } else {
            tempChannelStateMap.set(channel.id, {
              chatChannelId: channel.id,
              messages: [...(channelMessages ? channelMessages : [])],
              loading: false,
              error: null,
              typingUsers: [],
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
        })
      );

      handleJoinUsersChatChannelsRooms({
        userId: loggedInUser?.id || 0,
        tenantId: tenantId || 0,
      });

      if (apiChannels?.[0]) {
        handleSelectChannel({ channelId: apiChannels?.[0].id });
      }
    } catch (e) {
      setError(
        typeof e === "string" ? e : "Unable to load channels. Please try again."
      );
    } finally {
      setIsLoading(false);
    }

    // Set state once with all data
    setChannelStateMap(tempChannelStateMap);
  };

  // Mark as read
  const handleMarkAsRead = (chatChannelId: number) => {
    // Update channel unread count
    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId);
      if (!existingChannelData) return prev;
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existingChannelData,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      });
      return tempChannelStateMap;
    });
  };

  /**@description Send message*/
  const handleSendMessage = (data: SendMessageData) => {
    if (!data.chatChannelId || (!data.text && !data.mediaUrl)) return;

    if (!loggedInUser) {
      setError("You must be logged in to send messages.");
      return;
    }

    const chatChannelId = data.chatChannelId;

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
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      reactions: [],
      receipt: [],
    };

    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId);
      const messages = existingChannelData?.messages || [];
      const nextState: ChannelState = {
        ...existingChannelData,
        chatChannelId,
        messages: [...messages, tempNewMessage],
        loading: false,
        error: null,
        typingUsers: existingChannelData?.typingUsers ?? [],
        lastReadAt: existingChannelData?.lastReadAt,
        updatedAt: new Date().toISOString(),
      };
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, nextState);
      return tempChannelStateMap;
    });

    const send = async () => {
      try {
        const currentSocketId = SocketManager.socketIo?.id;
        const result = await dispatch(
          sendChannelMessageAction({
            chatChannelId,
            text: data.text,
            mediaUrl: data.mediaUrl,
            replyToMessageId: data.replyToMessageId,
            tempId,
            socketId: currentSocketId,
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
          isArchived: false,
        };

        setChannelStateMap(prev => {
          const existingChannelData = prev.get(chatChannelId);
          if (!existingChannelData) return prev;
          const tempMessages = existingChannelData.messages.map(message =>
            message.id === tempId ? persistedMessage : message
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existingChannelData,
            messages: tempMessages,
            updatedAt: persistedMessage.updatedAt,
          });
          return tempChannelStateMap;
        });
      } catch (err) {
        setChannelStateMap(prev => {
          const existingChannelData = prev.get(chatChannelId);
          if (!existingChannelData) return prev;
          const tempMessages = existingChannelData.messages.filter(
            message => message.id !== tempId
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existingChannelData,
            messages: tempMessages,
            updatedAt: existingChannelData.updatedAt,
          });
          return tempChannelStateMap;
        });

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
    if (!data.text?.trim()) {
      setError("Message content is required");
      return;
    }

    if (!loggedInUser) {
      setError("You must be logged in to edit messages.");
      return;
    }

    const { messageId, chatChannelId, text } = data;

    // Optimistic update
    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId);
      if (!existingChannelData) return prev;

      const tempMessages = existingChannelData.messages.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              text: text,
              isEdited: true,
              updatedAt: new Date().toISOString(),
            }
          : msg
      );

      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existingChannelData,
        messages: tempMessages,
        updatedAt: new Date().toISOString(),
      });
      return tempChannelStateMap;
    });

    const edit = async () => {
      try {
        const currentSocketId = SocketManager.socketIo?.id;
        const result = await dispatch(
          updateChannelMessageAction({
            messageId,
            chatChannelId,
            text,
            socketId: currentSocketId,
          })
        ).unwrap();

        const updatedMessage: ChatMessage = {
          ...result,
          text: result.text ?? undefined,
          isEdited: true, // Ensure isEdited is always set for edited messages
        };

        setChannelStateMap(prev => {
          const existingChannelData = prev.get(chatChannelId);
          if (!existingChannelData) return prev;
          const tempMessages = existingChannelData.messages.map(message =>
            message.id === messageId
              ? { ...message, ...updatedMessage }
              : message
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existingChannelData,
            messages: tempMessages,
            updatedAt: updatedMessage.updatedAt,
          });
          return tempChannelStateMap;
        });
      } catch (err) {
        setChannelStateMap(prev => {
          const existingChannelData = prev.get(chatChannelId);
          if (!existingChannelData) return prev;
          const tempMessages = existingChannelData.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, isEdited: false, updatedAt: msg.updatedAt }
              : msg
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existingChannelData,
            messages: tempMessages,
            updatedAt: existingChannelData.updatedAt,
          });
          return tempChannelStateMap;
        });

        setError(
          typeof err === "string"
            ? err
            : "Failed to update message. Please try again."
        );
      }
    };

    void edit();
  };

  // Delete message
  const handleArchiveMessage = ({
    messageId,
    chatChannelId,
  }: {
    messageId: number;
    chatChannelId: number;
  }) => {
    const now = new Date().toISOString();
    setChannelStateMap(prev => {
      const existingChannelData = prev.get(chatChannelId);
      if (!existingChannelData) return prev;
      const tempMessages = existingChannelData.messages.map(msg =>
        msg.id === messageId
          ? { ...msg, isArchived: true, archivedAt: now }
          : msg
      );
      const tempChannelStateMap = new Map(prev);
      tempChannelStateMap.set(chatChannelId, {
        ...existingChannelData,
        messages: tempMessages,
      });
      return tempChannelStateMap;
    });

    const archive = async () => {
      try {
        const currentSocketId = SocketManager.socketIo?.id;

        const result = await dispatch(
          archiveChatMessageAction({
            chatChannelId,
            socketId: currentSocketId,
            messageId,
          })
        ).unwrap();
      } catch (err) {
        setChannelStateMap(prev => {
          const existingChannelData = prev.get(chatChannelId)!;
          const tempMessages = existingChannelData.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, isArchived: false, archivedAt: "" }
              : msg
          );
          const tempChannelStateMap = new Map(prev);
          tempChannelStateMap.set(chatChannelId, {
            ...existingChannelData,
            messages: tempMessages,
          });
          return tempChannelStateMap;
        });

        setError(
          typeof err === "string"
            ? err
            : "Failed to Delete message. Please try again."
        );
      }
    };
    archive();
  };

  // Add/Update/Remove reaction - single endpoint handles all cases
  const handleReaction = async (data: AddReactionData) => {
    try {
      // Call API - backend handles whether to add, update, or remove
      const reactionResult = await dispatch(
        MessageReactionAction({
          ...data,
          socketId: SocketManager.socketIo?.id,
        })
      ).unwrap();

      // Update local state based on the response
      setChannelStateMap(prev => {
        const existingChannelData = prev.get(data.chatChannelId);
        if (!existingChannelData) return prev;

        const tempMessages = existingChannelData.messages.map(msg => {
          if (msg.id === data.messageId) {
            if (reactionResult.isRemoved) {
              // Remove the user's reaction
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  r =>
                    !(
                      r.userId === (loggedInUser?.id || 0) &&
                      r.reaction === data.reaction
                    )
                ),
              };
            } else if (reactionResult.isUpdated) {
              // Update existing reaction
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.userId === (loggedInUser?.id || 0)
                    ? {
                        id: reactionResult.id,
                        messageId: reactionResult.messageId,
                        userId: reactionResult.userId,
                        reaction: reactionResult.reaction,
                        createdAt: reactionResult.createdAt,
                      }
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
                    id: reactionResult.id,
                    messageId: reactionResult.messageId,
                    userId: reactionResult.userId,
                    reaction: reactionResult.reaction,
                    createdAt: reactionResult.createdAt,
                  },
                ],
              };
            }
          }
          return msg;
        });

        const tempChannelStateMap = new Map(prev);
        tempChannelStateMap.set(data.chatChannelId, {
          ...existingChannelData,
          messages: tempMessages,
        });
        return tempChannelStateMap;
      });
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  /**@description Load channel messages from API*/
  const handleLoadChannelMessages = async ({
    chatChannelId,
    isInitialLoading = false,
  }: {
    chatChannelId: number;
    isInitialLoading?: boolean;
    limit?: number;
  }) => {
    try {
      const existingChannelData = channelStateMap.get(chatChannelId);

      const loadMessageBefore = existingChannelData?.messages[0]?.createdAt;

      const query: FetchChannelMessagesParam = {
        chatChannelId,
        before: loadMessageBefore ? loadMessageBefore : undefined,
        limit: 50,
      };
      const messages = await dispatch(
        fetchChannelMessagesAction(query)
      ).unwrap();

      if (messages.length > 0 && !isInitialLoading) {
        // Update channelStateMap with messages
        setChannelStateMap(prev => {
          const tempChannelStateMap = new Map(prev);
          const current = tempChannelStateMap.get(chatChannelId) || {
            chatChannelId,
            messages: [],
            loading: false,
            error: null,
            typingUsers: [],
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

      return messages;
    } catch (e) {
      console.error("Failed to load messages from API:", e);
    }
  };

  /**@description Select a channel and load its messages*/
  const handleSelectChannel = ({ channelId }: { channelId: number }) => {
    if (!channelId) {
      return;
    }

    setSelectedChannelId(channelId);

    // handleMarkAsRead(channelId);
    void handleLoadChannelMessages({ chatChannelId: channelId });
  };

  // Set typing indicator
  const handleSetTyping = (chatChannelId: number, isTyping: boolean) => {
    const userId = loggedInUser?.id;
    if (!userId || !SocketManager.socketIo) return;

    // Emit socket event to notify other users
    SocketManager.socketIo.emit("chat:typing", {
      chatChannelId,
      isTyping,
      socketId: SocketManager.socketIo.id,
    });
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
      isArchived: false,
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
        typingUsers: [],
      });
      return tempChannelStateMap;
    });
    setSelectedChannelId(newChannel.id);
    handleMarkAsRead(newChannel.id);

    return newChannel;
  };

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
      handleArchiveMessage,
      handleReaction,
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
