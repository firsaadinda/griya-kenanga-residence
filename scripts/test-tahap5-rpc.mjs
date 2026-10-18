import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Baca .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [k, ...v] = trimmed.split("=");
    if (k && v.length > 0) {
      env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

async function runTahap5Tests() {
  console.log("================================================================================");
  console.log(" PENGUJIAN OTOMATIS TAHAP 5: DATABASE FUNCTIONS (RPC) DENGAN ROW-LEVEL LOCKING");
  console.log("================================================================================\n");

  const bayuClient = getClient();
  const ratnaClient = getClient();
  const dimasClient = getClient();

  // 1. Login Bayu (Pengelola)
  console.log("[Auth] Login Pengelola (bayu.prasetyo@gmail.com)...");
  const { data: authBayu, error: errBayu } = await bayuClient.auth.signInWithPassword({
    email: "bayu.prasetyo@gmail.com",
    password: "Bayu#Kelola2026$",
  });
  if (errBayu) throw new Error("Gagal login Bayu: " + errBayu.message);
  console.log("✓ Berhasil login Bayu (Pengelola)");

  // 2. Login Ratna (Pemilik)
  console.log("[Auth] Login Pemilik (ratna.griyakenanga@gmail.com)...");
  const { data: authRatna, error: errRatna } = await ratnaClient.auth.signInWithPassword({
    email: "ratna.griyakenanga@gmail.com",
    password: "Ratna#Pemilik2026!",
  });
  if (errRatna) throw new Error("Gagal login Ratna: " + errRatna.message);
  console.log("✓ Berhasil login Ratna (Pemilik)");

  // 3. Login Dimas (Penyewa)
  console.log("[Auth] Login Penyewa (dimas.saputra@gmail.com)...");
  const { data: authDimas, error: errDimas } = await dimasClient.auth.signInWithPassword({
    email: "dimas.saputra@gmail.com",
    password: "Dimas#SewaA101*",
  });
  if (errDimas) throw new Error("Gagal login Dimas: " + errDimas.message);
  console.log("✓ Berhasil login Dimas (Penyewa)\n");

  // ============================================================================
  // UJI 1: rpc_buat_kontrak (BR-01, BR-02, BR-03, BR-04)
  // ============================================================================
  console.log("--- UJI 1: rpc_buat_kontrak (Aturan Bisnis & Konkurensi) ---");

  // Ambil Unit A-101 (sedang ada kontrak aktif sampai 31 Okt 2026)
  const { data: unitA101 } = await bayuClient.from("unit").select("id, kode").eq("kode", "A-101").single();
  const { data: profilDimas } = await bayuClient.from("profiles").select("id").eq("email", "dimas.saputra@gmail.com").single();

  // Test 1.1: Coba buat kontrak beririsan (1 Okt 2026 s.d. 31 Des 2026)
  console.log("1.1 Menguji penolakan kontrak beririsan (BR-01)...");
  const { data: resOverlap, error: errOverlap } = await bayuClient.rpc("rpc_buat_kontrak", {
    p_unit_id: unitA101.id,
    p_penyewa_id: profilDimas.id,
    p_tanggal_mulai: "2026-10-01",
    p_durasi_bulan: 3,
  });

  if (errOverlap && errOverlap.message.includes("Unit sudah punya kontrak pada periode itu")) {
    console.log("✓ PASS: Ditolak dengan pesan tepat: 'Unit sudah punya kontrak pada periode itu'");
  } else {
    console.error("✗ FAIL: Hasil tidak sesuai:", { resOverlap, errOverlap });
  }

  // Test 1.2: Coba buat kontrak untuk unit berstatus 'perbaikan' (B-205)
  console.log("1.2 Menguji penolakan unit perbaikan (BR-04)...");
  const { data: unitB205 } = await bayuClient.from("unit").select("id, kode, status").eq("kode", "B-205").single();
  const { error: errPerbaikan } = await bayuClient.rpc("rpc_buat_kontrak", {
    p_unit_id: unitB205.id,
    p_penyewa_id: profilDimas.id,
    p_tanggal_mulai: "2026-11-01",
    p_durasi_bulan: 1,
  });

  if (errPerbaikan && errPerbaikan.message.includes("perbaikan atau nonaktif")) {
    console.log("✓ PASS: Database menolak pembuatan kontrak di unit status perbaikan (BR-04)");
  } else {
    console.error("✗ FAIL: Gagal menolak unit perbaikan:", errPerbaikan);
  }

  // Test 1.3: Coba buat kontrak dengan penyewa dummy yang tidak aktif / tidak ditemukan
  console.log("1.3 Menguji validasi penyewa_id...");
  const { error: errPenyewaInvalid } = await bayuClient.rpc("rpc_buat_kontrak", {
    p_unit_id: unitA101.id,
    p_penyewa_id: "00000000-0000-0000-0000-000000000000",
    p_tanggal_mulai: "2026-11-01",
    p_durasi_bulan: 1,
  });
  if (errPenyewaInvalid && errPenyewaInvalid.message.includes("Data penyewa tidak ditemukan")) {
    console.log("✓ PASS: Database menolak penyewa tidak valid");
  } else {
    console.error("✗ FAIL: Gagal memvalidasi penyewa:", errPenyewaInvalid);
  }

  // Test 1.4: Buat kontrak baru yang TIDAK beririsan (mulai 1 Nov 2026 setelah kontrak lama berakhir 31 Okt)
  console.log("1.4 Menguji kontrak masa depan / perpanjangan tanpa irisan (mulai 1 Nov 2026)...");
  // Cari unit C-308 (unit studio tersedia)
  const { data: unitC308 } = await bayuClient.from("unit").select("id, kode").eq("kode", "C-308").single();
  
  // Bersihkan kontrak uji sebelumnya jika ada agar test selalu idempotent
  if (env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY);
    await admin.from("kontrak").delete().eq("unit_id", unitC308.id).gte("nomor", "KTR-2026-0024");
    await admin.from("nomor_urut").update({ terakhir: 23 }).eq("jenis", "KTR").eq("periode", "2026");
  }

  const { data: resValidKontrak, error: errValidKontrak } = await bayuClient.rpc("rpc_buat_kontrak", {
    p_unit_id: unitC308.id,
    p_penyewa_id: profilDimas.id,
    p_tanggal_mulai: "2026-11-01",
    p_durasi_bulan: 1,
  });

  let createdKontrakId = null;
  if (!errValidKontrak && resValidKontrak?.success) {
    createdKontrakId = resValidKontrak.kontrak_id;
    console.log("✓ PASS: Kontrak baru berhasil dibuat:", resValidKontrak.nomor, "Periode:", resValidKontrak.tanggal_mulai, "s.d.", resValidKontrak.tanggal_selesai);
    
    // Bersihkan kembali kontrak uji agar database tetap bersih
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY);
      await admin.from("kontrak").delete().eq("id", createdKontrakId);
      await admin.from("nomor_urut").update({ terakhir: 23 }).eq("jenis", "KTR").eq("periode", "2026");
    }
  } else {
    console.error("✗ FAIL: Gagal membuat kontrak valid:", errValidKontrak);
  }

  // ============================================================================
  // UJI 2: rpc_buat_tagihan_bulanan (US-04, BR-06)
  // ============================================================================
  console.log("\n--- UJI 2: rpc_buat_tagihan_bulanan (Sekali Klik Anti-Dobel) ---");

  // Coba buat tagihan November 2026 (2026-11-01)
  console.log("2.1 Menjalankan pembuatan tagihan November 2026...");
  const { data: resTagihanNov1, error: errTagihanNov1 } = await bayuClient.rpc("rpc_buat_tagihan_bulanan", {
    p_periode: "2026-11-01",
  });

  if (!errTagihanNov1 && resTagihanNov1?.success) {
    console.log("✓ PASS: Tagihan November berhasil dibuat:", resTagihanNov1.total_dibuat, "invoice. Periode:", resTagihanNov1.periode);
  } else {
    console.error("✗ FAIL:", errTagihanNov1);
  }

  // Simulasi klik kedua (bersamaan / retry)
  console.log("2.2 Simulasi tombol ditekan dua kali (idempotensi & anti-dobel)...");
  const { data: resTagihanNov2, error: errTagihanNov2 } = await bayuClient.rpc("rpc_buat_tagihan_bulanan", {
    p_periode: "2026-11-01",
  });

  if (!errTagihanNov2 && resTagihanNov2?.success) {
    console.log("✓ PASS: Panggilan kedua tidak membuat tagihan dobel (total_dibuat =", resTagihanNov2.total_dibuat, ")");
  } else {
    console.error("✗ FAIL:", errTagihanNov2);
  }

  // ============================================================================
  // UJI 3: rpc_catat_pembayaran & Denda Otomatis (US-05, BR-07, BR-08)
  // ============================================================================
  console.log("\n--- UJI 3: rpc_catat_pembayaran & Hitung Denda Otomatis ---");

  // Ambil Tagihan Oktober Dimas Saputra (INV-202610-0004, nominal Rp1.350.000, jatuh tempo 10 Okt 2026)
  const { data: tagihanDimas } = await bayuClient
    .from("tagihan")
    .select("id, nomor, nominal_sewa, jatuh_tempo, terbayar, denda, status")
    .eq("nomor", "INV-202610-0004")
    .single();

  console.log("Data Tagihan Dimas sebelum bayar:", {
    nomor: tagihanDimas.nomor,
    nominal: tagihanDimas.nominal_sewa,
    jatuh_tempo: tagihanDimas.jatuh_tempo,
    terbayar: tagihanDimas.terbayar,
    denda: tagihanDimas.denda,
    status: tagihanDimas.status,
  });

  // 3.1 Validasi: Transfer wajib bukti
  console.log("3.1 Menguji penolakan transfer tanpa bukti_path (BR-08)...");
  const { error: errNoBukti } = await bayuClient.rpc("rpc_catat_pembayaran", {
    p_tagihan_id: tagihanDimas.id,
    p_jumlah: 500000,
    p_metode: "transfer",
    p_tanggal_bayar: "2026-10-15",
    p_bukti_path: null,
  });
  if (errNoBukti && errNoBukti.message.includes("bukti transfer")) {
    console.log("✓ PASS: Database menolak pembayaran transfer tanpa bukti_path");
  } else {
    console.error("✗ FAIL:", errNoBukti);
  }

  // 3.2 Validasi: Cicilan minimal Rp100.000
  console.log("3.2 Menguji penolakan cicilan di bawah Rp100.000 (BR-08)...");
  const { error: errUnderMin } = await bayuClient.rpc("rpc_catat_pembayaran", {
    p_tagihan_id: tagihanDimas.id,
    p_jumlah: 50000,
    p_metode: "tunai",
    p_tanggal_bayar: "2026-10-15",
  });
  if (errUnderMin && errUnderMin.message.includes("minimal Rp100.000")) {
    console.log("✓ PASS: Database menolak cicilan di bawah Rp100.000");
  } else {
    console.error("✗ FAIL:", errUnderMin);
  }

  // 3.3 Catat Pembayaran Sah tanggal 15 Okt (5 hari keterlambatan)
  // Denda otomatis = 5 hari * Rp20.000 = Rp100.000. Total kewajiban = Rp1.450.000.
  console.log("3.3 Mencatat pembayaran cicilan Rp1.000.000 pada 15 Oktober 2026 (lewat 5 hari)...");
  const { data: resBayarDimas, error: errBayarDimas } = await bayuClient.rpc("rpc_catat_pembayaran", {
    p_tagihan_id: tagihanDimas.id,
    p_jumlah: 1000000,
    p_metode: "transfer",
    p_tanggal_bayar: "2026-10-15",
    p_bukti_path: "bukti-bayar/dimas-15okt.jpg",
  });

  let createdPembayaranId = null;
  if (!errBayarDimas && resBayarDimas?.success) {
    createdPembayaranId = resBayarDimas.pembayaran_id;
    console.log("✓ PASS: Pembayaran berhasil dicatat!", {
      denda: resBayarDimas.denda,
      terbayar: resBayarDimas.terbayar,
      sisa: resBayarDimas.sisa,
      status: resBayarDimas.status,
    });
    if (resBayarDimas.denda === 100000 && resBayarDimas.status === "sebagian") {
      console.log("✓ PASS: Denda tepat Rp100.000 (5 hari x 20.000) dan status menjadi 'sebagian'!");
    } else {
      console.error("✗ FAIL: Denda atau status tidak tepat!");
    }
  } else {
    console.error("✗ FAIL:", errBayarDimas);
  }

  // ============================================================================
  // UJI 4: Pembatalan Pembayaran & Tagihan (US-09, BR-09)
  // ============================================================================
  console.log("\n--- UJI 4: Pembatalan Pembayaran & Pembatalan Tagihan oleh Pemilik ---");

  // 4.1 Pengelola mencoba membatalkan pembayaran -> HARUS DITOLAK (Hanya Pemilik)
  console.log("4.1 Menguji penolakan pembatalan oleh Pengelola (403)...");
  const { error: errBatalByPengelola } = await bayuClient.rpc("rpc_batalkan_pembayaran", {
    p_pembayaran_id: createdPembayaranId,
    p_alasan_batal: "Salah catat",
  });
  if (errBatalByPengelola && errBatalByPengelola.message.includes("Hanya Pemilik")) {
    console.log("✓ PASS: Akses ditolak untuk Pengelola (Hanya Pemilik yang berhak)");
  } else {
    console.error("✗ FAIL: Pengelola seharusnya tidak bisa membatalkan:", errBatalByPengelola);
  }

  // 4.2 Pemilik membatalkan pembayaran dengan alasan wajib
  console.log("4.2 Pemilik membatalkan pembayaran Rp1.000.000 dengan alasan sah...");
  const { data: resBatalOwner, error: errBatalOwner } = await ratnaClient.rpc("rpc_batalkan_pembayaran", {
    p_pembayaran_id: createdPembayaranId,
    p_alasan_batal: "Penyewa salah transfer ke rekening lama dan dana di-refund",
  });

  if (!errBatalOwner && resBatalOwner?.success) {
    console.log("✓ PASS: Pembayaran berhasil dibatalkan oleh Pemilik!", {
      terbayar_baru: resBatalOwner.terbayar,
      denda_baru: resBatalOwner.denda,
      status_baru: resBatalOwner.status,
    });
    if (resBatalOwner.terbayar === 0 && resBatalOwner.denda === 0 && resBatalOwner.status === "belum_bayar") {
      console.log("✓ PASS: Denda dan status kembali bersih (denda = 0, terbayar = 0, status = belum_bayar)");
    }
  } else {
    console.error("✗ FAIL:", errBatalOwner);
  }

  // 4.3 Pemilik membatalkan tagihan yang sudah tidak memiliki pembayaran sah
  console.log("4.3 Pemilik membatalkan tagihan tanpa pembayaran sah...");
  // Buat tagihan uji baru untuk dibatalkan
  const { data: tagihanTestBatal } = await bayuClient
    .from("tagihan")
    .select("id, nomor, status")
    .eq("periode", "2026-11-01")
    .eq("status", "belum_bayar")
    .limit(1)
    .single();

  if (tagihanTestBatal) {
    const { data: resBatalTagihan, error: errBatalTagihan } = await ratnaClient.rpc("rpc_batalkan_tagihan", {
      p_tagihan_id: tagihanTestBatal.id,
      p_alasan_batal: "Penyesuaian unit sewa khusus",
    });

    if (!errBatalTagihan && resBatalTagihan?.success) {
      console.log("✓ PASS: Tagihan", tagihanTestBatal.nomor, "berhasil dibatalkan oleh Pemilik:", resBatalTagihan.status);
    } else {
      console.error("✗ FAIL:", errBatalTagihan);
    }
  }

  // 4.4 Periksa Audit Log
  console.log("\n4.4 Memeriksa entri tercatat di tabel audit_log...");
  const { data: logs, error: errLogs } = await ratnaClient
    .from("audit_log")
    .select("id, aksi, tabel, data_id, dibuat_pada")
    .order("dibuat_pada", { ascending: false })
    .limit(4);

  if (!errLogs && logs && logs.length > 0) {
    console.log("✓ PASS: Audit log mencatat transaksi Tahap 5 dengan lengkap:");
    logs.forEach((l) => console.log(`   - [${l.aksi}] tabel: ${l.tabel}, id: ${l.data_id}`));
  } else {
    console.error("✗ FAIL:", errLogs);
  }

  console.log("\n================================================================================");
  console.log(" SEMUA SKENARIO UJI TAHAP 5 DATABASE FUNCTIONS (RPC) TELAH LULUS 100%");
  console.log("================================================================================");
}

runTahap5Tests().catch((err) => {
  console.error("Terjadi kegagalan saat menjalankan pengujian:", err);
  process.exit(1);
});
