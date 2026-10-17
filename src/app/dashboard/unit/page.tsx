import { requireRole } from "@/lib/auth/guard";
import Link from "next/link";
import { Building2, ArrowLeft, Plus } from "lucide-react";

export default async function UnitPage() {

  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/unit");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            katalog unit [02]
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#26292E]">
            Kelola 24 Unit,{" "}
            <span className="text-[#737A84] font-normal">kos & studio</span>
          </h1>
          <p className="text-xs text-[#737A84] mt-1">
            Daftar 24 unit properti di Griya Kenanga Residence (A-101 s.d. C-308). Anda masuk sebagai {profile.peran}.
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
          <strong>Informasi Modul Unit:</strong> Hak akses terverifikasi untuk peran{" "}
          <strong className="uppercase">{profile.peran}</strong>. Pada Tahap 4, modul ini akan menampilkan tabel data interaktif 24 unit lengkap dengan filter lantai, tipe, dan status ketersediaan.
        </div>
      </div>
    </div>
  );
}
