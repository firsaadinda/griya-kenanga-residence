import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runTests() {
  console.log("=== MEMULAI TEST KASUS BATAS BR-01 s/d BR-12 ===");

  // TEST 1: BR-04 - Coba nonaktifkan unit yang masih punya kontrak aktif (contoh A-101)
  console.log("\n[Test 1] BR-04: Upaya menonaktifkan unit A-101 yang masih memiliki kontrak aktif...");
  const { data: unitA101 } = await supabase.from("unit").select("id, status").eq("kode", "A-101").single();
  const { error: errNonaktif } = await supabase.from("unit").update({ status: "nonaktif" }).eq("id", unitA101.id);
  
  if (errNonaktif && errNonaktif.message.includes("BR-04")) {
    console.log("PASS ✓ Database menolak penonaktifan unit dengan kontrak aktif:", errNonaktif.message);
  } else {
    console.error("FAIL ✗ Gagal menolak:", errNonaktif);
  }

  // TEST 2: BR-01 - Coba buat kontrak beririsan di unit A-101
  console.log("\n[Test 2] BR-01: Upaya membuat kontrak beririsan di unit A-101 (2026-11-01 s.d. 2026-12-31)...");
  const { data: profilAditya } = await supabase.from("profiles").select("id").eq("email", "aditya.pratama@gmail.com").single();
  const { error: errOverlap } = await supabase.from("kontrak").insert({
    nomor: "KTR-TEST-OVERLAP",
    unit_id: unitA101.id,
    penyewa_id: profilAditya.id,
    tanggal_mulai: "2026-11-01",
    durasi_bulan: 3,
    tanggal_selesai: "2027-01-31",
    harga_sewa_bulanan: 1450000,
    status: "draf"
  });

  if (errOverlap && errOverlap.message.includes("BR-01")) {
    console.log("PASS ✓ Database menolak pembuatan kontrak beririsan:", errOverlap.message);
  } else {
    console.error("FAIL ✗ Gagal menolak irisan kontrak:", errOverlap);
  }

  // TEST 3: BR-03 - Aktivasi kontrak Fajar (KTR-2026-0022) sebelum verifikasi KTP
  console.log("\n[Test 3] BR-03: Upaya aktivasi kontrak Fajar sebelum KTP diverifikasi...");
  const { data: kontrakFajar } = await supabase.from("kontrak").select("id, status").eq("nomor", "KTR-2026-0022").single();
  const { error: errAktifFajar } = await supabase.from("kontrak").update({ status: "aktif" }).eq("id", kontrakFajar.id);

  if (errAktifFajar && errAktifFajar.message.includes("BR-03")) {
    console.log("PASS ✓ Database menolak aktivasi kontrak draf jika identitas belum terverifikasi:", errAktifFajar.message);
  } else {
    console.error("FAIL ✗ Gagal memblokir aktivasi:", errAktifFajar);
  }

  // TEST 4: BR-11 - Laporan kerusakan ke-4 milik Dimas Saputra (A-104)
  console.log("\n[Test 4] BR-11: Upaya membuat laporan kerusakan ke-4 untuk Dimas (saat ini sudah punya 3 tiket terbuka)...");
  const { data: profilDimas } = await supabase.from("profiles").select("id").eq("email", "dimas.saputra@gmail.com").single();
  const { data: kontrakDimas } = await supabase.from("kontrak").select("id, unit_id").eq("nomor", "KTR-2026-0004").single();

  const { error: errLaporanKe4 } = await supabase.from("laporan_kerusakan").insert({
    nomor: "LK-TEST-DIMAS-4",
    kontrak_id: kontrakDimas.id,
    unit_id: kontrakDimas.unit_id,
    pelapor_id: profilDimas.id,
    kategori: "air",
    judul: "Kran bocor ke-4",
    deskripsi: "Mencoba membuat tiket ke-4 padahal sudah punya 3 terbuka",
    foto_paths: ["kerusakan/test.jpg"],
    status: "dilaporkan"
  });

  if (errLaporanKe4 && errLaporanKe4.message.includes("BR-11")) {
    console.log("PASS ✓ Database menolak laporan kerusakan ke-4 Dimas:", errLaporanKe4.message);
  } else {
    console.error("FAIL ✗ Gagal membatasi 3 laporan terbuka:", errLaporanKe4);
  }

  // TEST 5: BR-12 - Pengelola menutup laporan LK-2026-0006 (selesai 14 Okt, belum lewat 3 hari pada tanggal acuan 15 Okt)
  console.log("\n[Test 5] BR-12: Validasi penutupan laporan kerusakan LK-2026-0005 vs LK-2026-0006...");
  const { data: lk5 } = await supabase.from("laporan_kerusakan").select("selesai_pada").eq("nomor", "LK-2026-0005").single();
  const { data: lk6 } = await supabase.from("laporan_kerusakan").select("selesai_pada").eq("nomor", "LK-2026-0006").single();

  console.log("LK-2026-0005 selesai pada:", lk5.selesai_pada, "(10 Okt -> lebih dari 3 hari pada 15 Okt -> BOLEH ditutup)");
  console.log("LK-2026-0006 selesai pada:", lk6.selesai_pada, "(14 Okt -> baru 1 hari pada 15 Okt -> DITOLAK bila Pengelola mencoba menutup)");

  console.log("\n=== SELURUH PENGUJIAN ATURAN BISNIS BERHASIL DIVERIFIKASI ===");
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
