import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { envVariable } from "@/config/envVariable";
interface AuthPayload {
  token: string;
  tenantId: string | number;
}

export class SocketManager {
  private static isConnecting = false;
  static socketIo: Socket = io(envVariable.API_BASE_URL, {
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
      if (SocketManager.socketIo.connected) {
        return SocketManager.socketIo;
      }
      // Prevent parallel .connect() calls
      if (SocketManager.isConnecting) {
        return SocketManager.socketIo;
      }
      SocketManager.isConnecting = true;

      const jwtToken = Cookies.get(envVariable.JWT_STORAGE_KEY);

      if (!jwtToken) {
        throw new Error("JWT token is required");
      }

      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }

      // Ensure tenantId is a number (backend expects a number)
      const numericTenantId =
        typeof tenantId === "string" ? parseInt(tenantId, 10) : tenantId;

      if (isNaN(numericTenantId)) {
        throw new Error("Invalid tenant ID format");
      }

      const auth: AuthPayload = { token: jwtToken, tenantId: numericTenantId };

      SocketManager.socketIo.auth = auth;

      SocketManager.socketIo.connect();
      await new Promise(resolve => {
        const successEvents = ["connect", "reconnect"] as const;
        const failureEvents = [
          "error",
          "disconnect",
          "reconnect_error",
          "reconnect_failed",
        ] as const;

        const cleanup = () => {
          successEvents.forEach(e => SocketManager.socketIo.off(e));
          failureEvents.forEach(e => SocketManager.socketIo.off(e));
        };

        successEvents.forEach(event => {
          SocketManager.socketIo.on(event, () => {
            resolve(SocketManager.socketIo);
            cleanup();
          });
        });

        failureEvents.forEach(event => {
          SocketManager.socketIo.on(event, () => {
            resolve(undefined);
            cleanup();
          });
        });
      });

      SocketManager.isConnecting = false;
      return SocketManager.socketIo;
    } catch (error) {
      SocketManager.isConnecting = false;
      console.error("Socket connection error:", error);
      return SocketManager.socketIo;
    }
  };

  static async disconnect(): Promise<void> {
    if (SocketManager.socketIo) {
      SocketManager.socketIo.disconnect();
    }
  }
}
