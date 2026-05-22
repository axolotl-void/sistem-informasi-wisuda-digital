export const APP_NAME = "Sistem Informasi Wisuda Digital";
export const APP_VERSION = "1.0.0";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN: {
    DASHBOARD: "/dashboard",
    MAHASISWA: "/mahasiswa",
    UNDANGAN: "/undangan",
    KEHADIRAN: "/kehadiran",
    SEAT_MONITORING: "/seat-monitoring",
    LAPORAN: "/laporan",
    PENGATURAN: "/pengaturan",
  },
  SCANNER: {
    SCAN: "/scan",
  },
  MAHASISWA: {
    DASHBOARD: "/mahasiswa/dashboard",
    UNDANGAN: "/mahasiswa/undangan",
  },
  PORTAL: {
    HOME: "/portal",
    TAMU: "/portal/tamu",
    TIKET: "/portal/tiket",
  },
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
  },
  MAHASISWA: {
    BASE: "/api/mahasiswa",
    IMPORT: "/api/mahasiswa/import",
    EXPORT: "/api/mahasiswa/export",
  },
  UNDANGAN: {
    BASE: "/api/undangan",
    GENERATE: "/api/undangan/generate",
    PDF: "/api/undangan/pdf",
  },
  KEHADIRAN: {
    BASE: "/api/kehadiran",
    SCAN: "/api/kehadiran/scan",
    STATS: "/api/kehadiran/stats",
    EXPORT: "/api/kehadiran/export",
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
} as const;

export const QR_CONFIG = {
  WIDTH: 300,
  HEIGHT: 300,
  MARGIN: 2,
  ERROR_CORRECTION: "H" as const,
} as const;

export const SOCKET_EVENTS = {
  SCAN_SUCCESS: "scan:success",
  SCAN_ERROR: "scan:error",
  ATTENDANCE_UPDATE: "attendance:update",
  STATS_UPDATE: "stats:update",
} as const;

export const FAKULTAS_LIST = [
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
] as const;
