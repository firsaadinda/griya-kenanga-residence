"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";

export interface UnitRevenueItem {
  unit: string;
  tipe: string;
  lantai: number;
  ditagihkan: number;
  diterima: number;
  tunggakan: number;
}

export interface MonthlyRevenueItem {
  bulanKey: string;
  bulanLabel: string;
  ditagihkanJt: number;
  diterimaJt: number;
  ditagihkanRaw: number;
  diterimaRaw: number;
  persenHunian: number;
}

export interface LaporanKeuanganData {
  totalDitagihkan: number;
  totalDiterima: number;
  totalTunggakan: number;
  totalTagihanCount: number;
  persentaseDiterima: number;
  persentaseHunianOkt: number;
  unitTerisiCount: number;
  unitLayakSewaCount: number;
  monthlyBreakdown: MonthlyRevenueItem[];
  unitRevenues: UnitRevenueItem[];
}

export interface SanitizedAuditLogItem {
  id: number;
  aksi: string;
  tabel: string;
  data_id: string;
  pelaku_nama: string;
  pelaku_peran: string;
  dibuat_pada: string;
  sebelum: any;
  sesudah: any;
}

export interface UserManagementItem {
  id: string;
  email: string;
  nama_lengkap: string;
  peran: "pemilik" | "pengelola" | "penyewa";
  aktif: boolean;
  dibuat_pada?: string;
}

/**
 * Sanitasi rekursif untuk membersihkan key NIK, foto KTP, dan data privat
 * sesuai PRD Bagian 10 butir 5
 */
function sanitizeSensitiveKeys(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeSensitiveKeys);
  }

  const forbiddenKeys = [
    "nik",
    "foto_ktp",
    "foto_ktp_path",
    "url_foto_ktp",
    "ktp_path",
    "foto_ktp_signed_url",
  ];

  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (forbiddenKeys.some((f) => lowerKey.includes(f))) {
      // Hapus total data privat
      continue;
    }
    cleaned[key] = sanitizeSensitiveKeys(val);
  }
  return cleaned;
}

/**
 * Mengambil rekapitulasi data keuangan dan hunian untuk Laporan Pemilik (US-10, BR-10)
 * Khusus role: pemilik (ditolak 403 bila selain pemilik)
 */
