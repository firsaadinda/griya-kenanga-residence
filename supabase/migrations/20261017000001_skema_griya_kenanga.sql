-- ==============================================================================
-- Migrasi Skema Basis Data Griya Kenanga Residence (Tahap 2 - Revisi Penuh)
-- Sesuai ERD_Properti (9 Tabel Inti), PRD_Properti (BR-01 s/d BR-12), dan Data Contoh
-- Status: Tabel sesuai ERD dan RLS aktif (9 Tabel Inti, 3 Bucket Storage, RLS Policies)
-- ==============================================================================

-- 0. Ekstensi yang Dibutuhkan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Reset Tabel dan Fungsi Lama agar Skema Bersih dan Presisi
DROP VIEW IF EXISTS public.v_identitas_penyewa_pemilik CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.catat_audit_log CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.nomor_urut CASCADE;
DROP TABLE IF EXISTS public.laporan_kerusakan CASCADE;
DROP TABLE IF EXISTS public.pembayaran CASCADE;
DROP TABLE IF EXISTS public.tagihan CASCADE;
DROP TABLE IF EXISTS public.kontrak CASCADE;
DROP TABLE IF EXISTS public.unit CASCADE;
DROP TABLE IF EXISTS public.identitas_penyewa CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. ENUM Types
DO $$ BEGIN
  CREATE TYPE public.peran_pengguna AS ENUM ('penyewa', 'pengelola', 'pemilik');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.verifikasi_status AS ENUM ('belum', 'terverifikasi', 'ditolak');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.unit_tipe AS ENUM ('standar', 'ac', 'studio');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.unit_status AS ENUM ('tersedia', 'perbaikan', 'nonaktif');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.kontrak_status AS ENUM ('draf', 'aktif', 'selesai', 'diakhiri', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.tagihan_status AS ENUM ('belum_bayar', 'sebagian', 'lunas', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.pembayaran_metode AS ENUM ('tunai', 'transfer', 'mayar');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.pembayaran_status AS ENUM ('sah', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.kerusakan_kategori AS ENUM ('listrik', 'air', 'ac', 'bangunan', 'perabot', 'lainnya');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.kerusakan_status AS ENUM ('dilaporkan', 'diproses', 'menunggu_persetujuan', 'selesai', 'ditutup', 'ditolak');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABEL: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL CHECK (char_length(trim(nama_lengkap)) >= 3),
  email TEXT NOT NULL UNIQUE,
  no_hp TEXT CHECK (no_hp IS NULL OR no_hp ~ '^08[0-9]{8,11}$'),
  peran public.peran_pengguna NOT NULL DEFAULT 'penyewa',
  aktif BOOLEAN NOT NULL DEFAULT true,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fungsi Helper Peran Pengguna Aktif
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.peran_pengguna AS $$
  SELECT peran FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Trigger Proteksi Profil (BR-10):
-- (a) Bukan pemilik tidak bisa ubah peran/aktif
-- (b) Pemilik tidak bisa ubah peran pada akunnya sendiri
CREATE OR REPLACE FUNCTION public.fn_protect_profiles()
RETURNS TRIGGER AS $$
DECLARE
  curr_role public.peran_pengguna;
BEGIN
  curr_role := public.get_current_user_role();
  IF (NEW.peran != OLD.peran OR NEW.aktif != OLD.aktif) AND curr_role != 'pemilik' THEN
    RAISE EXCEPTION 'Hanya pemilik yang dapat mengubah peran akun atau status aktif (BR-10).';
  END IF;

  IF NEW.peran != OLD.peran AND NEW.id = auth.uid() THEN
    RAISE EXCEPTION 'Pemilik tidak dapat mengubah peran akunnya sendiri (BR-10).';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.fn_protect_profiles();

-- 3. TABEL: identitas_penyewa
CREATE TABLE public.identitas_penyewa (
  penyewa_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  nik CHAR(16) NOT NULL UNIQUE CHECK (nik ~ '^[0-9]{16}$'),
  alamat_asal TEXT NOT NULL,
  foto_ktp_path TEXT NOT NULL,
  kontak_darurat_nama TEXT NOT NULL,
  kontak_darurat_hp TEXT NOT NULL CHECK (kontak_darurat_hp ~ '^08[0-9]{8,11}$'),
  status_verifikasi public.verifikasi_status NOT NULL DEFAULT 'belum',
  alasan_tolak TEXT CHECK (status_verifikasi != 'ditolak' OR (alasan_tolak IS NOT NULL AND length(trim(alasan_tolak)) > 0)),
  diverifikasi_oleh UUID REFERENCES public.profiles(id),
  diverifikasi_pada TIMESTAMPTZ,
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL: unit
CREATE TABLE public.unit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  lantai SMALLINT NOT NULL CHECK (lantai BETWEEN 1 AND 3),
  tipe public.unit_tipe NOT NULL,
  luas_m2 NUMERIC(5,1) NOT NULL CHECK (luas_m2 > 0),
  harga_sewa_bulanan INTEGER NOT NULL CHECK (harga_sewa_bulanan > 0),
  status public.unit_status NOT NULL DEFAULT 'tersedia',
  keterangan TEXT,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger Proteksi Unit (BR-04):
-- (a) Hanya pemilik boleh ubah harga_sewa_bulanan
-- (b) Hanya pengelola/pemilik boleh ubah status unit
-- (c) Unit tidak boleh dinonaktifkan bila masih punya kontrak draf atau aktif
CREATE OR REPLACE FUNCTION public.fn_protect_unit()
RETURNS TRIGGER AS $$
DECLARE
  curr_role public.peran_pengguna;
BEGIN
  curr_role := public.get_current_user_role();
  
  IF NEW.harga_sewa_bulanan != OLD.harga_sewa_bulanan AND curr_role != 'pemilik' THEN
    RAISE EXCEPTION 'Hanya pemilik yang dapat mengubah harga sewa unit (BR-04).';
  END IF;

  IF NEW.status != OLD.status AND curr_role NOT IN ('pengelola', 'pemilik') THEN
    RAISE EXCEPTION 'Hanya staf operasional yang dapat mengubah status unit (BR-04).';
  END IF;

  IF NEW.status = 'nonaktif' AND OLD.status != 'nonaktif' THEN
    IF EXISTS (
      SELECT 1 FROM public.kontrak
      WHERE unit_id = NEW.id AND status IN ('draf', 'aktif')
    ) THEN
      RAISE EXCEPTION 'Unit tidak boleh dinonaktifkan bila masih memiliki kontrak berstatus draf atau aktif (BR-04).';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_unit
BEFORE UPDATE ON public.unit
FOR EACH ROW
EXECUTE FUNCTION public.fn_protect_unit();

-- 5. TABEL: kontrak
CREATE TABLE public.kontrak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  unit_id UUID NOT NULL REFERENCES public.unit(id),
  penyewa_id UUID NOT NULL REFERENCES public.profiles(id),
  tanggal_mulai DATE NOT NULL CHECK (EXTRACT(DAY FROM tanggal_mulai) = 1),
  durasi_bulan SMALLINT NOT NULL CHECK (durasi_bulan IN (1, 3, 6, 12)),
  tanggal_selesai DATE NOT NULL,
  harga_sewa_bulanan INTEGER NOT NULL CHECK (harga_sewa_bulanan > 0),
  status public.kontrak_status NOT NULL DEFAULT 'draf',
  tanggal_berakhir_aktual DATE,
  alasan_berakhir TEXT CHECK (status != 'diakhiri' OR (alasan_berakhir IS NOT NULL AND length(trim(alasan_berakhir)) > 0)),
  dibuat_oleh UUID REFERENCES public.profiles(id),
  diaktifkan_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger BR-01 & BR-03 untuk Kontrak
CREATE OR REPLACE FUNCTION public.fn_check_kontrak_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- Hitung tanggal selesai otomatis bila tidak diisi (hari terakhir bulan ke-n)
  IF NEW.tanggal_selesai IS NULL THEN
    NEW.tanggal_selesai := (NEW.tanggal_mulai + (NEW.durasi_bulan || ' months')::interval - '1 day'::interval)::date;
  END IF;

  -- BR-01: Cek irisan kontrak unit
  IF NEW.status IN ('draf', 'aktif') THEN
    IF EXISTS (
      SELECT 1 FROM public.kontrak
      WHERE unit_id = NEW.unit_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status IN ('draf', 'aktif')
        AND (NEW.tanggal_mulai <= tanggal_selesai AND NEW.tanggal_selesai >= tanggal_mulai)
    ) THEN
      RAISE EXCEPTION 'Unit sudah memiliki kontrak berstatus draf atau aktif pada periode tersebut (BR-01).';
    END IF;
  END IF;

  -- BR-03: Cek maksimal 1 kontrak aktif per penyewa
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

CREATE TRIGGER trg_check_kontrak_rules
BEFORE INSERT OR UPDATE ON public.kontrak
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_kontrak_rules();

-- 6. TABEL: tagihan
CREATE TABLE public.tagihan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  kontrak_id UUID NOT NULL REFERENCES public.kontrak(id),
  periode DATE NOT NULL CHECK (EXTRACT(DAY FROM periode) = 1),
  jatuh_tempo DATE NOT NULL CHECK (EXTRACT(DAY FROM jatuh_tempo) = 10),
  nominal_sewa INTEGER NOT NULL CHECK (nominal_sewa > 0),
  denda INTEGER NOT NULL DEFAULT 0 CHECK (denda BETWEEN 0 AND 200000),
  terbayar INTEGER NOT NULL DEFAULT 0 CHECK (terbayar >= 0 AND terbayar <= nominal_sewa + denda),
  status public.tagihan_status NOT NULL DEFAULT 'belum_bayar',
  alasan_batal TEXT CHECK (status != 'dibatalkan' OR (alasan_batal IS NOT NULL AND length(trim(alasan_batal)) > 0)),
  mayar_invoice_id TEXT,
  mayar_link TEXT,
  dibuat_oleh UUID REFERENCES public.profiles(id),
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tagihan_kontrak_periode_unik UNIQUE (kontrak_id, periode)
);

-- 7. TABEL: pembayaran
CREATE TABLE public.pembayaran (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tagihan_id UUID NOT NULL REFERENCES public.tagihan(id),
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  metode public.pembayaran_metode NOT NULL,
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  bukti_path TEXT CHECK (metode != 'transfer' OR (bukti_path IS NOT NULL AND length(trim(bukti_path)) > 0)),
  referensi_mayar TEXT UNIQUE CHECK (metode != 'mayar' OR (referensi_mayar IS NOT NULL AND length(trim(referensi_mayar)) > 0)),
  status public.pembayaran_status NOT NULL DEFAULT 'sah',
  alasan_batal TEXT CHECK (status != 'dibatalkan' OR (alasan_batal IS NOT NULL AND length(trim(alasan_batal)) > 0)),
  dicatat_oleh UUID REFERENCES public.profiles(id),
  dibatalkan_oleh UUID REFERENCES public.profiles(id),
  dibatalkan_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABEL: laporan_kerusakan
CREATE TABLE public.laporan_kerusakan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor TEXT NOT NULL UNIQUE,
  kontrak_id UUID NOT NULL REFERENCES public.kontrak(id),
  unit_id UUID NOT NULL REFERENCES public.unit(id),
  pelapor_id UUID NOT NULL REFERENCES public.profiles(id),
  kategori public.kerusakan_kategori NOT NULL,
  judul TEXT NOT NULL CHECK (char_length(trim(judul)) BETWEEN 5 AND 80),
  deskripsi TEXT NOT NULL,
  foto_paths TEXT[] NOT NULL CHECK (cardinality(foto_paths) BETWEEN 1 AND 3),
  status public.kerusakan_status NOT NULL DEFAULT 'dilaporkan',
  estimasi_biaya INTEGER NULL CHECK (estimasi_biaya IS NULL OR estimasi_biaya >= 0),
  biaya_aktual INTEGER NULL CHECK (biaya_aktual IS NULL OR biaya_aktual >= 0),
  catatan TEXT,
  alasan_tolak TEXT CHECK (status != 'ditolak' OR (alasan_tolak IS NOT NULL AND length(trim(alasan_tolak)) > 0)),
  disetujui_oleh UUID REFERENCES public.profiles(id),
  disetujui_pada TIMESTAMPTZ,
  selesai_pada TIMESTAMPTZ,
  ditutup_pada TIMESTAMPTZ,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_laporan_selesai_biaya CHECK (status NOT IN ('selesai', 'ditutup') OR biaya_aktual IS NOT NULL)
);

-- Trigger BR-11: Maksimal 3 laporan terbuka per penyewa
CREATE OR REPLACE FUNCTION public.fn_check_laporan_kerusakan_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (
      SELECT count(*) FROM public.laporan_kerusakan
      WHERE pelapor_id = NEW.pelapor_id
        AND status IN ('dilaporkan', 'diproses', 'menunggu_persetujuan')
    ) >= 3 THEN
      RAISE EXCEPTION 'Penyewa sudah memiliki 3 laporan kerusakan berstatus terbuka (BR-11).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_laporan_kerusakan_limit
BEFORE INSERT ON public.laporan_kerusakan
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_laporan_kerusakan_limit();

-- Trigger Proteksi Laporan Kerusakan (BR-12):
-- Penyewa hanya boleh ubah status selesai -> ditutup pada laporannya sendiri dan dilarang ubah biaya/persetujuan
CREATE OR REPLACE FUNCTION public.fn_protect_laporan_kerusakan()
RETURNS TRIGGER AS $$
DECLARE
  curr_role public.peran_pengguna;
BEGIN
  curr_role := public.get_current_user_role();
  
  IF curr_role = 'penyewa' THEN
    IF OLD.pelapor_id != auth.uid() THEN
      RAISE EXCEPTION 'Penyewa hanya dapat memperbarui laporan miliknya sendiri (BR-10).';
    END IF;

    IF (NEW.estimasi_biaya IS DISTINCT FROM OLD.estimasi_biaya OR
        NEW.biaya_aktual IS DISTINCT FROM OLD.biaya_aktual OR
        NEW.disetujui_oleh IS DISTINCT FROM OLD.disetujui_oleh OR
        NEW.disetujui_pada IS DISTINCT FROM OLD.disetujui_pada) THEN
      RAISE EXCEPTION 'Penyewa tidak berhak mengubah kolom biaya atau persetujuan laporan kerusakan (BR-12).';
    END IF;

    IF NEW.status != OLD.status THEN
      IF NOT (OLD.status = 'selesai' AND NEW.status = 'ditutup') THEN
        RAISE EXCEPTION 'Penyewa hanya dapat mengubah status laporan dari selesai menjadi ditutup (BR-12).';
      END IF;
      NEW.ditutup_pada := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_laporan_kerusakan
BEFORE UPDATE ON public.laporan_kerusakan
FOR EACH ROW
EXECUTE FUNCTION public.fn_protect_laporan_kerusakan();

-- 9. TABEL: nomor_urut
CREATE TABLE public.nomor_urut (
  jenis TEXT NOT NULL CHECK (jenis IN ('KTR', 'INV', 'LK')),
  periode TEXT NOT NULL,
  terakhir INTEGER NOT NULL DEFAULT 0 CHECK (terakhir >= 0),
  PRIMARY KEY (jenis, periode)
);

-- 10. TABEL: audit_log
CREATE TABLE public.audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pelaku_id UUID REFERENCES public.profiles(id),
  peran public.peran_pengguna NULL,
  aksi TEXT NOT NULL,
  tabel TEXT NOT NULL,
  data_id TEXT NOT NULL,
  sebelum JSONB,
  sesudah JSONB,
  dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fungsi Helper Pencatatan Audit Log (Security Definer)
CREATE OR REPLACE FUNCTION public.catat_audit_log(
  p_aksi TEXT,
  p_tabel TEXT,
  p_data_id TEXT,
  p_sebelum JSONB DEFAULT NULL,
  p_sesudah JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  curr_role public.peran_pengguna;
BEGIN
  curr_role := public.get_current_user_role();
  INSERT INTO public.audit_log (pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
  VALUES (auth.uid(), curr_role, p_aksi, p_tabel, p_data_id, p_sebelum, p_sesudah, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identitas_penyewa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kontrak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_kerusakan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nomor_urut ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "profiles_select_rule" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.get_current_user_role() IN ('pemilik', 'pengelola'));

CREATE POLICY "profiles_update_rule" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.get_current_user_role() = 'pemilik');

CREATE POLICY "profiles_insert_rule" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Identitas Penyewa
-- Pemilik DITOLAK membaca langsung tabel ini (hanya Pengelola dan penyewa ybs)
CREATE POLICY "identitas_select_rule" ON public.identitas_penyewa
  FOR SELECT TO authenticated
  USING (auth.uid() = penyewa_id OR public.get_current_user_role() = 'pengelola');

CREATE POLICY "identitas_insert_rule" ON public.identitas_penyewa
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = penyewa_id);

CREATE POLICY "identitas_update_rule" ON public.identitas_penyewa
  FOR UPDATE TO authenticated
  USING (auth.uid() = penyewa_id OR public.get_current_user_role() = 'pengelola');

-- View Aman untuk Pemilik (Penyamaran NIK 12 bintang + 4 angka terakhir & Tanpa Foto KTP sesuai BR-10)
CREATE OR REPLACE VIEW public.v_identitas_penyewa_pemilik WITH (security_invoker = false) AS
SELECT
  p.id AS penyewa_id,
  p.nama_lengkap,
  p.email,
  p.no_hp,
  CASE
    WHEN i.nik IS NOT NULL THEN '************' || RIGHT(i.nik, 4)
    ELSE NULL
  END AS nik_tersamar,
  i.status_verifikasi,
  i.alasan_tolak,
  i.diverifikasi_oleh,
  i.diverifikasi_pada,
  i.diperbarui_pada
FROM public.profiles p
JOIN public.identitas_penyewa i ON i.penyewa_id = p.id
WHERE public.get_current_user_role() = 'pemilik';

GRANT SELECT ON public.v_identitas_penyewa_pemilik TO authenticated;

-- 3. Unit
CREATE POLICY "unit_select_rule" ON public.unit
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "unit_update_status_rule" ON public.unit
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('pemilik', 'pengelola'));

-- 4. Kontrak
CREATE POLICY "kontrak_select_rule" ON public.kontrak
  FOR SELECT TO authenticated
  USING (auth.uid() = penyewa_id OR public.get_current_user_role() IN ('pemilik', 'pengelola'));

CREATE POLICY "kontrak_insert_rule" ON public.kontrak
  FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'pengelola');

CREATE POLICY "kontrak_update_rule" ON public.kontrak
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('pemilik', 'pengelola'));

