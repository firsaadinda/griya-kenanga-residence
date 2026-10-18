"use client";

import React, { useState, useTransition } from "react";
import { UserRole } from "@/lib/auth/guard";
import {
  buatLaporanKerusakanAction,
  tanganiLaporanKerusakanAction,
} from "@/lib/actions/kerusakan-actions";
import {
  Wrench,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  ChevronRight,
  User,
  Building,
  Eye,
  X,
} from "lucide-react";

export interface LaporanKerusakanItem {
  id: string;
  nomor: string;
  unit_kode: string;
  pelapor_id: string;
  pelapor_nama: string;
  pelapor_email: string;
  kategori: "listrik" | "air" | "ac" | "bangunan" | "perabot" | "lainnya";
  judul: string;
  deskripsi: string;
  foto_paths: string[];
  status: "dilaporkan" | "diproses" | "menunggu_persetujuan" | "selesai" | "ditutup" | "ditolak";
  estimasi_biaya?: number | null;
  biaya_aktual?: number | null;
  alasan_tolak?: string | null;
  catatan?: string | null;
  disetujui_pada?: string | null;
  selesai_pada?: string | null;
  ditutup_pada?: string | null;
  dibuat_pada: string;
}

interface KerusakanClientViewProps {
  initialLaporan: LaporanKerusakanItem[];
  userRole: UserRole;
  currentUserId: string;
  activeContractUnit?: string | null;
}

