import { Socket } from "socket.io";
import { DataRefreshSocketController } from "../controller/dataRefresh.socket.controller";
import { dataRefreshSocketEvents } from "../utils/socketEvents";

export default class RefreshHandler {
  constructor(private socket: Socket) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on(dataRefreshSocketEvents.REFRESH_REQUEST, () => {
      DataRefreshSocketController.handleRefreshRequest({
        socket: this.socket,
      });
    });
  }
}
