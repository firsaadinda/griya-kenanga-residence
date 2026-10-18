"use client";

import { useEffect } from "react";
import { ServerCrash, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { HTTP_STATUS_CATALOG } from "@/types/api";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const meta = HTTP_STATUS_CATALOG[500];

  useEffect(() => {
    // Logging error yang aman
    console.error("Next.js Error Boundary menangkap kesalahan:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F6F7F9]">
      <div className="w-full max-w-lg rounded-[28px] border border-[#E8EAEC] bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center space-y-6">
        {/* Ikon Server Status */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2]">
          <ServerCrash className="h-7 w-7" aria-hidden="true" />
        </div>

        {/* Badge Kode Status */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F0] border border-[#FFCDD2] text-[11px] font-bold text-[#D32F2F] uppercase tracking-wider">
            Status Code 500
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1E22]">
            {meta.title}
          </h1>
          <p className="text-xs text-[#737A84] max-w-sm mx-auto leading-relaxed">
            {meta.defaultMessage}
          </p>
        </div>

        {/* Detail Kode Error Teknis */}
        {error?.message && (
          <div className="rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] p-3.5 text-left font-mono text-[11px] text-[#26292E] overflow-x-auto">
            <span className="text-[#737A84] block text-[10px] uppercase font-sans font-bold mb-1">
              Kode Detail Gangguan:
            </span>
            <span className="text-[#D32F2F] font-semibold">{error.message}</span>
          </div>
        )}

        {/* Opsi Navigasi Cepat */}
        <div className="space-y-3 pt-1">
          <span className="text-[11px] font-semibold text-[#737A84] block">
            Pilih tindakan atau halaman tujuan:
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1E22] hover:bg-[#26292E] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#D2F367]" />
              <span>Muat Ulang</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E8EAEC] bg-[#F6F7F9] hover:bg-[#E8EAEC] px-4 py-2.5 text-xs font-semibold text-[#26292E] transition"
            >
              <Home className="h-3.5 w-3.5 text-[#737A84]" />
              <span>Beranda</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#E8EAEC]">
            <Link
              href="/dashboard/unit"
              className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9] transition"
            >
              Ke Unit
            </Link>
            <Link
              href="/dashboard/kontrak"
              className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9] transition"
            >
              Ke Kontrak
            </Link>
            <Link
              href="/dashboard/tagihan"
              className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9] transition"
            >
              Ke Tagihan
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
