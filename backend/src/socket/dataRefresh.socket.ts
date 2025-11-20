import { Server, Socket } from "socket.io";
import { SocketManager } from "./socketManager";

export default class RefreshHandler {
  constructor(
    private io: Server,
    private socket: Socket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("refresh:request", () => {
      this.io.emit("refresh:update", { ts: Date.now() });
    });
  }

  // ⭐ For controllers
  static notifyUserCreated(user: any) {
    const io = SocketManager.getIO();
    io.emit("user:created", user);
  }
}
