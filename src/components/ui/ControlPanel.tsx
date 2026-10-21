import React from "react";
import Link from "next/link";
import { ArrowRight, BellRing, ChevronRight } from "lucide-react";

interface ControlItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  initials: string;
  initialsBg?: string;
}

export function ControlPanel() {
  const items: ControlItem[] = [
    {
      id: "tagihan-overdue",
      title: "7 Tagihan Lewat Jatuh Tempo",
      subtitle: "Dimas (denda Rp100rb), Hana (maks Rp200rb)",
      href: "/dashboard/tagihan",
      initials: "7T",
      initialsBg: "bg-rose-500",
    },
    {
      id: "kontrak-ending",
      title: "3 Kontrak Berakhir 31 Okt 2026",
      subtitle: "Cahya (A-103), Nadia (B-207), Wahyu (C-306)",
      href: "/dashboard/kontrak",
      initials: "3K",
      initialsBg: "bg-amber-500",
    },
    {
      id: "kontrak-draft",
      title: "2 Kontrak Draf Siap Tindak Lanjut",
      subtitle: "Fajar (C-307 verifikasi KTP) & Cahya (A-103)",
      href: "/dashboard/kontrak",
      initials: "2D",
      initialsBg: "bg-blue-500",
    },
    {
      id: "perbaikan-approval",
      title: "1 Perbaikan > Rp1 Jt Butuh Approval",
      subtitle: "LK-2026-0010 • Pintu A-104 (Rp1.250.000)",
      href: "/dashboard/kerusakan",
      initials: "1P",
      initialsBg: "bg-[#5E8826] text-white",
    },
    {
      id: "laporan-omzet",
      title: "Laporan Pendapatan Agu-Okt 2026",
      subtitle: "Ditagih Rp119,38 Jt • Diterima Rp102,88 Jt",
      href: "/dashboard/laporan",
      initials: "LP",
      initialsBg: "bg-emerald-600 text-white",
    },
  ];

  return (
    <aside className="w-full rounded-[28px] bg-[#1C1E22] text-white p-5 sm:p-6 shadow-[0_12px_45px_rgba(0,0,0,0.12)] border border-white/10 flex flex-col justify-between space-y-5">
      {/* Header Panel Pusat Kendali */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26292E] text-[10px] uppercase tracking-wider text-[#88BC3C] font-semibold border border-[#5E8826]/30">
          <BellRing className="w-3 h-3 text-[#88BC3C]" />
          <span>Pengingat &amp; Aksi</span>
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white">
            Pusat Kendali Operasional
          </h3>
          <p className="text-xs text-[#A0A6AF] mt-0.5">
            Kamis, 15 Oktober 2026 • Real-Time Alert
          </p>
        </div>
      </div>

      {/* Deretan Kartu Pill Putih (rounded-full) */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center justify-between gap-3 bg-white text-[#26292E] hover:bg-[#F6F7F9] px-3.5 py-2.5 rounded-full shadow-sm transition group border border-white/20"
          >
            {/* Thumbnail Bulat Kiri */}
            <div
              className={`w-9 h-9 rounded-full ${
                item.initialsBg || "bg-[#26292E] text-white"
              } flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
            >
              {item.initials}
            </div>

            {/* Teks Judul & Subtitle Ringkas */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold truncate leading-tight text-[#26292E]">
                {item.title}
              </p>
              <p className="text-[10px] text-[#737A84] truncate">
                {item.subtitle}
              </p>
            </div>

            {/* Tombol Panah Kanan */}
            <div className="w-7 h-7 rounded-full bg-[#F6F7F9] text-[#26292E] flex items-center justify-center group-hover:bg-[#1C1E22] group-hover:text-[#88BC3C] transition shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Tautan Cepat */}
      <div className="pt-2 border-t border-white/10 text-center">
        <Link
          href="/dashboard/laporan"
          className="inline-flex items-center gap-1.5 text-xs text-[#88BC3C] hover:text-[#A2DB56] hover:underline font-semibold transition"
        >
          <span>Buka Denah Lantai &amp; Audit Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
