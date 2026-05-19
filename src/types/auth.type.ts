export type UserRole = "SUPER_ADMIN" | "ADMIN_FAKULTAS" | "PETUGAS_SCAN" | "MAHASISWA";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  fakultas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface Session {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
