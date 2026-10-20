-- ==============================================================================
-- Griya Kenanga Residence - Migrasi Pembayaran Online Mayar API V2
-- Fitur: Integrasi Mayar V2, Webhook Logging, dan Idempotent Payment Lock
-- ==============================================================================

-- 1. Tambah kolom pada tabel tagihan (invoices)
ALTER TABLE public.tagihan
  ADD COLUMN IF NOT EXISTS mayar_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS mayar_link TEXT,
  ADD COLUMN IF NOT EXISTS mayar_jumlah INTEGER,
  ADD COLUMN IF NOT EXISTS dibayar_online_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tagihan_mayar_invoice_id 
  ON public.tagihan(mayar_invoice_id);

-- 2. Pastikan metode 'mayar' ada di enum pembayaran_metode
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid 
    WHERE t.typname = 'pembayaran_metode' AND e.enumlabel = 'mayar'
  ) THEN
    ALTER TYPE public.pembayaran_metode ADD VALUE 'mayar';
  END IF;
END $$;

-- 3. Tabel mayar_webhook_log (Audit trail webhook)
CREATE TABLE IF NOT EXISTS public.mayar_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  invoice_id TEXT,
  transaction_id TEXT,
  amount INTEGER,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mayar_webhook_log_created_at 
  ON public.mayar_webhook_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mayar_webhook_log_invoice_id 
  ON public.mayar_webhook_log(invoice_id);

-- Nyalakan RLS
ALTER TABLE public.mayar_webhook_log ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Hanya Owner (peran 'pemilik') yang berhak melihat log webhook
DROP POLICY IF EXISTS "mayar_webhook_log_select_owner_only" ON public.mayar_webhook_log;
CREATE POLICY "mayar_webhook_log_select_owner_only" ON public.mayar_webhook_log
  FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'pemilik');

