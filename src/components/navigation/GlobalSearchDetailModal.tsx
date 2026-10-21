"use client";

import React from "react";
import {
  X,
  Home,
  Users,
  Receipt,
  FileSignature,
  Wrench,
  ExternalLink,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Layers,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { GlobalSearchResult } from "@/lib/actions/search-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GlobalSearchDetailModalProps {
  item: GlobalSearchResult | null;
  onClose: () => void;
}

export function GlobalSearchDetailModal({ item, onClose }: GlobalSearchDetailModalProps) {
  const router = useRouter();
  if (!item) return null;

  const raw = item.rawDetails || {};

  // Status Badge Helper
  const getBadgeClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "tersedia":
      case "lunas":
      case "aktif":
      case "terverifikasi":
      case "selesai":
      case "ditutup":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "belum_bayar":
      case "belum":
      case "perbaikan":
      case "diproses":
      case "dilaporkan":
      case "menunggu_persetujuan":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "sebagian":
      case "draf":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "dibatalkan":
      case "diakhiri":
      case "ditolak":
      case "nonaktif":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E8EAEC] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EAEC] bg-[#F6F7F9]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1C1E22] text-[#88BC3C] flex items-center justify-center shrink-0 shadow-sm border border-white/10">
              {item.category === "unit" && <Home className="w-5 h-5" />}
              {item.category === "penyewa" && <Users className="w-5 h-5" />}
              {item.category === "tagihan" && <Receipt className="w-5 h-5" />}
              {item.category === "kontrak" && <FileSignature className="w-5 h-5" />}
              {item.category === "kerusakan" && <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E8EAEC]">
                  {item.categoryLabel}
                </span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getBadgeClass(
                      item.badge
                    )}`}
                  >
                    {item.badge.replace("_", " ")}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[#26292E] truncate mt-0.5">
                {item.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#26292E] flex items-center justify-center transition border border-[#E8EAEC] cursor-pointer shadow-xs"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Konten Rincian Berdasarkan Kategori */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#26292E]">
          {/* ==================================================== */}
          {/* DETAIL KATEGORI: UNIT */}
          {/* ==================================================== */}
          {item.category === "unit" && raw.unit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F6F7F9] p-3.5 rounded-2xl border border-[#E8EAEC]">
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                    Kode Unit &amp; Blok
                  </span>
                  <span className="text-base font-black text-[#26292E] mt-0.5 block">
                    Unit {raw.unit.kode}
                  </span>
                  <span className="text-[11px] text-[#737A84]">
                    Lantai {raw.unit.lantai} · Blok {raw.unit.kode.charAt(0)}
                  </span>
                </div>

                <div className="bg-[#F6F7F9] p-3.5 rounded-2xl border border-[#E8EAEC]">
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                    Harga Sewa
                  </span>
                  <span className="text-base font-black text-[#26292E] mt-0.5 block">
                    Rp{raw.unit.harga_sewa_bulanan.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[11px] text-[#737A84]">per bulan</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAEC] divide-y divide-[#E8EAEC]">
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Tipe Unit</span>
                  <span className="font-bold text-[#26292E] uppercase">
                    {raw.unit.tipe}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Luas Ruangan</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.unit.luas_m2 || 24} m²
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Status Ketersediaan</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getBadgeClass(
                      raw.unit.status
                    )}`}
                  >
                    {raw.unit.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Penghuni Aktif</span>
                  <span className="font-bold text-[#26292E]">
                    {raw.unit.penyewa_aktif || (
                      <span className="text-[#737A84] font-normal italic">
                        Tidak ada (Kosong)
                      </span>
                    )}
                  </span>
                </div>
                {raw.unit.kontrak_nomor && (
                  <div className="flex justify-between items-center py-2.5 px-4">
                    <span className="text-[#737A84]">Nomor Kontrak Aktif</span>
                    <span className="font-mono font-semibold text-[#26292E]">
                      {raw.unit.kontrak_nomor}
                    </span>
                  </div>
                )}
                {raw.unit.keterangan && (
                  <div className="py-2.5 px-4">
                    <span className="text-[#737A84] block mb-1">Catatan Tambahan:</span>
                    <p className="text-xs bg-[#F6F7F9] p-2 rounded-xl text-[#26292E]">
                      {raw.unit.keterangan}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DETAIL KATEGORI: PENYEWA */}
          {/* ==================================================== */}
          {item.category === "penyewa" && raw.penyewa && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#F6F7F9] p-4 rounded-2xl border border-[#E8EAEC]">
                <div className="w-14 h-14 rounded-2xl bg-[#1C1E22] text-[#88BC3C] flex items-center justify-center font-bold text-lg border border-[#5E8826]/40 shadow-xs">
                  {raw.penyewa.nama_lengkap
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#26292E]">
                    {raw.penyewa.nama_lengkap}
                  </h4>
                  <p className="text-xs text-[#737A84] mt-0.5">{raw.penyewa.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold uppercase bg-white border border-[#E8EAEC] px-2 py-0.5 rounded-md text-[#26292E]">
                      {raw.penyewa.peran}
                    </span>
                    {raw.penyewa.unit_kode && (
                      <span className="text-[10px] font-bold bg-[#1C1E22] text-[#88BC3C] px-2 py-0.5 rounded-md">
                        Unit {raw.penyewa.unit_kode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAEC] divide-y divide-[#E8EAEC]">
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> No. Telepon / WhatsApp
                  </span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.penyewa.no_hp || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> NIK KTP (Kependudukan)
                  </span>
                  <span className="font-mono font-semibold text-[#26292E]">
                    {raw.penyewa.nik || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Status Verifikasi
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getBadgeClass(
                      raw.penyewa.status_verifikasi || "belum"
                    )}`}
                  >
                    {raw.penyewa.status_verifikasi || "belum terverifikasi"}
                  </span>
                </div>
                {raw.penyewa.kontak_darurat_nama && (
                  <div className="flex justify-between items-center py-2.5 px-4">
                    <span className="text-[#737A84]">Kontak Darurat</span>
                    <span className="font-semibold text-[#26292E]">
                      {raw.penyewa.kontak_darurat_nama} (
                      {raw.penyewa.kontak_darurat_hp || "-"})
                    </span>
                  </div>
                )}
                {raw.penyewa.alamat_asal && (
                  <div className="py-2.5 px-4">
                    <span className="text-[#737A84] block mb-1">Alamat Domisili KTP:</span>
                    <p className="text-xs bg-[#F6F7F9] p-2 rounded-xl text-[#26292E]">
                      {raw.penyewa.alamat_asal}
                    </p>
                  </div>
                )}
                {raw.penyewa.alasan_tolak && (
                  <div className="py-2.5 px-4 bg-rose-50/60">
                    <span className="text-rose-700 font-bold block mb-1">
                      Catatan Penolakan Identitas:
                    </span>
                    <p className="text-xs text-rose-800 bg-white p-2 rounded-xl border border-rose-200">
                      {raw.penyewa.alasan_tolak}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DETAIL KATEGORI: TAGIHAN */}
          {/* ==================================================== */}
          {item.category === "tagihan" && raw.tagihan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F6F7F9] p-3.5 rounded-2xl border border-[#E8EAEC]">
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                    Total Kewajiban
                  </span>
                  <span className="text-base font-black text-[#26292E] mt-0.5 block">
                    Rp
                    {(
                      raw.tagihan.nominal_sewa + (raw.tagihan.denda || 0)
                    ).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[11px] text-[#737A84]">
                    Sewa: Rp{raw.tagihan.nominal_sewa.toLocaleString("id-ID")}
                    {raw.tagihan.denda > 0 &&
                      ` + Denda: Rp${raw.tagihan.denda.toLocaleString("id-ID")}`}
                  </span>
                </div>

                <div className="bg-[#1C1E22] text-white p-3.5 rounded-2xl border border-[#26292E]">
                  <span className="text-[10px] font-bold text-[#A0A6AF] uppercase tracking-wider block">
                    Sisa Belum Bayar
                  </span>
                  <span className="text-base font-black text-[#88BC3C] mt-0.5 block">
                    Rp{raw.tagihan.sisa.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[11px] text-[#A0A6AF]">
                    Terbayar: Rp{raw.tagihan.terbayar.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAEC] divide-y divide-[#E8EAEC]">
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Nomor Tagihan</span>
                  <span className="font-mono font-bold text-[#26292E]">
                    {raw.tagihan.nomor}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Unit Hunian</span>
                  <span className="font-bold text-[#26292E]">
                    Unit {raw.tagihan.unit_kode || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Nama Penyewa</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.tagihan.penyewa_nama || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Periode Sewa</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.tagihan.periode}
                  </span>
                </div>
                {raw.tagihan.jatuh_tempo && (
                  <div className="flex justify-between items-center py-2.5 px-4">
                    <span className="text-[#737A84]">Jatuh Tempo</span>
                    <span className="font-semibold text-[#26292E]">
                      {raw.tagihan.jatuh_tempo}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Status Pembayaran</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getBadgeClass(
                      raw.tagihan.status
                    )}`}
                  >
                    {raw.tagihan.status.replace("_", " ")}
                  </span>
                </div>
                {raw.tagihan.alasan_batal && (
                  <div className="py-2.5 px-4 bg-rose-50/60">
                    <span className="text-rose-700 font-bold block mb-1">
                      Alasan Pembatalan:
                    </span>
                    <p className="text-xs text-rose-800 bg-white p-2 rounded-xl border border-rose-200">
                      {raw.tagihan.alasan_batal}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DETAIL KATEGORI: KONTRAK */}
          {/* ==================================================== */}
          {item.category === "kontrak" && raw.kontrak && (
            <div className="space-y-4">
              <div className="bg-[#F6F7F9] p-4 rounded-2xl border border-[#E8EAEC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                    Kontrak Sewa
                  </span>
                  <span className="text-base font-black font-mono text-[#26292E]">
                    {raw.kontrak.nomor}
                  </span>
                  <span className="text-[11px] text-[#737A84] block mt-0.5">
                    Durasi {raw.kontrak.durasi_bulan} Bulan
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider block">
                    Tarif Bulanan
                  </span>
                  <span className="text-base font-black text-[#26292E]">
                    Rp{raw.kontrak.harga_sewa_bulanan.toLocaleString("id-ID")}
                  </span>
                  <span className="text-[11px] text-[#737A84] block mt-0.5">
                    per bulan
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAEC] divide-y divide-[#E8EAEC]">
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Unit Hunian</span>
                  <span className="font-bold text-[#26292E]">
                    Unit {raw.kontrak.unit_kode || "-"} (Lantai {raw.kontrak.lantai || 1})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Nama Penyewa</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.kontrak.penyewa_nama || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Masa Sewa</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.kontrak.tanggal_mulai} s.d. {raw.kontrak.tanggal_selesai}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Status Kontrak</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getBadgeClass(
                      raw.kontrak.status
                    )}`}
                  >
                    {raw.kontrak.status}
                  </span>
                </div>
                {raw.kontrak.alasan_berakhir && (
                  <div className="py-2.5 px-4 bg-amber-50/60">
                    <span className="text-amber-800 font-bold block mb-1">
                      Keterangan Pengakhiran / Batal:
                    </span>
                    <p className="text-xs text-amber-900 bg-white p-2 rounded-xl border border-amber-200">
                      {raw.kontrak.alasan_berakhir}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* DETAIL KATEGORI: KERUSAKAN */}
          {/* ==================================================== */}
          {item.category === "kerusakan" && raw.kerusakan && (
            <div className="space-y-4">
              <div className="bg-[#F6F7F9] p-4 rounded-2xl border border-[#E8EAEC]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#737A84] uppercase tracking-wider">
                    {raw.kerusakan.nomor} · Unit {raw.kerusakan.unit_kode || "-"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border ${getBadgeClass(
                      raw.kerusakan.status
                    )}`}
                  >
                    {raw.kerusakan.status.replace("_", " ")}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#26292E] mt-1">
                  {raw.kerusakan.judul}
                </h4>
                {raw.kerusakan.deskripsi && (
                  <p className="text-xs text-[#737A84] mt-2 leading-relaxed bg-white p-3 rounded-xl border border-[#E8EAEC]">
                    {raw.kerusakan.deskripsi}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#E8EAEC] divide-y divide-[#E8EAEC]">
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Kategori Kerusakan</span>
                  <span className="font-bold text-[#26292E] uppercase">
                    {raw.kerusakan.kategori || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Pelapor</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.kerusakan.pelapor_nama || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Estimasi Biaya</span>
                  <span className="font-semibold text-[#26292E]">
                    {raw.kerusakan.estimasi_biaya
                      ? `Rp${raw.kerusakan.estimasi_biaya.toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 px-4">
                  <span className="text-[#737A84]">Biaya Aktual</span>
                  <span className="font-bold text-[#26292E]">
                    {raw.kerusakan.biaya_aktual
                      ? `Rp${raw.kerusakan.biaya_aktual.toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </div>
                {raw.kerusakan.catatan && (
                  <div className="py-2.5 px-4">
                    <span className="text-[#737A84] block mb-1">Catatan Pengerjaan:</span>
                    <p className="text-xs bg-[#F6F7F9] p-2 rounded-xl text-[#26292E]">
                      {raw.kerusakan.catatan}
                    </p>
                  </div>
                )}
                {raw.kerusakan.alasan_tolak && (
                  <div className="py-2.5 px-4 bg-rose-50/60">
                    <span className="text-rose-700 font-bold block mb-1">
                      Alasan Penolakan:
                    </span>
                    <p className="text-xs text-rose-800 bg-white p-2 rounded-xl border border-rose-200">
                      {raw.kerusakan.alasan_tolak}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Modal: Buka Halaman Lengkap & Tutup */}
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-[#F6F7F9] border-t border-[#E8EAEC]">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
              if (item.href) {
                router.push(item.href);
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737A84] hover:text-[#26292E] transition cursor-pointer p-1 rounded-lg hover:bg-[#E8EAEC]/60"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Modul {item.categoryLabel} Lengkap</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-5 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