-- 5. Tagihan
CREATE POLICY "tagihan_select_rule" ON public.tagihan
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.kontrak k WHERE k.id = tagihan.kontrak_id AND k.penyewa_id = auth.uid())
    OR public.get_current_user_role() IN ('pemilik', 'pengelola')
  );

CREATE POLICY "tagihan_insert_rule" ON public.tagihan
  FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() = 'pengelola');

CREATE POLICY "tagihan_update_rule" ON public.tagihan
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('pemilik', 'pengelola'));

-- 6. Pembayaran
CREATE POLICY "pembayaran_select_rule" ON public.pembayaran
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tagihan t
      JOIN public.kontrak k ON k.id = t.kontrak_id
      WHERE t.id = pembayaran.tagihan_id AND k.penyewa_id = auth.uid()
    )
    OR public.get_current_user_role() IN ('pemilik', 'pengelola')
  );

CREATE POLICY "pembayaran_insert_rule" ON public.pembayaran
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_current_user_role() = 'pengelola'
    OR (public.get_current_user_role() = 'penyewa' AND metode = 'mayar')
  );

CREATE POLICY "pembayaran_update_rule" ON public.pembayaran
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() = 'pemilik');

-- PENTING: Pembayaran TIDAK BISA DIHAPUS oleh peran manapun (DELETE di-block)
CREATE POLICY "pembayaran_no_delete" ON public.pembayaran
  FOR DELETE TO authenticated
  USING (false);

