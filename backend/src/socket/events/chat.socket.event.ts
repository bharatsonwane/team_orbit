import { AuthenticatedSocket } from "../utils/socketManager";
import { ChatSocketController } from "../controller/chat.socket.controller";
import { chatSocketEvents } from "../utils/socketEvents";

export default class ChatSocket {
  constructor(private socket: AuthenticatedSocket) {
    this.registerEvents();
  }

  private registerEvents() {
    this.socket.on(chatSocketEvents.CHAT_JOIN_USER_CHAT_CHANNELS, data => {
      ChatSocketController.handleJoinUserChatChannels({
        socket: this.socket,
        data,
      });
    });
    this.socket.on(chatSocketEvents.CHAT_JOIN_CHANNEL, data => {
      ChatSocketController.handleJoinChannel({
        socket: this.socket,
        data,
      });
    });

    this.socket.on(chatSocketEvents.CHAT_LEAVE_CHANNEL, data => {
      ChatSocketController.handleLeaveChannel({
        socket: this.socket,
        data,
      });
    });

    this.socket.on(chatSocketEvents.CHAT_SEND, data => {
      console.log("Chat message received:", data);
    });

    this.socket.on(chatSocketEvents.CHAT_TYPING, payload => {
      ChatSocketController.handleTyping({
        socket: this.socket,
        payload,
      });
    });
  }
}
