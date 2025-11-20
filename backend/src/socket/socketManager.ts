import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { envVariable } from "@src/config/envVariable";

export class SocketManager {
  private static io: Server | null = null;

  static init(server: HttpServer) {
    if (!SocketManager.io) {
      SocketManager.io = new Server(server, {
        cors: {
          origin: envVariable.FRONTEND_URL,
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });
    }

    return SocketManager.io;
  }

  static getIO(): Server {
    if (!SocketManager.io) {
      throw new Error("Socket.IO not initialized");
    }
    return SocketManager.io;
  }
}
