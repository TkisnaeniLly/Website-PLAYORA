/** Bentuk respons sukses dari API PLAYORA. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

/** Bentuk respons gagal dari API PLAYORA. */
export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Data yang dikembalikan GET /api/v1/health */
export interface HealthData {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  databaseLatencyMs: number | null;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  error?: string;
}

export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface ValidationDetail {
  field: string;
  message: string;
}
