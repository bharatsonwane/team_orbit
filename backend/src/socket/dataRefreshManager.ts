import { AuthenticatedSocket, requireSocketServer } from "./socketManager";
import logger from "../utils/logger";

/**
 * Data Refresh Manager
 * Manages all data refresh-related Socket.IO functionality
 */
class DataRefreshManager {
  /**
   * Register data refresh event listeners
   */
  registerListeners(socket: AuthenticatedSocket): void {
    // Subscribe to entity updates
    socket.on("data_refresh:subscribe", async data => {
      await this.handleSubscribe(socket, data);
    });

    // Unsubscribe from entity updates
    socket.on("data_refresh:unsubscribe", async data => {
      await this.handleUnsubscribe(socket, data);
    });

    // Request immediate refresh
    socket.on("data_refresh:request_refresh", async data => {
      await this.handleRequestRefresh(socket, data);
    });
  }

  /**
   * Handle subscribe to entity
   */
  private async handleSubscribe(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { entityType, entityId } = data;

    if (!entityType) {
      socket.emit("error", {
        message: "entityType is required",
        category: "data_refresh",
      });
      return;
    }

    // Create room name based on entity type and ID
    const roomName = entityId
      ? `${entityType}_${entityId}`
      : `entity_${entityType}`;

    // Join the entity room (socketManager will be passed as parameter)
    const roomManager = (socket as any).roomManager;
    if (roomManager) {
      roomManager.joinRoom(socket, roomName);
    } else {
      socket.join(roomName);
      logger.info("User joined entity room", {
        socketId: socket.id,
        userId: socket.userId,
        roomName,
      });
    }

    logger.info("User subscribed to entity updates", {
      socketId: socket.id,
      userId: socket.userId,
      entityType,
      entityId,
      roomName,
    });

    // Emit success
    socket.emit("data_refresh:subscribed", {
      entityType,
      entityId,
      roomName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle unsubscribe from entity
   */
  private async handleUnsubscribe(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { entityType, entityId } = data;

    if (!entityType) {
      socket.emit("error", {
        message: "entityType is required",
        category: "data_refresh",
      });
      return;
    }

    // Create room name based on entity type and ID
    const roomName = entityId
      ? `${entityType}_${entityId}`
      : `entity_${entityType}`;

    // Leave the entity room (socketManager will be passed as parameter)
    const roomManager = (socket as any).roomManager;
    if (roomManager) {
      roomManager.leaveRoom(socket, roomName);
    } else {
      socket.leave(roomName);
      logger.info("User left entity room", {
        socketId: socket.id,
        userId: socket.userId,
        roomName,
      });
    }

    logger.info("User unsubscribed from entity updates", {
      socketId: socket.id,
      userId: socket.userId,
      entityType,
      entityId,
      roomName,
    });

    // Emit success
    socket.emit("data_refresh:unsubscribed", {
      entityType,
      entityId,
      roomName,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle request refresh
   */
  private async handleRequestRefresh(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { entityType, entityId } = data;

    if (!entityType) {
      socket.emit("error", {
        message: "entityType is required",
        category: "data_refresh",
      });
      return;
    }

    // TODO: Fetch fresh data from database
    // TODO: Emit refreshed data to the user

    logger.info("Data refresh requested", {
      socketId: socket.id,
      userId: socket.userId,
      entityType,
      entityId,
    });

    // Emit success (with placeholder data)
    socket.emit("data_refresh:refreshed", {
      entityType,
      entityId,
      data: {}, // Placeholder - replace with actual data
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit data refresh for a specific entity
   */
  emitEntityRefresh(
    entityType: string,
    action: "create" | "update" | "delete",
    data: any,
    target?: {
      userId?: number;
      channelId?: number;
      room?: string;
    }
  ): void {
    const io = requireSocketServer();
    if (!io && !target?.room) {
      logger.warn(
        "Attempted to emit entity refresh before Socket.IO initialization"
      );
      return;
    }

    const eventName = "data_refresh:refresh_data";
    const eventData = {
      entityType,
      action,
      data,
      timestamp: new Date().toISOString(),
    };

    if (target?.room) {
      // Emit to specific room
      io?.to(target.room).emit(eventName, eventData);
    } else if (target?.channelId) {
      // Emit to channel room
      io?.to(`channel_${target.channelId}`).emit(eventName, eventData);
    } else if (target?.userId) {
      // Emit to specific user
      io?.to(`user_${target.userId}`).emit(eventName, eventData);
    } else {
      // Broadcast to all connected clients
      io?.emit(eventName, eventData);
    }

    logger.info("Entity refresh emitted", {
      entityType,
      action,
      target,
    });
  }

  /**
   * Emit refresh to entity-specific room
   */
  emitToEntityRoom(
    entityType: string,
    entityId: number,
    action: "create" | "update" | "delete",
    data: any
  ): void {
    const roomName = `${entityType}_${entityId}`;
    this.emitEntityRefresh(entityType, action, data, { room: roomName });
  }

  /**
   * Emit refresh to all subscribers of entity type
   */
  emitToEntityType(
    entityType: string,
    action: "create" | "update" | "delete",
    data: any
  ): void {
    const roomName = `entity_${entityType}`;
    this.emitEntityRefresh(entityType, action, data, { room: roomName });
  }

  /**
   * Emit refresh to specific user
   */
  emitToUser(
    userId: number,
    entityType: string,
    action: "create" | "update" | "delete",
    data: any
  ): void {
    this.emitEntityRefresh(entityType, action, data, { userId });
  }

  /**
   * Emit refresh to channel
   */
  emitToChannel(
    channelId: number,
    entityType: string,
    action: "create" | "update" | "delete",
    data: any
  ): void {
    this.emitEntityRefresh(entityType, action, data, { channelId });
  }
}

// Export singleton instance
export const dataRefreshManager = new DataRefreshManager();
export default dataRefreshManager;
