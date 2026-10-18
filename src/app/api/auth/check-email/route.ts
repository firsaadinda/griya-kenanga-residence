import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ exists: false, error: "Email diperlukan" }, { status: 400 });
  }

  // Cek regex email dasar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ exists: false, error: "Format email tidak valid" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Cek di tabel profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      // Jika terjadi error database yang bukan not found
      console.error("Database check error:", error);
    }

    const exists = !!profile;

    return NextResponse.json({
      exists,
      message: exists ? "Email ini sudah terdaftar" : "Email tersedia",
    });
  } catch (err: unknown) {
    console.error("Error checking email:", err);
    return NextResponse.json({ exists: false, error: "Gagal memeriksa email" }, { status: 500 });
  }
}
