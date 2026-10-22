"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Code2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Server,
  Zap,
  Globe,
  Radio,
  FileJson,
  X,
} from "lucide-react";
import { Navbar } from "@/components/navigation/Navbar";
import { UserProfile } from "@/lib/auth/guard";
import { BrowserWindowFrame } from "@/components/landing/BrowserWindowFrame";

export interface WebhookLogItem {
  id: string;
  event: string;
  invoice_id: string | null;
  transaction_id: string | null;
  amount: number | null;
  status: string;
  error_message: string | null;
  ip_address: string | null;
  created_at: string;
  payload: Record<string, unknown> | null;
}

interface SetelanClientViewProps {
  userProfile: UserProfile;
  isConnected: boolean;
  isMayarConfigured: boolean;
  isSecretKeyConfigured: boolean;
  isSandbox: boolean;
  baseUrlDomain: string;
  webhookUrl: string;
  initialLogs: WebhookLogItem[];
}

export function SetelanClientView({
  userProfile,
  isConnected,
  isMayarConfigured,
  isSecretKeyConfigured,
  isSandbox,
  baseUrlDomain,
  webhookUrl,
  initialLogs,
}: SetelanClientViewProps) {
  const [copied, setCopied] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<{
    id: string;
    event: string;
    payload: Record<string, unknown> | null;
  } | null>(null);

  // Format currency
  const formatRupiah = (val?: number | null) => {
    if (val === undefined || val === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Format date time
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(d) + " WIB"
      );
    } catch {
      return isoString;
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen relative font-sans select-text antialiased">
      {/* Background Image: Merapi & Tropical Garden with subtle 5% blur */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <img
          src="/images/griya-kenanga-12k-merapi.jpg?v=3"
          alt="Latar Belakang Eksklusif Griya Kenanga Residence"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-black/15"
          style={{ backdropFilter: "blur(0.6px)", WebkitBackdropFilter: "blur(0.6px)" }}
        />
      </div>

      <div className="relative z-10 w-full min-h-screen py-3 sm:py-6 lg:py-8 px-2 sm:px-5 lg:px-8 flex flex-col items-center">
        <BrowserWindowFrame url="griyakenanga.id/setelan" isDashboard>
          <div className="min-h-[85vh] bg-[#F6F7F9] text-[#26292E] pb-20">
            {/* Navbar Konsisten */}
            <Navbar userProfile={userProfile} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#737A84] mb-1">
              <Link href="/dashboard" className="hover:text-[#1C1E22] transition">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#1C1E22] font-semibold">Setelan</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#1C1E22] font-semibold">Payment Gateway</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C1E22] tracking-tight">
              Setelan Payment Gateway (Mayar V2)
            </h1>
            <p className="text-xs sm:text-sm text-[#737A84] mt-0.5">
              Kelola integrasi pembayaran online resmi, pantau status webhook, dan audit transaksi realtime.
            </p>
          </div>
        </div>

        {/* Status Gateway Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Status Koneksi */}
          <div className="bg-white rounded-[24px] p-5 border border-[#E8EAEC] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A84]">
                Status Server Gateway
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <h3 className="text-base font-black text-[#1C1E22]">
                  {isConnected ? "Terhubung & Aktif" : "Belum Terhubung"}
                </h3>
              </div>
              <p className="text-xs text-[#737A84] mt-1 leading-relaxed">
                {isConnected
                  ? "Environment Mayar API V2 dan Supabase Secret Key telah terverifikasi aman di server."
                  : "Variabel lingkungan belum lengkap di server. Periksa konfigurasi .env.local."}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F3F5] text-[11px] text-[#737A84] space-y-1">
              <div className="flex items-center justify-between">
                <span>Mayar API Key:</span>
                <span className={`font-semibold ${isMayarConfigured ? "text-emerald-700" : "text-rose-600"}`}>
                  {isMayarConfigured ? "Tersedia (Aman)" : "Belum Ada"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Secret Key Supabase:</span>
                <span className={`font-semibold ${isSecretKeyConfigured ? "text-emerald-700" : "text-rose-600"}`}>
                  {isSecretKeyConfigured ? "Tersedia (Server-Only)" : "Belum Ada"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Mode Operasi */}
          <div className="bg-white rounded-[24px] p-5 border border-[#E8EAEC] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A84]">
                Mode Operasi Mayar
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                  {isSandbox ? "Mode Sandbox" : "Mode Production"}
                </span>
              </div>
              <p className="text-xs text-[#737A84] mt-1.5 leading-relaxed">
                {isSandbox
                  ? "Transaksi disimulasikan menggunakan simulator Mayar tanpa memotong saldo bank asli."
                  : "Transaksi nyata menggunakan sistem perbankan nasional."}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F3F5] text-[11px] text-[#737A84]">
              <span className="block truncate">
                Base URL: <strong className="font-mono text-[#26292E]">{baseUrlDomain}</strong>
              </span>
            </div>
          </div>

          {/* Card 3: Keamanan & Zero-Trust */}
          <div className="bg-white rounded-[24px] p-5 border border-[#E8EAEC] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#737A84]">
                Protokol Keamanan
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-[#1C1E22]">Zero-Trust Inquiry</h3>
              <p className="text-xs text-[#737A84] mt-1 leading-relaxed">
                Setiap notifikasi webhook diverifikasi ulang langsung ke server Mayar sebelum invoice ditandai lunas.
              </p>
            </div>

            <div className="pt-2 border-t border-[#F1F3F5] text-[11px] text-emerald-800 flex items-center font-medium">
              <span>Proteksi RLS Owner</span>
            </div>
          </div>
        </div>

        {/* Webhook Configuration Section */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E8EAEC] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8EAEC]">
            <div>
              <h2 className="text-base font-extrabold text-[#1C1E22] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#737A84]" />
                <span>URL Webhook Mayar (Callback Handler)</span>
              </h2>
              <p className="text-xs text-[#737A84] mt-0.5">
                Salin URL di bawah ini ke Dashboard Mayar Anda pada menu Integrasi &gt; Webhook.
              </p>
            </div>
            <a
              href="https://dashboard.mayar.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8EAEC] hover:bg-[#F6F7F9] text-xs font-semibold text-[#26292E] transition shadow-2xs self-start sm:self-auto cursor-pointer"
            >
              <span>Buka Dashboard Mayar</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#737A84]" />
            </a>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1C1E22]">
              Webhook Endpoint URL Resmi
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-[#FAFBFB] border border-[#E8EAEC] rounded-2xl px-4 py-3 font-mono text-xs text-[#1C1E22] select-all break-all flex items-center">
                <span>{webhookUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-5 py-3 rounded-2xl bg-[#1C1E22] hover:bg-[#26292E] text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#88BC3C]" />
                    <span className="text-[#88BC3C]">Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin URL Webhook</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#737A84] leading-relaxed">
              Catatan: Pastikan webhook mengirimkan event <code className="bg-[#F0F2F4] px-1.5 py-0.5 rounded text-[#1C1E22] font-mono">payment.received</code> atau <code className="bg-[#F0F2F4] px-1.5 py-0.5 rounded text-[#1C1E22] font-mono">invoice.paid</code> untuk pemrosesan otomatis.
            </p>
          </div>
        </div>

        {/* 10 Baris Terakhir mayar_webhook_log */}
        <div className="bg-white rounded-[28px] border border-[#E8EAEC] shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-[#E8EAEC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#1C1E22]">
                  Riwayat Webhook Realtime (10 Baris Terakhir)
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F0F2F4] text-[#737A84]">
                  Tabel: mayar_webhook_log
                </span>
              </div>
              <p className="text-xs text-[#737A84] mt-0.5">
                Audit trail lengkap seluruh payload yang dikirimkan oleh server Mayar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAFBFB] hover:bg-[#F6F7F9] border border-[#E8EAEC] text-xs font-semibold text-[#26292E] transition shadow-2xs self-start sm:self-auto cursor-pointer"
              title="Perbarui Data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#737A84]" />
              <span>Segarkan</span>
            </button>
          </div>

          {initialLogs.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#F6F7F9] border border-[#E8EAEC] flex items-center justify-center mx-auto text-[#737A84]">
                <FileJson className="w-6 h-6 text-[#A0A6AF]" />
              </div>
              <p className="text-xs font-bold text-[#1C1E22]">Belum ada riwayat webhook</p>
              <p className="text-[11px] text-[#737A84] max-w-sm mx-auto">
                Riwayat akan otomatis tercatat di sini saat Mayar mengirimkan callback notifikasi pembayaran invoice pertama.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAFBFB] border-b border-[#E8EAEC] text-[#737A84] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">Waktu (WIB)</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Status Verifikasi</th>
                    <th className="py-3 px-5 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5]">
                  {initialLogs.map((log) => {
                    const isSuccess =
                      log.status === "verified_success" ||
                      log.status === "success" ||
                      log.status === "diterima";
                    const isFailed =
                      log.status === "error" ||
                      log.status === "ditolak" ||
                      Boolean(log.error_message);

                    return (
                      <tr key={log.id} className="hover:bg-[#FAFBFB] transition">
                        <td className="py-3.5 px-5 font-mono text-[11px] text-[#737A84] whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-[#1C1E22] bg-[#F0F2F4] px-2 py-0.5 rounded text-[11px] font-mono">
                            {log.event}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-[#26292E] whitespace-nowrap">
                          {log.invoice_id || "-"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#1C1E22] whitespace-nowrap">
                          {formatRupiah(log.amount)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              isSuccess
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isFailed
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {log.status}
                          </span>
                          {log.error_message && (
                            <span className="block text-[10px] text-rose-600 mt-0.5 max-w-[200px] truncate" title={log.error_message}>
                              {log.error_message}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPayload({
                                id: log.id,
                                event: log.event,
                                payload: log.payload,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#737A84] hover:text-[#1C1E22] hover:bg-[#E8EAEC] transition cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Lihat JSON</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL LIHAT DETAIL PAYLOAD JSON */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl border border-[#E8EAEC] space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAEC]">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#737A84] uppercase">
                  Log ID: {selectedPayload.id.slice(0, 8)}...
                </span>
                <h3 className="text-base font-extrabold text-[#1C1E22]">
                  Payload Webhook ({selectedPayload.event})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="text-[#737A84] hover:text-[#1C1E22] p-1 rounded-lg hover:bg-[#F6F7F9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#1C1E22] text-[#88BC3C] p-4 rounded-2xl font-mono text-xs border border-white/10">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(selectedPayload.payload, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayload(null)}
                className="px-4 py-2 rounded-full bg-[#1C1E22] text-white text-xs font-semibold hover:bg-[#26292E] transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </BrowserWindowFrame>
      </div>
    </div>
  );
}
