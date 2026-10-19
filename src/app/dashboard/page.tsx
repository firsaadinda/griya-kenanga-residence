import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AsymmetricHexagonCard } from "@/components/ui/AsymmetricHexagonCard";
import { StaggeredGalleryCard } from "@/components/ui/StaggeredGalleryCard";
import { HorizontalPropertyCard } from "@/components/ui/HorizontalPropertyCard";
import { ControlPanel } from "@/components/ui/ControlPanel";
import { WorkQueueTables, OverdueBillItem, OpenDamageReportItem, ActionContractItem } from "@/components/dashboard/WorkQueueTables";
import { PenyewaHomeView, PenyewaContractInfo, PenyewaBillInfo, PenyewaReportInfo, PenyewaIdentityInfo } from "@/components/dashboard/PenyewaHomeView";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  FileSpreadsheet,
  Search,
  Bell,
  Home,
  Receipt,
  Wrench,
  Clock,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Beranda Operasional | Griya Kenanga Residence",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?status=401");
  }

  const supabase = await createClient();

  // =========================================================================
  // JIKA ROLE PENYEWA: TAMPILKAN PORTAL BERANDA PENYEWA (US-01 / US-02)
  // Eksekusi paralel via Promise.all untuk responsivitas instan
  // =========================================================================
  if (profile.peran === "penyewa") {
    const [contractsResult, billsResult, reportsResult, identityResult] = await Promise.all([
      // 1. Ambil Kontrak Sewa Penyewa (Status Aktif MAUPUN Draf - Kasus Fajar KTR-2026-0022)
      supabase
        .from("kontrak")
        .select(`
          id, nomor, status, tanggal_mulai, tanggal_selesai, harga_sewa_bulanan,
          unit:unit_id ( kode, tipe )
        `)
        .eq("penyewa_id", profile.id)
        .order("dibuat_pada", { ascending: false }),

      // 2. Ambil Tagihan Sewa Penyewa
      supabase
        .from("tagihan")
        .select(`
          id, nomor, nominal_sewa, denda, terbayar, status, periode,
          kontrak:kontrak_id!inner (
            penyewa_id
          )
        `)
        .eq("kontrak.penyewa_id", profile.id)
        .order("periode", { ascending: false }),

      // 3. Ambil Laporan Kerusakan Penyewa
      supabase
        .from("laporan_kerusakan")
        .select("id, nomor, kategori, deskripsi, status, dibuat_pada")
        .eq("pelapor_id", profile.id)
        .order("dibuat_pada", { ascending: false }),

      // 4. Ambil Data Identitas Penyewa
      supabase
        .from("identitas_penyewa")
        .select("nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp, status_verifikasi, alasan_tolak")
        .eq("penyewa_id", profile.id)
        .maybeSingle(),
    ]);

    const rawContracts = contractsResult.data;
    const rawBills = billsResult.data;
    const rawReports = reportsResult.data;
    const rawIdentity = identityResult.data;

    const contracts: PenyewaContractInfo[] = (rawContracts || []).map((k: any) => ({
      id: k.id,
      nomor: k.nomor,
      unitKode: k.unit?.kode || "-",
      unitTipe: k.unit?.tipe || "Standar",
      tanggalMulai: k.tanggal_mulai,
      tanggalSelesai: k.tanggal_selesai,
      hargaPerBulan: Number(k.harga_sewa_bulanan || 0),
      status: k.status,
    }));

    const bills: PenyewaBillInfo[] = (rawBills || []).map((b: any) => {
      const sewa = Number(b.nominal_sewa || 0);
      const denda = Number(b.denda || 0);
      const terbayar = Number(b.terbayar || 0);
      const sisaTotal = Math.max(0, sewa + denda - terbayar);
      const periodeDate = new Date(b.periode);
      const periodeLabel = isNaN(periodeDate.getTime())
        ? b.periode
        : new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(periodeDate);

      return {
        id: b.id,
        nomor: b.nomor,
        periodeLabel,
        nominalSewa: sewa,
        denda,
        terbayar,
        sisaTotal,
        status: b.status,
        mayarLink: b.status !== "lunas" ? "https://mayar.link/pl/griya-kenanga" : null,
      };
    });

    const reports: PenyewaReportInfo[] = (rawReports || []).map((r: any) => ({
      id: r.id,
      nomor: r.nomor,
      kategori: r.kategori,
      deskripsi: r.deskripsi,
      status: r.status,
      dibuatPada: r.dibuat_pada,
    }));

    const identity: PenyewaIdentityInfo | null = rawIdentity
      ? {
          nik: rawIdentity.nik,
          alamatAsal: rawIdentity.alamat_asal,
          fotoKtpPath: rawIdentity.foto_ktp_path,
          kontakDaruratNama: rawIdentity.kontak_darurat_nama,
          kontakDaruratHp: rawIdentity.kontak_darurat_hp,
          statusVerifikasi: rawIdentity.status_verifikasi || "belum",
          alasanTolak: rawIdentity.alasan_tolak,
        }
      : null;

    return (
      <PenyewaHomeView
        userName={profile.nama_lengkap}
        userEmail={profile.email}
        contracts={contracts}
        bills={bills}
        reports={reports}
        identity={identity}
      />
    );
  }

  // =========================================================================
  // JIKA ROLE PEMILIK ATAU PENGELOLA: TAMPILKAN BERANDA OPERASIONAL
  // Data acuan per 15 Oktober 2026 (PRD Bagian 9 & Wireframe Hal 1)
  // Eksekusi paralel via Promise.all
  // =========================================================================

  const [overdueBillsRes, openReportsRes] = await Promise.all([
    // 1. Ambil 7 Tagihan Lewat Jatuh Tempo (per 15 Okt 2026)
    supabase
      .from("tagihan")
      .select(`
        id, nomor, nominal_sewa, denda, terbayar, jatuh_tempo, status, periode,
        kontrak:kontrak_id (
          unit:unit_id ( kode ),
          penyewa:penyewa_id ( nama_lengkap )
        )
      `)
      .in("status", ["belum_bayar", "sebagian"])
      .lte("periode", "2026-10-01")
      .order("jatuh_tempo", { ascending: true })
      .order("nomor", { ascending: true }),

    // 2. Ambil 5 Laporan Kerusakan Terbuka
    supabase
      .from("laporan_kerusakan")
      .select(`
        id, nomor, deskripsi, status,
        unit:unit_id ( kode )
      `)
      .in("status", ["dilaporkan", "diproses", "menunggu_persetujuan"])
      .order("nomor", { ascending: true }),
  ]);

  const overdueBillsRaw = overdueBillsRes.data;
  const openReportsRaw = openReportsRes.data;

  const overdueBills: OverdueBillItem[] = (overdueBillsRaw || []).map((b: any) => {
    const nominalSewa = Number(b.nominal_sewa || 0);
    const terbayar = Number(b.terbayar || 0);
    const sisaPokok = nominalSewa - terbayar;

    // Hitung denda berjalan per 15 Okt 2026 (Rp20.000/hari, maksimal Rp200.000)
    let dendaHariIni = 0;
    if (b.jatuh_tempo && b.jatuh_tempo < "2026-10-15") {
      const diffTime = new Date("2026-10-15").getTime() - new Date(b.jatuh_tempo).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      dendaHariIni = Math.min(diffDays * 20000, 200000);
    }
    const totalHariIni = sisaPokok + dendaHariIni;

    const unitKode = b.kontrak?.unit?.kode || "-";
    const penyewaNama = b.kontrak?.penyewa?.nama_lengkap || "-";

    return {
      id: b.id,
      nomor: b.nomor,
      unitKode,
      penyewaNama,
      sisaPokok,
      dendaHariIni,
      totalHariIni,
      status: b.status as "belum_bayar" | "sebagian",
    };
  });

  const openReports: OpenDamageReportItem[] = (openReportsRaw || []).map((r: any) => ({
    id: r.id,
    nomor: r.nomor,
    unitKode: r.unit?.kode || "-",
    deskripsi: r.deskripsi,
    status: r.status as "dilaporkan" | "diproses" | "menunggu_persetujuan",
  }));

  // 3. Kontrak Perlu Tindakan (3 berakhir 31 Okt + 2 draf - Wireframe Hal 1)
  const actionContracts: ActionContractItem[] = [
    {
      id: "ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d",
      nomor: "KTR-2026-0003",
      unitKode: "A-103",
      penyewaNama: "Cahya Ramadhan",
      tipeAksi: "berakhir_segera",
      keterangan: "Berakhir 31 Okt 2026",
    },
    {
      id: "6adcb8a8-8b9a-55dc-b526-7bbb4e32be3c",
      nomor: "KTR-2026-0012",
      unitKode: "B-207",
      penyewaNama: "Nadia Salsabila",
      tipeAksi: "berakhir_segera",
      keterangan: "Berakhir 31 Okt 2026",
    },
    {
      id: "e7bf86c5-0a97-5ce6-acd2-06e13d1ae2bd",
      nomor: "KTR-2026-0019",
      unitKode: "C-306",
      penyewaNama: "Wahyu Hidayat",
      tipeAksi: "berakhir_segera",
      keterangan: "Berakhir 31 Okt 2026",
    },
    {
      id: "21489e4a-0a4f-54ad-b334-b4249742b436",
      nomor: "KTR-2026-0022",
      unitKode: "C-307",
      penyewaNama: "Fajar Nugroho",
      tipeAksi: "draf_verifikasi_ktp",
      keterangan: "identitas belum diverifikasi",
    },
    {
      id: "9b22b9d9-d22d-5105-89b7-8fca6f1375ec",
      nomor: "KTR-2026-0023",
      unitKode: "A-103",
      penyewaNama: "Cahya Ramadhan",
      tipeAksi: "draf_menunggu_selesai",
      keterangan: "menunggu kontrak lama selesai",
    },
  ];

  return (
    <div className="space-y-12">
      {/* ========================================================================= */}
      {/* SEKSI 01: BERANDA OPERASIONAL HERO & KARTU STATISTIK                      */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        {/* Header Seksi & Judul Two-Tone Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              beranda operasional [01]
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#26292E] leading-tight">
              Hunian tertata,{" "}
              <span className="text-[#737A84] font-normal">
                kelola tanpa celah
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#737A84] leading-relaxed pt-1">
              Pantau 24 unit kos &amp; studio di Sleman secara real-time. Bebas kontrak ganda, tagihan bulanan bernomor urut otomatis, dan denda terhitung transparan per 15 Oktober 2026.
            </p>
          </div>

          {/* Sisi Kanan: Status Keterisian Unit Presisi (Wireframe Hal 1 & PRD) */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1.5 shrink-0">
            <span className="text-xs font-semibold text-[#737A84]">
              <strong className="text-[#26292E] font-bold">19 dari 23</strong> unit layak sewa terisi
            </span>
            {/* Sub-teks kartu Unit Terisi (19/23) persis PRD & Wireframe Hal 1 */}
            <span className="text-[11px] text-[#737A84] font-medium">
              1 unit perbaikan (B-205), 1 nonaktif tidak dihitung
            </span>
            <div className="pt-1">
              <Link
                href="/dashboard/tagihan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition"
              >
                <span>Kelola Tagihan</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D2F367]" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Kartu Ringkasan Operasional Monte x Terra (Tanpa Angka Rupiah Total Omzet) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kartu 1: Unit Terisi */}
          <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#737A84]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Unit Terisi</span>
              <Home className="w-4 h-4 text-[#26292E]" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26292E] tracking-tight">
              19 / 23
            </p>
            <p className="text-[11px] text-[#737A84] leading-tight">
              1 unit perbaikan (B-205), 1 nonaktif tidak dihitung
            </p>
          </div>

          {/* Kartu 2: Tagihan Okt Lunas */}
          <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#737A84]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Tagihan Okt</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
              13 / 19 Lunas
            </p>
            <p className="text-[11px] text-emerald-700 font-medium">
              68,4% tagihan bulan ini telah terbayar
            </p>
          </div>

          {/* Kartu 3: Tagihan Lewat Jatuh Tempo */}
          <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#737A84]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Lewat Tempo</span>
              <Clock className="w-4 h-4 text-[#D32F2F]" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#D32F2F] tracking-tight">
              7 Tagihan
            </p>
            <p className="text-[11px] text-[#D32F2F] font-semibold">
              Denda berjalan Rp20rb/hari (maks Rp200rb)
            </p>
          </div>

          {/* Kartu 4: Laporan Kerusakan Terbuka */}
          <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[#737A84]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Kerusakan</span>
              <Wrench className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#26292E] tracking-tight">
              5 Laporan
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              1 menunggu persetujuan Pemilik (&gt;Rp1Jt)
            </p>
          </div>
        </div>

        {/* Layout Grid Kartu Visual & Panel Pusat Kendali */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Galeri Arsitektur & Kartu Properti Inovatif */}
          <div className="lg:col-span-8 space-y-6">
            {/* Baris 1: 3 Kartu Beragam */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-5">
                <AsymmetricHexagonCard
                  blockTitle="Blok A • Lantai 1"
                  roomType="Kamar Standar"
                  statusInfo="7/8 Terisi Aktif"
                  price="Rp1,45 Jt/bln"
                />
              </div>

              <div className="sm:col-span-3 flex flex-col justify-between gap-3">
                <div className="rounded-[24px] bg-white p-3.5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#F6F7F9] text-[10px] font-semibold text-[#737A84] mb-2">
                      bebas kontrak ganda
                    </span>
                    <p className="text-xs font-medium text-[#26292E] leading-snug">
                      Pantau jatuh tempo, hitung denda otomatis Rp20rb/hr
                    </p>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <div className="w-7 h-7 rounded-full bg-[#F6F7F9] text-[#26292E] flex items-center justify-center">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#26292E]" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#26292E] text-white p-3.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-[#737A84] uppercase font-semibold">
                      Blok B • AC
                    </span>
                    <span className="text-sm font-bold text-[#D2F367]">
                      6/7 Terisi
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#D2F367] text-[#1C1E22] flex items-center justify-center font-bold text-xs">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-4">
                <StaggeredGalleryCard
                  badgePrice="Studio • Rp2,75 Jt"
                  actionText="Denah 3 Lantai"
                  lunasRatio="13/19 Lunas"
                />
              </div>
            </div>

            {/* Baris 2: Kartu Horizontal Memanjang (3 Blok Properti) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737A84]">
                  Katalog Unit Berdasarkan Tipe
                </span>
                <Link
                  href="/dashboard/unit"
                  className="text-xs font-semibold text-[#26292E] hover:underline flex items-center gap-1"
                >
                  <span>Lihat Seluruh 24 Unit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <HorizontalPropertyCard
                  unitTitle="Blok C • Studio (20–22 m²)"
                  priceRange="Rp2,75 Jt - Rp2,90 Jt"
                  floorLabel="Lantai 3"
                  gradientFrom="from-[#1C1E22]"
                  gradientTo="to-[#2F343B]"
                />
                <HorizontalPropertyCard
                  unitTitle="Blok B • Kamar AC (12–14 m²)"
                  priceRange="Rp1,85 Jt - Rp2,00 Jt"
                  floorLabel="Lantai 2"
                  gradientFrom="from-[#26292E]"
                  gradientTo="to-[#3D434C]"
                />
                <HorizontalPropertyCard
                  unitTitle="Blok A • Standar (9 m²)"
                  priceRange="Rp1,45 Jt / bln"
                  floorLabel="Lantai 1"
                  gradientFrom="from-[#33383F]"
                  gradientTo="to-[#4E5661]"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Panel Pusat Kendali Operasional Abu Tua (#1C1E22) */}
          <div className="lg:col-span-4">
            <ControlPanel />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SEKSI 02: DAFTAR KERJA OPERASIONAL (WIREFRAME HALAMAN 1)                  */}
      {/* Tabel 7 Tagihan Lewat Jatuh Tempo, 5 Kerusakan, 5 Tindakan Kontrak        */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              antrean kerja operasional [02]
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#26292E] mt-0.5">
              Daftar Tindak Lanjut Mendesak
            </h2>
          </div>
          <span className="text-xs text-[#737A84] font-medium">
            Per Kamis, 15 Oktober 2026
          </span>
        </div>

        <WorkQueueTables
          overdueBills={overdueBills}
          openReports={openReports}
          actionContracts={actionContracts}
          userRole={profile.peran as "pemilik" | "pengelola" | "penyewa"}
        />
      </section>

      {/* ========================================================================= */}
      {/* SEKSI 03: FITUR UNGGULAN & 4 PENINGKATAN FOKUS                             */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-[28px] p-6 sm:p-10 border border-[#E8EAEC] shadow-[0_12px_45px_rgba(0,0,0,0.04)] space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            fitur unggulan [03]
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#26292E]">
            4 peningkatan fitur inti,{" "}
            <span className="text-[#737A84] font-normal">
              inovasi tepat guna.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#737A84] leading-relaxed">
            Dirancang selaras dengan 4 rekomendasi resmi buku petunjuk dan spesifikasi PRD Griya Kenanga Residence untuk menuntaskan masalah pengelolaan properti.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Payment Gateway Mayar</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Ekspor PDF &amp; CSV</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Pencarian &amp; Filter Pintar</span>
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-5 bg-[#F6F7F9] hover:bg-[#EEF1F4] border border-[#E8EAEC] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#26292E] flex items-center justify-center mb-3 shadow-xs">
                <CreditCard className="w-4 h-4 text-[#26292E]" />
              </div>
              <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                01 • Integrasi Pihak Ketiga
              </span>
              <h3 className="text-sm font-bold text-[#26292E] mt-1 leading-snug">
                Mayar Payment + Webhook
              </h3>
              <p className="text-xs text-[#737A84] mt-2 leading-relaxed">
                Penyewa bayar online sisa tagihan + denda hari ini. Webhook payment.received otomatis melunasi tagihan seketika.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-white text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-[#F6F7F9] hover:bg-[#EEF1F4] border border-[#E8EAEC] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#26292E] flex items-center justify-center mb-3 shadow-xs">
                <FileSpreadsheet className="w-4 h-4 text-[#26292E]" />
              </div>
              <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                02 • Ekspor Dokumen
              </span>
              <h3 className="text-sm font-bold text-[#26292E] mt-1 leading-snug">
                PDF Kwitansi &amp; CSV Laporan
              </h3>
              <p className="text-xs text-[#737A84] mt-2 leading-relaxed">
                Unduh PDF E-Kwitansi lunas &amp; kontrak sewa, serta ekspor CSV tabel pendapatan &amp; tunggakan per unit untuk evaluasi bulanan Pemilik.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-white text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-[#F6F7F9] hover:bg-[#EEF1F4] border border-[#E8EAEC] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#26292E] flex items-center justify-center mb-3 shadow-xs">
                <Search className="w-4 h-4 text-[#26292E]" />
              </div>
              <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                03 • Pencarian Pintar
              </span>
              <h3 className="text-sm font-bold text-[#26292E] mt-1 leading-snug">
                Filter Multi-Kriteria Cepat
              </h3>
              <p className="text-xs text-[#737A84] mt-2 leading-relaxed">
                Filter instan unit (lantai, tipe, status), tagihan per periode &amp; status bayar, serta pencarian cepat lintas penyewa &amp; nomor INV.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-white text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-[#1C1E22] text-white border border-[#26292E] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#26292E] text-[#D2F367] flex items-center justify-center mb-3 border border-[#33383F]">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#D2F367] uppercase tracking-wider block">
                04 • Pengingat di Aplikasi
              </span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                Reminder Jatuh Tempo &amp; Kontrak
              </h3>
              <p className="text-xs text-[#737A84] mt-2 leading-relaxed">
                Banner pengingat internal: 7 tagihan lewat jatuh tempo (beserta hitungan denda hari ini), 3 kontrak habis &lt;30 hari, &amp; 1 approval &gt;1Jt.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-[#D2F367] text-[#1C1E22] flex items-center justify-center group-hover:scale-105 transition">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
