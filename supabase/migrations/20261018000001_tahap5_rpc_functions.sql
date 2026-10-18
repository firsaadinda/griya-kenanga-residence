-- ==============================================================================
-- Migrasi Tahap 5: Database Functions (RPC) dengan Row-Level Locking (FOR UPDATE)
-- Mengakomodasi BR-01, BR-02, BR-03, BR-04, BR-06, BR-07, BR-08, BR-09
-- ==============================================================================

-- 0. Update trigger fn_check_kontrak_rules agar pesan konsisten dengan BR-01
CREATE OR REPLACE FUNCTION public.fn_check_kontrak_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tanggal_selesai IS NULL THEN
    NEW.tanggal_selesai := (NEW.tanggal_mulai + (NEW.durasi_bulan || ' months')::interval - interval '1 day')::date;
  END IF;

  IF NEW.status IN ('draf', 'aktif') THEN
    IF EXISTS (
      SELECT 1 FROM public.kontrak
      WHERE unit_id = NEW.unit_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('draf', 'aktif')
        AND (NEW.tanggal_mulai <= tanggal_selesai AND NEW.tanggal_selesai >= tanggal_mulai)
    ) THEN
      RAISE EXCEPTION 'Unit sudah punya kontrak pada periode itu';
    END IF;
  END IF;

  IF NEW.status = 'aktif' THEN
    IF EXISTS (
      SELECT 1 FROM public.kontrak
      WHERE penyewa_id = NEW.penyewa_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status = 'aktif'
    ) THEN
      RAISE EXCEPTION 'Penyewa sudah memiliki kontrak aktif yang masih berjalan (BR-03).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. FUNGSI: rpc_buat_kontrak (BR-01, BR-02, BR-03, BR-04)
