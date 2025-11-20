import { Server as HttpServer } from "http";
import { SocketManager } from "./socketManager";
import ChatSocket from "./chat.socket";
import DataRefreshSocket from "./dataRefresh.socket";
import NotificationSocket from "./notification.socket";

export const initializeSocket = (server: HttpServer): void => {
  const io = SocketManager.init(server);

  io.on("connection", socket => {
    console.log("Socket connected:", socket.id);

    // Attach socket modules
    new ChatSocket(io, socket);
    new DataRefreshSocket(io, socket);
    new NotificationSocket(io, socket);
  });
};
