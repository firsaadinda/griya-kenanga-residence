import { requireRole } from "@/lib/auth/guard";
import {
  getLaporanKeuanganAction,
  getAuditLogsAction,
  getUsersForRoleManagementAction,
} from "@/lib/actions/laporan-actions";
import { LaporanClientView } from "./LaporanClientView";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Laporan Keuangan & Audit Log | Griya Kenanga Residence",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; periode?: "agu_okt" | "okt" | "semua" }>;
}) {
  // Guard Ketat: HANYA Pemilik yang diizinkan (Pengelola & Penyewa WAJIB DITOLAK -> 403)
  const profile = await requireRole(["pemilik"], "/dashboard/laporan");
  const params = await searchParams;
  const activePeriode = params?.periode || "agu_okt";

  // Ambil data laporan keuangan, riwayat audit tersanitasi, dan daftar manajemen peran
  const [laporanData, auditLogs, users] = await Promise.all([
    getLaporanKeuanganAction(activePeriode),
    getAuditLogsAction(),
    getUsersForRoleManagementAction(),
  ]);

  return (
    <LaporanClientView
      initialData={laporanData}
      initialAuditLogs={auditLogs}
      initialUsers={users}
      currentUserEmail={profile.email}
      activePeriode={activePeriode}
    />
  );
}
