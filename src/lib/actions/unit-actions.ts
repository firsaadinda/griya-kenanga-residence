"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { ApiResponse } from "@/types/api";

export interface UpdateUnitStatusPayload {
  unitId: string;
  status: "tersedia" | "perbaikan" | "nonaktif";
  keterangan?: string;
}

export interface UpdateUnitHargaPayload {
  unitId: string;
  hargaSewaBulanan: number;
}

/**
 * Pengelola & Pemilik: Mengubah status operasional unit (tersedia, perbaikan, nonaktif).
 * Menolak dengan status 400 jika menonaktifkan unit yang masih punya kontrak draf atau aktif (BR-04).
 */
export async function updateUnitStatusAction(
  payload: UpdateUnitStatusPayload
): Promise<ApiResponse> {
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

    if (profile.peran !== "pengelola" && profile.peran !== "pemilik") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Hanya pengelola dan pemilik yang dapat mengubah status unit.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    // Ambil data unit saat ini
    const { data: currentUnit, error: fetchErr } = await supabase
      .from("unit")
      .select("id, kode, status, harga_sewa_bulanan")
      .eq("id", payload.unitId)
      .single();

    if (fetchErr || !currentUnit) {
      return {
        success: false,
        statusCode: 404,
        message: "Unit tidak ditemukan.",
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi BR-04: Cek kontrak aktif atau draf jika hendak nonaktif
    if (payload.status === "nonaktif" && currentUnit.status !== "nonaktif") {
      const { data: activeContracts, error: contractErr } = await supabase
        .from("kontrak")
        .select("id, nomor, status")
        .eq("unit_id", payload.unitId)
        .in("status", ["draf", "aktif"]);

      if (contractErr) {
        return {
          success: false,
          statusCode: 500,
          message: "Gagal memverifikasi status kontrak unit.",
          timestamp: new Date().toISOString(),
        };
      }

      if (activeContracts && activeContracts.length > 0) {
        return {
          success: false,
          statusCode: 400,
          message:
            "Unit tidak boleh dinonaktifkan bila masih memiliki kontrak berstatus draf atau aktif (BR-04).",
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Update status unit
    const updateData: { status: "tersedia" | "perbaikan" | "nonaktif"; keterangan?: string } = {
      status: payload.status,
    };
    if (payload.keterangan !== undefined) {
      updateData.keterangan = payload.keterangan;
    }

    const { error: updateErr } = await supabase
      .from("unit")
      .update(updateData)
      .eq("id", payload.unitId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal memperbarui status unit.",
        timestamp: new Date().toISOString(),
      };
    }

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: "UBAH_STATUS_UNIT",
      p_tabel: "unit",
      p_data_id: payload.unitId,
      p_sebelum: { status: currentUnit.status },
      p_sesudah: { status: payload.status, keterangan: payload.keterangan || null },
    });

    revalidatePath("/dashboard/unit");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Status unit ${currentUnit.kode} berhasil diperbarui menjadi ${payload.status}.`,
      data: { unitId: payload.unitId, status: payload.status },
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
 * Pemilik: Mengubah harga sewa bulanan unit (BR-04).
 * Harga pada kontrak yang sudah pernah dibuat tetap terkunci.
 */
export async function updateUnitHargaAction(
  payload: UpdateUnitHargaPayload
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
        message: "Akses ditolak. Hanya Pemilik yang berhak mengubah harga sewa unit (BR-04).",
        timestamp: new Date().toISOString(),
      };
    }

    if (!payload.hargaSewaBulanan || payload.hargaSewaBulanan <= 0) {
      return {
        success: false,
        statusCode: 400,
        message: "Nominal harga sewa bulanan harus lebih dari 0 rupiah.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    const { data: currentUnit, error: fetchErr } = await supabase
      .from("unit")
      .select("id, kode, harga_sewa_bulanan")
      .eq("id", payload.unitId)
      .single();

    if (fetchErr || !currentUnit) {
      return {
        success: false,
        statusCode: 404,
        message: "Unit tidak ditemukan.",
        timestamp: new Date().toISOString(),
      };
    }

    const { error: updateErr } = await supabase
      .from("unit")
      .update({ harga_sewa_bulanan: payload.hargaSewaBulanan })
      .eq("id", payload.unitId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal mengubah harga sewa unit.",
        timestamp: new Date().toISOString(),
      };
    }

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: "UBAH_HARGA_UNIT",
      p_tabel: "unit",
      p_data_id: payload.unitId,
      p_sebelum: { harga_sewa_bulanan: currentUnit.harga_sewa_bulanan },
      p_sesudah: { harga_sewa_bulanan: payload.hargaSewaBulanan },
    });

    revalidatePath("/dashboard/unit");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Harga sewa bulanan unit ${currentUnit.kode} berhasil diubah menjadi Rp${payload.hargaSewaBulanan.toLocaleString("id-ID")}.`,
      data: { unitId: payload.unitId, hargaSewaBulanan: payload.hargaSewaBulanan },
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