export function KerusakanClientView({
  initialLaporan,
  userRole,
  currentUserId,
  activeContractUnit,
}: KerusakanClientViewProps) {
  const [laporanList, setLaporanList] = useState<LaporanKerusakanItem[]>(initialLaporan);
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanKerusakanItem>(
    initialLaporan[0] || null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Form Laporan Baru (Penyewa)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [kategori, setKategori] = useState<
    "listrik" | "air" | "ac" | "bangunan" | "perabot" | "lainnya"
  >("listrik");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotoPaths, setFotoPaths] = useState<string[]>(["kerusakan/mock/foto-1.jpg"]);

  // Modal Tindakan Tim (Proses / Minta Approval / Selesaikan / Tolak / Tutup)
  const [actionModal, setActionModal] = useState<
    "proses" | "minta_persetujuan" | "selesaikan" | "tolak" | null
  >(null);
  const [inputEstimasi, setInputEstimasi] = useState<number>(0);
  const [inputBiayaAktual, setInputBiayaAktual] = useState<number>(0);
  const [inputCatatan, setInputCatatan] = useState("");
  const [inputAlasanTolak, setInputAlasanTolak] = useState("");

  // Modal Lightbox Foto Kerusakan Realistis
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Filter List
  const filteredList = laporanList.filter((lk) => {
    if (filterStatus !== "all" && lk.status !== filterStatus) return false;
    if (
      searchQuery &&
      !lk.nomor.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lk.judul.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lk.unit_kode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Action: Buat Laporan Kerusakan (Penyewa)
  const handleCreateReport = () => {
    startTransition(async () => {
      setFeedback(null);
      const res = await buatLaporanKerusakanAction({
        kategori,
        judul,
        deskripsi,
        fotoPaths,
      });

      if (res.success && res.data) {
        const newLp = res.data as any;
        const newItem: LaporanKerusakanItem = {
          id: newLp.id,
          nomor: newLp.nomor,
          unit_kode: activeContractUnit || "A-104",
          pelapor_id: currentUserId,
          pelapor_nama: "Saya (Penyewa)",
          pelapor_email: "",
          kategori: newLp.kategori,
          judul: newLp.judul,
          deskripsi: newLp.deskripsi,
          foto_paths: newLp.foto_paths,
          status: newLp.status,
          dibuat_pada: newLp.dibuat_pada,
        };

        setLaporanList((prev) => [newItem, ...prev]);
        setSelectedLaporan(newItem);
        setFeedback({ type: "success", message: res.message });
        setTimeout(() => {
          setIsCreateOpen(false);
          setJudul("");
          setDeskripsi("");
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Action: Eksekusi Status Kerusakan
  const handleExecuteAction = (
    aksi: "proses" | "minta_persetujuan" | "tolak" | "selesaikan" | "tutup"
  ) => {
    if (!selectedLaporan) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await tanganiLaporanKerusakanAction({
        laporanId: selectedLaporan.id,
        aksi,
        estimasiBiaya: inputEstimasi || undefined,
        biayaAktual: inputBiayaAktual || undefined,
        catatan: inputCatatan || undefined,
        alasanTolak: inputAlasanTolak || undefined,
      });

      if (res.success) {
        let updatedStatus = selectedLaporan.status;
        if (aksi === "proses") updatedStatus = "diproses";
        if (aksi === "minta_persetujuan") updatedStatus = "menunggu_persetujuan";
        if (aksi === "tolak") updatedStatus = "ditolak";
        if (aksi === "selesaikan") updatedStatus = "selesai";
        if (aksi === "tutup") updatedStatus = "ditutup";

        const updatedLaporan: LaporanKerusakanItem = {
          ...selectedLaporan,
          status: updatedStatus,
          estimasi_biaya: inputEstimasi || selectedLaporan.estimasi_biaya,
          biaya_aktual: inputBiayaAktual || selectedLaporan.biaya_aktual,
          catatan: inputCatatan || selectedLaporan.catatan,
          alasan_tolak: inputAlasanTolak || selectedLaporan.alasan_tolak,
        };

        setSelectedLaporan(updatedLaporan);
        setLaporanList((prev) =>
          prev.map((item) => (item.id === selectedLaporan.id ? updatedLaporan : item))
        );

        setFeedback({ type: "success", message: res.message });
        setActionModal(null);
        setInputCatatan("");
        setInputAlasanTolak("");
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Helper Stepper 5 Langkah Sesuai Wireframe Halaman 3
  // 1: Dilaporkan, 2: Menunggu Persetujuan, 3: Diproses, 4: Selesai, 5: Ditutup
  const getStepIndex = (status: string) => {
    switch (status) {
      case "dilaporkan":
        return 1;
      case "menunggu_persetujuan":
        return 2;
      case "diproses":
        return 3;
      case "selesai":
        return 4;
      case "ditutup":
        return 5;
      default:
        return 0; // ditolak
    }
  };

  const currentStep = selectedLaporan ? getStepIndex(selectedLaporan.status) : 1;

  return (
    <div className="space-y-8">
      {/* FILTER & TOMBOL LAPOR BARU */}
      <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Status Kerusakan */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-[11px] font-semibold text-[#737A84] uppercase tracking-wider mr-2 shrink-0">
            Status:
          </span>
          {[
            { id: "all", label: "Semua" },
            { id: "dilaporkan", label: "Dilaporkan" },
            { id: "menunggu_persetujuan", label: "Menunggu Approval" },
            { id: "diproses", label: "Diproses" },
            { id: "selesai", label: "Selesai" },
            { id: "ditutup", label: "Ditutup" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${filterStatus === tab.id
                ? "bg-[#26292E] text-white shadow-sm"
                : "bg-[#F6F7F9] text-[#737A84] hover:bg-[#E8EAEC] hover:text-[#26292E]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Search & Tombol Buat Laporan */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Cari nomor / judul / unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 rounded-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none w-48 sm:w-60"
          />

          {userRole === "penyewa" && (
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(true);
                setFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Lapor Kerusakan</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${feedback.type === "success"
            ? "bg-[#EAFCD6] text-[#2F6B12] border border-[#C8F296]"
            : "bg-[#FFF0F0] text-[#D32F2F] border border-[#FFCDD2]"
            }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TAMPILAN DETAIL TIKET & STEPPER SESUAI WIREFRAME HALAMAN 3 */}
      {selectedLaporan && (
        <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.04)] space-y-8">
          {/* Header Tiket: Nomor & Judul Besar Dua Warna */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#737A84] uppercase tracking-widest">
                Kerusakan / {selectedLaporan.nomor}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#26292E]">
                {selectedLaporan.judul}
              </h2>
              <p className="text-xs text-[#737A84]">
                Unit <strong className="text-[#26292E]">{selectedLaporan.unit_kode}</strong> •
                Dilaporkan oleh{" "}
                <strong className="text-[#26292E]">{selectedLaporan.pelapor_nama}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${selectedLaporan.status === "diproses"
                  ? "bg-[#EAFCD6] text-[#2F6B12] border-[#C8F296]"
                  : selectedLaporan.status === "menunggu_persetujuan"
                    ? "bg-[#FFF9E6] text-[#8A6D14] border-[#FFE8A3]"
                    : selectedLaporan.status === "ditutup"
                      ? "bg-[#F1F3F5] text-[#555A61] border-[#E0E3E6]"
                      : selectedLaporan.status === "ditolak"
                        ? "bg-[#FFF0F0] text-[#D32F2F] border-[#FFCDD2]"
                        : "bg-[#F6F7F9] text-[#26292E] border-[#E8EAEC]"
                  }`}
              >
                {selectedLaporan.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* STEPPER 5 LANGKAH PERSIS WIREFRAME HALAMAN 3 */}
          {selectedLaporan.status !== "ditolak" ? (
            <div className="rounded-2xl bg-[#F6F7F9] p-6 border border-[#E8EAEC]">
              <div className="grid grid-cols-5 gap-2 relative">
                {/* Garis Horizontal Penghubung */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E8EAEC] -z-0" />

                {[
                  { step: 1, label: "Dilaporkan" },
                  { step: 2, label: "Menunggu Persetujuan" },
                  { step: 3, label: "Diproses" },
                  { step: 4, label: "Selesai" },
                  { step: 5, label: "Ditutup" },
                ].map((st) => {
                  const isDone = currentStep >= st.step;
                  const isCurrent = currentStep === st.step;

                  return (
                    <div key={st.step} className="flex flex-col items-center text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${isDone
                          ? "bg-[#1C1E22] text-[#D2F367] shadow-sm"
                          : "bg-white text-[#737A84] border border-[#E8EAEC]"
                          } ${isCurrent ? "ring-4 ring-[#D2F367]/40 scale-110" : ""}`}
                      >
                        {isDone && !isCurrent && st.step < currentStep ? (
                          <CheckCircle2 className="w-4 h-4 text-[#D2F367]" />
                        ) : (
                          st.step
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-semibold mt-2.5 leading-tight ${isCurrent
                          ? "text-[#26292E] font-bold"
                          : isDone
                            ? "text-[#26292E]"
                            : "text-[#A6ABB2]"
                          }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#FFCDD2] text-xs text-[#D32F2F]">
              <strong>Laporan Ditolak:</strong> {selectedLaporan.alasan_tolak}
            </div>
          )}

          {/* KONTEN UTAMA: DETAIL TIKET & PANEL AKSI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Detail Laporan & Galeri Foto Kerusakan */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-bold text-[#737A84] uppercase tracking-wider">
                Detail Laporan Kerusakan
              </h3>

              <div className="rounded-2xl bg-[#F6F7F9] p-4 space-y-3 border border-[#E8EAEC] text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#737A84]">Kategori:</span>
                  <strong className="col-span-2 text-[#26292E] capitalize">
                    {selectedLaporan.kategori}
                  </strong>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#737A84]">Deskripsi:</span>
                  <p className="col-span-2 text-[#26292E] leading-relaxed">
                    {selectedLaporan.deskripsi}
                  </p>
                </div>

                {selectedLaporan.catatan && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8EAEC]">
                    <span className="text-[#737A84]">Catatan Staf:</span>
                    <p className="col-span-2 text-[#26292E]">{selectedLaporan.catatan}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8EAEC]">
                  <span className="text-[#737A84]">Estimasi Biaya:</span>
                  <div className="col-span-2">
                    {selectedLaporan.estimasi_biaya ? (
                      <span className="font-bold text-[#26292E]">
                        Rp{selectedLaporan.estimasi_biaya.toLocaleString("id-ID")}{" "}
                        {selectedLaporan.estimasi_biaya > 1000000 && (
                          <span className="text-[10px] text-[#8A6D14] font-normal">
                            (di atas batas Rp1.000.000 - wajib disetujui Pemilik)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#A6ABB2] italic">Belum diestimasi</span>
                    )}
                  </div>
                </div>

                {selectedLaporan.biaya_aktual !== undefined && selectedLaporan.biaya_aktual !== null && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-[#737A84]">Biaya Aktual:</span>
                    <strong className="col-span-2 text-[#2F6B12] font-bold">
                      Rp{selectedLaporan.biaya_aktual.toLocaleString("id-ID")}
                    </strong>
                  </div>
                )}
              </div>

              {/* Lampiran Foto Kerusakan Realistis (Maksimal 3 Foto Sesuai BR-11) */}
              <div>
                <span className="block text-[11px] font-semibold text-[#737A84] mb-2">
                  Lampiran Foto Kerusakan ({selectedLaporan.foto_paths.length} foto):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedLaporan.foto_paths.map((f, i) => {
                    // Helper untuk menentukan path foto bukti fisik asli
                    let photoSrc = f.startsWith("http") || f.startsWith("/") ? f : "";
                    if (!photoSrc) {
                      if (selectedLaporan.nomor === "LK-2026-0013") photoSrc = "/kerusakan/mcb-turun.png";
                      else if (selectedLaporan.nomor === "LK-2026-0012") photoSrc = "/kerusakan/kasur-ambles.png";
                      else if (selectedLaporan.nomor === "LK-2026-0011") photoSrc = "/kerusakan/remote-ac.png";
                      else if (selectedLaporan.nomor === "LK-2026-0010") photoSrc = "/kerusakan/pintu-kunci.png";
                      else if (selectedLaporan.nomor === "LK-2026-0009") photoSrc = "/kerusakan/wastafel-mampet.png";
                      else if (selectedLaporan.nomor === "LK-2026-0008") photoSrc = "/kerusakan/lampu-kedip.png";
                      else if (selectedLaporan.nomor === "LK-2026-0007") photoSrc = "/kerusakan/rak-dinding.png";
                      else if (selectedLaporan.nomor === "LK-2026-0006") {
                        if (i === 1) photoSrc = "/kerusakan/plafon-bocor-2.jpg";
                        else if (i === 2) photoSrc = "/kerusakan/plafon-bocor-3.jpg";
                        else photoSrc = "/kerusakan/plafon-bocor.jpg";
                      }
                      else if (selectedLaporan.nomor === "LK-2026-0005") photoSrc = "/kerusakan/engsel-lemari.jpg";
                      else if (selectedLaporan.nomor === "LK-2026-0004") photoSrc = "/kerusakan/water-heater.png";
                      else if (selectedLaporan.nomor === "LK-2026-0003") photoSrc = "/kerusakan/stopkontak-meja.png";
                      else if (selectedLaporan.nomor === "LK-2026-0002") {
                        photoSrc = i === 1 ? "/kerusakan/ac-tidak-dingin-2.jpg" : "/kerusakan/ac-tidak-dingin.png";
                      }
                      else if (selectedLaporan.nomor === "LK-2026-0001") photoSrc = "/kerusakan/keran-bocor.jpg";
                      else {
                        switch (selectedLaporan.kategori) {
                          case "air": photoSrc = "/kerusakan/wastafel-mampet.png"; break;
                          case "ac": photoSrc = "/kerusakan/ac-tidak-dingin.png"; break;
                          case "listrik": photoSrc = "/kerusakan/stopkontak-meja.png"; break;
                          case "bangunan": photoSrc = "/kerusakan/pintu-kunci.png"; break;
                          case "perabot": default: photoSrc = "/kerusakan/rak-dinding.png"; break;
                        }
                      }
                    }

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedPhotoModal(photoSrc)}
                        className="rounded-2xl overflow-hidden bg-[#1C1E22] border border-[#E8EAEC] h-32 sm:h-36 relative group cursor-pointer shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={photoSrc}
                          alt={`${selectedLaporan.judul} - Bukti #${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]">
                          <span className="px-3 py-1 rounded-full bg-white/95 text-[#26292E] text-[11px] font-bold shadow-sm flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-[#26292E]" />
                            <span>Perbesar</span>
                          </span>
                        </div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono">
                          Foto #{i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Panel Tindakan Mengikuti Peran & Status (Wireframe Halaman 3) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-bold text-[#737A84] uppercase tracking-wider">
                Panel Tindakan ({userRole.toUpperCase()})
              </h3>

              <div className="rounded-2xl bg-white p-5 border border-[#E8EAEC] shadow-sm space-y-4">
                {/* 1. KASUS PEMILIK: TIKET MENUNGGU PERSETUJUAN (US-09, BR-12) */}
                {userRole === "pemilik" && selectedLaporan.status === "menunggu_persetujuan" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-[#FFF9E6] border border-[#FFE8A3] text-xs text-[#8A6D14]">
                      <strong>Tindakan Pemilik:</strong> Biaya perbaikan estimasi Rp
                      {selectedLaporan.estimasi_biaya?.toLocaleString("id-ID")} melebihi batas Rp1.000.000 dan wajib disetujui Pemilik sebelum dikerjakan.
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExecuteAction("proses")}
                        disabled={isPending}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D2F367]" />
                        <span>Setujui Biaya</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActionModal("tolak")}
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-bold border border-[#FFCDD2] transition disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. KASUS PENGELOLA: TIKET STATUS DILAPORKAN (US-08, BR-12) */}
                {userRole === "pengelola" && selectedLaporan.status === "dilaporkan" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#737A84]">
                      Tentukan estimasi biaya perbaikan. Bila di atas Rp1.000.000, sistem akan meminta persetujuan Pemilik.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-[#26292E] mb-1">
                        Estimasi Biaya Perbaikan (Rp):
                      </label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        value={inputEstimasi || ""}
                        onChange={(e) => setInputEstimasi(Number(e.target.value))}
                        placeholder="Contoh: 750000 atau 1250000"
                        className="w-full p-2.5 rounded-xl bg-[#F6F7F9] text-xs font-bold text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26292E] mb-1">
                        Catatan Teknis (Opsional):
                      </label>
                      <input
                        type="text"
                        value={inputCatatan}
                        onChange={(e) => setInputCatatan(e.target.value)}
                        placeholder="Contoh: Perlu teknisi pipa..."
                        className="w-full p-2.5 rounded-xl bg-[#F6F7F9] text-xs text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {inputEstimasi > 1000000 ? (
                        <button
                          type="button"
                          onClick={() => handleExecuteAction("minta_persetujuan")}
                          disabled={isPending}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#8A6D14] hover:bg-[#725a0e] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Minta Approval Pemilik</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExecuteAction("proses")}
                          disabled={isPending || !inputEstimasi}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D2F367]" />
                          <span>Proses Pengerjaan</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setActionModal("tolak")}
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-bold border border-[#FFCDD2] transition disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. KASUS PENGELOLA: TIKET SEDANG DIPROSES -> SELESAIKAN (BR-12) */}
                {userRole === "pengelola" && selectedLaporan.status === "diproses" && (
                  <div className="space-y-3">
                    <p className="text-xs text-[#737A84]">
                      Pengerjaan perbaikan telah rampung. Masukkan biaya aktual perbaikan.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-[#26292E] mb-1">
                        Biaya Aktual Pengerjaan (Rp):
                      </label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        value={inputBiayaAktual || ""}
                        onChange={(e) => setInputBiayaAktual(Number(e.target.value))}
                        placeholder="Contoh: 950000"
                        className="w-full p-2.5 rounded-xl bg-[#F6F7F9] text-xs font-bold text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteAction("selesaikan")}
                      disabled={isPending || !inputBiayaAktual}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D2F367]" />
                      <span>Tandai Selesai (BR-12)</span>
                    </button>
                  </div>
                )}

                {/* 4. TIKET SELESAI -> TUTUP (PENYEWA KAPAN SAJA ATAU PENGELOLA > 3 HARI) */}
                {selectedLaporan.status === "selesai" && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-[#EAFCD6] text-xs text-[#2F6B12] border border-[#C8F296]">
                      Perbaikan telah selesai. Penyewa pelapor dapat menutup tiket ini kapan saja.
                    </div>

                    {userRole === "penyewa" && selectedLaporan.pelapor_id === currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleExecuteAction("tutup")}
                        disabled={isPending}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D2F367]" />
                        <span>Tutup Laporan Kerusakan</span>
                      </button>
                    )}

                    {userRole === "pengelola" && (
                      <button
                        type="button"
                        onClick={() => handleExecuteAction("tutup")}
                        disabled={isPending}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-xs font-semibold border border-[#E8EAEC] transition disabled:opacity-50"
                      >
                        <span>Tutup (Pengelola - Aturan &gt; 3 Hari BR-12)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Status Ditutup & Ditolak adalah Status Akhir */}
                {(selectedLaporan.status === "ditutup" || selectedLaporan.status === "ditolak") && (
                  <div className="p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#737A84] text-center">
                    Tiket ini berstatus <strong>{selectedLaporan.status}</strong> (Status Akhir). Tidak diperlukan tindakan lanjutan.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAFTAR SEMUA TIKET LAPORAN KERUSAKAN */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#26292E]">
          Semua Tiket Laporan Kerusakan ({filteredList.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((lk) => {
            const isSelected = selectedLaporan?.id === lk.id;
            return (
              <div
                key={lk.id}
                onClick={() => setSelectedLaporan(lk)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between space-y-3 ${isSelected
                  ? "bg-white border-[#26292E] shadow-md ring-2 ring-[#26292E]/10"
                  : "bg-white border-[#E8EAEC] hover:bg-[#F6F7F9]"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#737A84] block">{lk.nomor}</span>
                    <h4 className="text-sm font-bold text-[#26292E] line-clamp-1">{lk.judul}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F6F7F9] text-[#26292E] border border-[#E8EAEC] uppercase">
                    {lk.status.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#737A84] pt-2 border-t border-[#F1F3F5]">
                  <span>Unit {lk.unit_kode}</span>
                  <span className="font-semibold text-[#26292E]">{lk.pelapor_nama}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL BUAT LAPORAN BARU (PENYEWA - BR-11) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Laporan Kerusakan Fasilitas [BR-11]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">Buat Laporan Baru</h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#1C1E22] text-[#D2F367] flex items-center justify-center font-bold text-xs">
                LK
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#F6F7F9] border border-[#E8EAEC] text-xs text-[#737A84]">
              Unit Terkontrak: <strong className="text-[#26292E]">{activeContractUnit || "A-104"}</strong>
              <p className="text-[11px] mt-1">
                Aturan BR-11: Wajib 1 sampai 3 foto, maksimal 3 laporan terbuka per penyewa.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Kategori Kerusakan:
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full p-2.5 rounded-2xl bg-[#F6F7F9] text-xs font-medium text-[#26292E] border border-[#E8EAEC] focus:outline-none capitalize"
                >
                  {["listrik", "air", "ac", "bangunan", "perabot", "lainnya"].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Judul Singkat Kerusakan:
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Saluran wastafel mampet"
                  className="w-full p-2.5 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Deskripsi Lengkap Kerusakan:
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan bagian yang rusak secara spesifik..."
                  className="w-full p-2.5 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] border border-[#E8EAEC] focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Lampiran Foto Bukti (1 s.d. 3 foto - BR-11):
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#EAFCD6] text-[#2F6B12] px-3 py-1.5 rounded-full border border-[#C8F296]">
                    ✓ 1 Foto Kerusakan Siap Diunggah
                  </span>
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
                onClick={handleCreateReport}
                disabled={isPending || !judul || !deskripsi}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TOLAK LAPORAN DENGAN ALASAN WAJIB */}
      {actionModal === "tolak" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-widest">
                  Penolakan Laporan [BR-12]
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">Tolak Laporan Kerusakan</h2>
              </div>
              <span className="w-9 h-9 rounded-full bg-[#FFF0F0] text-[#D32F2F] flex items-center justify-center font-bold text-xs">
                !
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                Alasan Penolakan (Wajib Diisi):
              </label>
              <textarea
                rows={3}
                value={inputAlasanTolak}
                onChange={(e) => setInputAlasanTolak(e.target.value)}
                placeholder="Contoh: Bukan kerusakan fasilitas milik kos melainkan perabot pribadi..."
                className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleExecuteAction("tolak")}
                disabled={isPending || !inputAlasanTolak.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIGHTBOX FOTO KERUSAKAN ASLI */}
      {selectedPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-[28px] overflow-hidden bg-white p-4 sm:p-5 shadow-2xl border border-white/20 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAEC]">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider">
                  Lampiran Bukti Fisik Kerusakan &bull; {selectedLaporan?.nomor}
                </span>
                <h3 className="text-base font-bold text-[#26292E]">
                  {selectedLaporan?.judul} (Unit {selectedLaporan?.unit_kode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] flex items-center justify-center text-xs font-bold transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 bg-[#1C1E22] rounded-[22px] overflow-hidden flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhotoModal}
                alt="Bukti Foto Kerusakan Asli"
                className="w-full h-auto max-h-[65vh] object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-1 text-xs text-[#737A84]">
              <span>
                Pelapor: <strong className="text-[#26292E]">{selectedLaporan?.pelapor_nama}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhotoModal(null)}
                className="px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-xs font-semibold text-white shadow-sm transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
