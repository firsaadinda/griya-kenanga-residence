# Panduan Autentikasi Sistem & Akun Uji Coba
## Griya Kenanga Residence • Capstone Project

Dokumen ini disusun sebagai panduan resmi arsitektur autentikasi Griya Kenanga Residence yang murni terhubung ke **Supabase Auth** dengan standar keamanan industri:
1. **Login Google OAuth Murni**: Integrasi resmi dengan penyedia Google via Supabase OAuth.
2. **Login Email & Kata Sandi Ketat**: Validasi regex ketat minimal 8 karakter dengan kombinasi lengkap (huruf besar, kecil, angka, dan simbol khusus).

---

## 1. Setup Login Google OAuth (OAuth 2.0) di Supabase Dashboard

Tombol **"Masuk Cepat dengan Google"** terhubung langsung ke `supabase.auth.signInWithOAuth({ provider: 'google' })`.

### Langkah Konfigurasi Resmi:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru atau pilih proyek yang sudah ada (*Griya Kenanga*).
3. Masuk ke **APIs & Services** > **OAuth consent screen** (Pilih External, isi nama aplikasi & email pengembang).
4. Masuk ke **Credentials** > **Create Credentials** > **OAuth client ID** (Application type: *Web application*).
5. Pada bagian **Authorized redirect URIs**, masukkan URI Supabase resmi:
   ```
   https://pihyqhhckltsqblktawg.supabase.co/auth/v1/callback
   ```
6. Salin **Client ID** & **Client Secret**.
7. Buka **Supabase Dashboard** (`pihyqhhckltsqblktawg`) > **Authentication** > **Providers** > **Google**.
8. Aktifkan toggle **Enable Google provider**, masukkan Client ID & Client Secret, lalu klik **Save**.

Setelah itu, pengguna dapat langsung login menggunakan akun Google asli mereka dan otomatis tersinkronisasi sebagai `penyewa` di tabel `profiles`.

---

## 2. Kebijakan Keamanan Kata Sandi Ketat (Password Security Policy)

Sistem login dan registrasi menerapkan validasi ganda (*Client-side* dan *Server-side*) dengan kriteria ketat:
- **Panjang**: Minimal 8 karakter.
- **Karakter Wajib**:
  - Setidaknya 1 huruf besar (`A-Z`)
  - Setidaknya 1 huruf kecil (`a-z`)
  - Setidaknya 1 angka (`0-9`)
  - Setidaknya 1 simbol / karakter khusus (`!@#$%^&*` dsb.)
- **Respon Penolakan**: Server Action menolak dengan kode status **`400 Bad Request`** jika kriteria kata sandi tidak terpenuhi.
- **UI Guidance**: Formulir menampilkan teks panduan abu-abu di bawah kotak input:
  *"Kombinasi huruf besar, huruf kecil, angka, dan simbol khusus (min. 8 karakter)."*

---

## 3. Daftar Lengkap 25 Akun Uji dengan Catatan Resmi (@gmail.com)

Berikut adalah daftar lengkap 25 akun uji coba terkonfigurasi di database Supabase dengan domain `@gmail.com`, sandi unik kuat yang memenuhi standar keamanan (*min. 8 karakter, huruf besar, huruf kecil, angka, simbol*), serta **catatan resmi yang dipertahankan utuh untuk pengujian fitur sistem**:

