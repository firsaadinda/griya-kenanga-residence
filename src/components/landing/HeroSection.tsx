"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight, Star, UserPlus, LogIn, Maximize2 } from "lucide-react";

export interface HeroPhoto {
  id: number;
  src: string;
  title: string;
  floor: string;
  unitTypeId: "standar" | "ac" | "studio";
  caption: string;
}

export const HERO_PHOTOS: HeroPhoto[] = [
  {
    id: 1,
    src: "/images/hero/hero-1.jpg",
    title: "Suite Wide Angle",
    floor: "Lantai 3",
    unitTypeId: "studio",
    caption: "Kamar Studio luas dengan integrasi ruang istirahat, foyer, dan pencahayaan alami optimal.",
  },
  {
    id: 2,
    src: "/images/hero/hero-2.jpg",
    title: "Tempat Tidur Queen & Ambient Light",
    floor: "Lantai 2",
    unitTypeId: "ac",
    caption: "Kamar Tipe AC dengan tempat tidur Queen single, headboard empuk, dan lampu gantung hangat.",
  },
  {
    id: 3,
    src: "/images/hero/hero-3.jpg",
    title: "Living Room Cozy & Sofa",
    floor: "Lantai 3",
    unitTypeId: "studio",
    caption: "Area santai Tipe Studio dilengkapi coffee table kayu solid dan akses langsung balkon.",
  },
  {
    id: 4,
    src: "/images/hero/hero-4.jpg",
    title: "Pojok Kerja & Workstation",
    floor: "Lantai 3",
    unitTypeId: "studio",
    caption: "Meja kerja luas dengan kursi ergonomis premium, stopkontak terorganisir, dan pemandangan luar.",
  },
  {
    id: 5,
    src: "/images/hero/hero-5.jpg",
    title: "Pintu Masuk & AC Dingin",
    floor: "Lantai 2",
    unitTypeId: "ac",
    caption: "Kerapian koridor Tipe AC dengan sirkulasi udara bersih dan pendingin ruangan modern.",
  },
  {
    id: 6,
    src: "/images/hero/hero-6.jpg",
    title: "Ventilasi Jendela Lebar",
    floor: "Lantai 2",
    unitTypeId: "ac",
    caption: "Jendela kaca tinggi menghadap pepohonan asri Sleman dengan tirai blackout ganda.",
  },
];

interface HeroSectionProps {
  onScrollToUnits: () => void;
  onSelectUnitType?: (typeId: "standar" | "ac" | "studio") => void;
}

