import { getCurrentUserProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { KerusakanClientView, LaporanKerusakanItem } from "./KerusakanClientView";

export default async function KerusakanPage() {
  const profile = await getCurrentUserProfile();

  const supabase = await createClient();

  // 1. Ambil daftar laporan kerusakan berdasarkan peran:
  // Penyewa: hanya melihat laporan miliknya
  // Staf (Pengelola/Pemilik): melihat semua laporan kerusakan
  let query = supabase
    .from("laporan_kerusakan")
    .select(`
      id,
      nomor,
      kategori,
      judul,
      deskripsi,
      foto_paths,
      status,
      estimasi_biaya,
      biaya_aktual,
      alasan_tolak,
      catatan,
      disetujui_pada,
      selesai_pada,
      ditutup_pada,
      dibuat_pada,
      unit:unit_id (
        kode
      ),
      pelapor:pelapor_id (
        id,
        nama_lengkap,
        email
      )
    `)
    .order("nomor", { ascending: false });

  if (profile?.peran === "penyewa") {
    query = query.eq("pelapor_id", profile.id);
  }

  const { data: rawLaporan } = await query;

  const laporanList: LaporanKerusakanItem[] = (rawLaporan || []).map((lk: any) => {
    const rawPaths = Array.isArray(lk.foto_paths) ? lk.foto_paths : [lk.foto_paths];
    const cleanPaths = rawPaths
      .flatMap((p: any) => (typeof p === "string" ? p.split(",").map((s) => s.trim()) : []))
      .filter(Boolean);

    return {
      id: lk.id,
      nomor: lk.nomor,
      unit_kode: lk.unit?.kode || "-",
      pelapor_id: lk.pelapor?.id || "",
      pelapor_nama: lk.pelapor?.nama_lengkap || "-",
      pelapor_email: lk.pelapor?.email || "-",
      kategori: lk.kategori,
      judul: lk.judul,
      deskripsi: lk.deskripsi,
      foto_paths: cleanPaths.length > 0 ? cleanPaths : [`kerusakan/${lk.nomor}-1.jpg`],
      status: lk.status,
      estimasi_biaya: lk.estimasi_biaya,
      biaya_aktual: lk.biaya_aktual,
      alasan_tolak: lk.alasan_tolak,
      catatan: lk.catatan,
      disetujui_pada: lk.disetujui_pada,
      selesai_pada: lk.selesai_pada,
      ditutup_pada: lk.ditutup_pada,
      dibuat_pada: lk.dibuat_pada,
    };
  });

  // Cari unit kontrak aktif milik penyewa (jika penyewa)
  let activeContractUnit = null;
  if (profile?.peran === "penyewa") {
    const { data: activeContract } = await supabase
      .from("kontrak")
      .select("unit:unit_id(kode)")
      .eq("penyewa_id", profile.id)
      .eq("status", "aktif")
      .maybeSingle();

    activeContractUnit = (activeContract as any)?.unit?.kode || null;
  }

  return (
    <div className="space-y-8">
      {/* HEADER DUA WARNA MONTE X TERRA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            pemeliharaan fasilitas [06]
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E]">
            Laporan Kerusakan,{" "}
            <span className="text-[#737A84] font-normal">tanggap & transparan</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737A84] mt-1">
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

      {/* VIEW CLIENT KERUSAKAN */}
      <KerusakanClientView
        initialLaporan={laporanList}
        userRole={profile?.peran || "penyewa"}
        currentUserId={profile?.id || ""}
        activeContractUnit={activeContractUnit}
      />
    </div>
  );
}
