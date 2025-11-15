import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { validateJwtToken } from "../utils/authHelper";
import { JwtTokenPayload } from "../middleware/authRoleMiddleware";
import logger from "../utils/logger";
import { envVariable } from "../config/envVariable";
/**
 * Extended Socket interface with authenticated user data
 */
export interface AuthenticatedSocket extends Socket {
  user?: JwtTokenPayload;
  userId?: number;
  tenantId?: number;
}

/**
 * Socket.IO connection data structure
 */
interface SocketConnection {
  socketId: string;
  userId: number;
  tenantId: number;
  connectedAt: Date;
  channels: Set<number>; // Set of chatChannelIds user is connected to
}

/**
 * Active connections map: userId -> SocketConnection
 */
type ActiveConnections = Map<number, SocketConnection>;

/**
 * Socket Manager (tracks connections + server)
 */
export interface ChannelTracker {
  addChannelToUser(socket: AuthenticatedSocket, channelId: number): void;
  removeChannelFromUser(socket: AuthenticatedSocket, channelId: number): void;
}

type ManagerRegistration = (
  socket: AuthenticatedSocket,
  tracker: ChannelTracker
) => void;

class SocketManager implements ChannelTracker {
  private socketIo: Server | null = null;
  private connections: ActiveConnections = new Map();
  private registrations: ManagerRegistration[] = [];

  addRegistration(handler: ManagerRegistration): void {
    this.registrations.push(handler);
  }

  addConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) {
      logger.warn("Attempted to add connection without userId", {
        socketId: socket.id,
      });
      return;
    }

    const connection: SocketConnection = {
      socketId: socket.id,
      userId: socket.userId,
      tenantId: socket.tenantId || 0,
      connectedAt: new Date(),
      channels: new Set<number>(),
    };

    this.connections.set(socket.userId, connection);

    logger.info("Socket connection added", {
      socketId: socket.id,
      userId: socket.userId,
      tenantId: socket.tenantId,
    });
  }

  removeConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) {
      return;
    }

    const connection = this.connections.get(socket.userId);
    if (connection) {
      this.connections.delete(socket.userId);
      logger.info("Socket connection removed", {
        socketId: socket.id,
        userId: socket.userId,
        tenantId: socket.tenantId,
      });
    }
  }

  getConnection(userId: number): SocketConnection | undefined {
    return this.connections.get(userId);
  }

  isUserConnected(userId: number): boolean {
    return this.connections.has(userId);
  }

  addChannelToUser(socket: AuthenticatedSocket, channelId: number): void {
    if (!socket.userId) {
      return;
    }

    const connection = this.connections.get(socket.userId);
    if (connection) {
      connection.channels.add(channelId);
      logger.info("Channel added to user's active channels", {
        socketId: socket.id,
        userId: socket.userId,
        channelId,
      });
    }
  }

  removeChannelFromUser(socket: AuthenticatedSocket, channelId: number): void {
    if (!socket.userId) {
      return;
    }

    const connection = this.connections.get(socket.userId);
    if (connection) {
      connection.channels.delete(channelId);
      logger.info("Channel removed from user's active channels", {
        socketId: socket.id,
        userId: socket.userId,
        channelId,
      });
    }
  }

  getUsersInChannel(channelId: number): number[] {
    const userIds: number[] = [];
    for (const [userId, connection] of this.connections.entries()) {
      if (connection.channels.has(channelId)) {
        userIds.push(userId);
      }
    }
    return userIds;
  }

  getActiveConnectionsCount(): number {
    return this.connections.size;
  }

  getAllConnections(): ActiveConnections {
    return new Map(this.connections);
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(server: HttpServer): Server {
    // Get frontend URL from environment or use default
    const frontendUrl =
      process.env.FRONTEND_URL ||
      envVariable.API_HOST ||
      "http://localhost:5173";

    this.socketIo = new Server(server, {
      cors: {
        origin: frontendUrl,
        credentials: true,
        methods: ["GET", "POST"],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Apply authentication middleware
    this.socketIo.use((socket, next) => {
      this.authenticateSocket(socket, next);
    });

    // Handle connections
    this.socketIo.on("connection", (socket: Socket) => {
      this.handleConnection(socket as AuthenticatedSocket);
    });

    logger.info("Socket.IO server initialized", {
      frontendUrl,
    });

    return this.socketIo;
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId;
    const tenantId = socket.tenantId;

    if (!userId) {
      logger.warn("Connection without userId, disconnecting", {
        socketId: socket.id,
      });
      socket.disconnect();
      return;
    }

    // Add to connection manager
    this.addConnection(socket);

    // Join user-specific room for notifications and user-specific events
    const userRoom = `user_${userId}`;
    socket.join(userRoom);

    logger.info("User connected via Socket.IO", {
      socketId: socket.id,
      userId,
      tenantId,
      userRoom,
    });

    // Emit connection success
    socket.emit("connected", {
      message: "Connected to real-time server",
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    this.registrations.forEach(handler => handler(socket, this));

    // Handle disconnection
    socket.on("disconnect", reason => {
      this.handleDisconnection(socket, reason);
    });

    // Handle errors
    socket.on("error", error => {
      logger.error("Socket.IO error", {
        socketId: socket.id,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
    });

    // Basic ping/pong for connection health
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(
    socket: AuthenticatedSocket,
    reason: string
  ): void {
    const userId = socket.userId;

    // Remove from connection manager
    this.removeConnection(socket);

    logger.info("User disconnected from Socket.IO", {
      socketId: socket.id,
      userId,
      reason,
    });

    // Emit user offline event to relevant channels
    if (userId) {
      const connection = this.connections.get(userId);
      if (connection && connection.channels.size > 0) {
        connection.channels.forEach(channelId => {
          socket.to(`channel_${channelId}`).emit("presence:user_offline", {
            userId,
            timestamp: new Date().toISOString(),
          });
        });
      }
    }
  }

  /**
   * Get Socket.IO server instance
   */
  getIO(): Server | null {
    return this.socketIo;
  }

  requireIO(): Server {
    if (!this.socketIo) {
      throw new Error("Socket.IO server has not been initialized");
    }
    return this.socketIo;
  }

  /**
   * Join user to a room
   */
  joinRoom(socket: AuthenticatedSocket, roomName: string): void {
    socket.join(roomName);
    logger.info("User joined room", {
      socketId: socket.id,
      userId: socket.userId,
      roomName,
    });
  }

  /**
   * Remove user from a room
   */
  leaveRoom(socket: AuthenticatedSocket, roomName: string): void {
    socket.leave(roomName);
    logger.info("User left room", {
      socketId: socket.id,
      userId: socket.userId,
      roomName,
    });
  }

  /**
   * Emit event to a room
   */
  emitToRoom(roomName: string, event: string, data: any): void {
    if (!this.socketIo) {
      logger.warn("Attempted to emit to room before Socket.IO initialization");
      return;
    }

    this.socketIo.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit event to a specific user
   */
  emitToUser(userId: number, event: string, data: any): void {
    if (!this.socketIo) {
      logger.warn("Attempted to emit to user before Socket.IO initialization");
      return;
    }

    const connection = this.connections.get(userId);
    if (connection) {
      this.socketIo.to(connection.socketId).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: string, data: any): void {
    if (!this.socketIo) {
      logger.warn("Attempted to broadcast before Socket.IO initialization");
      return;
    }

    this.socketIo.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  private authenticateSocket(
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

      logger.info("Socket.IO authenticated successfully", {
        socketId: socket.id,
        userId: decodedToken.userId,
        tenantId: decodedToken.tenantId,
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
}

// Export singleton instance
export const socketManager = new SocketManager();
export default socketManager;

export const getSocketServer = (): Server | null => socketManager.getIO();

export const requireSocketServer = (): Server => socketManager.requireIO();
