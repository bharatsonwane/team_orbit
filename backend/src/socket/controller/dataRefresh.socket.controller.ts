import { Socket } from "socket.io";
import { SocketManager } from "../utils/socketManager";
import { dataRefreshSocketEvents } from "../utils/socketEvents";

export class DataRefreshSocketController {
  static handleRefreshRequest({
    socket,
  }: {
    socket: Socket;
  }) {
    const io = SocketManager.getSocketIo();
    io.emit(dataRefreshSocketEvents.REFRESH_UPDATE, { ts: Date.now() });
  }

  // ⭐ Static method for controllers
  static notifyUserCreated({
    user,
  }: {
    user: any;
  }) {
    const socketIo = SocketManager.getSocketIo();
    socketIo.emit(dataRefreshSocketEvents.USER_CREATED, user);
  }
}

