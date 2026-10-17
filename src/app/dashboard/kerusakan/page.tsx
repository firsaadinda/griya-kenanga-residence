import { getCurrentUserProfile } from "@/lib/auth/guard";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";

export default async function KerusakanPage() {

  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            pemeliharaan fasilitas [06]
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#26292E]">
            Laporan Kerusakan,{" "}
            <span className="text-[#737A84] font-normal">
              penanganan cepat & transparan
            </span>
          </h1>
          <p className="text-xs text-[#737A84] mt-1">
            Maksimal 3 tiket terbuka per penyewa (BR-11) dan persetujuan wajib Pemilik untuk estimasi &gt; Rp1.000.000 (BR-12).
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
          <strong>Informasi Modul Kerusakan:</strong> Terhubung dengan sesi aktif{" "}
          <strong className="uppercase">{profile?.nama_lengkap} ({profile?.peran})</strong>. Pada Tahap 6, modul ini mengelola pelaporan tiket kerusakan, upload foto kerusakan, penugasan vendor teknisi, dan approval biaya perbaikan.
        </div>
      </div>
    </div>
  );
}
