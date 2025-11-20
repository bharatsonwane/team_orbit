import { Server as HttpServer } from "http";
import { SocketManager, AuthenticatedSocket } from "./socketManager";
import ChatSocket from "./chat.socket";
import DataRefreshSocket from "./dataRefresh.socket";
import NotificationSocket from "./notification.socket";

export const initializeSocket = (server: HttpServer): void => {
  const io = SocketManager.init(server);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    const tenantId = socket.tenantId;

    if (!userId) {
      console.warn("Connection without userId, disconnecting", {
        socketId: socket.id,
      });
      socket.disconnect();
      return;
    }

    /**@description Track connection*/
    SocketManager.addConnection(socket);

    const connectionCount = SocketManager.getUserSockets(userId).size;
    const totalConnections = SocketManager.getActiveConnectionsCount();

    console.log("Socket connected:", {
      socketId: socket.id,
      userId,
      tenantId,
      userConnectionCount: connectionCount,
      totalConnections,
    });

    /**@description Emit connection success*/
    socket.emit("connected", {
      message: "Connected to real-time server",
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    /**@description Attach socket modules*/
    new ChatSocket(io, socket);
    new DataRefreshSocket(io, socket);
    new NotificationSocket(io, socket);

    /**@description Handle disconnection*/
    socket.on("disconnect", reason => {
      SocketManager.removeConnection(socket);
      console.log("Socket disconnected:", {
        socketId: socket.id,
        userId,
        reason,
      });
    });
  });
};
