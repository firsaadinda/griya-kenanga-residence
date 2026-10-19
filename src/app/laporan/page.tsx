import { requireRole } from "@/lib/auth/guard";
import { redirect } from "next/navigation";

export default async function LaporanRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Hanya Pemilik yang diizinkan (Pengelola & Penyewa ditolak 403)
  await requireRole(["pemilik"], "/laporan");
  const params = await searchParams;
  const tabQuery = params?.tab ? `?tab=${encodeURIComponent(params.tab)}` : "";
  redirect(`/dashboard/laporan${tabQuery}`);
}