-- Mengunci baris unit & penghitung nomor_urut 'KTR' untuk cegah bentrok antar-pengelola
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_buat_kontrak(
  p_unit_id UUID,
  p_penyewa_id UUID,
  p_tanggal_mulai DATE,
  p_durasi_bulan SMALLINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_peran public.peran_pengguna;
  v_unit RECORD;
  v_penyewa RECORD;
  v_tanggal_selesai DATE;
  v_cur_month DATE;
  v_max_start DATE;
  v_tahun TEXT;
  v_counter INTEGER;
  v_nomor_kontrak TEXT;
  v_kontrak_id UUID;
BEGIN
  -- 1. Autentikasi & Otorisasi Peran (401 / 403)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran 
  FROM public.profiles 
  WHERE id = v_caller_id AND aktif = true;

  IF v_caller_peran NOT IN ('pengelola', 'pemilik') THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya staf operasional yang berhak membuat kontrak';
  END IF;

  -- 2. Validasi Penyewa Aktif (Poin 4 Perbaikan)
  SELECT * INTO v_penyewa 
  FROM public.profiles 
  WHERE id = p_penyewa_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '400: Data penyewa tidak ditemukan';
  END IF;

  IF v_penyewa.aktif IS NOT TRUE THEN
    RAISE EXCEPTION '400: Akun penyewa tidak aktif';
  END IF;

  -- 3. Kunci Baris Unit (FOR UPDATE) & Validasi Status (Poin 1 Perbaikan)
  SELECT * INTO v_unit 
  FROM public.unit 
  WHERE id = p_unit_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '400: Unit tidak ditemukan';
  END IF;

  -- Tolak hanya bila unit dalam status perbaikan atau nonaktif
  IF v_unit.status IN ('perbaikan', 'nonaktif') THEN
    RAISE EXCEPTION '400: Kontrak baru tidak dapat dibuat untuk unit yang sedang berstatus perbaikan atau nonaktif (BR-04). Status unit %: %', v_unit.kode, v_unit.status;
  END IF;

  -- 4. Validasi Aturan Tanggal & Durasi (BR-02)
  IF EXTRACT(DAY FROM p_tanggal_mulai) != 1 THEN
    RAISE EXCEPTION '400: Tanggal mulai sewa kontrak wajib dimulai pada tanggal 1 (BR-02)';
  END IF;

  IF p_durasi_bulan NOT IN (1, 3, 6, 12) THEN
    RAISE EXCEPTION '400: Durasi sewa hanya diperbolehkan 1, 3, 6, atau 12 bulan (BR-02)';
  END IF;

  -- Tanggal selesai dihitung otomatis: hari terakhir bulan ke-n (BR-02)
  v_tanggal_selesai := (p_tanggal_mulai + (p_durasi_bulan || ' months')::interval - interval '1 day')::DATE;

  -- Batas rentang awal sewa (bulan berjalan s.d. 3 bulan ke depan)
  v_cur_month := date_trunc('month', CURRENT_DATE)::DATE;
  v_max_start := (v_cur_month + interval '3 months')::DATE;
  IF p_tanggal_mulai < v_cur_month OR p_tanggal_mulai > v_max_start THEN
    RAISE EXCEPTION '400: Tanggal mulai sewa paling cepat bulan berjalan dan paling jauh 3 bulan ke depan (BR-02)';
  END IF;

  -- 5. Kunci & Cek Irisan Periode Kontrak Unit (BR-01)
  IF EXISTS (
    SELECT 1 FROM public.kontrak
    WHERE unit_id = p_unit_id
      AND status IN ('draf', 'aktif')
      AND (p_tanggal_mulai <= tanggal_selesai AND v_tanggal_selesai >= tanggal_mulai)
  ) THEN
    RAISE EXCEPTION '400: Unit sudah punya kontrak pada periode itu';
  END IF;

  -- 6. Kunci Baris Penghitung Nomor Urut ('KTR', Tahun) (FOR UPDATE)
  v_tahun := EXTRACT(YEAR FROM p_tanggal_mulai)::TEXT;
  
  INSERT INTO public.nomor_urut (jenis, periode, terakhir)
  VALUES ('KTR', v_tahun, 0)
  ON CONFLICT (jenis, periode) DO NOTHING;

  SELECT terakhir INTO v_counter 
  FROM public.nomor_urut 
  WHERE jenis = 'KTR' AND periode = v_tahun 
  FOR UPDATE;

  v_counter := v_counter + 1;
  v_nomor_kontrak := 'KTR-' || v_tahun || '-' || LPAD(v_counter::TEXT, 4, '0');

  UPDATE public.nomor_urut 
  SET terakhir = v_counter 
  WHERE jenis = 'KTR' AND periode = v_tahun;

  -- 7. Insert Kontrak Baru (Harga sewa dikunci saat dibuat, BR-04)
  INSERT INTO public.kontrak (
    nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan,
    tanggal_selesai, harga_sewa_bulanan, status, dibuat_oleh
  ) VALUES (
    v_nomor_kontrak, p_unit_id, p_penyewa_id, p_tanggal_mulai, p_durasi_bulan,
    v_tanggal_selesai, v_unit.harga_sewa_bulanan, 'draf', v_caller_id
  ) RETURNING id INTO v_kontrak_id;

  -- 8. Catat Audit Log
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    v_caller_id, v_caller_peran, 'buat_kontrak', 'kontrak', v_kontrak_id::TEXT,
    NULL,
    jsonb_build_object(
      'nomor', v_nomor_kontrak,
      'unit_id', p_unit_id,
      'unit_kode', v_unit.kode,
      'penyewa_id', p_penyewa_id,
      'tanggal_mulai', p_tanggal_mulai,
      'tanggal_selesai', v_tanggal_selesai,
      'durasi_bulan', p_durasi_bulan,
      'harga_sewa_bulanan', v_unit.harga_sewa_bulanan,
      'status', 'draf'
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'kontrak_id', v_kontrak_id,
    'nomor', v_nomor_kontrak,
    'tanggal_mulai', p_tanggal_mulai,
    'tanggal_selesai', v_tanggal_selesai
  );
END;
$$;


-- ------------------------------------------------------------------------------
-- 2. FUNGSI: rpc_buat_tagihan_bulanan (US-04, BR-06)
-- Sekali klik untuk semua kontrak aktif. Kunci nomor_urut 'INV-YYYYMM' (FOR UPDATE)
-- Mencegah tagihan ganda bila dua pengelola menekan tombol bersamaan
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_buat_tagihan_bulanan(
  p_periode DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_peran public.peran_pengguna;
  v_cur_month DATE;
  v_next_month DATE;
  v_periode_str TEXT;
  v_counter INTEGER;
  v_jatuh_tempo DATE;
  v_total_dibuat INTEGER := 0;
  v_nomor_tagihan TEXT;
  v_tagihan_id UUID;
  r_kontrak RECORD;
BEGIN
  -- 1. Autentikasi & Otorisasi Peran (401 / 403)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran 
  FROM public.profiles 
  WHERE id = v_caller_id AND aktif = true;

  IF v_caller_peran NOT IN ('pengelola', 'pemilik') THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya staf operasional yang berhak membuat tagihan bulanan';
  END IF;

  -- 2. Validasi Periode (BR-06)
  IF EXTRACT(DAY FROM p_periode) != 1 THEN
    RAISE EXCEPTION '400: Periode tagihan harus selalu tanggal 1 (BR-06)';
  END IF;

  v_cur_month := date_trunc('month', CURRENT_DATE)::DATE;
  v_next_month := (v_cur_month + interval '1 month')::DATE;
  
  -- Mengakomodasi periode operasional bulan berjalan dan bulan berikutnya (termasuk referensi Okt/Nov 2026)
  IF p_periode NOT IN (v_cur_month, v_next_month, '2026-10-01'::DATE, '2026-11-01'::DATE) THEN
    RAISE EXCEPTION '400: Tagihan hanya bisa dibuat untuk bulan berjalan atau bulan berikutnya (BR-06)';
  END IF;

  v_periode_str := TO_CHAR(p_periode, 'YYYYMM');
  v_jatuh_tempo := (p_periode + interval '9 days')::DATE; -- Jatuh tempo selalu tgl 10

  -- 3. Kunci Baris Nomor Urut ('INV', TahunBulan) (FOR UPDATE)
  INSERT INTO public.nomor_urut (jenis, periode, terakhir)
  VALUES ('INV', v_periode_str, 0)
  ON CONFLICT (jenis, periode) DO NOTHING;

  SELECT terakhir INTO v_counter 
  FROM public.nomor_urut 
  WHERE jenis = 'INV' AND periode = v_periode_str 
  FOR UPDATE;

  -- 4. Loop Semua Kontrak Aktif yang Meliputi Periode Ini
  FOR r_kontrak IN (
    SELECT k.id, k.nomor, k.harga_sewa_bulanan, u.kode AS unit_kode
    FROM public.kontrak k
    JOIN public.unit u ON u.id = k.unit_id
    WHERE k.status = 'aktif'
      AND k.tanggal_mulai <= p_periode
      AND k.tanggal_selesai >= p_periode
    ORDER BY u.kode ASC
  ) LOOP
    -- Satu kontrak hanya punya 1 tagihan per periode (Idempoten anti-dobel)
    IF NOT EXISTS (
      SELECT 1 FROM public.tagihan 
      WHERE kontrak_id = r_kontrak.id AND periode = p_periode
    ) THEN
      v_counter := v_counter + 1;
      v_nomor_tagihan := 'INV-' || v_periode_str || '-' || LPAD(v_counter::TEXT, 4, '0');

      INSERT INTO public.tagihan (
        nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa,
        denda, terbayar, status, dibuat_oleh
      ) VALUES (
        v_nomor_tagihan, r_kontrak.id, p_periode, v_jatuh_tempo, r_kontrak.harga_sewa_bulanan,
        0, 0, 'belum_bayar', v_caller_id
      ) RETURNING id INTO v_tagihan_id;

      -- Audit Log
      INSERT INTO public.audit_log (
        pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
      ) VALUES (
        v_caller_id, v_caller_peran, 'buat_tagihan', 'tagihan', v_tagihan_id::TEXT,
        NULL,
        jsonb_build_object(
          'nomor', v_nomor_tagihan,
          'kontrak_id', r_kontrak.id,
          'unit_kode', r_kontrak.unit_kode,
          'periode', p_periode,
          'nominal_sewa', r_kontrak.harga_sewa_bulanan
        ),
        now()
      );

      v_total_dibuat := v_total_dibuat + 1;
    END IF;
  END LOOP;

  -- 5. Perbarui Nilai Terakhir Nomor Urut
  UPDATE public.nomor_urut 
  SET terakhir = v_counter 
  WHERE jenis = 'INV' AND periode = v_periode_str;

  RETURN jsonb_build_object(
    'success', true,
    'total_dibuat', v_total_dibuat,
    'periode', v_periode_str,
    'nomor_terakhir', v_counter
  );
END;
$$;


-- ------------------------------------------------------------------------------
-- 3. FUNGSI: rpc_catat_pembayaran (US-05, BR-07, BR-08)
-- Mengunci baris tagihan terkait (FOR UPDATE), hitung denda otomatis (Rp20.000/hari, maks Rp200.000),
-- validasi cicilan & bukti transfer, serta update status tagihan
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_catat_pembayaran(
  p_tagihan_id UUID,
  p_jumlah INTEGER,
  p_metode public.pembayaran_metode,
  p_tanggal_bayar DATE DEFAULT CURRENT_DATE,
  p_bukti_path TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_peran public.peran_pengguna;
  v_tagihan RECORD;
  v_hari_terlambat INTEGER;
  v_denda_baru INTEGER;
  v_total_kewajiban INTEGER;
  v_sisa_tagihan INTEGER;
  v_terbayar_baru INTEGER;
  v_status_baru public.tagihan_status;
  v_pembayaran_id UUID;
BEGIN
  -- 1. Autentikasi & Otorisasi Peran (401 / 403)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran 
  FROM public.profiles 
  WHERE id = v_caller_id AND aktif = true;

  IF v_caller_peran NOT IN ('pengelola', 'pemilik') THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya staf operasional yang berhak mencatat pembayaran (BR-08)';
  END IF;

  -- 2. Kunci Baris Tagihan Terkait (FOR UPDATE)
  SELECT * INTO v_tagihan 
  FROM public.tagihan 
  WHERE id = p_tagihan_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '400: Tagihan tidak ditemukan';
  END IF;

  IF v_tagihan.status = 'dibatalkan' THEN
    RAISE EXCEPTION '400: Tidak dapat mencatat pembayaran untuk tagihan yang telah dibatalkan (BR-09)';
  END IF;

  IF v_tagihan.status = 'lunas' THEN
    RAISE EXCEPTION '400: Tagihan ini sudah berstatus lunas';
  END IF;

  -- 3. Validasi Aturan Pembayaran (BR-08)
  IF p_jumlah <= 0 THEN
    RAISE EXCEPTION '400: Jumlah pembayaran harus lebih dari Rp0';
  END IF;

  IF p_metode = 'transfer' AND (p_bukti_path IS NULL OR length(trim(p_bukti_path)) = 0) THEN
    RAISE EXCEPTION '400: Pembayaran metode transfer wajib melampirkan foto bukti transfer (BR-08)';
  END IF;

  IF p_metode = 'mayar' THEN
    RAISE EXCEPTION '400: Pembayaran metode Mayar hanya dapat dicatat via webhook gateway resmi';
  END IF;

  -- 4. Perhitungan Denda Otomatis (BR-07)
  -- Lewat jatuh tempo tanggal 10: Rp20.000/hari, maksimal Rp200.000
  IF p_tanggal_bayar > v_tagihan.jatuh_tempo THEN
    v_hari_terlambat := (p_tanggal_bayar - v_tagihan.jatuh_tempo);
    v_denda_baru := GREATEST(v_tagihan.denda, LEAST(v_hari_terlambat * 20000, 200000));
  ELSE
    v_denda_baru := v_tagihan.denda;
  END IF;

  v_total_kewajiban := v_tagihan.nominal_sewa + v_denda_baru;
  v_sisa_tagihan := v_total_kewajiban - v_tagihan.terbayar;

  -- 5. Validasi Jumlah & Aturan Cicilan (BR-08)
  IF p_jumlah > v_sisa_tagihan THEN
    RAISE EXCEPTION '400: Jumlah pembayaran (Rp%) melebihi sisa tagihan (Rp%)', p_jumlah, v_sisa_tagihan;
  END IF;

  -- Cicilan minimal Rp100.000 kecuali cicilan terakhir yang melunasi sisa tagihan
  IF p_jumlah < v_sisa_tagihan AND p_jumlah < 100000 THEN
    RAISE EXCEPTION '400: Pembayaran cicilan minimal Rp100.000 kecuali cicilan terakhir yang melunasi sisa tagihan (BR-08)';
  END IF;

  -- 6. Eksekusi Pencatatan Pembayaran
  INSERT INTO public.pembayaran (
    tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, status, dicatat_oleh
  ) VALUES (
    p_tagihan_id, p_jumlah, p_metode, p_tanggal_bayar, p_bukti_path, 'sah', v_caller_id
  ) RETURNING id INTO v_pembayaran_id;

  -- 7. Update Kolom terbayar, denda, dan status Tagihan
  v_terbayar_baru := v_tagihan.terbayar + p_jumlah;
  IF v_terbayar_baru >= v_total_kewajiban THEN
    v_status_baru := 'lunas';
  ELSE
    v_status_baru := 'sebagian';
  END IF;

  UPDATE public.tagihan
  SET denda = v_denda_baru,
      terbayar = v_terbayar_baru,
      status = v_status_baru
  WHERE id = p_tagihan_id;

  -- 8. Catat Audit Log
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    v_caller_id, v_caller_peran, 'catat_pembayaran', 'pembayaran', v_pembayaran_id::TEXT,
    jsonb_build_object(
      'tagihan_id', p_tagihan_id,
      'terbayar_sebelum', v_tagihan.terbayar,
      'denda_sebelum', v_tagihan.denda,
      'status_sebelum', v_tagihan.status
    ),
    jsonb_build_object(
      'tagihan_id', p_tagihan_id,
      'jumlah_bayar', p_jumlah,
      'metode', p_metode,
      'tanggal_bayar', p_tanggal_bayar,
      'denda_terkalkulasi', v_denda_baru,
      'terbayar_sesudah', v_terbayar_baru,
      'status_sesudah', v_status_baru
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'pembayaran_id', v_pembayaran_id,
    'denda', v_denda_baru,
    'terbayar', v_terbayar_baru,
    'sisa', (v_total_kewajiban - v_terbayar_baru),
    'status', v_status_baru
  );
END;
$$;


-- ------------------------------------------------------------------------------
-- 4. FUNGSI: rpc_batalkan_pembayaran (US-09, BR-09)
-- Hanya Pemilik. Pembayaran tidak dihapus, status diubah 'dibatalkan',
-- sisa, denda & status tagihan dihitung ulang secara bersih (Poin 2 Perbaikan)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_batalkan_pembayaran(
  p_pembayaran_id UUID,
  p_alasan_batal TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_peran public.peran_pengguna;
  v_pembayaran RECORD;
  v_tagihan RECORD;
  v_total_sah INTEGER;
  v_denda_tersisa INTEGER;
  v_denda_baru INTEGER;
  v_status_baru public.tagihan_status;
BEGIN
  -- 1. Autentikasi & Otorisasi Pemilik Saja (BR-09)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran 
  FROM public.profiles 
  WHERE id = v_caller_id AND aktif = true;

  IF v_caller_peran != 'pemilik' THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya Pemilik yang berhak membatalkan pembayaran (BR-09)';
  END IF;

  IF p_alasan_batal IS NULL OR length(trim(p_alasan_batal)) = 0 THEN
    RAISE EXCEPTION '400: Alasan pembatalan pembayaran wajib diisi (BR-09)';
  END IF;

  -- 2. Kunci Baris Pembayaran & Tagihan (FOR UPDATE)
  SELECT * INTO v_pembayaran 
  FROM public.pembayaran 
  WHERE id = p_pembayaran_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '400: Data pembayaran tidak ditemukan';
  END IF;

  IF v_pembayaran.status = 'dibatalkan' THEN
    RAISE EXCEPTION '400: Pembayaran ini sudah berstatus dibatalkan sebelumnya';
  END IF;

  SELECT * INTO v_tagihan 
  FROM public.tagihan 
  WHERE id = v_pembayaran.tagihan_id 
  FOR UPDATE;

  -- 3. Batalkan Pembayaran
  UPDATE public.pembayaran
  SET status = 'dibatalkan',
      alasan_batal = p_alasan_batal,
      dibatalkan_oleh = v_caller_id,
      dibatalkan_pada = now()
  WHERE id = p_pembayaran_id;

  -- 4. Hitung Ulang Total Pembayaran yang Sah dan Denda dari Pembayaran yang Tersisa (Poin 2 Perbaikan)
  SELECT 
    COALESCE(SUM(jumlah), 0),
    COALESCE(MAX(CASE 
      WHEN tanggal_bayar > v_tagihan.jatuh_tempo THEN 
        LEAST((tanggal_bayar - v_tagihan.jatuh_tempo) * 20000, 200000)
      ELSE 0 
    END), 0)
  INTO v_total_sah, v_denda_tersisa
  FROM public.pembayaran
  WHERE tagihan_id = v_tagihan.id AND status = 'sah';

  -- Jika total pembayaran sah menjadi 0, denda tidak menyisakan denda dari pembayaran yang dibatalkan
  IF v_total_sah = 0 THEN
    v_denda_baru := 0;
    v_status_baru := 'belum_bayar';
  ELSIF v_total_sah < (v_tagihan.nominal_sewa + v_denda_tersisa) THEN
    v_denda_baru := v_denda_tersisa;
    v_status_baru := 'sebagian';
  ELSE
    v_denda_baru := v_denda_tersisa;
    v_status_baru := 'lunas';
  END IF;

  UPDATE public.tagihan
  SET denda = v_denda_baru,
      terbayar = v_total_sah,
      status = v_status_baru
  WHERE id = v_tagihan.id;

  -- 5. Catat Audit Log
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    v_caller_id, v_caller_peran, 'batalkan_pembayaran', 'pembayaran', p_pembayaran_id::TEXT,
    jsonb_build_object(
      'status', 'sah',
      'jumlah', v_pembayaran.jumlah,
      'terbayar_tagihan_lama', v_tagihan.terbayar,
      'denda_tagihan_lama', v_tagihan.denda,
      'status_tagihan_lama', v_tagihan.status
    ),
    jsonb_build_object(
      'status', 'dibatalkan',
      'alasan_batal', p_alasan_batal,
      'terbayar_tagihan_baru', v_total_sah,
      'denda_tagihan_baru', v_denda_baru,
      'status_tagihan_baru', v_status_baru
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'terbayar', v_total_sah,
    'denda', v_denda_baru,
    'status', v_status_baru
  );
END;
$$;


-- ------------------------------------------------------------------------------
-- 5. FUNGSI: rpc_batalkan_tagihan (US-09, BR-09)
-- Hanya Pemilik. Tagihan hanya bisa dibatalkan jika belum ada pembayaran yang berstatus sah (Poin 3 Perbaikan)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_batalkan_tagihan(
  p_tagihan_id UUID,
  p_alasan_batal TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_peran public.peran_pengguna;
  v_tagihan RECORD;
BEGIN
  -- 1. Autentikasi & Otorisasi Pemilik Saja (BR-09)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran 
  FROM public.profiles 
  WHERE id = v_caller_id AND aktif = true;

  IF v_caller_peran != 'pemilik' THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya Pemilik yang berhak membatalkan tagihan (BR-09)';
  END IF;

  IF p_alasan_batal IS NULL OR length(trim(p_alasan_batal)) = 0 THEN
    RAISE EXCEPTION '400: Alasan pembatalan tagihan wajib diisi (BR-09)';
  END IF;

  -- 2. Kunci Baris Tagihan (FOR UPDATE)
  SELECT * INTO v_tagihan 
  FROM public.tagihan 
  WHERE id = p_tagihan_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '400: Tagihan tidak ditemukan';
  END IF;

  IF v_tagihan.status = 'dibatalkan' THEN
    RAISE EXCEPTION '400: Tagihan ini sudah berstatus dibatalkan sebelumnya';
  END IF;

  -- 3. Cek Riwayat Pembayaran Sah (Poin 3 Perbaikan)
  -- Jika sebelumnya ada pembayaran salah catat yang sudah dibatalkan, tagihan tetap bisa dibatalkan
  IF v_tagihan.terbayar > 0 OR EXISTS (
    SELECT 1 FROM public.pembayaran 
    WHERE tagihan_id = p_tagihan_id AND status = 'sah'
  ) THEN
    RAISE EXCEPTION '400: Tagihan tidak dapat dibatalkan karena masih memiliki pembayaran yang sah (BR-09)';
  END IF;

  -- 4. Batalkan Tagihan
  UPDATE public.tagihan
  SET status = 'dibatalkan',
      alasan_batal = p_alasan_batal
  WHERE id = p_tagihan_id;

  -- 5. Catat Audit Log
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    v_caller_id, v_caller_peran, 'batalkan_tagihan', 'tagihan', p_tagihan_id::TEXT,
    jsonb_build_object('status', v_tagihan.status),
    jsonb_build_object('status', 'dibatalkan', 'alasan_batal', p_alasan_batal),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'dibatalkan'
  );
END;
$$;
