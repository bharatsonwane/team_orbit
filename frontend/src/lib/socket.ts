import { io, type Socket } from "socket.io-client";
import { envVariable } from "@/config/envVariable";

let socket: Socket | null = null;

export const createSocketConnection = (): Socket => {
  if (!socket) {
    socket = io(envVariable.API_BASE_URL, {
      autoConnect: false,
      transports: ["websocket"],
      withCredentials: true,
      auth: () => {
        const token = localStorage.getItem("access_token");
        return token ? { token } : {};
      },
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
