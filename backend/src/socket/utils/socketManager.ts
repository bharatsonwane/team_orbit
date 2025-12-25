import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { envVariable } from "@src/config/envVariable";
import { validateJwtToken } from "@src/utils/authHelper";
import { JwtTokenPayload } from "@src/middleware/authPermissionMiddleware";
import { dbClientPool } from "@src/middleware/dbClientMiddleware";
import db, { schemaNames } from "@src/database/db";
import logger from "@src/utils/logger";

/**
 * Extended Socket interface with authenticated user data and database client pools
 */
export interface AuthenticatedSocket extends Socket {
  user?: JwtTokenPayload;
  tenantId?: number;
  db?: dbClientPool;
}

export class SocketManager {
  private static socketIo: Server | null = null;
  /**@description Connection tracking: userId -> Set<socketId>*/
  private static userConnections = new Map<number, Set<string>>();

  static init(server: HttpServer) {
    if (!SocketManager.socketIo) {
      SocketManager.socketIo = new Server(server, {
        cors: {
          origin: envVariable.FRONTEND_URL,
          credentials: true,
          methods: ["GET", "POST", "PUT", "DELETE"],
        },
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      /**@description Apply authentication middleware*/
      SocketManager.socketIo.use((socket, next) => {
        SocketManager.authenticateSocket(socket, next);
      });

      /**@description Apply database client middleware*/
      SocketManager.socketIo.use((socket, next) => {
        SocketManager.attachDatabase(socket as AuthenticatedSocket, next);
      });
    }

    return SocketManager.socketIo;
  }

  static getSocketIo(): Server {
    if (!SocketManager.socketIo) {
      throw new Error("Socket.IO not initialized");
    }
    return SocketManager.socketIo;
  }

  /**@description Authenticate socket connection using JWT token*/
  private static authenticateSocket(
    socket: AuthenticatedSocket,
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

      socket.user = decodedToken;

      socket.tenantId = decodedToken.tenantId;

      next();
    } catch (error) {
      logger.error("Socket.IO authentication error", {
        socketId: socket.id,
        error: error instanceof Error ? error.message : String(error),
      });
      next(new Error("Authentication failed"));
    }
  }
  /**@description Attach database pools to socket (Socket.IO middleware)*/
  private static async attachDatabase(
    socket: AuthenticatedSocket,
    next: (err?: ExtendedError) => void
  ): Promise<void> {
    try {
      // Initialize the db object on the socket
      socket.db = {} as dbClientPool;

      // Always get a pool for the main schema
      socket.db.mainPool = await db.getSchemaPool(schemaNames.main);

      // Get tenant-specific schema pool if tenantId is available
      if (socket.tenantId) {
        const tenantSchemaName = schemaNames.tenantSchemaName(
          socket.tenantId.toString()
        );
        socket.db.tenantPool = await db.getSchemaPool(tenantSchemaName);
      }

      // Set up cleanup on disconnect
      socket.on("disconnect", () => {
        SocketManager.cleanupSocketDb(socket);
      });

      next();
    } catch (err: unknown) {
      const error = err as Error;
      logger.error("Socket database middleware error:", {
        message: error.message,
        socketId: socket.id,
        userId: socket.user?.userId,
        tenantId: socket.tenantId,
        stack: error.stack,
      });

      // Cleanup on error
      SocketManager.cleanupSocketDb(socket);
      next(new Error("Database connection error"));
    }
  }

  /**@description Cleanup database connections for a socket*/
  private static cleanupSocketDb(socket: AuthenticatedSocket): void {
    try {
      if (
        socket.db?.tenantPool?.release &&
        typeof socket.db.tenantPool.release === "function"
      ) {
        socket.db.tenantPool.release(true);
      }
      if (
        socket.db?.mainPool?.release &&
        typeof socket.db.mainPool.release === "function"
      ) {
        socket.db.mainPool.release(true);
      }
    } catch (releaseError) {
      logger.error("Error releasing database connections for socket:", {
        socketId: socket.id,
        error: releaseError,
      });
    }
  }

  /**@descriptionTrack user connection (call when socket connects)*/
  static addConnection(socket: AuthenticatedSocket): void {
    if (!socket.user?.userId) {
      return;
    }

    if (!SocketManager.userConnections.has(socket.user.userId)) {
      SocketManager.userConnections.set(socket.user.userId, new Set());
    }
    SocketManager.userConnections.get(socket.user.userId)!.add(socket.id);

    // Join user-specific room for notifications
    const userRoom = `user_${socket.user.userId}`;
    socket.join(userRoom);

    const connectionCount = SocketManager.userConnections.get(
      socket.user.userId
    )!.size;

    const totalConnections = SocketManager.getActiveConnectionsCount();

    logger.info("Socket connection added to user", {
      socketId: socket.id,
      tenantId: socket.tenantId,
      userId: socket.user.userId,
      userConnectionCount: connectionCount,
      totalConnections,
      timestamp: new Date().toISOString(),
    });

    /**@description Emit connection success to the socket*/
    socket.emit("connected", {
      message: "Connected to real-time server",
      userId: socket.user.userId,
      tenantId: socket.tenantId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  }

  /**@description Remove user connection (call when socket disconnects)*/
  static removeConnection(socket: AuthenticatedSocket): void {
    if (!socket.user?.userId) {
      return;
    }

    const sockets = SocketManager.userConnections.get(socket.user.userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        SocketManager.userConnections.delete(socket.user.userId);
      }
    }

    logger.info("Socket connection removed", {
      socketId: socket.id,
      userId: socket.user.userId,
      tenantId: socket.tenantId,
    });
  }

  /**@description Check if user is connected*/
  static isUserConnected(user: JwtTokenPayload): boolean {
    const sockets = SocketManager.userConnections.get(user.userId);
    return sockets ? sockets.size > 0 : false;
  }

  /**@description Get all socket IDs for a user*/
  static getUserSockets(userId: number): Set<string> {
    return SocketManager.userConnections.get(userId) || new Set();
  }

  /**@description Emit event to all of a user's devices*/
  static emitToUser(user: JwtTokenPayload, event: string, data: any): void {
    const socketIo = SocketManager.getSocketIo();
    const sockets = SocketManager.userConnections.get(user.userId);

    if (!sockets || sockets.size === 0) {
      return;
    }

    // Emit to user-specific room (all user's devices)
    socketIo.to(`user_${user.userId}`).emit(event, {
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
