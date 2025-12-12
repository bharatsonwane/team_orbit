import { Socket } from "socket.io";
import { SocketManager } from "../socketManager";

export default class RefreshHandler {
  constructor(private socket: Socket) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("refresh:request", () => {
      const io = SocketManager.getSocketIo();
      io.emit("refresh:update", { ts: Date.now() });
    });
  }

  // ⭐ For controllers
  static notifyUserCreated(user: any) {
    const socketIo = SocketManager.getSocketIo();
    socketIo.emit("user:created", user);
  }
}