export function HeroSection({
  onScrollToUnits,
  onSelectUnitType,
}: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activePhoto = HERO_PHOTOS[activeIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? HERO_PHOTOS.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev === HERO_PHOTOS.length - 1 ? 0 : prev + 1));
  };

  // Navigasi langsung ke Tipe Kamar & Lantai yang diklik pengguna
  const handleGoToUnit = (photo: HeroPhoto) => {
    const typeId = photo.unitTypeId || (photo.floor.includes("3") ? "studio" : photo.floor.includes("2") ? "ac" : "standar");
    if (onSelectUnitType) {
      onSelectUnitType(typeId);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("griya-select-unit", { detail: { typeId } }));
    }
    onScrollToUnits();
  };

  return (
    <section className="relative w-full bg-white text-[#1C1E22] px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 overflow-hidden">
      {/* Internal Navigation Bar */}
      <div className="flex items-center justify-between pb-6 sm:pb-8 border-b border-[#F0F2F4]">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo-griya-kenanga.png"
            alt="Logo Griya Kenanga Residence"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1E2024] leading-tight">
              GRIYA KENANGA
            </span>
            <span className="text-[10px] tracking-widest uppercase font-bold text-[#76A733] -mt-0.5">
              RESIDENCE • SLEMAN
            </span>
          </div>
        </Link>

        {/* Tombol Masuk Sistem dan Buat Akun */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1E2024] bg-[#F4F5F7] hover:bg-[#E3E6EB] border border-[#E3E6EB] transition"
          >
            <LogIn className="w-3.5 h-3.5 text-[#737A84]" />
            <span>Masuk Sistem</span>
          </Link>

          <Link
            href="/register"
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-[#424242] hover:bg-[#76A733] transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#D4C4B1]" />
            <span>Buat Akun</span>
          </Link>

          {/* Tombol Fullscreen Layar Penuh (Lampiran 2) */}
          <button
            type="button"
            onClick={() => {
              if (typeof document !== "undefined") {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }
            }}
            aria-label="Mode Layar Penuh"
            title="Layar Penuh (Fullscreen)"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F4F5F6] transition border border-[#E8EAEC] text-[#1C1E22] hover:text-[#76A733] cursor-pointer shadow-2xs"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN SPLIT GRID: 1 GAMBAR BESAR DI SEBELAH KIRI, TULISAN DI SEBELAH KANAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-6 sm:pt-8">
        
        {/* ========================================================================= */}
        {/* KOLOM KIRI: 1 GAMBAR ELEGAN BESAR (BISA DIGESER)                           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 relative flex flex-col">
          <div className="relative w-full h-full min-h-[460px] sm:min-h-[540px] lg:min-h-[580px] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-[#E5E7EB] shadow-[0_16px_50px_rgba(0,0,0,0.12)] border border-[#E8EAEC] group">
            {/* Foto Hero Aktif */}
            <img
              key={activePhoto.src}
              src={activePhoto.src}
              alt={activePhoto.title}
              className="w-full h-full object-cover transition-all duration-700 ease-out cursor-pointer group-hover:scale-102"
              onClick={() => handleGoToUnit(activePhoto)}
              title={`Klik untuk eksplorasi kamar ${activePhoto.floor}`}
            />

            {/* Ambient Gradient Overlay */}
            <div
              onClick={() => handleGoToUnit(activePhoto)}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 cursor-pointer"
            />

            {/* Tombol Geser Atas Kiri: [ ← ] [ → ] + Counter */}
            <div className="absolute top-5 left-5 sm:top-6 sm:left-6 flex items-center gap-2 z-10">
              <div className="flex items-center rounded-full border border-white/30 p-1 bg-black/45 backdrop-blur-md text-white shadow-md">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Foto sebelumnya"
                  title="Foto sebelumnya"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3.5 bg-white/30 mx-0.5" />
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Foto berikutnya"
                  title="Foto berikutnya"
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/20 shadow-xs">
                0{activeIndex + 1} | 0{HERO_PHOTOS.length}
              </span>
            </div>

            {/* Badge Interaktif Atas Kanan: Info Tipe Kamar & Lantai */}
            <button
              type="button"
              onClick={() => handleGoToUnit(activePhoto)}
              title={`Buka Eksplorasi Kamar ${activePhoto.floor}`}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 text-right p-3 rounded-2xl bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/25 transition-all duration-200 active:scale-95 cursor-pointer shadow-lg z-10"
            >
              <div className="flex items-center justify-end gap-1.5 text-white/95">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight font-sans drop-shadow-md">
                  {activePhoto.unitTypeId === "studio" ? "Tipe Studio" : activePhoto.unitTypeId === "ac" ? "Tipe AC" : "Tipe Standar"}
                </span>
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-md text-[#D4C4B1]" />
              </div>
              <span className="text-[10px] sm:text-xs text-white/90 font-bold tracking-widest uppercase block mt-0.5">
                {activePhoto.floor} • LIHAT SPESIFIKASI →
              </span>
            </button>

            {/* Bottom Left Big Numeral & Caption */}
            <div
              onClick={() => handleGoToUnit(activePhoto)}
              className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 max-w-sm cursor-pointer select-none z-10"
            >
              <span className="text-5xl sm:text-6xl font-light text-white/90 font-mono tracking-tighter block mb-1 drop-shadow-lg">
                0{activeIndex + 1}
              </span>
              <p className="text-sm sm:text-base font-bold text-white drop-shadow-md flex items-center gap-2">
                <span>{activePhoto.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-xs font-normal">
                  {activePhoto.floor}
                </span>
              </p>
              <p className="text-xs text-white/85 leading-relaxed line-clamp-2 drop-shadow-xs font-normal mt-0.5">
                {activePhoto.caption}
              </p>
            </div>

            {/* Floor Badge on Bottom Right: Klik Menuju Unit */}
            <button
              type="button"
              onClick={() => handleGoToUnit(activePhoto)}
              title={`Buka Eksplorasi Kamar ${activePhoto.floor}`}
              className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 cursor-pointer active:scale-95 transition-transform z-10"
            >
              <span className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white backdrop-blur-md text-[11px] font-bold text-[#1E3A2B] uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-white/40">
                <span>{activePhoto.floor}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#5E8826]" />
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KOLOM KANAN: TULISAN EDITORIAL, HEADLINE, CTAS, PENILAIAN, DAN THUMBNAILS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between space-y-6 sm:space-y-8">
          <div className="space-y-5">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-[38px] xl:text-[44px] font-extrabold text-[#476E2E] leading-[1.18] tracking-[-0.03em]">
              Hunian Kos dan Studio Eksklusif Kabupaten Sleman Standar Arsitektur Modern dan Fungsional{" "}
              <button
                type="button"
                onClick={onScrollToUnits}
                title="Menuju Eksplorasi Kamar"
                className="inline-flex items-center justify-center align-middle ml-1 -mt-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4A6C2F] hover:bg-[#5E8826] text-white shadow-sm transition-colors cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-xs sm:text-sm text-[#4E6149] max-w-xl leading-relaxed font-normal">
              Griya Kenanga Residence hadir sebagai tempat tinggal modern yang memadukan kenyamanan ruang dan fasilitas lengkap untuk mendukung aktivitas harianmu. Setiap unit dirancang dengan detail arsitektur untuk memberikan kenyamanan istirahat yang maksimal. Nikmati pengalaman sewa hunian yang transparan dan strategis di Sleman.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onScrollToUnits}
                className="px-6 sm:px-7 py-3 rounded-full bg-[#1C1E22] hover:bg-[#76A733] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              >
                Eksplorasi Kamar
              </button>

              <button
                type="button"
                onClick={onScrollToUnits}
                className="px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-[#F6F7F9] text-[#1C1E22] text-xs sm:text-sm font-semibold border border-[#D1D5DB] transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Lihat Fasilitas
              </button>
            </div>
          </div>

          {/* Social Proof & Rating Block (Bahasa Indonesia & Angka Realistis 24 Unit) */}
          <div className="pt-4 pb-2 border-t border-[#F0F2F4] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
              {/* Left rating item */}
              <div className="space-y-1 sm:border-r border-[#E3E6EB] sm:pr-4">
                <div className="flex items-center gap-1 text-[#BDA58B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-[#BDA58B] text-[#BDA58B]"
                    />
                  ))}
                </div>
                <p className="text-xs text-[#1E2024] font-medium pt-0.5">
                  <strong className="font-bold">(4.9)</strong> Penilaian{" "}
                  <span className="text-[#70757D] block sm:inline">(22 Ulasan Penghuni)</span>
                </p>
              </div>

              {/* Right avatar stack: Anisa Rahmawati (Kerudung Merah), Bayu, Ratna, Sinta, Dimas */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  <img
                    src="/profiles/w_5_white.jpg"
                    alt="Anisa Rahmawati (Kerudung Merah)"
                    title="Anisa Rahmawati"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-[#BDA58B]/50"
                  />
                  <img
                    src="/profiles/bayu_white.jpg"
                    alt="Bayu Pratama"
                    title="Bayu Pratama"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-[#BDA58B]/50"
                  />
                  <img
                    src="/profiles/ratna_white.jpg"
                    alt="Ratna Dewi"
                    title="Ratna Dewi"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-[#BDA58B]/50"
                  />
                  <img
                    src="/profiles/sinta_white.jpg"
                    alt="Sinta Maharani"
                    title="Sinta Maharani"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-[#BDA58B]/50"
                  />
                  <img
                    src="/profiles/m_1_white.jpg"
                    alt="Dimas Wicaksono"
                    title="Dimas Wicaksono"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover ring-1 ring-[#BDA58B]/50"
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-[#70757D] leading-snug">
                  <strong className="text-[#1E2024] font-semibold">22 Penghuni</strong> aktif dari 24 unit
                </p>
              </div>
            </div>

            {/* Quick 6-photo Thumbnail selector strip */}
            <div className="pt-2 border-t border-[#F0F2F4]/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#70757D] uppercase tracking-wider block">
                  Pilih Sudut Pandang Foto (6 Pilihan):
                </span>
                <span className="text-[10px] font-semibold text-[#5E8826]">
                  {activeIndex + 1} dari 6 Foto
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {HERO_PHOTOS.map((photo, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      title={`${photo.title} (${photo.floor})`}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#76A733] ring-2 ring-[#76A733]/50 scale-105 shadow-md"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
