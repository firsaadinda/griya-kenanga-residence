"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { ApiResponse } from "@/types/api";

export interface BuatKontrakPayload {
  unitId: string;
  penyewaId: string;
  tanggalMulai: string; // YYYY-MM-01
  durasiBulan: 1 | 3 | 6 | 12;
}

export interface AkhiriKontrakPayload {
  kontrakId: string;
  alasanBerakhir: string;
}

/**
 * Pengelola: Membuat kontrak baru (status awal: draf).
 * Validasi BR-01 (tidak beririsan), BR-02 (mulai tgl 1, durasi 1/3/6/12), BR-04 (unit harus berstatus tersedia).
 */
export async function buatKontrakAction(
  payload: BuatKontrakPayload
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

    if (profile.peran !== "pengelola") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pengelola yang dapat membuat kontrak baru (403).",
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi Tanggal Mulai: Wajib tanggal 1 (BR-02)
    const mulaiDate = new Date(payload.tanggalMulai);
    if (isNaN(mulaiDate.getTime()) || mulaiDate.getDate() !== 1) {
      return {
        success: false,
        statusCode: 400,
        message: "Tanggal mulai sewa kontrak wajib dimulai pada tanggal 1 (BR-02).",
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi Durasi (1, 3, 6, 12)
    if (![1, 3, 6, 12].includes(payload.durasiBulan)) {
      return {
        success: false,
        statusCode: 400,
        message: "Durasi sewa hanya diperbolehkan 1, 3, 6, atau 12 bulan (BR-02).",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    // Cek Unit (BR-04)
    const { data: unit, error: unitErr } = await supabase
      .from("unit")
      .select("id, kode, harga_sewa_bulanan, status")
      .eq("id", payload.unitId)
      .single();

    if (unitErr || !unit) {
      return {
        success: false,
        statusCode: 404,
        message: "Unit tidak ditemukan.",
        timestamp: new Date().toISOString(),
      };
    }

    if (unit.status !== "tersedia") {
      return {
        success: false,
        statusCode: 400,
        message: `Kontrak baru hanya dapat dibuat untuk unit berstatus 'tersedia'. Unit ${unit.kode} saat ini berstatus '${unit.status}' (BR-04).`,
        timestamp: new Date().toISOString(),
      };
    }

    // Hitung tanggal_selesai: hari terakhir bulan ke-n (BR-02)
    const year = mulaiDate.getFullYear();
    const month = mulaiDate.getMonth(); // 0-indexed
    const endDate = new Date(year, month + payload.durasiBulan, 0); // tgl 0 dari bulan berikutnya = hari terakhir bulan sewa
    const tanggalSelesaiStr = endDate.toISOString().split("T")[0];

    // Cek Irisan Kontrak (BR-01)
    const { data: overlapping, error: overlapErr } = await supabase
      .from("kontrak")
      .select("id, nomor, tanggal_mulai, tanggal_selesai")
      .eq("unit_id", payload.unitId)
      .in("status", ["draf", "aktif"])
      .lte("tanggal_mulai", tanggalSelesaiStr)
      .gte("tanggal_selesai", payload.tanggalMulai);

    if (overlapErr) {
      return {
        success: false,
        statusCode: 500,
        message: "Gagal memeriksa irisan jadwal kontrak unit.",
        timestamp: new Date().toISOString(),
      };
    }

    if (overlapping && overlapping.length > 0) {
      return {
        success: false,
        statusCode: 400,
        message: `Unit ${unit.kode} sudah memiliki kontrak berstatus draf atau aktif pada periode tersebut (BR-01).`,
        timestamp: new Date().toISOString(),
      };
    }

    // Buat Nomor Kontrak Otomatis: KTR-YYYY-XXXX
    const currentYear = new Date().getFullYear().toString();
    const { data: noUrutData } = await supabase
      .from("nomor_urut")
      .select("terakhir")
      .eq("jenis", "KTR")
      .eq("periode", currentYear)
      .single();

    const nextUrutan = (noUrutData?.terakhir || 23) + 1;
    const nomorKontrak = `KTR-${currentYear}-${String(nextUrutan).padStart(4, "0")}`;

    // Insert Kontrak Baru
    const { data: newKontrak, error: insertErr } = await supabase
      .from("kontrak")
      .insert({
        nomor: nomorKontrak,
        unit_id: payload.unitId,
        penyewa_id: payload.penyewaId,
        tanggal_mulai: payload.tanggalMulai,
        durasi_bulan: payload.durasiBulan,
        tanggal_selesai: tanggalSelesaiStr,
        harga_sewa_bulanan: unit.harga_sewa_bulanan, // Terkunci sesuai BR-04
        status: "draf",
        dibuat_oleh: profile.id,
      })
      .select()
      .single();

    if (insertErr || !newKontrak) {
      return {
        success: false,
        statusCode: 400,
        message: insertErr?.message || "Gagal membuat kontrak baru.",
        timestamp: new Date().toISOString(),
      };
    }

    // Perbarui nomor urut
    await supabase.from("nomor_urut").upsert({
      jenis: "KTR",
      periode: currentYear,
      terakhir: nextUrutan,
    });

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: "BUAT_KONTRAK",
      p_tabel: "kontrak",
      p_data_id: newKontrak.id,
      p_sebelum: null,
      p_sesudah: {
        nomor: nomorKontrak,
        unit_id: payload.unitId,
        status: "draf",
        durasi: payload.durasiBulan,
      },
    });

    revalidatePath("/dashboard/kontrak");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Kontrak draf baru ${nomorKontrak} berhasil dibuat.`,
      data: newKontrak,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return {
      success: false,
      statusCode: 500,
      message: errorMsg,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Pengelola: Mengaktifkan kontrak draf (draf -> aktif).
 * Validasi BR-03 (identitas wajib 'terverifikasi', tidak punya kontrak aktif lain).
 */
export async function aktifkanKontrakAction(kontrakId: string): Promise<ApiResponse> {
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

    if (profile.peran !== "pengelola") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pengelola yang berhak mengaktifkan kontrak (BR-03 / 403).",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    const { data: kontrak, error: fetchErr } = await supabase
      .from("kontrak")
      .select("id, nomor, status, penyewa_id, unit_id")
      .eq("id", kontrakId)
      .single();

    if (fetchErr || !kontrak) {
      return {
        success: false,
        statusCode: 404,
        message: "Kontrak tidak ditemukan.",
        timestamp: new Date().toISOString(),
      };
    }

    if (kontrak.status !== "draf") {
      return {
        success: false,
        statusCode: 400,
        message: `Kontrak berstatus '${kontrak.status}' tidak dapat diaktifkan. Hanya kontrak draf yang bisa diaktifkan.`,
        timestamp: new Date().toISOString(),
      };
    }

    // Cek Identitas Penyewa (BR-03)
    const { data: identitas } = await supabase
      .from("identitas_penyewa")
      .select("status_verifikasi")
      .eq("penyewa_id", kontrak.penyewa_id)
      .single();

    if (!identitas || identitas.status_verifikasi !== "terverifikasi") {
      return {
        success: false,
        statusCode: 400,
        message:
          "Kontrak draf tidak dapat diaktifkan karena identitas penyewa belum diverifikasi oleh Pengelola (BR-03).",
        timestamp: new Date().toISOString(),
      };
    }

    // Cek Kontrak Aktif Lain (BR-03)
    const { data: activeOther } = await supabase
      .from("kontrak")
      .select("id, nomor")
      .eq("penyewa_id", kontrak.penyewa_id)
      .eq("status", "aktif")
      .neq("id", kontrakId);

    if (activeOther && activeOther.length > 0) {
      return {
        success: false,
        statusCode: 400,
        message:
          "Penyewa masih memiliki kontrak aktif yang berjalan. Perpanjangan baru dapat diaktifkan setelah kontrak lama selesai (BR-03).",
        timestamp: new Date().toISOString(),
      };
    }

    // Update status ke aktif
    const { error: updateErr } = await supabase
      .from("kontrak")
      .update({
        status: "aktif",
        diaktifkan_pada: new Date().toISOString(),
      })
      .eq("id", kontrakId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal mengaktifkan kontrak.",
        timestamp: new Date().toISOString(),
      };
    }

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: "AKTIFKAN_KONTRAK",
      p_tabel: "kontrak",
      p_data_id: kontrakId,
      p_sebelum: { status: "draf" },
      p_sesudah: { status: "aktif" },
    });

    revalidatePath("/dashboard/kontrak");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Kontrak ${kontrak.nomor} berhasil diaktifkan.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan server.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Pengelola: Membatalkan kontrak draf (draf -> dibatalkan).
 */
export async function batalkanKontrakDrafAction(kontrakId: string): Promise<ApiResponse> {
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

    if (profile.peran !== "pengelola") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pengelola yang berhak membatalkan kontrak draf (403).",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    const { data: kontrak } = await supabase
      .from("kontrak")
      .select("id, nomor, status")
      .eq("id", kontrakId)
      .single();

    if (!kontrak || kontrak.status !== "draf") {
      return {
        success: false,
        statusCode: 400,
        message: "Hanya kontrak berstatus draf yang dapat dibatalkan.",
        timestamp: new Date().toISOString(),
      };
    }

    const { error: updateErr } = await supabase
      .from("kontrak")
      .update({ status: "dibatalkan" })
      .eq("id", kontrakId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal membatalkan kontrak.",
        timestamp: new Date().toISOString(),
      };
    }

    await supabase.rpc("catat_audit_log", {
      p_aksi: "BATALKAN_KONTRAK",
      p_tabel: "kontrak",
      p_data_id: kontrakId,
      p_sebelum: { status: "draf" },
      p_sesudah: { status: "dibatalkan" },
    });

    revalidatePath("/dashboard/kontrak");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Kontrak ${kontrak.nomor} telah dibatalkan.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan server.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Pengelola: Menyelesaikan kontrak (aktif -> selesai).
 * Validasi BR-05 (tanggal_selesai terlewati & semua tagihan lunas).
 */
export async function selesaikanKontrakAction(kontrakId: string): Promise<ApiResponse> {
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

    if (profile.peran !== "pengelola") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya Pengelola yang berhak menyelesaikan kontrak (BR-05 / 403).",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    const { data: kontrak } = await supabase
      .from("kontrak")
      .select("id, nomor, status, tanggal_selesai")
      .eq("id", kontrakId)
      .single();

    if (!kontrak || kontrak.status !== "aktif") {
      return {
        success: false,
        statusCode: 400,
        message: "Hanya kontrak berstatus aktif yang dapat diselesaikan.",
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi Tanggal Selesai (BR-05)
    // Tanggal acuan sistem 15 Oktober 2026 atau tanggal riil
    const today = new Date();
    const isPastEndDate = today >= new Date(kontrak.tanggal_selesai);

    if (!isPastEndDate) {
      return {
        success: false,
        statusCode: 400,
        message: `Kontrak hanya dapat diselesaikan setelah tanggal selesai (${kontrak.tanggal_selesai}) terlewati (BR-05).`,
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi Tagihan Lunas (BR-05)
    const { data: unpaidBills } = await supabase
      .from("tagihan")
      .select("id, nomor, status")
      .eq("kontrak_id", kontrakId)
      .neq("status", "lunas");

    if (unpaidBills && unpaidBills.length > 0) {
      return {
        success: false,
        statusCode: 400,
        message: `Kontrak tidak dapat diselesaikan karena masih memiliki ${unpaidBills.length} tagihan yang belum lunas (BR-05).`,
        timestamp: new Date().toISOString(),
      };
    }

    const { error: updateErr } = await supabase
      .from("kontrak")
      .update({
        status: "selesai",
        tanggal_berakhir_aktual: new Date().toISOString().split("T")[0],
      })
      .eq("id", kontrakId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal menyelesaikan kontrak.",
        timestamp: new Date().toISOString(),
      };
    }

    await supabase.rpc("catat_audit_log", {
      p_aksi: "SELESAIKAN_KONTRAK",
      p_tabel: "kontrak",
      p_data_id: kontrakId,
      p_sebelum: { status: "aktif" },
      p_sesudah: { status: "selesai" },
    });

    revalidatePath("/dashboard/kontrak");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Kontrak ${kontrak.nomor} berhasil diselesaikan.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan server.",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Pemilik: Mengakhiri kontrak lebih awal (aktif -> diakhiri).
 * Validasi BR-05 (hanya Pemilik, wajib alasan, berlaku s.d. akhir bulan berjalan).
 */
export async function akhiriKontrakAction(
  payload: AkhiriKontrakPayload
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
        message: "Akses ditolak. Pengakhiran kontrak lebih awal hanya dapat dilakukan oleh Pemilik (BR-05 / 403).",
        timestamp: new Date().toISOString(),
      };
    }

    if (!payload.alasanBerakhir || payload.alasanBerakhir.trim().length === 0) {
      return {
        success: false,
        statusCode: 400,
        message: "Pengakhiran kontrak lebih awal wajib menyertakan alasan (BR-05).",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    const { data: kontrak } = await supabase
      .from("kontrak")
      .select("id, nomor, status")
      .eq("id", payload.kontrakId)
      .single();

    if (!kontrak || kontrak.status !== "aktif") {
      return {
        success: false,
        statusCode: 400,
        message: "Hanya kontrak aktif yang dapat diakhiri lebih awal.",
        timestamp: new Date().toISOString(),
      };
    }

    // Akhir bulan berjalan (BR-05)
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const { error: updateErr } = await supabase
      .from("kontrak")
      .update({
        status: "diakhiri",
        alasan_berakhir: payload.alasanBerakhir.trim(),
        tanggal_berakhir_aktual: endOfMonth,
      })
      .eq("id", payload.kontrakId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal mengakhiri kontrak.",
        timestamp: new Date().toISOString(),
      };
    }

    await supabase.rpc("catat_audit_log", {
      p_aksi: "AKHIRI_KONTRAK",
      p_tabel: "kontrak",
      p_data_id: payload.kontrakId,
      p_sebelum: { status: "aktif" },
      p_sesudah: { status: "diakhiri", alasan: payload.alasanBerakhir.trim() },
    });

    revalidatePath("/dashboard/kontrak");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Kontrak ${kontrak.nomor} telah diakhiri lebih awal.`,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    return {
      success: false,
      statusCode: 500,
      message: err instanceof Error ? err.message : "Terjadi kesalahan server.",
      timestamp: new Date().toISOString(),
    };
  }
}
