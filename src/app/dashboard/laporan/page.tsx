import { requireRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BarChart3, ArrowLeft, ShieldAlert, Download, FileSpreadsheet } from "lucide-react";

export default async function LaporanPage() {

  // Guard Ketat: HANYA Pemilik yang diizinkan (Pengelola & Penyewa WAJIB DITOLAK -> 403)
  const profile = await requireRole(["pemilik"], "/dashboard/laporan");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            eksekutif & audit log [07]
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#26292E]">
            Laporan Pendapatan,{" "}
            <span className="text-[#737A84] font-normal">
              khusus Pemilik Properti
            </span>
          </h1>
          <p className="text-xs text-[#737A84] mt-1">
            Data rahasia keuangan, rekap omzet, tunggakan per unit, dan riwayat audit aktivitas staf. Anda masuk secara sah sebagai <strong className="uppercase text-[#26292E]">{profile.peran} ({profile.nama_lengkap})</strong>.
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

      <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#E8EAEC] shadow-sm space-y-6">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
          <div>
            <strong>Proteksi BR-10 Terverifikasi:</strong> Halaman ini hanya dapat diakses oleh Pemilik (Ibu Ratna). Pengelola (Bayu/Sinta) dan Penyewa yang mencoba mengetik URL ini otomatis dialihkan ke halaman 403 Akses Ditolak.
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase">
            Khusus Pemilik
          </span>
        </div>

        {/* Preview Ringkasan Eksekutif */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#737A84]">
              Total Tagihan Diterbitkan
            </span>
            <p className="text-xl font-bold text-[#26292E]">Rp119.380.000</p>
            <span className="text-[10px] text-[#737A84]">Periode Agustus - Oktober 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#737A84]">
              Total Penerimaan Bersih
            </span>
            <p className="text-xl font-bold text-emerald-700">Rp102.880.000</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Tingkat Kolektibilitas 86.2%</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#737A84]">
              Sisa Tunggakan Belum Dibayar
            </span>
            <p className="text-xl font-bold text-rose-600">Rp16.500.000</p>
            <span className="text-[10px] text-rose-600">7 unit dalam pengawasan denda</span>
          </div>
        </div>
      </div>
    </div>
  );
}
