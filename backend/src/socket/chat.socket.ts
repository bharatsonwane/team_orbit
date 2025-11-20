import { Server } from "socket.io";
import { SocketManager, AuthenticatedSocket } from "./socketManager";
import {
  ChatMessageSchema,
  SendChatMessageSchema,
} from "@src/schemas/chat.schema";

export default class ChatSocket {
  constructor(
    private io: Server,
    private socket: AuthenticatedSocket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
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

  private handleJoinChannel(data: { tenantId: number; chatChannelId: number }) {
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
    this.io.to(roomName).emit("chat:typing:update", {
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
    const io = SocketManager.getIO();
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
    const io = SocketManager.getIO();
    const roomName = `chatChannel?tenantId=${tenantId}&chatChannelId=${chatChannelId}`;
    io.to(roomName).emit("chat:channel_updated", {
      ...channelData,
      chatChannelId,
      timestamp: new Date().toISOString(),
    });
  }
}
