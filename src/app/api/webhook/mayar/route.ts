import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Inisialisasi Supabase Client khusus server dengan SUPABASE_SECRET_KEY
 * Memenuhi syarat: Klien dibuat langsung di file ini tanpa NEXT_PUBLIC_
 */
function getSecretSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Kredensial server database (SUPABASE_URL & SUPABASE_SECRET_KEY) belum terkonfigurasi.");
  }

  return createClient<Database>(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Route Handler: POST /api/webhook/mayar
 * Endpoint penerima webhook pembayaran Mayar dengan verifikasi zero-trust & proteksi database.
 */
export async function POST(req: NextRequest) {
  let webhookLogId: string | null = null;
  let supabase: ReturnType<typeof getSecretSupabaseClient> | null = null;

  try {
    supabase = getSecretSupabaseClient();
  } catch (initErr: unknown) {
    console.error("[Mayar Webhook] Inisialisasi Supabase Secret Client gagal:", initErr);
    // Selalu balas 200 ke Mayar
    return NextResponse.json(
      { success: false, message: "Konfigurasi server database belum siap." },
      { status: 200 }
    );
  }

  // 1. Baca payload mentah dan simpan ke mayar_webhook_log
  let rawBody: Record<string, unknown> = {};
  try {
    rawBody = await req.json();
  } catch {
    console.warn("[Mayar Webhook] Payload tidak berformat JSON valid.");
  }

  const payloadData = (rawBody?.data as Record<string, unknown>) || rawBody || {};
  const eventType = String(rawBody?.event || rawBody?.type || "payment.received");

  // Ekstrak ID invoice Mayar dari berbagai kemungkinan field payload
  const mayarInvoiceId = (
    payloadData.invoiceId ||
    payloadData.invoice_id ||
    payloadData.id ||
    payloadData.payment_link_id ||
    payloadData.linkId ||
    rawBody.invoice_id ||
    rawBody.id
  ) as string | undefined;

  const transactionId = (
    payloadData.transactionId ||
    payloadData.transaction_id ||
    payloadData.paymentId ||
    payloadData.id
  ) as string | undefined;

  const rawAmount = Number(payloadData.amount || payloadData.totalAmount || 0);
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  // Catat pesan masuk ke tabel mayar_webhook_log
  try {
    const { data: logEntry } = await supabase
      .from("mayar_webhook_log")
      .insert({
        event: eventType,
        invoice_id: mayarInvoiceId || null,
        transaction_id: transactionId || null,
        amount: rawAmount > 0 ? Math.round(rawAmount) : null,
        payload: rawBody as unknown as Record<string, string | number | boolean | null>,
        status: "received",
        ip_address: clientIp,
      })
      .select("id")
      .maybeSingle();

    if (logEntry?.id) {
      webhookLogId = logEntry.id;
    }
  } catch (logErr: unknown) {
    console.warn("[Mayar Webhook] Gagal menyimpan log awal ke mayar_webhook_log:", logErr);
  }

  // Fungsi pembantu untuk memperbarui hasil pemeriksaan ke log
  const updateLogStatus = async (status: "diterima" | "ditolak", errorMessage: string | null = null) => {
    if (!webhookLogId || !supabase) return;
    try {
      await supabase
        .from("mayar_webhook_log")
        .update({
          status,
          error_message: errorMessage,
        })
        .eq("id", webhookLogId);
    } catch (updateErr: unknown) {
      console.warn("[Mayar Webhook] Gagal memperbarui status log:", updateErr);
    }
  };

  // 2. Validasi Keberadaan ID Invoice Mayar
  if (!mayarInvoiceId || typeof mayarInvoiceId !== "string" || mayarInvoiceId.trim().length === 0) {
    await updateLogStatus("ditolak", "ID invoice Mayar tidak ditemukan dalam isi payload webhook.");
    return NextResponse.json(
      { success: false, message: "ID invoice Mayar tidak ditemukan dalam payload." },
      { status: 200 }
    );
  }

  const cleanInvoiceId = mayarInvoiceId.trim();

  // 3. JANGAN PERCAYA ISI PESAN: Tanya ulang detail invoice langsung ke Mayar V2 via API
  const mayarApiKey = process.env.MAYAR_API_KEY;
  const mayarBaseUrl = process.env.MAYAR_BASE_URL || "https://api.mayar.io/hl/v2";

  if (!mayarApiKey || mayarApiKey.includes("isi-sendiri") || mayarApiKey.trim().length < 10) {
    await updateLogStatus("ditolak", "MAYAR_API_KEY belum dikonfigurasi pada server.");
    return NextResponse.json(
      { success: false, message: "Konfigurasi gateway Mayar belum lengkap." },
      { status: 200 }
    );
  }

  let verifiedData: Record<string, unknown> | null = null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const mayarRes = await fetch(`${mayarBaseUrl}/invoices/${cleanInvoiceId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mayarApiKey}`,
      },
      signal: controller.signal,
    });

    if (!mayarRes.ok) {
      await updateLogStatus("ditolak", `Verifikasi Mayar API gagal dengan status HTTP ${mayarRes.status}.`);
      return NextResponse.json(
        { success: false, message: "Gagal memverifikasi status invoice ke Mayar." },
        { status: 200 }
      );
    }

    const mayarJson = await mayarRes.json();
    verifiedData = (mayarJson?.data || mayarJson) as Record<string, unknown>;
  } catch (verifyErr: unknown) {
    const isTimeout =
      (verifyErr as { name?: string })?.name === "AbortError" ||
      controller.signal.aborted;
    const msg = isTimeout
      ? "Timeout saat menghubungi API Mayar (8 detik)."
      : "Gagal melakukan koneksi verifikasi ke API Mayar.";

    await updateLogStatus("ditolak", msg);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 200 }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!verifiedData) {
    await updateLogStatus("ditolak", "Data respon verifikasi API Mayar kosong.");
    return NextResponse.json(
      { success: false, message: "Data invoice Mayar kosong." },
      { status: 200 }
    );
  }

  // 4. Periksa apakah status sudah dibayar ('paid')
  const verifiedStatus = String(verifiedData.status || "").toLowerCase().trim();
  if (verifiedStatus !== "paid") {
    await updateLogStatus("ditolak", `Status invoice Mayar bukan 'paid' (status terverifikasi: '${verifiedStatus}').`);
    return NextResponse.json(
      {
        success: false,
        message: `Invoice Mayar belum dibayar (status: ${verifiedStatus}).`,
      },
      { status: 200 }
    );
  }

  // Nominal yang diverifikasi oleh Mayar
  const verifiedAmount = Number(
    verifiedData.amount ||
    verifiedData.totalAmount ||
    verifiedData.total_amount ||
    0
  );

  // Ekstrak detail metode pembayaran jika tersedia (misal: "qris", "va/bca", "va/mandiri")
  const rawPaymentMethod = (
    verifiedData.paymentMethod ||
    payloadData.paymentMethod ||
    payloadData.channel ||
    verifiedData.channel ||
    "mayar"
  ) as string;

  // 5. Cari tagihan di tabel 'tagihan' (invoices) kita
  // Menggunakan pencarian berdasarkan mayar_invoice_id, atau extraData.tagihanId
  const extraData = (verifiedData.extraData || payloadData.extraData) as Record<string, unknown> | undefined;
  const extraTagihanId = extraData?.tagihanId as string | undefined;

  let tagihanQuery = supabase
    .from("tagihan")
    .select("id, nomor, nominal_sewa, denda, terbayar, status, mayar_invoice_id, mayar_jumlah, mayar_link");

  if (extraTagihanId) {
    tagihanQuery = tagihanQuery.or(`mayar_invoice_id.eq.${cleanInvoiceId},id.eq.${extraTagihanId}`);
  } else {
    tagihanQuery = tagihanQuery.eq("mayar_invoice_id", cleanInvoiceId);
  }

  const { data: tagihan, error: tagihanErr } = await tagihanQuery.maybeSingle();

  if (tagihanErr || !tagihan) {
    await updateLogStatus("ditolak", `Tagihan tidak ditemukan dalam database invoices (Mayar Invoice ID: ${cleanInvoiceId}).`);
    return NextResponse.json(
      { success: false, message: "Tagihan terkait tidak ditemukan dalam database." },
      { status: 200 }
    );
  }

  // Jika tagihan sudah lunas sebelumnya (idempotent check)
  if (tagihan.status === "lunas") {
    await updateLogStatus("diterima", "Tagihan sudah berstatus lunas sebelumnya (idempotent).");
    return NextResponse.json(
      {
        success: true,
        message: `Tagihan ${tagihan.nomor} sudah lunas sebelumnya.`,
        data: { tagihanId: tagihan.id, nomor: tagihan.nomor, already_paid: true },
      },
      { status: 200 }
    );
  }

  // 6. Validasi Jumlah Pembayaran: Wajib sama dengan mayar_jumlah tagihan
  const sisaKewajiban = (tagihan.nominal_sewa || 0) + (tagihan.denda || 0) - (tagihan.terbayar || 0);
  const expectedAmount = tagihan.mayar_jumlah ?? sisaKewajiban;

  if (verifiedAmount > 0 && verifiedAmount !== expectedAmount) {
    const errorMsg = `Nominal tidak cocok. Mayar: Rp${verifiedAmount}, mayar_jumlah tagihan: Rp${expectedAmount}.`;
    await updateLogStatus("ditolak", errorMsg);
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 200 }
    );
  }

  // 7. Panggil fungsi database tandai_lunas_mayar (Atomic Locking FOR UPDATE)
  const referenceMayar = String(
    verifiedData.transactionId ||
    transactionId ||
    cleanInvoiceId
  );

  const amountToMark = verifiedAmount > 0 ? verifiedAmount : expectedAmount;

  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("tandai_lunas_mayar", {
      p_tagihan_id: tagihan.id,
      p_referensi_mayar: referenceMayar,
      p_jumlah: amountToMark,
      p_mayar_invoice_id: cleanInvoiceId,
    });

    if (rpcErr) {
      console.error("[Mayar Webhook] Gagal mengeksekusi tandai_lunas_mayar:", rpcErr);
      await updateLogStatus("ditolak", `Gagal mengeksekusi tandai_lunas_mayar: ${rpcErr.message}`);
      return NextResponse.json(
        { success: false, message: "Gagal memperbarui status pelunasan pada database." },
        { status: 200 }
      );
    }

    const rpcResult = rpcRes as { success?: boolean; pembayaran_id?: string; already_paid?: boolean } | null;

    // Jika metode Mayar mengirimkan detail channel seperti QRIS / Virtual Account, catat di nama_bank pembayaran
    if (rpcResult?.pembayaran_id && rawPaymentMethod && rawPaymentMethod !== "mayar") {
      try {
        await supabase
          .from("pembayaran")
          .update({
            nama_bank: rawPaymentMethod.toUpperCase(),
          })
          .eq("id", rpcResult.pembayaran_id);
      } catch (bankErr: unknown) {
        console.warn("[Mayar Webhook] Tidak dapat memperbarui detail channel pembayaran:", bankErr);
      }
    }

    // 8. Berhasil! Simpan hasil 'diterima' pada log dan balas 200 OK dengan cepat
    await updateLogStatus("diterima", `Tagihan ${tagihan.nomor} berhasil dilunasi via Mayar (${rawPaymentMethod}).`);

    return NextResponse.json(
      {
        success: true,
        message: `Pembayaran tagihan ${tagihan.nomor} sebesar Rp${amountToMark} berhasil diproses.`,
        data: {
          tagihanId: tagihan.id,
          nomor: tagihan.nomor,
          jumlah: amountToMark,
          metode: rawPaymentMethod,
          referensiMayar: referenceMayar,
        },
      },
      { status: 200 }
    );
  } catch (rpcCatch: unknown) {
    const errorMsg = rpcCatch instanceof Error ? rpcCatch.message : "Kesalahan tidak terduga saat pelunasan.";
    await updateLogStatus("ditolak", errorMsg);
    return NextResponse.json(
      { success: false, message: errorMsg },
      { status: 200 }
    );
  }
}
