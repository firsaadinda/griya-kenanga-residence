"use client";

import React, { useState, useTransition } from "react";
import { UserRole } from "@/lib/auth/guard";
import {
  buatKontrakAction,
  aktifkanKontrakAction,
  batalkanKontrakDrafAction,
  selesaikanKontrakAction,
  akhiriKontrakAction,
} from "@/lib/actions/kontrak-actions";
import {
  FileText,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building,
  User,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export interface KontrakItem {
  id: string;
  nomor: string;
  status: "draf" | "aktif" | "selesai" | "diakhiri" | "dibatalkan";
  tanggal_mulai: string;
  durasi_bulan: number;
  tanggal_selesai: string;
  harga_sewa_bulanan: number;
  alasan_berakhir?: string | null;
  tanggal_berakhir_aktual?: string | null;
  unit_kode: string;
  lantai: number;
  unit_tipe: string;
  penyewa_id: string;
  penyewa_nama: string;
  penyewa_email: string;
  tagihan_belum_lunas_count: number;
}

export interface UnitOption {
  id: string;
  kode: string;
  harga_sewa_bulanan: number;
  status: string;
}

export interface PenyewaOption {
  id: string;
  nama_lengkap: string;
  email: string;
  status_verifikasi: string;
}

interface KontrakClientViewProps {
  initialKontrak: KontrakItem[];
  availableUnits: UnitOption[];
  availablePenyewa: PenyewaOption[];
  userRole: UserRole;
}

export function KontrakClientView({
  initialKontrak,
  availableUnits,
  availablePenyewa,
  userRole,
}: KontrakClientViewProps) {
  const [kontrakList, setKontrakList] = useState<KontrakItem[]>(initialKontrak);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBlok, setFilterBlok] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Buat Kontrak Baru
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedPenyewaId, setSelectedPenyewaId] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("2026-11-01"); // Default awal bulan
  const [durasiBulan, setDurasiBulan] = useState<1 | 3 | 6 | 12>(6);

  // Modal Akhiri Kontrak (Pemilik)
  const [isAkhiriOpen, setIsAkhiriOpen] = useState(false);
  const [activeKontrakTarget, setActiveKontrakTarget] = useState<KontrakItem | null>(null);
  const [alasanBerakhir, setAlasanBerakhir] = useState("");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter Kontrak
  const filteredList = kontrakList.filter((k) => {
    if (filterStatus !== "all" && k.status !== filterStatus) return false;
    if (filterBlok !== "all" && !k.unit_kode.startsWith(filterBlok)) return false;
    if (
      searchQuery &&
      !k.nomor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !k.penyewa_nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !k.unit_kode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Action: Buat Kontrak Baru (Pengelola)
  const handleCreateContract = () => {
    if (!selectedUnitId || !selectedPenyewaId) {
      setFeedback({ type: "error", message: "Silakan pilih unit dan penyewa terlebih dahulu." });
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      const res = await buatKontrakAction({
        unitId: selectedUnitId,
        penyewaId: selectedPenyewaId,
        tanggalMulai,
        durasiBulan,
      });

      if (res.success && res.data) {
        setFeedback({ type: "success", message: res.message });
        const selectedU = availableUnits.find((u) => u.id === selectedUnitId);
        const selectedP = availablePenyewa.find((p) => p.id === selectedPenyewaId);

        const newKontrakItem: KontrakItem = {
          id: (res.data as any).id,
          nomor: (res.data as any).nomor,
          status: "draf",
          tanggal_mulai: (res.data as any).tanggal_mulai,
          durasi_bulan: (res.data as any).durasi_bulan,
          tanggal_selesai: (res.data as any).tanggal_selesai,
          harga_sewa_bulanan: (res.data as any).harga_sewa_bulanan,
          unit_kode: selectedU?.kode || "-",
          lantai: selectedU?.kode.startsWith("A") ? 1 : selectedU?.kode.startsWith("B") ? 2 : 3,
          unit_tipe: selectedU?.kode.startsWith("A") ? "standar" : selectedU?.kode.startsWith("B") ? "ac" : "studio",
          penyewa_id: selectedPenyewaId,
          penyewa_nama: selectedP?.nama_lengkap || "-",
          penyewa_email: selectedP?.email || "-",
          tagihan_belum_lunas_count: 0,
        };

        setKontrakList((prev) => [newKontrakItem, ...prev]);
        setTimeout(() => {
          setIsCreateOpen(false);
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Action: Aktifkan Kontrak (Pengelola)
  const handleAktifkan = (k: KontrakItem) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await aktifkanKontrakAction(k.id);
      if (res.success) {
        setKontrakList((prev) =>
          prev.map((item) => (item.id === k.id ? { ...item, status: "aktif" } : item))
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Action: Batalkan Kontrak Draf (Pengelola)
  const handleBatalkan = (k: KontrakItem) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await batalkanKontrakDrafAction(k.id);
      if (res.success) {
        setKontrakList((prev) =>
          prev.map((item) => (item.id === k.id ? { ...item, status: "dibatalkan" } : item))
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Action: Selesaikan Kontrak (Pengelola)
  const handleSelesaikan = (k: KontrakItem) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await selesaikanKontrakAction(k.id);
      if (res.success) {
        setKontrakList((prev) =>
          prev.map((item) => (item.id === k.id ? { ...item, status: "selesai" } : item))
        );
        setFeedback({ type: "success", message: res.message });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Action: Akhiri Kontrak Lebih Awal (Pemilik)
  const handleAkhiri = () => {
    if (!activeKontrakTarget) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await akhiriKontrakAction({
        kontrakId: activeKontrakTarget.id,
        alasanBerakhir,
      });
      if (res.success) {
        setKontrakList((prev) =>
          prev.map((item) =>
            item.id === activeKontrakTarget.id
              ? { ...item, status: "diakhiri", alasan_berakhir: alasanBerakhir }
              : item
          )
        );
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          setIsAkhiriOpen(false);
          setActiveKontrakTarget(null);
        }, 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* FILTER, PENCARIAN, & TOMBOL BUAT KONTRAK */}
      <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Status Kontrak */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-[#737A84] uppercase tracking-wider mr-2 shrink-0">
            Status:
          </span>
          {[
            { id: "all", label: "Semua" },
            { id: "aktif", label: "Aktif" },
            { id: "draf", label: "Draf" },
            { id: "selesai", label: "Selesai" },
            { id: "diakhiri", label: "Diakhiri" },
            { id: "dibatalkan", label: "Dibatalkan" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? "bg-[#26292E] text-white shadow-sm"
                  : "bg-[#F6F7F9] text-[#737A84] hover:bg-[#E8EAEC] hover:text-[#26292E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Blok & Tombol Buat Kontrak */}
        <div className="flex items-center gap-3">
          <select
            value={filterBlok}
            onChange={(e) => setFilterBlok(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-[#F6F7F9] text-xs font-medium text-[#26292E] border border-[#E8EAEC] focus:outline-none"
          >
            <option value="all">Semua Blok</option>
            <option value="A">Blok A (Lt 1)</option>
            <option value="B">Blok B (Lt 2)</option>
            <option value="C">Blok C (Lt 3)</option>
          </select>

          <input
            type="text"
            placeholder="Cari nomor / unit / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none w-48 sm:w-56"
          />

          {userRole === "pengelola" && (
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(true);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Kontrak Baru</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-[#EAFCD6] text-[#2F6B12] border border-[#C8F296]"
              : "bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2]"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* DAFTAR KARTU KONTRAK BERGAYA MONTE X TERRA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((k) => {
          const isAktif = k.status === "aktif";
          const isDraf = k.status === "draf";
          const isSelesai = k.status === "selesai";
          const isDiakhiri = k.status === "diakhiri";
          const isDibatalkan = k.status === "dibatalkan";

          const statusBadge = isAktif
            ? "bg-[#EAFCD6] text-[#2F6B12] border-[#C8F296]"
            : isDraf
            ? "bg-[#FFF9E6] text-[#8A6D14] border-[#FFE8A3]"
            : isSelesai
            ? "bg-[#F1F3F5] text-[#555A61] border-[#E0E3E6]"
            : "bg-[#FFF0F0] text-[#D32F2F] border-[#FFCDD2]";

          return (
            <div
              key={k.id}
              className="rounded-[28px] bg-white p-5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.04)] hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Kontrak: Nomor & Badge Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#737A84] tracking-wider uppercase">
                      Kontrak Perjanjian Sewa
                    </span>
                    <h3 className="text-base font-bold text-[#26292E] font-mono leading-tight">
                      {k.nomor}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge}`}
                  >
                    {k.status}
                  </span>
                </div>

                {/* Detail Unit, Penyewa, dan Periode Sewa */}
                <div className="rounded-2xl bg-[#F6F7F9] p-3.5 space-y-2 border border-[#E8EAEC] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">Unit Properti:</span>
                    <strong className="text-[#26292E]">
                      {k.unit_kode} (Lantai {k.lantai} • {k.unit_tipe.toUpperCase()})
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">Penyewa:</span>
                    <span className="text-[#26292E] font-semibold">{k.penyewa_nama}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">Durasi Sewa:</span>
                    <span className="text-[#26292E] font-medium">{k.durasi_bulan} Bulan</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">Periode:</span>
                    <span className="text-[#26292E] font-medium">
                      {k.tanggal_mulai} s.d. {k.tanggal_selesai}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-[#E8EAEC] flex items-center justify-between">
                    <span className="text-[#737A84]">Harga Sewa Terkunci:</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D2F367] text-[#1C1E22] text-[11px] font-bold">
                      Rp{(k.harga_sewa_bulanan / 1000).toLocaleString("id-ID")} rb/bln
                    </span>
                  </div>

                  {k.alasan_berakhir && (
                    <div className="p-2 rounded-xl bg-[#FFF0F0] text-[11px] text-[#D32F2F] border border-[#FFCDD2]">
                      <strong>Alasan Diakhiri:</strong> {k.alasan_berakhir}
                    </div>
                  )}
                </div>
              </div>

              {/* TOMBOL AKSI ALUR STATUS KONTRAK */}
              <div className="pt-2 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                {/* 1. Pengelola: draf -> aktif ATAU draf -> dibatalkan */}
                {userRole === "pengelola" && isDraf && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAktifkan(k)}
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D2F367]" />
                      <span>Aktifkan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBatalkan(k)}
                      disabled={isPending}
                      className="px-3 py-2 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-semibold border border-[#FFCDD2] transition disabled:opacity-50"
                    >
                      Batalkan
                    </button>
                  </>
                )}

                {/* 2. Pengelola: aktif -> selesai (BR-05) */}
                {userRole === "pengelola" && isAktif && (
                  <button
                    type="button"
                    onClick={() => handleSelesaikan(k)}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-xs font-semibold border border-[#E8EAEC] transition disabled:opacity-50"
                  >
                    <span>Selesaikan Kontrak (BR-05)</span>
                  </button>
                )}

                {/* 3. Pemilik: aktif -> diakhiri lebih awal (BR-05) */}
                {userRole === "pemilik" && isAktif && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveKontrakTarget(k);
                      setAlasanBerakhir("");
                      setIsAkhiriOpen(true);
                      setFeedback(null);
                    }}
                    disabled={isPending}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-semibold border border-[#FFCDD2] transition disabled:opacity-50"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Akhiri Lebih Awal</span>
                  </button>
                )}

                {/* Status Selesai, Diakhiri, Dibatalkan adalah Status Akhir */}
                {(isSelesai || isDiakhiri || isDibatalkan) && (
                  <span className="w-full text-center text-[11px] text-[#A6ABB2] italic py-1">
                    Status Akhir (Permanen)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL BUAT KONTRAK BARU (PENGELOLA) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Perjanjian Sewa Baru [BR-01 s/d BR-04]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">Buat Kontrak Baru</h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#1C1E22] text-[#D2F367] flex items-center justify-center font-bold text-xs">
                KTR
              </span>
            </div>

            <div className="space-y-4">
              {/* Pilihan Unit Tersedia (BR-04) */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Pilih Unit (Hanya Unit Berstatus Tersedia):
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                >
                  <option value="">-- Pilih Unit --</option>
                  {availableUnits
                    .filter((u) => u.status === "tersedia")
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        Unit {u.kode} (Rp{u.harga_sewa_bulanan.toLocaleString("id-ID")}/bln)
                      </option>
                    ))}
                </select>
              </div>

              {/* Pilihan Penyewa */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Pilih Calon Penyewa:
                </label>
                <select
                  value={selectedPenyewaId}
                  onChange={(e) => setSelectedPenyewaId(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                >
                  <option value="">-- Pilih Penyewa --</option>
                  {availablePenyewa.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_lengkap} ({p.status_verifikasi === "terverifikasi" ? "✓ KTP Terverifikasi" : "Belum Verifikasi"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai: Wajib Tgl 1 (BR-02) */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Tanggal Mulai Sewa (Wajib Tanggal 1):
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs font-medium text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                />
              </div>

              {/* Durasi Sewa: 1, 3, 6, 12 Bulan (BR-02) */}
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Durasi Sewa:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 3, 6, 12] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurasiBulan(d)}
                      className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition ${
                        durasiBulan === d
                          ? "bg-[#26292E] text-white border-[#26292E] shadow-sm"
                          : "bg-[#F6F7F9] text-[#737A84] border-[#E8EAEC] hover:bg-[#E8EAEC]"
                      }`}
                    >
                      {d} Bln
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateContract}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Draf Kontrak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AKHIRI KONTRAK LEBIH AWAL (PEMILIK - BR-05) */}
      {isAkhiriOpen && activeKontrakTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest">
                  Pengakhiran Kontrak [BR-05]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">
                  Akhiri Kontrak {activeKontrakTarget.nomor}
                </h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#FFF0F0] text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                !
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFE8A3] text-xs text-[#8A6D14]">
              <strong>Perhatian Pemilik:</strong> Pengakhiran lebih awal berlaku s.d. akhir bulan berjalan dan wajib menyertakan alasan tertulis.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Alasan Pengakhiran (Wajib):
              </label>
              <textarea
                rows={3}
                value={alasanBerakhir}
                onChange={(e) => setAlasanBerakhir(e.target.value)}
                placeholder="Contoh: Penyewa pindah tugas kerja ke luar kota..."
                className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAkhiriOpen(false);
                  setActiveKontrakTarget(null);
                }}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAkhiri}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Konfirmasi Pengakhiran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
