"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useScannerStore } from "@/store/scanner.store";
import { useDashboardStore } from "@/store/dashboard.store";
import { SOCKET_EVENTS } from "@/utils/constants";
import type { ScanResult } from "@/types/kehadiran.type";
import type { KehadiranStats } from "@/types/kehadiran.type";

export function useSocket(room?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { setScanResult, setConnected } = useScannerStore();
  const { setStats } = useDashboardStore();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      setSocket(socketRef.current);
      if (room) {
        socketRef.current?.emit("join:room", room);
      }
    });

    socketRef.current.on("disconnect", () => {
      setConnected(false);
      setSocket(null);
    });

    socketRef.current.on(SOCKET_EVENTS.SCAN_SUCCESS, (result: ScanResult) => {
      setScanResult(result);
    });

    socketRef.current.on(SOCKET_EVENTS.STATS_UPDATE, (stats: KehadiranStats) => {
      setStats(stats);
    });

    setSocket(socketRef.current);
  }, [room, setConnected, setScanResult, setStats]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setConnected(false);
  }, [setConnected]);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
  }, [connect, disconnect]);

  return {
    socket,
    connect,
    disconnect,
  };
}
