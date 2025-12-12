import { SocketManager, AuthenticatedSocket } from "../socketManager";
import { SendChatMessageSchema } from "@src/schemaAndTypes/chat.schema";
import Chat from "@src/services/chat.service";
import { getChatChannelRoomName } from "@src/utils/chatHelper";

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
      socket.emit("error", {
        message: "userId does not match",
        category: "chat",
      });
      return;
    } else if (!data.tenantId || !data.userId) {
      socket.emit("error", {
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
      socket.emit("error", {
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
      socket.emit("error", {
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
    io.to(roomName).emit("chat:typing:update", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // ⭐ Static methods for controllers (after DB operations)

  /**
   * Emit new message to channel room
   */
  static notifyChatMessage({
    tenantId,
    chatChannelId,
    message,
  }: {
    tenantId: number;
    chatChannelId: number;
    message: SendChatMessageSchema & {
      tempId?: number;
      senderSocketId?: string;
    };
  }) {
    const io = SocketManager.getSocketIo();
    const roomName = getChatChannelRoomName({
      tenantId,
      chatChannelId,
    });
    io.to(roomName).emit("chat:new_message", {
      ...message,
      tempId: message.tempId,
      senderSocketId: message.senderSocketId,
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
    io.to(roomName).emit("chat:channel_updated", {
      ...channelData,
      chatChannelId,
      timestamp: new Date().toISOString(),
    });
  }
}
