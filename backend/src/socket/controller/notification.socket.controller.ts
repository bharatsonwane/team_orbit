import { Socket } from "socket.io";
import { SocketManager } from "../utils/socketManager";
import { notificationSocketEvents } from "../utils/socketEvents";

export class NotificationSocketController {
  static handleRead({ socket, data }: { socket: Socket; data: any }) {
    console.log("Notification read:", data);
    const io = SocketManager.getSocketIo();
    io.emit(notificationSocketEvents.NOTIFICATION_READ_UPDATE, data);
  }

  // ⭐ Static method for controllers
  static sendNotification({ notification }: { notification: any }) {
    const socketIo = SocketManager.getSocketIo();
    socketIo.emit(notificationSocketEvents.NOTIFICATION_NEW, notification);
  }
}
