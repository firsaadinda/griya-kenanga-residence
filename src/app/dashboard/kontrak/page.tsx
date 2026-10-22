import React, { Suspense } from "react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { KontrakClientView, KontrakItem, UnitOption, PenyewaOption } from "./KontrakClientView";

export default async function KontrakPage() {
  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/kontrak");

  const supabase = await createClient();

  // Eksekusi paralel 3 kueri: kontrak, unit, penyewa
  const [kontrakResult, unitsResult, penyewaResult] = await Promise.all([
    // 1. Ambil daftar kontrak dengan relasi unit dan penyewa
    supabase
      .from("kontrak")
      .select(`
        id,
        nomor,
        status,
        tanggal_mulai,
        durasi_bulan,
        tanggal_selesai,
        harga_sewa_bulanan,
        alasan_berakhir,
        tanggal_berakhir_aktual,
        unit:unit_id (
          id,
          kode,
          lantai,
          tipe
        ),
        penyewa:penyewa_id (
          id,
          nama_lengkap,
          email
        ),
        tagihan (
          id,
          status
        )
      `)
      .order("nomor", { ascending: false }),

    // 2. Ambil daftar unit untuk opsi pembuatan kontrak baru
    supabase
      .from("unit")
      .select("id, kode, harga_sewa_bulanan, status")
      .order("kode", { ascending: true }),

    // 3. Ambil daftar penyewa untuk opsi pembuatan kontrak baru
    supabase
      .from("profiles")
      .select(`
        id,
        nama_lengkap,
        email,
        identitas_penyewa:identitas_penyewa!penyewa_id (
          status_verifikasi
        )
      `)
      .eq("peran", "penyewa")
      .order("nama_lengkap", { ascending: true }),
  ]);

  const rawKontrak = kontrakResult.data;
  const rawUnits = unitsResult.data;
  const rawPenyewa = penyewaResult.data;

  const kontrakList: KontrakItem[] = (rawKontrak || []).map((k: any) => {
    const unpaidCount = Array.isArray(k.tagihan)
      ? k.tagihan.filter((t: any) => t.status !== "lunas").length
      : 0;

    return {
      id: k.id,
      nomor: k.nomor,
      status: k.status,
      tanggal_mulai: k.tanggal_mulai,
      durasi_bulan: k.durasi_bulan,
      tanggal_selesai: k.tanggal_selesai,
      harga_sewa_bulanan: k.harga_sewa_bulanan,
      alasan_berakhir: k.alasan_berakhir,
      tanggal_berakhir_aktual: k.tanggal_berakhir_aktual,
      unit_kode: k.unit?.kode || "-",
      lantai: k.unit?.lantai || 1,
      unit_tipe: k.unit?.tipe || "standar",
      penyewa_id: k.penyewa?.id || "",
      penyewa_nama: k.penyewa?.nama_lengkap || "-",
      penyewa_email: k.penyewa?.email || "-",
      tagihan_belum_lunas_count: unpaidCount,
    };
  });

  const availableUnits: UnitOption[] = (rawUnits || []).map((u: any) => ({
    id: u.id,
    kode: u.kode,
    harga_sewa_bulanan: u.harga_sewa_bulanan,
    status: u.status,
  }));

  const availablePenyewa: PenyewaOption[] = (rawPenyewa || []).map((p: any) => {
    const identitas = Array.isArray(p.identitas_penyewa)
      ? p.identitas_penyewa[0]
      : p.identitas_penyewa;

    return {
      id: p.id,
      nama_lengkap: p.nama_lengkap,
      email: p.email,
      status_verifikasi: identitas?.status_verifikasi || "belum",
    };
  });

  return (
    <div className="space-y-8">
      {/* HEADER DUA WARNA MONTE X TERRA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            perjanjian sewa
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E]">
            Kelola Kontrak,{" "}
            <span className="text-[#737A84] font-normal">bebas tumpang tindih</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737A84] mt-1">
            Pencegahan tumpang tindih tanggal sewa & verifikasi identitas sebelum aktivasi. Anda masuk sebagai{" "}
            <strong className="text-[#26292E] capitalize">{profile.peran}</strong>.
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

      {/* VIEW CLIENT KONTRAK */}
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#737A84]">Memuat data kontrak sewa...</div>}>
        <KontrakClientView
          initialKontrak={kontrakList}
          availableUnits={availableUnits}
          availablePenyewa={availablePenyewa}
          userRole={profile.peran}
        />
      </Suspense>
    </div>
  );
}
