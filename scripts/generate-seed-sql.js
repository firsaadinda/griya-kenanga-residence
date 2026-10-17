const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'E:/Capstone Project/drive-download-20261016T150631Z-1-001/Data_Contoh_Properti.xlsx';
const wb = xlsx.readFile(excelPath);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

let sql = `-- ==============================================================================
-- Seeding Data Contoh Griya Kenanga Residence
-- Tanggal Acuan: 15 Oktober 2026
-- ==============================================================================

BEGIN;

-- 1. Seed auth.users & profiles
`;

const profiles = xlsx.utils.sheet_to_json(wb.Sheets['profiles']);
for (const p of profiles) {
  const meta = JSON.stringify({ full_name: p.nama_lengkap, role: p.peran });
  const appMeta = JSON.stringify({ provider: 'email', providers: ['email'] });
  
  sql += `
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  ${escapeSql(p.id)}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  ${escapeSql(p.email)}, crypt('Latihan#2026', gen_salt('bf')), ${escapeSql(p.dibuat_pada)},
  '${appMeta}'::jsonb, '${meta}'::jsonb, ${escapeSql(p.dibuat_pada)}, ${escapeSql(p.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES (${escapeSql(p.id)}, ${escapeSql(p.nama_lengkap)}, ${escapeSql(p.email)}, ${escapeSql(p.no_hp)}, ${escapeSql(p.peran)}, ${p.aktif === 'true' || p.aktif === true ? 'TRUE' : 'FALSE'}, ${escapeSql(p.dibuat_pada)})
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;
`;
}

// 2. Identitas Penyewa
sql += `\n-- 2. Seed identitas_penyewa\n`;
const identitas = xlsx.utils.sheet_to_json(wb.Sheets['identitas_penyewa']);
for (const item of identitas) {
  sql += `
INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  ${escapeSql(item.penyewa_id)}, ${escapeSql(item.nik)}, ${escapeSql(item.alamat_asal)},
  ${escapeSql(item.foto_ktp_path)}, ${escapeSql(item.kontak_darurat_nama)}, ${escapeSql(item.kontak_darurat_hp)},
  ${escapeSql(item.status_verifikasi)}, ${escapeSql(item.diverifikasi_oleh)},
  ${escapeSql(item.diverifikasi_pada)}, ${escapeSql(item.diperbarui_pada)}
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, diverifikasi_oleh = EXCLUDED.diverifikasi_oleh,
  diverifikasi_pada = EXCLUDED.diverifikasi_pada, diperbarui_pada = EXCLUDED.diperbarui_pada;
`;
}

// 3. Unit
sql += `\n-- 3. Seed unit\n`;
const units = xlsx.utils.sheet_to_json(wb.Sheets['unit']);
for (const u of units) {
  sql += `
INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, dibuat_pada)
VALUES (${escapeSql(u.id)}, ${escapeSql(u.kode)}, ${u.lantai}, ${escapeSql(u.tipe)}, ${u.luas_m2}, ${u.harga_sewa_bulanan}, ${escapeSql(u.status)}, ${escapeSql(u.dibuat_pada)})
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status;
`;
}

// 4. Kontrak
sql += `\n-- 4. Seed kontrak\n`;
const contracts = xlsx.utils.sheet_to_json(wb.Sheets['kontrak']);
for (const k of contracts) {
  sql += `
INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  ${escapeSql(k.id)}, ${escapeSql(k.nomor)}, ${escapeSql(k.unit_id)}, ${escapeSql(k.penyewa_id)},
  ${escapeSql(k.tanggal_mulai)}, ${k.durasi_bulan}, ${escapeSql(k.tanggal_selesai)},
  ${k.harga_sewa_bulanan}, ${escapeSql(k.status)}, ${escapeSql(k.dibuat_oleh)},
  ${escapeSql(k.diaktifkan_pada)}, ${escapeSql(k.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;
`;
}

