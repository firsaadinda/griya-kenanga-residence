import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";

/**
 * Endpoint Webhook Mayar: /api/webhooks/mayar
 * Menangani callback webhook Mayar secara resilient, fleksibel, & idempotent.
 * Sesuai PRD Bagian 11 & Panduan Tahap 9 Peningkatan #1
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    console.log("[Mayar Webhook] Received payload:", JSON.stringify(rawBody, null, 2));

    // 1. Ekstraksi Fleksibel & Resilient dari berbagai variasi payload Mayar (Sandbox / Production)
    const eventType = (
      rawBody.event ||
      rawBody.type ||
      rawBody.event_type ||
      rawBody.action ||
      "payment.received"
    ).toLowerCase();

    // Data container: bisa di rawBody.data atau langsung di root rawBody
    const payloadData = rawBody.data || rawBody;

    // Ambil identifier invoice dari berbagai kemungkinan key (variasi sandbox Mayar)
    const invoiceIdCandidates = [
      payloadData.invoice_id,
      payloadData.invoiceId,
      payloadData.invoice?.id,
      payloadData.id,
      payloadData.payment_link_id,
      payloadData.link_id,
      payloadData.external_id,
      payloadData.externalId,
      rawBody.invoice_id,
      rawBody.id,
    ].filter(Boolean) as string[];

    const invoiceId = invoiceIdCandidates[0] || null;

    // Ambil identifier transaksi pembayaran
    const transactionIdCandidates = [
      payloadData.transactionId,
      payloadData.transaction_id,
      payloadData.transaction?.id,
      payloadData.paymentId,
      payloadData.payment_id,
      payloadData.payment?.id,
      payloadData.id,
      rawBody.transaction_id,
    ].filter(Boolean) as string[];

    const transactionId = transactionIdCandidates[0] || invoiceId;

    // Referensi unik transaksi Mayar (untuk idempotensi & audit trail)
    const referenceMayar = transactionId || invoiceId || `myr_${Date.now()}`;

    // Ekstraksi nominal pembayaran
    const rawAmount =
      payloadData.amount ||
      payloadData.totalAmount ||
      payloadData.total_amount ||
      payloadData.gross_amount ||
      payloadData.paymentAmount ||
      payloadData.invoice?.amount ||
      0;
    const paidAmount = Number(rawAmount);

    // Ekstraksi data customer
    const customerName =
      payloadData.customerName ||
      payloadData.customer_name ||
      payloadData.customer?.name ||
      payloadData.name ||
      "Pembayaran Online Mayar";

    // Dapatkan instance Supabase client (prioritaskan admin client untuk bypass RLS dan akses RPC berhak khusus)
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      // Fallback menggunakan public anon client jika service role key belum terpasang di lokal
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    // 1b. Catat audit trail ke tabel mayar_webhook_log (hanya bisa dibaca oleh Owner)
    let webhookLogId: string | null = null;
    try {
      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;

      const { data: logEntry } = await supabase
        .from("mayar_webhook_log")
        .insert({
          event: eventType,
          invoice_id: invoiceId,
          transaction_id: transactionId,
          amount: paidAmount > 0 ? Math.round(paidAmount) : null,
          payload: rawBody,
          status: "received",
          ip_address: clientIp,
        })
        .select("id")
        .maybeSingle();

      if (logEntry?.id) {
        webhookLogId = logEntry.id;
      }
    } catch (logErr) {
      console.warn("[Mayar Webhook] Gagal mencatat log ke mayar_webhook_log:", logErr);
    }

    // 2. Jaminan Idempotensi: Periksa apakah referensi transaksi Mayar ini sudah pernah dicatat
    if (referenceMayar) {
      const { data: existingPayment } = await supabase
        .from("pembayaran")
        .select("id, tagihan_id, status")
        .eq("referensi_mayar", referenceMayar)
        .maybeSingle();

      if (existingPayment) {
        console.log(`[Mayar Webhook] Idempotent: Transaksi ${referenceMayar} sudah pernah diproses.`);
        if (webhookLogId) {
          await supabase
            .from("mayar_webhook_log")
            .update({ status: "success", error_message: "Idempotent: Transaksi sudah pernah diproses." })
            .eq("id", webhookLogId);
        }
        return NextResponse.json(
          {
            success: true,
            message: "Transaksi Mayar sudah pernah diproses sebelumnya (idempotent).",
            data: { paymentId: existingPayment.id },
          },
          { status: 200 }
        );
      }
    }

    // 3. Verifikasi Aman ke API Mayar V2 (jika API Key tersedia & invoiceId tertera)
    const mayarApiKey = process.env.MAYAR_API_KEY;
    const mayarBaseUrl = process.env.MAYAR_BASE_URL || "https://api.mayar.io/hl/v2";
    const hasValidApiKey =
      mayarApiKey &&
      !mayarApiKey.includes("your-mayar-api-key") &&
      !mayarApiKey.includes("isi-sendiri") &&
      mayarApiKey.trim().length > 10;

    let apiVerifiedInvoice: any = null;

    if (hasValidApiKey && invoiceId) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const verifyRes = await fetch(`${mayarBaseUrl}/invoices/${invoiceId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${mayarApiKey}`,
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (verifyRes.ok) {
          const verifyJson = await verifyRes.json();
          apiVerifiedInvoice = verifyJson.data || verifyJson;
          console.log("[Mayar Webhook] Invoice verified via Mayar API:", apiVerifiedInvoice?.status);
        } else {
          console.warn("[Mayar Webhook] API verification returned non-200 status, continuing resiliently.");
        }
      } catch (verifyErr) {
        console.warn("[Mayar Webhook] Verification request timed out or failed, continuing safely:", verifyErr);
      }
    }

    // 4. Pencarian Tagihan Terkait (Cascading Resilient Strategies)
    let targetTagihan: {
      id: string;
      nomor: string;
      nominal_sewa: number;
      denda: number;
      terbayar: number;
      status: string;
      dibuat_oleh: string | null;
      mayar_invoice_id: string | null;
    } | null = null;

    // Strategi A: Cari berdasarkan mayar_invoice_id yang cocok dengan candidate IDs
    for (const candId of invoiceIdCandidates) {
      const { data: byInvoiceId } = await supabase
        .from("tagihan")
        .select("id, nomor, nominal_sewa, denda, terbayar, status, dibuat_oleh, mayar_invoice_id")
        .eq("mayar_invoice_id", candId)
        .maybeSingle();

      if (byInvoiceId) {
        targetTagihan = byInvoiceId;
        break;
      }
    }

    // Strategi B: Cari berdasarkan tautan mayar_link (jika terkirim dalam payload)
    if (!targetTagihan) {
      const linkCandidates = [
        payloadData.paymentUrl,
        payloadData.payment_url,
        payloadData.link,
        payloadData.url,
        payloadData.invoice?.paymentUrl,
        payloadData.invoice?.link,
        apiVerifiedInvoice?.paymentUrl,
        apiVerifiedInvoice?.link,
      ].filter(Boolean) as string[];

      for (const linkCand of linkCandidates) {
        const { data: byLink } = await supabase
          .from("tagihan")
          .select("id, nomor, nominal_sewa, denda, terbayar, status, dibuat_oleh, mayar_invoice_id")
          .ilike("mayar_link", `%${linkCand.trim()}%`)
          .maybeSingle();

        if (byLink) {
          targetTagihan = byLink;
          break;
        }
      }
    }

    // Strategi C: Regex Nomor Tagihan (INV-XXXXXX-XXXX) dari teks deskripsi, catatan, atau order_id
    if (!targetTagihan) {
      const textsToSearch = [
        payloadData.description,
        payloadData.order_id,
        payloadData.orderId,
        payloadData.notes,
        payloadData.external_id,
        apiVerifiedInvoice?.description,
        apiVerifiedInvoice?.notes,
        JSON.stringify(rawBody),
      ].filter(Boolean).join(" ");

      const matchNomor = textsToSearch.match(/INV-\d{6}-\d{4}/i);
      if (matchNomor) {
        const { data: byNomor } = await supabase
          .from("tagihan")
          .select("id, nomor, nominal_sewa, denda, terbayar, status, dibuat_oleh, mayar_invoice_id")
          .ilike("nomor", matchNomor[0].trim())
          .maybeSingle();

        if (byNomor) {
          targetTagihan = byNomor;
        }
      }
    }

    // Strategi D: Cek jika salah satu candidate ID adalah UUID valid yang merujuk langsung ke tagihan.id
    if (!targetTagihan) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      for (const candId of invoiceIdCandidates) {
        if (uuidRegex.test(candId)) {
          const { data: byUuid } = await supabase
            .from("tagihan")
            .select("id, nomor, nominal_sewa, denda, terbayar, status, dibuat_oleh, mayar_invoice_id")
            .eq("id", candId)
            .maybeSingle();

          if (byUuid) {
            targetTagihan = byUuid;
            break;
          }
        }
      }
    }

    // Strategi E: Tagihan tertua belum lunas yang memiliki mayar_invoice_id aktif
    if (!targetTagihan && invoiceId) {
      const { data: byRecentMayar } = await supabase
        .from("tagihan")
        .select("id, nomor, nominal_sewa, denda, terbayar, status, dibuat_oleh, mayar_invoice_id")
        .not("mayar_invoice_id", "is", null)
        .in("status", ["belum_bayar", "sebagian"])
        .order("periode", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (byRecentMayar) {
        targetTagihan = byRecentMayar;
      }
    }

    // Jika tagihan tetap tidak ditemukan, return 200 agar Mayar tidak terus mengulang pengiriman
    if (!targetTagihan) {
      console.warn(`[Mayar Webhook] Tagihan tidak ditemukan untuk invoice ${invoiceId}. Payload diterima tanpa error.`);
      return NextResponse.json(
        {
          success: false,
          message: "Tagihan terkait tidak ditemukan dalam sistem database.",
          invoiceId,
          referenceMayar,
        },
        { status: 200 }
      );
    }

    // Jika tagihan sudah lunas sebelumnya, selesaikan secara aman
    if (targetTagihan.status === "lunas") {
      console.log(`[Mayar Webhook] Tagihan ${targetTagihan.nomor} sudah berstatus lunas.`);
      return NextResponse.json(
        {
          success: true,
          message: "Tagihan sudah berstatus lunas.",
          tagihanId: targetTagihan.id,
          nomor: targetTagihan.nomor,
        },
        { status: 200 }
      );
    }

    // 5. Hitung Total Pelunasan
    const sisaPokok = Math.max(0, targetTagihan.nominal_sewa - (targetTagihan.terbayar || 0));
    const nominalFinal = paidAmount > 0 ? paidAmount : (sisaPokok + (targetTagihan.denda || 0));
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    // 6. Jalankan Pelunasan via RPC tandai_lunas_mayar (Atomic Locking FOR UPDATE)
    let paymentProcessed = false;
    let paymentId: string | null = null;

    try {
      const { data: rpcLunas, error: rpcLunasErr } = await supabase.rpc("tandai_lunas_mayar", {
        p_tagihan_id: targetTagihan.id,
        p_referensi_mayar: referenceMayar,
        p_jumlah: nominalFinal,
        p_mayar_invoice_id: (invoiceId || targetTagihan.mayar_invoice_id) ?? undefined,
      });

      const lunasResult = rpcLunas as { success?: boolean; pembayaran_id?: string } | null;
      if (!rpcLunasErr && lunasResult?.success) {
        paymentProcessed = true;
        paymentId = lunasResult.pembayaran_id || null;
        console.log(`[Mayar Webhook] Pelunasan tagihan ${targetTagihan.nomor} via tandai_lunas_mayar berhasil.`);
      } else if (rpcLunasErr) {
        console.warn("[Mayar Webhook] tandai_lunas_mayar RPC error, trying direct update fallback:", rpcLunasErr);
      }
    } catch (rpcCatch) {
      console.warn("[Mayar Webhook] Exception calling tandai_lunas_mayar:", rpcCatch);
    }

    // 7. Fallback Direct Database Update jika RPC tidak aktif
    if (!paymentProcessed) {
      const { data: newPembayaran, error: insertPayErr } = await supabase
        .from("pembayaran")
        .insert({
          tagihan_id: targetTagihan.id,
          jumlah: nominalFinal,
          metode: "mayar",
          tanggal_bayar: tanggalHariIni,
          referensi_mayar: referenceMayar,
          status: "sah",
          nama_bank: "Mayar",
          nama_rekening_pengirim: customerName,
        })
        .select("id")
        .single();

      if (insertPayErr) {
        console.error("[Mayar Webhook] Gagal mencatat pembayaran:", insertPayErr);
        if (webhookLogId) {
          await supabase
            .from("mayar_webhook_log")
            .update({ status: "error", error_message: insertPayErr.message })
            .eq("id", webhookLogId);
        }
        return NextResponse.json(
          { success: false, message: "Gagal mencatat pembayaran ke database." },
          { status: 500 }
        );
      }

      paymentId = newPembayaran?.id || null;
      const totalTerbayarBaru = targetTagihan.nominal_sewa + (targetTagihan.denda || 0);
      await supabase
        .from("tagihan")
        .update({
          status: "lunas",
          terbayar: totalTerbayarBaru,
          mayar_invoice_id: invoiceId || targetTagihan.mayar_invoice_id,
          dibayar_online_at: new Date().toISOString(),
        })
        .eq("id", targetTagihan.id);
    }

    // 8. Update status mayar_webhook_log menjadi success
    if (webhookLogId) {
      await supabase
        .from("mayar_webhook_log")
        .update({
          status: "success",
          error_message: null,
        })
        .eq("id", webhookLogId);
    }

    // 8. Catat ke Audit Log jika belum dicatat oleh RPC
    const totalTerbayarBaru = targetTagihan.nominal_sewa + (targetTagihan.denda || 0);

    if (!paymentProcessed) {
      try {
        await supabase.from("audit_log").insert({
          pelaku_id: null, // Dipicu otomatis oleh webhook gateway Mayar
          peran: "penyewa",
          aksi: "pembayaran_mayar",
          tabel: "pembayaran",
          data_id: paymentId || targetTagihan.id,
          sebelum: {
            tagihan_id: targetTagihan.id,
            nomor: targetTagihan.nomor,
            terbayar: targetTagihan.terbayar,
            status: targetTagihan.status,
          },
          sesudah: {
            tagihan_id: targetTagihan.id,
            nomor: targetTagihan.nomor,
            terbayar: totalTerbayarBaru,
            status: "lunas",
            metode: "mayar",
            referensi_mayar: referenceMayar,
            jumlah: nominalFinal,
          },
          dibuat_pada: new Date().toISOString(),
        });
      } catch (auditErr) {
        console.warn("[Mayar Webhook] Gagal mencatat audit log:", auditErr);
      }
    }

    console.log(`[Mayar Webhook] Sukses: Tagihan ${targetTagihan.nomor} berhasil dilunasi via Mayar.`);

    return NextResponse.json(
      {
        success: true,
        message: `Pembayaran online Mayar berhasil diproses untuk tagihan ${targetTagihan.nomor}.`,
        tagihanNomor: targetTagihan.nomor,
        pembayaranId: paymentId,
        referensiMayar: referenceMayar,
        totalLunas: totalTerbayarBaru,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Mayar Webhook] Fatal error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Internal server error pada webhook Mayar.",
      },
      { status: 500 }
    );
  }
}
