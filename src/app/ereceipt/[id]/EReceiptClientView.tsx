"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Printer,
  ArrowLeft,
  Share2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
} from "lucide-react";

export interface EReceiptData {
  id: string;
  nomor: string;
  periode: string;
  jatuh_tempo: string;
  nominal_sewa: number;
  denda: number;
  terbayar: number;
  status: string;
  dibayar_at: string;
  unit_kode: string;
  unit_tipe: string;
  penyewa_nama: string;
  penyewa_email: string;
  penyewa_hp: string;
  metode_pembayaran: string;
  referensi_transaksi?: string | null;
  nama_pencatat?: string | null;
}

function formatRupiah(amount: number): string {
  return "Rp. " + new Intl.NumberFormat("id-ID").format(amount);
}

function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function getPeriodeBulan(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export function EReceiptClientView({ data }: { data: EReceiptData }) {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subtotal = data.nominal_sewa + (data.denda || 0);
  const total = data.terbayar > 0 ? data.terbayar : subtotal;
  const periodeBulan = getPeriodeBulan(data.periode);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center py-6 sm:py-10 px-4 print:bg-white print:p-0 print:m-0 selection:bg-blue-100 font-sans">
      {/* Top action bar on screen (hidden on print) */}
      <div className="max-w-[794px] w-full flex items-center justify-between mb-4 text-xs text-slate-600 print:hidden px-2">
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition cursor-pointer font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali / Tutup</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer shadow-xs font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Tersalin!" : "Salin Tautan"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1E293B] hover:bg-[#0F172A] text-white transition cursor-pointer shadow-xs font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* DOKUMEN INVOICE STANDAR A4 RESMI */}
      <div className="max-w-[794px] w-full bg-white shadow-2xl rounded-sm print:shadow-none print:w-full print:max-w-none p-10 sm:p-14 relative overflow-hidden text-slate-900">
        
        {/* Dekorasi Aksen Segitiga Pink & Biru khas Mayar di sudut kanan bawah (Hanya jika Mayar) */}
        {data.metode_pembayaran === "mayar" && (
          <div className="absolute right-0 bottom-0 pointer-events-none select-none z-0">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M180 90L90 180H180V90Z" fill="#F43F5E" />
              <path d="M180 125L125 180H180V125Z" fill="#2563EB" />
            </svg>
          </div>
        )}

        {/* 1. HEADER: Logo Perusahaan di Kiri, Tulisan INVOICE Besar di Kanan */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <Image
                src="/logo-griya-kenanga.png"
                alt="Logo Griya Kenanga Residence"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                Griya Kenanga Residence
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Kos Eksklusif & Hunian Nyaman Sleman
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#1E293B]">
              INVOICE
            </h2>
            {/* Teks Status: Standar 'LUNAS' untuk Tunai, 'Terkonfirmasi Lunas (Mayar)' untuk Mayar */}
            <p className="mt-1 font-bold text-sm tracking-wider text-slate-900 uppercase">
              {data.metode_pembayaran === "mayar" ? "Terkonfirmasi Lunas (Mayar)" : "LUNAS"}
            </p>
          </div>
        </div>

        {/* 2. BAGIAN INFORMASI: Kiri (Kepada) & Kanan (Nomor & Tanggal Invoice) */}
        <div className="grid grid-cols-2 gap-8 py-8 relative z-10 text-xs">
          {/* Kolom Kiri: Kepada */}
          <div className="space-y-2">
            <span className="font-bold text-slate-950 text-sm tracking-wide block">
              Kepada :
            </span>
            <div className="text-slate-700 space-y-0.5 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">{data.penyewa_nama}</p>
              <p className="font-semibold text-blue-700">
                Unit {data.unit_kode} ({data.unit_tipe})
              </p>
              <p className="text-slate-500">{data.penyewa_email}</p>
              <p className="text-slate-500">{data.penyewa_hp || "+62 812-3456-7890"}</p>
            </div>
          </div>

          {/* Kolom Kanan: Detail Dokumen */}
          <div className="space-y-4 text-right">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                NO. INVOICE
              </span>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                {data.nomor}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                TANGGAL INVOICE
              </span>
              <span className="text-sm font-bold text-slate-900">
                {formatTanggalIndo(data.periode)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                TANGGAL PEMBAYARAN
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {formatTanggalIndo(data.dibayar_at)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. TABEL RINCIAN BIAYA (Itemized Table khas Mayar dengan Header Hitam) */}
        <div className="relative z-10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1E293B] text-white">
                <th className="py-2.5 px-4 text-left font-bold tracking-wider uppercase w-1/2">
                  PRODUK
                </th>
                <th className="py-2.5 px-4 text-right font-bold tracking-wider uppercase">
                  HARGA
                </th>
                <th className="py-2.5 px-4 text-center font-bold tracking-wider uppercase">
                  JUMLAH
                </th>
                <th className="py-2.5 px-4 text-right font-bold tracking-wider uppercase">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Baris 1: Sewa Unit Kamar */}
              <tr className="text-slate-800">
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  <span className="font-bold block">
                    Sewa Kamar Unit {data.unit_kode} ({data.unit_tipe})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Periode Sewa Bulan {periodeBulan || formatTanggalIndo(data.periode)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
                  {formatRupiah(data.nominal_sewa)}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                  1
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                  {formatRupiah(data.nominal_sewa)}
                </td>
              </tr>

              {/* Baris 2: Denda jika ada */}
              {data.denda > 0 && (
                <tr className="text-slate-800 bg-rose-50/40">
                  <td className="py-3.5 px-4 font-medium text-rose-800">
                    <span className="font-bold block">Denda Keterlambatan Pembayaran</span>
                    <span className="text-[11px] text-rose-600">
                      Pelanggaran jatuh tempo tanggal 10
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-700 font-medium">
                    {formatRupiah(data.denda)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-rose-700 font-medium">
                    1
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-rose-800">
                    {formatRupiah(data.denda)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. BAGIAN BAWAH TABEL: Informasi Pembayaran di Kiri, Ringkasan di Kanan */}
        <div className="grid grid-cols-2 gap-8 pt-6 pb-8 border-b border-slate-100 relative z-10 text-xs">
          {/* Kiri: Informasi Pembayaran Gateway Mayar */}
          <div className="space-y-1.5 self-start">
            <span className="font-bold text-slate-900 uppercase tracking-wide block">
              INFORMASI PEMBAYARAN:
            </span>
            <div className="text-slate-600 space-y-1 text-[11px]">
              <p>
                Metode Pembayaran :{" "}
                <strong className="text-slate-800 capitalize font-semibold">
                  {data.metode_pembayaran === "mayar"
                    ? "Mayar Payment Gateway (Otomatis)"
                    : "Pembayaran Tunai"}
                </strong>
              </p>
              <p>
                Status Transaksi :{" "}
                <strong className="text-emerald-700 font-bold">
                  {data.metode_pembayaran === "mayar"
                    ? "TERKONFIRMASI LUNAS (MAYAR)"
                    : "LUNAS"}
                </strong>
              </p>
              {/* Tampilkan bagian pencatat jika tunai, sembunyikan jika mayar */}
              {data.metode_pembayaran === "tunai" && (
                <p>
                  Dicatat:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {data.nama_pencatat || "Pengelola Kos"}
                  </strong>
                </p>
              )}
              {data.referensi_transaksi && (
                <p>
                  No. Referensi / ID :{" "}
                  <strong className="text-slate-800 font-mono">
                    {data.referensi_transaksi}
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* Kanan: Ringkasan Total Dokumen */}
          <div className="space-y-2 text-right">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                SUBTOTAL
              </span>
              <span className="font-semibold text-slate-800">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                PAJAK
              </span>
              <span className="font-semibold text-slate-800">0</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="font-black text-slate-950 uppercase tracking-wider text-sm">
                TOTAL
              </span>
              <span className="font-black text-lg text-slate-950">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </div>

        {/* 5. SYARAT & KETENTUAN (Standar Sewa Hunian Kos) */}
        <div className="pt-6 pb-12 relative z-10 text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block">
            SYARAT & KETENTUAN
          </span>
          <p>
            1. Dokumen ini merupakan bukti pembayaran elektronik resmi (e-receipt / kwitansi) yang sah dan diterbitkan secara resmi setelah dana tercatat lunas pada sistem Griya Kenanga Residence.
          </p>
          <p>
            2. Pembayaran sewa mencakup fasilitas kamar sesuai dengan kontrak yang disepakati. Pembayaran yang telah terkonfirmasi lunas tidak dapat dibatalkan atau dikembalikan secara sepihak.
          </p>
          <p>
            3. Harap simpan dokumen tanda bukti digital ini untuk keperluan administrasi dan pencatatan riwayat sewa Anda.
          </p>
        </div>

        {/* 6. FOOTER: Informasi Kontak Kiri, Brand Mayar di Kanan (Jika Mayar) */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 relative z-10">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="w-3 h-3" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">No. Telepon</span>
                <span className="font-semibold text-slate-800">+62 812-9876-5432</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="w-3 h-3" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Email</span>
                <span className="font-semibold text-slate-800">ratna.griyakenanga@gmail.com</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Alamat</span>
                <span className="font-semibold text-slate-800">Sleman, D.I. Yogyakarta</span>
              </div>
            </div>
          </div>

          {/* Logo & Teks Mayar SimplePay di Sudut Kanan Bawah: Hanya tampil jika metode === 'mayar', sembunyikan jika tunai */}
          {data.metode_pembayaran === "mayar" && (
            <div className="text-right shrink-0">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-xl font-black italic tracking-tight text-[#1E40AF]">
                  Mayar
                </span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
                SimplePay
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
