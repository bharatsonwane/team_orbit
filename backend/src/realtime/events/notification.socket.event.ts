import { Socket } from "socket.io";
import { NotificationSocketController } from "../controller/notification.socket.controller";
import { notificationSocketEvents } from "../utils/socketEvents";

export default class NotificationSocket {
  constructor(private socket: Socket) {
    this.registerEvents();
  }

  private registerEvents() {
    // When a client acknowledges notifications
    this.socket.on(notificationSocketEvents.NOTIFICATION_READ, data => {
      NotificationSocketController.handleRead({
        socket: this.socket,
        data,
      });
    });
  }
}
