"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Home,
  Users,
  FileSignature,
  Receipt,
  Wrench,
  BarChart3,
  Shield,
  CreditCard,
  User,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { UserProfile } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/auth/actions";
import { getUserAvatarUrl } from "@/lib/utils/avatar-map";
import { globalSearchAction, GlobalSearchResult } from "@/lib/actions/search-actions";
import { GlobalSearchDetailModal } from "@/components/navigation/GlobalSearchDetailModal";

interface NavbarProps {
  userProfile?: UserProfile | null;
}

// Ikon Khas Indonesia: Lencana Rupiah (Rp) untuk Tagihan / Keuangan
function RupiahIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center font-black tracking-tighter select-none ${className}`}>
      <span className="text-[10px] leading-none font-extrabold font-mono border border-current rounded-[4px] px-[2px] py-[1px]">
        Rp
      </span>
    </div>
  );
}

export function Navbar({ userProfile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Smart Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<GlobalSearchResult | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounced Live Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    setIsSearchOpen(true);
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await globalSearchAction(q);
        setSearchResults(res);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setIsSearchOpen(false);
        setSelectedDetailItem(searchResults[0]);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
  };

  const role = userProfile?.peran || "penyewa";

  // Menu navigasi utama berdasarkan peran
  const mainItems = [
    { label: "Beranda", href: "/dashboard", icon: LayoutDashboard, show: true },
    { label: "Unit", href: "/dashboard/unit", icon: Home, show: role === "pemilik" || role === "pengelola" },
    { label: "Penyewa", href: "/dashboard/penyewa", icon: Users, show: role === "pemilik" || role === "pengelola" },
    { label: "Kontrak", href: "/dashboard/kontrak", icon: FileSignature, show: role === "pemilik" || role === "pengelola" },
    { label: "Tagihan", href: "/dashboard/tagihan", icon: RupiahIcon, show: true },
    { label: "Kerusakan", href: "/dashboard/kerusakan", icon: Wrench, show: true },
  ].filter((item) => item.show);

  // Menu Khusus Pemilik (PRD Bagian 7 & Wireframe Hal 3 & 4)
  const ownerItems = [
    { label: "Laporan", href: "/dashboard/laporan", icon: BarChart3, show: role === "pemilik" },
    { label: "Pengaturan", href: "/dashboard/pengaturan", icon: Shield, show: role === "pemilik" },
    { label: "Setelan Gateway", href: "/setelan", icon: CreditCard, show: role === "pemilik" },
  ].filter((item) => item.show);

  const allItems = [...mainItems, ...ownerItems];

  const getInitials = (name?: string) => {
    if (!name) return "GK";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRoleBadgeLabel = (r: string) => {
    switch (r) {
      case "pemilik":
        return "Pemilik";
      case "pengelola":
        return "Pengelola";
      default:
        return "Penyewa";
    }
  };

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 lg:px-8 mb-6">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.06)]">
        {/* Sisi Kiri: Logo Resmi Transparan & Nama Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <img
              src="/logo-griya-kenanga.png"
              alt="Logo Griya Kenanga Residence"
              className="h-10 sm:h-11 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-xs uppercase tracking-wider text-[#26292E] block">
                Griya Kenanga
              </span>
              <span className="text-[10px] text-[#737A84] tracking-widest uppercase block -mt-0.5 font-medium">
                Residence • Sleman
              </span>
            </div>
          </Link>

          {/* Menu Dropdown / Navigasi Cepat */}
          {(() => {
            const currentItem = allItems.find(
              (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            );
            const activeLabel = currentItem ? currentItem.label : "Menu";
            const ActiveIcon = currentItem?.icon;

            return (
              <div className="relative ml-2">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] transition shadow-xs"
                >
                  {ActiveIcon && <ActiveIcon className="w-3.5 h-3.5 text-[#26292E]" />}
                  <span>{activeLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#737A84] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-[#E8EAEC] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-1.5 mb-1 border-b border-[#E8EAEC]">
                      <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider">Navigasi Halaman</span>
                    </div>

                    {/* Menu Utama */}
                    {mainItems.map((item) => {
                      const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center justify-between px-4 py-2 text-xs font-medium transition ${
                            isActive
                              ? "bg-[#1C1E22] text-white font-semibold rounded-xl mx-2"
                              : "text-[#737A84] hover:bg-[#F6F7F9] hover:text-[#26292E] rounded-xl mx-2"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon className={`w-4 h-4 ${isActive ? "text-[#D2F367]" : "text-[#737A84]"}`} />
                            <span>{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D2F367]"></span>
                          )}
                        </Link>
                      );
                    })}

                    {/* Bagian KHUSUS PEMILIK (Hanya tampil untuk Pemilik, Wireframe Hal 3 & 4) */}
                    {role === "pemilik" && ownerItems.length > 0 && (
                      <>
                        <div className="px-4 pt-3 pb-1 mt-1 border-t border-[#E8EAEC]">
                          <span className="text-[9px] font-bold text-[#1B5E20] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                            KHUSUS PEMILIK
                          </span>
                        </div>
                        {ownerItems.map((item) => {
                          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsDropdownOpen(false)}
                              className={`flex items-center justify-between px-4 py-2 text-xs font-medium transition ${
                                isActive
                                  ? "bg-[#1C1E22] text-white font-semibold rounded-xl mx-2"
                                  : "text-[#737A84] hover:bg-[#F6F7F9] hover:text-[#26292E] rounded-xl mx-2"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <item.icon className={`w-4 h-4 ${isActive ? "text-[#D2F367]" : "text-[#737A84]"}`} />
                                <span>{item.label}</span>
                              </div>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F367]"></span>
                              )}
                            </Link>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Tengah: Smart Search Kapsul & Tanggal Acuan 15 Okt 2026 */}
        <div className="flex items-center gap-3 flex-1 max-w-lg mx-2">
          <div ref={searchContainerRef} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737A84]" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari Unit, Penyewa, Kontrak, atau Nomor Invoice"
              className="w-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] pl-9 pr-9 py-2 rounded-full border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition shadow-xs"
            />

            {/* Clear Button (X) atau Loader */}
            {isSearching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A84]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            ) : searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#737A84] hover:text-[#26292E] hover:bg-[#E8EAEC] transition cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}

            {/* FLOATING SMART SEARCH RESULTS DROPDOWN (MONTE X TERRA) */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-[24px] border border-[#E8EAEC] shadow-[0_16px_40px_rgba(38,41,46,0.12)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {isSearching ? (
                  <div className="p-6 text-center text-xs text-[#737A84] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#1C1E22]" />
                    <span>Mencari di seluruh unit, penyewa &amp; transaksi</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1 max-h-[380px] overflow-y-auto">
                    <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold tracking-wider text-[#737A84] uppercase border-b border-[#F0F2F4]">
                      <span>Hasil Pencarian ({searchResults.length})</span>
                      <span>Tekan Enter ↵</span>
                    </div>

                    {searchResults.map((item) => {
                      const CategoryIcon =
                        item.category === "unit"
                          ? Home
                          : item.category === "penyewa"
                          ? Users
                          : item.category === "tagihan"
                          ? Receipt
                          : item.category === "kontrak"
                          ? FileSignature
                          : Wrench;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSelectedDetailItem(item);
                          }}
                          className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#F6F7F9] transition group cursor-pointer focus:outline-none focus:bg-[#F6F7F9]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-[#F6F7F9] group-hover:bg-[#1C1E22] group-hover:text-[#D2F367] text-[#26292E] flex items-center justify-center shrink-0 transition-colors border border-[#E8EAEC]">
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#26292E] truncate group-hover:text-[#1C1E22]">
                                  {item.title}
                                </span>
                                <span className="text-[9px] font-semibold text-[#737A84] bg-[#F0F2F4] px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                  {item.categoryLabel}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#737A84] truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F6F7F9] text-[#26292E] border border-[#E8EAEC]">
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-[#A0A6AF] group-hover:text-[#26292E] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* EMPTY STATE SAAT TIDAK ADA HASIL (MISAL: fjfjfdd) */
                  <div className="p-6 text-center space-y-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#F6F7F9] border border-[#E8EAEC] flex items-center justify-center mx-auto text-[#737A84]">
                      <Search className="w-4 h-4 text-[#A0A6AF]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#26292E]">
                        Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;
                      </p>
                      <p className="text-[11px] text-[#737A84] mt-1 max-w-xs mx-auto leading-relaxed">
                        Coba gunakan kata kunci seperti kode unit (<span className="font-semibold text-[#26292E]">A-101</span>, <span className="font-semibold text-[#26292E]">B-205</span>), nama penyewa (<span className="font-semibold text-[#26292E]">Dimas</span>, <span className="font-semibold text-[#26292E]">Hana</span>), tagihan (<span className="font-semibold text-[#26292E]">INV</span>), atau kontrak (<span className="font-semibold text-[#26292E]">KTR</span>).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F6F7F9] text-xs font-medium text-[#737A84] border border-[#E8EAEC] whitespace-nowrap ml-auto">
            <span className="w-2 h-2 rounded-full bg-[#D2F367]"></span>
            <span>15 Okt 2026</span>
          </div>
        </div>

        {/* Sisi Kanan: Kapsul Profil Pengguna Abu Tua (#1C1E22) */}
        <div className="flex items-center gap-2">
          {userProfile ? (
            <div className="flex items-center gap-2 bg-[#1C1E22] text-white pl-1.5 pr-2 py-1 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-[#D2F367] flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={getUserAvatarUrl(userProfile.nama_lengkap || userProfile.email)}
                  alt={userProfile.nama_lengkap}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="hidden sm:block text-left mr-1">
                <p className="text-xs font-semibold leading-tight text-white max-w-[120px] truncate">
                  {userProfile.nama_lengkap}
                </p>
                <p className="text-[10px] text-[#D2F367] font-medium leading-none">
                  {getRoleBadgeLabel(userProfile.peran)}
                </p>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Keluar dari Akun"
                  className="p-1 rounded-full text-[#737A84] hover:text-white hover:bg-[#26292E] transition focus:outline-none"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full bg-[#1C1E22] text-[#D2F367] hover:bg-[#26292E] text-xs font-semibold transition shadow-sm"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-medium text-[#26292E] transition"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* MODAL RINCIAN / DETAIL PERSONAL PENCARIAN GLOBAL IN-PLACE */}
      <GlobalSearchDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />
    </header>
  );
}
