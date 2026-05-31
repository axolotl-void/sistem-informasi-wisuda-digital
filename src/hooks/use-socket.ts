"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useScannerStore } from "@/store/scanner.store";
import { useDashboardStore } from "@/store/dashboard.store";
import { SOCKET_EVENTS } from "@/utils/constants";
import type { ScanResult } from "@/types/kehadiran.type";
import type { KehadiranStats } from "@/types/kehadiran.type";

/**
 * Hook koneksi Socket.IO yang aman terhadap kegagalan.
 *
 * Masalah sebelumnya: Socket.IO client mencoba reconnect ke /api/socket
 * tanpa batas retry (default infinite). Karena server Socket.IO tidak
 * pernah diinisialisasi (initSocketServer tidak dipanggil di mana pun),
 * client masuk ke reconnect loop agresif yang membanjiri network queue
 * dan memblokir fetch API dashboard → UI stuck di "Memuat...".
 *
 * Solusi: Batasi reconnect attempts (max 3), timeout pendek (5 detik),
 * dan graceful degradation — dashboard tetap berfungsi penuh tanpa
 * websocket (hanya kehilangan fitur push realtime).
 */
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
      // Batasi reconnect agar tidak membanjiri network queue
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 5000,
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

    // Berhenti mencoba setelah max attempts tercapai (graceful degradation)
    socketRef.current.on("reconnect_failed", () => {
      console.info("[Socket] Server tidak tersedia — dashboard tetap berfungsi tanpa realtime push.");
      setConnected(false);
      setSocket(null);
    });

    // Tangkap error koneksi agar tidak membanjiri console
    socketRef.current.on("connect_error", () => {
      // Diam saja — reconnect_failed akan menangani setelah max attempts
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
    socketRef.current?.removeAllListeners();
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
