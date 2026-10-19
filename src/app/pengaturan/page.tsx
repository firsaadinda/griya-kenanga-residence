import { requireRole } from "@/lib/auth/guard";
import { redirect } from "next/navigation";

export default async function PengaturanRedirectPage() {
  await requireRole(["pemilik"], "/pengaturan");
  redirect("/dashboard/laporan?tab=pengaturan");
}
