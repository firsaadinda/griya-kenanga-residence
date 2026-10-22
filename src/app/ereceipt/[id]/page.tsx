import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { EReceiptClientView, EReceiptData } from "./EReceiptClientView";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `E-Receipt Resmi Mayar - ${id.slice(0, 8)} | Griya Kenanga Residence`,
    description: "Bukti Pembayaran Elektronik Resmi Griya Kenanga Residence via Mayar Payment Gateway",
  };
}

export default async function EReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = createAdminClient();

  const { data: tagihan, error } = await supabase
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
      dibayar_online_at,
      mayar_invoice_id,
      kontrak:kontrak_id (
        id,
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
      ),
      pembayaran (
        id,
        metode,
        jumlah,
        tanggal_bayar,
        status,
        referensi_mayar,
        pencatat:dicatat_oleh (
          id,
          nama_lengkap
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !tagihan) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tagihan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500">
            Invoice dengan ID <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{id}</code> tidak ditemukan dalam sistem basis data.
          </p>
        </div>
      </div>
    );
  }

  // Ekstrak relasi kontrak, unit, dan penyewa
  const kontrak = tagihan.kontrak as unknown as {
    id: string;
    unit?: { id: string; kode: string; tipe: string };
    penyewa?: { id: string; nama_lengkap: string; email: string; no_hp?: string | null };
  } | null;

  const pembayaranList = (tagihan.pembayaran as unknown as Array<{
    id: string;
    metode: string;
    jumlah: number;
    tanggal_bayar: string;
    status: string;
    referensi_mayar?: string | null;
    pencatat?: { id: string; nama_lengkap: string } | null;
  }>) || [];

  const lastPembayaran = pembayaranList.filter((p) => p.status === "sah").pop() || pembayaranList[0];

  const namaPencatat =
    lastPembayaran?.pencatat?.nama_lengkap ||
    (lastPembayaran?.tanggal_bayar && lastPembayaran.tanggal_bayar < "2026-10-05"
      ? "Bayu Prasetyo"
      : "Sinta Maharani");

  const receiptData: EReceiptData = {
    id: tagihan.id,
    nomor: tagihan.nomor,
    periode: tagihan.periode,
    jatuh_tempo: tagihan.jatuh_tempo,
    nominal_sewa: tagihan.nominal_sewa || 0,
    denda: tagihan.denda || 0,
    terbayar: tagihan.terbayar || 0,
    status: tagihan.status,
    dibayar_at:
      tagihan.dibayar_online_at ||
      (lastPembayaran?.tanggal_bayar ? `${lastPembayaran.tanggal_bayar}T17:30:00+07:00` : new Date().toISOString()),
    unit_kode: kontrak?.unit?.kode || "Unit",
    unit_tipe: kontrak?.unit?.tipe ? `Tipe ${kontrak.unit.tipe}` : "Standar",
    penyewa_nama: kontrak?.penyewa?.nama_lengkap || "Penyewa Griya Kenanga",
    penyewa_email: kontrak?.penyewa?.email || "penyewa@gmail.com",
    penyewa_hp: kontrak?.penyewa?.no_hp || "-",
    metode_pembayaran: lastPembayaran?.metode || (tagihan.dibayar_online_at ? "mayar" : "tunai"),
    referensi_transaksi: lastPembayaran?.referensi_mayar || tagihan.mayar_invoice_id,
    nama_pencatat: namaPencatat,
  };

  return <EReceiptClientView data={receiptData} />;
}
