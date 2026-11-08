import axios from "axios";
import type { ApiSuccess, HealthData, ValidationDetail } from "@/types/api";
import { ensureCsrfToken } from "./csrf";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

const METODE_AMAN = new Set(["get", "head", "options"]);

api.interceptors.request.use(async (config) => {
  const metode = (config.method ?? "get").toLowerCase();

  if (!METODE_AMAN.has(metode)) {
    const token = await ensureCsrfToken();
    if (token) {
      config.headers.set("X-CSRF-Token", token);
    }
  }

  return config;
});

export async function getHealth(): Promise<HealthData> {
  const response = await api.get<ApiSuccess<HealthData>>("/health");
  return response.data.data;
}

export interface ApiErrorInfo {
  code: string | null;
  message: string;
  details: ValidationDetail[];
}

export function extractApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { error?: { code?: string; message?: string; details?: unknown } }
      | undefined;

    if (body?.error?.message) {
      const details = Array.isArray(body.error.details)
        ? (body.error.details as ValidationDetail[])
        : [];
      return {
        code: body.error.code ?? null,
        message: body.error.message,
        details,
      };
    }

    if (error.response?.status === 429) {
      return {
        code: "RATE_LIMITED",
        message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
        details: [],
      };
    }

    if (error.code === "ERR_NETWORK") {
      return {
        code: "NETWORK_ERROR",
        message: "Tidak dapat menghubungi server. Periksa koneksi Anda.",
        details: [],
      };
    }
  }

  return {
    code: null,
    message: "Terjadi kesalahan. Silakan coba lagi.",
    details: [],
  };
}
