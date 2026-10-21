"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrowserWindowFrame } from "@/components/landing/BrowserWindowFrame";
import { HeroSection } from "@/components/landing/HeroSection";
import { TenantReviewsSection } from "@/components/landing/TenantReviewsSection";
import { UnitsSection } from "@/components/landing/UnitsSection";
import { HTTP_STATUS_CATALOG, HttpStatusCode, ApiResponse } from "@/types/api";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { DebounceButton } from "@/components/feedback/DebounceButton";
import {
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
  Home,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Building,
} from "lucide-react";

export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add("landing-page-active");
    return () => {
      document.documentElement.classList.remove("landing-page-active");
    };
  }, []);

  const [activeStatus, setActiveStatus] = useState<HttpStatusCode>(200);
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
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

  const [selectedUnitType, setSelectedUnitType] = useState<"standar" | "ac" | "studio">("standar");

  const scrollToUnits = () => {
    const el = document.getElementById("units-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectUnitType = (typeId: "standar" | "ac" | "studio") => {
    setSelectedUnitType(typeId);
    scrollToUnits();
  };

  return (
    <div className="landing-page min-h-screen relative font-sans select-text antialiased">
      {/* Background Image (Ultra-sharp 12K quality crystal clear, zero blur) */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <img
          src="/images/griya-kenanga-12k-merapi.jpg?v=3"
          alt="Latar Belakang Eksklusif Griya Kenanga Residence"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle 5% blur and ambient tint so background is soft and not overly contrasting */}
        <div
          className="absolute inset-0 bg-black/15"
          style={{ backdropFilter: "blur(0.6px)", WebkitBackdropFilter: "blur(0.6px)" }}
        />
      </div>

      {/* Main Container Wrapper */}
      <div className="relative z-10 w-full min-h-screen py-4 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Browser Window Frame (Clean, without the outer floating bar) */}
        <BrowserWindowFrame url="griyakenanga.id/residence">
          {/* Hero Section (Split Layout with 6 photos from Lantai 2 & 3) */}
          <HeroSection
            onScrollToUnits={scrollToUnits}
            onSelectUnitType={handleSelectUnitType}
          />

          {/* 3 Units Section (Tipe Standar, Tipe AC, Tipe Studio + 5 Foto + Model 3D) */}
          <UnitsSection
            selectedTypeId={selectedUnitType}
            onSelectTypeId={setSelectedUnitType}
          />

          {/* 6 Tenant Reviews Section with Profile Photos */}
          <TenantReviewsSection />

          {/* Footer of the Frame */}
          <footer className="w-full bg-[#1E2024] text-white py-12 px-6 sm:px-10 lg:px-14 border-t border-[#2A2A2A]">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo-griya-kenanga.png"
                    alt="Logo Griya Kenanga Residence"
                    className="h-10 sm:h-12 w-auto object-contain bg-white rounded-lg p-1 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block">
                      GRIYA KENANGA RESIDENCE
                    </span>
                    <span className="text-[10px] text-[#76A733] font-bold tracking-widest uppercase block -mt-0.5">
                      Kos Eksklusif &amp; Studio • Sleman
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#A6B0BA] max-w-md leading-relaxed">
                  Hunian kos dan studio modern 24 unit di Sleman, Yogyakarta. Menghadirkan keseimbangan arsitektur presisi, privasi tinggi, dan kenyamanan tinggal jangka panjang.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#A6B0BA] pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#76A733]" />
                  <span>Kec. Depok, Kab. Sleman, Daerah Istimewa Yogyakarta</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4C4B1]">
                  Tipe Unit Kamar
                </h4>
                <ul className="space-y-1.5 text-xs text-[#A6B0BA]">
                  <li>
                    <button
                      onClick={() => handleSelectUnitType("standar")}
                      className="hover:text-white transition cursor-pointer text-left"
                    >
                      Tipe Standar (Lantai 1)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectUnitType("ac")}
                      className="hover:text-white transition cursor-pointer text-left"
                    >
                      Tipe AC (Lantai 2)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSelectUnitType("studio")}
                      className="hover:text-white transition cursor-pointer text-left"
                    >
                      Tipe Studio (Lantai 3)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={scrollToUnits}
                      className="hover:text-white transition cursor-pointer text-left"
                    >
                      Buka Model 3D Kamar
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D9C3A5]">
                  Akses Sistem &amp; Portal
                </h4>
                <ul className="space-y-1.5 text-xs text-[#A6B0BA]">
                  <li>
                    <Link href="/login" className="hover:text-white transition">
                      Masuk Akun Penyewa / Staf
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="hover:text-white transition"
                    >
                      Pendaftaran Penyewa Baru
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-white transition"
                    >
                      Dashboard Operasional
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#A6B0BA]">
              <p>
                &copy; {new Date().getFullYear()} Griya Kenanga Residence. Hak cipta dilindungi.
              </p>
              <div className="flex items-center gap-2">
                <span>Hunian Kos Eksklusif &amp; Studio • Sleman, Yogyakarta</span>
              </div>
            </div>
          </footer>
        </BrowserWindowFrame>

        {/* Collapsible Developer & Bootcamp Evaluation Panel (Preserved for Testing) */}
        {showDevPanel && (
          <div className="w-full max-w-[1360px] mx-auto mt-6 rounded-[28px] bg-white border border-[#E8EAEC] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8EAEC] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                  Panel Pengujian Standar Bootcamp [Tahap 0 &amp; 3]
                </span>
                <h3 className="text-xl font-bold text-[#26292E] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Verifikasi Standar 7 Status Code HTTP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDevPanel(false)}
                className="px-3 py-1.5 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E]"
              >
                Tutup Panel
              </button>
            </div>

            {/* Buttons for 7 status codes */}
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
                          ? "bg-[#26292E] text-[#88BC3C]"
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

            {/* Alert banner display */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#737A84] uppercase tracking-wider block">
                Visualisasi Komponen Alert Sisi Klien:
              </span>
              <AlertBanner
                statusCode={activeStatus}
                message={apiResult?.message}
                errors={apiResult?.errors}
              />
            </div>

            {/* JSON Response preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#737A84] uppercase tracking-wider block">
                  Respons JSON API (/api/status-test?code={activeStatus}):
                </span>
                {isLoading && (
                  <span className="text-xs text-emerald-600 animate-pulse font-medium">
                    Mengambil...
                  </span>
                )}
              </div>
              <pre className="rounded-2xl bg-[#1C1E22] text-[#88BC3C] p-4 font-mono text-xs overflow-x-auto border border-[#26292E]">
                {JSON.stringify(
                  apiResult || {
                    success: true,
                    statusCode: 200,
                    message: HTTP_STATUS_CATALOG[200].defaultMessage,
                    timestamp: "Siap diuji...",
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Debounce Button Test */}
            <div className="pt-4 border-t border-[#E8EAEC] space-y-3">
              <h4 className="text-xs font-bold text-[#26292E] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Uji Proteksi HTTP 429 Sisi Klien (Debounce Button)
              </h4>
              <p className="text-xs text-[#737A84]">
                Klik berkali-kali secara cepat untuk menguji pencegahan double-submit:
              </p>
              <div className="flex items-center gap-3">
                <DebounceButton
                  onClick={handleSimulatedSubmit}
                  className="px-5 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold"
                >
                  Kirim Request Uji Coba (Debounce 600ms)
                </DebounceButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
