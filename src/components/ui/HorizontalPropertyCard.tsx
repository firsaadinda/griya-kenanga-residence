import React from "react";
import { ArrowRight } from "lucide-react";

interface HorizontalPropertyCardProps {
  unitTitle: string;
  priceRange: string;
  floorLabel?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function HorizontalPropertyCard({
  unitTitle,
  priceRange,
  floorLabel,
  gradientFrom = "from-[#26292E]",
  gradientTo = "to-[#414852]",
}: HorizontalPropertyCardProps) {
  return (
    <div className="relative w-full rounded-[24px] bg-white p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E8EAEC] overflow-hidden group">
      <div
        className={`relative w-full h-24 sm:h-28 rounded-[18px] bg-gradient-to-r ${gradientFrom} ${gradientTo} flex items-center justify-between p-3.5 overflow-hidden`}
      >
        {/* Subtle architectural lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 600 120" fill="none">
            <line x1="0" y1="40" x2="600" y2="40" stroke="#FFFFFF" strokeDasharray="6 6" />
            <line x1="0" y1="80" x2="600" y2="80" stroke="#FFFFFF" strokeDasharray="4 4" />
            <rect x="50" y="20" width="80" height="80" stroke="#D2F367" strokeWidth="1.5" />
            <rect x="180" y="15" width="120" height="90" stroke="#FFFFFF" strokeWidth="1" />
            <rect x="340" y="30" width="100" height="70" stroke="#D2F367" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>

        {/* Pill Putih di Pojok Kiri Bawah */}
        <div className="relative z-10 self-end">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#26292E] shadow-sm">
            <span>{unitTitle}</span>
            <div className="w-6 h-6 rounded-full bg-[#F6F7F9] flex items-center justify-center text-[#26292E]">
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Badge Harga Hijau Muda Mengambang di Kanan Atas */}
        <div className="relative z-10 self-start">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D2F367] text-[#1C1E22] text-xs font-bold shadow-sm">
            {priceRange}
          </span>
          {floorLabel && (
            <span className="ml-1 text-[10px] text-white/80 font-medium">
              {floorLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
