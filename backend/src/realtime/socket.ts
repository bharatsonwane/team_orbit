import { Server as HttpServer } from "http";
import { SocketManager, AuthenticatedSocket } from "./utils/socketManager";
import ChatSocket from "./events/chat.socket.event";
import NotificationSocket from "./events/notification.socket.event";
import RefreshHandler from "./events/dataRefresh.socket.event";

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
    new ChatSocket(socket);
    new NotificationSocket(socket);
    new RefreshHandler(socket);

    /**@description Handle disconnection*/
    socket.on("disconnect", reason => {
      SocketManager.removeConnection(socket);
    });
  });
};
