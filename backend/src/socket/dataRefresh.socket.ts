import { Server, Socket } from "socket.io";
import { SocketManager } from "./socketManager";

export default class RefreshHandler {
  constructor(
    private socketIo: Server,
    private socket: Socket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("refresh:request", () => {
      this.socketIo.emit("refresh:update", { ts: Date.now() });
    });
  }

  // ⭐ For controllers
  static notifyUserCreated(user: any) {
    const socketIo = SocketManager.getSocketIo();
    socketIo.emit("user:created", user);
  }
}
