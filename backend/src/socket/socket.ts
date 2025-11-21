import { Server as HttpServer } from "http";
import { SocketManager, AuthenticatedSocket } from "./socketManager";
import ChatSocket from "./chat.socket";
import DataRefreshSocket from "./dataRefresh.socket";
import NotificationSocket from "./notification.socket";

export const initializeSocket = (server: HttpServer): void => {
  const socketIo = SocketManager.init(server);

  socketIo.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;
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

    /**@description Attach socket modules*/
    new ChatSocket(socketIo, socket);
    new DataRefreshSocket(socketIo, socket);
    new NotificationSocket(socketIo, socket);

    /**@description Handle disconnection*/
    socket.on("disconnect", reason => {
      SocketManager.removeConnection(socket);
    });
  });
};
