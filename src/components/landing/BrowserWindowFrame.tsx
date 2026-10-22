"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCw, Link as LinkIcon, User, Plus, LayoutGrid, Check, Maximize2, Home } from "lucide-react";

interface BrowserWindowFrameProps {
  children: ReactNode;
  url?: string;
  isDashboard?: boolean;
}

export function BrowserWindowFrame({
  children,
  url = "griyakenanga.id/residence",
  isDashboard = false,
}: BrowserWindowFrameProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleFullscreen = () => {
    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      className="w-full max-w-[1360px] mx-auto rounded-[28px] sm:rounded-[36px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 border-none"
      style={{ border: "none" }}
    >
      {/* Browser Chrome Header (Tombol-tombol bisa diakses sungguhan) */}
      <div className="w-full bg-[#F4F5F7] border-b border-[#E3E6EB] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 select-none">
        {/* Left: Nav buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#737A84]">
            {/* Tombol Grid / Home */}
            {isDashboard ? (
              <Link
                href="/"
                title="Buka Beranda Tamu / Landing Page"
                className="p-1 rounded-md hover:bg-white hover:text-[#26292E] transition"
              >
                <Home className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                title="Buka Dashboard Operasional"
                className="p-1 rounded-md hover:bg-white hover:text-[#26292E] transition"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Tombol Navigasi History */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => window.history.back()}
                title="Halaman Sebelumnya (Back)"
                className="p-1 rounded-md hover:bg-white hover:text-[#26292E] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => window.history.forward()}
                title="Halaman Selanjutnya (Forward)"
                className="p-1 rounded-md hover:bg-white hover:text-[#26292E] transition cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tombol Reload */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              title="Muat Ulang Halaman (Reload)"
              className="p-1 rounded-md hover:bg-white hover:text-[#26292E] transition cursor-pointer"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center: Address Bar Capsule (Bisa diklik untuk salin URL, tanpa icon kunci) */}
        <div className="flex-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            title="Klik untuk salin alamat website"
            className="w-full flex items-center justify-between px-4 py-1.5 bg-white hover:bg-[#FAFAFB] rounded-full border border-[#DDE1E6] shadow-xs text-xs text-[#4B5563] transition cursor-pointer active:scale-98"
          >
            <span className="font-medium tracking-wide uppercase text-[11px] text-[#26292E]">
              {url}
            </span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5 text-[#737A84]" />
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 text-[#737A84]">
          {isDashboard ? null : (
            <>
              <Link
                href="/login"
                title="Masuk Akun"
                className="w-7 h-7 rounded-full border border-[#D1D5DB] hover:border-[#76A733] hover:text-[#76A733] hover:bg-white flex items-center justify-center transition"
              >
                <User className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register"
                title="Buat Akun Baru"
                className="w-7 h-7 rounded-full border border-[#D1D5DB] hover:border-[#76A733] hover:text-[#76A733] hover:bg-white flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Frame Body / Website Content */}
      <div className="w-full bg-white relative">
        {children}
      </div>
    </div>
  );
}
