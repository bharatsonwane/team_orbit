import type { Server as HttpServer } from "http";
import socketManager, {
  AuthenticatedSocket,
  ChannelTracker,
} from "./socketManager";
import { chatManager } from "./chatManager";
import { notificationManager } from "./notificationManager";
import { dataRefreshManager } from "./dataRefreshManager";

export const initializeSocketManagers = (server: HttpServer): void => {
  socketManager.initialize(server);
  socketManager.addRegistration(
    (socket: AuthenticatedSocket, channelTracker: ChannelTracker) => {
      chatManager.registerListeners(socket, channelTracker);
      notificationManager.registerListeners(socket);
      dataRefreshManager.registerListeners(socket);
    }
  );
};
