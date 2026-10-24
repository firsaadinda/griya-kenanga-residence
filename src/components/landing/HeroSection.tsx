"use client";

import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

interface HeroSectionProps {
  onScrollToUnits?: () => void;
  onSelectUnitType?: (typeId: "standar" | "ac" | "studio") => void;
}

export function HeroSection({
  onScrollToUnits,
  onSelectUnitType,
}: HeroSectionProps) {
  const handleScroll = (targetId: string) => {
    if (typeof document !== "undefined") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else if (onScrollToUnits) {
        onScrollToUnits();
      }
    }
  };

  const handleSelectUnit = (typeId: "standar" | "ac" | "studio") => {
    if (onSelectUnitType) {
      onSelectUnitType(typeId);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("griya-select-unit", { detail: { typeId } })
      );
    }
    handleScroll("tipe-kamar");
  };

  return (
    <section className="relative w-full p-2.5 sm:p-4 md:p-5 bg-white">
      {/* 
        Container Kartu Utama Hero:
        Full bleed image background dengan rounded corners yang elegan ala Structa / Timeless Design
      */}
      <div className="relative w-full rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden min-h-[640px] sm:min-h-[720px] lg:min-h-[820px] flex flex-col justify-between p-4 sm:p-7 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] bg-[#1A1C20]">
        
        {/* Layer 1: Background Base Foto Rumah Lengkap (Pagi Hari Cerah) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/hero-facade.jpg"
            alt="Fasad Arsitektur Griya Kenanga Residence Sleman"
            className="w-full h-full object-cover object-center transform scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
          />
          {/* Subtle dark gradient overlay untuk menghilangkan kesan mentah/AI slop dan menajamkan kontras teks & kartu */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60 pointer-events-none" />
        </div>

        {/* 
          Layer 2: Teks Raksasa "HUNIAN MODERN" (Tampil di Depan Atap Rumah, Transparansi 80%)
          Teks utuh "HUNIAN MODERN" berada di depan atap rumah (z-25) dengan transparansi 80% (text-white/80).
        */}
        <div className="absolute top-16 sm:top-20 lg:top-24 inset-x-0 z-25 flex justify-center pointer-events-none select-none px-2 sm:px-6 overflow-visible">
          <h1 
            className="font-black text-white/90 uppercase leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] text-center tracking-tight sm:tracking-tighter whitespace-nowrap"
            style={{
              fontSize: "clamp(2rem, 9.2vw, 115px)",
              letterSpacing: "-0.03em"
            }}
          >
            HUNIAN MODERN
          </h1>
        </div>

        {/* 
          Layer Foreground Vignette untuk kontras bagian bawah
        */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Ambient vignette halus dari bawah untuk keterbacaan teks langsung dan kartu tanpa perlu kotak kaku */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        </div>

        {/* ========================================================================= */}
        {/* 1. NAVBAR MENU NAVIGASI ATAS DI DALAM HERO (Kiri, Tengah 4 menu, Kanan CTA) */}
        {/* ========================================================================= */}
        <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* KIRI: Logo & Teks Brand Griya Kenanga */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group drop-shadow-md select-none"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 flex items-center justify-center shadow-md transition-transform group-hover:scale-105 border border-white/40">
              <img
                src="/logo-griya-kenanga.png"
                alt="Logo Griya Kenanga Residence"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wider text-white uppercase drop-shadow-sm leading-tight">
                GRIYA KENANGA
              </span>
              <span className="text-[10px] sm:text-[11px] tracking-widest uppercase font-bold text-[#A8D558] drop-shadow-sm">
                RESIDENCE SLEMAN
              </span>
            </div>
          </Link>

          {/* TENGAH: Menu Navigasi Horizontal 4 Anchor Links (Smooth Scroll) */}
          <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-lg text-xs font-semibold text-white/90">
            <button
              type="button"
              onClick={() => handleScroll("eksplorasi-ruang")}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              Eksplorasi Ruang
            </button>
            <button
              type="button"
              onClick={() => handleScroll("tipe-kamar")}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              Tipe Kamar
            </button>
            <button
              type="button"
              onClick={() => handleScroll("spesifikasi-3d")}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              Spesifikasi &amp; 3D
            </button>
            <button
              type="button"
              onClick={() => handleScroll("ulasan")}
              className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              Ulasan Penghuni
            </button>
          </nav>

          {/* KANAN: Tombol Masuk Sistem & Buat Akun */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              className="px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold text-[#14341B] bg-white/90 hover:bg-white border border-white/60 backdrop-blur-md transition-all shadow-sm hover:shadow"
            >
              Masuk Sistem
            </Link>
            <Link
              href="/register"
              className="px-4 sm:px-5 py-2 rounded-full text-xs font-bold text-[#1E2024] bg-white hover:bg-white/90 transition-all shadow-md active:scale-95"
            >
              Buat Akun
            </Link>
          </div>
        </header>

        {/* Spacer Transparan di Tengah Agar Layout Tetap Fleksibel */}
        <div className="relative z-20 my-auto py-8 sm:py-14" aria-hidden="true" />

        {/* ========================================================================= */}
        {/* 2. BAGIAN BAWAH HERO: DESKRIPSI KIRI BAWAH & FLOATING CARDS DI KANAN BAWAH*/}
        {/* ========================================================================= */}
        <div className="relative z-30 flex flex-col lg:flex-row items-end justify-between gap-6 sm:gap-8 pt-4">
          
          {/* SISI KIRI BAWAH: Teks Deskripsi Bersih Langsung di Atas Foto (Clean Overlay Text) */}
          <div className="w-full lg:max-w-xl pb-1 sm:pb-2">
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              Griya Kenanga Residence hadir sebagai tempat tinggal modern yang memadukan kenyamanan ruang dan fasilitas lengkap untuk mendukung aktivitas harianmu. Setiap unit dirancang dengan detail arsitektur untuk memberikan kenyamanan istirahat yang maksimal. Nikmati pengalaman sewa hunian yang transparan dan strategis di Sleman.
            </p>
          </div>

          {/* SISI KANAN BAWAH: Tumpukan Floating Cards Modern */}
          <div className="w-full lg:w-auto flex flex-col gap-3 sm:gap-3.5 items-stretch lg:items-end">
            
            {/* Card 1 (Atas - Soft Frosting Glass): Tipe Kamar Unit */}
            <div
              onClick={() => handleScroll("tipe-kamar")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleScroll("tipe-kamar");
              }}
              title="Klik untuk melihat Tipe Kamar Unit"
              className="group cursor-pointer w-full sm:w-[320px] md:w-[360px] p-3.5 rounded-2xl bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-98"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                <span className="text-xs font-black uppercase tracking-wide text-[#142312]">
                  TIPE KAMAR UNIT
                </span>
                <span className="w-6 h-6 rounded-full bg-black/5 group-hover:bg-[#14341B] group-hover:text-white flex items-center justify-center text-[#142312] transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-black/10 shadow-xs">
                  <img
                    src="/units/tipe-b/pov-2.jpg"
                    alt="Preview Kamar"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142312] block leading-tight">
                    Lantai 1–3: Standar, AC, Studio
                  </span>
                  <span className="text-[11px] text-gray-600 mt-0.5 block font-medium">
                    Nyaman, fully furnished &amp; water heater
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 (Tengah - Soft Frosting Glass): Tur Virtual 3D & Spesifikasi */}
            <div
              onClick={() => handleScroll("spesifikasi-3d")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleScroll("spesifikasi-3d");
              }}
              title="Klik untuk membuka Tur Virtual 3D & Spesifikasi"
              className="group cursor-pointer w-full sm:w-[320px] md:w-[360px] p-3.5 rounded-2xl bg-white/85 hover:bg-white/95 backdrop-blur-md border border-white/60 shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-98"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10">
                <span className="text-xs font-black uppercase tracking-wide text-[#142312]">
                  TUR VIRTUAL 3D &amp; SPESIFIKASI
                </span>
                <span className="w-6 h-6 rounded-full bg-black/5 group-hover:bg-[#14341B] group-hover:text-white flex items-center justify-center text-[#142312] transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-black/10 shadow-xs">
                  <img
                    src="/units/tipe-c/pov-2.jpg"
                    alt="Preview 3D"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142312] block leading-tight">
                    Model Interaktif 360°
                  </span>
                  <span className="text-[11px] text-gray-600 mt-0.5 block font-medium">
                    Kamar Mandi Dalam &amp; Fasilitas Lengkap
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 (Bawah - Badge Kuning/Hijau Elegan): Rating & Ulasan */}
            <div
              onClick={() => handleScroll("ulasan")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleScroll("ulasan");
              }}
              title="Klik untuk melihat Ulasan Penghuni"
              className="cursor-pointer w-full sm:w-[320px] md:w-[360px] px-4 py-3 rounded-2xl bg-[#E2B714] hover:bg-[#D4A910] text-[#1E2024] shadow-[0_12px_36px_rgba(0,0,0,0.25)] transition-all duration-200 hover:-translate-y-0.5 active:scale-98 flex items-center justify-between gap-3 border border-yellow-300/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-[#1E2024]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-tight leading-snug">
                    Griya Kenanga Sleman
                  </span>
                  <span className="text-[11px] font-bold opacity-90">
                    5.0★ (Ulasan Penghuni)
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#1E2024] shrink-0" />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
