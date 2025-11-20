import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { envVariable } from "@src/config/envVariable";
import { validateJwtToken } from "@src/utils/authHelper";
import { JwtTokenPayload } from "@src/middleware/authRoleMiddleware";
import logger from "@src/utils/logger";

/**
 * Extended Socket interface with authenticated user data
 */
export interface AuthenticatedSocket extends Socket {
  user?: JwtTokenPayload;
  userId?: number;
  tenantId?: number;
}

export class SocketManager {
  private static io: Server | null = null;
  /**@description Connection tracking: userId -> Set<socketId>*/
  private static userConnections = new Map<number, Set<string>>();

  static init(server: HttpServer) {
    if (!SocketManager.io) {
      SocketManager.io = new Server(server, {
        cors: {
          origin: envVariable.FRONTEND_URL,
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      // Apply authentication middleware
      SocketManager.io.use((socket, next) => {
        SocketManager.authenticateSocket(socket, next);
      });
    }

    return SocketManager.io;
  }

  static getIO(): Server {
    if (!SocketManager.io) {
      throw new Error("Socket.IO not initialized");
    }
    return SocketManager.io;
  }

  /**@description Authenticate socket connection using JWT token*/
  private static authenticateSocket(
    socket: Socket,
    next: (err?: ExtendedError) => void
  ): void {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.query?.token as string | undefined) ||
        socket.handshake.headers?.authorization?.split(" ")?.[1] ||
        socket.handshake.headers?.authorization;

      if (!token) {
        logger.warn("Socket.IO connection attempt without token", {
          socketId: socket.id,
        });
        return next(new Error("Authentication token required"));
      }

      const decodedToken = validateJwtToken(token) as JwtTokenPayload;

      if (!decodedToken || !decodedToken.userId) {
        logger.warn("Socket.IO connection with invalid token", {
          socketId: socket.id,
        });
        return next(new Error("Invalid authentication token"));
      }

      const authenticatedSocket = socket as AuthenticatedSocket;
      authenticatedSocket.user = decodedToken;
      authenticatedSocket.userId = decodedToken.userId;
      authenticatedSocket.tenantId = decodedToken.tenantId;

      logger.info("Socket.IO authentication successful", {
        socketId: socket.id,
        userId: decodedToken.userId,
        tenantId: decodedToken.tenantId,
        timestamp: new Date().toISOString(),
      });

      next();
    } catch (error) {
      logger.error("Socket.IO authentication error", {
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
      });
      next(new Error("Authentication failed"));
    }
  }

  /**@descriptionTrack user connection (call when socket connects)*/
  static addConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) {
      return;
    }

    if (!SocketManager.userConnections.has(socket.userId)) {
      SocketManager.userConnections.set(socket.userId, new Set());
    }
    SocketManager.userConnections.get(socket.userId)!.add(socket.id);

    // Join user-specific room for notifications
    const userRoom = `user_${socket.userId}`;
    socket.join(userRoom);

    const connectionCount = SocketManager.userConnections.get(
      socket.userId
    )!.size;
    logger.info("Socket connection added to user", {
      socketId: socket.id,
      userId: socket.userId,
      tenantId: socket.tenantId,
      userConnectionCount: connectionCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**@description Remove user connection (call when socket disconnects)*/
  static removeConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) {
      return;
    }

    const sockets = SocketManager.userConnections.get(socket.userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        SocketManager.userConnections.delete(socket.userId);
      }
    }

    logger.info("Socket connection removed", {
      socketId: socket.id,
      userId: socket.userId,
      tenantId: socket.tenantId,
    });
  }

  /**@description Get all socket IDs for a user*/
  static getUserSockets(userId: number): Set<string> {
    return SocketManager.userConnections.get(userId) || new Set();
  }

  /**@description Check if user is connected*/
  static isUserConnected(userId: number): boolean {
    const sockets = SocketManager.userConnections.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  /**@description Emit event to all of a user's devices*/
  static emitToUser(userId: number, event: string, data: any): void {
    const io = SocketManager.getIO();
    const sockets = SocketManager.getUserSockets(userId);

    if (sockets.size === 0) {
      return;
    }

    // Emit to user-specific room (all user's devices)
    io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**@description Get total active connections count*/
  static getActiveConnectionsCount(): number {
    let count = 0;
    for (const sockets of SocketManager.userConnections.values()) {
      count += sockets.size;
    }
    return count;
  }
}
