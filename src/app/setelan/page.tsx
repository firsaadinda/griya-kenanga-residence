import { requireRole } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { SetelanClientView, WebhookLogItem } from "./SetelanClientView";
import { headers } from "next/headers";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Setelan Payment Gateway Mayar | Griya Kenanga Residence",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SetelanPage() {
  // Guard Ketat: HANYA Pemilik yang diizinkan (Pengelola & Penyewa WAJIB DITOLAK -> 403)
  const profile = await requireRole(["pemilik"], "/setelan");

  // 1. Cek Ketersediaan Kredensial Environment di Server (TANPA MEMBOCORKAN NILAINYA)
  const mayarApiKey = process.env.MAYAR_API_KEY || "";
  const isMayarConfigured = Boolean(
    mayarApiKey && !mayarApiKey.includes("isi-sendiri") && mayarApiKey.trim().length > 10
  );

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const isSecretKeyConfigured = Boolean(
    supabaseSecretKey &&
      !supabaseSecretKey.includes("isi-sendiri") &&
      supabaseSecretKey.trim().length > 10
  );

  const baseUrlDomain = process.env.MAYAR_BASE_URL || "https://api.mayar.io/hl/v2";
  const isSandbox =
    baseUrlDomain.includes("mayar.io") ||
    baseUrlDomain.includes("sandbox") ||
    !process.env.NODE_ENV ||
    process.env.NODE_ENV !== "production";

  const isConnected = isMayarConfigured && isSecretKeyConfigured;

  // 2. Tentukan URL Webhook Lengkap
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const webhookUrl = `${appBaseUrl}/api/webhook/mayar`;

  // 3. Ambil 10 Baris Terakhir dari public.mayar_webhook_log
  const supabase = await createClient();
  const { data: logsData, error: logError } = await supabase
    .from("mayar_webhook_log")
    .select("id, event, invoice_id, transaction_id, amount, status, error_message, ip_address, created_at, payload")
    .order("created_at", { ascending: false })
    .limit(10);

  if (logError) {
    console.warn("[Setelan] Error fetching mayar_webhook_log:", logError.message);
  }

  const initialLogs: WebhookLogItem[] = (logsData || []).map((row) => ({
    id: row.id,
    event: row.event,
    invoice_id: row.invoice_id,
    transaction_id: row.transaction_id,
    amount: row.amount,
    status: row.status,
    error_message: row.error_message,
    ip_address: row.ip_address,
    created_at: row.created_at,
    payload: (row.payload as Record<string, unknown>) || null,
  }));

  return (
    <SetelanClientView
      userProfile={profile}
      isConnected={isConnected}
      isMayarConfigured={isMayarConfigured}
      isSecretKeyConfigured={isSecretKeyConfigured}
      isSandbox={isSandbox}
      baseUrlDomain={baseUrlDomain}
      webhookUrl={webhookUrl}
      initialLogs={initialLogs}
    />
  );
}
