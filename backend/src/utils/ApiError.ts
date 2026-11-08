/**
 * Kode error kanonik PLAYORA.
 * Setiap respons gagal WAJIB memakai salah satu kode di bawah ini
 * agar frontend dapat menanganinya secara seragam.
 */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, "VALIDATION_ERROR", message, details);
  }

  static unauthorized(message = "Anda harus login untuk mengakses sumber daya ini."): ApiError {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Anda tidak memiliki hak akses untuk tindakan ini."): ApiError {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Sumber daya tidak ditemukan."): ApiError {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, "CONFLICT", message);
  }

  static tooManyRequests(message = "Terlalu banyak permintaan. Coba lagi nanti."): ApiError {
    return new ApiError(429, "RATE_LIMITED", message);
  }

  static internal(message = "Terjadi kesalahan pada server."): ApiError {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}
