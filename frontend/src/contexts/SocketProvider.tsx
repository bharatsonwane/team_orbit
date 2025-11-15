import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import {
  createSocketConnection,
  getSocket,
  disconnectSocket,
} from "@/lib/socket";
import { useAuthService } from "./AuthContextProvider";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(getSocket());
  const [connected, setConnected] = useState<boolean>(false);
  const { loggedInUser } = useAuthService();

  const connect = useCallback(() => {
    let instance = socket;
    if (!instance) {
      instance = createSocketConnection();
      setSocket(instance);
    }
    if (!instance.connected) {
      instance.connect();
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnected(false);
  }, []);

  useEffect(() => {
    if (loggedInUser?.id) {
      connect();
    } else {
      disconnect();
    }
  }, [loggedInUser?.id, connect, disconnect]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      connected,
      connect,
      disconnect,
    }),
    [socket, connected, connect, disconnect]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