// 5. Tagihan
sql += `\n-- 5. Seed tagihan\n`;
const tagihan = xlsx.utils.sheet_to_json(wb.Sheets['tagihan']);
for (const t of tagihan) {
  sql += `
INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status, dibuat_oleh, dibuat_pada
) VALUES (
  ${escapeSql(t.id)}, ${escapeSql(t.nomor)}, ${escapeSql(t.kontrak_id)}, ${escapeSql(t.periode)},
  ${escapeSql(t.jatuh_tempo)}, ${t.nominal_sewa}, ${t.denda || 0}, ${t.terbayar || 0},
  ${escapeSql(t.status)}, ${escapeSql(t.dibuat_oleh)}, ${escapeSql(t.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;
`;
}

// 6. Pembayaran
sql += `\n-- 6. Seed pembayaran\n`;
const pembayaran = xlsx.utils.sheet_to_json(wb.Sheets['pembayaran']);
for (const p of pembayaran) {
  sql += `
INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_transfer_path, status, dicatat_oleh, dibuat_pada
) VALUES (
  ${escapeSql(p.id)}, ${escapeSql(p.tagihan_id)}, ${p.jumlah}, ${escapeSql(p.metode)},
  ${escapeSql(p.tanggal_bayar)}, ${escapeSql(p.bukti_transfer_path)}, ${escapeSql(p.status)},
  ${escapeSql(p.dicatat_oleh)}, ${escapeSql(p.dibuat_pada)}
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;
`;
}

// 7. Laporan Kerusakan
sql += `\n-- 7. Seed laporan_kerusakan\n`;
const laporan = xlsx.utils.sheet_to_json(wb.Sheets['laporan_kerusakan']);
for (const l of laporan) {
  sql += `
INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  ${escapeSql(l.id)}, ${escapeSql(l.nomor)}, ${escapeSql(l.kontrak_id)}, ${escapeSql(l.unit_id)},
  ${escapeSql(l.pelapor_id)}, ${escapeSql(l.kategori)}, ${escapeSql(l.judul)}, ${escapeSql(l.deskripsi)},
  ${escapeSql(l.foto_paths)}, ${escapeSql(l.status)}, ${l.estimasi_biaya || 0}, ${l.biaya_aktual || 0},
  ${escapeSql(l.catatan)}, ${escapeSql(l.selesai_pada)}, ${escapeSql(l.ditutup_pada)},
  ${escapeSql(l.dibuat_pada)}, ${escapeSql(l.diperbarui_pada)}
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;
`;
}

// 8. Nomor Urut
sql += `\n-- 8. Seed nomor_urut\n`;
const nomorUrut = xlsx.utils.sheet_to_json(wb.Sheets['nomor_urut']);
for (const n of nomorUrut) {
  sql += `
INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES (${escapeSql(n.jenis)}, ${escapeSql(n.periode)}, ${n.terakhir})
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;
`;
}

// 9. Audit Log
sql += `\n-- 9. Seed audit_log\n`;
const audit = xlsx.utils.sheet_to_json(wb.Sheets['audit_log']);
for (const a of audit) {
  sql += `
INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
VALUES (
  ${a.id}, ${escapeSql(a.pelaku_id)}, ${escapeSql(a.peran)}, ${escapeSql(a.aksi)},
  ${escapeSql(a.tabel)}, ${escapeSql(a.data_id)},
  ${a.sebelum ? `'${String(a.sebelum).replace(/'/g, "''")}'::jsonb` : 'NULL'},
  ${a.sesudah ? `'${String(a.sesudah).replace(/'/g, "''")}'::jsonb` : 'NULL'},
  ${escapeSql(a.dibuat_pada)}
) ON CONFLICT (id) DO NOTHING;
`;
}

sql += `\nCOMMIT;\n`;

fs.writeFileSync('scripts/seed.sql', sql, 'utf-8');
console.log('Seed SQL generated successfully at scripts/seed.sql');
