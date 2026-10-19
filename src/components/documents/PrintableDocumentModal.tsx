"use client";

import React from "react";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";

export type PrintableDocumentType = "invoice" | "kontrak";

export interface InvoiceDocData {
  nomor: string;
  periode: string;
  jatuh_tempo: string;
  unit_kode: string;
  unit_tipe: string;
  lantai?: number | string;
  penyewa_nama: string;
  penyewa_email: string;
  penyewa_hp?: string | null;
  nominal_sewa: number;
  denda: number;
  terbayar: number;
  status: "belum_bayar" | "sebagian" | "lunas" | "dibatalkan";
  pembayaranList?: Array<{
    id: string;
    jumlah: number;
    metode: string;
    tanggal_bayar: string;
    nama_bank?: string | null;
    status: string;
  }>;
}

export interface KontrakDocData {
  nomor: string;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_bulan: number;
  harga_sewa_bulanan: number;
  unit_kode: string;
  unit_tipe: string;
  lantai: number | string;
  penyewa_nama: string;
  penyewa_email: string;
}

interface PrintableDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PrintableDocumentType;
  invoiceData?: InvoiceDocData | null;
  kontrakData?: KontrakDocData | null;
}

/**
 * Modal Pratinjau Dokumen Cetak & PDF
 * Memanfaatkan HTML Print Stylesheet murni (window.print() dengan CSS @media print)
 * Bebas ketergantungan library PDF berat, resolusi tajam, ukuran A4 standar resmi.
 */
