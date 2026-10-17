"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateStrongPassword } from "./password";

export interface AuthActionResult {
  success: boolean;
  statusCode: 200 | 400 | 401 | 500;
  message: string;
  redirectTo?: string;
}

/**
 * Server Action untuk proses login pengguna
 * - Validasi email dan password wajib diisi
 * - Validasi kata sandi kuat (min. 8 karakter, huruf besar, huruf kecil, angka, simbol) -> 400 Bad Request
 * - Murni terhubung ke Supabase Auth signInWithPassword
 * - Pengecekan status akun aktif di tabel profiles
 */
export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Alamat email dan kata sandi wajib diisi.",
    };
  }

  // Validasi ketat kata sandi: Wajib minimal 8 karakter dengan kombinasi lengkap
  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      statusCode: 400,
      message:
        passwordValidation.message ||
        "Kata sandi tidak memenuhi kriteria keamanan: minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol khusus.",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        statusCode: 401,
        message: "Email atau kata sandi tidak cocok. Silakan coba kembali.",
      };
    }

    // Ambil data profil untuk memastikan akun aktif
    const { data: profile } = await supabase
      .from("profiles")
      .select("peran, aktif")
      .eq("id", data.user.id)
      .single();

    if (profile && profile.aktif === false) {
      await supabase.auth.signOut();
      return {
        success: false,
        statusCode: 401,
        message: "Akun Anda telah dinonaktifkan. Silakan hubungi Pengelola Griya Kenanga Residence.",
      };
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      statusCode: 200,
      message: "Login berhasil. Mengarahkan ke dashboard...",
      redirectTo: "/dashboard",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kegagalan koneksi server.";
    return {
      success: false,
      statusCode: 500,
      message: errorMsg,
    };
  }
}

/**
 * Server Action untuk registrasi mandiri calon penyewa
 * Otomatis mendapatkan peran 'penyewa' di tabel profiles
 */
export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  const namaLengkap = (formData.get("nama_lengkap") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const noHp = (formData.get("no_hp") as string)?.trim();
  const password = formData.get("password") as string;
  const konfirmasiPassword = formData.get("konfirmasi_password") as string;

  if (!namaLengkap || !email || !noHp || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Semua kolom pendaftaran wajib diisi.",
    };
  }

  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      statusCode: 400,
      message:
        passwordValidation.message ||
        "Kata sandi minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol khusus.",
    };
  }

  if (password !== konfirmasiPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Konfirmasi kata sandi tidak cocok.",
    };
  }

  try {
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: namaLengkap,
          role: "penyewa",
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        statusCode: 400,
        message: authError?.message || "Pendaftaran gagal. Email mungkin sudah terdaftar.",
      };
    }

    // Pastikan baris di tabel profiles telah tersimpan dengan peran 'penyewa'
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      nama_lengkap: namaLengkap,
      email: email,
      no_hp: noHp,
      peran: "penyewa",
      aktif: true,
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      statusCode: 200,
      message: "Pendaftaran berhasil! Akun Anda aktif sebagai Penyewa.",
      redirectTo: "/dashboard",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem registrasi.";
    return {
      success: false,
      statusCode: 500,
      message: errorMsg,
    };
  }
}

/**
 * Server Action untuk keluar (Logout)
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
