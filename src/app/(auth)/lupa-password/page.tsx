"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { forgotPasswordAction, verifyOtpAndResetPasswordAction } from "@/lib/auth/actions";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { validateStrongPassword } from "@/lib/auth/password";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Smartphone,
} from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "reset" ? "otp" : "email";

  // Tab/Mode: "email" (kirim link / OTP) atau "otp" (masukkan OTP & sandi baru)
  const [mode, setMode] = useState<"email" | "otp">(initialMode);

  // States
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback status
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Handle kirim link / OTP reset
  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Format email tidak valid.");
      return;
    }

    const formData = new FormData();
    formData.set("email", email);

    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        // Izinkan pengguna lanjut ke langkah OTP jika ingin verifikasi kode langsung
      }
    });
  };

  // Handle verifikasi OTP dan update sandi baru
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi 12 - 16 karakter kata sandi baru
    const passwordCheck = validateStrongPassword(newPassword);
    if (!passwordCheck.isValid) {
      setErrorMessage(
        passwordCheck.message ||
          "Kata sandi baru wajib 12 hingga 16 karakter dan memuat huruf besar, huruf kecil, angka, dan simbol."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    const formData = new FormData();
    formData.set("email", email);
    formData.set("token", otpToken);
    formData.set("new_password", newPassword);
    formData.set("confirm_password", confirmPassword);

    startTransition(async () => {
      const res = await verifyOtpAndResetPasswordAction(formData);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    });
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-[#F6F7F9]">
      <OrbitalBackground />

      <div className="relative z-10 w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-xl border border-[#E8EAEC] space-y-6">
        {/* Header Identitas & Kembali */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737A84] hover:text-[#26292E] transition mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F7EC] border border-[#5E8826]/30 text-[11px] font-semibold text-[#4A6C2F] mb-1">
              <KeyRound className="w-3.5 h-3.5 text-[#5E8826]" />
              <span>Pemulihan Kata Sandi</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#1C1E22]">
              Lupa Kata Sandi?
            </h1>
            <p className="text-xs text-[#737A84] leading-relaxed">
              Atur ulang kata sandi akun Anda melalui tautan pemulihan email atau kode OTP resmi.
            </p>
          </div>
        </div>

        {/* Tab Switcher: Permintaan Email vs Verifikasi OTP */}
        <div className="grid grid-cols-2 p-1 bg-[#F6F7F9] rounded-2xl border border-[#E8EAEC] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition ${
              mode === "email"
                ? "bg-white text-[#1C1E22] shadow-sm font-bold"
                : "text-[#737A84] hover:text-[#1C1E22]"
            }`}
          >
            1. Kirim Email Link
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("otp");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl transition ${
              mode === "otp"
                ? "bg-white text-[#1C1E22] shadow-sm font-bold"
                : "text-[#737A84] hover:text-[#1C1E22]"
            }`}
          >
            2. Masukkan OTP & Sandi
          </button>
        </div>

        {/* Feedback Pesan Kesalahan */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Feedback Pesan Sukses */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* Form Mode 1: Request Link Pemulihan via Email */}
        {mode === "email" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Alamat Email Akun Terdaftar
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="penyewa@gmail.com"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-[#737A84] mt-1.5 leading-relaxed">
                Kami akan mengirimkan instruksi pemulihan langsung ke alamat email ini.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 mt-2"
            >
              <span>{isPending ? "Mengirimkan Instruksi..." : "Kirim Instruksi Pemulihan"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88BC3C]" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode("otp")}
                className="text-xs text-[#26292E] hover:underline font-semibold"
              >
                Sudah memiliki kode OTP? Masukkan di sini →
              </button>
            </div>
          </form>
        ) : (
          /* Form Mode 2: Verifikasi Kode OTP & Sandi Baru */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  placeholder="penyewa@gmail.com"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Kode Verifikasi / Token OTP
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                <input
                  type="text"
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  placeholder="Masukkan kode OTP dari email"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#E8EAEC]">
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Kata Sandi Baru (12 - 16 Karakter)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={16}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="12 - 16 karakter sandi baru"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="mt-2.5">
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={16}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !otpToken || !newPassword}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 mt-2"
            >
              <span>{isPending ? "Memperbarui Kata Sandi..." : "Simpan Kata Sandi Baru"}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#88BC3C]" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#F6F7F9]">
          <OrbitalBackground />
          <div className="text-center text-xs text-[#737A84]">
            Memuat layanan pemulihan kata sandi...
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
