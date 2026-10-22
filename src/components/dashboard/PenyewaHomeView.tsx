"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { simpanIdentitasPenyewaAction } from "@/lib/actions/penyewa-actions";
import {
  FileSignature,
  CreditCard,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Receipt,
  Home,
  UserCheck,
  Loader2,
} from "lucide-react";
import { AlertBanner } from "@/components/feedback/AlertBanner";
import { HttpStatusCode } from "@/types/api";
import { PenyewaUnitShowcase } from "./PenyewaUnitShowcase";

export interface PenyewaContractInfo {
  id: string;
  nomor: string;
  unitKode: string;
  unitTipe: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  hargaPerBulan: number;
  status: "aktif" | "draf" | "selesai" | "diakhiri" | "dibatalkan";
}

export interface PenyewaBillInfo {
  id: string;
  nomor: string;
  periodeLabel: string;
  nominalSewa: number;
  denda: number;
  terbayar: number;
  sisaTotal: number;
  status: "belum_bayar" | "sebagian" | "lunas" | "dibatalkan";
  mayarLink?: string | null;
}

export interface PenyewaReportInfo {
  id: string;
  nomor: string;
  kategori: string;
  deskripsi: string;
  status: "dilaporkan" | "diproses" | "menunggu_persetujuan" | "selesai" | "ditutup" | "ditolak";
  dibuatPada: string;
}

export interface PenyewaIdentityInfo {
  nik: string | null;
  alamatAsal: string | null;
  fotoKtpPath: string | null;
  kontakDaruratNama: string | null;
  kontakDaruratHp: string | null;
  statusVerifikasi: "belum" | "terverifikasi" | "ditolak";
  alasanTolak?: string | null;
}

interface PenyewaHomeViewProps {
  userName: string;
  userEmail: string;
  contracts: PenyewaContractInfo[];
  bills: PenyewaBillInfo[];
  reports: PenyewaReportInfo[];
  identity: PenyewaIdentityInfo | null;
}

