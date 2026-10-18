"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  // State form email & password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(
    statusParam === "401"
      ? "Sesi Anda telah kedaluwarsa atau belum masuk. Silakan login terlebih dahulu."
      : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Metode B: Login Google OAuth Murni (Terhubung ke Supabase Auth)
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsOAuthLoading(true);
    try {
      const supabase = createClient();
      const redirectUri = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setErrorMessage(`Login Google gagal: ${error.message}`);
        setIsOAuthLoading(false);
        return;
      }

      if (data?.url) {
        try {
          const probe = await fetch(data.url, { method: "GET", redirect: "manual" });
          if (probe.status === 400) {
            const errorJson = await probe.json().catch(() => null);
            if (errorJson?.msg?.includes("provider is not enabled")) {
              setErrorMessage(
                "Penyedia Google belum diaktifkan di Supabase Dashboard (Authentication > Providers > Google). Silakan aktifkan tombol 'Enable Google provider' di dashboard Supabase, atau masuk menggunakan Email & Kata Sandi di bawah."
              );
              setIsOAuthLoading(false);
              return;
            }
          }
        } catch {
          // Fetch terpotong CORS saat redirect 302 menandakan provider aktif
        }

        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuka layanan Google.";
      setErrorMessage(msg);
      setIsOAuthLoading(false);
    }
  };

  // Metode A: Login Email & Kata Sandi Murni
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage("Email dan kata sandi wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const supabaseBrowser = createClient();
        const { data, error } = await supabaseBrowser.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error || !data.user) {
          setErrorMessage("Email atau kata sandi tidak cocok. Silakan coba kembali.");
          return;
        }

        // Pastikan akun aktif
        const { data: profile } = await supabaseBrowser
          .from("profiles")
          .select("aktif, peran")
          .eq("id", data.user.id)
          .single();

        if (profile && profile.aktif === false) {
          await supabaseBrowser.auth.signOut();
          setErrorMessage("Akun Anda telah dinonaktifkan. Hubungi pengelola Griya Kenanga Residence.");
          return;
        }

        setSuccessMessage("Login berhasil. Mengarahkan ke halaman...");
        window.location.href = returnUrl || "/dashboard";
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Gagal melakukan autentikasi.");
      }
    });
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-[#F6F7F9]">
      <OrbitalBackground />

      <div className="relative z-10 w-full max-w-md bg-white rounded-[28px] p-8 shadow-xl border border-[#E8EAEC] space-y-6">
        {/* Header Identitas Griya Kenanga Residence */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/logo-griya-kenanga.png"
              alt="Logo Griya Kenanga Residence Sleman"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1C1E22]">
            Griya Kenanga <span className="text-[#737A84] font-normal">Residence</span>
          </h1>
          <p className="text-xs text-[#737A84]">
            Sistem Manajemen Properti & Hunian Eksklusif
          </p>
        </div>

        {/* Feedback Pesan Kesalahan */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold block">Autentikasi Ditolak</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Feedback Pesan Berhasil */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* METODE B: Tombol Masuk Cepat dengan Google OAuth Murni */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isOAuthLoading || isPending}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-[#E8EAEC] hover:border-[#26292E] bg-white hover:bg-[#F6F7F9] text-[#26292E] text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isOAuthLoading ? "Mengarahkan ke Google..." : "Masuk Cepat dengan Google"}</span>
          </button>
        </div>

        {/* Garis Pemisah (Divider) */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E8EAEC]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
            <span className="bg-white px-3 text-[#737A84]">Atau Masuk dengan Email</span>
          </div>
        </div>

        {/* METODE A: Form Email & Kata Sandi Murni */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#26292E]">
                Kata Sandi
              </label>
              {/* Fitur Lupa Kata Sandi */}
              <Link
                href="/lupa-password"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Lupa kata sandi?</span>
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun"
                className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-1"
                aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Teks Panduan Standar Keamanan Ketat 12 - 16 karakter */}
            <p className="text-[11px] text-[#737A84] mt-1.5 leading-relaxed">
              Minimal 12 hingga 16 karakter, Gunakan gabungan huruf kapital (A-Z), huruf kecil (a-z), angka (0-9), serta simbol atau tanda baca.
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending || isOAuthLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 mt-2"
          >
            <span>{isPending ? "Memverifikasi..." : "Masuk ke Sistem"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D2F367]" />
          </button>
        </form>

        {/* Link Registrasi Penyewa */}
        <div className="pt-4 border-t border-[#E8EAEC] flex items-center justify-between text-xs text-[#737A84]">
          <span>Calon penyewa baru?</span>
          <Link
            href="/register"
            className="text-[#26292E] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Daftar Akun Penyewa</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#F6F7F9]">
          <OrbitalBackground />
          <div className="text-center text-xs text-[#737A84]">
            Memuat portal masuk...
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
