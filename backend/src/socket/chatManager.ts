import { Server } from "socket.io";
import { AuthenticatedSocket, ConnectionManager } from "./socketManager";
import logger from "../utils/logger";

/**
 * Chat Manager
 * Manages all chat-related Socket.IO functionality
 */
class ChatManager {
  private io: Server | null = null;

  /**
   * Set Socket.IO server instance
   */
  setIO(io: Server): void {
    this.io = io;
  }

  /**
   * Register chat event listeners
   */
  registerListeners(
    socket: AuthenticatedSocket,
    connectionManager: ConnectionManager
  ): void {
    // Join channel
    socket.on("chat:join_channel", async data => {
      await this.handleJoinChannel(socket, data, connectionManager);
    });

    // Leave channel
    socket.on("chat:leave_channel", async data => {
      await this.handleLeaveChannel(socket, data, connectionManager);
    });

    // Send message
    socket.on("chat:send_message", async data => {
      await this.handleSendMessage(socket, data);
    });

    // Edit message
    socket.on("chat:edit_message", async data => {
      await this.handleEditMessage(socket, data);
    });

    // Delete message
    socket.on("chat:delete_message", async data => {
      await this.handleDeleteMessage(socket, data);
    });

    // Typing indicator
    socket.on("chat:typing", async data => {
      await this.handleTyping(socket, data);
    });

    // Mark as read
    socket.on("chat:mark_as_read", async data => {
      await this.handleMarkAsRead(socket, data);
    });

    // Add reaction
    socket.on("chat:add_reaction", async data => {
      await this.handleAddReaction(socket, data);
    });

    // Remove reaction
    socket.on("chat:remove_reaction", async data => {
      await this.handleRemoveReaction(socket, data);
    });
  }

