"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LaporanKeuanganData,
  SanitizedAuditLogItem,
  UserManagementItem,
  updateUserRoleAction,
} from "@/lib/actions/laporan-actions";
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  ChevronDown,
  UserCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  RefreshCw,
  Loader2,
  X,
} from "lucide-react";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { HttpStatusCode } from "@/types/api";

interface LaporanClientViewProps {
  initialData: LaporanKeuanganData;
  initialAuditLogs: SanitizedAuditLogItem[];
  initialUsers: UserManagementItem[];
  currentUserEmail: string;
  activePeriode?: "agu_okt" | "okt" | "semua";
}

export function LaporanClientView({
  initialData,
  initialAuditLogs,
  initialUsers,
  currentUserEmail,
  activePeriode = "agu_okt",
}: LaporanClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "pendapatan";

  const [activeTab, setActiveTab] = useState<"pendapatan" | "audit" | "pengaturan">(
    initialTab === "audit" || initialTab === "pengaturan" ? initialTab : "pendapatan"
  );

  // Tab 1: State Laporan Pendapatan
  const dataLaporan = initialData;
  const [selectedPeriode, setSelectedPeriode] = useState<"agu_okt" | "okt" | "semua">(activePeriode);
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [sortField, setSortField] = useState<"unit" | "ditagihkan" | "diterima" | "tunggakan">("tunggakan");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Tab 2: State Audit Log
  const [auditLogs] = useState<SanitizedAuditLogItem[]>(initialAuditLogs);
  const [filterAksi, setFilterAksi] = useState("semua");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  // Tab 3: State Pengaturan Peran
  const [usersList, setUsersList] = useState<UserManagementItem[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserManagementItem | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<"pengelola" | "penyewa">("pengelola");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleFeedback, setRoleFeedback] = useState<{ statusCode: HttpStatusCode; message: string } | null>(null);
  const [isPendingRole, startRoleTransition] = useTransition();

  // Helper format rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Helper format tanggal Indonesia
  const formatTanggalIndo = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Filter & Urutkan Tabel Pendapatan per Unit (Wireframe Hal 4: tunggakan DESC, ditagihkan DESC)
  const sortedUnitRevenues = useMemo(() => {
    return [...dataLaporan.unitRevenues].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      if (valA !== valB) {
        return sortOrder === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
      // Urutan sekunder: jika sortField === "tunggakan" dan nilainya sama (misal Rp0),
      // urutkan dari ditagihkan terbesar sehingga C-302, C-301, C-305 muncul di baris 7-9
      if (sortField === "tunggakan" && b.ditagihkan !== a.ditagihkan) {
        return b.ditagihkan - a.ditagihkan;
      }
      return a.unit.localeCompare(b.unit);
    });
  }, [dataLaporan.unitRevenues, sortField, sortOrder]);

  const displayedUnits = showAllUnits
    ? sortedUnitRevenues
    : sortedUnitRevenues.slice(0, 9);

  // Unduh CSV Tabel Pendapatan per Unit (Wireframe Hal 4 dengan UTF-8 BOM untuk Excel)
  const handleDownloadCsv = () => {
    const headers = ["Unit", "Tipe", "Lantai", "Ditagihkan", "Diterima", "Tunggakan"];
    const rows = sortedUnitRevenues.map((u) => [
      u.unit,
      u.tipe,
      u.lantai,
      u.ditagihkan,
      u.diterima,
      u.tunggakan,
    ]);

    const csvRows = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-pendapatan-griya-kenanga-agu-okt-2026.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter Audit Log di Sisi Klien (Mencocokkan 100% dengan nilai kolom aksi di DB)
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (filterAksi !== "semua") {
        const lowerAksi = log.aksi.toLowerCase();
        if (
          filterAksi === "identitas" &&
          !lowerAksi.includes("identitas") &&
          !lowerAksi.includes("verifikasi") &&
          !lowerAksi.includes("tolak")
        )
          return false;
        if (filterAksi === "kontrak" && !lowerAksi.includes("kontrak")) return false;
        if (
          filterAksi === "pembayaran" &&
          !lowerAksi.includes("pembayaran") &&
          !lowerAksi.includes("bayar")
        )
          return false;
        if (filterAksi === "tagihan" && !lowerAksi.includes("tagihan")) return false;
        if (filterAksi === "kerusakan" && !lowerAksi.includes("kerusakan")) return false;
        if (filterAksi === "unit" && !lowerAksi.includes("unit")) return false;
        if (
          filterAksi === "peran" &&
          !lowerAksi.includes("profile") &&
          !lowerAksi.includes("peran")
        )
          return false;
      }
      if (filterTanggal) {
        if (!log.dibuat_pada.startsWith(filterTanggal)) return false;
      }
      return true;
    });
  }, [auditLogs, filterAksi, filterTanggal]);

  // Eksekusi Update Peran Pengguna (BR-10)
  const handleConfirmRoleChange = () => {
    if (!selectedUser) return;
    setRoleFeedback(null);

    startRoleTransition(async () => {
      const res = await updateUserRoleAction(selectedUser.id, targetNewRole);
      if (res.success) {
        setRoleFeedback({ statusCode: res.statusCode, message: res.message });
        setUsersList((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, peran: targetNewRole } : u))
        );
        setTimeout(() => {
          setRoleModalOpen(false);
          setSelectedUser(null);
        }, 1200);
      } else {
        setRoleFeedback({ statusCode: res.statusCode, message: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER UTAMA: EKSEKUTIF KHUSUS PEMILIK */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block text-[11px] font-semibold text-[#737A84] tracking-widest uppercase">
              eksekutif &amp; audit log
            </span>
            <span className="text-emerald-700 font-bold text-[10px] uppercase">
              Khusus Pemilik
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#26292E] mt-1">
            Laporan Pendapatan,{" "}
            <span className="text-[#737A84] font-normal">dan Pusat Audit</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#737A84] mt-1 leading-relaxed">
            Data rahasia keuangan, rekap tunggakan per unit, dan transparansi aktivitas staf per 15 Oktober 2026.
          </p>
        </div>

        {/* Tab Navigasi Pil (Gaya Monte x Terra) & Tombol Aksi */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-full bg-white border border-[#E8EAEC] shadow-xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("pendapatan")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === "pendapatan"
                  ? "bg-[#1C1E22] text-white shadow-xs"
                  : "text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9]"
              }`}
            >
              Pendapatan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === "audit"
                  ? "bg-[#1C1E22] text-white shadow-xs"
                  : "text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9]"
              }`}
            >
              Audit Log
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pengaturan")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "pengaturan"
                  ? "bg-[#1C1E22] text-white shadow-xs"
                  : "text-[#737A84] hover:text-[#26292E] hover:bg-[#F6F7F9]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Pengaturan Peran</span>
            </button>
          </div>

          {activeTab === "pendapatan" && (
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5 text-[#26292E]" />
              <span>Unduh CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PENDAPATAN & TUNGGAKAN PER UNIT (WIREFRAME HAL 4)                   */}
      {/* ========================================================================= */}
      {activeTab === "pendapatan" && (
        <div className="space-y-6">
          {/* Baris Ringkasan Periode & Filter Dinamis (Wireframe Hal 4) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-[#E8EAEC] shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#737A84]">
              <Calendar className="w-4 h-4 text-[#26292E]" />
              <span>Rentang Laporan:</span>
              <select
                value={selectedPeriode}
                onChange={(e) => {
                  const val = e.target.value as "agu_okt" | "okt" | "semua";
                  setSelectedPeriode(val);
                  router.push(`/dashboard/laporan?tab=pendapatan&periode=${val}`);
                }}
                className="bg-[#F6F7F9] text-xs font-bold text-[#26292E] px-3 py-1 rounded-full border border-[#E8EAEC] focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="agu_okt">Agustus 2026 s.d. Oktober 2026 (Default)</option>
                <option value="okt">Oktober 2026 Saja</option>
                <option value="semua">Sepanjang Tahun 2026</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#737A84]">Status Hunian:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2F7EC] text-[#4A6C2F] border border-[#5E8826]/30 font-bold text-xs">
                82,6% Layak Sewa
              </span>
            </div>
          </div>

          {/* 4 Kartu Ringkasan Keuangan Presisi (Wireframe Hal 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Kartu 1: Total Ditagihkan */}
            <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#737A84] tracking-wider block">
                Total Ditagihkan
              </span>
              <p className="text-2xl lg:text-3xl font-extrabold text-[#26292E] tracking-tight">
                {formatRupiah(dataLaporan.totalDitagihkan)}
              </p>
              <p className="text-xs text-[#737A84]">
                {dataLaporan.totalTagihanCount} tagihan, termasuk denda
              </p>
            </div>

            {/* Kartu 2: Total Diterima */}
            <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#737A84] tracking-wider block">
                Total Diterima
              </span>
              <p className="text-2xl lg:text-3xl font-extrabold text-emerald-600 tracking-tight">
                {formatRupiah(dataLaporan.totalDiterima)}
              </p>
              <p className="text-xs text-emerald-700 font-semibold">
                {dataLaporan.persentaseDiterima}% dari tagihan
              </p>
            </div>

            {/* Kartu 3: Tunggakan Murni */}
            <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#737A84] tracking-wider block">
                Tunggakan
              </span>
              <p className="text-2xl lg:text-3xl font-extrabold text-[#D32F2F] tracking-tight">
                {formatRupiah(dataLaporan.totalTunggakan)}
              </p>
              <p className="text-xs text-[#D32F2F] font-semibold">
                7 tagihan belum lunas
              </p>
            </div>

            {/* Kartu 4: Hunian Oktober */}
            <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#737A84] tracking-wider block">
                Hunian Oktober
              </span>
              <p className="text-2xl lg:text-3xl font-extrabold text-[#26292E] tracking-tight">
                {dataLaporan.persentaseHunianOkt}%
              </p>
              <p className="text-xs text-[#737A84]">
                19 dari 23 unit layak sewa
              </p>
            </div>
          </div>

          {/* GRID 2 KOLOM: GRAFIK BATANG & TABEL PENDAPATAN PER UNIT (WIREFRAME HAL 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Kolom Kiri: Grafik Batang Ditagihkan & Diterima per Bulan */}
            <div className="lg:col-span-5 rounded-[28px] bg-white p-6 border border-[#E8EAEC] shadow-xs space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#26292E]">
                      Ditagihkan dan Diterima per Bulan
                    </h3>
                    <span className="text-[10px] text-[#737A84]">Satuan: Juta Rupiah (Jt)</span>
                  </div>
                  {/* Legenda Grafik */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#26292E]"></span>
                      <span className="text-[11px] text-[#737A84]">Ditagihkan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#5E8826] border border-[#26292E]"></span>
                      <span className="text-[11px] text-[#737A84]">Diterima</span>
                    </div>
                  </div>
                </div>

                {/* Visual Bar Chart Interaktif */}
                <div className="h-60 flex items-end justify-between gap-4 pt-6 px-4 pb-2 border-b border-[#E8EAEC]">
                  {dataLaporan.monthlyBreakdown.map((m) => {
                    const maxVal = 40; // Skala maksimal 40 Jt
                    const hDitagihkan = Math.min(100, Math.max(8, Math.round((m.ditagihkanJt / maxVal) * 100)));
                    const hDiterima = Math.min(100, Math.max(8, Math.round((m.diterimaJt / maxVal) * 100)));

                    return (
                      <div key={m.bulanKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                        {/* Container Bar: set fixed height 180px agar percentage height anak terhitung pasti */}
                        <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-44">
                          {/* Bar Ditagihkan (Abu Tua #26292E) */}
                          <div className="flex flex-col items-center justify-end h-full w-5 sm:w-7">
                            <span className="text-[10px] font-bold text-[#26292E] mb-1 group-hover:scale-110 transition-transform select-none">
                              {m.ditagihkanJt.toFixed(1)}
                            </span>
                            <div
                              style={{ height: `${hDitagihkan}%` }}
                              className="w-full min-h-[8px] bg-[#26292E] rounded-t-md transition-all duration-500 shadow-xs"
                              title={`Ditagihkan: Rp${m.ditagihkanJt} Jt`}
                            ></div>
                          </div>

                          {/* Bar Diterima (Griya Kenanga Olive Green #5E8826) */}
                          <div className="flex flex-col items-center justify-end h-full w-5 sm:w-7">
                            <span className="text-[10px] font-bold text-emerald-800 mb-1 group-hover:scale-110 transition-transform select-none">
                              {m.diterimaJt.toFixed(1)}
                            </span>
                            <div
                              style={{ height: `${hDiterima}%` }}
                              className="w-full min-h-[8px] bg-[#5E8826] rounded-t-md transition-all duration-500 shadow-xs"
                              title={`Diterima: Rp${m.diterimaJt} Jt`}
                            ></div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#26292E] mt-3">
                          {m.bulanLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Baris Ringkasan Hunian Persis Wireframe Hal 4 */}
              <div className="pt-2 border-t border-[#F0F2F4] text-xs text-[#737A84] font-medium text-center">
                Hunian: Agu 82.6% &nbsp; Sep 82.6% &nbsp; Okt 82.6%
              </div>
            </div>

            {/* Kolom Kanan: Tabel Pendapatan per Unit (urut tunggakan) */}
            <div className="lg:col-span-7 rounded-[28px] bg-white p-6 border border-[#E8EAEC] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#26292E]">
                    Pendapatan per Unit (Urut Tunggakan)
                  </h3>
                  <p className="text-[10px] text-[#737A84]">
                    Menghitung seluruh 24 unit properti Griya Kenanga Residence
                  </p>
                </div>
                <div className="text-xs text-[#737A84] font-medium">
                  {showAllUnits ? "24 Unit Ditampilkan" : "9 dari 24 Unit"}
                </div>
              </div>

              {/* Tabel Responsif */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8EAEC] text-[#737A84] text-[10px] uppercase font-bold tracking-wider">
                      <th
                        className="py-2.5 px-3 cursor-pointer hover:text-[#26292E]"
                        onClick={() => {
                          setSortField("unit");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>Unit</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 cursor-pointer hover:text-[#26292E] text-right"
                        onClick={() => {
                          setSortField("ditagihkan");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Ditagihkan</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 cursor-pointer hover:text-[#26292E] text-right"
                        onClick={() => {
                          setSortField("diterima");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Diterima</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 cursor-pointer hover:text-[#26292E] text-right"
                        onClick={() => {
                          setSortField("tunggakan");
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        }}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Tunggakan</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F4]">
                    {displayedUnits.map((u) => (
                      <tr key={u.unit} className="hover:bg-[#F6F7F9] transition">
                        <td className="py-2.5 px-3 font-bold text-[#26292E]">
                          {u.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-[#26292E]">
                          {u.ditagihkan > 0 ? formatRupiah(u.ditagihkan) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-700">
                          {u.diterima > 0 ? formatRupiah(u.diterima) : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {u.tunggakan > 0 ? (
                            <span className="text-[#D32F2F]">
                              {formatRupiah(u.tunggakan)}
                            </span>
                          ) : (
                            <span className="text-[#737A84] font-normal">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Tabel dengan Tombol Lihat Semua (Wireframe Hal 4) */}
              <div className="pt-3 border-t border-[#E8EAEC] flex items-center justify-between text-xs text-[#737A84]">
                <span>
                  Menampilkan {displayedUnits.length} dari {sortedUnitRevenues.length} unit
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllUnits(!showAllUnits)}
                  className="font-bold text-[#26292E] hover:underline"
                >
                  {showAllUnits ? "Tampilkan 9 Unit Teratas" : "Lihat semua"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDIT LOG TERSANITASI APPEND-ONLY (PRD BAGIAN 10 BUTIR 5)          */}
      {/* ========================================================================= */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Filter Bar Audit Log */}
          <div className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#737A84]" />
                <span className="text-xs font-semibold text-[#26292E]">Filter Aksi:</span>
              </div>
              <select
                value={filterAksi}
                onChange={(e) => setFilterAksi(e.target.value)}
                className="bg-[#F6F7F9] text-xs font-medium text-[#26292E] px-3 py-1.5 rounded-full border border-[#E8EAEC] focus:outline-none"
              >
                <option value="semua">Semua Aksi</option>
                <option value="identitas">Verifikasi / Penolakan Identitas</option>
                <option value="kontrak">Aktivasi / Penyelesaian / Pengakhiran Kontrak</option>
                <option value="pembayaran">Pencatatan / Pembatalan Pembayaran</option>
                <option value="tagihan">Pembuatan / Pembatalan Tagihan</option>
                <option value="unit">Perubahan Harga &amp; Status Unit</option>
                <option value="peran">Perubahan Peran Akun</option>
                <option value="kerusakan">Laporan Kerusakan Unit</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#26292E]">Tanggal:</span>
              <input
                type="date"
                value={filterTanggal}
                onChange={(e) => setFilterTanggal(e.target.value)}
                className="bg-[#F6F7F9] text-xs font-medium text-[#26292E] px-3 py-1.5 rounded-full border border-[#E8EAEC] focus:outline-none"
              />
              {filterTanggal && (
                <button
                  type="button"
                  onClick={() => setFilterTanggal("")}
                  className="text-xs font-bold text-[#D32F2F] hover:underline px-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Daftar Audit Log Tersanitasi */}
          <div className="rounded-[28px] bg-white p-6 border border-[#E8EAEC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#26292E]">
                  Riwayat Audit Aktivitas (Append-Only)
                </h3>
                <p className="text-[10px] text-[#737A84]">
                  Sanitasi PRD Bagian 10 butir 5: Seluruh data NIK dan URL foto KTP tidak disimpan maupun ditampilkan.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F6F7F9] text-xs font-bold text-[#26292E]">
                {filteredAuditLogs.length} Aktivitas
              </span>
            </div>

            <div className="divide-y divide-[#F0F2F4]">
              {filteredAuditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#737A84]">
                  Tidak ada catatan audit yang sesuai dengan filter yang dipilih.
                </div>
              ) : (
                filteredAuditLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div key={log.id} className="py-3.5 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1C1E22] text-[#88BC3C] border border-[#5E8826]/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {log.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-[#26292E]">
                                {log.aksi}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#F6F7F9] text-[10px] font-semibold text-[#737A84] border border-[#E8EAEC]">
                                Tabel: {log.tabel}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#737A84]">
                              Oleh: <strong className="text-[#26292E]">{log.pelaku_nama}</strong> ({log.pelaku_peran}) • {formatTanggalIndo(log.dibuat_pada)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-[11px] font-semibold text-[#26292E] hover:underline self-end sm:self-center flex items-center gap-1"
                        >
                          <span>{isExpanded ? "Tutup Detail" : "Lihat Perubahan"}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>

                      {/* Detail Sebelum vs Sesudah Tersanitasi */}
                      {isExpanded && (
                        <div className="mt-2 p-3.5 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] grid sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
                          <div>
                            <span className="text-[10px] font-bold text-[#737A84] uppercase block mb-1">
                              Sebelum:
                            </span>
                            <pre className="p-2.5 rounded-xl bg-white border border-[#E8EAEC] text-[11px] font-mono overflow-x-auto text-[#26292E]">
                              {JSON.stringify(log.sebelum || { status: "-" }, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                              Sesudah:
                            </span>
                            <pre className="p-2.5 rounded-xl bg-white border border-[#E8EAEC] text-[11px] font-mono overflow-x-auto text-emerald-950">
                              {JSON.stringify(log.sesudah || { status: "-" }, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PENGATURAN PERAN AKUN                                              */}
      {/* ========================================================================= */}
      {activeTab === "pengaturan" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Kebijakan Perubahan Peran Akun:</strong>
              <p className="mt-0.5 text-amber-800">
                Pemilik memiliki wewenang mengangkat atau mengubah peran staf pengelola dan penyewa.
                Namun, <strong>Pemilik tidak dapat mengubah peran akunnya sendiri</strong> untuk menjamin kontinuitas hak kontrol tertinggi sistem.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 border border-[#E8EAEC] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#26292E]">
                  Manajemen Pengguna &amp; Peran Sistem
                </h3>
                <p className="text-[10px] text-[#737A84]">
                  Total {usersList.length} pengguna terdaftar di Griya Kenanga Residence
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8EAEC] text-[#737A84] text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-3">Nama Lengkap</th>
                    <th className="py-3 px-3">Email Akun</th>
                    <th className="py-3 px-3">Peran Saat Ini</th>
                    <th className="py-3 px-3 text-right">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F4]">
                  {usersList.map((user) => {
                    const isSelf = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                    const isOwner = user.peran === "pemilik";

                    return (
                      <tr key={user.id} className="hover:bg-[#F6F7F9] transition">
                        <td className="py-3 px-3 font-bold text-[#26292E]">
                          <div className="flex items-center gap-2">
                            <span>{user.nama_lengkap}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-[#1C1E22] text-[#88BC3C] border border-[#5E8826]/30 font-bold text-[9px] uppercase">
                                Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#737A84] font-mono text-[11px]">
                          {user.email}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              user.peran === "pemilik"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : user.peran === "pengelola"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : "bg-[#F6F7F9] text-[#26292E] border border-[#E8EAEC]"
                            }`}
                          >
                            {user.peran}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isOwner || isSelf ? (
                            <span className="text-[10px] text-[#737A84] italic">
                              Terkunci
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setTargetNewRole(
                                  user.peran === "pengelola" ? "penyewa" : "pengelola"
                                );
                                setRoleFeedback(null);
                                setRoleModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-[11px] font-semibold transition"
                            >
                              Ubah Peran
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH PERAN PENGGUNA */}
      {roleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider">
                  Pengaturan Peran Akun
                </span>
                <h3 className="text-base font-bold text-[#26292E]">
                  Ubah Peran: {selectedUser.nama_lengkap}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#26292E] flex items-center justify-center transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#737A84]">
              Email: <strong className="text-[#26292E]">{selectedUser.email}</strong>. Peran saat ini adalah{" "}
              <strong className="uppercase text-[#26292E]">{selectedUser.peran}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#26292E] block">
                Pilih Peran Baru:
              </label>
              <select
                value={targetNewRole}
                onChange={(e) => setTargetNewRole(e.target.value as "pengelola" | "penyewa")}
                className="w-full bg-[#F6F7F9] text-xs font-semibold text-[#26292E] p-2.5 rounded-xl border border-[#E8EAEC] focus:outline-none"
              >
                <option value="pengelola">Pengelola (Bisa verifikasi, buat tagihan, catat bayar)</option>
                <option value="penyewa">Penyewa (Akses kamar, bayar online, buat laporan)</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFE8A3] text-xs text-[#8A6D14]">
              <strong>Perhatian Pemilik:</strong> Mengubah peran akun akan langsung memengaruhi hak akses modul operasional dan batasan Row Level Security (RLS) di database.
            </div>

            {roleFeedback && (
              <AlertBanner
                statusCode={roleFeedback.statusCode}
                message={roleFeedback.message}
                onDismiss={() => setRoleFeedback(null)}
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPendingRole}
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPendingRole}
                onClick={handleConfirmRoleChange}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {isPendingRole ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan Peran</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
