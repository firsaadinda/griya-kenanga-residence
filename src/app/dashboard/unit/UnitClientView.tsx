"use client";

import React, { useState, useTransition } from "react";
import { UserRole } from "@/lib/auth/guard";
import { updateUnitStatusAction, updateUnitHargaAction } from "@/lib/actions/unit-actions";
import {
  Building2,
  Check,
  AlertCircle,
  Edit2,
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Home,
  User,
  Layers,
} from "lucide-react";

export interface UnitItem {
  id: string;
  kode: string;
  lantai: number;
  tipe: "standar" | "ac" | "studio";
  luas_m2: number;
  harga_sewa_bulanan: number;
  status: "tersedia" | "perbaikan" | "nonaktif";
  keterangan?: string | null;
  kontrak_id?: string | null;
  kontrak_nomor?: string | null;
  penyewa_nama?: string | null;
  penyewa_email?: string | null;
}

interface UnitClientViewProps {
  initialUnits: UnitItem[];
  userRole: UserRole;
}

export function UnitClientView({ initialUnits, userRole }: UnitClientViewProps) {
  const [units, setUnits] = useState<UnitItem[]>(initialUnits);
  const [filterLantai, setFilterLantai] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedUnit, setSelectedUnit] = useState<UnitItem | null>(null);
  const [modalMode, setModalMode] = useState<"status" | "harga" | null>(null);
  const [newStatus, setNewStatus] = useState<"tersedia" | "perbaikan" | "nonaktif">("tersedia");
  const [newHarga, setNewHarga] = useState<number>(0);
  const [keterangan, setKeterangan] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter Units
  const filteredUnits = units.filter((u) => {
    if (filterLantai !== "all" && u.lantai !== filterLantai) return false;
    if (filterStatus !== "all" && u.status !== filterStatus) return false;
    if (
      searchQuery &&
      !u.kode.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(u.penyewa_nama && u.penyewa_nama.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const openStatusModal = (unit: UnitItem) => {
    setSelectedUnit(unit);
    setNewStatus(unit.status);
    setKeterangan(unit.keterangan || "");
    setFeedback(null);
    setModalMode("status");
  };

  const openHargaModal = (unit: UnitItem) => {
    setSelectedUnit(unit);
    setNewHarga(unit.harga_sewa_bulanan);
    setFeedback(null);
    setModalMode("harga");
  };

  const closeModal = () => {
    setSelectedUnit(null);
    setModalMode(null);
    setFeedback(null);
  };

  const handleSaveStatus = () => {
    if (!selectedUnit) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await updateUnitStatusAction({
        unitId: selectedUnit.id,
        status: newStatus,
        keterangan: keterangan.trim() || undefined,
      });

      if (res.success) {
        setUnits((prev) =>
          prev.map((item) =>
            item.id === selectedUnit.id
              ? { ...item, status: newStatus, keterangan: keterangan.trim() || null }
              : item
          )
        );
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => closeModal(), 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  const handleSaveHarga = () => {
    if (!selectedUnit) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await updateUnitHargaAction({
        unitId: selectedUnit.id,
        hargaSewaBulanan: Number(newHarga),
      });

      if (res.success) {
        setUnits((prev) =>
          prev.map((item) =>
            item.id === selectedUnit.id
              ? { ...item, harga_sewa_bulanan: Number(newHarga) }
              : item
          )
        );
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => closeModal(), 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* FILTER & PENCARIAN ATAS */}
      <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Filter Lantai */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-[#737A84] uppercase tracking-wider mr-2 shrink-0">
            Lantai:
          </span>
          {[
            { id: "all", label: "Semua (24)" },
            { id: 1, label: "Lantai 1 • Standar (8)" },
            { id: 2, label: "Lantai 2 • AC (8)" },
            { id: 3, label: "Lantai 3 • Studio (8)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterLantai(tab.id as number | "all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filterLantai === tab.id
                  ? "bg-[#26292E] text-white shadow-sm"
                  : "bg-[#F6F7F9] text-[#737A84] hover:bg-[#E8EAEC] hover:text-[#26292E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Status & Search Input */}
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-[#F6F7F9] text-xs font-medium text-[#26292E] border border-[#E8EAEC] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="perbaikan">Perbaikan</option>
            <option value="nonaktif">Nonaktif</option>
          </select>

          <input
            type="text"
            placeholder="Cari kode unit / nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none w-44 sm:w-56"
          />
        </div>
      </div>

      {/* GRID 24 UNIT KOS & STUDIO (MONTE X TERRA STYLING) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUnits.map((u) => {
          const isLantai1 = u.lantai === 1;
          const isLantai2 = u.lantai === 2;
          const isLantai3 = u.lantai === 3;

          const statusColor =
            u.status === "tersedia"
              ? "bg-[#EAFCD6] text-[#2F6B12] border-[#C8F296]"
              : u.status === "perbaikan"
              ? "bg-[#FFF4E5] text-[#9A5B08] border-[#FFE2BA]"
              : "bg-[#F1F3F5] text-[#555A61] border-[#E0E3E6]";

          return (
            <div
              key={u.id}
              className="relative rounded-[28px] bg-white p-3.5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Wadah Visual Arsitektur dengan Lekukan Asimetris & Notch Monte x Terra */}
              <div className="relative w-full h-44 rounded-[22px] overflow-hidden bg-[#26292E] flex flex-col justify-between p-3.5">
                {/* SVG Visual Interior / Gedung Berdasarkan Tipe */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1C1E22] via-[#2A2E35] to-[#3B4049]">
                  <svg className="w-full h-full opacity-25" viewBox="0 0 300 180" fill="none">
                    {isLantai1 && (
                      <>
                        <rect x="30" y="40" width="80" height="120" stroke="#FFFFFF" strokeWidth="1.5" />
                        <rect x="130" y="20" width="140" height="140" rx="8" stroke="#D2F367" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx="200" cy="90" r="25" fill="#D2F367" fillOpacity="0.2" />
                      </>
                    )}
                    {isLantai2 && (
                      <>
                        <rect x="20" y="25" width="120" height="130" stroke="#FFFFFF" strokeWidth="1.5" />
                        <rect x="160" y="30" width="110" height="60" rx="6" stroke="#D2F367" strokeWidth="2" />
                        <line x1="170" y1="60" x2="260" y2="60" stroke="#D2F367" strokeWidth="2" strokeDasharray="4 2" />
                      </>
                    )}
                    {isLantai3 && (
                      <>
                        <rect x="25" y="15" width="250" height="150" rx="10" stroke="#D2F367" strokeWidth="2" />
                        <rect x="50" y="45" width="90" height="100" fill="#FFFFFF" fillOpacity="0.15" />
                        <circle cx="210" cy="70" r="18" fill="#D2F367" fillOpacity="0.3" />
                      </>
                    )}
                  </svg>
                </div>

                {/* Baris Atas Wadah Gambar: Kode Unit & Badge Status */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#26292E] shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#D2F367]" />
                    {u.kode}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColor}`}
                  >
                    {u.status}
                  </span>
                </div>

                {/* Baris Bawah Wadah Gambar: Badge Harga Hijau Muda (#D2F367) */}
                <div className="relative z-10 flex items-end justify-between">
                  <div>
                    <span className="block text-[10px] text-[#A6ABB2] uppercase font-semibold">
                      Blok {u.kode[0]} • Lt {u.lantai} ({u.tipe.toUpperCase()})
                    </span>
                    <span className="text-xs font-medium text-white/90">
                      Luas: {u.luas_m2} m²
                    </span>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-[#D2F367] text-[#1C1E22] text-xs font-bold tracking-tight shadow-sm">
                    Rp{(u.harga_sewa_bulanan / 1000).toLocaleString("id-ID")} rb/bln
                  </span>
                </div>
              </div>

              {/* INFORMASI PENYEWA & KONTRAK */}
              <div className="pt-3.5 px-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#737A84] uppercase tracking-wider">
                    Penyewa Saat Ini:
                  </span>
                  {u.penyewa_nama ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#26292E] bg-[#F6F7F9] px-2.5 py-0.5 rounded-full border border-[#E8EAEC]">
                      <User className="w-3 h-3 text-[#737A84]" />
                      {u.penyewa_nama}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#A6ABB2] italic">
                      Kosong (Belum ada)
                    </span>
                  )}
                </div>

                {u.keterangan && (
                  <p className="text-[11px] text-[#737A84] bg-[#F6F7F9] p-2 rounded-xl line-clamp-2">
                    {u.keterangan}
                  </p>
                )}

                {/* TOMBOL AKSI BERDASARKAN PERAN (PENGELOLA: STATUS, PEMILIK: HARGA) */}
                <div className="pt-2 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                  {userRole === "pengelola" && (
                    <button
                      type="button"
                      onClick={() => openStatusModal(u)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] transition"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#737A84]" />
                      <span>Ubah Status</span>
                    </button>
                  )}

                  {userRole === "pemilik" && (
                    <>
                      <button
                        type="button"
                        onClick={() => openHargaModal(u)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#D2F367]" />
                        <span>Ubah Harga</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL UBAH STATUS (PENGELOLA - BR-04) */}
      {modalMode === "status" && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Operasional Unit [BR-04]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">
                  Ubah Status Unit {selectedUnit.kode}
                </h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#F6F7F9] text-[#26292E] flex items-center justify-center font-bold text-xs">
                {selectedUnit.kode}
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-[#EAFCD6] text-[#2F6B12] border border-[#C8F296]"
                    : "bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2]"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Status Baru:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["tersedia", "perbaikan", "nonaktif"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`px-3 py-2 rounded-2xl text-xs font-semibold capitalize border transition ${
                        newStatus === st
                          ? "bg-[#26292E] text-white border-[#26292E] shadow-sm"
                          : "bg-[#F6F7F9] text-[#737A84] border-[#E8EAEC] hover:bg-[#E8EAEC]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === "nonaktif" && (
                <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFE8A3] text-xs text-[#8A6D14] space-y-1">
                  <strong>Peringatan BR-04:</strong>
                  <p>
                    Unit yang masih memiliki kontrak draf atau aktif <strong>dilarang</strong> dinonaktifkan.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Keterangan / Alasan (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Perbaikan atap bocor sampai akhir Oktober..."
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL UBAH HARGA SEWA (PEMILIK - BR-04) */}
      {modalMode === "harga" && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Kebijakan Tarif [BR-04]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">
                  Ubah Harga Unit {selectedUnit.kode}
                </h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#D2F367] text-[#1C1E22] flex items-center justify-center font-bold text-xs">
                Rp
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-[#EAFCD6] text-[#2F6B12] border border-[#C8F296]"
                    : "bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2]"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs text-[#737A84]">
                Harga saat ini:{" "}
                <strong className="text-[#26292E]">
                  Rp{selectedUnit.harga_sewa_bulanan.toLocaleString("id-ID")}
                </strong>
                <p className="mt-1 text-[11px]">
                  <strong>Catatan BR-04:</strong> Harga pada kontrak yang sudah dibuat tetap terkunci dan tidak ikut berubah.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Harga Sewa Bulanan Baru (Rp):
                </label>
                <input
                  type="number"
                  step="50000"
                  min="500000"
                  value={newHarga}
                  onChange={(e) => setNewHarga(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-sm font-semibold text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveHarga}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Menyimpan..." : "Simpan Harga Baru"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
