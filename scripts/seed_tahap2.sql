-- ==============================================================================
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

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'd2fe618c-8788-577e-b188-9c67073bf8d0', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'ratna@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-02 09:00:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Ratna Kusumawardani","role":"pemilik"}'::jsonb, '2026-01-02 09:00:00+07', '2026-01-02 09:00:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('d2fe618c-8788-577e-b188-9c67073bf8d0', 'Ratna Kusumawardani', 'ratna@griyakenanga.test', '081227004410', 'pemilik', TRUE, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '04e98049-133d-5664-9e2c-579ddd2d1d01', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'bayu@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-02 09:00:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bayu Prasetyo","role":"pengelola"}'::jsonb, '2026-01-02 09:00:00+07', '2026-01-02 09:00:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('04e98049-133d-5664-9e2c-579ddd2d1d01', 'Bayu Prasetyo', 'bayu@griyakenanga.test', '081328115521', 'pengelola', TRUE, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'sinta@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-02 09:00:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Sinta Maharani","role":"pengelola"}'::jsonb, '2026-01-02 09:00:00+07', '2026-01-02 09:00:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('d2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'Sinta Maharani', 'sinta@griyakenanga.test', '085729336612', 'pengelola', TRUE, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '4dfac964-253c-5ff5-829a-503cabaffead', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'aditya@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-10 10:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Aditya Pratama","role":"penyewa"}'::jsonb, '2026-01-10 10:15:00+07', '2026-01-10 10:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('4dfac964-253c-5ff5-829a-503cabaffead', 'Aditya Pratama', 'aditya@griyakenanga.test', '087744285249', 'penyewa', TRUE, '2026-01-10 10:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '7d58b393-6d62-5800-84f0-9e718cd141d0', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'bella@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-02-11 11:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Bella Safitri","role":"penyewa"}'::jsonb, '2026-02-11 11:15:00+07', '2026-02-11 11:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('7d58b393-6d62-5800-84f0-9e718cd141d0', 'Bella Safitri', 'bella@griyakenanga.test', '089558121821', 'penyewa', TRUE, '2026-02-11 11:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '6ec02923-0624-5f1d-8013-c5284528cbd6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'cahya@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-03-12 12:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Cahya Ramadhan","role":"penyewa"}'::jsonb, '2026-03-12 12:15:00+07', '2026-03-12 12:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('6ec02923-0624-5f1d-8013-c5284528cbd6', 'Cahya Ramadhan', 'cahya@griyakenanga.test', '089597514212', 'penyewa', TRUE, '2026-03-12 12:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'd8de5db0-dbad-5530-ba7c-606eb8ffb821', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'dimas@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-04-13 13:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Dimas Saputra","role":"penyewa"}'::jsonb, '2026-04-13 13:15:00+07', '2026-04-13 13:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('d8de5db0-dbad-5530-ba7c-606eb8ffb821', 'Dimas Saputra', 'dimas@griyakenanga.test', '087713893015', 'penyewa', TRUE, '2026-04-13 13:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '7294c978-58c9-516b-80dc-31794579b8a7', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'eka@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-05-14 14:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Eka Wulandari","role":"penyewa"}'::jsonb, '2026-05-14 14:15:00+07', '2026-05-14 14:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('7294c978-58c9-516b-80dc-31794579b8a7', 'Eka Wulandari', 'eka@griyakenanga.test', '085743427281', 'penyewa', TRUE, '2026-05-14 14:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '6a59025a-6776-5995-b6a6-cb1e985a6782', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'fajar@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-06-15 15:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Fajar Nugroho","role":"penyewa"}'::jsonb, '2026-06-15 15:15:00+07', '2026-06-15 15:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('6a59025a-6776-5995-b6a6-cb1e985a6782', 'Fajar Nugroho', 'fajar@griyakenanga.test', '089516959625', 'penyewa', TRUE, '2026-06-15 15:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'e273be02-1d78-5b87-8916-bb926cf2f022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'gilang@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-07-16 16:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Gilang Mahendra","role":"penyewa"}'::jsonb, '2026-07-16 16:15:00+07', '2026-07-16 16:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('e273be02-1d78-5b87-8916-bb926cf2f022', 'Gilang Mahendra', 'gilang@griyakenanga.test', '081325194247', 'penyewa', TRUE, '2026-07-16 16:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '37608550-7a0d-554f-907d-24513c3229e6', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'hana@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-08-17 17:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Hana Puspita","role":"penyewa"}'::jsonb, '2026-08-17 17:15:00+07', '2026-08-17 17:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('37608550-7a0d-554f-907d-24513c3229e6', 'Hana Puspita', 'hana@griyakenanga.test', '085272957381', 'penyewa', TRUE, '2026-08-17 17:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'indra@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-09-18 18:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Indra Kurniawan","role":"penyewa"}'::jsonb, '2026-09-18 18:15:00+07', '2026-09-18 18:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c', 'Indra Kurniawan', 'indra@griyakenanga.test', '081361104462', 'penyewa', TRUE, '2026-09-18 18:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'd8cba6dc-cf31-5168-827e-708ed5271e38', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'jihan@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-10 10:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Jihan Aulia","role":"penyewa"}'::jsonb, '2026-01-10 10:15:00+07', '2026-01-10 10:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('d8cba6dc-cf31-5168-827e-708ed5271e38', 'Jihan Aulia', 'jihan@griyakenanga.test', '087723686772', 'penyewa', TRUE, '2026-01-10 10:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '9c3bb3d4-d5eb-5df1-931a-f88b971a94c0', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'kevin@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-02-11 11:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Kevin Wijaya","role":"penyewa"}'::jsonb, '2026-02-11 11:15:00+07', '2026-02-11 11:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('9c3bb3d4-d5eb-5df1-931a-f88b971a94c0', 'Kevin Wijaya', 'kevin@griyakenanga.test', '087743464602', 'penyewa', TRUE, '2026-02-11 11:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'a9e51a3a-0966-535c-b1f8-9cee5ceab23b', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'laras@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-03-12 12:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Laras Anggraini","role":"penyewa"}'::jsonb, '2026-03-12 12:15:00+07', '2026-03-12 12:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('a9e51a3a-0966-535c-b1f8-9cee5ceab23b', 'Laras Anggraini', 'laras@griyakenanga.test', '081239088981', 'penyewa', TRUE, '2026-03-12 12:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'e0491bf1-62a5-5250-86fc-68005900017f', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'rizki@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-04-13 13:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Muhammad Rizki","role":"penyewa"}'::jsonb, '2026-04-13 13:15:00+07', '2026-04-13 13:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('e0491bf1-62a5-5250-86fc-68005900017f', 'Muhammad Rizki', 'rizki@griyakenanga.test', '085747511488', 'penyewa', TRUE, '2026-04-13 13:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'aed421f9-3176-5c9e-927d-38376326cd0d', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'nadia@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-05-14 14:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Nadia Salsabila","role":"penyewa"}'::jsonb, '2026-05-14 14:15:00+07', '2026-05-14 14:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('aed421f9-3176-5c9e-927d-38376326cd0d', 'Nadia Salsabila', 'nadia@griyakenanga.test', '081362269391', 'penyewa', TRUE, '2026-05-14 14:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'ef21f3ea-8cd8-55a5-8c0c-5c27544670cd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'oki@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-06-15 15:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Oki Firmansyah","role":"penyewa"}'::jsonb, '2026-06-15 15:15:00+07', '2026-06-15 15:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('ef21f3ea-8cd8-55a5-8c0c-5c27544670cd', 'Oki Firmansyah', 'oki@griyakenanga.test', '081319654514', 'penyewa', TRUE, '2026-06-15 15:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'f5f5bd85-867b-5f38-bd99-3ad0cf86eb17', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'putri@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-07-16 16:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Putri Lestari","role":"penyewa"}'::jsonb, '2026-07-16 16:15:00+07', '2026-07-16 16:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('f5f5bd85-867b-5f38-bd99-3ad0cf86eb17', 'Putri Lestari', 'putri@griyakenanga.test', '081392936648', 'penyewa', TRUE, '2026-07-16 16:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '8e911480-1646-5bbe-b156-21435bac068e', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'raka@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-08-17 17:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Raka Aditama","role":"penyewa"}'::jsonb, '2026-08-17 17:15:00+07', '2026-08-17 17:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('8e911480-1646-5bbe-b156-21435bac068e', 'Raka Aditama', 'raka@griyakenanga.test', '087769704835', 'penyewa', TRUE, '2026-08-17 17:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '4e5748e1-c042-539a-a90c-26d64e08b6e2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'salma@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-09-18 18:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Salma Nuraini","role":"penyewa"}'::jsonb, '2026-09-18 18:15:00+07', '2026-09-18 18:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('4e5748e1-c042-539a-a90c-26d64e08b6e2', 'Salma Nuraini', 'salma@griyakenanga.test', '081327749067', 'penyewa', TRUE, '2026-09-18 18:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'teguh@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-01-10 10:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Teguh Santoso","role":"penyewa"}'::jsonb, '2026-01-10 10:15:00+07', '2026-01-10 10:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97', 'Teguh Santoso', 'teguh@griyakenanga.test', '081210713117', 'penyewa', TRUE, '2026-01-10 10:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '6429ed6c-4763-537b-ac3c-01edf27270dc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'vina@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-02-11 11:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Vina Rahmawati","role":"penyewa"}'::jsonb, '2026-02-11 11:15:00+07', '2026-02-11 11:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('6429ed6c-4763-537b-ac3c-01edf27270dc', 'Vina Rahmawati', 'vina@griyakenanga.test', '081338921392', 'penyewa', TRUE, '2026-02-11 11:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  'b85979c0-169a-59ea-97b0-0f129384b23c', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'wahyu@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-03-12 12:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Wahyu Hidayat","role":"penyewa"}'::jsonb, '2026-03-12 12:15:00+07', '2026-03-12 12:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('b85979c0-169a-59ea-97b0-0f129384b23c', 'Wahyu Hidayat', 'wahyu@griyakenanga.test', '081332345168', 'penyewa', TRUE, '2026-03-12 12:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '08ee861b-6b69-593e-a373-2812a0e8dbfc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  'yoga@griyakenanga.test', crypt('Latihan#2026', gen_salt('bf')), '2026-04-13 13:15:00+07',
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Yoga Permana","role":"penyewa"}'::jsonb, '2026-04-13 13:15:00+07', '2026-04-13 13:15:00+07'
) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

