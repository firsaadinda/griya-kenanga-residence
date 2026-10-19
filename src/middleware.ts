import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware:
 * - Menyinkronkan dan me-refresh sesi token Supabase secara otomatis pada setiap request
 * - Memperbarui cookie session response agar tidak kedaluwarsa secara tiba-tiba
 * - Mengarahkan pengguna yang belum login ke /login saat membuka /dashboard
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Berlaku untuk semua rute kecuali file statis Next.js dan file gambar:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - file gambar statis (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