| No | Nama Lengkap | Peran | Email Akun (@gmail.com) | Kata Sandi Unik | Catatan Resmi (Skenario Pengujian) |
| :---: | :--- | :---: | :--- | :--- | :--- |
| 1 | **Ratna Kusumawardani** | Pemilik | `ratna.griyakenanga@gmail.com` | `Ratna#Pemilik2026!` | **Pemilik** |
| 2 | **Bayu Prasetyo** | Pengelola | `bayu.prasetyo@gmail.com` | `Bayu#Kelola2026$` | **Pengelola utama** |
| 3 | **Sinta Maharani** | Pengelola | `sinta.maharani@gmail.com` | `Sinta#Admin2026%` | **Pengelola (dipromosikan Pemilik 5 Okt)** |
| 4 | **Aditya Pratama** | Penyewa | `aditya.pratama@gmail.com` | `Aditya#SewaB201*` | *(kosong)* |
| 5 | **Bella Safitri** | Penyewa | `bella.safitri@gmail.com` | `Bella#SewaA102&` | *(kosong)* |
| 6 | **Cahya Ramadhan** | Penyewa | `cahya.ramadhan@gmail.com` | `Cahya#SewaA103^` | **Kontrak berakhir 31 Okt dan draf perpanjangan** |
| 7 | **Dimas Saputra** | Penyewa | `dimas.saputra@gmail.com` | `Dimas#SewaA101*` | **3 laporan terbuka, tagihan Okt belum bayar** |
| 8 | **Eka Wulandari** | Penyewa | `eka.wulandari@gmail.com` | `Eka#SewaA105@` | *(kosong)* |
| 9 | **Fajar Nugroho** | Penyewa | `fajar.nugroho@gmail.com` | `Fajar#SewaC307!` | **Identitas belum diverifikasi, kontrak draf C-307** |
| 10 | **Gilang Mahendra** | Penyewa | `gilang.mahendra@gmail.com` | `Gilang#SewaB202#` | **Kontrak diakhiri, identitas ditolak** |
| 11 | **Hana Puspita** | Penyewa | `hana.puspita@gmail.com` | `Hana#SewaA104$` | **Tunggakan September dan Oktober** |
| 12 | **Indra Kurniawan** | Penyewa | `indra.kurniawan@gmail.com` | `Indra#SewaB203%` | *(kosong)* |
| 13 | **Jihan Aulia** | Penyewa | `jihan.aulia@gmail.com` | `Jihan#SewaA106^` | *(kosong)* |
| 14 | **Kevin Wijaya** | Penyewa | `kevin.wijaya@gmail.com` | `Kevin#SewaB204&` | *(kosong)* |
| 15 | **Laras Anggraini** | Penyewa | `laras.anggraini@gmail.com` | `Laras#SewaA107*` | **Tagihan Okt sebagian** |
| 16 | **Muhammad Rizki** | Penyewa | `muhammad.rizki@gmail.com` | `Rizki#SewaB205(` | *(kosong)* |
| 17 | **Nadia Salsabila** | Penyewa | `nadia.salsabila@gmail.com` | `Nadia#SewaB207)` | *(kosong)* |
| 18 | **Oki Firmansyah** | Penyewa | `oki.firmansyah@gmail.com` | `Oki#SewaA108-` | *(kosong)* |
| 19 | **Putri Lestari** | Penyewa | `putri.lestari@gmail.com` | `Putri#SewaB208+` | *(kosong)* |
| 20 | **Raka Aditama** | Penyewa | `raka.aditama@gmail.com` | `Raka#SewaC301=` | *(kosong)* |
| 21 | **Salma Nuraini** | Penyewa | `salma.nuraini@gmail.com` | `Salma#SewaC302~` | *(kosong)* |
| 22 | **Teguh Santoso** | Penyewa | `teguh.santoso@gmail.com` | `Teguh#SewaC303!` | *(kosong)* |
| 23 | **Vina Rahmawati** | Penyewa | `vina.rahmawati@gmail.com` | `Vina#SewaC304#` | **Pernah bayar lewat Mayar** |
| 24 | **Wahyu Hidayat** | Penyewa | `wahyu.hidayat@gmail.com` | `Wahyu#SewaC306$` | *(kosong)* |
| 25 | **Yoga Permana** | Penyewa | `yoga.permana@gmail.com` | `Yoga#SewaC308%` | **Mantan penyewa (kontrak selesai)** |

---

## 4. Validasi Keamanan Sandi pada Formulir

Aplikasi secara ketat menolak kata sandi lemah dengan aturan:
- **Panjang**: Min. 8 karakter.
- **Karakter Wajib**: Setidaknya 1 Huruf Besar, 1 Huruf Kecil, 1 Angka, dan 1 Simbol Khusus.
- **Respon Server**: Menolak dengan kode status **`400 Bad Request`** jika syarat tidak terpenuhi.
- **UI Helper**: Menampilkan panduan abu-abu di bawah kotak input:
  *"Kombinasi huruf besar, huruf kecil, angka, dan simbol khusus (min. 8 karakter)."*
