import React from "react";
import { ArrowUpRight } from "lucide-react";

interface AsymmetricHexagonCardProps {
  blockTitle?: string;
  roomType?: string;
  statusInfo?: string;
  price?: string;
  imageAlt?: string;
}

export function AsymmetricHexagonCard({
  blockTitle = "Blok A • Lantai 1",
  roomType = "Kamar Standar",
  statusInfo = "7/8 Terisi Aktif",
  price = "Rp1,45 Jt/bln",
  imageAlt = "Visual Arsitektur Griya Kenanga",
}: AsymmetricHexagonCardProps) {
  return (
    <div className="relative rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-[#E8EAEC] flex flex-col justify-between overflow-hidden group">
      {/* Wadah Gambar dengan Lekukan Poligon Asimetris di Kanan Bawah */}
      <div className="relative w-full h-64 sm:h-72 rounded-[22px] overflow-hidden bg-[#26292E]">
        {/* SVG Ilustrasi Arsitektur Modern Griya Kenanga */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#26292E] via-[#33383F] to-[#484E57] flex items-center justify-center">
          <svg
            className="w-full h-full opacity-35"
            viewBox="0 0 400 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="40" y="60" width="120" height="180" rx="8" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="80" y="90" width="80" height="150" fill="#FFFFFF" fillOpacity="0.15" />
            <rect x="200" y="40" width="160" height="200" rx="12" stroke="#D2F367" strokeWidth="2" />
            <line x1="200" y1="100" x2="360" y2="100" stroke="#D2F367" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="200" y1="160" x2="360" y2="160" stroke="#D2F367" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="280" cy="70" r="14" fill="#D2F367" fillOpacity="0.3" />
          </svg>
        </div>

        {/* Badge Lokasi Mengambang di Pojok Kiri Atas */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-[#26292E] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#D2F367]"></span>
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

          {/* Tombol Lingkaran Panah Hijau Muda (#D2F367) */}
          <button
            type="button"
            title="Lihat Detail Unit"
            className="w-9 h-9 rounded-full bg-[#D2F367] text-[#1C1E22] hover:bg-[#c2e554] flex items-center justify-center transition shadow-sm group-hover:scale-105"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