-- 7. Laporan Kerusakan
CREATE POLICY "laporan_select_rule" ON public.laporan_kerusakan
  FOR SELECT TO authenticated
  USING (auth.uid() = pelapor_id OR public.get_current_user_role() IN ('pemilik', 'pengelola'));

CREATE POLICY "laporan_insert_rule" ON public.laporan_kerusakan
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = pelapor_id
    AND EXISTS (
      SELECT 1 FROM public.kontrak
      WHERE id = laporan_kerusakan.kontrak_id
        AND penyewa_id = auth.uid()
        AND status = 'aktif'
    )
  );

CREATE POLICY "laporan_update_rule" ON public.laporan_kerusakan
  FOR UPDATE TO authenticated
  USING (auth.uid() = pelapor_id OR public.get_current_user_role() IN ('pemilik', 'pengelola'));

-- 8. Nomor Urut
CREATE POLICY "nomor_urut_select_rule" ON public.nomor_urut
  FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('pemilik', 'pengelola'));

CREATE POLICY "nomor_urut_all_rule" ON public.nomor_urut
  FOR ALL TO authenticated
  USING (public.get_current_user_role() IN ('pemilik', 'pengelola'));

-- 9. Audit Log
CREATE POLICY "audit_log_select_rule" ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.get_current_user_role() = 'pemilik');