export function PenyewaHomeView({
  userName,
  userEmail,
  contracts,
  bills,
  reports,
  identity,
}: PenyewaHomeViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State Identitas
  const [nik, setNik] = useState(identity?.nik || "");
  const [alamatAsal, setAlamatAsal] = useState(identity?.alamatAsal || "");
  const [kontakNama, setKontakNama] = useState(identity?.kontakDaruratNama || "");
  const [kontakHp, setKontakHp] = useState(identity?.kontakDaruratHp || "");
  const [fotoKtpBase64, setFotoKtpBase64] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ statusCode: HttpStatusCode; message: string } | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isIdentityVerified = identity?.statusVerifikasi === "terverifikasi";
  const isIdentityRejected = identity?.statusVerifikasi === "ditolak";
  const isIdentityPending = identity?.statusVerifikasi === "belum" && identity?.nik;

  // Handle Upload Foto KTP
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ statusCode: 400, message: "Ukuran foto KTP maksimal 2 MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoKtpBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Form Identitas (US-01, BR-03)
  const handleSubmitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!nik || nik.length !== 16 || !/^\d{16}$/.test(nik)) {
      setFeedback({ statusCode: 400, message: "NIK wajib 16 digit angka sesuai KTP resmi." });
      return;
    }

    if (!alamatAsal.trim()) {
      setFeedback({ statusCode: 400, message: "Alamat asal wajib diisi." });
      return;
    }

    if (!kontakNama.trim() || !kontakHp.trim()) {
      setFeedback({ statusCode: 400, message: "Nama dan nomor HP kontak darurat wajib diisi." });
      return;
    }

    startTransition(async () => {
      const res = await simpanIdentitasPenyewaAction({
        nik: nik.trim(),
        alamatAsal: alamatAsal.trim(),
        kontakDaruratNama: kontakNama.trim(),
        kontakDaruratHp: kontakHp.trim(),
        fotoKtpPath: fotoKtpBase64 || identity?.fotoKtpPath || "ktp-uploaded.jpg",
      });

      if (res.success) {
        setFeedback({
          statusCode: res.statusCode || 200,
          message: "Data identitas berhasil disimpan. Menunggu verifikasi dari Pengelola.",
        });
        router.refresh();
      } else {
        setFeedback({ statusCode: res.statusCode || 400, message: res.message });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* HEADER BERANDA PENYEWA: KARTU RESIDEN EKSEKUTIF */}
      <div className="rounded-[30px] bg-gradient-to-r from-[#1C1E22] via-[#26292E] to-[#343A42] p-6 sm:p-8 text-white border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.12)] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#5E8826]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-[#88BC3C] border border-[#5E8826]/30 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#88BC3C] animate-pulse" />
              <span>Portal Residen Resmi • Griya Kenanga Residence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Selamat datang, <span className="text-[#88BC3C]">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#A0A6AF] leading-relaxed">
              Pantau kontrak sewa, foto &amp; model 3D kamar Anda, lunasi tagihan tepat waktu via gateway resmi Mayar, dan kelola laporan fasilitas langsung dari satu tempat.
            </p>
          </div>

          {/* Sisi Kanan: Status Verifikasi & Kontak */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            {isIdentityVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Identitas Terverifikasi</span>
              </span>
            ) : isIdentityRejected ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Identitas Ditolak</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold backdrop-blur-md">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Menunggu Verifikasi KTP</span>
              </span>
            )}

            <div className="flex items-center gap-2 text-xs text-[#A0A6AF]">
              <span>Akun Terdaftar:</span>
              <span className="text-white font-medium">{userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEKSI KHUSUS PENYEWA: FOTO 5 SUDUT & MODEL 3D UNIT YANG DISEWA            */}
      {/* ========================================================================= */}
      {contracts.length > 0 && (
        <PenyewaUnitShowcase
          units={contracts.map((k) => ({
            id: k.id,
            kode: k.unitKode,
            tipe: k.unitTipe,
            nomorKontrak: k.nomor,
            status: k.status,
            hargaPerBulan: k.hargaPerBulan,
          }))}
        />
      )}

      {/* ========================================================================= */}
      {/* SEKSI 1: STATUS KONTRAK SEWA (AKTIF ATAU DRAF - KASUS FAJAR US-01/02)    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#26292E] flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#26292E]" />
            <span>Kontrak Sewa Saya</span>
          </h2>
          <span className="text-xs text-[#737A84] font-medium">
            {contracts.length} Kontrak Terdaftar
          </span>
        </div>

        {contracts.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-white border border-[#E8EAEC] text-center text-xs text-[#737A84] space-y-2">
            <Home className="w-8 h-8 text-[#A0A6AF] mx-auto" />
            <p className="font-semibold text-[#26292E]">Belum ada kontrak terdaftar</p>
            <p>Silakan hubungi Pengelola Griya Kenanga Residence untuk pemesanan unit.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((ktr) => (
              <div
                key={ktr.id}
                className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#26292E]">
                      {ktr.nomor}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ktr.status === "aktif"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : ktr.status === "draf"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-[#F6F7F9] text-[#737A84] border border-[#E8EAEC]"
                      }`}
                    >
                      {ktr.status === "draf"
                        ? "Draf (Menunggu Verifikasi)"
                        : ktr.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#26292E]">
                      Unit {ktr.unitKode} · {ktr.unitTipe}
                    </h3>
                    <p className="text-xs text-[#737A84]">
                      Periode: {ktr.tanggalMulai} s.d. {ktr.tanggalSelesai}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0F2F4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#737A84] uppercase font-semibold block">
                      Harga Sewa Bulanan
                    </span>
                    <span className="text-sm font-extrabold text-[#26292E]">
                      {formatRupiah(ktr.hargaPerBulan)} / bln
                    </span>
                  </div>
                  <Link
                    href="/dashboard/kontrak"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#26292E] hover:underline"
                  >
                    <span>Detail Kontrak</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEKSI 2: VERIFIKASI IDENTITAS KTP (FORM KHUSUS JIKA BELUM / DITOLAK)      */}
      {/* ========================================================================= */}
      {(!isIdentityVerified || isIdentityRejected) && (
        <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-[#E8EAEC] shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-base font-bold text-[#26292E]">
                  Lengkapi Identitas &amp; Foto KTP (Wajib untuk Aktivasi Kontrak)
                </h3>
              </div>
              <p className="text-xs text-[#737A84] mt-1">
                Kontrak draf hanya bisa diaktifkan oleh Pengelola bila identitas NIK 16 angka, alamat asal, dan kontak darurat Anda sudah diverifikasi.
              </p>
            </div>
          </div>

          {/* Banner Alasan Penolakan Jika Sebelumnya Ditolak */}
          {isIdentityRejected && identity?.alasanTolak && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <strong>Pengajuan Sebelumnya Ditolak oleh Pengelola:</strong>
                <p className="mt-1 font-medium">{identity.alasanTolak}</p>
                <p className="mt-1 text-[11px] text-rose-700">
                  Silakan perbaiki data atau unggah ulang foto KTP yang lebih jelas di bawah ini.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitIdentity} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#26292E] block mb-1">
                  Nomor Induk Kependudukan (NIK 16 Digit) *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  placeholder="3402491208017885"
                  className="w-full bg-[#F6F7F9] text-xs font-mono font-medium text-[#26292E] p-2.5 rounded-xl border border-[#E8EAEC] focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26292E] block mb-1">
                  Alamat Asal Lengkap Sesuai KTP *
                </label>
                <input
                  type="text"
                  value={alamatAsal}
                  onChange={(e) => setAlamatAsal(e.target.value)}
                  placeholder="Jl. Merdeka No. 41, Bandung"
                  className="w-full bg-[#F6F7F9] text-xs font-medium text-[#26292E] p-2.5 rounded-xl border border-[#E8EAEC] focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26292E] block mb-1">
                  Nama Kontak Darurat (Keluarga / Kerabat) *
                </label>
                <input
                  type="text"
                  value={kontakNama}
                  onChange={(e) => setKontakNama(e.target.value)}
                  placeholder="Budi Santoso (Ayah)"
                  className="w-full bg-[#F6F7F9] text-xs font-medium text-[#26292E] p-2.5 rounded-xl border border-[#E8EAEC] focus:outline-none focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#26292E] block mb-1">
                  Nomor HP Kontak Darurat *
                </label>
                <input
                  type="text"
                  value={kontakHp}
                  onChange={(e) => setKontakHp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full bg-[#F6F7F9] text-xs font-medium text-[#26292E] p-2.5 rounded-xl border border-[#E8EAEC] focus:outline-none focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#26292E] block mb-1">
                Unggah Foto e-KTP Asli (Maks 2 MB, JPG/PNG) *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="w-full text-xs text-[#737A84] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1C1E22] file:text-white hover:file:bg-[#26292E]"
              />
            </div>

            {feedback && (
              <AlertBanner
                statusCode={feedback.statusCode}
                message={feedback.message}
                onDismiss={() => setFeedback(null)}
              />
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm border border-white/10"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#88BC3C]" />}
                <span>{isPending ? "Menyimpan Data..." : "Kirim Data Identitas untuk Verifikasi"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEKSI 3: DAFTAR TAGIHAN SAYA & TOMBOL BAYAR ONLINE (US-06)                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#26292E] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#26292E]" />
            <span>Tagihan &amp; Pembayaran Sewa</span>
          </h2>
          <Link
            href="/dashboard/tagihan"
            className="text-xs font-semibold text-[#26292E] hover:underline"
          >
            Lihat Semua Tagihan
          </Link>
        </div>

        {/* Banner Tagihan Belum Lunas dengan Tombol Bayar Mayar Instan */}
        {(() => {
          const unpaid = bills.filter((b) => b.status !== "lunas");
          const totalUnpaid = unpaid.reduce((sum, b) => sum + b.sisaTotal, 0);
          if (unpaid.length === 0) return null;

          return (
            <div className="rounded-[24px] bg-[#1C1E22] text-white p-5 sm:p-6 border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                    Tagihan Perlu Dilunasi ({unpaid.length} Invoice)
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  Total Sisa: {formatRupiah(totalUnpaid)}
                </div>
                <p className="text-xs text-[#A0A6AF]">
                  Pelunasan instan otomatis via Mayar Gateway (QRIS, VA Bank, E-Wallet). Bebas denda bertambah.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <a
                  href="https://mayar.link/pl/griya-kenanga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5E8826] hover:bg-[#76A733] text-white text-xs font-bold transition shadow-sm hover:scale-102"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar Cepat via Mayar</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </a>
              </div>
            </div>
          );
        })()}

        {bills.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-white border border-[#E8EAEC] text-center text-xs text-[#737A84]">
            Tidak ada tagihan aktif saat ini.
          </div>
        ) : (
          <div className="rounded-[28px] bg-white p-5 border border-[#E8EAEC] shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8EAEC] bg-[#F8F9FA] text-[#737A84] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Nomor Tagihan</th>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3 text-right">Nominal Sewa</th>
                  <th className="py-2.5 px-3 text-right">Denda</th>
                  <th className="py-2.5 px-3 text-right">Sisa Tagihan</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F4]">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F6F7F9] transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#26292E]">
                      {b.nomor}
                    </td>
                    <td className="py-3 px-3 text-[#26292E] font-medium">
                      {b.periodeLabel}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-[#26292E]">
                      {formatRupiah(b.nominalSewa)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#D32F2F]">
                      {b.denda > 0 ? formatRupiah(b.denda) : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#26292E]">
                      {b.sisaTotal > 0 ? formatRupiah(b.sisaTotal) : "-"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === "lunas"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : b.status === "sebagian"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-rose-100 text-rose-900 border border-rose-300"
                        }`}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {b.status !== "lunas" ? (
                        <Link
                          href={`/dashboard/tagihan?nomor=${encodeURIComponent(b.nomor)}&pay=online`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-[11px] font-semibold transition border border-white/10"
                        >
                          <span>Bayar Online</span>
                          <ExternalLink className="w-3 h-3 text-[#88BC3C]" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold">
                          Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SEKSI 4: LAPORAN KERUSAKAN SAYA (US-07)                                   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#26292E] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#26292E]" />
            <span>Laporan Kerusakan Saya</span>
          </h2>
          <Link
            href="/dashboard/kerusakan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#26292E] hover:underline"
          >
            <span>+ Buat Laporan Baru</span>
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 rounded-[24px] bg-white border border-[#E8EAEC] text-center text-xs text-[#737A84]">
            Tidak ada laporan kerusakan aktif. Semua fasilitas kamar Anda berfungsi dengan baik.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="rounded-[24px] bg-white p-5 border border-[#E8EAEC] shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#26292E]">
                      {rep.nomor}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        rep.status === "selesai" || rep.status === "ditutup"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : rep.status === "diproses"
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : rep.status === "menunggu_persetujuan"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-[#F6F7F9] text-[#737A84] border border-[#E8EAEC]"
                      }`}
                    >
                      {rep.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#26292E] mt-1">
                    {rep.deskripsi}
                  </p>
                  <span className="text-[10px] text-[#737A84]">
                    Kategori: {rep.kategori}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F0F2F4] flex justify-end">
                  <Link
                    href="/dashboard/kerusakan"
                    className="text-[11px] font-semibold text-[#26292E] hover:underline flex items-center gap-1"
                  >
                    <span>Pantau Tindak Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