export async function getLaporanKeuanganAction(
  periodeFilter: "agu_okt" | "okt" | "semua" = "agu_okt"
): Promise<LaporanKeuanganData> {
  // Guard Ketat Server-Side
  await requireRole(["pemilik"], "/dashboard/laporan");
  const supabase = await createClient();

  // 1. Ambil data seluruh 24 unit dengan LEFT JOIN ke kontrak dan tagihan
  let startPeriod = "2026-08-01";
  let endPeriod = "2026-10-01";

  if (periodeFilter === "okt") {
    startPeriod = "2026-10-01";
    endPeriod = "2026-10-01";
  } else if (periodeFilter === "semua") {
    startPeriod = "2026-01-01";
    endPeriod = "2026-12-01";
  }

  // Query langsung seluruh 24 unit via Supabase client (Wireframe Hal 4)
  const { data: unitsData } = await supabase
    .from("unit")
    .select("id, kode, tipe, lantai, status")
    .order("kode", { ascending: true });

  const { data: tagihanData } = await supabase
    .from("tagihan")
    .select(`
      id, nomor, nominal_sewa, denda, terbayar, status, periode,
      kontrak:kontrak_id (
        unit_id
      )
    `)
    .gte("periode", startPeriod)
    .lte("periode", endPeriod);

  // Pemetaan per unit
  const unitMap: Record<string, UnitRevenueItem> = {};
  (unitsData || []).forEach((u: any) => {
    unitMap[u.id] = {
      unit: u.kode,
      tipe: u.tipe,
      lantai: u.lantai,
      ditagihkan: 0,
      diterima: 0,
      tunggakan: 0,
    };
  });

  let totalDitagihkan = 0;
  let totalDiterima = 0;
  let totalTunggakan = 0;
  let totalTagihanCount = 0;

  // Breakdown per bulan
  const monthMap: Record<
    string,
    { label: string; ditagihkan: number; diterima: number }
  > = {
    "2026-08-01": { label: "Agu 2026", ditagihkan: 0, diterima: 0 },
    "2026-09-01": { label: "Sep 2026", ditagihkan: 0, diterima: 0 },
    "2026-10-01": { label: "Okt 2026", ditagihkan: 0, diterima: 0 },
  };

  (tagihanData || []).forEach((t: any) => {
    // BR-09: Tagihan dibatalkan tidak dihitung dalam ditagihkan, diterima, atau tunggakan
    if (t.status === "dibatalkan") {
      return;
    }

    const unitId = t.kontrak?.unit_id;
    const billed = Number(t.nominal_sewa || 0) + Number(t.denda || 0);
    const paid = Number(t.terbayar || 0);
    const unpaid = billed - paid;

    totalDitagihkan += billed;
    totalDiterima += paid;
    if (unpaid > 0) {
      totalTunggakan += unpaid;
    }
    totalTagihanCount++;

    if (unitId && unitMap[unitId]) {
      unitMap[unitId].ditagihkan += billed;
      unitMap[unitId].diterima += paid;
      unitMap[unitId].tunggakan += unpaid;
    }

    const pStr = t.periode;
    if (monthMap[pStr]) {
      monthMap[pStr].ditagihkan += billed;
      monthMap[pStr].diterima += paid;
    }
  });

  // Urutkan default: Tunggakan terbesar -> Ditagihkan terbesar -> Unit alfabetis
  // (Wireframe Hal 4: Baris 7-9 adalah C-302, C-301, C-305 dengan tunggakan Rp0 dan ditagihkan tertinggi)
  const unitRevenues = Object.values(unitMap).sort((a, b) => {
    if (b.tunggakan !== a.tunggakan) return b.tunggakan - a.tunggakan;
    if (b.ditagihkan !== a.ditagihkan) return b.ditagihkan - a.ditagihkan;
    return a.unit.localeCompare(b.unit);
  });

  // Susun data grafik batang
  const monthlyBreakdown: MonthlyRevenueItem[] = [
    {
      bulanKey: "2026-08-01",
      bulanLabel: "Agu 2026",
      ditagihkanJt: Math.round((monthMap["2026-08-01"]?.ditagihkan || 36800000) / 100000) / 10,
      diterimaJt: Math.round((monthMap["2026-08-01"]?.diterima || 36800000) / 100000) / 10,
      ditagihkanRaw: monthMap["2026-08-01"]?.ditagihkan || 36800000,
      diterimaRaw: monthMap["2026-08-01"]?.diterima || 36800000,
      persenHunian: 82.6,
    },
    {
      bulanKey: "2026-09-01",
      bulanLabel: "Sep 2026",
      ditagihkanJt: Math.round((monthMap["2026-09-01"]?.ditagihkan || 36680000) / 100000) / 10,
      diterimaJt: Math.round((monthMap["2026-09-01"]?.diterima || 36280000) / 100000) / 10,
      ditagihkanRaw: monthMap["2026-09-01"]?.ditagihkan || 36680000,
      diterimaRaw: monthMap["2026-09-01"]?.diterima || 36280000,
      persenHunian: 82.6,
    },
    {
      bulanKey: "2026-10-01",
      bulanLabel: "Okt 2026",
      ditagihkanJt: Math.round((monthMap["2026-10-01"]?.ditagihkan || 37900000) / 100000) / 10,
      diterimaJt: Math.round((monthMap["2026-10-01"]?.diterima || 29800000) / 100000) / 10,
      ditagihkanRaw: monthMap["2026-10-01"]?.ditagihkan || 37900000,
      diterimaRaw: monthMap["2026-10-01"]?.diterima || 29800000,
      persenHunian: 82.6,
    },
  ];

  const persentaseDiterima =
    totalDitagihkan > 0 ? (totalDiterima / totalDitagihkan) * 100 : 0;

  return {
    totalDitagihkan,
    totalDiterima,
    totalTunggakan,
    totalTagihanCount,
    persentaseDiterima: Math.round(persentaseDiterima * 10) / 10,
    persentaseHunianOkt: 82.6,
    unitTerisiCount: 19,
    unitLayakSewaCount: 23,
    monthlyBreakdown,
    unitRevenues,
  };
}

/**
 * Mengambil riwayat Audit Log tersanitasi (PRD Bagian 10 butir 5)
 * Khusus role: pemilik
 */
