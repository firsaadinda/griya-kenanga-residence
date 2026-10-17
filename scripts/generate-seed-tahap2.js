const xlsx = require('xlsx');
const fs = require('fs');

const excelPath = 'E:/Capstone Project/drive-download-20261016T150631Z-1-001/Data_Contoh_Properti.xlsx';
const wb = xlsx.readFile(excelPath);

function escapeSql(val) {
  if (val === null || val === undefined || val === '') return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function formatPhone(num) {
  if (!num) return null;
  let s = String(num).trim();
  if (s.startsWith('8')) {
    s = '0' + s;
  }
  return s;
}

function cleanRow(row) {
  const cleaned = {};
  for (const [key, val] of Object.entries(row)) {
    if (key.includes('(bantu)')) continue;
    cleaned[key] = val;
  }
  return cleaned;
}

function generateSeedSql() {
  let sql = `-- ==============================================================================
-- Seeding Data Awal Griya Kenanga Residence (Tahap 2)
-- Sesuai Data_Contoh_Properti.xlsx (Abaikan kolom bantu)
-- ==============================================================================

BEGIN;

-- Matikan trigger user sementara agar data contoh historis termuat sempurna
ALTER TABLE public.profiles DISABLE TRIGGER USER;
ALTER TABLE public.unit DISABLE TRIGGER USER;
ALTER TABLE public.kontrak DISABLE TRIGGER USER;
ALTER TABLE public.laporan_kerusakan DISABLE TRIGGER USER;

-- 1. Profiles & auth.users (25 akun, kata sandi Latihan#2026)
`;

  const userEmailAndPassMap = {
    "d2fe618c-8788-577e-b188-9c67073bf8d0": { email: "ratna.griyakenanga@gmail.com", pass: "Ratna#Pemilik2026!" },
    "04e98049-133d-5664-9e2c-579ddd2d1d01": { email: "bayu.prasetyo@gmail.com", pass: "Bayu#Kelola2026$" },
    "d2774014-ed5c-5c8e-9b4e-b4859e885ddf": { email: "sinta.maharani@gmail.com", pass: "Sinta#Admin2026%" },
    "4dfac964-253c-5ff5-829a-503cabaffead": { email: "aditya.pratama@gmail.com", pass: "Aditya#SewaB201*" },
    "7d58b393-6d62-5800-84f0-9e718cd141d0": { email: "bella.safitri@gmail.com", pass: "Bella#SewaA102&" },
    "6ec02923-0624-5f1d-8013-c5284528cbd6": { email: "cahya.ramadhan@gmail.com", pass: "Cahya#SewaA103^" },
    "d8de5db0-dbad-5530-ba7c-606eb8ffb821": { email: "dimas.saputra@gmail.com", pass: "Dimas#SewaA101*" },
    "7294c978-58c9-516b-80dc-31794579b8a7": { email: "eka.wulandari@gmail.com", pass: "Eka#SewaA105@" },
    "6a59025a-6776-5995-b6a6-cb1e985a6782": { email: "fajar.nugroho@gmail.com", pass: "Fajar#SewaC307!" },
    "e273be02-1d78-5b87-8916-bb926cf2f022": { email: "gilang.mahendra@gmail.com", pass: "Gilang#SewaB202#" },
    "37608550-7a0d-554f-907d-24513c3229e6": { email: "hana.puspita@gmail.com", pass: "Hana#SewaA104$" },
    "e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c": { email: "indra.kurniawan@gmail.com", pass: "Indra#SewaB203%" },
    "d8cba6dc-cf31-5168-827e-708ed5271e38": { email: "jihan.aulia@gmail.com", pass: "Jihan#SewaA106^" },
    "9c3bb3d4-d5eb-5df1-931a-f88b971a94c0": { email: "kevin.wijaya@gmail.com", pass: "Kevin#SewaB204&" },
    "a9e51a3a-0966-535c-b1f8-9cee5ceab23b": { email: "laras.anggraini@gmail.com", pass: "Laras#SewaA107*" },
    "e0491bf1-62a5-5250-86fc-68005900017f": { email: "muhammad.rizki@gmail.com", pass: "Rizki#SewaB205(" },
    "aed421f9-3176-5c9e-927d-38376326cd0d": { email: "nadia.salsabila@gmail.com", pass: "Nadia#SewaB207)" },
    "ef21f3ea-8cd8-55a5-8c0c-5c27544670cd": { email: "oki.firmansyah@gmail.com", pass: "Oki#SewaA108-" },
    "f5f5bd85-867b-5f38-bd99-3ad0cf86eb17": { email: "putri.lestari@gmail.com", pass: "Putri#SewaB208+" },
    "8e911480-1646-5bbe-b156-21435bac068e": { email: "raka.aditama@gmail.com", pass: "Raka#SewaC301=" },
    "4e5748e1-c042-539a-a90c-26d64e08b6e2": { email: "salma.nuraini@gmail.com", pass: "Salma#SewaC302~" },
    "2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97": { email: "teguh.santoso@gmail.com", pass: "Teguh#SewaC303!" },
    "6429ed6c-4763-537b-ac3c-01edf27270dc": { email: "vina.rahmawati@gmail.com", pass: "Vina#SewaC304#" },
    "b85979c0-169a-59ea-97b0-0f129384b23c": { email: "wahyu.hidayat@gmail.com", pass: "Wahyu#SewaC306$" },
    "08ee861b-6b69-593e-a373-2812a0e8dbfc": { email: "yoga.permana@gmail.com", pass: "Yoga#SewaC308%" }
  };

  const profiles = xlsx.utils.sheet_to_json(wb.Sheets['profiles']).map(cleanRow);
  for (const p of profiles) {
    const userConfig = userEmailAndPassMap[p.id] || { email: p.email.replace('@griyakenanga.test', '@gmail.com'), pass: 'Griya#2026!' };
    const emailToUse = userConfig.email;
    const passToUse = userConfig.pass;

    const meta = JSON.stringify({ full_name: p.nama_lengkap, role: p.peran });
    const appMeta = JSON.stringify({ provider: 'email', providers: ['email'] });
    const formattedHp = formatPhone(p.no_hp);

    sql += `
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  ${escapeSql(p.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  ${escapeSql(emailToUse)}, crypt('${passToUse}', gen_salt('bf', 10)), ${escapeSql(p.dibuat_pada)},
  '${appMeta}'::jsonb, '${meta}'::jsonb, ${escapeSql(p.dibuat_pada)}, ${escapeSql(p.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, encrypted_password = EXCLUDED.encrypted_password;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(), ${escapeSql(p.id)},
  jsonb_build_object('sub', ${escapeSql(p.id)}, 'email', ${escapeSql(emailToUse)}, 'email_verified', true, 'phone_verified', false),
  'email', ${escapeSql(p.id)}, now(), ${escapeSql(p.dibuat_pada)}, now()
) ON CONFLICT (provider, provider_id) DO UPDATE SET identity_data = EXCLUDED.identity_data;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.nama_lengkap)}, ${escapeSql(emailToUse)}, ${escapeSql(formattedHp)}, ${escapeSql(p.peran)}, ${p.aktif === 'true' || p.aktif === true ? 'TRUE' : 'FALSE'}, ${escapeSql(p.dibuat_pada)})
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;
`;
  }


  // 2. Identitas Penyewa (22 baris)
  sql += `\n-- 2. Identitas Penyewa (22 baris)\n`;
  const identitas = xlsx.utils.sheet_to_json(wb.Sheets['identitas_penyewa']).map(cleanRow);
  for (const item of identitas) {
    const formattedKontakHp = formatPhone(item.kontak_darurat_hp);
    sql += `
INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  ${escapeSql(item.penyewa_id)}, ${escapeSql(item.nik)}, ${escapeSql(item.alamat_asal)},
  ${escapeSql(item.foto_ktp_path)}, ${escapeSql(item.kontak_darurat_nama)}, ${escapeSql(formattedKontakHp)},
  ${escapeSql(item.status_verifikasi)}, ${escapeSql(item.alasan_tolak)}, ${escapeSql(item.diverifikasi_oleh)},
  ${escapeSql(item.diverifikasi_pada)}, ${escapeSql(item.diperbarui_pada)}
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;
`;
  }

  // 3. Unit (24 unit)
  sql += `\n-- 3. Unit (24 unit)\n`;
  const units = xlsx.utils.sheet_to_json(wb.Sheets['unit']).map(cleanRow);
  for (const u of units) {
    sql += `
INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.kode)}, ${u.lantai}, ${escapeSql(u.tipe)}, ${u.luas_m2}, ${u.harga_sewa_bulanan}, ${escapeSql(u.status)}, ${escapeSql(u.keterangan)}, ${escapeSql(u.dibuat_pada)})
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;
`;
  }

  // 4. Kontrak (23 kontrak)
  sql += `\n-- 4. Kontrak (23 kontrak)\n`;
  const contracts = xlsx.utils.sheet_to_json(wb.Sheets['kontrak']).map(cleanRow);
  for (const k of contracts) {
    sql += `
INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  ${escapeSql(k.id)}, ${escapeSql(k.nomor)}, ${escapeSql(k.unit_id)}, ${escapeSql(k.penyewa_id)},
  ${escapeSql(k.tanggal_mulai)}, ${k.durasi_bulan}, ${escapeSql(k.tanggal_selesai)},
  ${k.harga_sewa_bulanan}, ${escapeSql(k.status)}, ${escapeSql(k.tanggal_berakhir_aktual)},
  ${escapeSql(k.alasan_berakhir)}, ${escapeSql(k.dibuat_oleh)}, ${escapeSql(k.diaktifkan_pada)}, ${escapeSql(k.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;
`;
  }

  // 5. Tagihan (57 tagihan)
  sql += `\n-- 5. Tagihan (57 tagihan)\n`;
  const tagihan = xlsx.utils.sheet_to_json(wb.Sheets['tagihan']).map(cleanRow);
  for (const t of tagihan) {
    sql += `
INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  ${escapeSql(t.id)}, ${escapeSql(t.nomor)}, ${escapeSql(t.kontrak_id)}, ${escapeSql(t.periode)},
  ${escapeSql(t.jatuh_tempo)}, ${t.nominal_sewa}, ${t.denda || 0}, ${t.terbayar || 0},
  ${escapeSql(t.status)}, ${escapeSql(t.alasan_batal)}, ${escapeSql(t.mayar_invoice_id)},
  ${escapeSql(t.mayar_link)}, ${escapeSql(t.dibuat_oleh)}, ${escapeSql(t.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;
`;
  }

  // 6. Pembayaran (55 pembayaran)
  sql += `\n-- 6. Pembayaran (55 pembayaran)\n`;
  const pembayaran = xlsx.utils.sheet_to_json(wb.Sheets['pembayaran']).map(cleanRow);
  for (const p of pembayaran) {
    const buktiPath = p.bukti_path || p.bukti_transfer_path || null;
    sql += `
INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  ${escapeSql(p.id)}, ${escapeSql(p.tagihan_id)}, ${p.jumlah}, ${escapeSql(p.metode)},
  ${escapeSql(p.tanggal_bayar)}, ${escapeSql(buktiPath)}, ${escapeSql(p.referensi_mayar)},
  ${escapeSql(p.status)}, ${escapeSql(p.alasan_batal)}, ${escapeSql(p.dicatat_oleh)},
  ${escapeSql(p.dibatalkan_oleh)}, ${escapeSql(p.dibatalkan_pada)}, ${escapeSql(p.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;
`;
  }

  // 7. Laporan Kerusakan (13 baris - estimasi_biaya & biaya_aktual boleh NULL)
  sql += `\n-- 7. Laporan Kerusakan (13 baris)\n`;
  const laporan = xlsx.utils.sheet_to_json(wb.Sheets['laporan_kerusakan']).map(cleanRow);
  for (const l of laporan) {
    const paths = Array.isArray(l.foto_paths)
      ? l.foto_paths
      : (l.foto_paths ? [l.foto_paths] : []);
    const pathsSql = `ARRAY[${paths.map(escapeSql).join(',')}]::text[]`;

    const estBiaya = (l.estimasi_biaya === undefined || l.estimasi_biaya === null || l.estimasi_biaya === '') ? 'NULL' : l.estimasi_biaya;
    const actBiaya = (l.biaya_aktual === undefined || l.biaya_aktual === null || l.biaya_aktual === '') ? 'NULL' : l.biaya_aktual;

    sql += `
INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  ${escapeSql(l.id)}, ${escapeSql(l.nomor)}, ${escapeSql(l.kontrak_id)}, ${escapeSql(l.unit_id)},
  ${escapeSql(l.pelapor_id)}, ${escapeSql(l.kategori)}, ${escapeSql(l.judul)}, ${escapeSql(l.deskripsi)},
  ${pathsSql}, ${escapeSql(l.status)}, ${estBiaya}, ${actBiaya},
  ${escapeSql(l.catatan)}, ${escapeSql(l.alasan_tolak)}, ${escapeSql(l.disetujui_oleh)},
  ${escapeSql(l.disetujui_pada)}, ${escapeSql(l.selesai_pada)}, ${escapeSql(l.ditutup_pada)},
  ${escapeSql(l.dibuat_pada)}, ${escapeSql(l.diperbarui_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;
`;
  }

  // 8. Nomor Urut (5 baris)
  sql += `\n-- 8. Nomor Urut (5 baris)\n`;
  const nomorUrut = xlsx.utils.sheet_to_json(wb.Sheets['nomor_urut']).map(cleanRow);
  for (const n of nomorUrut) {
    sql += `
INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES (${escapeSql(n.jenis)}, ${escapeSql(n.periode)}, ${n.terakhir})
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;
`;
  }

  // 9. Audit Log (23 baris)
  sql += `\n-- 9. Audit Log (23 baris)\n`;
  const audit = xlsx.utils.sheet_to_json(wb.Sheets['audit_log']).map(cleanRow);
  for (const a of audit) {
    sql += `
INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  ${a.id}, ${escapeSql(a.pelaku_id)}, ${escapeSql(a.peran)}, ${escapeSql(a.aksi)},
  ${escapeSql(a.tabel)}, ${escapeSql(a.data_id)},
  ${a.sebelum ? `'${String(a.sebelum).replace(/'/g, "''")}'::jsonb` : 'NULL'},
  ${a.sesudah ? `'${String(a.sesudah).replace(/'/g, "''")}'::jsonb` : 'NULL'},
  ${escapeSql(a.dibuat_pada)}
) ON CONFLICT (id) DO NOTHING;
`;
  }

  // Aktifkan kembali trigger user
  sql += `
ALTER TABLE public.profiles ENABLE TRIGGER USER;
ALTER TABLE public.unit ENABLE TRIGGER USER;
ALTER TABLE public.kontrak ENABLE TRIGGER USER;
ALTER TABLE public.laporan_kerusakan ENABLE TRIGGER USER;

COMMIT;
`;
  return sql;
}

const seedSql = generateSeedSql();
fs.writeFileSync('scripts/seed_tahap2.sql', seedSql, 'utf-8');
console.log('Generated scripts/seed_tahap2.sql with phone formatting and trigger safety!');
