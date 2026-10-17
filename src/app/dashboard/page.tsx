import React from "react";
import Link from "next/link";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { AsymmetricHexagonCard } from "@/components/ui/AsymmetricHexagonCard";
import { StaggeredGalleryCard } from "@/components/ui/StaggeredGalleryCard";
import { HorizontalPropertyCard } from "@/components/ui/HorizontalPropertyCard";
import { ControlPanel } from "@/components/ui/ControlPanel";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  FileSpreadsheet,
  Search,
  Bell,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";

export default async function DashboardPage() {

  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-12">
      {/* SEKSI 01: BERANDA OPERASIONAL */}
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
              Pantau 24 unit kos & studio di Sleman secara real-time. Bebas kontrak ganda, tagihan bulanan bernomor urut otomatis, dan denda terhitung transparan.
            </p>
          </div>

          {/* Sisi Kanan: Status Keterisian Unit & Tombol Aksi */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#737A84]">
              <strong className="text-[#26292E] font-bold">19 dari 23</strong> unit layak sewa terisi
            </span>
            {(profile?.peran === "pemilik" || profile?.peran === "pengelola") && (
              <Link
                href="/dashboard/tagihan"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition"
              >
                <span>Buat Tagihan Okt</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D2F367]" />
              </Link>
            )}
          </div>
        </div>

        {/* Layout Grid Kartu Visual & Panel Pusat Kendali */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Galeri Arsitektur & Kartu Properti Inovatif */}
          <div className="lg:col-span-8 space-y-6">
            {/* Baris 1: 3 Kartu Beragam (Hexagon Asimetris, Info Tengah, dan Galeri Avatar) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Kartu 1: Asymmetric Hexagon Card dengan Lekukan Diagonal Notch */}
              <div className="sm:col-span-5">
                <AsymmetricHexagonCard
                  blockTitle="Blok A • Lantai 1"
                  roomType="Kamar Standar"
                  statusInfo="7/8 Terisi Aktif"
                  price="Rp1,45 Jt/bln"
                />
              </div>

              {/* Kartu 2: Info Tengah & Status Kontrak Bebas Ganda */}
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

              {/* Kartu 3: Galeri Bertingkat (Studio Card + Avatar Stack) */}
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

      {/* SEKSI 02: FITUR UNGGULAN & 4 PENINGKATAN FOKUS */}
      <section className="bg-white rounded-[28px] p-6 sm:p-10 border border-[#E8EAEC] shadow-[0_12px_45px_rgba(0,0,0,0.04)] space-y-8">
        {/* Header Seksi Two-Tone */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
            fitur unggulan [02]
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

          {/* Badges Sorotan Fitur */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Payment Gateway Mayar</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Ekspor PDF & CSV</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC]">
              <Check className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Pencarian & Filter Pintar</span>
            </span>
          </div>
        </div>

        {/* Grid 4 Kartu Peningkatan Fitur */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fitur 1 */}
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

          {/* Fitur 2 */}
          <div className="rounded-2xl p-5 bg-[#F6F7F9] hover:bg-[#EEF1F4] border border-[#E8EAEC] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-white text-[#26292E] flex items-center justify-center mb-3 shadow-xs">
                <FileSpreadsheet className="w-4 h-4 text-[#26292E]" />
              </div>
              <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                02 • Ekspor Dokumen
              </span>
              <h3 className="text-sm font-bold text-[#26292E] mt-1 leading-snug">
                PDF Kwitansi & CSV Laporan
              </h3>
              <p className="text-xs text-[#737A84] mt-2 leading-relaxed">
                Unduh PDF E-Kwitansi lunas & kontrak sewa, serta ekspor CSV tabel pendapatan & tunggakan per unit untuk evaluasi bulanan Pemilik.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-white text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Fitur 3 */}
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
                Filter instan unit (lantai, tipe, status), tagihan per periode & status bayar, serta pencarian cepat lintas penyewa & nomor INV.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <div className="w-7 h-7 rounded-full bg-white text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Fitur 4 (Aksen Gelap / Hijau Muda) */}
          <div className="rounded-2xl p-5 bg-[#1C1E22] text-white border border-[#26292E] flex flex-col justify-between space-y-3 transition group">
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#26292E] text-[#D2F367] flex items-center justify-center mb-3 border border-[#33383F]">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#D2F367] uppercase tracking-wider block">
                04 • Pengingat di Aplikasi
              </span>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                Reminder Jatuh Tempo & Kontrak
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
