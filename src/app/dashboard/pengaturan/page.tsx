import { requireRole } from "@/lib/auth/guard";
import { redirect } from "next/navigation";

export default async function PengaturanPage() {
  // Hanya Pemilik yang diizinkan (Pengelola & Penyewa ditolak 403)
  await requireRole(["pemilik"], "/dashboard/pengaturan");
  // Arahkan dengan mulus ke tab pengaturan di halaman Laporan & Pengaturan
  redirect("/dashboard/laporan?tab=pengaturan");
}
