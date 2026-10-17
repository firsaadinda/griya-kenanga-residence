import { requireRole } from "@/lib/auth/guard";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";

export default async function PenyewaPage() {

  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/penyewa");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            direktori penghuni [03]
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#26292E]">
            Kelola Data Penyewa,{" "}
            <span className="text-[#737A84] font-normal">identitas & kontak</span>
          </h1>
          <p className="text-xs text-[#737A84] mt-1">
            Data 22 penyewa terdaftar. Mode tampilan: {profile.peran === "pemilik" ? "NIK Disensor (Privasi Pemilik)" : "NIK Lengkap (Akses Pengelola)"}.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] shadow-sm transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#E8EAEC] shadow-sm space-y-4">
        <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs text-[#26292E]">
          <strong>Informasi Modul Penyewa:</strong> Hak akses terverifikasi untuk peran{" "}
          <strong className="uppercase">{profile.peran}</strong>. Pada Tahap 4, modul ini menampilkan daftar penghuni aktif beserta status verifikasi KTP.
        </div>
      </div>
    </div>
  );
}
