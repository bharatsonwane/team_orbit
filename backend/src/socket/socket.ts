import type { Server as HttpServer } from "http";
import socketManager, {
  AuthenticatedSocket,
  ChannelTracker,
} from "./socketManager";
import { chatSocket } from "./chat.socket";
import { notificationSocket } from "./notification.socket";
import { dataRefreshSocket } from "./dataRefresh.socket";
import logger from "@src/utils/logger";

export const initializeSocket = (server: HttpServer): void => {
  try {
    socketManager.initialize(server);
    socketManager.addRegistration(
      (socket: AuthenticatedSocket, channelTracker: ChannelTracker) => {
        chatSocket.registerListeners(socket, channelTracker);
        notificationSocket.registerListeners(socket);
        dataRefreshSocket.registerListeners(socket);
      }
    );
    logger.info("Initializing Socket.IO server and all managers");
  } catch (error) {
    logger.error("Error initializing Socket.IO server and all managers", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
