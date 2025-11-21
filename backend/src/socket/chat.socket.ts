import { Server } from "socket.io";
import { SocketManager, AuthenticatedSocket } from "./socketManager";
import {
  ChatMessageSchema,
  SendChatMessageSchema,
} from "@src/schemas/chat.schema";
import Chat from "@src/services/chat.service";

export default class ChatSocket {
  constructor(
    private socketIo: Server,
    private socket: AuthenticatedSocket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("chat:joinUserChannels", data => {
      this.handleJoinUserChannels(data);
    });
    this.socket.on("chat:joinChannel", data => {
      this.handleJoinChannel(data);
    });

    this.socket.on("chat:leaveChannel", data => {
      this.handleLeaveChannel(data);
    });

    this.socket.on("chat:send", data => {
      console.log("Chat message received:", data);
    });

    this.socket.on("chat:typing", payload => {
      this.handleTyping(payload);
    });
  }

  private handleJoinUserChannels(data: {
    tenantId: number;
    chatChannelIds: number[];
  }) {
    const user = this.socket.user;
    const tenantId = user?.tenantId;
    const db = this.socket.db;
    if (!data.tenantId || !data.chatChannelIds) {
      this.socket.emit("error", {
        message: "tenantId and chatChannelIds are required",
        category: "chat",
      });
      return;
    }
  }

  private handleJoinChannel(data: { tenantId: number; chatChannelId: number }) {
    const db = this.socket.db;
    if (!data.tenantId || !data.chatChannelId) {
      this.socket.emit("error", {
        message: "tenantId and chatChannelId are required",
        category: "chat",
      });
      return;
    }

    const roomName = `chatChannel?tenantId=${data.tenantId}&chatChannelId=${data.chatChannelId}`;
    this.socket.join(roomName);

    console.log(
      `Socket ${this.socket.id} joined tenant ${data.tenantId} channel ${data.chatChannelId}`
    );
  }

  private handleLeaveChannel(data: {
    tenantId: number;
    chatChannelId: number;
  }) {
    if (!data.tenantId || !data.chatChannelId) {
      this.socket.emit("error", {
        message: "tenantId and chatChannelId are required",
        category: "chat",
      });
      return;
    }

    const roomName = `chatChannel?tenantId=${data.tenantId}&chatChannelId=${data.chatChannelId}`;
    this.socket.leave(roomName);

    console.log(`Socket ${this.socket.id} left channel ${data.chatChannelId}`);
  }

  private handleTyping(payload: {
    tenantId: number;
    chatChannelId: number;
    isTyping: boolean;
  }) {
    if (!payload.tenantId || !payload.chatChannelId) {
      return;
    }

    const roomName = `chatChannel?tenantId=${payload.tenantId}&chatChannelId=${payload.chatChannelId}`;

    // Emit typing indicator to channel room
    this.socketIo.to(roomName).emit("chat:typing:update", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // ⭐ Static methods for controllers (after DB operations)

  /**
   * Emit new message to channel room
   */
  static notifyChatMessage(
    tenantId: number,
    chatChannelId: number,
    message: SendChatMessageSchema
  ) {
    const io = SocketManager.getSocketIo();
    const roomName = `chatChannel?tenantId=${tenantId}&chatChannelId=${chatChannelId}`;
    io.to(roomName).emit("chat:new_message", {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit channel updated event
   */
  static notifyChannelUpdated(
    tenantId: number,
    chatChannelId: number,
    channelData: any
  ) {
    const io = SocketManager.getSocketIo();
    const roomName = `chatChannel?tenantId=${tenantId}&chatChannelId=${chatChannelId}`;
    io.to(roomName).emit("chat:channel_updated", {
      ...channelData,
      chatChannelId,
      timestamp: new Date().toISOString(),
    });
  }
}