INSERT INTO public.profiles (id, nama_lengkap, email, no_hp, peran, aktif, dibuat_pada)
VALUES ('08ee861b-6b69-593e-a373-2812a0e8dbfc', 'Yoga Permana', 'yoga@griyakenanga.test', '085252097573', 'penyewa', TRUE, '2026-04-13 13:15:00+07')
ON CONFLICT (id) DO UPDATE SET nama_lengkap = EXCLUDED.nama_lengkap, no_hp = EXCLUDED.no_hp, peran = EXCLUDED.peran, aktif = EXCLUDED.aktif;

-- 2. Identitas Penyewa (22 baris)

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '4dfac964-253c-5ff5-829a-503cabaffead', '3471961811966279', 'Jl. Merdeka No. 41, Bandung',
  'ktp/4dfac964-253c-5ff5-829a-503cabaffead/ktp.jpg', 'Sri Wahyuni (ibu)', '081258478092',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '7d58b393-6d62-5800-84f0-9e718cd141d0', '3374284605979882', 'Jl. Veteran No. 12, Semarang',
  'ktp/7d58b393-6d62-5800-84f0-9e718cd141d0/ktp.jpg', 'Rina (kakak)', '081218861383',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '6ec02923-0624-5f1d-8013-c5284528cbd6', '3402491208017885', 'Kampung Baru RT 05, Kebumen',
  'ktp/6ec02923-0624-5f1d-8013-c5284528cbd6/ktp.jpg', 'Bambang (ayah)', '081217650535',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'd8de5db0-dbad-5530-ba7c-606eb8ffb821', '3402550107986000', 'Jl. Ahmad Yani No. 90, Magelang',
  'ktp/d8de5db0-dbad-5530-ba7c-606eb8ffb821/ktp.jpg', 'Sri Wahyuni (ibu)', '081270776774',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '7294c978-58c9-516b-80dc-31794579b8a7', '3404336310011951', 'Dusun Ngaglik RT 03, Sleman',
  'ktp/7294c978-58c9-516b-80dc-31794579b8a7/ktp.jpg', 'Agus (paman)', '081256222144',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '6a59025a-6776-5995-b6a6-cb1e985a6782', '3578771205009663', 'Jl. Gajah Mada No. 7, Purwokerto',
  'ktp/6a59025a-6776-5995-b6a6-cb1e985a6782/ktp.jpg', 'Rina (kakak)', '081214916607',
  'belum', NULL, NULL,
  NULL, '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'e273be02-1d78-5b87-8916-bb926cf2f022', '3374360306022429', 'Jl. Gajah Mada No. 7, Purwokerto',
  'ktp/e273be02-1d78-5b87-8916-bb926cf2f022/ktp.jpg', 'Rina (kakak)', '081283167994',
  'ditolak', 'Nomor kontak darurat tidak aktif, mohon perbarui', '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-10-02 10:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '37608550-7a0d-554f-907d-24513c3229e6', '3404975006061282', 'Jl. Pahlawan No. 8, Surabaya',
  'ktp/37608550-7a0d-554f-907d-24513c3229e6/ktp.jpg', 'Rina (kakak)', '081274933701',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c', '3471162402046651', 'Jl. Veteran No. 12, Semarang',
  'ktp/e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c/ktp.jpg', 'Bambang (ayah)', '081289719991',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'd8cba6dc-cf31-5168-827e-708ed5271e38', '3402426708010913', 'Jl. Veteran No. 12, Semarang',
  'ktp/d8cba6dc-cf31-5168-827e-708ed5271e38/ktp.jpg', 'Agus (paman)', '081254853590',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '9c3bb3d4-d5eb-5df1-931a-f88b971a94c0', '3471820503066781', 'Perum Griya Asri Blok C2, Klaten',
  'ktp/9c3bb3d4-d5eb-5df1-931a-f88b971a94c0/ktp.jpg', 'Bambang (ayah)', '081268325010',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'a9e51a3a-0966-535c-b1f8-9cee5ceab23b', '3402174507982774', 'Kampung Baru RT 05, Kebumen',
  'ktp/a9e51a3a-0966-535c-b1f8-9cee5ceab23b/ktp.jpg', 'Agus (paman)', '081252641274',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'e0491bf1-62a5-5250-86fc-68005900017f', '3374470908011845', 'Jl. Ahmad Yani No. 90, Magelang',
  'ktp/e0491bf1-62a5-5250-86fc-68005900017f/ktp.jpg', 'Bambang (ayah)', '081294149813',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'aed421f9-3176-5c9e-927d-38376326cd0d', '3374536803978441', 'Jl. Gajah Mada No. 7, Purwokerto',
  'ktp/aed421f9-3176-5c9e-927d-38376326cd0d/ktp.jpg', 'Sri Wahyuni (ibu)', '081257741085',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'ef21f3ea-8cd8-55a5-8c0c-5c27544670cd', '3273941901029164', 'Jl. Merdeka No. 41, Bandung',
  'ktp/ef21f3ea-8cd8-55a5-8c0c-5c27544670cd/ktp.jpg', 'Agus (paman)', '081245548698',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'f5f5bd85-867b-5f38-bd99-3ad0cf86eb17', '3273476306040190', 'Kampung Baru RT 05, Kebumen',
  'ktp/f5f5bd85-867b-5f38-bd99-3ad0cf86eb17/ktp.jpg', 'Rina (kakak)', '081253742219',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '8e911480-1646-5bbe-b156-21435bac068e', '3273690905055843', 'Jl. Gajah Mada No. 7, Purwokerto',
  'ktp/8e911480-1646-5bbe-b156-21435bac068e/ktp.jpg', 'Rina (kakak)', '081296444682',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '4e5748e1-c042-539a-a90c-26d64e08b6e2', '3402626406017370', 'Jl. Gajah Mada No. 7, Purwokerto',
  'ktp/4e5748e1-c042-539a-a90c-26d64e08b6e2/ktp.jpg', 'Rina (kakak)', '081279543497',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97', '3471311704067820', 'Jl. Merdeka No. 41, Bandung',
  'ktp/2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97/ktp.jpg', 'Sri Wahyuni (ibu)', '081265919584',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '6429ed6c-4763-537b-ac3c-01edf27270dc', '3471846009034959', 'Jl. Merdeka No. 41, Bandung',
  'ktp/6429ed6c-4763-537b-ac3c-01edf27270dc/ktp.jpg', 'Sri Wahyuni (ibu)', '081236252834',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  'b85979c0-169a-59ea-97b0-0f129384b23c', '3471661910012958', 'Jl. Veteran No. 12, Semarang',
  'ktp/b85979c0-169a-59ea-97b0-0f129384b23c/ktp.jpg', 'Agus (paman)', '081240365767',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

INSERT INTO public.identitas_penyewa (
  penyewa_id, nik, alamat_asal, foto_ktp_path, kontak_darurat_nama, kontak_darurat_hp,
  status_verifikasi, alasan_tolak, diverifikasi_oleh, diverifikasi_pada, diperbarui_pada
) VALUES (
  '08ee861b-6b69-593e-a373-2812a0e8dbfc', '3471270202017908', 'Dusun Ngaglik RT 03, Sleman',
  'ktp/08ee861b-6b69-593e-a373-2812a0e8dbfc/ktp.jpg', 'Sri Wahyuni (ibu)', '081265766093',
  'terverifikasi', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  '2026-07-20 11:00:00+07', '2026-07-20 11:00:00+07'
) ON CONFLICT (penyewa_id) DO UPDATE SET
  nik = EXCLUDED.nik, alamat_asal = EXCLUDED.alamat_asal, foto_ktp_path = EXCLUDED.foto_ktp_path,
  kontak_darurat_nama = EXCLUDED.kontak_darurat_nama, kontak_darurat_hp = EXCLUDED.kontak_darurat_hp,
  status_verifikasi = EXCLUDED.status_verifikasi, alasan_tolak = EXCLUDED.alasan_tolak,
  diverifikasi_oleh = EXCLUDED.diverifikasi_oleh, diverifikasi_pada = EXCLUDED.diverifikasi_pada,
  diperbarui_pada = EXCLUDED.diperbarui_pada;

