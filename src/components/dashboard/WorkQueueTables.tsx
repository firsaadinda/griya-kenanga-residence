"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Wrench,
  FileSignature,
  ArrowRight,
  Clock,
  Shield,
  CreditCard,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export interface OverdueBillItem {
  id: string;
  nomor: string;
  unitKode: string;
  penyewaNama: string;
  sisaPokok: number;
  dendaHariIni: number;
  totalHariIni: number;
  status: "belum_bayar" | "sebagian";
}

export interface OpenDamageReportItem {
  id: string;
  nomor: string;
  unitKode: string;
  deskripsi: string;
  status: "dilaporkan" | "diproses" | "menunggu_persetujuan";
}

export interface ActionContractItem {
  id: string;
  nomor: string;
  unitKode: string;
  penyewaNama: string;
  tipeAksi: "berakhir_segera" | "draf_verifikasi_ktp" | "draf_menunggu_selesai";
  keterangan: string;
}

interface WorkQueueTablesProps {
  overdueBills: OverdueBillItem[];
  openReports: OpenDamageReportItem[];
  actionContracts: ActionContractItem[];
  userRole: "pemilik" | "pengelola" | "penyewa";
}

export function WorkQueueTables({
  overdueBills,
  openReports,
  actionContracts,
  userRole,
}: WorkQueueTablesProps) {
  const router = useRouter();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ========================================================================= */}
      {/* KOLOM KIRI (7 SPAN): TABEL TAGIHAN LEWAT JATUH TEMPO                      */}
      {/* ========================================================================= */}
      <div className="lg:col-span-7 rounded-[28px] bg-white p-5 sm:p-6 border border-[#E8EAEC] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F4]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-pulse"></span>
            <h3 className="text-sm font-bold text-[#26292E]">
              Tagihan lewat jatuh tempo
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
            {overdueBills.length} Tagihan
          </span>
        </div>

        {/* Tabel 7 Tagihan Lewat Jatuh Tempo (Wireframe Hal 1) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8EAEC] text-[#737A84] text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-2">Nomor</th>
                <th className="py-2.5 px-2">Unit</th>
                <th className="py-2.5 px-2">Penyewa</th>
                <th className="py-2.5 px-2 text-right">Sisa + denda hari ini</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {overdueBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#F6F7F9] transition">
                  <td className="py-3 px-2 font-mono text-[11px] font-bold text-[#26292E] whitespace-nowrap">
                    {bill.nomor}
                  </td>
                  <td className="py-3 px-2 font-bold text-[#26292E] whitespace-nowrap">
                    {bill.unitKode}
                  </td>
                  <td className="py-3 px-2 font-medium text-[#26292E] whitespace-nowrap">
                    {bill.penyewaNama}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    <span className="font-bold text-[#26292E] block">
                      {formatRupiah(bill.totalHariIni)}
                    </span>
                    <span className="text-[10px] text-[#D32F2F] font-semibold block">
                      denda {formatRupiah(bill.dendaHariIni)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        bill.status === "sebagian"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {bill.status === "sebagian" ? "sebagian" : "belum bayar"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap">
                    {userRole === "pengelola" ? (
                      /* Pengelola berhak mengeksekusi pencatatan pembayaran (BR-08) */
                      <Link
                        href={`/dashboard/tagihan?nomor=${encodeURIComponent(bill.nomor)}&action=pay`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#1C1E22] hover:bg-[#26292E] text-white text-[11px] font-semibold shadow-xs transition"
                      >
                        <span>Catat bayar</span>
                      </Link>
                    ) : (
                      /* Pemilik bersifat monitoring / melihat detail (BR-08 & PRD Bagian 3) */
                      <Link
                        href={`/dashboard/tagihan?nomor=${encodeURIComponent(bill.nomor)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6F7F9] hover:bg-[#E8EAEC] text-[#26292E] text-[11px] font-medium border border-[#E8EAEC] transition"
                        title="Pemilik: Mode monitoring tagihan"
                      >
                        <span>Detail</span>
                        <ExternalLink className="w-3 h-3 text-[#737A84]" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KOLOM KANAN (5 SPAN): LAPORAN KERUSAKAN & KONTRAK PERLU TINDAKAN         */}
      {/* ========================================================================= */}
      <div className="lg:col-span-5 space-y-6">
        {/* KOTAK 1: LAPORAN KERUSAKAN TERBUKA (5 LAPORAN) */}
        <div className="rounded-[28px] bg-white p-5 sm:p-6 border border-[#E8EAEC] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F4]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#26292E]" />
              <h3 className="text-sm font-bold text-[#26292E]">
                Laporan kerusakan terbuka
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6F7F9] text-[#26292E] text-[11px] font-bold border border-[#E8EAEC]">
              {openReports.length} Laporan
            </span>
          </div>

          <div className="divide-y divide-[#F0F2F4]">
            {openReports.map((report) => (
              <Link
                key={report.id}
                href="/dashboard/kerusakan"
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#F6F7F9] px-2 rounded-xl transition group"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-mono font-bold text-[#26292E] block">
                    {report.nomor}
                  </span>
                  <p className="text-xs text-[#737A84] truncate">
                    <strong className="text-[#26292E] font-semibold">{report.unitKode}</strong> · {report.deskripsi}
                  </p>
                </div>
                <div className="shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      report.status === "menunggu_persetujuan"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : report.status === "diproses"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "bg-[#F6F7F9] text-[#737A84] border border-[#E8EAEC]"
                    }`}
                  >
                    {report.status === "menunggu_persetujuan"
                      ? "menunggu persetujuan"
                      : report.status === "diproses"
                      ? "diproses"
                      : "dilaporkan"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* KOTAK 2: KONTRAK PERLU TINDAKAN (5 KONTRAK) */}
        <div className="rounded-[28px] bg-white p-5 sm:p-6 border border-[#E8EAEC] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#F0F2F4]">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[#26292E]" />
              <h3 className="text-sm font-bold text-[#26292E]">
                Kontrak perlu tindakan
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6F7F9] text-[#26292E] text-[11px] font-bold border border-[#E8EAEC]">
              {actionContracts.length} Kontrak
            </span>
          </div>

          <div className="divide-y divide-[#F0F2F4]">
            {actionContracts.map((contract) => (
              <Link
                key={contract.id}
                href="/dashboard/kontrak"
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#F6F7F9] px-2 rounded-xl transition group"
              >
                <div className="min-w-0">
                  <span className="text-[11px] font-mono font-bold text-[#26292E] block">
                    {contract.nomor} · {contract.unitKode}
                  </span>
                  <p className="text-xs text-[#26292E] font-medium truncate">
                    {contract.penyewaNama}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                      contract.tipeAksi === "berakhir_segera"
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : contract.tipeAksi === "draf_verifikasi_ktp"
                        ? "bg-amber-50 text-amber-900 border border-amber-300"
                        : "bg-blue-50 text-blue-900 border border-blue-200"
                    }`}
                  >
                    {contract.keterangan}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
