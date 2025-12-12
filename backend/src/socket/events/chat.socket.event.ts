import { AuthenticatedSocket } from "../socketManager";
import { ChatSocketController } from "../controller/chat.socket.controller";

export default class ChatSocket {
  constructor(private socket: AuthenticatedSocket) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on("chat:joinUserChatChannels", data => {
      ChatSocketController.handleJoinUserChatChannels({
        socket: this.socket,
        data,
      });
    });
    this.socket.on("chat:joinChannel", data => {
      ChatSocketController.handleJoinChannel({
        socket: this.socket,
        data,
      });
    });

    this.socket.on("chat:leaveChannel", data => {
      ChatSocketController.handleLeaveChannel({
        socket: this.socket,
        data,
      });
    });

    this.socket.on("chat:send", data => {
      console.log("Chat message received:", data);
    });

    this.socket.on("chat:typing", payload => {
      ChatSocketController.handleTyping({
        socket: this.socket,
        payload,
      });
    });
  }
}
