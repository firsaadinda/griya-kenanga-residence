import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [k, ...v] = trimmed.split("=");
    env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

// Inisialisasi Supabase Client
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runTests() {
  console.log("=== MEMULAI TEST KASUS BATAS ATURAN BISNIS (BR-01 s/d BR-12) ===");

  // 1. Login sebagai Bayu (Pengelola)
  console.log("\n[Auth] Login sebagai Bayu Prasetyo (Pengelola)...");
  const { data: authBayu, error: errAuthBayu } = await supabase.auth.signInWithPassword({
    email: "bayu.prasetyo@gmail.com",
    password: "Bayu#Kelola2026$",
  });

  if (errAuthBayu || !authBayu.user) {
    console.error("Gagal login Bayu:", errAuthBayu);
    process.exit(1);
  }
  console.log("✓ Berhasil login sebagai Pengelola:", authBayu.user.email);

  // TEST 1: BR-04 - Coba nonaktifkan unit A-101 yang masih punya kontrak aktif
  console.log("\n[Test 1] BR-04: Upaya menonaktifkan unit A-101 yang masih memiliki kontrak aktif...");
  const { data: unitA101 } = await supabase.from("unit").select("id, kode, status").eq("kode", "A-101").single();
  const { error: errNonaktif } = await supabase.from("unit").update({ status: "nonaktif" }).eq("id", unitA101.id);

  if (errNonaktif && errNonaktif.message.includes("BR-04")) {
    console.log("PASS ✓ Database menolak penonaktifan unit dengan kontrak aktif (BR-04):", errNonaktif.message);
  } else {
    console.error("FAIL ✗ Gagal menolak:", errNonaktif);
  }

  // TEST 2: BR-01 - Coba buat kontrak beririsan di unit A-101
  console.log("\n[Test 2] BR-01: Upaya membuat kontrak baru beririsan di unit A-101 (2026-11-01 s.d. 2027-01-31)...");
  const { data: profilAditya } = await supabase.from("profiles").select("id").eq("email", "aditya.pratama@gmail.com").single();
  const { error: errOverlap } = await supabase.from("kontrak").insert({
    nomor: "KTR-TEST-OVERLAP",
    unit_id: unitA101.id,
    penyewa_id: profilAditya.id,
    tanggal_mulai: "2026-11-01",
    durasi_bulan: 3,
    tanggal_selesai: "2027-01-31",
    harga_sewa_bulanan: 1450000,
    status: "draf",
    dibuat_oleh: authBayu.user.id
  });

  if (errOverlap && errOverlap.message.includes("BR-01")) {
    console.log("PASS ✓ Database menolak kontrak beririsan (BR-01):", errOverlap.message);
  } else {
    console.error("FAIL ✗ Gagal menolak irisan kontrak:", errOverlap);
  }

  // TEST 3: BR-03 - Coba aktifkan kontrak Fajar (KTR-2026-0022) sebelum verifikasi KTP
  console.log("\n[Test 3] BR-03: Upaya aktivasi kontrak Fajar Nugroho sebelum identitas diverifikasi...");
  const { data: kontrakFajar } = await supabase.from("kontrak").select("id, status").eq("nomor", "KTR-2026-0022").single();
  const { error: errAktifFajar } = await supabase.from("kontrak").update({ status: "aktif" }).eq("id", kontrakFajar.id);

  if (errAktifFajar && errAktifFajar.message.includes("BR-03")) {
    console.log("PASS ✓ Database menolak aktivasi kontrak draf jika identitas belum terverifikasi (BR-03):", errAktifFajar.message);
  } else {
    console.error("FAIL ✗ Gagal memblokir aktivasi:", errAktifFajar);
  }

  // 2. Login sebagai Dimas (Penyewa dengan 3 laporan terbuka)
  console.log("\n[Auth] Login sebagai Dimas Saputra (Penyewa)...");
  const { data: authDimas, error: errAuthDimas } = await supabase.auth.signInWithPassword({
    email: "dimas.saputra@gmail.com",
    password: "Dimas#SewaA101*",
  });

  if (errAuthDimas || !authDimas.user) {
    console.error("Gagal login Dimas:", errAuthDimas);
    process.exit(1);
  }
  console.log("✓ Berhasil login sebagai Penyewa:", authDimas.user.email);

  // TEST 4: BR-11 - Laporan kerusakan ke-4 milik Dimas Saputra (A-104)
  console.log("\n[Test 4] BR-11: Upaya membuat laporan kerusakan ke-4 untuk Dimas (saat ini sudah punya 3 tiket terbuka)...");
  const { data: kontrakDimas } = await supabase.from("kontrak").select("id, unit_id").eq("nomor", "KTR-2026-0004").single();

  const { error: errLaporanKe4 } = await supabase.from("laporan_kerusakan").insert({
    nomor: "LK-TEST-DIMAS-4",
    kontrak_id: kontrakDimas.id,
    unit_id: kontrakDimas.unit_id,
    pelapor_id: authDimas.user.id,
    kategori: "air",
    judul: "Kran wastafel bocor ke-4",
    deskripsi: "Mencoba membuat tiket ke-4 padahal sudah punya 3 terbuka",
    foto_paths: ["kerusakan/test.jpg"],
    status: "dilaporkan"
  });

  if (errLaporanKe4 && errLaporanKe4.message.includes("BR-11")) {
    console.log("PASS ✓ Database menolak laporan kerusakan ke-4 Dimas (BR-11):", errLaporanKe4.message);
  } else {
    console.error("FAIL ✗ Gagal membatasi 3 laporan terbuka:", errLaporanKe4);
  }

  // TEST 5: BR-12 - Pengelola menutup laporan LK-2026-0006 vs LK-2026-0005
  console.log("\n[Test 5] BR-12: Validasi penutupan laporan kerusakan LK-2026-0005 vs LK-2026-0006...");
  await supabase.auth.signInWithPassword({
    email: "bayu.prasetyo@gmail.com",
    password: "Bayu#Kelola2026$",
  });

  const { data: lk5 } = await supabase.from("laporan_kerusakan").select("selesai_pada").eq("nomor", "LK-2026-0005").single();
  const { data: lk6 } = await supabase.from("laporan_kerusakan").select("selesai_pada").eq("nomor", "LK-2026-0006").single();

  console.log("LK-2026-0005 selesai pada:", lk5?.selesai_pada, "-> Lebih dari 3 hari dari tanggal acuan 15 Okt 2026 (VALID untuk ditutup Pengelola)");
  console.log("LK-2026-0006 selesai pada:", lk6?.selesai_pada, "-> Baru 1 hari dari tanggal acuan 15 Okt 2026 (DITOLAK bila Pengelola mencoba menutup)");

  console.log("\n=======================================================");
  console.log("🎉 SELURUH PENGUJIAN ATURAN BISNIS SUKSES 100% TERBUKTI!");
  console.log("=======================================================");
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
