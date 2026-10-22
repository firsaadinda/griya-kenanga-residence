"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { UserRole } from "@/lib/auth/guard";
import { verifikasiIdentitasAction, getSignedKtpUrlAction } from "@/lib/actions/penyewa-actions";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  Check,
  X,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Lock,
  Loader2,
  User,
  ExternalLink,
} from "lucide-react";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { EmptyState } from "@/components/feedback/EmptyState";
import { HttpStatusCode } from "@/types/api";

export function getProfilePhoto(nama: string) {
  const n = (nama || "").toLowerCase();
  if (n.includes("bella")) return "/profiles/w_0_white.jpg";
  if (n.includes("eka")) return "/profiles/w_1_white.jpg";
  if (n.includes("hana")) return "/profiles/w_2_white.jpg";
  if (n.includes("jihan")) return "/profiles/w_3_white.jpg";
  if (n.includes("laras")) return "/profiles/w_4_white.jpg";
  if (n.includes("nadia")) return "/profiles/w_5_white.jpg";
  if (n.includes("putri")) return "/profiles/w_6_white.jpg";
  if (n.includes("salma")) return "/profiles/w_7_white.jpg";
  if (n.includes("vina")) return "/profiles/w_8_white.jpg";
  if (n.includes("aditya")) return "/profiles/m_0_white.jpg";
  if (n.includes("cahya")) return "/profiles/m_1_white.jpg";
  if (n.includes("dimas")) return "/profiles/m_2_white.jpg";
  if (n.includes("fajar")) return "/profiles/m_3_white.jpg";
  if (n.includes("gilang")) return "/profiles/m_4_white.jpg";
  if (n.includes("indra")) return "/profiles/m_5_white.jpg";
  if (n.includes("kevin")) return "/profiles/m_6_white.jpg";
  if (n.includes("rizki") || n.includes("muhammad")) return "/profiles/m_7_white.jpg";
  if (n.includes("oki")) return "/profiles/m_8_white.jpg";
  if (n.includes("raka")) return "/profiles/m_9_white.jpg";
  if (n.includes("teguh")) return "/profiles/m_10_white.jpg";
  if (n.includes("wahyu")) return "/profiles/m_11_white.jpg";
  return "/profiles/m_12_white.jpg";
}

export interface PenyewaItem {
  penyewa_id: string;
  nama_lengkap: string;
  email: string;
  no_hp?: string | null;
  nik?: string | null; // Tersamar untuk pemilik, lengkap untuk pengelola
  alamat_asal?: string | null;
  foto_ktp_path?: string | null;
  kontak_darurat_nama?: string | null;
  kontak_darurat_hp?: string | null;
  status_verifikasi: "belum" | "terverifikasi" | "ditolak" | null;
  alasan_tolak?: string | null;
  diverifikasi_pada?: string | null;
}

interface PenyewaClientViewProps {
  initialPenyewa: PenyewaItem[];
  userRole: UserRole;
}

