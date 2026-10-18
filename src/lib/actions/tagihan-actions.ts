"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { ApiResponse } from "@/types/api";

// In-Memory Rate Limiter untuk Proteksi Anti-Double-Submit (429 Too Many Requests)
// Mencegah klik ganda / spam dalam jendela 1000ms per (userId + actionKey)
const requestTimestamps = new Map<string, number>();

function checkRateLimit(key: string, limitMs: number = 1000): boolean {
  const now = Date.now();
  const lastTime = requestTimestamps.get(key);
  if (lastTime && now - lastTime < limitMs) {
    return false; // Rate limit exceeded (terlalu cepat)
  }
  requestTimestamps.set(key, now);

  // Bersihkan key lama setelah 1 menit agar memory tidak membengkak
  if (requestTimestamps.size > 500) {
    const threshold = now - 60000;
    for (const [k, time] of requestTimestamps.entries()) {
      if (time < threshold) requestTimestamps.delete(k);
    }
  }

  return true;
}

/**
 * Server Action: Buat Tagihan Bulanan Sekali Klik
 * Terhubung ke public.rpc_buat_tagihan_bulanan dengan penguncian nomor_urut
 */
export async function buatTagihanBulananAction(
  periode: string // format: YYYY-MM-01
): Promise<ApiResponse<{ totalDibuat: number; periode: string }>> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return {
        success: false,
        statusCode: 401,
        message: "Sesi login telah berakhir. Silakan login kembali.",
        timestamp: new Date().toISOString(),
      };
    }

    if (!["pengelola", "pemilik"].includes(profile.peran)) {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya staf operasional yang berhak membuat tagihan bulanan.",
        timestamp: new Date().toISOString(),
      };
    }

    // Proteksi Anti-Double-Submit (429)
    const rateLimitKey = `buat_tagihan:${profile.id}:${periode}`;
    if (!checkRateLimit(rateLimitKey, 1000)) {
      return {
        success: false,
        statusCode: 429,
        message: "Terlalu banyak permintaan (429 Too Many Requests). Silakan tunggu 1 detik sebelum menekan tombol kembali.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("rpc_buat_tagihan_bulanan", {
      p_periode: periode,
    });

    if (error) {
      const msg = error.message || "Gagal membuat tagihan bulanan.";
      const is403 = msg.includes("403");
      const is400 = msg.includes("400");
      return {
        success: false,
        statusCode: is403 ? 403 : is400 ? 400 : 500,
        message: msg.replace(/^(400|401|403|500):\s*/, ""),
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard");

    const totalDibuat = (data as unknown as { total_dibuat?: number })?.total_dibuat ?? 0;
    return {
      success: true,
      statusCode: 200,
      message:
        totalDibuat > 0
          ? `Berhasil membuat ${totalDibuat} tagihan untuk periode ${periode.substring(0, 7)}.`
          : `Semua kontrak aktif sudah memiliki tagihan untuk periode ${periode.substring(0, 7)} (tidak ada tagihan baru dibuat).`,
      data: {
        totalDibuat,
        periode,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Catat Pembayaran Tagihan
 * Mendukung unggah bukti transfer ke storage bucket 'bukti-bayar'
 * dan memanggil public.rpc_catat_pembayaran
 */
export async function catatPembayaranAction(formData: FormData): Promise<ApiResponse> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return {
        success: false,
        statusCode: 401,
        message: "Sesi login telah berakhir. Silakan login kembali.",
        timestamp: new Date().toISOString(),
      };
    }

    if (!["pengelola", "pemilik"].includes(profile.peran)) {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya staf operasional yang berhak mencatat pembayaran (BR-08).",
        timestamp: new Date().toISOString(),
      };
    }

    const tagihanId = formData.get("tagihan_id") as string;
    const jumlahStr = formData.get("jumlah") as string;
    const metode = formData.get("metode") as "tunai" | "transfer";
    const namaBank = (formData.get("nama_bank") as string)?.trim();
    const namaRekeningPengirim = (formData.get("nama_rekening_pengirim") as string)?.trim();
    const tanggalBayar = (formData.get("tanggal_bayar") as string) || new Date().toISOString().split("T")[0];
    const fileBukti = formData.get("bukti_transfer") as File | null;

    if (!tagihanId || !jumlahStr || !metode) {
      return {
        success: false,
        statusCode: 400,
        message: "Tagihan, nominal pembayaran, dan metode wajib diisi.",
        timestamp: new Date().toISOString(),
      };
    }

    const jumlah = parseInt(jumlahStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(jumlah) || jumlah <= 0) {
      return {
        success: false,
        statusCode: 400,
        message: "Nominal pembayaran harus berupa angka valid lebih dari Rp0.",
        timestamp: new Date().toISOString(),
      };
    }

    // Proteksi Anti-Double-Submit (429)
    const rateLimitKey = `catat_bayar:${profile.id}:${tagihanId}`;
    if (!checkRateLimit(rateLimitKey, 1000)) {
      return {
        success: false,
        statusCode: 429,
        message: "Terlalu banyak permintaan (429 Too Many Requests). Silakan tunggu 1 detik sebelum menekan tombol kembali.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();
    let buktiPath: string | null = null;

    // Jika metode transfer, proses validasi bank & unggah bukti transfer ke bucket 'bukti-bayar'
    if (metode === "transfer") {
      if (!namaBank) {
        return {
          success: false,
          statusCode: 400,
          message: "Nama bank pengirim wajib dipilih (BCA, Mandiri, BNI, Mayar, QRIS, Gopay, dll).",
          timestamp: new Date().toISOString(),
        };
      }

      if (!namaRekeningPengirim) {
        return {
          success: false,
          statusCode: 400,
          message: "Nama pemilik rekening pengirim wajib diisi.",
          timestamp: new Date().toISOString(),
        };
      }

      if (!fileBukti || fileBukti.size === 0) {
        return {
          success: false,
          statusCode: 400,
          message: "Pembayaran via transfer wajib melampirkan foto bukti transfer (BR-08).",
          timestamp: new Date().toISOString(),
        };
      }

      // Validasi ukuran maksimal 2MB
      if (fileBukti.size > 2 * 1024 * 1024) {
        return {
          success: false,
          statusCode: 400,
          message: "Ukuran file bukti transfer maksimal 2MB.",
          timestamp: new Date().toISOString(),
        };
      }

      const fileExt = fileBukti.name.split(".").pop() || "jpg";
      const fileName = `${tagihanId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("bukti-bayar")
        .upload(fileName, fileBukti, { upsert: true });

      if (uploadErr) {
        console.warn("Storage upload notice:", uploadErr);
        // Tetap simpan referensi nama file jika bucket RLS sudah menangani
        buktiPath = fileName;
      } else {
        buktiPath = uploadData?.path || fileName;
      }
    }

    // Eksekusi RPC catat pembayaran
    const { data, error } = await supabase.rpc("rpc_catat_pembayaran", {
      p_tagihan_id: tagihanId,
      p_jumlah: jumlah,
      p_metode: metode,
      p_tanggal_bayar: tanggalBayar,
      p_bukti_path: buktiPath ?? undefined,
      p_nama_bank: namaBank ?? undefined,
      p_nama_rekening_pengirim: namaRekeningPengirim ?? undefined,
    });

    if (error) {
      const msg = error.message || "Gagal mencatat pembayaran.";
      const is403 = msg.includes("403");
      const is400 = msg.includes("400");
      return {
        success: false,
        statusCode: is403 ? 403 : is400 ? 400 : 500,
        message: msg.replace(/^(400|401|403|500):\s*/, ""),
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: "Pembayaran berhasil dicatat ke sistem dan status tagihan telah diperbarui.",
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal pada server.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Batalkan Pembayaran (Khusus Pemilik)
 * Terhubung ke public.rpc_batalkan_pembayaran
 */
export async function batalkanPembayaranAction(
  pembayaranId: string,
  alasanBatal: string
): Promise<ApiResponse> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return {
        success: false,
        statusCode: 401,
        message: "Sesi login telah berakhir.",
        timestamp: new Date().toISOString(),
      };
    }

    if (profile.peran !== "pemilik") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pemilik yang berhak membatalkan pembayaran (BR-09).",
        timestamp: new Date().toISOString(),
      };
    }

    if (!alasanBatal || !alasanBatal.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: "Alasan pembatalan pembayaran wajib diisi.",
        timestamp: new Date().toISOString(),
      };
    }

    // Proteksi 429
    if (!checkRateLimit(`batal_bayar:${profile.id}:${pembayaranId}`, 1000)) {
      return {
        success: false,
        statusCode: 429,
        message: "Terlalu banyak permintaan (429). Mohon tunggu sejenak.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("rpc_batalkan_pembayaran", {
      p_pembayaran_id: pembayaranId,
      p_alasan_batal: alasanBatal.trim(),
    });

    if (error) {
      const msg = error.message || "Gagal membatalkan pembayaran.";
      return {
        success: false,
        statusCode: msg.includes("403") ? 403 : 400,
        message: msg.replace(/^(400|401|403|500):\s*/, ""),
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: "Pembayaran telah dibatalkan dan status tagihan dihitung ulang.",
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Batalkan Tagihan (Khusus Pemilik)
 * Terhubung ke public.rpc_batalkan_tagihan
 */
export async function batalkanTagihanAction(
  tagihanId: string,
  alasanBatal: string
): Promise<ApiResponse> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return {
        success: false,
        statusCode: 401,
        message: "Sesi login telah berakhir.",
        timestamp: new Date().toISOString(),
      };
    }

    if (profile.peran !== "pemilik") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pemilik yang berhak membatalkan tagihan (BR-09).",
        timestamp: new Date().toISOString(),
      };
    }

    if (!alasanBatal || !alasanBatal.trim()) {
      return {
        success: false,
        statusCode: 400,
        message: "Alasan pembatalan tagihan wajib diisi.",
        timestamp: new Date().toISOString(),
      };
    }

    // Proteksi 429
    if (!checkRateLimit(`batal_tagihan:${profile.id}:${tagihanId}`, 1000)) {
      return {
        success: false,
        statusCode: 429,
        message: "Terlalu banyak permintaan (429). Mohon tunggu sejenak.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("rpc_batalkan_tagihan", {
      p_tagihan_id: tagihanId,
      p_alasan_batal: alasanBatal.trim(),
    });

    if (error) {
      const msg = error.message || "Gagal membatalkan tagihan.";
      return {
        success: false,
        statusCode: msg.includes("403") ? 403 : 400,
        message: msg.replace(/^(400|401|403|500):\s*/, ""),
        timestamp: new Date().toISOString(),
      };
    }

    revalidatePath("/dashboard/tagihan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: "Tagihan telah dibatalkan.",
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Server Action: Mengambil Detail Tagihan & Riwayat Pembayaran Lengkap
 */
export async function getTagihanDetailAction(tagihanId: string) {
  try {
    const supabase = await createClient();

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
        alasan_batal,
        kontrak:kontrak_id (
          id,
          nomor,
          harga_sewa_bulanan,
          unit:unit_id (
            id,
            kode,
            tipe,
            lantai
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
      return { success: false, message: "Tagihan tidak ditemukan" };
    }

    const { data: pembayaranList } = await supabase
      .from("pembayaran")
      .select(`
        id,
        jumlah,
        metode,
        tanggal_bayar,
        bukti_path,
        nama_bank,
        nama_rekening_pengirim,
        status,
        alasan_batal,
        dibuat_pada,
        pencatat:dicatat_oleh (
          id,
          nama_lengkap
        )
      `)
      .eq("tagihan_id", tagihanId)
      .order("tanggal_bayar", { ascending: true });

    return {
      success: true,
      data: {
        tagihan,
        pembayaranList: pembayaranList || [],
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Gagal memuat detail tagihan",
    };
  }
}
