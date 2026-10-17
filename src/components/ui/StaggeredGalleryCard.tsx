import React from "react";
import { ArrowRight } from "lucide-react";

interface StaggeredGalleryCardProps {
  title?: string;
  badgePrice?: string;
  actionText?: string;
  lunasRatio?: string;
}

export function StaggeredGalleryCard({
  title = "Studio • Rp2,75 Jt",
  badgePrice = "Studio • Rp2,75 Jt",
  actionText = "Denah 3 Lantai",
  lunasRatio = "13/19 Lunas",
}: StaggeredGalleryCardProps) {
  const avatars = [
    { initials: "AP", bg: "bg-[#26292E]" },
    { initials: "BS", bg: "bg-[#33383F]" },
    { initials: "CR", bg: "bg-[#737A84]" },
    { initials: "DS", bg: "bg-[#26292E]" },
    { initials: "HP", bg: "bg-[#33383F]" },
  ];

  return (
    <div className="rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-[#E8EAEC] flex flex-col justify-between overflow-hidden">
      {/* Wadah Visual Arsitektur */}
      <div className="relative w-full h-44 sm:h-48 rounded-[22px] overflow-hidden bg-[#26292E] p-4 flex flex-col justify-between">
        {/* Background Visual Gedung / Studio */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C1E22] via-[#2A2E35] to-[#3B4049]">
          <svg className="w-full h-full opacity-30" viewBox="0 0 350 200" fill="none">
            <rect x="20" y="30" width="90" height="150" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="130" y="10" width="120" height="180" stroke="#D2F367" strokeWidth="2" strokeDasharray="3 3" />
            <rect x="270" y="40" width="70" height="140" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="20" y1="90" x2="340" y2="90" stroke="#737A84" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Baris Atas: Badge Harga & Tombol Denah */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#D2F367] text-[#1C1E22] text-xs font-bold tracking-tight shadow-sm">
            {badgePrice}
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[11px] font-semibold text-[#26292E] shadow-sm transition"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bagian Bawah: Susunan Tumpukan Avatar Penghuni & Status Lunas */}
      <div className="pt-3 px-1">
        <span className="block text-[11px] font-medium text-[#737A84] mb-2">
          Penghuni Terverifikasi & Tagihan Oktober
        </span>
        <div className="flex items-center justify-between">
          {/* Avatar Bertingkat (Stacked Avatars) */}
          <div className="flex items-center -space-x-2">
            {avatars.map((av, idx) => (
              <div
                key={idx}
                className={`w-7 h-7 rounded-full ${av.bg} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm`}
              >
                {av.initials}
              </div>
            ))}
          </div>

          {/* Badge Hijau Muda Status Lunas */}
          <span className="px-3 py-1 rounded-full bg-[#D2F367] text-[#1C1E22] text-xs font-bold shadow-xs">
            {lunasRatio}
          </span>
        </div>
      </div>
    </div>
  );
}
