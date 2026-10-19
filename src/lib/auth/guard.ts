import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UserRole = "pemilik" | "pengelola" | "penyewa";

export interface UserProfile {
  id: string;
  email: string;
  nama_lengkap: string;
  no_hp: string | null;
  peran: UserRole;
  aktif: boolean;
  avatar_url?: string;
}

/**
 * Mengambil sesi autentikasi dan profil pengguna dari database Supabase
 * Dibungkus dengan React cache() untuk mencegah N-roundtrip auth request dalam satu siklus render Next.js
 */
export const getCurrentUserProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, nama_lengkap, no_hp, peran, aktif")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      nama_lengkap: profile.nama_lengkap,
      no_hp: profile.no_hp,
      peran: profile.peran as UserRole,
      aktif: profile.aktif,
    };
  } catch {
    return null;
  }
});

/**
 * Matriks Hak Akses Halaman Internal Berdasarkan Peran
 * Mengembalikan true jika peran pengguna diizinkan mengakses path tersebut
 */
export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  // 1. Dashboard Utama: Semua peran boleh mengakses
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return true;
  }

  // 2. Laporan Pendapatan, Audit Log & Pengaturan Peran: HANYA Pemilik (BR-10)
  if (
    pathname.startsWith("/dashboard/laporan") ||
    pathname.startsWith("/laporan") ||
    pathname.startsWith("/dashboard/pengaturan") ||
    pathname.startsWith("/pengaturan")
  ) {
    return role === "pemilik";
  }

  // 3. Modul Unit, Penyewa, dan Kontrak: Hanya Pemilik & Pengelola
  if (
    pathname.startsWith("/dashboard/unit") ||
    pathname.startsWith("/dashboard/penyewa") ||
    pathname.startsWith("/dashboard/kontrak")
  ) {
    return role === "pemilik" || role === "pengelola";
  }

  // 4. Modul Tagihan:
  // - Pemilik & Pengelola: Bebas kelola seluruh tagihan 24 unit & buat tagihan
  // - Penyewa: Boleh melihat tagihan kamarnya sendiri
  if (pathname.startsWith("/dashboard/tagihan")) {
    return true; // Filter data unit sendiri dilakukan di level query/RLS
  }

  // 5. Modul Kerusakan: Semua peran (Penyewa lapor, Pengelola tindak lanjut, Pemilik approval >1jt)
  if (pathname.startsWith("/dashboard/kerusakan")) {
    return true;
  }

  return true;
}

/**
 * Guard Helper untuk Server Component
 * Memeriksa apakah pengguna memiliki salah satu peran yang diizinkan.
 * Jika belum login -> diarahkan ke /login?status=401
 * Jika sudah login tapi peran tidak berhak -> diarahkan ke /unauthorized (403)
 */
export async function requireRole(allowedRoles: UserRole[], currentPath: string): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(`/login?status=401&returnUrl=${encodeURIComponent(currentPath)}`);
  }

  if (!allowedRoles.includes(profile.peran)) {
    redirect(`/unauthorized?required=${allowedRoles.join(",")}&current=${profile.peran}&path=${encodeURIComponent(currentPath)}`);
  }

  return profile;
}
