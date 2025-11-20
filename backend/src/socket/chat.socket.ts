import { Server, Socket } from "socket.io";
import { SocketManager } from "./socketManager";

export default class ChatSocket {
  constructor(
    private io: Server,
    private socket: Socket
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    // User sends a chat message
    this.socket.on("chat:send", data => {
      console.log("Chat message received:", data);

      // Broadcast the message to all users OR a room
      this.io.emit("chat:new", data);
    });

    // Typing indicator
    this.socket.on("chat:typing", payload => {
      this.io.emit("chat:typing:update", payload);
    });
  }

  // ⭐ Static method for controllers (store message + emit)
  static notifyChatMessage(message: any) {
    const io = SocketManager.getIO();
    io.emit("chat:new", message);
  }
}
