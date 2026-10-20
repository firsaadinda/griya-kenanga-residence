import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { TagihanClientView, TagihanItem } from "./TagihanClientView";

export const metadata = {
  title: "Tagihan & Pembayaran | Griya Kenanga Residence",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TagihanPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?status=401&returnUrl=/dashboard/tagihan");
  }

  const supabase = await createClient();

  // Ambil seluruh tagihan
  let query = supabase
    .from("tagihan")
    .select(`
      id,
      nomor,
      kontrak_id,
      periode,
      jatuh_tempo,
      nominal_sewa,
      denda,
      terbayar,
      status,
      alasan_batal,
      mayar_invoice_id,
      mayar_link,
      mayar_jumlah,
      dibayar_online_at,
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
    .order("nomor", { ascending: true });

  // Jika penyewa, hanya tampilkan tagihan miliknya
  if (profile.peran === "penyewa") {
    query = query.eq("kontrak.penyewa_id", profile.id);
  }

  const { data: rawTagihan, error: errTagihan } = await query;

  if (errTagihan) {
    console.error("Gagal memuat data tagihan:", errTagihan);
  }

  // Format ke TagihanItem[]
  const tagihanList: TagihanItem[] = (rawTagihan || []).map((t: any) => ({
    id: t.id,
    nomor: t.nomor,
    kontrak_id: t.kontrak_id,
    periode: t.periode,
    jatuh_tempo: t.jatuh_tempo,
    nominal_sewa: t.nominal_sewa,
    denda: t.denda || 0,
    terbayar: t.terbayar || 0,
    status: t.status,
    alasan_batal: t.alasan_batal,
    mayar_invoice_id: t.mayar_invoice_id || null,
    mayar_link: t.mayar_link || null,
    mayar_jumlah: t.mayar_jumlah || null,
    dibayar_online_at: t.dibayar_online_at || null,
    unit_kode: t.kontrak?.unit?.kode || "-",
    unit_tipe: t.kontrak?.unit?.tipe || "standar",
    penyewa_nama: t.kontrak?.penyewa?.nama_lengkap || "Penyewa",
    penyewa_email: t.kontrak?.penyewa?.email || "-",
    penyewa_hp: t.kontrak?.penyewa?.no_hp || null,
  }));

  // Kumpulkan daftar periode yang tersedia secara dinamis
  const periodesSet = new Set<string>();
  tagihanList.forEach((item) => {
    if (item.periode) periodesSet.add(item.periode);
  });
  // Pastikan periode acuan 2026-10-01 selalu ada
  periodesSet.add("2026-10-01");
  periodesSet.add("2026-09-01");
  periodesSet.add("2026-08-01");

  const availablePeriodes = Array.from(periodesSet).sort().reverse();
  const activePeriode = availablePeriodes.includes("2026-10-01")
    ? "2026-10-01"
    : availablePeriodes[0] || "2026-10-01";

  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#737A84]">Memuat data tagihan & pembayaran...</div>}>
      <TagihanClientView
        initialTagihanList={tagihanList}
        userRole={profile.peran}
        userName={profile.nama_lengkap}
        activePeriode={activePeriode}
        availablePeriodes={availablePeriodes}
      />
    </Suspense>
  );
}
