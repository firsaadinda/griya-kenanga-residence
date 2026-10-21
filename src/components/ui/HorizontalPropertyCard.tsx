import React from "react";
import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";

interface HorizontalPropertyCardProps {
  unitTitle: string;
  priceRange: string;
  floorLabel?: string;
  imageSrc?: string;
  href?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function HorizontalPropertyCard({
  unitTitle,
  priceRange,
  floorLabel,
  imageSrc,
  href = "/dashboard/unit",
  gradientFrom = "from-[#26292E]",
  gradientTo = "to-[#414852]",
}: HorizontalPropertyCardProps) {
  // Automatic photo resolver if not explicitly passed
  const resolvedImage =
    imageSrc ||
    (unitTitle.includes("Studio")
      ? "/units/tipe-c/pov-2.jpg"
      : unitTitle.includes("AC")
      ? "/units/tipe-b/pov-2.jpg"
      : "/units/tipe-a/pov-1.jpg");

  return (
    <Link
      href={href}
      className="block relative w-full rounded-[24px] bg-white p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E8EAEC] overflow-hidden group hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Container dengan Aspek Rasio Seragam 4:3 & Tinggi Konsisten */}
      <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden bg-[#1C1E22] flex flex-col justify-between p-3">
        {/* Foto Unit Resolusi Tinggi */}
        <img
          src={resolvedImage}
          alt={unitTitle}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Gradient Overlay Lembut (Bagian tengah jernih agar foto tampak luas) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/50 pointer-events-none" />

        {/* Baris Atas: Bulatan Informasi Minimalis (Lantai & Harga) */}
        <div className="relative z-10 w-full flex items-center justify-between gap-1.5">
          {floorLabel ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-white/95 border border-white/20 whitespace-nowrap shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#88BC3C]" />
              <span>{floorLabel}</span>
            </span>
          ) : (
            <span />
          )}

          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#1C1E22]/90 backdrop-blur-md text-[#88BC3C] border border-[#5E8826]/40 text-[10px] sm:text-[11px] font-bold shadow-xs whitespace-nowrap">
            {priceRange}
          </span>
        </div>

        {/* Baris Bawah: Kapsul Judul & Tombol Panah Rapi */}
        <div className="relative z-10 w-full">
          <div className="w-full inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold text-[#1C1E22] shadow-sm border border-white/50 group-hover:bg-white transition">
            <span className="truncate tracking-tight">{unitTitle}</span>
            <div className="w-5 h-5 rounded-full bg-[#1C1E22] text-[#88BC3C] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
