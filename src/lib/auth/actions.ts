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

  // Validasi ketat kata sandi: Wajib 12 - 16 karakter dengan kombinasi lengkap
  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      statusCode: 400,
      message:
        passwordValidation.message ||
        "Kata sandi wajib 12 hingga 16 karakter dengan kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol.",
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
  const setujuSyarat = formData.get("setuju_syarat") === "true" || formData.get("setuju_syarat") === "on";
  const avatarFile = formData.get("foto_profil") as File | null;

  if (!namaLengkap || !email || !noHp || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Semua kolom pendaftaran wajib diisi.",
    };
  }

  if (!setujuSyarat) {
    return {
      success: false,
      statusCode: 400,
      message: "Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi.",
    };
  }

  const passwordValidation = validateStrongPassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      statusCode: 400,
      message:
        passwordValidation.message ||
        "Kata sandi wajib 12 hingga 16 karakter dengan kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol.",
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

    // Cek apakah email sudah terdaftar di profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return {
        success: false,
        statusCode: 400,
        message: "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.",
      };
    }

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

    let fotoProfilUrl: string | null = null;

    // Proses upload foto profil jika dilampirkan
    if (avatarFile && avatarFile.size > 0 && avatarFile.size <= 2 * 1024 * 1024) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(avatarFile.type)) {
        try {
          const fileExt = avatarFile.name.split(".").pop() || "jpg";
          const filePath = `${authData.user.id}/avatar-${Date.now()}.${fileExt}`;
          
          const { error: uploadErr } = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, { upsert: true });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath);
            fotoProfilUrl = publicUrlData.publicUrl;
          }
        } catch (uploadException) {
          console.warn("Avatar upload skipped/failed:", uploadException);
        }
      }
    }

    // Simpan ke tabel profiles
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      nama_lengkap: namaLengkap,
      email: email,
      no_hp: noHp,
      peran: "penyewa",
      aktif: true,
    });

    if (fotoProfilUrl) {
      await supabase.auth.updateUser({
        data: { avatar_url: fotoProfilUrl },
      });
    }

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
 * Server Action untuk Permintaan Reset Kata Sandi (Lupa Password)
 * Mengirimkan tautan pemulihan ke alamat email terdaftar
 */
export async function forgotPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email) {
    return {
      success: false,
      statusCode: 400,
      message: "Alamat email wajib diisi.",
    };
  }

  try {
    const supabase = await createClient();

    // Verifikasi apakah email terdaftar di profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!profile) {
      return {
        success: false,
        statusCode: 400,
        message: "Alamat email tidak ditemukan dalam sistem perumahan.",
      };
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/lupa-password?mode=reset`,
    });

    if (error) {
      return {
        success: false,
        statusCode: 400,
        message: error.message || "Gagal mengirim email pemulihan kata sandi.",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Instruksi pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Gagal memproses pemulihan kata sandi.",
    };
  }
}

/**
 * Server Action untuk Verifikasi Kode OTP & Update Sandi Baru
 */
export async function verifyOtpAndResetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const token = (formData.get("token") as string)?.trim();
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!email || !token || !newPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Email, token OTP, dan kata sandi baru wajib diisi.",
    };
  }

  const passwordValidation = validateStrongPassword(newPassword);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      statusCode: 400,
      message:
        passwordValidation.message ||
        "Kata sandi baru wajib 12 hingga 16 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Konfirmasi kata sandi tidak cocok.",
    };
  }

  try {
    const supabase = await createClient();

    // Verifikasi OTP
    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    });

    if (otpError) {
      return {
        success: false,
        statusCode: 400,
        message: "Kode OTP tidak valid atau telah kedaluwarsa.",
      };
    }

    // Perbarui password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        statusCode: 400,
        message: updateError.message || "Gagal memperbarui kata sandi.",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Kata sandi Anda berhasil diperbarui! Silakan login dengan kata sandi baru.",
      redirectTo: "/login",
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Gagal memproses penggantian kata sandi.",
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
