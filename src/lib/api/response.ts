import { NextResponse } from "next/server";
import { ApiResponse, HTTP_STATUS_CATALOG, HttpStatusCode } from "@/types/api";

/**
 * Helper respons sukses standar (Status 200)
 */
export function apiSuccess<T>(
  data?: T,
  message?: string,
  statusCode: HttpStatusCode = 200
): NextResponse<ApiResponse<T>> {
  const meta = HTTP_STATUS_CATALOG[statusCode] || HTTP_STATUS_CATALOG[200];

  return NextResponse.json(
    {
      success: true,
      statusCode,
      message: message || meta.defaultMessage,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Helper respons error standar (Status 400, 401, 403, 404, 429, 500)
 */
export function apiError(
  statusCode: Exclude<HttpStatusCode, 200>,
  message?: string,
  errors?: Record<string, string[]> | string | null
): NextResponse<ApiResponse<null>> {
  const meta = HTTP_STATUS_CATALOG[statusCode] || HTTP_STATUS_CATALOG[500];

  return NextResponse.json(
    {
      success: false,
      statusCode,
      message: message || meta.defaultMessage,
      errors: errors || null,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
