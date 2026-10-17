import { requireRole } from "@/lib/auth/guard";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default async function KontrakPage() {

  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/kontrak");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            perjanjian sewa [04]
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#26292E]">
            Kelola Kontrak,{" "}
            <span className="text-[#737A84] font-normal">bebas tumpang tindih</span>
          </h1>
          <p className="text-xs text-[#737A84] mt-1">
            Validasi ketat BR-01 (anti iris tanggal sewa) & BR-02 (tanggal mulai wajib tanggal 1). Anda masuk sebagai {profile.peran}.
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
          <strong>Informasi Modul Kontrak:</strong> Hak akses terverifikasi untuk peran{" "}
          <strong className="uppercase">{profile.peran}</strong>. Pada Tahap 4, modul ini menyajikan manajemen kontrak draf, aktif, dan arsip PDF perjanjian sewa.
        </div>
      </div>
    </div>
  );
}
