import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { envVariable } from "@/config/envVariable";
interface AuthPayload {
  token: string;
  tenantId: string | number;
}

export class SocketManager {
  private static isConnecting = false;
  static socketInstance: Socket = io(envVariable.API_BASE_URL, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
  });

  static connect = async ({
    tenantId,
  }: {
    tenantId: string | number;
  }): Promise<Socket> => {
    try {
      if (SocketManager.socketInstance.connected) {
        return SocketManager.socketInstance;
      }
      // Prevent parallel .connect() calls
      if (SocketManager.isConnecting) {
        return SocketManager.socketInstance;
      }
      SocketManager.isConnecting = true;

      const jwtToken = Cookies.get(envVariable.JWT_STORAGE_KEY);

      if (!jwtToken || !tenantId) {
        throw new Error("Invalid token or tenantId");
      }

      const auth: AuthPayload = { token: jwtToken, tenantId };

      SocketManager.socketInstance.auth = auth;

      SocketManager.socketInstance.connect();
      await new Promise(resolve => {
        const successEvents = ["connect", "reconnect"] as const;
        const failureEvents = [
          "error",
          "disconnect",
          "reconnect_error",
          "reconnect_failed",
        ] as const;

        const cleanup = () => {
          successEvents.forEach(e => SocketManager.socketInstance.off(e));
          failureEvents.forEach(e => SocketManager.socketInstance.off(e));
        };

        successEvents.forEach(event => {
          SocketManager.socketInstance.on(event, () => {
            resolve(SocketManager.socketInstance);
            cleanup();
          });
        });

        failureEvents.forEach(event => {
          SocketManager.socketInstance.on(event, () => {
            resolve(undefined);
            cleanup();
          });
        });
      });

      SocketManager.isConnecting = false;
      return SocketManager.socketInstance;
    } catch (error) {
      SocketManager.isConnecting = false;
      return SocketManager.socketInstance;
    }
  };

  static async disconnect(): Promise<void> {
    if (SocketManager.socketInstance) {
      SocketManager.socketInstance.disconnect();
    }
  }
}