-- 3. Unit (24 unit)

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('242f11fe-ab4b-5533-ae52-e67df51c4407', 'A-101', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('f613b969-9430-550f-850b-ecd6c08d4bd3', 'A-102', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('63c1cad5-14a8-566b-9f0f-caabee298c69', 'A-103', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('b82d16ae-101b-510b-874e-d9bc0dfb480e', 'A-104', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('22f57dce-df3f-55af-b8e6-02013b9bf907', 'A-105', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('1706585b-7b74-5b39-be71-cd8161fb52aa', 'A-106', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('54c5b16e-6f5e-5d91-8402-8c3e65f80bf2', 'A-107', 1, 'standar', 9, 1450000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('8651d3d0-79e6-58ad-ab17-7f10e256657d', 'A-108', 1, 'standar', 9, 1450000, 'nonaktif', 'Dipakai sebagai gudang perabot', '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('6fd560d1-2e32-5ee7-bc5a-ffa7eaf97835', 'B-201', 2, 'ac', 14, 2000000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('12bc9396-8853-5b49-90e7-1261f85ba324', 'B-202', 2, 'ac', 12, 1850000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('489a2a68-f4dd-573e-a1a6-fcc1ca277dba', 'B-203', 2, 'ac', 12, 1850000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('d53670ec-49e8-5434-859c-f771147f3814', 'B-204', 2, 'ac', 12, 1850000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('1d9d5d20-b1fb-527f-ad64-a625438e589f', 'B-205', 2, 'ac', 12, 1850000, 'perbaikan', 'Rembes atap, perbaikan sampai akhir Oktober', '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('65ae4530-f32f-5ade-bc6a-6f67571fe987', 'B-206', 2, 'ac', 12, 1850000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('e37ddbc1-4bfb-57ea-9e22-216ecf7039ad', 'B-207', 2, 'ac', 12, 1850000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('bcdf7427-a279-5750-9022-6cbfb2d4bee1', 'B-208', 2, 'ac', 14, 2000000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('fc90221f-12ac-5a70-9094-e96a790590ce', 'C-301', 3, 'studio', 22, 2900000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('bd3ab0d2-6264-5735-af70-705e48feebe0', 'C-302', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('541575e7-f2e2-5df1-8e69-ee8d5a55287c', 'C-303', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('643abbb0-0552-5972-a0fa-b72605791846', 'C-304', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('dadfbc72-30cd-5d30-b628-d8807e90982a', 'C-305', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('7d778a20-75b9-524c-bd93-226b49089c1b', 'C-306', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('ecbf3935-c2f1-5845-a60d-069cb26b19aa', 'C-307', 3, 'studio', 20, 2750000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

INSERT INTO public.unit (id, kode, lantai, tipe, luas_m2, harga_sewa_bulanan, status, keterangan, dibuat_pada)
VALUES ('7f473ab5-bf66-5a9c-86bd-25b5e54ff059', 'C-308', 3, 'studio', 22, 2900000, 'tersedia', NULL, '2026-01-02 09:00:00+07')
ON CONFLICT (id) DO UPDATE SET kode = EXCLUDED.kode, lantai = EXCLUDED.lantai, tipe = EXCLUDED.tipe, luas_m2 = EXCLUDED.luas_m2, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan, status = EXCLUDED.status, keterangan = EXCLUDED.keterangan;

-- 4. Kontrak (23 kontrak)

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '3f34cdba-7a42-55f3-a39a-075a94f2fffe', 'KTR-2026-0001', '242f11fe-ab4b-5533-ae52-e67df51c4407', '4dfac964-253c-5ff5-829a-503cabaffead',
  '2026-01-01', 12, '2026-12-31',
  1350000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2025-12-28 10:00:00+07', '2025-12-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'be1edefa-cc37-57c4-a674-4aaa99930bed', 'KTR-2026-0002', 'f613b969-9430-550f-850b-ecd6c08d4bd3', '7d58b393-6d62-5800-84f0-9e718cd141d0',
  '2026-04-01', 12, '2027-03-31',
  1450000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-03-28 10:00:00+07', '2026-03-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d', 'KTR-2026-0003', '63c1cad5-14a8-566b-9f0f-caabee298c69', '6ec02923-0624-5f1d-8013-c5284528cbd6',
  '2026-08-01', 3, '2026-10-31',
  1450000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-07-28 10:00:00+07', '2026-07-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '911d8eb2-d733-5932-b091-80bd81bc6094', 'KTR-2026-0004', 'b82d16ae-101b-510b-874e-d9bc0dfb480e', 'd8de5db0-dbad-5530-ba7c-606eb8ffb821',
  '2026-01-01', 12, '2026-12-31',
  1350000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2025-12-28 10:00:00+07', '2025-12-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '9740393f-f5fe-57cf-8b84-f70c2049fa98', 'KTR-2026-0005', '22f57dce-df3f-55af-b8e6-02013b9bf907', '7294c978-58c9-516b-80dc-31794579b8a7',
  '2026-07-01', 6, '2026-12-31',
  1450000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-06-27 10:00:00+07', '2026-06-25 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'bc8228f2-88ff-5eaf-be7f-e43df448464a', 'KTR-2026-0006', '54c5b16e-6f5e-5d91-8402-8c3e65f80bf2', '37608550-7a0d-554f-907d-24513c3229e6',
  '2026-02-01', 12, '2027-01-31',
  1350000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-01-28 10:00:00+07', '2026-01-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '9fbcdf13-9b74-5bc5-8a48-1d53ac03d2af', 'KTR-2026-0007', '6fd560d1-2e32-5ee7-bc5a-ffa7eaf97835', 'e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c',
  '2026-01-01', 12, '2026-12-31',
  1900000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2025-12-28 10:00:00+07', '2025-12-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '408ab273-5f37-5b0b-9d77-f371de1d910e', 'KTR-2026-0008', '12bc9396-8853-5b49-90e7-1261f85ba324', 'd8cba6dc-cf31-5168-827e-708ed5271e38',
  '2026-03-01', 12, '2027-02-28',
  1850000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-02-25 10:00:00+07', '2026-02-23 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '173342f0-e56b-5a2d-906e-a02a5e790763', 'KTR-2026-0009', '489a2a68-f4dd-573e-a1a6-fcc1ca277dba', '9c3bb3d4-d5eb-5df1-931a-f88b971a94c0',
  '2026-07-01', 6, '2026-12-31',
  1850000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-06-27 10:00:00+07', '2026-06-25 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'e15b915d-5e88-58ec-958e-6c0c4e21fc8c', 'KTR-2026-0010', 'd53670ec-49e8-5434-859c-f771147f3814', 'a9e51a3a-0966-535c-b1f8-9cee5ceab23b',
  '2026-06-01', 12, '2027-05-31',
  1850000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-05-28 10:00:00+07', '2026-05-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '4a3b94cd-3a07-5c4e-bbef-21e404991a19', 'KTR-2026-0011', '65ae4530-f32f-5ade-bc6a-6f67571fe987', 'e0491bf1-62a5-5250-86fc-68005900017f',
  '2026-01-01', 12, '2026-12-31',
  1750000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2025-12-28 10:00:00+07', '2025-12-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '6adcb8a8-8b9a-55dc-b526-7bbb4e32be3c', 'KTR-2026-0012', 'e37ddbc1-4bfb-57ea-9e22-216ecf7039ad', 'aed421f9-3176-5c9e-927d-38376326cd0d',
  '2026-05-01', 6, '2026-10-31',
  1850000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-04-27 10:00:00+07', '2026-04-25 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'f8eb530f-1148-54d2-8b4d-d5b469242d2d', 'KTR-2026-0013', 'bcdf7427-a279-5750-9022-6cbfb2d4bee1', 'ef21f3ea-8cd8-55a5-8c0c-5c27544670cd',
  '2026-08-01', 6, '2027-01-31',
  2000000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-07-28 10:00:00+07', '2026-07-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '9afe04f7-9e65-5732-af76-01f2170cd229', 'KTR-2026-0014', 'fc90221f-12ac-5a70-9094-e96a790590ce', 'f5f5bd85-867b-5f38-bd99-3ad0cf86eb17',
  '2026-01-01', 12, '2026-12-31',
  2800000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2025-12-28 10:00:00+07', '2025-12-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '0dd41633-20fd-5158-8d65-e1d902e2bfaf', 'KTR-2026-0015', 'bd3ab0d2-6264-5735-af70-705e48feebe0', '8e911480-1646-5bbe-b156-21435bac068e',
  '2026-04-01', 12, '2027-03-31',
  2750000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-03-28 10:00:00+07', '2026-03-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '958ae410-5093-5194-9ed7-d6d1b81aa6f3', 'KTR-2026-0016', '541575e7-f2e2-5df1-8e69-ee8d5a55287c', '4e5748e1-c042-539a-a90c-26d64e08b6e2',
  '2026-09-01', 3, '2026-11-30',
  2750000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-28 10:00:00+07', '2026-08-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '9a5b2418-ce98-5b9c-9306-27b6f9286343', 'KTR-2026-0017', '643abbb0-0552-5972-a0fa-b72605791846', '2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97',
  '2026-07-01', 6, '2026-12-31',
  2750000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-06-27 10:00:00+07', '2026-06-25 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'c1ebac7d-1cd3-526f-b8c2-10f615543e5f', 'KTR-2026-0018', 'dadfbc72-30cd-5d30-b628-d8807e90982a', '6429ed6c-4763-537b-ac3c-01edf27270dc',
  '2026-02-01', 12, '2027-01-31',
  2650000, 'aktif', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-01-28 10:00:00+07', '2026-01-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'e7bf86c5-0a97-5ce6-acd2-06e13d1ae2bd', 'KTR-2026-0019', '7d778a20-75b9-524c-bd93-226b49089c1b', 'b85979c0-169a-59ea-97b0-0f129384b23c',
  '2026-10-01', 1, '2026-10-31',
  2750000, 'aktif', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-09-27 10:00:00+07', '2026-09-25 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '468462b5-76f6-5451-9501-5e9ed781a852', 'KTR-2026-0020', 'ecbf3935-c2f1-5845-a60d-069cb26b19aa', '08ee861b-6b69-593e-a373-2812a0e8dbfc',
  '2026-08-01', 1, '2026-08-31',
  2750000, 'selesai', '2026-08-31',
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-28 10:00:00+07', '2026-07-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  'fac8574f-43c8-56c0-a043-38bc63f85d00', 'KTR-2026-0021', '1706585b-7b74-5b39-be71-cd8161fb52aa', 'e273be02-1d78-5b87-8916-bb926cf2f022',
  '2026-08-01', 6, '2027-01-31',
  1450000, 'diakhiri', '2026-09-30',
  'Penyewa pindah kerja ke luar kota, disetujui Pemilik', 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', '2026-07-28 10:00:00+07', '2026-07-26 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '21489e4a-0a4f-54ad-b334-b4249742b436', 'KTR-2026-0022', 'ecbf3935-c2f1-5845-a60d-069cb26b19aa', '6a59025a-6776-5995-b6a6-cb1e985a6782',
  '2026-11-01', 6, '2027-04-30',
  2750000, 'draf', NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', NULL, '2026-10-06 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

INSERT INTO public.kontrak (
  id, nomor, unit_id, penyewa_id, tanggal_mulai, durasi_bulan, tanggal_selesai,
  harga_sewa_bulanan, status, tanggal_berakhir_aktual, alasan_berakhir, dibuat_oleh, diaktifkan_pada, dibuat_pada
) VALUES (
  '9b22b9d9-d22d-5105-89b7-8fca6f1375ec', 'KTR-2026-0023', '63c1cad5-14a8-566b-9f0f-caabee298c69', '6ec02923-0624-5f1d-8013-c5284528cbd6',
  '2026-11-01', 6, '2027-04-30',
  1450000, 'draf', NULL,
  NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', NULL, '2026-10-06 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, harga_sewa_bulanan = EXCLUDED.harga_sewa_bulanan;

-- 5. Tagihan (57 tagihan)

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '791e000d-c540-534c-8971-dc2918882155', 'INV-202608-0001', '3f34cdba-7a42-55f3-a39a-075a94f2fffe', '2026-08-01',
  '2026-08-10', 1350000, 0, 1350000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'acab76d8-2684-5fda-9c02-6ab6bbf2e54e', 'INV-202608-0002', 'be1edefa-cc37-57c4-a674-4aaa99930bed', '2026-08-01',
  '2026-08-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'b3bc8670-2594-5290-937c-8b08605e1f95', 'INV-202608-0003', 'ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d', '2026-08-01',
  '2026-08-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '5d9ef0e5-35ea-57f5-ad11-0af64bfc23cc', 'INV-202608-0004', '911d8eb2-d733-5932-b091-80bd81bc6094', '2026-08-01',
  '2026-08-10', 1350000, 0, 1350000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '6a6b5701-7189-5566-9af2-6b8aff393231', 'INV-202608-0005', '9740393f-f5fe-57cf-8b84-f70c2049fa98', '2026-08-01',
  '2026-08-10', 1450000, 0, 1450000,
  'lunas', NULL, 'inv_874136471d6f',
  'https://griyakenanga.myr.id/invoices/inv_874136471d6f', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '4e89f8ea-c5b7-5c61-a54c-5702d97a8ede', 'INV-202608-0006', 'bc8228f2-88ff-5eaf-be7f-e43df448464a', '2026-08-01',
  '2026-08-10', 1350000, 0, 1350000,
  'lunas', NULL, 'inv_fb044eb67e1f',
  'https://griyakenanga.myr.id/invoices/inv_fb044eb67e1f', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '174ed61f-d53d-5fb0-bbac-ddcfdd293148', 'INV-202608-0007', '9fbcdf13-9b74-5bc5-8a48-1d53ac03d2af', '2026-08-01',
  '2026-08-10', 1900000, 0, 1900000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '1f131419-ec2c-58da-a4f3-fa321895e541', 'INV-202608-0008', '408ab273-5f37-5b0b-9d77-f371de1d910e', '2026-08-01',
  '2026-08-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'dd9b6fa0-e648-5343-965f-49e2f7e76889', 'INV-202608-0009', '173342f0-e56b-5a2d-906e-a02a5e790763', '2026-08-01',
  '2026-08-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'ab74b097-fd23-57ce-addc-97527cc7139a', 'INV-202608-0010', 'e15b915d-5e88-58ec-958e-6c0c4e21fc8c', '2026-08-01',
  '2026-08-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'd0268f54-e51b-5976-951b-ae1c3adf36d6', 'INV-202608-0011', '4a3b94cd-3a07-5c4e-bbef-21e404991a19', '2026-08-01',
  '2026-08-10', 1750000, 0, 1750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '5b135c53-761c-5505-a7a1-c84eb9f49d59', 'INV-202608-0012', '6adcb8a8-8b9a-55dc-b526-7bbb4e32be3c', '2026-08-01',
  '2026-08-10', 1850000, 0, 1850000,
  'lunas', NULL, 'inv_f62e3ae2f82b',
  'https://griyakenanga.myr.id/invoices/inv_f62e3ae2f82b', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'defb0c9b-f46d-50e6-9806-88479d369de2', 'INV-202608-0013', 'f8eb530f-1148-54d2-8b4d-d5b469242d2d', '2026-08-01',
  '2026-08-10', 2000000, 0, 2000000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'c997ca17-fbd6-5fda-b129-171b9ab04fe8', 'INV-202608-0014', '9afe04f7-9e65-5732-af76-01f2170cd229', '2026-08-01',
  '2026-08-10', 2800000, 0, 2800000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '8e399fb2-d3dc-52c7-b41f-19c03144da33', 'INV-202608-0015', '0dd41633-20fd-5158-8d65-e1d902e2bfaf', '2026-08-01',
  '2026-08-10', 2750000, 200000, 2950000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'fad33109-84fd-551c-82f9-2bfc360124a4', 'INV-202608-0016', '9a5b2418-ce98-5b9c-9306-27b6f9286343', '2026-08-01',
  '2026-08-10', 2750000, 0, 2750000,
  'lunas', NULL, 'inv_013fc7638926',
  'https://griyakenanga.myr.id/invoices/inv_013fc7638926', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '0ffd4e36-f9bf-5829-b30d-391c3760d98f', 'INV-202608-0017', 'c1ebac7d-1cd3-526f-b8c2-10f615543e5f', '2026-08-01',
  '2026-08-10', 2650000, 0, 2650000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '705a584b-3602-5134-9522-67fa0a9ccb36', 'INV-202608-0018', '468462b5-76f6-5451-9501-5e9ed781a852', '2026-08-01',
  '2026-08-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '97ddf360-7151-5e14-83b3-272b5408cb1e', 'INV-202608-0019', 'fac8574f-43c8-56c0-a043-38bc63f85d00', '2026-08-01',
  '2026-08-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-07-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '8827a2ee-8023-5ee5-9321-ada288088fd3', 'INV-202609-0001', '3f34cdba-7a42-55f3-a39a-075a94f2fffe', '2026-09-01',
  '2026-09-10', 1350000, 0, 1350000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '9ed00477-f02c-5296-b60d-13a4b00ae415', 'INV-202609-0002', 'be1edefa-cc37-57c4-a674-4aaa99930bed', '2026-09-01',
  '2026-09-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '0a225513-1c4d-5b96-907b-e78dafbd8d33', 'INV-202609-0003', 'ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d', '2026-09-01',
  '2026-09-10', 1450000, 0, 1450000,
  'lunas', NULL, 'inv_de08cf9fe8dd',
  'https://griyakenanga.myr.id/invoices/inv_de08cf9fe8dd', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '1a6c2efd-8ff8-58e4-b681-6df335e0eeb6', 'INV-202609-0004', '911d8eb2-d733-5932-b091-80bd81bc6094', '2026-09-01',
  '2026-09-10', 1350000, 0, 1350000,
  'lunas', NULL, 'inv_a1ed240abe55',
  'https://griyakenanga.myr.id/invoices/inv_a1ed240abe55', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '9b0b51d0-8342-5a6f-8327-17548261f74f', 'INV-202609-0005', '9740393f-f5fe-57cf-8b84-f70c2049fa98', '2026-09-01',
  '2026-09-10', 1450000, 0, 1450000,
  'lunas', NULL, 'inv_0d2c622399ba',
  'https://griyakenanga.myr.id/invoices/inv_0d2c622399ba', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'e843da2e-52fe-5231-b9bf-e3cc8b73a589', 'INV-202609-0006', 'bc8228f2-88ff-5eaf-be7f-e43df448464a', '2026-09-01',
  '2026-09-10', 1350000, 0, 1000000,
  'sebagian', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'f2cf9f5e-691e-5316-9d02-d106bed5570c', 'INV-202609-0007', '9fbcdf13-9b74-5bc5-8a48-1d53ac03d2af', '2026-09-01',
  '2026-09-10', 1900000, 0, 1900000,
  'lunas', NULL, 'inv_53f153ff177f',
  'https://griyakenanga.myr.id/invoices/inv_53f153ff177f', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '5e7870ba-02c2-505b-b03c-cf442e0eb0ef', 'INV-202609-0008', '408ab273-5f37-5b0b-9d77-f371de1d910e', '2026-09-01',
  '2026-09-10', 1850000, 60000, 1910000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'f3dd6b69-c732-5dd7-ae13-a2d18c8d29a3', 'INV-202609-0009', '173342f0-e56b-5a2d-906e-a02a5e790763', '2026-09-01',
  '2026-09-10', 1850000, 0, 1850000,
  'lunas', NULL, 'inv_fb66e0a03af3',
  'https://griyakenanga.myr.id/invoices/inv_fb66e0a03af3', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'e825ab99-315e-51da-8ee0-69bce11c83af', 'INV-202609-0010', 'e15b915d-5e88-58ec-958e-6c0c4e21fc8c', '2026-09-01',
  '2026-09-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '77bc44ad-7dac-5d3c-834b-5f661fed89c9', 'INV-202609-0011', '4a3b94cd-3a07-5c4e-bbef-21e404991a19', '2026-09-01',
  '2026-09-10', 1750000, 0, 1750000,
  'lunas', NULL, 'inv_997cf4080036',
  'https://griyakenanga.myr.id/invoices/inv_997cf4080036', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '080dfc65-5647-5c66-9f90-285587a75566', 'INV-202609-0012', '6adcb8a8-8b9a-55dc-b526-7bbb4e32be3c', '2026-09-01',
  '2026-09-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '392c9c8c-d73f-5383-9891-8b6a84d0454d', 'INV-202609-0013', 'f8eb530f-1148-54d2-8b4d-d5b469242d2d', '2026-09-01',
  '2026-09-10', 2000000, 0, 2000000,
  'lunas', NULL, 'inv_8d604dd117b4',
  'https://griyakenanga.myr.id/invoices/inv_8d604dd117b4', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '7d5f85ec-648a-5b54-8e37-785b499d8f4c', 'INV-202609-0014', '9afe04f7-9e65-5732-af76-01f2170cd229', '2026-09-01',
  '2026-09-10', 2800000, 0, 2800000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'd99eace3-d633-5724-8f36-96e91df7cc3c', 'INV-202609-0015', '0dd41633-20fd-5158-8d65-e1d902e2bfaf', '2026-09-01',
  '2026-09-10', 2750000, 0, 2750000,
  'lunas', NULL, 'inv_2e5db44482dd',
  'https://griyakenanga.myr.id/invoices/inv_2e5db44482dd', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '02c77ecd-db5d-567c-a820-ad7975708b91', 'INV-202609-0016', '958ae410-5093-5194-9ed7-d6d1b81aa6f3', '2026-09-01',
  '2026-09-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'e79bc59d-355e-5823-be19-31929a2c7644', 'INV-202609-0017', '9a5b2418-ce98-5b9c-9306-27b6f9286343', '2026-09-01',
  '2026-09-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'a0b35e32-274b-5f84-8b0e-6c707c3c6dcd', 'INV-202609-0018', 'c1ebac7d-1cd3-526f-b8c2-10f615543e5f', '2026-09-01',
  '2026-09-10', 2650000, 0, 2650000,
  'lunas', NULL, 'inv_7c16b6520c8e',
  'https://griyakenanga.myr.id/invoices/inv_7c16b6520c8e', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '6184a643-73b0-5479-93bb-b554eb0be7b7', 'INV-202609-0019', 'fac8574f-43c8-56c0-a043-38bc63f85d00', '2026-09-01',
  '2026-09-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-08-27 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '01d39ba7-353f-5bc2-8367-0d450b10362d', 'INV-202610-0001', '3f34cdba-7a42-55f3-a39a-075a94f2fffe', '2026-10-01',
  '2026-10-10', 1350000, 0, 1350000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'aee2f794-daa8-5681-9cf8-659cb8d6b56f', 'INV-202610-0002', 'be1edefa-cc37-57c4-a674-4aaa99930bed', '2026-10-01',
  '2026-10-10', 1450000, 20000, 1470000,
  'lunas', NULL, 'inv_f1e07b7f066e',
  'https://griyakenanga.myr.id/invoices/inv_f1e07b7f066e', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '395edf37-42ec-5577-9c90-1b1e5efd8ec3', 'INV-202610-0003', 'ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d', '2026-10-01',
  '2026-10-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '61eb638a-60cf-57b7-82c5-c0b008f4f2c8', 'INV-202610-0004', '911d8eb2-d733-5932-b091-80bd81bc6094', '2026-10-01',
  '2026-10-10', 1350000, 0, 0,
  'belum_bayar', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '6ceb749e-a297-5d31-ab22-30ff0e87ea8d', 'INV-202610-0005', '9740393f-f5fe-57cf-8b84-f70c2049fa98', '2026-10-01',
  '2026-10-10', 1450000, 0, 1450000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '115a24cf-0772-57fd-af28-271045018ac7', 'INV-202610-0006', 'bc8228f2-88ff-5eaf-be7f-e43df448464a', '2026-10-01',
  '2026-10-10', 1350000, 0, 0,
  'belum_bayar', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'acd1ef54-8ec8-52c8-a48e-69fe92ec79d9', 'INV-202610-0007', '9fbcdf13-9b74-5bc5-8a48-1d53ac03d2af', '2026-10-01',
  '2026-10-10', 1900000, 0, 1900000,
  'lunas', NULL, 'inv_84dd696e5dc6',
  'https://griyakenanga.myr.id/invoices/inv_84dd696e5dc6', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '05304e80-63ea-58d7-8f4a-5eb97b19a76b', 'INV-202610-0008', '408ab273-5f37-5b0b-9d77-f371de1d910e', '2026-10-01',
  '2026-10-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '6cc5f712-f0db-5541-90eb-e49b7338f96a', 'INV-202610-0009', '173342f0-e56b-5a2d-906e-a02a5e790763', '2026-10-01',
  '2026-10-10', 1850000, 0, 0,
  'belum_bayar', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'b0507ff3-53a8-52a4-bb37-e1051ec9f383', 'INV-202610-0010', 'e15b915d-5e88-58ec-958e-6c0c4e21fc8c', '2026-10-01',
  '2026-10-10', 1850000, 0, 1000000,
  'sebagian', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'd0c98b41-d28b-5750-b95e-7a74ebfb92fd', 'INV-202610-0011', '4a3b94cd-3a07-5c4e-bbef-21e404991a19', '2026-10-01',
  '2026-10-10', 1750000, 0, 1750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '4ec633ad-d5a0-525e-be57-b380fd5c126c', 'INV-202610-0012', '6adcb8a8-8b9a-55dc-b526-7bbb4e32be3c', '2026-10-01',
  '2026-10-10', 1850000, 0, 1850000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'f3e0a7e2-dd77-5ce0-9255-ce8902a972cc', 'INV-202610-0013', 'f8eb530f-1148-54d2-8b4d-d5b469242d2d', '2026-10-01',
  '2026-10-10', 2000000, 0, 0,
  'belum_bayar', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '2849c53d-4876-5cef-8bc8-b6208149d38e', 'INV-202610-0014', '9afe04f7-9e65-5732-af76-01f2170cd229', '2026-10-01',
  '2026-10-10', 2800000, 0, 2800000,
  'lunas', NULL, 'inv_1e148c2820c8',
  'https://griyakenanga.myr.id/invoices/inv_1e148c2820c8', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'e4f10730-0b3a-5cb4-beb2-9c75fc837a72', 'INV-202610-0015', '0dd41633-20fd-5158-8d65-e1d902e2bfaf', '2026-10-01',
  '2026-10-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '479ecd9d-02de-5764-8969-a785829541eb', 'INV-202610-0016', '958ae410-5093-5194-9ed7-d6d1b81aa6f3', '2026-10-01',
  '2026-10-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'a31359fa-bbf1-5cb7-a20d-d4ad42d14252', 'INV-202610-0017', '9a5b2418-ce98-5b9c-9306-27b6f9286343', '2026-10-01',
  '2026-10-10', 2750000, 0, 2000000,
  'sebagian', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  '43682226-a3dc-5d66-b878-571ad6e690f6', 'INV-202610-0018', 'c1ebac7d-1cd3-526f-b8c2-10f615543e5f', '2026-10-01',
  '2026-10-10', 2650000, 0, 2650000,
  'lunas', NULL, 'inv_10bae858400a',
  'https://griyakenanga.myr.id/invoices/inv_10bae858400a', '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

INSERT INTO public.tagihan (
  id, nomor, kontrak_id, periode, jatuh_tempo, nominal_sewa, denda, terbayar, status,
  alasan_batal, mayar_invoice_id, mayar_link, dibuat_oleh, dibuat_pada
) VALUES (
  'ae4bbdb6-13d4-55a7-ac87-587c47e5c429', 'INV-202610-0019', 'e7bf86c5-0a97-5ce6-acd2-06e13d1ae2bd', '2026-10-01',
  '2026-10-10', 2750000, 0, 2750000,
  'lunas', NULL, NULL,
  NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01', '2026-09-26 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, denda = EXCLUDED.denda, terbayar = EXCLUDED.terbayar, status = EXCLUDED.status;

-- 6. Pembayaran (55 pembayaran)

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'c38a0f68-436a-5c89-9301-1ca3648f1cd6', '791e000d-c540-534c-8971-dc2918882155', 1350000, 'tunai',
  '2026-08-09', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '172e34f4-96b5-5e6b-89bb-c0b5ebce432a', 'acab76d8-2684-5fda-9c02-6ab6bbf2e54e', 1450000, 'transfer',
  '2026-08-08', 'bukti-bayar/acab76d8-2684-5fda-9c02-6ab6bbf2e54e/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '79ee667d-c4ee-50bc-9c35-7f37a540f6f3', 'b3bc8670-2594-5290-937c-8b08605e1f95', 1450000, 'transfer',
  '2026-08-05', 'bukti-bayar/b3bc8670-2594-5290-937c-8b08605e1f95/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-05 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '7ee98262-4e3a-51e2-9f54-d8b1b1ac822e', '5d9ef0e5-35ea-57f5-ad11-0af64bfc23cc', 1350000, 'transfer',
  '2026-08-07', 'bukti-bayar/5d9ef0e5-35ea-57f5-ad11-0af64bfc23cc/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-07 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '21fb4487-c37b-5d43-93db-67fa2293d92e', '6a6b5701-7189-5566-9af2-6b8aff393231', 1450000, 'mayar',
  '2026-08-07', NULL, 'MYR-TRX-26080050',
  'sah', NULL, NULL,
  NULL, NULL, '2026-08-07 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'aaaa9b0c-6cdf-5f20-b753-a234e1f50de4', '4e89f8ea-c5b7-5c61-a54c-5702d97a8ede', 1350000, 'mayar',
  '2026-08-06', NULL, 'MYR-TRX-26080060',
  'sah', NULL, NULL,
  NULL, NULL, '2026-08-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '241ae888-9b8c-5899-b66a-9a09e6dc9c1b', '174ed61f-d53d-5fb0-bbac-ddcfdd293148', 1900000, 'tunai',
  '2026-08-03', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-03 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'ae28bddc-7776-5752-9049-deb186fe620f', '1f131419-ec2c-58da-a4f3-fa321895e541', 1850000, 'tunai',
  '2026-08-02', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-02 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'cec0b431-8476-5572-bdf9-741872fb0fee', 'dd9b6fa0-e648-5343-965f-49e2f7e76889', 1850000, 'tunai',
  '2026-08-03', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-03 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'e5632568-b4d5-53f1-bb87-1160d63c0e9f', 'ab74b097-fd23-57ce-addc-97527cc7139a', 1850000, 'tunai',
  '2026-08-10', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-10 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'a408cdfb-ad59-54d6-af4a-054329e6ea1a', 'd0268f54-e51b-5976-951b-ae1c3adf36d6', 1750000, 'tunai',
  '2026-08-06', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'c35fc798-87bc-58bd-998a-f514f88649e4', '5b135c53-761c-5505-a7a1-c84eb9f49d59', 1850000, 'mayar',
  '2026-08-04', NULL, 'MYR-TRX-26080120',
  'sah', NULL, NULL,
  NULL, NULL, '2026-08-04 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '880d1c21-ea07-5d6c-8f47-1a44e1068195', 'defb0c9b-f46d-50e6-9806-88479d369de2', 2000000, 'tunai',
  '2026-08-08', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '71b060a2-70c9-5cab-9adf-e2ab47822f27', 'c997ca17-fbd6-5fda-b129-171b9ab04fe8', 2800000, 'transfer',
  '2026-08-09', 'bukti-bayar/c997ca17-fbd6-5fda-b129-171b9ab04fe8/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'f3fc350e-1c3c-5512-a9b9-236b6388577b', '8e399fb2-d3dc-52c7-b41f-19c03144da33', 2950000, 'tunai',
  '2026-08-25', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-25 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '06abfd7b-6dad-525b-a360-20aed5ad92b1', 'fad33109-84fd-551c-82f9-2bfc360124a4', 2750000, 'mayar',
  '2026-08-04', NULL, 'MYR-TRX-26080160',
  'sah', NULL, NULL,
  NULL, NULL, '2026-08-04 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '315139a8-0ccd-5837-b34e-23245c98c7ee', '0ffd4e36-f9bf-5829-b30d-391c3760d98f', 2650000, 'transfer',
  '2026-08-09', 'bukti-bayar/0ffd4e36-f9bf-5829-b30d-391c3760d98f/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'b90821ce-6cc1-56c3-99c5-6ae1bcad5af0', '705a584b-3602-5134-9522-67fa0a9ccb36', 2750000, 'transfer',
  '2026-08-04', 'bukti-bayar/705a584b-3602-5134-9522-67fa0a9ccb36/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-08-04 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '1f39c8a1-6c98-56c8-b879-a42e84b557f1', '97ddf360-7151-5e14-83b3-272b5408cb1e', 1450000, 'transfer',
  '2026-08-07', 'bukti-bayar/97ddf360-7151-5e14-83b3-272b5408cb1e/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-08-07 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '49e85c2c-0168-565a-9878-4e6cc544abf8', '8827a2ee-8023-5ee5-9321-ada288088fd3', 1350000, 'transfer',
  '2026-09-08', 'bukti-bayar/8827a2ee-8023-5ee5-9321-ada288088fd3/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-09-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'dc47bcba-8682-51b4-8009-90775ea1e629', '9ed00477-f02c-5296-b60d-13a4b00ae415', 1450000, 'transfer',
  '2026-09-07', 'bukti-bayar/9ed00477-f02c-5296-b60d-13a4b00ae415/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-07 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '81b15988-ffc1-57cb-8887-1d0bbd69d76c', '0a225513-1c4d-5b96-907b-e78dafbd8d33', 1450000, 'mayar',
  '2026-09-07', NULL, 'MYR-TRX-26090030',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-07 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '4912337e-7ccf-52c8-ba9a-377d084f8c50', '1a6c2efd-8ff8-58e4-b681-6df335e0eeb6', 1350000, 'mayar',
  '2026-09-08', NULL, 'MYR-TRX-26090040',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '036a5666-adcc-56d1-95dc-4a1711aac8d1', '9b0b51d0-8342-5a6f-8327-17548261f74f', 1450000, 'mayar',
  '2026-09-05', NULL, 'MYR-TRX-26090050',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-05 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'da378fb1-9282-5e9c-8f30-e76624f766e2', 'e843da2e-52fe-5231-b9bf-e3cc8b73a589', 1000000, 'tunai',
  '2026-09-08', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'a65c5efc-07c9-59a1-9ea6-29cad7aa26de', 'f2cf9f5e-691e-5316-9d02-d106bed5570c', 1900000, 'mayar',
  '2026-09-06', NULL, 'MYR-TRX-26090070',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'a68a253e-f314-5596-881c-84ad48c931e6', '5e7870ba-02c2-505b-b03c-cf442e0eb0ef', 1910000, 'transfer',
  '2026-09-13', 'bukti-bayar/5e7870ba-02c2-505b-b03c-cf442e0eb0ef/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-13 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '0f37ee70-4c6d-5d16-8c46-09acbc65b211', 'f3dd6b69-c732-5dd7-ae13-a2d18c8d29a3', 1850000, 'mayar',
  '2026-09-08', NULL, 'MYR-TRX-26090090',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '9c800a0c-ffe6-5ff0-92ef-459167c275fe', 'e825ab99-315e-51da-8ee0-69bce11c83af', 1850000, 'tunai',
  '2026-09-04', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-04 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '79dee3a2-f215-5747-8e0c-bf899145172b', '77bc44ad-7dac-5d3c-834b-5f661fed89c9', 1750000, 'mayar',
  '2026-09-06', NULL, 'MYR-TRX-26090110',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '835a139d-13a7-5acd-95f8-2ff4c1149e38', '080dfc65-5647-5c66-9f90-285587a75566', 900000, 'tunai',
  '2026-09-05', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-05 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'efcc2bf5-110e-5e3c-bf8d-b2f66180fdba', '080dfc65-5647-5c66-9f90-285587a75566', 950000, 'transfer',
  '2026-09-09', 'bukti-bayar/080dfc65-5647-5c66-9f90-285587a75566/bukti-2.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-09-09 11:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '6e161fb6-71ae-50ce-a4bd-c46da73fed7a', '392c9c8c-d73f-5383-9891-8b6a84d0454d', 2000000, 'mayar',
  '2026-09-06', NULL, 'MYR-TRX-26090130',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '89cf9980-f10c-5348-a731-367f83caf84d', '7d5f85ec-648a-5b54-8e37-785b499d8f4c', 2800000, 'tunai',
  '2026-09-02', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-02 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '57d8f5ce-1404-5a15-bb9e-464d322d19bc', '7d5f85ec-648a-5b54-8e37-785b499d8f4c', 500000, 'tunai',
  '2026-09-04', NULL, NULL,
  'dibatalkan', 'Salah input, seharusnya untuk tagihan unit C-302', 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  'd2fe618c-8788-577e-b188-9c67073bf8d0', '2026-09-04 16:00:00+07', '2026-09-04 09:10:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '1aaf4d98-cf29-578a-a6a7-fc96584ddb4a', 'd99eace3-d633-5724-8f36-96e91df7cc3c', 2750000, 'mayar',
  '2026-09-06', NULL, 'MYR-TRX-26090150',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '0cddb116-d82e-58c6-8c7a-009bc3ad8e9b', '02c77ecd-db5d-567c-a820-ad7975708b91', 2750000, 'transfer',
  '2026-09-06', 'bukti-bayar/02c77ecd-db5d-567c-a820-ad7975708b91/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-09-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'a24cf5bf-c3c9-51d1-998f-bfd7d4d4601f', 'e79bc59d-355e-5823-be19-31929a2c7644', 2750000, 'transfer',
  '2026-09-09', 'bukti-bayar/e79bc59d-355e-5823-be19-31929a2c7644/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-09-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '5466ae1e-9137-5941-b5cb-e0412117efa6', 'a0b35e32-274b-5f84-8b0e-6c707c3c6dcd', 2650000, 'mayar',
  '2026-09-03', NULL, 'MYR-TRX-26090180',
  'sah', NULL, NULL,
  NULL, NULL, '2026-09-03 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'e67660fe-74d1-56e5-ad14-fd12574f10b3', '6184a643-73b0-5479-93bb-b554eb0be7b7', 1450000, 'tunai',
  '2026-09-05', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-09-05 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '75161ba4-7421-5a0c-86c0-3e0d0eb0b844', '01d39ba7-353f-5bc2-8367-0d450b10362d', 1350000, 'transfer',
  '2026-10-02', 'bukti-bayar/01d39ba7-353f-5bc2-8367-0d450b10362d/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-02 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '5c0ba38d-a663-5494-9bb3-b6ad868390c3', 'aee2f794-daa8-5681-9cf8-659cb8d6b56f', 1470000, 'mayar',
  '2026-10-11', NULL, 'MYR-TRX-26100020',
  'sah', NULL, NULL,
  NULL, NULL, '2026-10-11 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '7c11eb27-43ef-545b-981f-5bbe1925eedc', '395edf37-42ec-5577-9c90-1b1e5efd8ec3', 1450000, 'transfer',
  '2026-10-08', 'bukti-bayar/395edf37-42ec-5577-9c90-1b1e5efd8ec3/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-08 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '3f5ec733-daad-5847-8f29-60a45d93a66e', '6ceb749e-a297-5d31-ab22-30ff0e87ea8d', 1450000, 'tunai',
  '2026-10-09', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'f9cdb1aa-b842-5726-b202-01657fff20f2', 'acd1ef54-8ec8-52c8-a48e-69fe92ec79d9', 1900000, 'mayar',
  '2026-10-05', NULL, 'MYR-TRX-26100070',
  'sah', NULL, NULL,
  NULL, NULL, '2026-10-05 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '71a37d49-de0c-5d1f-848a-4be1c49e4188', '05304e80-63ea-58d7-8f4a-5eb97b19a76b', 1850000, 'transfer',
  '2026-10-02', 'bukti-bayar/05304e80-63ea-58d7-8f4a-5eb97b19a76b/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-10-02 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '7c596e95-d80d-56bb-971f-52355857258d', 'b0507ff3-53a8-52a4-bb37-e1051ec9f383', 1000000, 'tunai',
  '2026-10-09', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'dd06a3b0-8180-599a-9a13-4826037ab234', 'd0c98b41-d28b-5750-b95e-7a74ebfb92fd', 1750000, 'tunai',
  '2026-10-09', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'a6192048-37b2-5114-8dbd-0c49fbf8b06c', '4ec633ad-d5a0-525e-be57-b380fd5c126c', 1850000, 'tunai',
  '2026-10-04', NULL, NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-10-04 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'e9c78136-a322-54e1-9f73-fd975ffcbbbc', '2849c53d-4876-5cef-8bc8-b6208149d38e', 2800000, 'mayar',
  '2026-10-06', NULL, 'MYR-TRX-26100140',
  'sah', NULL, NULL,
  NULL, NULL, '2026-10-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '1a5eff77-486e-5388-b4bb-2030f1939634', 'e4f10730-0b3a-5cb4-beb2-9c75fc837a72', 2750000, 'transfer',
  '2026-10-09', 'bukti-bayar/e4f10730-0b3a-5cb4-beb2-9c75fc837a72/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '811cbe97-75fb-5f5e-8ca6-09b2b9be1222', '479ecd9d-02de-5764-8969-a785829541eb', 2750000, 'transfer',
  '2026-10-02', 'bukti-bayar/479ecd9d-02de-5764-8969-a785829541eb/bukti-1.jpg', NULL,
  'sah', NULL, '04e98049-133d-5664-9e2c-579ddd2d1d01',
  NULL, NULL, '2026-10-02 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'fa895bae-f324-5d85-bdf1-f09e3994af87', 'a31359fa-bbf1-5cb7-a20d-d4ad42d14252', 2000000, 'transfer',
  '2026-10-03', 'bukti-bayar/a31359fa-bbf1-5cb7-a20d-d4ad42d14252/bukti-1.jpg', NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-03 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  '60bbd0fe-79e5-5699-b124-1c3ffdd2a8a6', '43682226-a3dc-5d66-b878-571ad6e690f6', 2650000, 'mayar',
  '2026-10-10', NULL, 'MYR-TRX-26100180',
  'sah', NULL, NULL,
  NULL, NULL, '2026-10-10 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

INSERT INTO public.pembayaran (
  id, tagihan_id, jumlah, metode, tanggal_bayar, bukti_path, referensi_mayar, status,
  alasan_batal, dicatat_oleh, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
  'b84180d2-b0fd-5eff-81a4-cc799ec8601a', 'ae4bbdb6-13d4-55a7-ac87-587c47e5c429', 2750000, 'tunai',
  '2026-10-06', NULL, NULL,
  'sah', NULL, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  NULL, NULL, '2026-10-06 10:20:00+07'
) ON CONFLICT (id) DO UPDATE SET jumlah = EXCLUDED.jumlah, status = EXCLUDED.status;

-- 7. Laporan Kerusakan (13 baris)

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '0d0b45b4-8411-597f-8bcd-57564d8aee15', 'LK-2026-0001', '3f34cdba-7a42-55f3-a39a-075a94f2fffe', '242f11fe-ab4b-5533-ae52-e67df51c4407',
  '4dfac964-253c-5ff5-829a-503cabaffead', 'air', 'Keran kamar mandi bocor', 'Keran menetes terus walau sudah ditutup rapat.',
  ARRAY['kerusakan/4dfac964-253c-5ff5-829a-503cabaffead/LK-2026-0001-1.jpg']::text[], 'ditutup', 75000, 65000,
  'Ganti karet keran', NULL, NULL,
  NULL, '2026-08-05 15:00:00+07', '2026-08-06 08:00:00+07',
  '2026-08-04 07:40:00+07', '2026-08-06 08:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '0fedb09f-ba89-5197-a597-406bd537bfd6', 'LK-2026-0002', '9fbcdf13-9b74-5bc5-8a48-1d53ac03d2af', '6fd560d1-2e32-5ee7-bc5a-ffa7eaf97835',
  'e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c', 'ac', 'AC tidak dingin', 'AC hanya mengeluarkan angin, tidak dingin sejak dua hari.',
  ARRAY['kerusakan/e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c/LK-2026-0002-1.jpg, kerusakan/e6e70e3c-15f5-52e6-b5a3-55f9cc084e9c/LK-2026-0002-2.jpg']::text[], 'ditutup', 350000, 300000,
  'Isi freon dan cuci AC', NULL, NULL,
  NULL, '2026-08-14 13:00:00+07', '2026-08-15 09:30:00+07',
  '2026-08-12 19:05:00+07', '2026-08-15 09:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '49aeb8ed-003c-5fd7-ae18-c4fe1599feff', 'LK-2026-0003', '9afe04f7-9e65-5732-af76-01f2170cd229', 'fc90221f-12ac-5a70-9094-e96a790590ce',
  'f5f5bd85-867b-5f38-bd99-3ad0cf86eb17', 'listrik', 'Stopkontak meja gosong', 'Stopkontak dekat meja kerja berbau gosong dan mati.',
  ARRAY['kerusakan/f5f5bd85-867b-5f38-bd99-3ad0cf86eb17/LK-2026-0003-1.jpg, kerusakan/f5f5bd85-867b-5f38-bd99-3ad0cf86eb17/LK-2026-0003-2.jpg']::text[], 'ditutup', 120000, 120000,
  'Ganti stopkontak dan cek kabel', NULL, NULL,
  NULL, '2026-08-29 11:00:00+07', '2026-08-30 10:00:00+07',
  '2026-08-28 21:10:00+07', '2026-08-30 10:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '65f0cfb0-05b2-5cbb-8312-ec4be64a94e9', 'LK-2026-0004', 'c1ebac7d-1cd3-526f-b8c2-10f615543e5f', 'dadfbc72-30cd-5d30-b628-d8807e90982a',
  '6429ed6c-4763-537b-ac3c-01edf27270dc', 'air', 'Water heater rusak', 'Water heater tidak menyala, lampu indikator mati.',
  ARRAY['kerusakan/6429ed6c-4763-537b-ac3c-01edf27270dc/LK-2026-0004-1.jpg, kerusakan/6429ed6c-4763-537b-ac3c-01edf27270dc/LK-2026-0004-2.jpg']::text[], 'ditutup', 1600000, 1550000,
  'Ganti unit water heater 30 liter', NULL, 'd2fe618c-8788-577e-b188-9c67073bf8d0',
  '2026-09-03 10:00:00+07', '2026-09-06 14:00:00+07', '2026-09-07 08:15:00+07',
  '2026-09-02 06:30:00+07', '2026-09-07 08:15:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '5bab1221-dae0-5330-917f-8a9c32f126bc', 'LK-2026-0005', '408ab273-5f37-5b0b-9d77-f371de1d910e', '12bc9396-8853-5b49-90e7-1261f85ba324',
  'd8cba6dc-cf31-5168-827e-708ed5271e38', 'perabot', 'Engsel lemari lepas', 'Pintu lemari pakaian lepas dari engselnya.',
  ARRAY['kerusakan/d8cba6dc-cf31-5168-827e-708ed5271e38/LK-2026-0005-1.jpg']::text[], 'selesai', 80000, 80000,
  'Ganti engsel', NULL, NULL,
  NULL, '2026-10-10 16:00:00+07', NULL,
  '2026-10-07 18:20:00+07', '2026-10-10 16:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '285fd647-984a-5925-8b64-959e18de18e0', 'LK-2026-0006', '0dd41633-20fd-5158-8d65-e1d902e2bfaf', 'bd3ab0d2-6264-5735-af70-705e48feebe0',
  '8e911480-1646-5bbe-b156-21435bac068e', 'bangunan', 'Plafon kamar mandi rembes', 'Ada noda air dan rembesan di plafon kamar mandi.',
  ARRAY['kerusakan/8e911480-1646-5bbe-b156-21435bac068e/LK-2026-0006-1.jpg, kerusakan/8e911480-1646-5bbe-b156-21435bac068e/LK-2026-0006-2.jpg, kerusakan/8e911480-1646-5bbe-b156-21435bac068e/LK-2026-0006-3.jpg']::text[], 'selesai', 1000000, 950000,
  'Perbaikan talang dan cat ulang plafon', NULL, NULL,
  NULL, '2026-10-14 15:30:00+07', NULL,
  '2026-10-09 08:00:00+07', '2026-10-14 15:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '1e8ba052-b2ab-599b-bcb8-5b73775db8e7', 'LK-2026-0007', '9740393f-f5fe-57cf-8b84-f70c2049fa98', '22f57dce-df3f-55af-b8e6-02013b9bf907',
  '7294c978-58c9-516b-80dc-31794579b8a7', 'lainnya', 'Minta pasang rak dinding', 'Mohon dipasangkan rak dinding tambahan di atas meja.',
  ARRAY['kerusakan/7294c978-58c9-516b-80dc-31794579b8a7/LK-2026-0007-1.jpg']::text[], 'ditolak', NULL, NULL,
  NULL, 'Bukan kerusakan; penambahan perabot di luar layanan', NULL,
  NULL, NULL, NULL,
  '2026-09-18 12:00:00+07', '2026-09-18 12:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '04567828-6058-5a70-921c-9eeafe1fed98', 'LK-2026-0008', '911d8eb2-d733-5932-b091-80bd81bc6094', 'b82d16ae-101b-510b-874e-d9bc0dfb480e',
  'd8de5db0-dbad-5530-ba7c-606eb8ffb821', 'listrik', 'Lampu kamar berkedip', 'Lampu utama berkedip dan kadang mati sendiri.',
  ARRAY['kerusakan/d8de5db0-dbad-5530-ba7c-606eb8ffb821/LK-2026-0008-1.jpg']::text[], 'diproses', 60000, NULL,
  'Teknisi dijadwalkan 16 Oktober', NULL, NULL,
  NULL, NULL, NULL,
  '2026-10-12 20:00:00+07', '2026-10-12 20:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  'b6c08e76-4b27-5285-825b-e145f8fb0428', 'LK-2026-0009', '911d8eb2-d733-5932-b091-80bd81bc6094', 'b82d16ae-101b-510b-874e-d9bc0dfb480e',
  'd8de5db0-dbad-5530-ba7c-606eb8ffb821', 'air', 'Saluran wastafel mampet', 'Air di wastafel turun sangat lambat.',
  ARRAY['kerusakan/d8de5db0-dbad-5530-ba7c-606eb8ffb821/LK-2026-0009-1.jpg']::text[], 'dilaporkan', NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL,
  '2026-10-14 07:15:00+07', '2026-10-14 07:15:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '42cc8b68-25bc-5348-8737-2b3eb5a969c2', 'LK-2026-0010', '911d8eb2-d733-5932-b091-80bd81bc6094', 'b82d16ae-101b-510b-874e-d9bc0dfb480e',
  'd8de5db0-dbad-5530-ba7c-606eb8ffb821', 'bangunan', 'Pintu kamar sulit dikunci', 'Kunci pintu harus didorong keras agar bisa terkunci.',
  ARRAY['kerusakan/d8de5db0-dbad-5530-ba7c-606eb8ffb821/LK-2026-0010-1.jpg']::text[], 'menunggu_persetujuan', 1250000, NULL,
  'Kusen memuai, perlu ganti kusen dan kunci', NULL, NULL,
  NULL, NULL, NULL,
  '2026-10-13 09:00:00+07', '2026-10-13 09:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  '76bf4e70-816f-5a94-9727-0b4a05b6d42a', 'LK-2026-0011', '173342f0-e56b-5a2d-906e-a02a5e790763', '489a2a68-f4dd-573e-a1a6-fcc1ca277dba',
  '9c3bb3d4-d5eb-5df1-931a-f88b971a94c0', 'ac', 'Remote AC hilang fungsi', 'Remote AC tidak merespons walau baterai baru.',
  ARRAY['kerusakan/9c3bb3d4-d5eb-5df1-931a-f88b971a94c0/LK-2026-0011-1.jpg']::text[], 'dilaporkan', NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL,
  '2026-10-15 08:30:00+07', '2026-10-15 08:30:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  'ec4ed4c3-7161-5a43-b785-4f92df52ab83', 'LK-2026-0012', 'f8eb530f-1148-54d2-8b4d-d5b469242d2d', 'bcdf7427-a279-5750-9022-6cbfb2d4bee1',
  'ef21f3ea-8cd8-55a5-8c0c-5c27544670cd', 'perabot', 'Kasur ambles', 'Kasur ambles di bagian tengah.',
  ARRAY['kerusakan/ef21f3ea-8cd8-55a5-8c0c-5c27544670cd/LK-2026-0012-1.jpg']::text[], 'diproses', 1000000, NULL,
  'Ganti kasur busa, estimasi tepat batas tanpa persetujuan', NULL, NULL,
  NULL, NULL, NULL,
  '2026-10-11 10:00:00+07', '2026-10-11 10:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

INSERT INTO public.laporan_kerusakan (
  id, nomor, kontrak_id, unit_id, pelapor_id, kategori, judul, deskripsi, foto_paths,
  status, estimasi_biaya, biaya_aktual, catatan, alasan_tolak, disetujui_oleh, disetujui_pada,
  selesai_pada, ditutup_pada, dibuat_pada, diperbarui_pada
) VALUES (
  'bc56f088-f7e2-507e-93b5-4fef61bf8a11', 'LK-2026-0013', '9a5b2418-ce98-5b9c-9306-27b6f9286343', '643abbb0-0552-5972-a0fa-b72605791846',
  '2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97', 'listrik', 'MCB sering turun', 'MCB turun setiap menyalakan rice cooker dan dispenser.',
  ARRAY['kerusakan/2bcd81a0-8502-55a5-9b29-ad8ee1a8ea97/LK-2026-0013-1.jpg']::text[], 'ditutup', 250000, 250000,
  'Naikkan daya MCB unit', NULL, NULL,
  NULL, '2026-09-22 14:00:00+07', '2026-09-25 09:00:00+07',
  '2026-09-21 19:45:00+07', '2026-09-25 09:00:00+07'
) ON CONFLICT (id) DO UPDATE SET nomor = EXCLUDED.nomor, status = EXCLUDED.status, estimasi_biaya = EXCLUDED.estimasi_biaya, biaya_aktual = EXCLUDED.biaya_aktual;

-- 8. Nomor Urut (5 baris)

INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES ('KTR', '2026', 23)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;

INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES ('LK', '2026', 13)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;

INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES ('INV', '202608', 19)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;

INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES ('INV', '202609', 19)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;

INSERT INTO public.nomor_urut (jenis, periode, terakhir)
VALUES ('INV', '202610', 19)
ON CONFLICT (jenis, periode) DO UPDATE SET terakhir = EXCLUDED.terakhir;

-- 9. Audit Log (23 baris)

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  1, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'status:identitas_penyewa:belum->terverifikasi',
  'identitas_penyewa', '7294c978-58c9-516b-80dc-31794579b8a7',
  '{"status_verifikasi": "belum"}'::jsonb,
  '{"status_verifikasi": "terverifikasi"}'::jsonb,
  '2026-07-20 11:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  2, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', 'ec52a4cd-08d8-53b1-83a0-bc8aa1c0751d',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-07-28 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  3, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', 'f8eb530f-1148-54d2-8b4d-d5b469242d2d',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-07-28 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  4, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', '468462b5-76f6-5451-9501-5e9ed781a852',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-07-28 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  5, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', 'fac8574f-43c8-56c0-a043-38bc63f85d00',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-07-28 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  6, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', '958ae410-5093-5194-9ed7-d6d1b81aa6f3',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-08-28 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  7, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'status:kontrak:aktif->selesai',
  'kontrak', '468462b5-76f6-5451-9501-5e9ed781a852',
  '{"status": "aktif"}'::jsonb,
  '{"status": "selesai"}'::jsonb,
  '2026-08-31 17:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  8, 'd2fe618c-8788-577e-b188-9c67073bf8d0', 'pemilik', 'status:laporan_kerusakan:menunggu_persetujuan->diproses',
  'laporan_kerusakan', '65f0cfb0-05b2-5cbb-8312-ec4be64a94e9',
  '{"status": "menunggu_persetujuan"}'::jsonb,
  '{"status": "diproses", "estimasi_biaya": 1600000}'::jsonb,
  '2026-09-03 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  9, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'insert:pembayaran',
  'pembayaran', '57d8f5ce-1404-5a15-bb9e-464d322d19bc',
  NULL,
  '{"jumlah": 500000, "status": "sah"}'::jsonb,
  '2026-09-04 09:10:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  10, 'd2fe618c-8788-577e-b188-9c67073bf8d0', 'pemilik', 'status:pembayaran:sah->dibatalkan',
  'pembayaran', '57d8f5ce-1404-5a15-bb9e-464d322d19bc',
  '{"status": "sah"}'::jsonb,
  '{"status": "dibatalkan", "alasan_batal": "Salah input, seharusnya untuk tagihan unit C-302"}'::jsonb,
  '2026-09-04 16:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  11, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'status:kontrak:draf->aktif',
  'kontrak', 'e7bf86c5-0a97-5ce6-acd2-06e13d1ae2bd',
  '{"status": "draf"}'::jsonb,
  '{"status": "aktif"}'::jsonb,
  '2026-09-27 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  12, 'd2fe618c-8788-577e-b188-9c67073bf8d0', 'pemilik', 'status:kontrak:aktif->diakhiri',
  'kontrak', 'fac8574f-43c8-56c0-a043-38bc63f85d00',
  '{"status": "aktif"}'::jsonb,
  '{"status": "diakhiri", "tanggal_berakhir_aktual": "2026-09-30"}'::jsonb,
  '2026-09-28 14:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  13, 'd2fe618c-8788-577e-b188-9c67073bf8d0', 'pemilik', 'update:unit',
  'unit', 'dadfbc72-30cd-5d30-b628-d8807e90982a',
  '{"harga_sewa_bulanan": 2650000}'::jsonb,
  '{"harga_sewa_bulanan": 2750000}'::jsonb,
  '2026-10-01 08:30:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  14, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'status:identitas_penyewa:belum->ditolak',
  'identitas_penyewa', 'e273be02-1d78-5b87-8916-bb926cf2f022',
  '{"status_verifikasi": "belum"}'::jsonb,
  '{"status_verifikasi": "ditolak"}'::jsonb,
  '2026-10-02 10:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  15, 'd2fe618c-8788-577e-b188-9c67073bf8d0', 'pemilik', 'update:profiles',
  'profiles', 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf',
  '{"peran": "penyewa"}'::jsonb,
  '{"peran": "pengelola"}'::jsonb,
  '2026-10-05 09:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  16, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'update:unit',
  'unit', '1d9d5d20-b1fb-527f-ad64-a625438e589f',
  '{"status": "tersedia"}'::jsonb,
  '{"status": "perbaikan"}'::jsonb,
  '2026-10-06 13:00:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  17, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'insert:pembayaran',
  'pembayaran', '3f5ec733-daad-5847-8f29-60a45d93a66e',
  NULL,
  '{"jumlah": 1450000, "metode": "tunai", "tagihan": "INV-202610-0005"}'::jsonb,
  '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  18, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'insert:pembayaran',
  'pembayaran', '7c596e95-d80d-56bb-971f-52355857258d',
  NULL,
  '{"jumlah": 1000000, "metode": "tunai", "tagihan": "INV-202610-0010"}'::jsonb,
  '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  19, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'insert:pembayaran',
  'pembayaran', 'dd06a3b0-8180-599a-9a13-4826037ab234',
  NULL,
  '{"jumlah": 1750000, "metode": "tunai", "tagihan": "INV-202610-0011"}'::jsonb,
  '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  20, 'd2774014-ed5c-5c8e-9b4e-b4859e885ddf', 'pengelola', 'insert:pembayaran',
  'pembayaran', '1a5eff77-486e-5388-b4bb-2030f1939634',
  NULL,
  '{"jumlah": 2750000, "metode": "transfer", "tagihan": "INV-202610-0015"}'::jsonb,
  '2026-10-09 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  21, NULL, NULL, 'insert:pembayaran',
  'pembayaran', '60bbd0fe-79e5-5699-b124-1c3ffdd2a8a6',
  NULL,
  '{"jumlah": 2650000, "metode": "mayar", "tagihan": "INV-202610-0018"}'::jsonb,
  '2026-10-10 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  22, NULL, NULL, 'insert:pembayaran',
  'pembayaran', '5c0ba38d-a663-5494-9bb3-b6ad868390c3',
  NULL,
  '{"jumlah": 1470000, "metode": "mayar", "tagihan": "INV-202610-0002"}'::jsonb,
  '2026-10-11 10:20:00+07'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_log (id, pelaku_id, peran, aksi, tabel, data_id, sebelum, sesudah, dibuat_pada)
OVERRIDING SYSTEM VALUE
VALUES (
  23, '04e98049-133d-5664-9e2c-579ddd2d1d01', 'pengelola', 'status:laporan_kerusakan:dilaporkan->menunggu_persetujuan',
  'laporan_kerusakan', '42cc8b68-25bc-5348-8737-2b3eb5a969c2',
  '{"status": "dilaporkan"}'::jsonb,
  '{"status": "menunggu_persetujuan", "estimasi_biaya": 1250000}'::jsonb,
  '2026-10-13 15:00:00+07'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles ENABLE TRIGGER USER;
ALTER TABLE public.unit ENABLE TRIGGER USER;
ALTER TABLE public.kontrak ENABLE TRIGGER USER;
ALTER TABLE public.laporan_kerusakan ENABLE TRIGGER USER;

COMMIT;