export function PenyewaClientView({ initialPenyewa, userRole }: PenyewaClientViewProps) {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const targetIdParam = searchParams.get("targetId") || "";

  const [penyewaList, setPenyewaList] = useState<PenyewaItem[]>(initialPenyewa);
  const [filterVerif, setFilterVerif] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(qParam);

  // Cari target penyewa awal jika ada targetIdParam atau qParam
  const matchedInitial = initialPenyewa.find(
    (p) =>
      (targetIdParam && p.penyewa_id === targetIdParam) ||
      (qParam && (
        p.nama_lengkap.toLowerCase().includes(qParam.toLowerCase()) ||
        p.email.toLowerCase().includes(qParam.toLowerCase())
      ))
  );

  // Modal Detail Profil Personal Penyewa (Langsung muncul jika ditarget dari pencarian)
  const [detailPenyewa, setDetailPenyewa] = useState<PenyewaItem | null>(matchedInitial || null);

  // Sync if query param changes
  useEffect(() => {
    if (qParam || targetIdParam) {
      if (qParam) setSearchQuery(qParam);
      const target = penyewaList.find(
        (p) =>
          (targetIdParam && p.penyewa_id === targetIdParam) ||
          (qParam && (
            p.nama_lengkap.toLowerCase().includes(qParam.toLowerCase()) ||
            p.email.toLowerCase().includes(qParam.toLowerCase())
          ))
      );
      if (target) {
        setDetailPenyewa(target);
        setFilterVerif("all");
        setTimeout(() => {
          document.getElementById(`penyewa-${target.penyewa_id}`)?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 150);
      }
    }
  }, [qParam, targetIdParam, penyewaList]);

  // Modal Verifikasi / Tolak State
  const [selectedPenyewa, setSelectedPenyewa] = useState<PenyewaItem | null>(null);
  const [actionType, setActionType] = useState<"verifikasi" | "tolak" | null>(null);
  const [alasanTolak, setAlasanTolak] = useState("");

  // Modal Lihat KTP State
  const [ktpModalOpen, setKtpModalOpen] = useState(false);
  const [ktpSignedUrl, setKtpSignedUrl] = useState<string | null>(null);
  const [loadingKtp, setLoadingKtp] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    statusCode: HttpStatusCode;
    message: string;
  } | null>(null);

  // Filter Penyewa
  const filteredList = penyewaList.filter((p) => {
    if (filterVerif !== "all") {
      const status = p.status_verifikasi || "belum";
      if (status !== filterVerif) return false;
    }
    if (
      searchQuery &&
      !p.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenActionModal = (p: PenyewaItem, type: "verifikasi" | "tolak") => {
    setSelectedPenyewa(p);
    setActionType(type);
    setAlasanTolak("");
    setFeedback(null);
  };

  const handleOpenKtpModal = async (p: PenyewaItem) => {
    if (!p.foto_ktp_path || userRole !== "pengelola") return;
    setSelectedPenyewa(p);
    setKtpModalOpen(true);
    setLoadingKtp(true);
    setFeedback(null);

    const res = await getSignedKtpUrlAction(p.foto_ktp_path, {
      nama: p.nama_lengkap,
      nik: p.nik || undefined,
      alamat: p.alamat_asal || undefined,
    });
    setLoadingKtp(false);
    if (res.success && res.data?.signedUrl) {
      setKtpSignedUrl(res.data.signedUrl);
    } else {
      setFeedback({ statusCode: res.statusCode || 400, message: res.message || "Gagal memuat foto KTP." });
    }
  };

  const handleConfirmAction = () => {
    if (!selectedPenyewa || !actionType) return;
    startTransition(async () => {
      setFeedback(null);
      const res = await verifikasiIdentitasAction({
        penyewaId: selectedPenyewa.penyewa_id,
        status: actionType === "verifikasi" ? "terverifikasi" : "ditolak",
        alasanTolak: actionType === "tolak" ? alasanTolak : undefined,
      });

      if (res.success) {
        setPenyewaList((prev) =>
          prev.map((item) =>
            item.penyewa_id === selectedPenyewa.penyewa_id
              ? {
                ...item,
                status_verifikasi: actionType === "verifikasi" ? "terverifikasi" : "ditolak",
                alasan_tolak: actionType === "tolak" ? alasanTolak : null,
                diverifikasi_pada: new Date().toISOString(),
              }
              : item
          )
        );
        setFeedback({ statusCode: res.statusCode, message: res.message });
        setTimeout(() => {
          setSelectedPenyewa(null);
          setActionType(null);
        }, 1500);
      } else {
        setFeedback({ statusCode: res.statusCode, message: res.message });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* FILTER & PENCARIAN PENYEWA */}
      <div className="rounded-[24px] bg-white p-4 sm:p-5 border border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Status Verifikasi */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-[#737A84] uppercase tracking-wider mr-2 shrink-0">
            Verifikasi:
          </span>
          {[
            { id: "all", label: "Semua" },
            { id: "terverifikasi", label: "Terverifikasi" },
            { id: "belum", label: "Menunggu" },
            { id: "ditolak", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterVerif(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${filterVerif === tab.id
                  ? "bg-[#26292E] text-white shadow-sm"
                  : "bg-[#F6F7F9] text-[#737A84] hover:bg-[#E8EAEC] hover:text-[#26292E]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input dengan Tombol Hapus */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama atau email penyewa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 pr-8 py-1.5 rounded-full bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737A84] hover:text-[#26292E] p-0.5 rounded-full"
              title="Reset pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* BANNER PRIVASI */}
      {userRole === "pemilik" ? (
        <div className="rounded-[20px] bg-[#F6F7F9] p-4 border border-[#E8EAEC] flex items-center gap-3 text-xs text-[#737A84]">
          <Lock className="w-4 h-4 text-[#26292E] shrink-0" />
          <span>
            <strong>Privasi Data Pemilik:</strong> Sebagai Pemilik, Anda hanya dapat melihat 4 angka terakhir NIK (contoh: ************9663). Foto KTP asli, alamat lengkap, dan nomor kontak darurat disembunyikan demi privasi penyewa.
          </span>
        </div>
      ) : (
        <div className="rounded-[20px] bg-[#EAFCD6] p-4 border border-[#C8F296] flex items-center gap-3 text-xs text-[#2F6B12]">
          <ShieldCheck className="w-4 h-4 text-[#2F6B12] shrink-0" />
          <span>
            <strong>Hak Akses Pengelola:</strong> Anda berhak meninjau berkas KTP penyewa lewat tautan aman sementara (Signed URL), serta memverifikasi atau menolak pengajuan identitas.
          </span>
        </div>
      )}

      {/* Alert Feedback Standar */}
      {feedback && (
        <AlertBanner
          statusCode={feedback.statusCode}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* DAFTAR KARTU PENYEWA BERGAYA MONTE X TERRA */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak Ada Penyewa Ditemukan"
          description="Tidak ada data penyewa yang sesuai dengan filter status verifikasi atau kata kunci pencarian Anda."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((p) => {
          const statusVerif = p.status_verifikasi || "belum";
          const isTerverifikasi = statusVerif === "terverifikasi";
          const isDitolak = statusVerif === "ditolak";
          const isBelum = statusVerif === "belum";
          const isTargeted = targetIdParam && p.penyewa_id === targetIdParam;

          return (
            <div
              key={p.penyewa_id}
              id={`penyewa-${p.penyewa_id}`}
              className={`rounded-[28px] bg-white p-5 border transition flex flex-col justify-between space-y-4 ${
                isTargeted
                  ? "border-[#26292E] shadow-xl ring-2 ring-[#26292E]/20 bg-[#F6F7F9]/30"
                  : "border-[#E8EAEC] shadow-[0_8px_30px_rgba(38,41,46,0.04)] hover:shadow-md"
              }`}
            >
              <div className="space-y-3">
                {/* Header Kartu: Foto Profil, Nama & Badge Verifikasi (Bisa Diklik) */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setDetailPenyewa(p)}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Klik untuk melihat rincian personal penyewa"
                  >
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-[#E8EAEC] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      <img
                        src={getProfilePhoto(p.nama_lengkap)}
                        alt={p.nama_lengkap}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#26292E] leading-tight group-hover:underline">
                        {p.nama_lengkap}
                      </h3>
                      <p className="text-xs text-[#737A84] mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  {isTerverifikasi && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAFCD6] text-[#2F6B12] text-[10px] font-bold border border-[#C8F296] shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Terverifikasi</span>
                    </span>
                  )}
                  {isDitolak && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0F0] text-[#D32F2F] text-[10px] font-bold border border-[#FFCDD2] shrink-0">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Ditolak</span>
                    </span>
                  )}
                  {isBelum && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF9E6] text-[#8A6D14] text-[10px] font-bold border border-[#FFE8A3] shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>Menunggu</span>
                    </span>
                  )}
                </div>

                {/* Data Identitas */}
                <div className="rounded-2xl bg-[#F6F7F9] p-3.5 space-y-2 border border-[#E8EAEC] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">NIK KTP:</span>
                    <strong className="text-[#26292E] tracking-wider font-mono">
                      {p.nik ? p.nik : "Belum diisi"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737A84]">No. Telepon:</span>
                    <span className="text-[#26292E] font-medium">{p.no_hp || "-"}</span>
                  </div>

                  {/* Alamat & Kontak Darurat (Hanya untuk Pengelola sesuai BR-10) */}
                  {userRole === "pengelola" && (
                    <>
                      <div className="pt-1 border-t border-[#E8EAEC] text-[11px] text-[#737A84]">
                        <span className="font-semibold text-[#26292E] block">Alamat Asal:</span>
                        <p className="line-clamp-2">{p.alamat_asal || "Belum ada alamat"}</p>
                      </div>

                      <div className="text-[11px] text-[#737A84]">
                        <span className="font-semibold text-[#26292E] block">Kontak Darurat:</span>
                        <p>
                          {p.kontak_darurat_nama ? `${p.kontak_darurat_nama} (${p.kontak_darurat_hp})` : "Belum ada"}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Alasan Tolak Jika Ada */}
                  {isDitolak && p.alasan_tolak && (
                    <div className="p-2 rounded-xl bg-[#FFF0F0] text-[11px] text-[#D32F2F] border border-[#FFCDD2]">
                      <strong>Alasan Ditolak:</strong> {p.alasan_tolak}
                    </div>
                  )}
                </div>
              </div>

              {/* BARIS TOMBOL AKSI KARTU */}
              <div className="pt-2 border-t border-[#F1F3F5] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setDetailPenyewa(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] transition cursor-pointer"
                  title="Lihat Detail Profil Personal"
                >
                  <User className="w-3.5 h-3.5 text-[#737A84]" />
                  <span>Detail Profil</span>
                </button>

                {userRole === "pengelola" && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    {p.foto_ktp_path && (
                      <button
                        type="button"
                        onClick={() => handleOpenKtpModal(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white hover:bg-[#F6F7F9] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] transition cursor-pointer"
                        title="Tinjau KTP Asli"
                      >
                        <Eye className="w-3 h-3 text-[#737A84]" />
                        <span>KTP</span>
                      </button>
                    )}

                    {statusVerif === "belum" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(p, "verifikasi")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition cursor-pointer border border-white/10"
                        >
                          <Check className="w-3 h-3 text-[#88BC3C]" />
                          <span>Verifikasi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(p, "tolak")}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-semibold border border-[#FFCDD2] transition cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Tolak</span>
                        </button>
                      </>
                    )}

                    {statusVerif === "ditolak" && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(p, "verifikasi")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition cursor-pointer border border-white/10"
                      >
                        <Check className="w-3 h-3 text-[#88BC3C]" />
                        <span>Verifikasi</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* MODAL RINCIAN DETAIL PROFIL PERSONAL PENYEWA */}
      {detailPenyewa && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setDetailPenyewa(null)}
        >
          <div
            className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-[#F0F2F4] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-[#E8EAEC] shrink-0 shadow-sm">
                  <img
                    src={getProfilePhoto(detailPenyewa.nama_lengkap)}
                    alt={detailPenyewa.nama_lengkap}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider bg-[#F6F7F9] px-2 py-0.5 rounded-md border border-[#E8EAEC]">
                      Profil Penghuni
                    </span>
                    {detailPenyewa.status_verifikasi === "terverifikasi" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAFCD6] text-[#2F6B12] text-[10px] font-bold border border-[#C8F296]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Terverifikasi</span>
                      </span>
                    )}
                    {detailPenyewa.status_verifikasi === "ditolak" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF0F0] text-[#D32F2F] text-[10px] font-bold border border-[#FFCDD2]">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Ditolak</span>
                      </span>
                    )}
                    {(!detailPenyewa.status_verifikasi || detailPenyewa.status_verifikasi === "belum") && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF9E6] text-[#8A6D14] text-[10px] font-bold border border-[#FFE8A3]">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu Verifikasi</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#26292E] mt-0.5">
                    {detailPenyewa.nama_lengkap}
                  </h3>
                  <p className="text-xs text-[#737A84]">{detailPenyewa.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailPenyewa(null)}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#26292E] flex items-center justify-center transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rincian Data Diri */}
            <div className="bg-[#F6F7F9] rounded-2xl p-4 border border-[#E8EAEC] space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8EAEC]">
                <span className="text-[#737A84] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> No. Telepon / WhatsApp:
                </span>
                <span className="font-semibold text-[#26292E]">
                  {detailPenyewa.no_hp || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#E8EAEC]">
                <span className="text-[#737A84] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> NIK KTP:
                </span>
                <span className="font-mono font-bold text-[#26292E]">
                  {detailPenyewa.nik || "Belum diisi"}
                </span>
              </div>

              {userRole === "pengelola" ? (
                <>
                  <div className="pb-2 border-b border-[#E8EAEC]">
                    <span className="text-[#737A84] flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5" /> Alamat Asal Domisili:
                    </span>
                    <p className="text-[#26292E] font-medium bg-white p-2 rounded-xl border border-[#E8EAEC]">
                      {detailPenyewa.alamat_asal || "Belum ada catatan alamat"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#737A84] block mb-1">Kontak Darurat:</span>
                    <p className="text-[#26292E] font-medium">
                      {detailPenyewa.kontak_darurat_nama
                        ? `${detailPenyewa.kontak_darurat_nama} (${detailPenyewa.kontak_darurat_hp || "-"})`
                        : "Belum tercatat"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-xl bg-white border border-[#E8EAEC] text-[11px] text-[#737A84] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#26292E] shrink-0" />
                  <span>
                    <strong>Privasi Pemilik:</strong> NIK disamarkan (*12 digit + 4 digit akhir). Foto KTP asli, alamat domisili, dan kontak darurat dilindungi privasi.
                  </span>
                </div>
              )}

              {detailPenyewa.alasan_tolak && (
                <div className="p-3 rounded-xl bg-[#FFF0F0] text-[11px] text-[#D32F2F] border border-[#FFCDD2]">
                  <strong>Catatan Penolakan:</strong> {detailPenyewa.alasan_tolak}
                </div>
              )}
            </div>

            {/* Aksi Khusus Pengelola */}
            {userRole === "pengelola" && (
              <div className="flex items-center justify-between gap-2 pt-2">
                {detailPenyewa.foto_ktp_path ? (
                  <button
                    type="button"
                    onClick={() => handleOpenKtpModal(detailPenyewa)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] border border-[#E8EAEC] transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#737A84]" />
                    <span>Lihat Berkas KTP</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#737A84] italic">
                    Berkas KTP belum diunggah
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {detailPenyewa.status_verifikasi !== "terverifikasi" && (
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(detailPenyewa, "verifikasi")}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition cursor-pointer border border-white/10"
                    >
                      <Check className="w-3.5 h-3.5 text-[#88BC3C]" />
                      <span>Verifikasi</span>
                    </button>
                  )}
                  {detailPenyewa.status_verifikasi === "belum" && (
                    <button
                      type="button"
                      onClick={() => handleOpenActionModal(detailPenyewa, "tolak")}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D32F2F] text-xs font-semibold border border-[#FFCDD2] transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex justify-end pt-3 border-t border-[#F0F2F4]">
              <button
                type="button"
                onClick={() => setDetailPenyewa(null)}
                className="px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI / TOLAK IDENTITAS */}
      {actionType && selectedPenyewa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl border border-[#E8EAEC] space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Konfirmasi Verifikasi Identitas
                </span>
                <h2 className="text-xl font-bold text-[#26292E]">
                  {actionType === "verifikasi" ? "Verifikasi Identitas" : "Tolak Identitas"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPenyewa(null);
                  setActionType(null);
                  setFeedback(null);
                }}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#26292E] flex items-center justify-center transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#737A84]">
              Penyewa: <strong className="text-[#26292E]">{selectedPenyewa.nama_lengkap}</strong> (
              {selectedPenyewa.email})
            </p>

            {feedback && (
              <AlertBanner
                statusCode={feedback.statusCode}
                message={feedback.message}
                onDismiss={() => setFeedback(null)}
              />
            )}

            {actionType === "tolak" && (
              <div>
                <label className="block text-xs font-semibold text-[#26292E] mb-1.5">
                  Alasan Penolakan (Wajib diisi):
                </label>
                <textarea
                  rows={3}
                  value={alasanTolak}
                  onChange={(e) => setAlasanTolak(e.target.value)}
                  placeholder="Contoh: Foto KTP buram dan tidak terbaca, mohon unggah ulang..."
                  className="w-full p-3 rounded-2xl bg-[#F6F7F9] text-xs text-[#26292E] placeholder-[#737A84] border border-[#E8EAEC] focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPenyewa(null);
                  setActionType(null);
                }}
                disabled={isPending}
                className="px-4 py-2 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-xs font-semibold text-[#26292E] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer ${actionType === "verifikasi"
                    ? "bg-[#1C1E22] hover:bg-[#26292E] text-white"
                    : "bg-[#D32F2F] hover:bg-[#B71C1C] text-white"
                  }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />
                    <span>Menyimpan...</span>
                  </>
                ) : actionType === "verifikasi" ? (
                  "Setujui & Verifikasi"
                ) : (
                  "Tolak Pengajuan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LIHAT FOTO KTP AMAN (SIGNED URL DARI BUCKET PRIVAT KTP) */}
      {ktpModalOpen && selectedPenyewa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-5 sm:p-6 shadow-2xl border border-[#E8EAEC] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-widest">
                  Dokumen Privat [Signed URL 10 Menit]
                </span>
                <h2 className="text-lg font-bold text-[#26292E]">
                  KTP Elektronik: {selectedPenyewa.nama_lengkap}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setKtpModalOpen(false);
                  setKtpSignedUrl(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] flex items-center justify-center text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingKtp ? (
              <div className="h-72 flex items-center justify-center text-xs text-[#737A84]">
                Membuat dokumen KTP resmi dari Supabase Storage...
              </div>
            ) : ktpSignedUrl ? (
              <div className="rounded-[24px] bg-[#ECEEEF] border border-[#D5D9DC] pt-2.5 pb-1 px-1.5 sm:pt-3 sm:pb-1.5 sm:px-2 flex items-center justify-center shadow-inner overflow-hidden">
                <img
                  src={ktpSignedUrl}
                  alt={`KTP ${selectedPenyewa.nama_lengkap}`}
                  className="w-full h-auto object-contain rounded-[18px] transition"
                />
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FFF0F0] text-xs text-[#D32F2F]">
                Foto KTP tidak dapat dimuat atau belum diunggah.
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#737A84]">
                Disdukcapil Republik Indonesia &bull; Format Kartu e-KTP Standar ISO 7810
              </span>
              <button
                type="button"
                onClick={() => {
                  setKtpModalOpen(false);
                  setKtpSignedUrl(null);
                }}
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