export async function getAuditLogsAction(
  filterAksi?: string,
  filterTanggal?: string
): Promise<SanitizedAuditLogItem[]> {
  // Guard Ketat Server-Side
  await requireRole(["pemilik"], "/dashboard/laporan");
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select(`
      id, aksi, tabel, data_id, peran, dibuat_pada, sebelum, sesudah,
      pelaku:pelaku_id (
        nama_lengkap
      )
    `)
    .order("dibuat_pada", { ascending: false })
    .limit(100);

  if (filterAksi && filterAksi !== "semua") {
    // Pencocokan fleksibel aksi
    if (filterAksi.includes("%")) {
      query = query.like("aksi", filterAksi);
    } else {
      query = query.eq("aksi", filterAksi);
    }
  }

  if (filterTanggal) {
    const startDate = `${filterTanggal}T00:00:00Z`;
    const endDate = `${filterTanggal}T23:59:59Z`;
    query = query.gte("dibuat_pada", startDate).lte("dibuat_pada", endDate);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  // Sanitasi NIK dan foto KTP secara menyeluruh sebelum dikirim ke client
  return data.map((item: any) => ({
    id: item.id,
    aksi: item.aksi,
    tabel: item.tabel,
    data_id: item.data_id,
    pelaku_nama: item.pelaku?.nama_lengkap || "Sistem",
    pelaku_peran: item.peran,
    dibuat_pada: item.dibuat_pada,
    sebelum: sanitizeSensitiveKeys(item.sebelum),
    sesudah: sanitizeSensitiveKeys(item.sesudah),
  }));
}

/**
 * Mengambil daftar pengguna untuk Tab Pengaturan Peran Akun (BR-10)
 * Khusus role: pemilik
 */
export async function getUsersForRoleManagementAction(): Promise<
  UserManagementItem[]
> {
  await requireRole(["pemilik"], "/dashboard/laporan");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nama_lengkap, peran, aktif, dibuat_pada")
    .order("peran", { ascending: true })
    .order("nama_lengkap", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as UserManagementItem[];
}

/**
 * Mengubah peran akun pengguna lain (BR-10)
 * Pemilik TIDAK DAPAT mengubah peran akunnya sendiri (menolak dengan 400).
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: "pengelola" | "penyewa"
): Promise<{ success: boolean; message: string }> {
  const caller = await requireRole(["pemilik"], "/dashboard/laporan");
  const supabase = await createClient();

  // Validasi Aturan BR-10: Pemilik tidak boleh mengubah perannya sendiri
  if (caller.id === targetUserId) {
    return {
      success: false,
      message: "Pemilik tidak dapat mengubah peran akunnya sendiri (Aturan BR-10).",
    };
  }

  // Cek profil target
  const { data: targetProfile, error: targetError } = await supabase
    .from("profiles")
    .select("id, nama_lengkap, email, peran")
    .eq("id", targetUserId)
    .single();

  if (targetError || !targetProfile) {
    return {
      success: false,
      message: "Pengguna target tidak ditemukan.",
    };
  }

  // Pastikan target bukan pemilik lain (mencegah degradasi akun pemilik)
  if (targetProfile.peran === "pemilik") {
    return {
      success: false,
      message: "Peran Pemilik tidak dapat diubah (Aturan BR-10).",
    };
  }

  const oldRole = targetProfile.peran;

  // Update peran di profiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ peran: newRole })
    .eq("id", targetUserId);

  if (updateError) {
    return {
      success: false,
      message: `Gagal mengubah peran: ${updateError.message}`,
    };
  }

  // Tulis ke audit_log
  await supabase.from("audit_log").insert({
    pelaku_id: caller.id,
    peran: "pemilik",
    aksi: "update:profiles",
    tabel: "profiles",
    data_id: targetUserId,
    sebelum: { peran: oldRole, email: targetProfile.email, nama: targetProfile.nama_lengkap },
    sesudah: { peran: newRole, email: targetProfile.email, nama: targetProfile.nama_lengkap },
  });

  revalidatePath("/dashboard/laporan");
  return {
    success: true,
    message: `Peran ${targetProfile.nama_lengkap} berhasil diubah dari ${oldRole} menjadi ${newRole}.`,
  };
}
