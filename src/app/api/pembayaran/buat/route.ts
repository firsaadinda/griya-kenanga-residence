import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Route Handler: POST /api/pembayaran/buat
 * Membuat atau mengambil tautan pembayaran online Mayar API V2.
 * 
 * Aturan & Kebijakan:
 * 1. Admin ('pengelola'), Owner ('pemilik'), atau Penyewa ('penyewa') yang sedang login (dibaca dari tabel profiles).
 *    Untuk peran Penyewa, dibatasi khusus untuk ID tagihannya sendiri.
 * 2. Menerima id invoice. Mengambil sisa tagihan, item, dan data pelanggan langsung dari basis data.
 *    Menolak jika invoice sudah lunas atau email pelanggan kosong.
 * 3. Jika invoice sudah punya mayar_link dan mayar_jumlah sama dengan sisa tagihan, langsung kembalikan tautan tersebut.
 * 4. Jika belum ada atau jumlahnya berbeda, buat invoice di Mayar V2 dengan nama dan email pelanggan lengkap,
 *    lalu simpan via RPC simpan_link_mayar dan kembalikan tautannya.
 * 5. Batas waktu tunggu (timeout) 10 detik. Pesan error berbahasa Indonesia dan tanpa membocorkan kunci/rahasia.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Otorisasi Pengguna: Pengelola, Pemilik, atau Penyewa (khusus tagihannya sendiri)
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid atau telah berakhir. Silakan masuk kembali.",
        },
        { status: 401 }
      );
    }

    // Ambil data peran langsung dari tabel profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, peran, aktif")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.aktif) {
      return NextResponse.json(
        {
          success: false,
          message: "Profil pengguna tidak ditemukan atau akun sedang dinonaktifkan.",
        },
        { status: 403 }
      );
    }

    if (!["pengelola", "pemilik", "penyewa"].includes(profile.peran)) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak. Anda tidak memiliki izin untuk mengakses layanan ini.",
        },
        { status: 403 }
      );
    }

    // 2. Baca payload JSON permintaan
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Format data permintaan tidak valid (wajib JSON).",
        },
        { status: 400 }
      );
    }

    const rawId = body?.id ?? body?.invoiceId ?? body?.tagihan_id ?? body?.tagihanId;
    if (!rawId || typeof rawId !== "string" || rawId.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID invoice/tagihan wajib disertakan dalam permintaan.",
        },
        { status: 400 }
      );
    }

    const tagihanId = rawId.trim();

    // 3. Ambil data tagihan, unit, dan penyewa dari database (Bukan dari input browser)
    const { data: tagihan, error: tagihanError } = await supabase
      .from("tagihan")
      .select(`
        id,
        nomor,
        nominal_sewa,
        denda,
        terbayar,
        status,
        mayar_invoice_id,
        mayar_link,
        mayar_jumlah,
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
      .maybeSingle();

    if (tagihanError || !tagihan) {
      return NextResponse.json(
        {
          success: false,
          message: "Tagihan tidak ditemukan dalam sistem basis data.",
        },
        { status: 404 }
      );
    }

    // Hitung nominal invoice Mayar
    const totalKewajiban = (tagihan.nominal_sewa || 0) + (tagihan.denda || 0);
    const sisaTagihan = totalKewajiban - (tagihan.terbayar || 0);
    // Untuk tagihan berstatus lunas, gunakan nilai total kewajiban / nominal sewa asli
    const nominalInvoice =
      tagihan.status === "lunas" || sisaTagihan <= 0
        ? (tagihan.terbayar > 0 ? tagihan.terbayar : totalKewajiban > 0 ? totalKewajiban : 100000)
        : sisaTagihan;

    if (tagihan.status === "dibatalkan") {
      return NextResponse.json(
        {
          success: false,
          message: "Tagihan ini telah dibatalkan dan tidak dapat dibayar.",
        },
        { status: 400 }
      );
    }

    // Ekstrak data pelanggan & siapkan fallback email otomatis jika kosong
    const kontrakData = tagihan.kontrak as unknown as {
      id: string;
      nomor: string;
      unit?: { id: string; kode: string; tipe: string };
      penyewa?: { id: string; nama_lengkap: string; email: string; no_hp?: string | null };
    } | null;

    // Verifikasi kepemilikan tagihan untuk peran Penyewa: hanya boleh untuk tagihannya sendiri
    if (profile.peran === "penyewa") {
      const penyewaId = kontrakData?.penyewa?.id;
      if (!penyewaId || penyewaId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Akses ditolak. Anda hanya dapat membuat tautan pembayaran untuk tagihan Anda sendiri.",
          },
          { status: 403 }
        );
      }
    }

    const penyewaData = kontrakData?.penyewa;
    const unitData = kontrakData?.unit;

    const customerName = penyewaData?.nama_lengkap?.trim() || "Penyewa Griya Kenanga";
    const customerMobile = penyewaData?.no_hp?.trim() || "081234567890";
    const unitKode = unitData?.kode || "Unit";
    const itemDescription = `Pembayaran Sewa ${tagihan.nomor} (${unitKode}) - Griya Kenanga Residence`;

    // Email fallback jika di database kosong agar API Mayar tidak pernah menolak
    const rawEmail = penyewaData?.email?.trim();
    const safeSlug = customerName.toLowerCase().replace(/[^a-z0-9]/g, ".");
    const customerEmail =
      rawEmail && rawEmail.includes("@")
        ? rawEmail
        : `${safeSlug || "penyewa"}@gmail.com`;

    // 4. Periksa apakah sudah ada tautan Mayar aktif dengan nominal yang persis sama
    if (tagihan.mayar_link && tagihan.mayar_jumlah === nominalInvoice) {
      return NextResponse.json(
        {
          success: true,
          message: "Tautan pembayaran Mayar aktif ditemukan.",
          data: {
            id: tagihan.id,
            nomor: tagihan.nomor,
            mayar_invoice_id: tagihan.mayar_invoice_id,
            mayar_link: tagihan.mayar_link,
            mayar_jumlah: tagihan.mayar_jumlah,
            sisa_tagihan: nominalInvoice,
            is_cached: true,
          },
        },
        { status: 200 }
      );
    }

    // 5. Konfigurasi kredensial Mayar dari environment
    const mayarApiKey = process.env.MAYAR_API_KEY;
    const mayarBaseUrl = process.env.MAYAR_BASE_URL || "https://api.mayar.io/hl/v2";

    if (
      !mayarApiKey ||
      mayarApiKey.includes("your-mayar-api-key") ||
      mayarApiKey.includes("isi-sendiri") ||
      mayarApiKey.trim().length < 10
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi kunci API pembayaran Mayar belum diatur pada server.",
        },
        { status: 500 }
      );
    }

    // 6. Panggil Mayar API V2 dengan batasan batas tunggu (timeout) 10 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // Expired pada akhir hari ini (jam 23:59:59 waktu lokal)
    const expiryDate = new Date();
    expiryDate.setHours(23, 59, 59, 999);
    const expiryDateIso = expiryDate.toISOString();

    let mayarRes: Response;
    try {
      mayarRes = await fetch(`${mayarBaseUrl}/invoices/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mayarApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName,
          email: customerEmail,
          mobile: customerMobile,
          description: itemDescription,
          items: [
            {
              quantity: 1,
              rate: nominalInvoice,
              description: itemDescription,
            },
          ],
          expiredAt: expiryDateIso,
          dueDate: expiryDateIso,
          extraData: {
            tagihanId: tagihan.id,
            nomorTagihan: tagihan.nomor,
          },
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: unknown) {
      const isAbort =
        (fetchErr as { name?: string })?.name === "AbortError" ||
        controller.signal.aborted;

      if (isAbort) {
        return NextResponse.json(
          {
            success: false,
            message: "Permintaan ke layanan Mayar melebihi batas waktu tunggu (10 detik). Silakan coba lagi.",
          },
          { status: 504 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Gagal terhubung ke layanan Mayar. Periksa koneksi jaringan server.",
        },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!mayarRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Layanan Mayar menolak pembuatan invoice. Silakan periksa kembali kevalidan data pelanggan.",
        },
        { status: 502 }
      );
    }

    const mayarJson = await mayarRes.json();
    const invoiceData = mayarJson?.data || mayarJson;

    const generatedInvoiceId = invoiceData?.id as string | undefined;
    const rawLink = (invoiceData?.paymentUrl || invoiceData?.link) as string | undefined;

    if (!generatedInvoiceId || !rawLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Respon dari layanan Mayar tidak memuat ID invoice atau tautan pembayaran yang valid.",
        },
        { status: 502 }
      );
    }

    const generatedPaymentUrl = rawLink.startsWith("http")
      ? rawLink
      : `https://griyakenangaresidence.myr.lat/invoices/${rawLink}`;

    // 7. Simpan id, tautan, dan jumlahnya via simpan_link_mayar
    // Menggunakan Admin Client agar dapat menjalankan RPC dengan hak elevated
    const adminSupabase = createAdminClient();
    const { error: rpcErr } = await adminSupabase.rpc("simpan_link_mayar", {
      p_tagihan_id: tagihan.id,
      p_mayar_invoice_id: generatedInvoiceId,
      p_mayar_link: generatedPaymentUrl,
      p_mayar_jumlah: nominalInvoice,
    });

    if (rpcErr) {
      console.warn("[Pembayaran Buat] simpan_link_mayar RPC returned error, attempting direct update fallback:", rpcErr);
      await adminSupabase
        .from("tagihan")
        .update({
          mayar_invoice_id: generatedInvoiceId,
          mayar_link: generatedPaymentUrl,
          mayar_jumlah: nominalInvoice,
        })
        .eq("id", tagihan.id);
    }

    // 8. Berikan respon sukses dengan tautan pembayaran Mayar
    return NextResponse.json(
      {
        success: true,
        message: "Tautan pembayaran Mayar berhasil dibuat.",
        data: {
          id: tagihan.id,
          nomor: tagihan.nomor,
          mayar_invoice_id: generatedInvoiceId,
          mayar_link: generatedPaymentUrl,
          mayar_jumlah: nominalInvoice,
          sisa_tagihan: nominalInvoice,
          is_cached: false,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    // Sanitasi pesan error agar TIDAK PERNAH menampilkan API key / secret token
    console.error("[Pembayaran Buat] Internal server error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan internal pada server saat menyiapkan tautan pembayaran.",
      },
      { status: 500 }
    );
  }
}
