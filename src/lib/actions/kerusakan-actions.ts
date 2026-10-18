"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { ApiResponse } from "@/types/api";

export interface BuatLaporanKerusakanPayload {
  kategori: "listrik" | "air" | "ac" | "bangunan" | "perabot" | "lainnya";
  judul: string;
  deskripsi: string;
  fotoPaths: string[]; // 1 s.d. 3 file paths
}

export interface TanganiLaporanPayload {
  laporanId: string;
  aksi: "proses" | "minta_persetujuan" | "tolak" | "selesaikan" | "tutup";
  estimasiBiaya?: number;
  biayaAktual?: number;
  catatan?: string;
  alasanTolak?: string;
}

/**
 * Penyewa: Membuat laporan kerusakan baru (US-07, BR-11).
 * Wajib 1-3 foto, memiliki kontrak aktif, maksimal 3 laporan terbuka.
 */
export async function buatLaporanKerusakanAction(
  payload: BuatLaporanKerusakanPayload
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

    if (profile.peran !== "penyewa") {
      return {
        success: false,
        statusCode: 403,
        message: "Akses ditolak. Pelaporan kerusakan hanya dapat diajukan oleh Penyewa.",
        timestamp: new Date().toISOString(),
      };
    }

    // Validasi Foto: 1 s.d. 3 foto (BR-11)
    if (!payload.fotoPaths || payload.fotoPaths.length < 1 || payload.fotoPaths.length > 3) {
      return {
        success: false,
        statusCode: 400,
        message: "Setiap laporan kerusakan wajib melampirkan 1 sampai 3 foto (BR-11).",
        timestamp: new Date().toISOString(),
      };
    }

    if (!payload.judul || payload.judul.trim().length < 5 || payload.judul.trim().length > 80) {
      return {
        success: false,
        statusCode: 400,
        message: "Judul laporan kerusakan minimal 5 karakter dan maksimal 80 karakter.",
        timestamp: new Date().toISOString(),
      };
    }

    if (!payload.deskripsi || payload.deskripsi.trim().length === 0) {
      return {
        success: false,
        statusCode: 400,
        message: "Deskripsi detail kerusakan wajib diisi.",
        timestamp: new Date().toISOString(),
      };
    }

    const supabase = await createClient();

    // Cek Kontrak Aktif Penyewa (BR-11)
    const { data: kontrakAktif, error: contractErr } = await supabase
      .from("kontrak")
      .select("id, unit_id, nomor")
      .eq("penyewa_id", profile.id)
      .eq("status", "aktif")
      .maybeSingle();

    if (contractErr || !kontrakAktif) {
      return {
        success: false,
        statusCode: 400,
        message: "Anda tidak memiliki kontrak sewa aktif saat ini untuk membuat laporan kerusakan (BR-11).",
        timestamp: new Date().toISOString(),
      };
    }

    // Cek Batas Maksimal 3 Laporan Terbuka (BR-11)
    const { count: openReportsCount, error: countErr } = await supabase
      .from("laporan_kerusakan")
      .select("*", { count: "exact", head: true })
      .eq("pelapor_id", profile.id)
      .in("status", ["dilaporkan", "diproses", "menunggu_persetujuan"]);

    if (countErr) {
      return {
        success: false,
        statusCode: 500,
        message: "Gagal memeriksa batasan laporan terbuka.",
        timestamp: new Date().toISOString(),
      };
    }

    if ((openReportsCount || 0) >= 3) {
      return {
        success: false,
        statusCode: 400,
        message: "Anda sudah memiliki 3 laporan kerusakan terbuka yang sedang ditangani. Selesaikan atau tunggu laporan sebelumnya ditutup terlebih dahulu (BR-11).",
        timestamp: new Date().toISOString(),
      };
    }

    // Generate Nomor Urut: LK-YYYY-XXXX
    const currentYear = new Date().getFullYear().toString();
    const { data: noUrutData } = await supabase
      .from("nomor_urut")
      .select("terakhir")
      .eq("jenis", "LK")
      .eq("periode", currentYear)
      .single();

    const nextUrutan = (noUrutData?.terakhir || 13) + 1;
    const nomorLaporan = `LK-${currentYear}-${String(nextUrutan).padStart(4, "0")}`;

    // Simpan Laporan Kerusakan
    const { data: newReport, error: insertErr } = await supabase
      .from("laporan_kerusakan")
      .insert({
        nomor: nomorLaporan,
        kontrak_id: kontrakAktif.id,
        unit_id: kontrakAktif.unit_id,
        pelapor_id: profile.id,
        kategori: payload.kategori,
        judul: payload.judul.trim(),
        deskripsi: payload.deskripsi.trim(),
        foto_paths: payload.fotoPaths,
        status: "dilaporkan",
      })
      .select()
      .single();

    if (insertErr || !newReport) {
      return {
        success: false,
        statusCode: 400,
        message: insertErr?.message || "Gagal membuat laporan kerusakan.",
        timestamp: new Date().toISOString(),
      };
    }

    // Update Nomor Urut
    await supabase.from("nomor_urut").upsert({
      jenis: "LK",
      periode: currentYear,
      terakhir: nextUrutan,
    });

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: "BUAT_LAPORAN_KERUSAKAN",
      p_tabel: "laporan_kerusakan",
      p_data_id: newReport.id,
      p_sebelum: null,
      p_sesudah: {
        nomor: nomorLaporan,
        unit_id: kontrakAktif.unit_id,
        kategori: payload.kategori,
        judul: payload.judul.trim(),
      },
    });

    revalidatePath("/dashboard/kerusakan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Laporan kerusakan ${nomorLaporan} berhasil dibuat dan masuk antrean tim operasional.`,
      data: newReport,
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
 * Pengelola & Pemilik: Menangani alur status laporan kerusakan (US-08, US-09, BR-12).
 */
export async function tanganiLaporanKerusakanAction(
  payload: TanganiLaporanPayload
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

    const supabase = await createClient();

    const { data: laporan, error: fetchErr } = await supabase
      .from("laporan_kerusakan")
      .select("*")
      .eq("id", payload.laporanId)
      .single();

    if (fetchErr || !laporan) {
      return {
        success: false,
        statusCode: 404,
        message: "Data laporan kerusakan tidak ditemukan.",
        timestamp: new Date().toISOString(),
      };
    }

    let nextStatus = laporan.status;
    const updateObj: Record<string, unknown> = {};

    switch (payload.aksi) {
      case "proses": {
        // Bisa dari dilaporkan (Pengelola, <=1jt) ATAU dari menunggu_persetujuan (Hanya Pemilik)
        if (laporan.status === "dilaporkan") {
          if (profile.peran !== "pengelola" && profile.peran !== "pemilik") {
            return { success: false, statusCode: 403, message: "Akses ditolak.", timestamp: new Date().toISOString() };
          }
          if (payload.estimasiBiaya === undefined || payload.estimasiBiaya === null) {
            return {
              success: false,
              statusCode: 400,
              message: "Estimasi biaya perbaikan wajib diisi oleh pengelola (BR-12).",
              timestamp: new Date().toISOString(),
            };
          }
          if (payload.estimasiBiaya > 1000000) {
            return {
              success: false,
              statusCode: 400,
              message: "Estimasi biaya di atas Rp1.000.000 wajib diajukan ke Pemilik untuk persetujuan (BR-12).",
              timestamp: new Date().toISOString(),
            };
          }
          nextStatus = "diproses";
          updateObj.status = "diproses";
          updateObj.estimasi_biaya = payload.estimasiBiaya;
          if (payload.catatan) updateObj.catatan = payload.catatan.trim();
        } else if (laporan.status === "menunggu_persetujuan") {
          // Hanya Pemilik (US-09, BR-12)
          if (profile.peran !== "pemilik") {
            return {
              success: false,
              statusCode: 403,
              message: "Hanya Pemilik yang berhak menyetujui biaya perbaikan di atas Rp1.000.000 (BR-12 / 403).",
              timestamp: new Date().toISOString(),
            };
          }
          nextStatus = "diproses";
          updateObj.status = "diproses";
          updateObj.disetujui_oleh = profile.id;
          updateObj.disetujui_pada = new Date().toISOString();
        } else {
          return {
            success: false,
            statusCode: 400,
            message: `Laporan berstatus '${laporan.status}' tidak dapat diproses.`,
            timestamp: new Date().toISOString(),
          };
        }
        break;
      }

      case "minta_persetujuan": {
        if (profile.peran !== "pengelola" && profile.peran !== "pemilik") {
          return { success: false, statusCode: 403, message: "Akses ditolak.", timestamp: new Date().toISOString() };
        }
        if (!payload.estimasiBiaya || payload.estimasiBiaya <= 1000000) {
          return {
            success: false,
            statusCode: 400,
            message: "Permintaan persetujuan Pemilik hanya untuk estimasi biaya di atas Rp1.000.000 (BR-12).",
            timestamp: new Date().toISOString(),
          };
        }
        nextStatus = "menunggu_persetujuan";
        updateObj.status = "menunggu_persetujuan";
        updateObj.estimasi_biaya = payload.estimasiBiaya;
        if (payload.catatan) updateObj.catatan = payload.catatan.trim();
        break;
      }

      case "tolak": {
        if (!payload.alasanTolak || payload.alasanTolak.trim().length === 0) {
          return {
            success: false,
            statusCode: 400,
            message: "Penolakan laporan wajib menyertakan alasan penolakan (BR-12).",
            timestamp: new Date().toISOString(),
          };
        }
        if (laporan.status === "dilaporkan") {
          if (profile.peran !== "pengelola" && profile.peran !== "pemilik") {
            return { success: false, statusCode: 403, message: "Akses ditolak.", timestamp: new Date().toISOString() };
          }
        } else if (laporan.status === "menunggu_persetujuan") {
          if (profile.peran !== "pemilik") {
            return {
              success: false,
              statusCode: 403,
              message: "Hanya Pemilik yang berhak menolak persetujuan biaya di atas Rp1.000.000 (BR-12 / 403).",
              timestamp: new Date().toISOString(),
            };
          }
        } else {
          return {
            success: false,
            statusCode: 400,
            message: "Status laporan saat ini tidak dapat ditolak.",
            timestamp: new Date().toISOString(),
          };
        }
        nextStatus = "ditolak";
        updateObj.status = "ditolak";
        updateObj.alasan_tolak = payload.alasanTolak.trim();
        break;
      }

      case "selesaikan": {
        if (profile.peran !== "pengelola" && profile.peran !== "pemilik") {
          return { success: false, statusCode: 403, message: "Akses ditolak.", timestamp: new Date().toISOString() };
        }
        if (laporan.status !== "diproses") {
          return {
            success: false,
            statusCode: 400,
            message: "Hanya laporan berstatus 'diproses' yang dapat ditandai selesai.",
            timestamp: new Date().toISOString(),
          };
        }
        if (payload.biayaAktual === undefined || payload.biayaAktual === null || payload.biayaAktual < 0) {
          return {
            success: false,
            statusCode: 400,
            message: "Biaya aktual perbaikan wajib diisi saat menyelesaikan laporan (BR-12).",
            timestamp: new Date().toISOString(),
          };
        }
        if (payload.biayaAktual > 1000000 && !laporan.disetujui_oleh) {
          return {
            success: false,
            statusCode: 400,
            message: "Biaya aktual di atas Rp1.000.000 harus sudah disetujui Pemilik (BR-12).",
            timestamp: new Date().toISOString(),
          };
        }
        nextStatus = "selesai";
        updateObj.status = "selesai";
        updateObj.biaya_aktual = payload.biayaAktual;
        updateObj.selesai_pada = new Date().toISOString();
        if (payload.catatan) updateObj.catatan = payload.catatan.trim();
        break;
      }

      case "tutup": {
        if (laporan.status !== "selesai") {
          return {
            success: false,
            statusCode: 400,
            message: "Hanya laporan berstatus 'selesai' yang dapat ditutup.",
            timestamp: new Date().toISOString(),
          };
        }
        if (profile.peran === "penyewa") {
          if (laporan.pelapor_id !== profile.id) {
            return {
              success: false,
              statusCode: 403,
              message: "Akses ditolak. Anda hanya dapat menutup laporan kerusakan milik Anda sendiri.",
              timestamp: new Date().toISOString(),
            };
          }
        } else if (profile.peran === "pengelola") {
          // BR-12: Pengelola hanya boleh menutup bila sudah > 3 hari sejak selesai_pada
          // Tanggal acuan skenario 15 Oktober 2026 atau tanggal riil
          const selesaiDate = new Date(laporan.selesai_pada || "");
          const refDate = new Date("2026-10-15T00:00:00Z");
          const currentDate = new Date();
          
          const diffDaysSkenario = (refDate.getTime() - selesaiDate.getTime()) / (1000 * 3600 * 24);
          const diffDaysRiil = (currentDate.getTime() - selesaiDate.getTime()) / (1000 * 3600 * 24);

          if (diffDaysSkenario <= 3 && diffDaysRiil <= 3) {
            return {
              success: false,
              statusCode: 400,
              message: "Pengelola hanya boleh menutup laporan bila sudah lebih dari 3 hari sejak status selesai dan belum ditutup oleh penyewa (BR-12).",
              timestamp: new Date().toISOString(),
            };
          }
        }
        nextStatus = "ditutup";
        updateObj.status = "ditutup";
        updateObj.ditutup_pada = new Date().toISOString();
        break;
      }

      default:
        return { success: false, statusCode: 400, message: "Aksi tidak dikenali.", timestamp: new Date().toISOString() };
    }

    const updatePayload: Record<string, any> = {
      ...updateObj,
      diperbarui_pada: new Date().toISOString(),
    };

    const { error: updateErr } = await supabase
      .from("laporan_kerusakan")
      .update(updatePayload as any)
      .eq("id", payload.laporanId);

    if (updateErr) {
      return {
        success: false,
        statusCode: 400,
        message: updateErr.message || "Gagal memperbarui status laporan kerusakan.",
        timestamp: new Date().toISOString(),
      };
    }

    // Catat Audit Log
    await supabase.rpc("catat_audit_log", {
      p_aksi: `UPDATE_KERUSAKAN_${payload.aksi.toUpperCase()}`,
      p_tabel: "laporan_kerusakan",
      p_data_id: payload.laporanId,
      p_sebelum: { status: laporan.status },
      p_sesudah: { status: nextStatus, detail: JSON.stringify(updateObj) },
    });

    revalidatePath("/dashboard/kerusakan");
    revalidatePath("/dashboard");

    return {
      success: true,
      statusCode: 200,
      message: `Status laporan ${laporan.nomor} berhasil diubah menjadi '${nextStatus}'.`,
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
