import { SocketManager, AuthenticatedSocket } from "../utils/socketManager";
import { SendChatMessageSchema } from "@src/schemaAndTypes/chat.schema";
import Chat from "@src/services/chat.service";
import { getChatChannelRoomName } from "@src/utils/chatHelper";
import { chatSocketEvents } from "../utils/socketEvents";

export class ChatSocketController {
  static async handleJoinUserChatChannels({
    socket,
    data,
  }: {
    socket: AuthenticatedSocket;
    data: { userId: number; tenantId: number };
  }) {
    const user = socket.user;
    const db = socket.db;

    if (user?.userId !== data.userId) {
      socket.emit(chatSocketEvents.CHAT_ERROR, {
        message: "userId does not match",
        category: "chat",
      });
      return;
    } else if (!data.tenantId || !data.userId) {
      socket.emit(chatSocketEvents.CHAT_ERROR, {
        message: "tenantId and userId are required",
        category: "chat",
      });
      return;
    }

    const chatChannels = await Chat.getChatChannelsForUser(db!, data.userId, {
      limit: 100,
      offset: 0,
    });

    chatChannels.forEach(chatChannel => {
      ChatSocketController.handleJoinChannel({
        socket,
        data: {
          tenantId: data.tenantId,
          chatChannelId: chatChannel.id,
        },
      });
    });
  }

  static handleJoinChannel({
    socket,
    data,
  }: {
    socket: AuthenticatedSocket;
    data: { tenantId: number; chatChannelId: number };
  }) {
    if (!data.tenantId || !data.chatChannelId) {
      socket.emit(chatSocketEvents.CHAT_ERROR, {
        message: "tenantId and chatChannelId are required",
        category: "chat",
      });
      return;
    }

    const user = socket.user;

    const roomName = `chatChannel?tenantId=${data.tenantId}&chatChannelId=${data.chatChannelId}`;
    socket.join(roomName);

    console.log(
      `Socket ${socket.id} user ${user?.userId} joined tenant ${data.tenantId} channel ${data.chatChannelId}`
    );
  }

  static handleLeaveChannel({
    socket,
    data,
  }: {
    socket: AuthenticatedSocket;
    data: { tenantId: number; chatChannelId: number };
  }) {
    if (!data.tenantId || !data.chatChannelId) {
      socket.emit(chatSocketEvents.CHAT_ERROR, {
        message: "tenantId and chatChannelId are required",
        category: "chat",
      });
      return;
    }

    const roomName = getChatChannelRoomName({
      tenantId: data.tenantId,
      chatChannelId: data.chatChannelId,
    });
    socket.leave(roomName);

    console.log(`Socket ${socket.id} left channel ${data.chatChannelId}`);
  }

  static handleTyping({
    socket,
    payload,
  }: {
    socket: AuthenticatedSocket;
    payload: {
      tenantId: number;
      chatChannelId: number;
      isTyping: boolean;
    };
  }) {
    if (!payload.tenantId || !payload.chatChannelId) {
      return;
    }

    const roomName = getChatChannelRoomName({
      tenantId: payload.tenantId,
      chatChannelId: payload.chatChannelId,
    });

    // Emit typing indicator to channel room
    const io = SocketManager.getSocketIo();
    io.to(roomName).emit(chatSocketEvents.CHAT_TYPING_UPDATE, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // ⭐ Static methods for controllers (after DB operations)

  /**
   * Emit new message to channel room
   */
  static notifyChatMessage({
    userId,
    socketId,
    tenantId,
    chatChannelId,
    message,
  }: {
    userId: number;
    socketId: string;
    tenantId: number;
    chatChannelId: number;
    message: SendChatMessageSchema & {
      tempId?: number;
    };
  }) {
    const userSockets = SocketManager.getUserSockets(userId);
    const senderSocketId = userSockets?.has(socketId ?? "")
      ? (socketId ?? "")
      : undefined;

    const io = SocketManager.getSocketIo();
    const roomName = getChatChannelRoomName({
      tenantId,
      chatChannelId,
    });
    // Include tempId and senderSocketId in the broadcast
    io.to(roomName).emit(chatSocketEvents.CHAT_NEW_MESSAGE, {
      ...message,
      tempId: message.tempId,
      senderSocketId: senderSocketId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit message reaction update to channel room
   */
  static notifyChatReaction({
    tenantId,
    chatChannelId,
    messageId,
    userId,
    reactionId,
    reaction,
    action,
    senderSocketId,
  }: {
    tenantId: number;
    chatChannelId: number;
    messageId: number;
    userId: number;
    reactionId: number;
    reaction: string;
    action: "add" | "remove" | "update";
    senderSocketId?: string;
  }) {
    const io = SocketManager.getSocketIo();
    const roomName = getChatChannelRoomName({
      tenantId,
      chatChannelId,
    });

    io.to(roomName).emit(chatSocketEvents.CHAT_REACTION_UPDATE, {
      messageId,
      chatChannelId,
      userId,
      reactionId,
      reaction,
      action,
      senderSocketId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit channel updated event
   */
  static notifyChannelUpdated({
    tenantId,
    chatChannelId,
    channelData,
  }: {
    tenantId: number;
    chatChannelId: number;
    channelData: any;
  }) {
    const io = SocketManager.getSocketIo();
    const roomName = getChatChannelRoomName({
      tenantId,
      chatChannelId,
    });
    io.to(roomName).emit(chatSocketEvents.CHAT_CHANNEL_UPDATED, {
      ...channelData,
      chatChannelId,
      timestamp: new Date().toISOString(),
    });
  }
}
