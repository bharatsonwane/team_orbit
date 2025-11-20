import { Server, Socket } from "socket.io";
import { SocketManager } from "./socketManager";

export default class NotificationSocket {
  constructor(
    private io: Server,
    private socket: Socket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    // When a client acknowledges notifications
    this.socket.on("notification:read", data => {
      console.log("Notification read:", data);
      this.io.emit("notification:read:update", data);
    });
  }

  // ⭐ Static method for controllers
  static sendNotification(notification: any) {
    const io = SocketManager.getIO();
    io.emit("notification:new", notification);
  }
}
