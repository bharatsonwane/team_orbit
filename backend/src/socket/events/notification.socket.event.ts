import { Socket } from "socket.io";
import { SocketManager } from "../utils/socketManager";

export default class NotificationSocket {
  constructor(private socket: Socket) {
    this.registerEvents();
  }

  private registerEvents() {
    // When a client acknowledges notifications
    this.socket.on("notification:read", data => {
      console.log("Notification read:", data);
      const io = SocketManager.getSocketIo();
      io.emit("notification:read:update", data);
    });
  }

  // ⭐ Static method for controllers
  static sendNotification(notification: any) {
    const socketIo = SocketManager.getSocketIo();
    socketIo.emit("notification:new", notification);
  }
}
