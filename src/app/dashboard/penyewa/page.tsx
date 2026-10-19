import React, { Suspense } from "react";
import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { PenyewaClientView, PenyewaItem } from "./PenyewaClientView";

export default async function PenyewaPage() {
  // Guard: Hanya Pemilik & Pengelola yang diizinkan (Penyewa -> 403)
  const profile = await requireRole(["pemilik", "pengelola"], "/dashboard/penyewa");

  const supabase = await createClient();

  let penyewaData: PenyewaItem[] = [];

  if (profile.peran === "pemilik") {
    // Sesuai BR-10: Pemilik membaca via view yang menyamarkan NIK (*12 digit + 4 angka terakhir)
    // dan tidak mengembalikan foto_ktp_path, alamat, atau kontak darurat
    const { data: listPemilik } = await supabase
      .from("v_identitas_penyewa_pemilik")
      .select("*")
      .order("nama_lengkap", { ascending: true });

    penyewaData = (listPemilik || []).map((row: any) => ({
      penyewa_id: row.penyewa_id,
      nama_lengkap: row.nama_lengkap,
      email: row.email,
      no_hp: row.no_hp,
      nik: row.nik_tersamar,
      alamat_asal: null,
      foto_ktp_path: null,
      kontak_darurat_nama: null,
      kontak_darurat_hp: null,
      status_verifikasi: row.status_verifikasi || "belum",
      alasan_tolak: row.alasan_tolak || null,
      diverifikasi_pada: row.diverifikasi_pada || null,
    }));
  } else {
    // Pengelola: Melihat profil penyewa lengkap beserta identitas_penyewa
    const { data: listPengelola } = await supabase
      .from("profiles")
      .select(`
        id,
        nama_lengkap,
        email,
        no_hp,
        identitas_penyewa:identitas_penyewa!penyewa_id (
          nik,
          alamat_asal,
          foto_ktp_path,
          kontak_darurat_nama,
          kontak_darurat_hp,
          status_verifikasi,
          alasan_tolak,
          diverifikasi_pada
        )
      `)
      .eq("peran", "penyewa")
      .order("nama_lengkap", { ascending: true });

    penyewaData = (listPengelola || []).map((row: any) => {
      const identitas = Array.isArray(row.identitas_penyewa)
        ? row.identitas_penyewa[0]
        : row.identitas_penyewa;

      return {
        penyewa_id: row.id,
        nama_lengkap: row.nama_lengkap,
        email: row.email,
        no_hp: row.no_hp,
        nik: identitas?.nik || null,
        alamat_asal: identitas?.alamat_asal || null,
        foto_ktp_path: identitas?.foto_ktp_path || null,
        kontak_darurat_nama: identitas?.kontak_darurat_nama || null,
        kontak_darurat_hp: identitas?.kontak_darurat_hp || null,
        status_verifikasi: identitas?.status_verifikasi || "belum",
        alasan_tolak: identitas?.alasan_tolak || null,
        diverifikasi_pada: identitas?.diverifikasi_pada || null,
      };
    });
  }

  return (
    <div className="space-y-8">
      {/* HEADER DUA WARNA MONTE X TERRA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            direktori penghuni [03]
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E]">
            Kelola Data Penyewa,{" "}
            <span className="text-[#737A84] font-normal">identitas & verifikasi</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737A84] mt-1">
            Data 22 penyewa terdaftar. Mode:{" "}
            <strong className="text-[#26292E] capitalize">
              {profile.peran === "pemilik" ? "Penyamaran NIK (Pemilik - BR-10)" : "Akses Penuh (Pengelola)"}
            </strong>
            .
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

      {/* CLIENT VIEW PENYEWA */}
      <Suspense fallback={<div className="p-12 text-center text-xs text-[#737A84]">Memuat direktori data penyewa...</div>}>
        <PenyewaClientView initialPenyewa={penyewaData} userRole={profile.peran} />
      </Suspense>
    </div>
  );
}
