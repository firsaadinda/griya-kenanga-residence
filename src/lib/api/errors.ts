import { HTTP_STATUS_CATALOG, HttpStatusCode } from "@/types/api";
import { apiError } from "./response";
import { NextResponse } from "next/server";

export class AppError extends Error {
  public statusCode: Exclude<HttpStatusCode, 200>;
  public errors?: Record<string, string[]> | string | null;

  constructor(
    statusCode: Exclude<HttpStatusCode, 200>,
    message?: string,
    errors?: Record<string, string[]> | string | null
  ) {
    const defaultMsg = HTTP_STATUS_CATALOG[statusCode]?.defaultMessage || "Terjadi kesalahan.";
    super(message || defaultMsg);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/** 400: Validasi formulir gagal atau melanggar aturan bisnis (Business Rules) */
export class ValidationError extends AppError {
  constructor(message?: string, errors?: Record<string, string[]> | string | null) {
    super(400, message || HTTP_STATUS_CATALOG[400].defaultMessage, errors);
    this.name = "ValidationError";
  }
}

/** 401: Belum login atau sesi login berakhir */
export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(401, message || HTTP_STATUS_CATALOG[401].defaultMessage);
    this.name = "UnauthorizedError";
  }
}

/** 403: Sudah login, namun peran (role) tidak berhak mengakses */
export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(403, message || HTTP_STATUS_CATALOG[403].defaultMessage);
    this.name = "ForbiddenError";
  }
}

/** 404: Data atau resource tidak ditemukan */
export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(404, message || HTTP_STATUS_CATALOG[404].defaultMessage);
    this.name = "NotFoundError";
  }
}

/** 429: Rate limit atau proteksi spam klik tombol */
export class RateLimitError extends AppError {
  constructor(message?: string) {
    super(429, message || HTTP_STATUS_CATALOG[429].defaultMessage);
    this.name = "RateLimitError";
  }
}

/** 500: Server atau database Supabase mengalami gangguan */
export class InternalServerError extends AppError {
  constructor(message?: string) {
    super(500, message || HTTP_STATUS_CATALOG[500].defaultMessage);
    this.name = "InternalServerError";
  }
}

/**
 * Global API Error Handler untuk Route Handlers
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return apiError(error.statusCode, error.message, error.errors);
  }

  // Handle standard JavaScript Error
  if (error instanceof Error) {
    // Tangani kemungkinan pesan error Supabase atau network
    if (error.message.includes("JWT") || error.message.includes("auth")) {
      return apiError(401, "Sesi login tidak valid atau telah berakhir.");
    }

    return apiError(
      500,
      process.env.NODE_ENV === "development"
        ? error.message
        : HTTP_STATUS_CATALOG[500].defaultMessage
    );
  }

  return apiError(500, HTTP_STATUS_CATALOG[500].defaultMessage);
}