-- Policy INSERT: Mengizinkan service_role (Secret Key) untuk mencatat log
DROP POLICY IF EXISTS "mayar_webhook_log_insert_service" ON public.mayar_webhook_log;
CREATE POLICY "mayar_webhook_log_insert_service" ON public.mayar_webhook_log
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 4. Fungsi simpan_link_mayar (Hanya Admin dan Owner)
CREATE OR REPLACE FUNCTION public.simpan_link_mayar(
  p_tagihan_id UUID,
  p_mayar_invoice_id TEXT,
  p_mayar_link TEXT,
  p_mayar_jumlah INTEGER DEFAULT NULL
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
  v_nominal_final INTEGER;
BEGIN
  -- 1. Autentikasi Pengguna
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION '401: Sesi pengguna tidak terautentikasi';
  END IF;

  SELECT peran INTO v_caller_peran
  FROM public.profiles
  WHERE id = v_caller_id AND aktif = true;

  -- 2. Otorisasi Peran: Hanya Admin (pengelola) dan Owner (pemilik)
  IF v_caller_peran NOT IN ('pengelola', 'pemilik') THEN
    RAISE EXCEPTION '403: Akses ditolak. Hanya Admin dan Owner yang berhak menyimpan tautan Mayar.';
  END IF;

  -- 3. Ambil data tagihan
  SELECT * INTO v_tagihan
  FROM public.tagihan
  WHERE id = p_tagihan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION '404: Tagihan tidak ditemukan.';
  END IF;

  v_nominal_final := COALESCE(p_mayar_jumlah, (v_tagihan.nominal_sewa + v_tagihan.denda - v_tagihan.terbayar));

  -- 4. Update data Mayar pada tagihan
  UPDATE public.tagihan
  SET mayar_invoice_id = p_mayar_invoice_id,
      mayar_link = p_mayar_link,
      mayar_jumlah = v_nominal_final
  WHERE id = p_tagihan_id;

  -- 5. Catat ke Audit Log
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    v_caller_id, v_caller_peran, 'simpan_link_mayar', 'tagihan', p_tagihan_id::TEXT,
    jsonb_build_object(
      'mayar_invoice_id', v_tagihan.mayar_invoice_id,
      'mayar_link', v_tagihan.mayar_link,
      'mayar_jumlah', v_tagihan.mayar_jumlah
    ),
    jsonb_build_object(
      'mayar_invoice_id', p_mayar_invoice_id,
      'mayar_link', p_mayar_link,
      'mayar_jumlah', v_nominal_final
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'tagihan_id', p_tagihan_id,
    'mayar_invoice_id', p_mayar_invoice_id,
    'mayar_link', p_mayar_link,
    'mayar_jumlah', v_nominal_final
  );
END;
$$;

-- 5. Fungsi tandai_lunas_mayar (Hanya Secret Key / Service Role)
CREATE OR REPLACE FUNCTION public.tandai_lunas_mayar(
  p_tagihan_id UUID,
  p_referensi_mayar TEXT,
  p_jumlah INTEGER DEFAULT NULL,
  p_mayar_invoice_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_role TEXT;
  v_tagihan RECORD;
  v_bayar_sebesar INTEGER;
  v_total_kewajiban INTEGER;
  v_terbayar_baru INTEGER;
  v_status_baru public.tagihan_status;
  v_pembayaran_id UUID;
BEGIN
  -- 1. Validasi Pemanggil: WAJIB menggunakan Secret Key (service_role)
  v_role := COALESCE(auth.role(), current_user);
  IF v_role NOT IN ('service_role', 'postgres') AND current_user NOT IN ('service_role', 'postgres') THEN
    RAISE EXCEPTION '403: Fungsi ini hanya berhak dijalankan oleh backend server dengan Secret Key (Service Role).';
  END IF;

  -- 2. Kunci Baris Tagihan (FOR UPDATE)
  IF p_tagihan_id IS NOT NULL THEN
    SELECT * INTO v_tagihan
    FROM public.tagihan
    WHERE id = p_tagihan_id
    FOR UPDATE;
  ELSIF p_mayar_invoice_id IS NOT NULL THEN
    SELECT * INTO v_tagihan
    FROM public.tagihan
    WHERE mayar_invoice_id = p_mayar_invoice_id
    FOR UPDATE;
  ELSE
    RAISE EXCEPTION '400: Tagihan ID atau Mayar Invoice ID wajib disertakan.';
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION '404: Tagihan tidak ditemukan.';
  END IF;

  -- 3. Cek Status Tagihan: Idempotent jika sudah lunas
  IF v_tagihan.status = 'lunas' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_paid', true,
      'message', 'Tagihan sudah berstatus lunas sebelumnya (idempotent).',
      'tagihan_id', v_tagihan.id
    );
  END IF;

  IF v_tagihan.status = 'dibatalkan' THEN
    RAISE EXCEPTION '400: Tagihan telah dibatalkan.';
  END IF;

  -- 4. Tentukan jumlah pembayaran
  v_total_kewajiban := v_tagihan.nominal_sewa + v_tagihan.denda;
  v_bayar_sebesar := COALESCE(
    p_jumlah,
    v_tagihan.mayar_jumlah,
    (v_total_kewajiban - v_tagihan.terbayar)
  );

  IF v_bayar_sebesar <= 0 THEN
    v_bayar_sebesar := v_total_kewajiban - v_tagihan.terbayar;
  END IF;

  -- 5. Masukkan ke tabel Pembayaran dengan metode 'mayar'
  INSERT INTO public.pembayaran (
    tagihan_id,
    jumlah,
    metode,
    tanggal_bayar,
    referensi_mayar,
    status,
    dicatat_oleh
  ) VALUES (
    v_tagihan.id,
    v_bayar_sebesar,
    'mayar',
    CURRENT_DATE,
    p_referensi_mayar,
    'sah',
    NULL
  ) RETURNING id INTO v_pembayaran_id;

  -- 6. Perbarui status dan terbayar pada tagihan
  v_terbayar_baru := v_tagihan.terbayar + v_bayar_sebesar;
  IF v_terbayar_baru >= v_total_kewajiban THEN
    v_status_baru := 'lunas';
  ELSE
    v_status_baru := 'sebagian';
  END IF;

  UPDATE public.tagihan
  SET terbayar = v_terbayar_baru,
      status = v_status_baru,
      dibayar_online_at = now()
  WHERE id = v_tagihan.id;

  -- 7. Catat ke Audit Log sistem
  INSERT INTO public.audit_log (
    pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada
  ) VALUES (
    NULL, NULL, 'tandai_lunas_mayar', 'tagihan', v_tagihan.id::TEXT,
    jsonb_build_object(
      'status_sebelum', v_tagihan.status,
      'terbayar_sebelum', v_tagihan.terbayar
    ),
    jsonb_build_object(
      'status_sesudah', v_status_baru,
      'terbayar_sesudah', v_terbayar_baru,
      'dibayar_online_at', now(),
      'pembayaran_id', v_pembayaran_id,
      'referensi_mayar', p_referensi_mayar
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'already_paid', false,
    'tagihan_id', v_tagihan.id,
    'pembayaran_id', v_pembayaran_id,
    'jumlah_dibayar', v_bayar_sebesar,
    'status_tagihan', v_status_baru
  );
END;
$$;
