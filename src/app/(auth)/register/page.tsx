"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { registerAction } from "@/lib/auth/actions";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { ProfilePhotoUpload } from "@/components/auth/ProfilePhotoUpload";
import { validateStrongPassword } from "@/lib/auth/password";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Shield,
  Loader2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Form input states
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [setujuSyarat, setSetujuSyarat] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Email validation state
  const [emailFormatError, setEmailFormatError] = useState<string | null>(null);
  const [emailExistsWarning, setEmailExistsWarning] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Form submission state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal Terms & Privacy
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Real-time email validation dengan debounce
  useEffect(() => {
    if (!email.trim()) {
      setEmailFormatError(null);
      setEmailExistsWarning(null);
      setIsCheckingEmail(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailFormatError("Format email tidak valid (contoh: nama@domain.com)");
      setEmailExistsWarning(null);
      setIsCheckingEmail(false);
      return;
    }

    setEmailFormatError(null);
    setIsCheckingEmail(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.exists) {
          setEmailExistsWarning("Email ini sudah terdaftar. Silakan login atau gunakan email lain.");
        } else {
          setEmailExistsWarning(null);
        }
      } catch {
        // Abaikan error jaringan sesaat
      } finally {
        setIsCheckingEmail(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validasi email
    if (emailFormatError) {
      setErrorMessage(emailFormatError);
      return;
    }

    if (emailExistsWarning) {
      setErrorMessage("Email sudah terdaftar. Silakan gunakan email lain atau masuk.");
      return;
    }

    // Validasi kata sandi 12 - 16 karakter
    const passwordCheck = validateStrongPassword(password);
    if (!passwordCheck.isValid) {
      setErrorMessage(
        passwordCheck.message ||
          "Kata sandi wajib 12 hingga 16 karakter dan memuat huruf besar, huruf kecil, angka, dan simbol."
      );
      return;
    }

    // Validasi konfirmasi password
    if (password !== konfirmasiPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Validasi persetujuan syarat
    if (!setujuSyarat) {
      setErrorMessage("Anda wajib mencentang persetujuan Syarat & Ketentuan serta Kebijakan Privasi.");
      return;
    }

    const formData = new FormData();
    formData.set("nama_lengkap", namaLengkap);
    formData.set("email", email);
    formData.set("no_hp", noHp);
    formData.set("password", password);
    formData.set("konfirmasi_password", konfirmasiPassword);
    formData.set("setuju_syarat", "true");

    if (avatarFile) {
      formData.set("foto_profil", avatarFile);
    }

    startTransition(async () => {
      const res = await registerAction(formData);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push(res.redirectTo || "/dashboard");
        }, 1200);
      }
    });
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F6F7F9]">
      <OrbitalBackground />

      <div className="w-full max-w-xl my-8 relative z-10">
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] border border-[#E8EAEC] space-y-6">
          {/* Header Identitas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
                Registrasi Akun Calon Penghuni
              </span>
              <img
                src="/logo-griya-kenanga.png"
                alt="Logo Griya Kenanga Residence"
                className="h-9 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1E22] leading-tight">
              Daftar Akun Baru,{" "}
              <span className="text-[#737A84] font-normal">
                Griya Kenanga Residence
              </span>
            </h1>
            <p className="text-xs text-[#737A84] leading-relaxed">
              Lengkapi informasi identitas untuk mengakses portal pemesanan unit, kontrak sewa, dan layanan penghuni.
            </p>
          </div>

          {/* Notifikasi Pesan */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Form Registrasi */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Komponen Foto Profil Opsional */}
            <div className="p-4 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC]">
              <ProfilePhotoUpload
                fullName={namaLengkap}
                onPhotoSelected={(file: File | null) => setAvatarFile(file)}
              />
            </div>

            {/* 2. Informasi Pribadi */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Nama Lengkap (sesuai KTP) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Contoh: Dimas Santoso"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Email dengan Validasi Real-Time */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#26292E]">
                    Alamat Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  {isCheckingEmail && (
                    <span className="text-[11px] text-[#737A84] flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      Mengecek email...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="penyewa@gmail.com"
                    className={`w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border transition focus:bg-white focus:outline-none ${
                      emailExistsWarning
                        ? "border-rose-400 bg-rose-50/50"
                        : emailFormatError
                        ? "border-amber-400 bg-amber-50/50"
                        : "border-transparent focus:border-[#D5D9DE]"
                    }`}
                  />
                </div>

                {/* Warning Email Real-time */}
                {emailFormatError && (
                  <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{emailFormatError}</span>
                  </p>
                )}
                {emailExistsWarning && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{emailExistsWarning}</span>
                  </p>
                )}
                {!emailFormatError && !emailExistsWarning && email.length > 5 && !isCheckingEmail && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Format email valid dan siap digunakan.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. Aturan & Validasi Kata Sandi (12 - 16 Karakter + Kekuatan Sandi) */}
            <div className="space-y-4 pt-2 border-t border-[#E8EAEC]">
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={16}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="12 - 16 karakter (kombinasi huruf, angka & simbol)"
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

                {/* Teks Informasi Ketentuan Password Standar */}
                <p className="text-[11px] text-[#737A84] mt-1.5 leading-relaxed">
                  Minimal 12 hingga 16 karakter, Gunakan gabungan huruf kapital (A-Z), huruf kecil (a-z), angka (0-9), serta simbol atau tanda baca.
                </p>

                {/* Dynamic Password Strength Indicator */}
                <div className="mt-2.5">
                  <PasswordStrengthIndicator password={password} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={12}
                    maxLength={16}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-10 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-1"
                    aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {konfirmasiPassword && password !== konfirmasiPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Konfirmasi kata sandi belum cocok.</span>
                  </p>
                )}
                {konfirmasiPassword && password === konfirmasiPassword && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Konfirmasi kata sandi cocok.</span>
                  </p>
                )}
              </div>
            </div>

            {/* 4. Persetujuan Syarat & Ketentuan serta Kebijakan Privasi */}
            <div className="pt-2 border-t border-[#E8EAEC]">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={setujuSyarat}
                  onChange={(e) => setSetujuSyarat(e.target.checked)}
                  required
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1C1E22] focus:ring-[#1C1E22] transition cursor-pointer"
                />
                <span className="text-xs text-[#737A84] leading-relaxed group-hover:text-[#26292E] transition">
                  Saya telah membaca dan menyetujui{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-semibold text-[#1C1E22] underline hover:text-emerald-700 inline"
                  >
                    Syarat & Ketentuan
                  </button>{" "}
                  serta{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-semibold text-[#1C1E22] underline hover:text-emerald-700 inline"
                  >
                    Kebijakan Privasi
                  </button>{" "}
                  Griya Kenanga Residence.
                </span>
              </label>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isPending || !setujuSyarat || !!emailExistsWarning || !!emailFormatError}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              <span>{isPending ? "Mendaftarkan Akun..." : "Daftar sebagai Penyewa"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88BC3C]" />
            </button>
          </form>

          {/* Footer Balik ke Login */}
          <div className="pt-3 border-t border-[#E8EAEC] flex items-center justify-between text-xs text-[#737A84]">
            <span>Sudah memiliki akun terdaftar?</span>
            <Link
              href="/login"
              className="text-[#26292E] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Masuk di sini</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Syarat & Ketentuan */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8EAEC] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEC]">
              <h3 className="text-base font-bold text-[#1C1E22]">Syarat & Kebijakan Privasi</h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-xs text-[#737A84] hover:text-[#26292E] px-2 py-1 rounded-lg hover:bg-[#F6F7F9]"
              >
                Tutup
              </button>
            </div>

            <div className="text-xs text-[#737A84] space-y-3 leading-relaxed">
              <h4 className="font-bold text-[#26292E]">1. Ketentuan Hunian</h4>
              <p>
                Setiap calon penyewa menyetujui bahwa unit hunian di Griya Kenanga Residence Sleman hanya diperuntukkan bagi penyewa sah yang tercatat di sistem manajemen properti.
              </p>

              <h4 className="font-bold text-[#26292E]">2. Perlindungan Privasi Data</h4>
              <p>
                Informasi data diri, nomor kontak, serta foto profil yang diunggah hanya dimanfaatkan untuk verifikasi keabsahan kontrak sewa, penerbitan tagihan resmi, serta pelaporan kerusakan kamar.
              </p>

              <h4 className="font-bold text-[#26292E]">3. Keamanan Akun</h4>
              <p>
                Penyewa bertanggung jawab penuh atas kerahasiaan kata sandi akun masing-masing. Kata sandi wajib memenuhi standar keamanan ketat (12-16 karakter dengan kombinasi lengkap).
              </p>
            </div>

            <div className="pt-3 border-t border-[#E8EAEC] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSetujuSyarat(true);
                  setShowTermsModal(false);
                }}
                className="py-2.5 px-5 rounded-full bg-[#1C1E22] text-white text-xs font-semibold hover:bg-[#26292E] transition"
              >
                Saya Mengerti & Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