  /**
   * Handle join channel
   */
  private async handleJoinChannel(
    socket: AuthenticatedSocket,
    data: any,
    connectionManager: ConnectionManager
  ): Promise<void> {
    const { channelId } = data;

    if (!channelId) {
      socket.emit("error", {
        message: "channelId is required",
        category: "chat",
      });
      return;
    }

    // TODO: Validate user has access to channel (check database)

    // Join channel room
    this.joinChannel(socket, channelId, connectionManager);

    // Emit success
    socket.emit("chat:channel_joined", {
      channelId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle leave channel
   */
  private async handleLeaveChannel(
    socket: AuthenticatedSocket,
    data: any,
    connectionManager: ConnectionManager
  ): Promise<void> {
    const { channelId } = data;

    if (!channelId) {
      socket.emit("error", {
        message: "channelId is required",
        category: "chat",
      });
      return;
    }

    // Leave channel room
    this.leaveChannel(socket, channelId, connectionManager);

    // Emit success
    socket.emit("chat:channel_left", {
      channelId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle send message
   */
  private async handleSendMessage(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { channelId, message, mediaUrl } = data;

    if (!channelId || (!message && !mediaUrl)) {
      socket.emit("error", {
        message: "channelId and message or mediaUrl are required",
        category: "chat",
      });
      return;
    }

    // TODO: Save message to database
    // TODO: Create message with createdAt for foreign keys
    // TODO: Update chat_channel.lastMessageId and lastMessageAt

    logger.info("Message received", {
      socketId: socket.id,
      userId: socket.userId,
      channelId,
      hasMessage: !!message,
      hasMedia: !!mediaUrl,
    });

    // TODO: Emit to channel after saving to database
    // this.emitNewMessage(channelId, {
    //   messageId,
    //   messageCreatedAt,
    //   channelId,
    //   senderId: socket.userId,
    //   message,
    //   mediaUrl,
    //   createdAt: new Date().toISOString(),
    // });
  }

  /**
   * Handle edit message
   */
  private async handleEditMessage(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { messageId, messageCreatedAt, channelId, message } = data;

    if (!messageId || !messageCreatedAt || !channelId || !message) {
      socket.emit("error", {
        message:
          "messageId, messageCreatedAt, channelId, and message are required",
        category: "chat",
      });
      return;
    }

    // TODO: Validate message ownership and update in database

    this.emitMessageEdited(channelId, {
      messageId,
      messageCreatedAt,
      channelId,
      message,
      editedAt: new Date().toISOString(),
    });
  }

  /**
   * Handle delete message
   */
  private async handleDeleteMessage(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { messageId, messageCreatedAt, channelId } = data;

    if (!messageId || !messageCreatedAt || !channelId) {
      socket.emit("error", {
        message: "messageId, messageCreatedAt, and channelId are required",
        category: "chat",
      });
      return;
    }

    // TODO: Validate message ownership and soft delete in database

    this.emitMessageDeleted(channelId, {
      messageId,
      messageCreatedAt,
      channelId,
      deletedAt: new Date().toISOString(),
    });
  }

  /**
   * Handle typing indicator
   */
  private async handleTyping(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { channelId, isTyping } = data;

    if (!channelId || typeof isTyping !== "boolean") {
      return;
    }

    this.emitTyping(channelId, socket.userId!, isTyping);
  }

  /**
   * Handle mark as read
   */
  private async handleMarkAsRead(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { channelId, messageId } = data;

    if (!channelId || !messageId) {
      socket.emit("error", {
        message: "channelId and messageId are required",
        category: "chat",
      });
      return;
    }

    // TODO: Update chat_message_status in database
    // TODO: Update chat_channel_user_mapping.lastReadMessageId

    this.emitReadReceipt(channelId, socket.userId!, messageId);
  }

  /**
   * Handle add reaction
   */
  private async handleAddReaction(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { messageId, messageCreatedAt, channelId, reaction } = data;

    if (!messageId || !messageCreatedAt || !channelId || !reaction) {
      socket.emit("error", {
        message:
          "messageId, messageCreatedAt, channelId, and reaction are required",
        category: "chat",
      });
      return;
    }

    // TODO: Insert/update in chat_message_reaction table

    this.emitReaction(channelId, {
      messageId,
      messageCreatedAt,
      userId: socket.userId,
      reaction,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Handle remove reaction
   */
  private async handleRemoveReaction(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { messageId, messageCreatedAt, channelId } = data;

    if (!messageId || !messageCreatedAt || !channelId) {
      socket.emit("error", {
        message: "messageId, messageCreatedAt, and channelId are required",
        category: "chat",
      });
      return;
    }

    // TODO: Delete from chat_message_reaction table

    this.emitReaction(channelId, {
      messageId,
      messageCreatedAt,
      userId: socket.userId,
      reaction: null, // null means removed
      deletedAt: new Date().toISOString(),
    });
  }

  /**
   * Join user to a channel room
   */
  joinChannel(
    socket: AuthenticatedSocket,
    channelId: number,
    connectionManager: ConnectionManager
  ): void {
    if (!this.io) {
      logger.warn("Attempted to join channel before Socket.IO initialization");
      return;
    }

    const roomName = `channel_${channelId}`;
    socket.join(roomName);

    // Track channel in connection manager
    connectionManager.addChannelToUser(socket, channelId);

    logger.info("User joined channel room", {
      socketId: socket.id,
      userId: socket.userId,
      channelId,
      roomName,
    });

    // Notify others in the channel
    socket.to(roomName).emit("chat:user_joined", {
      userId: socket.userId,
      channelId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Remove user from a channel room
   */
  leaveChannel(
    socket: AuthenticatedSocket,
    channelId: number,
    connectionManager: ConnectionManager
  ): void {
    if (!this.io) {
      logger.warn("Attempted to leave channel before Socket.IO initialization");
      return;
    }

    const roomName = `channel_${channelId}`;
    socket.leave(roomName);

    // Remove channel from connection manager
    connectionManager.removeChannelFromUser(socket, channelId);

    logger.info("User left channel room", {
      socketId: socket.id,
      userId: socket.userId,
      channelId,
      roomName,
    });

    // Notify others in the channel
    socket.to(roomName).emit("chat:user_left", {
      userId: socket.userId,
      channelId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit new message to channel
   */
  emitNewMessage(channelId: number, messageData: any): void {
    if (!this.io) {
      logger.warn("Attempted to emit message before Socket.IO initialization");
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:new_message", {
      ...messageData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit message edited to channel
   */
  emitMessageEdited(channelId: number, messageData: any): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit message edit before Socket.IO initialization"
      );
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:message_edited", {
      ...messageData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit message deleted to channel
   */
  emitMessageDeleted(channelId: number, messageData: any): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit message delete before Socket.IO initialization"
      );
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:message_deleted", {
      ...messageData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit typing indicator to channel
   */
  emitTyping(channelId: number, userId: number, isTyping: boolean): void {
    if (!this.io) {
      logger.warn("Attempted to emit typing before Socket.IO initialization");
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:typing", {
      userId,
      channelId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit read receipt to channel
   */
  emitReadReceipt(channelId: number, userId: number, messageId: number): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit read receipt before Socket.IO initialization"
      );
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:read_receipt", {
      userId,
      channelId,
      messageId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit reaction to channel
   */
  emitReaction(channelId: number, reactionData: any): void {
    if (!this.io) {
      logger.warn("Attempted to emit reaction before Socket.IO initialization");
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:reaction", {
      ...reactionData,
      channelId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit channel updated to all channel members
   */
  emitChannelUpdated(channelId: number, channelData: any): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit channel update before Socket.IO initialization"
      );
      return;
    }

    this.io.to(`channel_${channelId}`).emit("chat:channel_updated", {
      ...channelData,
      channelId,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const chatManager = new ChatManager();
export default chatManager;
