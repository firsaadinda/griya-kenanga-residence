import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 Proxy (Konvensi pengganti middleware di Next.js 16)
 * - Menyinkronkan sesi Supabase token
 * - Mencegat pengguna yang BELUM LOGIN (401) saat mencoba membuka rute internal /dashboard
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Proteksi rute internal dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("status", "401");
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan membuka halaman /login, /register, atau /lupa-password, arahkan langsung ke /dashboard
  if (pathname === "/login" || pathname === "/register" || pathname === "/lupa-password") {
    if (user) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Berlaku untuk semua rute kecuali file statis Next.js dan file gambar:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - ekstensi gambar (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

