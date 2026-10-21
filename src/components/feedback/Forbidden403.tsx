import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, HelpCircle } from "lucide-react";

interface Forbidden403Props {
  currentRole?: string;
  requiredRoles?: string[];
  attemptedPath?: string;
}

export function Forbidden403({
  currentRole = "penyewa",
  requiredRoles = ["pemilik", "pengelola"],
  attemptedPath = "/dashboard/laporan",
}: Forbidden403Props) {
  const getRoleLabel = (r: string) => {
    switch (r) {
      case "pemilik":
        return "Pemilik Properti";
      case "pengelola":
        return "Pengelola Operasional";
      default:
        return "Penyewa Unit";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-10 rounded-[28px] bg-white border border-[#E8EAEC] shadow-[0_12px_45px_rgba(0,0,0,0.04)] space-y-8">
      {/* Label Superskrip & Two-Tone Editorial Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Status HTTP 403 • Hak Akses Ditolak</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E] leading-tight">
          Akses Ditolak,{" "}
          <span className="text-[#737A84] font-normal">
            peran Anda tidak memiliki izin.
          </span>
        </h1>
      </div>

      {/* Pesan Eksplisit Standar Bootcamp */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] space-y-3">
        <p className="text-sm font-semibold text-[#26292E] leading-relaxed">
          403 - Akses Ditolak: Anda sudah login, tetapi peran Anda tidak berhak membuka halaman ini.
        </p>
        <p className="text-xs text-[#737A84] leading-relaxed">
          Sistem mendeteksi Anda masuk sebagai{" "}
          <strong className="text-[#26292E] font-semibold uppercase">
            {getRoleLabel(currentRole)}
          </strong>
          . Halaman tujuan ({attemptedPath}) hanya dapat dibuka oleh peran:{" "}
          <strong className="text-[#26292E] font-semibold">
            {requiredRoles.map(getRoleLabel).join(", ")}
          </strong>
          .
        </p>
      </div>

      {/* Kotak Edukasi Perbedaan 401 dan 403 Sesuai Materi Bootcamp */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-semibold">
          <HelpCircle className="w-4 h-4 text-amber-700" />
          <span>Panduan Status Error (Jangan Tertukar antara 401 dan 403):</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 pl-1">
          <li>
            <strong>401 (Unauthorized):</strong> Pengunjung BELUM login atau sesi loginnya sudah berakhir/kedaluwarsa.
          </li>
          <li>
            <strong>403 (Forbidden):</strong> Pengguna SUDAH login dan teridentifikasi, namun hak perannya tidak diizinkan membuka data atau URL tersebut.
          </li>
        </ul>
      </div>

      {/* Tombol Aksi Kembali */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition"
        >
          <Home className="w-4 h-4 text-[#88BC3C]" />
          <span>Kembali ke Beranda Sah</span>
        </Link>

        <Link
          href="/login"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-xs font-medium border border-[#E8EAEC] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#737A84]" />
          <span>Ganti Akun dengan Peran Lain</span>
        </Link>
      </div>
    </div>
  );
}
