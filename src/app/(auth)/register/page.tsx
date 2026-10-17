"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import { registerAction } from "@/lib/auth/actions";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

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

      <div className="w-full max-w-lg my-6">
        <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] border border-[#E8EAEC] space-y-6">
          {/* Header & Two-Tone Title */}
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              registrasi penyewa [02]
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-[#26292E] leading-tight">
              Daftar Akun Baru,{" "}
              <span className="text-[#737A84] font-normal">
                jadi penghuni terverifikasi.
              </span>
            </h1>
            <p className="text-xs text-[#737A84] leading-relaxed">
              Pendaftaran akun mandiri untuk calon penyewa unit kos & studio Griya Kenanga Residence.
            </p>
          </div>

          {/* Badge Peran Otomatis Penyewa */}
          <div className="p-3 rounded-2xl bg-[#ECFCCB] border border-[#D2F367] flex items-center gap-2.5 text-xs text-[#1C1E22]">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Akun baru secara otomatis terdaftar dengan hak peran{" "}
              <strong className="font-bold uppercase">Penyewa</strong>.
            </span>
          </div>

          {/* Notifikasi Pesan */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Registrasi */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Nama Lengkap (sesuai KTP)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                <input
                  type="text"
                  name="nama_lengkap"
                  required
                  placeholder="Contoh: Dimas Santoso"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Alamat Email Aktif
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="penyewa@gmail.com"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Nomor WhatsApp / HP Aktif
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                <input
                  type="tel"
                  name="no_hp"
                  required
                  placeholder="081234567890"
                  className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={8}
                      placeholder="Min. 8 karakter"
                      className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                    Ulangi Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737A84]" />
                    <input
                      type="password"
                      name="konfirmasi_password"
                      required
                      minLength={8}
                      placeholder="Konfirmasi sandi"
                      className="w-full bg-[#F6F7F9] text-xs text-[#26292E] pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Teks Panduan Keamanan Sandi */}
              <p className="text-[11px] text-[#737A84] leading-relaxed">
                Kombinasi huruf besar, huruf kecil, angka, dan simbol khusus (min. 8 karakter).
              </p>
            </div>


            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 mt-2"
            >
              <span>{isPending ? "Mendaftarkan Akun..." : "Daftar sebagai Penyewa"}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D2F367]" />
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
    </main>
  );
}
