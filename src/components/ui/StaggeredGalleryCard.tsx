import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StaggeredGalleryCardProps {
  title?: string;
  badgePrice?: string;
  actionText?: string;
  lunasRatio?: string;
  imageSrc?: string;
  href?: string;
}

export function StaggeredGalleryCard({
  title = "Studio • Rp2,75 Jt",
  badgePrice = "Studio • Rp2,75 Jt",
  actionText = "Denah 3 Lantai",
  lunasRatio = "13/19 Lunas",
  imageSrc = "/units/tipe-c/pov-1.jpg",
  href = "/dashboard/unit?tipe=studio",
}: StaggeredGalleryCardProps) {
  const avatars = [
    { initials: "AP", bg: "bg-[#26292E]" },
    { initials: "BS", bg: "bg-[#33383F]" },
    { initials: "CR", bg: "bg-[#737A84]" },
    { initials: "DS", bg: "bg-[#26292E]" },
    { initials: "HP", bg: "bg-[#33383F]" },
  ];

  return (
    <div className="w-full h-full rounded-[28px] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.04)] border border-[#E8EAEC] flex flex-col justify-between overflow-hidden group">
      {/* Wadah Visual Arsitektur Real Photo */}
      <div className="relative w-full flex-1 min-h-[170px] rounded-[22px] overflow-hidden bg-[#26292E] p-4 flex flex-col justify-between">
        {/* Real Photograph with Zoom Effect */}
        <img
          src={imageSrc}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40 pointer-events-none" />

        {/* Baris Atas: Badge Harga & Tombol Aksi */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="px-3 py-1.5 rounded-full bg-[#1C1E22]/90 backdrop-blur-md text-[#88BC3C] text-xs font-bold tracking-tight shadow-sm border border-[#5E8826]/40">
            {badgePrice}
          </span>
          <Link
            href={href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[11px] font-semibold text-[#26292E] shadow-sm transition hover:scale-102"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#5E8826]" />
          </Link>
        </div>


      </div>

      {/* Bagian Bawah: Susunan Tumpukan Avatar Penghuni & Status Lunas */}
      <div className="pt-3 px-1 shrink-0">
        <span className="block text-[11px] font-medium text-[#737A84] mb-2">
          Penghuni Terverifikasi &amp; Tagihan Oktober
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

          {/* Badge Status Lunas Olive Berkelas */}
          <span className="px-3 py-1 rounded-full bg-[#F2F7EC] text-[#4A6C2F] text-xs font-bold border border-[#5E8826]/20 shadow-xs">
            {lunasRatio}
          </span>
        </div>
      </div>
    </div>
  );
}
