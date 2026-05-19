import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { SOCKET_EVENTS } from "@/utils/constants";
import type { ScanResult } from "@/types/kehadiran.type";

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO server
 */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    // Join room berdasarkan role
    socket.on("join:room", (room: string) => {
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });
  });

  return io;
}

/**
 * Get Socket.IO instance
 */
export function getSocketServer(): SocketIOServer | null {
  return io;
}

/**
 * Emit scan result ke semua client di room admin
 */
export function emitScanResult(result: ScanResult): void {
  if (!io) return;
  io.to("admin").emit(SOCKET_EVENTS.SCAN_SUCCESS, result);
  io.to("scanner").emit(SOCKET_EVENTS.SCAN_SUCCESS, result);
}

/**
 * Emit attendance stats update
 */
export function emitStatsUpdate(stats: Record<string, unknown>): void {
  if (!io) return;
  io.to("admin").emit(SOCKET_EVENTS.STATS_UPDATE, stats);
}
