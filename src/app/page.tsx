"use client";

import { useState } from "react";
import Link from "next/link";
import { HTTP_STATUS_CATALOG, HttpStatusCode, ApiResponse } from "@/types/api";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { DebounceButton } from "@/components/feedback/DebounceButton";
import { OrbitalBackground } from "@/components/ui/OrbitalBackground";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
  Home,
  Check,
  Building,
} from "lucide-react";

export default function HomePage() {
  const [activeStatus, setActiveStatus] = useState<HttpStatusCode>(200);
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitToast, setRateLimitToast] = useState<string | null>(null);

  const fetchStatusTest = async (code: HttpStatusCode) => {
    setActiveStatus(code);
    setIsLoading(true);
    setRateLimitToast(null);

    try {
      const res = await fetch(`/api/status-test?code=${code}`);
      const data: ApiResponse = await res.json();
      setApiResult(data);
    } catch {
      setApiResult({
        success: false,
        statusCode: 500,
        message: HTTP_STATUS_CATALOG[500].defaultMessage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatedSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await fetchStatusTest(200);
  };

  return (
    <div className="min-h-screen relative bg-[#F6F7F9] text-[#26292E] font-sans pb-16">
      <OrbitalBackground />

      {/* Floating Pill Top Nav */}
      <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 mb-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.06)]">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-griya-kenanga.png"
              alt="Logo Griya Kenanga Residence"
              className="h-10 sm:h-11 w-auto object-contain"
            />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-[#26292E] block">
                Griya Kenanga
              </span>
              <span className="text-[10px] text-[#737A84] tracking-widest uppercase block -mt-0.5 font-medium">
                Residence • Sleman
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Masuk Sistem</span>
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-xs font-semibold border border-[#E8EAEC] transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#737A84]" />
              <span>Daftar Penyewa</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        {/* Banner Selamat Datang Two-Tone Editorial */}
        <section className="bg-white rounded-[28px] p-6 sm:p-10 border border-[#E8EAEC] shadow-[0_12px_45px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              sistem terpadu [tahap 3 aktif]
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#26292E] leading-tight">
              Hunian tertata,{" "}
              <span className="text-[#737A84] font-normal">
                kelola tanpa celah.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#737A84] leading-relaxed">
              Selamat datang di portal Manajemen Properti Griya Kenanga Residence, Sleman. Platform operasional bagi Pemilik, Pengelola, dan Penyewa dengan standar desain presisi Monte Real Estate &amp; Terra.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition"
              >
                <span>Buka Beranda Operasional</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D2F367]" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-xs font-semibold border border-[#E8EAEC] transition"
              >
                <span>Uji Coba 3 Peran (Quick Switcher)</span>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 bg-[#1C1E22] text-white rounded-3xl p-5 border border-[#26292E] space-y-3 shrink-0">
            <span className="text-[10px] font-bold text-[#D2F367] uppercase tracking-wider block">
              Status Operasional
            </span>
            <div className="space-y-1">
              <p className="text-sm font-bold">24 Unit Kos &amp; Studio</p>
              <p className="text-xs text-[#737A84]">19 Terisi • 4 Tersedia • 1 Perbaikan</p>
            </div>
            <div className="pt-2 border-t border-[#26292E] space-y-1 text-xs text-[#737A84]">
              <div className="flex justify-between">
                <span>Tanggal Acuan:</span>
                <strong className="text-white">15 Okt 2026</strong>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <strong className="text-[#D2F367]">Supabase SSR</strong>
              </div>
              <div className="flex justify-between">
                <span>Route Guard:</span>
                <strong className="text-white">401 &amp; 403 Aktif</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Interaktif Pengujian 7 Status Code HTTP */}
        <section className="rounded-[28px] border border-[#E8EAEC] bg-white p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] space-y-6">
          <div className="space-y-1">
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              standar materi bootcamp [tahap 0 &amp; 3]
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#26292E] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Verifikasi Standar 7 Status Code HTTP
            </h2>
            <p className="text-xs text-[#737A84]">
              Klik tombol di bawah untuk menguji respons standar API dan komponen visual alert Bahasa Indonesia. Perhatikan bahwa 401 dan 403 memiliki makna yang berbeda dan tidak pernah tertukar.
            </p>
          </div>

          {/* Tombol Pemilih Status Code */}
          <div className="flex flex-wrap gap-2">
            {(
              [200, 400, 401, 403, 404, 429, 500] as HttpStatusCode[]
            ).map((code) => {
              const meta = HTTP_STATUS_CATALOG[code];
              const isSelected = activeStatus === code;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => fetchStatusTest(code)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition border ${
                    isSelected
                      ? "bg-[#1C1E22] text-white border-[#1C1E22] shadow-sm"
                      : "bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] border-[#E8EAEC]"
                  }`}
                >
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#26292E] text-[#D2F367]"
                        : "bg-white text-[#737A84]"
                    }`}
                  >
                    {code}
                  </span>
                  <span>{meta.title}</span>
                </button>
              );
            })}
          </div>

          {/* Visualisasi AlertBanner */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737A84]">
              Pratinjau Komponen Alert (Sisi Pengguna):
            </h3>

            <AlertBanner
              statusCode={activeStatus}
              message={apiResult?.message}
              errors={apiResult?.errors}
            />
          </div>

          {/* Raw JSON Response dari Endpoint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737A84]">
                Payload Respons JSON API (/api/status-test?code={activeStatus}):
              </h3>
              {isLoading && (
                <span className="text-xs text-emerald-600 animate-pulse font-medium">
                  Mengambil data...
                </span>
              )}
            </div>

            <pre className="rounded-2xl bg-[#1C1E22] text-[#D2F367] p-4 font-mono text-xs overflow-x-auto border border-[#26292E]">
              {JSON.stringify(
                apiResult || {
                  success: true,
                  statusCode: 200,
                  message: HTTP_STATUS_CATALOG[200].defaultMessage,
                  timestamp: "Menunggu interaksi pengujian...",
                },
                null,
                2
              )}
            </pre>
          </div>
        </section>

        {/* Panel Pengujian Debounce Button (Proteksi 429) */}
        <section className="rounded-[28px] border border-[#E8EAEC] bg-white p-6 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#26292E] flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Pengujian Tombol Anti-Spam (Proteksi HTTP 429 Sisi Klien)
            </h2>
            <p className="text-xs text-[#737A84] mt-1">
              Tombol ini dilengkapi pengaman debounce &amp; cooldown. Coba klik berkali-kali secara cepat untuk melihat bagaimana sistem mengunci tombol dan mencegah pengiriman request berulang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <DebounceButton
              onClick={handleSimulatedSubmit}
              cooldownMs={2000}
              loadingText="Menyimpan Data..."
              onRateLimited={(msg) => setRateLimitToast(msg)}
              className="bg-[#1C1E22] hover:bg-[#26292E] text-white font-semibold shadow-sm rounded-full px-5 py-2.5"
            >
              <span>Simpan Perubahan Properti</span>
            </DebounceButton>

            {rateLimitToast && (
              <div className="text-xs font-medium text-purple-800 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-full flex items-center gap-2">
                <span>⚠️ {rateLimitToast}</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