export function PrintableDocumentModal({
  isOpen,
  onClose,
  type,
  invoiceData,
  kontrakData,
}: PrintableDocumentModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatTanggalIndo = (tglStr?: string) => {
    if (!tglStr) return "-";
    try {
      const d = new Date(tglStr);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return tglStr;
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Container Modal (Tampilan Layar Browser) */}
      <div className="bg-white rounded-[28px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8EAEC] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header Aksi Modal (Disembunyikan saat window.print() berjalan) */}
        <div className="no-print sticky top-0 bg-white/95 backdrop-blur-xs z-10 px-6 py-4 border-b border-[#E8EAEC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1C1E22] text-[#D2F367] flex items-center justify-center font-bold text-xs shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1E22]">
                {type === "invoice" ? "E-Kwitansi & Invoice Tagihan" : "Ringkasan Resmi Kontrak Sewa"}
              </h3>
              <p className="text-[11px] text-[#737A84]">
                Format Dokumen Resmi A4 Berstandar Griya Kenanga Residence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-sm transition cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-[#D2F367]" />
              <span>Simpan sebagai PDF / Cetak</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#737A84] hover:text-[#1C1E22] flex items-center justify-center transition cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Konten Dokumen Fisik / Cetak (Ukuran A4 Clean Layout) */}
        <div
          id="printable-document"
          className="p-8 sm:p-12 text-[#1C1E22] bg-white font-sans text-xs leading-relaxed space-y-6"
        >
          {/* KOP SURAT RESMI PERUMAHAN */}
          <div className="border-b-2 border-[#1C1E22] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-[#1C1E22] text-[#D2F367] font-bold text-[9px] tracking-widest uppercase mb-1">
                Griya Kenanga Residence
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#1C1E22]">
                GRIYA KENANGA RESIDENCE
              </h1>
              <p className="text-[#737A84] text-[11px] mt-0.5 font-medium">
                Hunian Kost Eksklusif &amp; Studio Sewa Terpadu &bull; Sleman, D.I. Yogyakarta
              </p>
              <p className="text-[#737A84] text-[10px]">
                Jl. Kenanga No. 45, Condongcatur, Sleman &bull; Email: billing@griyakenanga.id &bull; Telp: (0274) 889-102
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-[#E8EAEC]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#737A84] block">
                {type === "invoice" ? "BUKTI PEMBAYARAN ELEKTRONIK (E-KWITANSI)" : "RINGKASAN RESMI KONTRAK SEWA"}
              </span>
              <span className="font-mono font-bold text-sm text-[#1C1E22] block">
                {type === "invoice" ? invoiceData?.nomor : kontrakData?.nomor}
              </span>
              <span className="text-[10px] text-[#737A84] block">
                Tanggal Terbit: {formatTanggalIndo(new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* DOKUMEN TIPE: INVOICE / KWITANSI */}
          {type === "invoice" && invoiceData && (
            <div className="space-y-6">
              {/* Badge Stempel Status Pelunasan */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC]">
                <div>
                  <span className="text-[#737A84] text-[10px] uppercase font-bold tracking-wider block">
                    Status Dokumen Tagihan
                  </span>
                  <span className="font-extrabold text-base text-[#1C1E22] uppercase tracking-wide">
                    {invoiceData.status === "lunas"
                      ? "LUNAS (PAID IN FULL)"
                      : invoiceData.status === "sebagian"
                      ? "TERBAYAR SEBAGIAN"
                      : "BELUM LUNAS"}
                  </span>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                    invoiceData.status === "lunas"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : invoiceData.status === "sebagian"
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-rose-50 text-rose-800 border-rose-300"
                  }`}
                >
                  {invoiceData.status === "lunas" ? "✓ LUNAS" : invoiceData.status === "sebagian" ? "SEBAGIAN" : "! BELUM LUNAS"}
                </div>
              </div>

              {/* Rincian Identitas Penyewa & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-[#E8EAEC] bg-white">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                    Identitas Penyewa (Penghuni)
                  </span>
                  <p className="font-bold text-sm text-[#1C1E22]">{invoiceData.penyewa_nama}</p>
                  <p className="text-[11px] text-[#737A84]">{invoiceData.penyewa_email}</p>
                  {invoiceData.penyewa_hp && (
                    <p className="text-[11px] text-[#737A84]">WhatsApp/HP: {invoiceData.penyewa_hp}</p>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                    Objek &amp; Periode Sewa
                  </span>
                  <p className="font-bold text-sm text-[#1C1E22]">Unit {invoiceData.unit_kode}</p>
                  <p className="text-[11px] text-[#737A84]">
                    Tipe: <span className="uppercase font-semibold">{invoiceData.unit_tipe}</span>
                    {invoiceData.lantai ? ` &bull; Lantai ${invoiceData.lantai}` : ""}
                  </p>
                  <p className="text-[11px] text-[#737A84]">
                    Periode: <strong>{invoiceData.periode}</strong> &bull; Jatuh Tempo: <strong>{formatTanggalIndo(invoiceData.jatuh_tempo)}</strong>
                  </p>
                </div>
              </div>

              {/* Tabel Rincian Keuangan */}
              <div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#1C1E22] text-[#737A84] text-[10px] uppercase tracking-wider font-bold">
                      <th className="py-2.5">Deskripsi Komponen Tagihan</th>
                      <th className="py-2.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAEC]">
                    <tr>
                      <td className="py-3">
                        <span className="font-semibold text-[#1C1E22] block">
                          Biaya Sewa Unit {invoiceData.unit_kode} ({invoiceData.periode})
                        </span>
                        <span className="text-[10px] text-[#737A84]">
                          Tarif sewa bulanan terkunci resmi (Sesuai Aturan Bisnis BR-04)
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-[#1C1E22]">
                        {formatRupiah(invoiceData.nominal_sewa)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3">
                        <span className="font-semibold text-[#1C1E22] block">
                          Denda Keterlambatan Pembayaran
                        </span>
                        <span className="text-[10px] text-[#737A84]">
                          Rp20.000/hari setelah tanggal 10 (Maksimal Rp200.000, Aturan Bisnis BR-07)
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-rose-600">
                        {invoiceData.denda > 0 ? formatRupiah(invoiceData.denda) : "Rp0"}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#1C1E22]">
                      <td className="py-2.5 font-bold text-xs uppercase">Total Kewajiban</td>
                      <td className="py-2.5 text-right font-black text-sm text-[#1C1E22]">
                        {formatRupiah(invoiceData.nominal_sewa + invoiceData.denda)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-[#737A84]">Telah Dibayar (Terbayar Sah)</td>
                      <td className="py-1.5 text-right font-bold text-emerald-700">
                        (-) {formatRupiah(invoiceData.terbayar)}
                      </td>
                    </tr>
                    <tr className="border-t border-[#E8EAEC]">
                      <td className="py-2.5 font-bold text-xs text-[#1C1E22] uppercase">
                        Sisa Tagihan
                      </td>
                      <td className="py-2.5 text-right font-black text-base text-[#1C1E22]">
                        {formatRupiah(
                          Math.max(0, invoiceData.nominal_sewa + invoiceData.denda - invoiceData.terbayar)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Rincian Riwayat Pembayaran Masuk (Multi-Payment Breakdown) */}
              {invoiceData.pembayaranList && invoiceData.pembayaranList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                    Riwayat Pembayaran Sah yang Diterima
                  </span>
                  <div className="space-y-1.5">
                    {invoiceData.pembayaranList.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBFB] border border-[#E8EAEC] text-[11px]"
                      >
                        <div>
                          <span className="font-semibold text-[#1C1E22]">
                            {formatTanggalIndo(p.tanggal_bayar)}
                          </span>
                          <span className="text-[#737A84] ml-2">
                            Metode: <strong className="uppercase">{p.metode}</strong>
                            {p.nama_bank ? ` (${p.nama_bank})` : ""}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700">
                          {formatRupiah(p.jumlah)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DOKUMEN TIPE: KONTRAK */}
          {type === "kontrak" && kontrakData && (
            <div className="space-y-6">
              {/* Info Rangkuman Pihak & Unit */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAFBFB] border border-[#E8EAEC]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                    Pihak Penyewa (Pihak Kedua)
                  </span>
                  <p className="font-bold text-sm text-[#1C1E22]">{kontrakData.penyewa_nama}</p>
                  <p className="text-[11px] text-[#737A84]">{kontrakData.penyewa_email}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                    Objek Sewa Unit
                  </span>
                  <p className="font-bold text-sm text-[#1C1E22]">Unit {kontrakData.unit_kode}</p>
                  <p className="text-[11px] text-[#737A84]">
                    Tipe: <span className="uppercase font-semibold">{kontrakData.unit_tipe}</span> &bull; Lantai {kontrakData.lantai}
                  </p>
                </div>
              </div>

              {/* Ketentuan Sewa */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#1C1E22] border-b pb-1">
                  Pasal &amp; Ketentuan Pokok Perjanjian Sewa
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl border border-[#E8EAEC] bg-[#FAFBFB]">
                    <span className="text-[10px] text-[#737A84] block">Tanggal Mulai</span>
                    <strong className="font-bold text-[#1C1E22]">
                      {formatTanggalIndo(kontrakData.tanggal_mulai)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E8EAEC] bg-[#FAFBFB]">
                    <span className="text-[10px] text-[#737A84] block">Durasi Masa Sewa</span>
                    <strong className="font-bold text-[#1C1E22]">
                      {kontrakData.durasi_bulan} Bulan
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl border border-[#E8EAEC] bg-[#FAFBFB]">
                    <span className="text-[10px] text-[#737A84] block">Tanggal Selesai</span>
                    <strong className="font-bold text-[#1C1E22]">
                      {formatTanggalIndo(kontrakData.tanggal_selesai)}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E8EAEC] bg-white flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#1C1E22] block">
                      Harga Sewa Bulanan Terkunci (Aturan Bisnis BR-04)
                    </span>
                    <span className="text-[10px] text-[#737A84]">
                      Harga sewa tidak akan mengalami kenaikan selama masa kontrak sewa masih berlangsung.
                    </span>
                  </div>
                  <span className="font-black text-base text-[#1C1E22]">
                    {formatRupiah(kontrakData.harga_sewa_bulanan)} / bln
                  </span>
                </div>

                <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-[#737A84] leading-relaxed">
                  <li>Tagihan bulanan diterbitkan secara otomatis setiap tanggal 1 dan jatuh tempo pada tanggal 10 tiap bulannya.</li>
                  <li>Pembayaran yang melampaui tanggal 10 dikenakan denda keterlambatan sebesar Rp20.000/hari hingga batas maksimal Rp200.000 (BR-07).</li>
                  <li>Segala kerusakan fasilitas unit wajib segera dilaporkan melalui portal aplikasi Griya Kenanga Residence.</li>
                  <li>Penyewa berkewajiban mematuhi norma ketertiban bersama dan kebersihan lingkungan hunian Griya Kenanga Residence.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Kolom Tanda Tangan Resmi Pengelola & Penyewa */}
          <div className="pt-8 border-t border-[#E8EAEC] grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-14">
              <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                Pihak Pengelola Griya Kenanga Residence
              </span>
              <div className="border-b border-[#1C1E22] w-40 mx-auto"></div>
              <span className="font-bold text-[#1C1E22] block">Manajemen Operasional</span>
            </div>

            <div className="space-y-14">
              <span className="text-[10px] uppercase font-bold text-[#737A84] block">
                Pihak Penyewa (Penghuni)
              </span>
              <div className="border-b border-[#1C1E22] w-40 mx-auto"></div>
              <span className="font-bold text-[#1C1E22] block">
                {type === "invoice" ? invoiceData?.penyewa_nama : kontrakData?.penyewa_nama}
              </span>
            </div>
          </div>

          {/* Catatan Kaki Otomatis */}
          <div className="pt-4 border-t border-[#F1F5F9] text-center text-[9px] text-[#737A84]">
            Dokumen ini dicetak secara sah dan otomatis dari Sistem Informasi Manajemen Properti Griya Kenanga Residence.
          </div>
        </div>
      </div>

      {/* Global Print Stylesheet khusus saat window.print() dipanggil */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm 12mm 15mm;
          }
          *,
          *:before,
          *:after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html,
          body {
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            color: #1c1e22 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-document,
          #printable-document * {
            visibility: visible !important;
          }
          #printable-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