CREATE POLICY "audit_log_insert_rule" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- PENTING: Audit Log TIDAK BISA DIHAPUS ATAU DIUBAH (Append Only)
CREATE POLICY "audit_log_no_update" ON public.audit_log
  FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "audit_log_no_delete" ON public.audit_log
  FOR DELETE TO authenticated
  USING (false);

-- ==============================================================================
-- STORAGE BUCKETS & POLICIES
-- ==============================================================================

-- Buat 3 Bucket Privat
INSERT INTO storage.buckets (id, name, public) VALUES ('ktp', 'ktp', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('bukti-bayar', 'bukti-bayar', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('kerusakan', 'kerusakan', false) ON CONFLICT (id) DO NOTHING;

-- 1. Storage: ktp
CREATE POLICY "storage_ktp_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ktp'
    AND (
      public.get_current_user_role() = 'pengelola'
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "storage_ktp_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ktp'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.get_current_user_role() = 'penyewa'
  );

-- 2. Storage: bukti-bayar
-- Izinkan Pengelola, Pemilik, dan Penyewa pemilik tagihan terkait
CREATE POLICY "storage_bukti_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'bukti-bayar'
    AND (
      public.get_current_user_role() IN ('pengelola', 'pemilik')
      OR (
        public.get_current_user_role() = 'penyewa'
        AND EXISTS (
          SELECT 1 FROM public.pembayaran pb
          JOIN public.tagihan t ON t.id = pb.tagihan_id
          JOIN public.kontrak k ON k.id = t.kontrak_id
          WHERE (pb.bukti_path = name OR (storage.foldername(name))[1] = auth.uid()::text)
            AND k.penyewa_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "storage_bukti_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'bukti-bayar'
    AND public.get_current_user_role() IN ('pengelola', 'penyewa')
  );

-- 3. Storage: kerusakan
CREATE POLICY "storage_kerusakan_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kerusakan'
    AND (
      public.get_current_user_role() IN ('pengelola', 'pemilik')
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "storage_kerusakan_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kerusakan'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.get_current_user_role() = 'penyewa'
  );
