import { Server } from "socket.io";
import { AuthenticatedSocket } from "./socketManager";
import logger from "../utils/logger";

/**
 * Notification Manager
 * Manages all notification-related Socket.IO functionality
 */
class NotificationManager {
  private io: Server | null = null;

  /**
   * Set Socket.IO server instance
   */
  setIO(io: Server): void {
    this.io = io;
  }

  /**
   * Register notification event listeners
   */
  registerListeners(socket: AuthenticatedSocket): void {
    // Mark notification as read
    socket.on("notification:mark_read", async data => {
      await this.handleMarkRead(socket, data);
    });

    // Get unread count
    socket.on("notification:get_unread_count", async data => {
      await this.handleGetUnreadCount(socket, data);
    });

    // Mark all as read
    socket.on("notification:mark_all_read", async data => {
      await this.handleMarkAllRead(socket, data);
    });
  }

  /**
   * Handle mark notification as read
   */
  private async handleMarkRead(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    const { notificationId } = data;

    if (!notificationId) {
      socket.emit("error", {
        message: "notificationId is required",
        category: "notification",
      });
      return;
    }

    // TODO: Update notification in database (mark as read)
    logger.info("Notification marked as read", {
      socketId: socket.id,
      userId: socket.userId,
      notificationId,
    });

    // Emit success
    this.emitNotificationRead(socket.userId!, notificationId);
  }

  /**
   * Handle get unread count
   */
  private async handleGetUnreadCount(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    // TODO: Query database for unread notifications count

    const unreadCount = 0; // Placeholder

    // Emit unread count
    this.emitUnreadCount(socket.userId!, unreadCount);
  }

  /**
   * Handle mark all as read
   */
  private async handleMarkAllRead(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    // TODO: Update all notifications in database (mark as read)

    logger.info("All notifications marked as read", {
      socketId: socket.id,
      userId: socket.userId,
    });

    // Emit success
    this.emitAllNotificationsRead(socket.userId!);
  }

  /**
   * Send notification to a single user
   */
  sendNotification(
    userId: number,
    notification: {
      id?: number;
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
      data?: any;
    }
  ): void {
    if (!this.io) {
      logger.warn(
        "Attempted to send notification before Socket.IO initialization"
      );
      return;
    }

    const userRoom = `user_${userId}`;
    this.io.to(userRoom).emit("notification:new_notification", {
      ...notification,
      userId,
      timestamp: new Date().toISOString(),
    });

    logger.info("Notification sent to user", {
      userId,
      type: notification.type,
    });
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(
    userIds: number[],
    notification: {
      id?: number;
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
      data?: any;
    }
  ): void {
    if (!this.io) {
      logger.warn(
        "Attempted to send notifications before Socket.IO initialization"
      );
      return;
    }

    userIds.forEach(userId => {
      this.sendNotification(userId, notification);
    });

    logger.info("Notification sent to multiple users", {
      userIds,
      type: notification.type,
      count: userIds.length,
    });
  }

  /**
   * Broadcast notification to all users
   */
  broadcastNotification(notification: {
    id?: number;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    data?: any;
  }): void {
    if (!this.io) {
      logger.warn(
        "Attempted to broadcast notification before Socket.IO initialization"
      );
      return;
    }

    this.io.emit("notification:new_notification", {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    logger.info("Notification broadcasted to all users", {
      type: notification.type,
    });
  }

  /**
   * Emit notification marked as read
   */
  emitNotificationRead(userId: number, notificationId: number): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit notification read before Socket.IO initialization"
      );
      return;
    }

    const userRoom = `user_${userId}`;
    this.io.to(userRoom).emit("notification:marked_read", {
      userId,
      notificationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit unread count update to user
   */
  emitUnreadCount(userId: number, count: number): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit unread count before Socket.IO initialization"
      );
      return;
    }

    const userRoom = `user_${userId}`;
    this.io.to(userRoom).emit("notification:unread_count", {
      userId,
      count,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit all notifications read
   */
  emitAllNotificationsRead(userId: number): void {
    if (!this.io) {
      logger.warn(
        "Attempted to emit all notifications read before Socket.IO initialization"
      );
      return;
    }

    const userRoom = `user_${userId}`;
    this.io.to(userRoom).emit("notification:all_read", {
      userId,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
export default notificationManager;
