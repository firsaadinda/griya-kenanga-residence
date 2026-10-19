import React, { Suspense } from "react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { UnitClientView, UnitItem } from "./UnitClientView";

export default async function UnitPage() {
  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/unit");

  const supabase = await createClient();

  // Ambil data 24 unit lengkap beserta penyewa aktif saat ini
  const { data: unitsRaw, error } = await supabase
    .from("unit")
    .select(`
      id,
      kode,
      lantai,
      tipe,
      luas_m2,
      harga_sewa_bulanan,
      status,
      keterangan,
      kontrak (
        id,
        nomor,
        status,
        profiles:penyewa_id (
          nama_lengkap,
          email
        )
      )
    `)
    .order("kode", { ascending: true });

  const units: UnitItem[] = (unitsRaw || []).map((u: any) => {
    // Cari kontrak berstatus aktif
    const activeContract = Array.isArray(u.kontrak)
      ? u.kontrak.find((k: any) => k.status === "aktif")
      : null;

    return {
      id: u.id,
      kode: u.kode,
      lantai: u.lantai,
      tipe: u.tipe,
      luas_m2: Number(u.luas_m2),
      harga_sewa_bulanan: u.harga_sewa_bulanan,
      status: u.status,
      keterangan: u.keterangan,
      kontrak_id: activeContract ? activeContract.id : null,
      kontrak_nomor: activeContract ? activeContract.nomor : null,
      penyewa_nama: activeContract?.profiles?.nama_lengkap || null,
      penyewa_email: activeContract?.profiles?.email || null,
    };
  });

  return (
    <div className="space-y-8">
      {/* HEADER EDITORIAL DUA WARNA MONTE X TERRA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            katalog unit [02]
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E]">
            Kelola 24 Unit,{" "}
            <span className="text-[#737A84] font-normal">kos & studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737A84] mt-1">
            Daftar 24 unit properti di 3 lantai: Blok A Standar, Blok B AC, dan Blok C Studio. Anda masuk sebagai{" "}
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

      {/* VIEW CLIENT INTERAKTIF */}
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#737A84]">Memuat direktori unit hunian...</div>}>
        <UnitClientView initialUnits={units} userRole={profile.peran} />
      </Suspense>
    </div>
  );
}
