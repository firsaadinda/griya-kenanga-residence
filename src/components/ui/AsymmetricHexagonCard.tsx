import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface AsymmetricHexagonCardProps {
  blockTitle?: string;
  roomType?: string;
  statusInfo?: string;
  price?: string;
  imageAlt?: string;
  imageSrc?: string;
  href?: string;
}

export function AsymmetricHexagonCard({
  blockTitle = "Blok A • Lantai 1",
  roomType = "Kamar Standar",
  statusInfo = "7/8 Terisi Aktif",
  price = "Rp1,45 Jt/bln",
  imageAlt = "Visual Kamar Standar Griya Kenanga",
  imageSrc = "/units/tipe-a/pov-5.jpg",
  href = "/dashboard/unit",
}: AsymmetricHexagonCardProps) {
  return (
    <div className="relative w-full h-full rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-[#E8EAEC] flex flex-col justify-between overflow-hidden group">
      {/* Wadah Gambar dengan Lekukan Poligon Asimetris di Kanan Bawah */}
      <div className="relative w-full h-full flex-1 min-h-[220px] rounded-[22px] overflow-hidden bg-[#26292E]">
        {/* Real Photograph with Smooth Zoom Effect on Hover */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Subtle Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35 pointer-events-none" />

        {/* Badge Lokasi Mengambang di Pojok Kiri Atas */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-semibold text-[#26292E] shadow-sm border border-white/40">
            <span className="w-2 h-2 rounded-full bg-[#5E8826] animate-pulse"></span>
            {blockTitle}
          </span>
        </div>

        {/* Potongan Diagonal Notch Putih di Kanan Bawah (Clip Path Poligon Asimetris) */}
        <div className="absolute bottom-0 right-0 z-10 bg-white pt-3 pl-3.5 pb-2 pr-2 rounded-tl-2xl border-t border-l border-[#E8EAEC] shadow-sm flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-semibold text-[#26292E] leading-tight">
              {roomType}
            </span>
            <span className="block text-[10px] text-[#737A84]">
              {statusInfo} • <strong className="text-[#26292E] font-medium">{price}</strong>
            </span>
          </div>

          {/* Tombol Lingkaran Panah Elegan */}
          <Link
            href={href}
            title="Lihat Detail Unit"
            className="w-9 h-9 rounded-full bg-[#1C1E22] text-[#88BC3C] hover:bg-[#26292E] flex items-center justify-center transition shadow-sm group-hover:scale-105 border border-white/10"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
