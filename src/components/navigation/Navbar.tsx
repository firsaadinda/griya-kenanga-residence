"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, LogOut, ChevronDown, LayoutDashboard, Home, Users, FileSignature, Receipt, Wrench, BarChart3, Shield, User } from "lucide-react";
import { UserProfile } from "@/lib/auth/guard";
import { logoutAction } from "@/lib/auth/actions";
import { getUserAvatarUrl } from "@/lib/utils/avatar-map";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        <div className="flex items-center gap-2.5 flex-1 max-w-md mx-2">
          <div className="relative w-full hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737A84]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari unit, penyewa, atau INV..."
              className="w-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-[#D5D9DE] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F6F7F9] text-xs font-medium text-[#737A84] border border-[#E8EAEC] whitespace-nowrap">
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
    </header>
  );
}
