import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Route Handler untuk OAuth Callback (Google Auth)
 * Menukar authorization code dengan sesi Supabase dan mengarahkan ke dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Pastikan baris profiles sudah ada (otomatis peran penyewa jika akun baru)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, peran, aktif")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          nama_lengkap:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Penyewa Google",
          email: data.user.email || "",
          no_hp: null,
          peran: "penyewa",
          aktif: true,
        });
      }

      return NextResponse.redirect(`${origin}${returnUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?status=401&message=${encodeURIComponent("Gagal verifikasi autentikasi OAuth Google")}`);
}
