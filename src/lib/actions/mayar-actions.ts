"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { ApiResponse } from "@/types/api";

export interface BuatInvoiceMayarResult {
  tagihanId: string;
  nomorTagihan: string;
  invoiceId: string;
  paymentUrl: string;
  amount: number;
  denda: number;
  totalKewajiban: number;
}

/**
 * Server Action: Buat Invoice Mayar API V2 Otomatis (Headless API)
 * Sesuai PRD Bagian 11 & Panduan Tahap 9 Peningkatan #1
 * Endpoint: POST https://api.mayar.io/hl/v2/invoices/create
 * Menggunakan akun resmi Mayar: parkjiesung20@gmail.com
 * Menyimpan mayar_invoice_id dan mayar_link ke tabel tagihan.
 */
export async function buatInvoiceMayarAction(
  tagihanId: string
): Promise<ApiResponse<BuatInvoiceMayarResult>> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return {
        success: false,
        statusCode: 401,
        message: "Sesi pengguna tidak valid. Silakan login kembali.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    // 1. Ambil data tagihan lengkap beserta kontrak, unit, dan penyewa
    const { data: tagihan, error: tagihanErr } = await supabase
      .from("tagihan")
      .select(`
        id,
        nomor,
        periode,
        jatuh_tempo,
        nominal_sewa,
        denda,
        terbayar,
        status,
        mayar_invoice_id,
        mayar_link,
        kontrak:kontrak_id (
          id,
          nomor,
          unit:unit_id (
            id,
            kode,
            tipe
          ),
          penyewa:penyewa_id (
            id,
            nama_lengkap,
            email,
            no_hp
          )
        )
      `)
      .eq("id", tagihanId)
      .single();

    if (tagihanErr || !tagihan) {
      return {
        success: false,
        statusCode: 404,
        message: "Tagihan tidak ditemukan dalam basis data.",
        timestamp: new Date().toISOString(),
      };
    }

    // Hak akses: Penyewa hanya boleh membuat invoice tagihan miliknya sendiri
    const kontrakData = tagihan.kontrak as unknown as {
      id: string;
      nomor: string;
      unit?: { id: string; kode: string; tipe: string };
      penyewa?: { id: string; nama_lengkap: string; email: string; no_hp?: string | null };
    };

    if (profile.peran === "penyewa" && kontrakData?.penyewa?.id !== profile.id) {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Anda hanya dapat membayar tagihan sewa milik Anda sendiri.",
        timestamp: new Date().toISOString(),
      };
    }

    if (tagihan.status === "dibatalkan") {
      return {
        success: false,
        statusCode: 400,
        message: "Tagihan telah dibatalkan dan tidak dapat diproses pembayarannya.",
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Hitung Denda Berjalan Hari Ini (Aturan Bisnis BR-07)
    const today = new Date();
    const jatuhTempoDate = new Date(tagihan.jatuh_tempo);
    let dendaBerjalan = tagihan.denda || 0;

    if (today > jatuhTempoDate) {
      const diffTime = today.getTime() - jatuhTempoDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const kalkulasiDenda = Math.min(diffDays * 20000, 200000);
      dendaBerjalan = Math.max(tagihan.denda || 0, kalkulasiDenda);
    }

    const sisaPokok = Math.max(0, tagihan.nominal_sewa - (tagihan.terbayar || 0));
    const totalKewajiban = sisaPokok + dendaBerjalan;

    const nominalToInvoice =
      tagihan.status === "lunas" || totalKewajiban <= 0
        ? (tagihan.terbayar > 0 ? tagihan.terbayar : (tagihan.nominal_sewa || 0) + dendaBerjalan || 100000)
        : totalKewajiban;

    const tenantName = kontrakData?.penyewa?.nama_lengkap || "Penyewa Griya Kenanga";
    const tenantMobile = kontrakData?.penyewa?.no_hp || "081234567890";
    const unitCode = kontrakData?.unit?.kode || "Unit";
    const invoiceDesc = `Pembayaran Tagihan ${tagihan.nomor} (${unitCode}) - Griya Kenanga Residence`;

    // Email fallback
    const rawEmail = kontrakData?.penyewa?.email?.trim();
    const safeSlug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, ".");
    const tenantEmail =
      rawEmail && rawEmail.includes("@")
        ? rawEmail
        : `${safeSlug || "penyewa"}@gmail.com`;

    // 3. Panggil API Mayar V2 Sandbox (Headless Invoice Create)
    const mayarApiKey = process.env.MAYAR_API_KEY;
    const mayarBaseUrl = process.env.MAYAR_BASE_URL || "https://api.mayar.io/hl/v2";
    const hasValidApiKey =
      mayarApiKey &&
      !mayarApiKey.includes("your-mayar-api-key") &&
      !mayarApiKey.includes("isi-sendiri") &&
      mayarApiKey.trim().length > 10;

    let generatedInvoiceId = `inv_${Date.now()}`;
    let generatedPaymentUrl = "";

    const expiryDateIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (hasValidApiKey) {
      try {
        const mayarRes = await fetch(`${mayarBaseUrl}/invoices/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${mayarApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tenantName,
            email: tenantEmail,
            mobile: tenantMobile,
            description: invoiceDesc,
            items: [
              {
                quantity: 1,
                rate: nominalToInvoice,
                description: invoiceDesc,
              },
            ],
            expiredAt: expiryDateIso,
            dueDate: expiryDateIso,
            extraData: {
              tagihanId: tagihan.id,
              nomorTagihan: tagihan.nomor,
            },
          }),
        });

        if (mayarRes.ok) {
          const mayarData = await mayarRes.json();
          const invoiceData = mayarData.data || mayarData;
          if (invoiceData?.id) {
            generatedInvoiceId = invoiceData.id;
          }
          if (invoiceData?.paymentUrl) {
            generatedPaymentUrl = invoiceData.paymentUrl;
          } else if (invoiceData?.link) {
            generatedPaymentUrl = invoiceData.link.startsWith("http")
              ? invoiceData.link
              : `https://griyakenangaresidence.myr.lat/invoices/${invoiceData.link}`;
          } else if (invoiceData?.id) {
            generatedPaymentUrl = `https://griyakenangaresidence.myr.lat/invoices/${invoiceData.id}`;
          }
        } else {
          const errText = await mayarRes.text();
          console.warn("[Mayar API] Response not ok:", mayarRes.status, errText);
          throw new Error(`Gagal membuat invoice di server Mayar (${mayarRes.status}): ${errText}`);
        }
      } catch (fetchErr) {
        console.error("[Mayar API] Fetch error:", fetchErr);
        throw fetchErr;
      }
    } else {
      throw new Error("MAYAR_API_KEY belum dikonfigurasi dengan benar di environment server.");
    }

    // 4. Simpan mayar_invoice_id, mayar_link, & mayar_jumlah pada baris tagihan
    let savedSuccessfully = false;

    // Tingkat 1: RPC simpan_link_mayar via Admin Client (Bypass RLS dengan Secret Key)
    try {
      const adminSupabase = createAdminClient();
      const { data: rpcRes, error: rpcErr } = await adminSupabase.rpc("simpan_link_mayar", {
        p_tagihan_id: tagihanId,
        p_mayar_invoice_id: generatedInvoiceId,
        p_mayar_link: generatedPaymentUrl,
        p_mayar_jumlah: totalKewajiban,
      });

      if (!rpcErr && (rpcRes as { success?: boolean })?.success) {
        savedSuccessfully = true;
      } else if (rpcErr) {
        console.warn("[Mayar Action] RPC simpan_link_mayar returned error:", rpcErr);
      }
    } catch (rpcCatch) {
      console.warn("[Mayar Action] RPC simpan_link_mayar caught exception:", rpcCatch);
    }

    // Tingkat 2: Fallback Direct Update via Admin Client
    if (!savedSuccessfully) {
      try {
        const adminSupabase = createAdminClient();
        const { error: adminErr } = await adminSupabase
          .from("tagihan")
          .update({
            mayar_invoice_id: generatedInvoiceId,
            mayar_link: generatedPaymentUrl,
            mayar_jumlah: totalKewajiban,
          })
          .eq("id", tagihanId);

        if (!adminErr) {
          savedSuccessfully = true;
        } else {
          console.warn("[Mayar Action] Admin client update returned error:", adminErr);
        }
      } catch (adminCatch) {
        console.warn("[Mayar Action] Admin client not available:", adminCatch);
      }
    }

    // Tingkat 3: Direct User Supabase Client
    if (!savedSuccessfully) {
      const { error: clientUpdateErr } = await supabase
        .from("tagihan")
        .update({
          mayar_invoice_id: generatedInvoiceId,
          mayar_link: generatedPaymentUrl,
        })
        .eq("id", tagihanId);

      if (clientUpdateErr) {
        console.error("[Mayar Action] Direct client update failed:", clientUpdateErr);
      }
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: "Tautan pembayaran Mayar resmi berhasil digenerate otomatis.",
      data: {
        tagihanId,
        nomorTagihan: tagihan.nomor,
        invoiceId: generatedInvoiceId,
        paymentUrl: generatedPaymentUrl,
        amount: sisaPokok,
        denda: dendaBerjalan,
        totalKewajiban,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    console.error("Gagal membuat invoice Mayar:", err);
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan sistem saat memproses invoice Mayar.",
      timestamp: new Date().toISOString(),
    };
  }
}
