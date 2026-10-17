# Dokumen Test Plan: Griya Kenanga Residence

> **Aplikasi**: 05. Manajemen Properti - Griya Kenanga Residence  
> **Tanggal Acuan Data**: 15 Oktober 2026  
> **Standar Status Code**: 200 (Berhasil), 400 (Data Salah/Kurang), 401 (Belum Login), 403 (Tidak Berhak), 404 (Tidak Ditemukan), 429 (Spam/Rate Limit), 500 (Server Error)  
> **Kata Sandi Akun Uji**: `Latihan#2026`  

---

## 1. Lingkup dan Metodologi Pengujian

Pengujian ini mencakup verifikasi menyeluruh terhadap 12 Aturan Bisnis (**BR-01** s/d **BR-12**), 10 Kebutuhan Pengguna (**US-01** s/d **US-10**), kasus batas pada tanggal acuan **15 Oktober 2026**, uji operasi bersamaan (*concurrency*), proteksi rate limit (*debounce* / 429), dan proteksi hak akses URL langsung (*Direct URL Access* 401 vs 403).

---

## 2. Matriks Kasus Uji (Test Cases)

| Kode | Rujukan | Akun Uji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Sebenarnya | Status |
|:---:|:---:|:---:|---|---|:---:|:---:|
| **TC-01** | BR-03, US-02, US-03 | `fajar@griyakenanga.test` & `bayu@griyakenanga.test` | 1. Bayu mencoba mengaktifkan kontrak draf C-307 milik Fajar sebelum identitas diverifikasi.<br>2. Bayu memverifikasi identitas Fajar (NIK, foto KTP, kontak darurat).<br>3. Bayu mengaktifkan kembali kontrak draf. | 1. Aktivasi ditolak dengan HTTP 400 (*"Identitas penyewa belum diverifikasi"*).<br>2. Verifikasi sukses HTTP 200.<br>3. Kontrak berubah jadi `aktif` dengan HTTP 200. | Menunggu Uji | DRAFT |
| **TC-02** | BR-01, US-03 | `bayu@griyakenanga.test` | Bayu mencoba membuat kontrak baru untuk Unit C-307 dengan periode 1 Nov 2026 s/d 30 Apr 2027 (periode yang sama dengan kontrak draf Fajar). | Sistem menolak pembuatan kontrak dengan HTTP 400 (*"Unit sudah memiliki kontrak pada periode tersebut"*). Tidak terjadi *double booking*. | Menunggu Uji | DRAFT |
| **TC-03** | BR-01, BR-03 | `cahya@griyakenanga.test` & `bayu@griyakenanga.test` | Cahya memiliki kontrak aktif di Unit A-103 berakhir 31 Okt 2026. Draf perpanjangan dibuat mulai 1 Nov 2026. Bayu mencoba mengaktifkan draf perpanjangan pada 15 Okt 2026. | Aktivasi ditolak dengan HTTP 400 (*"Penyewa masih memiliki kontrak aktif berjalan. Perpanjangan baru bisa diaktifkan setelah kontrak lama selesai"*). | Menunggu Uji | DRAFT |
| **TC-04** | BR-04 | `bayu@griyakenanga.test` | Bayu mencoba membuat kontrak baru pada:<br>a. Unit B-205 (status: `perbaikan`).<br>b. Unit A-108 (status: `nonaktif`). | Sistem menolak pembuatan kontrak pada kedua unit dengan HTTP 400 (*"Kontrak hanya dapat dibuat untuk unit yang berstatus tersedia"*). | Menunggu Uji | DRAFT |
| **TC-05** | BR-07, US-05 | `dimas@griyakenanga.test` & `bayu@griyakenanga.test` | Pada 15 Okt 2026, Bayu membuka tagihan Oktober Dimas (jatuh tempo 10 Okt 2026, telat 5 hari) dan mencatat pelunasan tunai. | Sistem otomatis menghitung denda keterlambatan 5 hari x Rp20.000 = Rp100.000. Total tagihan bertambah denda dan status menjadi `lunas` dengan HTTP 200. | Menunggu Uji | DRAFT |
| **TC-06** | BR-07, US-05 | `hana@griyakenanga.test` & `bayu@griyakenanga.test` | Pada 15 Okt 2026, Bayu mencatat pelunasan tagihan September Hana (status `sebagian` sejak 8 Sep, telat > 30 hari). | Sistem menghitung denda dan menguncinya tepat pada batas maksimum Rp200.000 (tidak melebihi plafon) dengan HTTP 200. | Menunggu Uji | DRAFT |
| **TC-07** | BR-07 | `raka@griyakenanga.test` | Memeriksa riwayat tagihan Agustus Raka yang dibayar telat 15 hari dari jatuh tempo 10 Agustus. | Denda tercatat tetap Rp200.000, bukan Rp300.000 (patuh terhadap batas maksimal BR-07). Status HTTP 200. | Menunggu Uji | DRAFT |
| **TC-08** | BR-07 | `vina@griyakenanga.test` & `bella@griyakenanga.test` | Membandingkan perhitungan denda:<br>a. Vina membayar tagihan tepat 10 Okt 2026.<br>b. Bella membayar tagihan pada 11 Okt 2026 (telat 1 hari). | a. Tagihan Vina denda Rp0 (HTTP 200).<br>b. Tagihan Bella dikenai denda Rp20.000 (HTTP 200). Pembayaran tepat tanggal 10 belum dikenakan denda. | Menunggu Uji | DRAFT |
| **TC-09** | BR-11, US-07 | `dimas@griyakenanga.test` | Dimas (memiliki 3 laporan kerusakan berstatus terbuka: dilaporkan/diproses/menunggu) mencoba mengirim laporan kerusakan ke-4 dengan melampirkan 2 foto JPG. | Pengiriman ditolak dengan HTTP 400 (*"Batas maksimal 3 laporan terbuka tercapai. Tunggu laporan sebelumnya selesai dan ditutup"*). | Menunggu Uji | DRAFT |
| **TC-10** | BR-12, US-08, US-09 | `oki@griyakenanga.test`, `dimas@griyakenanga.test`, & `bayu@griyakenanga.test` | a. Bayu memproses laporan LK-2026-0012 (Oki) dengan estimasi Rp1.000.000.<br>b. Bayu memproses laporan LK-2026-0010 (Dimas) dengan estimasi Rp1.250.000. | a. LK-2026-0012 langsung berubah ke status `diproses` tanpa persetujuan (HTTP 200).<br>b. LK-2026-0010 otomatis dialihkan ke status `menunggu persetujuan` Pemilik (HTTP 200). Pengelola tidak bisa langsung memproses perbaikan > Rp1.000.000. | Menunggu Uji | DRAFT |
| **TC-11** | BR-12 | `bayu@griyakenanga.test` | a. Bayu mencoba menutup LK-2026-0005 (selesai 10 Okt 2026, sudah 5 hari).<br>b. Bayu mencoba menutup LK-2026-0006 (selesai 14 Okt 2026, baru 1 hari). | a. LK-2026-0005 berhasil ditutup oleh Pengelola karena sudah lewat 3 hari (HTTP 200).<br>b. LK-2026-0006 ditolak dengan HTTP 403 (*"Hanya penyewa pelapor yang dapat menutup laporan sebelum 3 hari"*). | Menunggu Uji | DRAFT |
| **TC-12** | BR-11, US-07 | `gilang@griyakenanga.test` | Gilang (kontrak telah diakhiri pada 30 Sep 2026 dan identitas ditolak) mencoba mengakses form dan mengirim laporan kerusakan. | Sistem menolak pengiriman dengan HTTP 403 / 400 (*"Hanya penyewa dengan kontrak aktif yang berhak membuat laporan kerusakan"*). | Menunggu Uji | DRAFT |
| **TC-13** | BR-01, US-03 (Concurrency) | `bayu@griyakenanga.test` & `sinta@griyakenanga.test` | Bayu dan Sinta secara bersamaan (pada detik yang sama) menekan tombol submit untuk membuat kontrak pada Unit A-106 yang kosong untuk periode 1 Nov 2026. | Transaksi database Supabase / Postgres constraint mengunci unit: 1 pengelola berhasil (HTTP 200), pengelola lainnya menerima error bentrok jadwal (HTTP 400 / Conflict). Unit tidak terpesan ganda. | Menunggu Uji | DRAFT |
| **TC-14** | BR-08, US-05 (Concurrency) | `bayu@griyakenanga.test` & `sinta@griyakenanga.test` | Bayu dan Sinta bersamaan mencatat cicilan pembayaran pada tagihan dengan sisa Rp500.000, masing-masing memasukkan Rp400.000. | Database atomic update / function memvalidasi sisa: pembayaran pertama berhasil mengurangi sisa jadi Rp100.000 (HTTP 200), pembayaran kedua ditolak karena Rp400.000 > sisa Rp100.000 (HTTP 400). | Menunggu Uji | DRAFT |
| **TC-15** | BR-06, US-04 (Anti-Spam / Rate Limit) | `bayu@griyakenanga.test` | Bayu mengklik tombol "Buat Tagihan Bulanan" berkali-kali secara cepat (5 kali dalam 1 detik). | Request pertama diproses membuat tagihan bernomor urut (HTTP 200). Klik bertubi-tubi berikutnya diblokir oleh debounce client / rate limit dengan pesan ramah HTTP 429. Tidak ada nomor invoice yang dobel atau melompat. | Menunggu Uji | DRAFT |
| **TC-16** | BR-08 | `bayu@griyakenanga.test` | Bayu mencatat pembayaran cicilan tagihan sebesar Rp50.000 (di mana sisa tagihan masih Rp800.000). | Sistem menolak pencatatan dengan HTTP 400 (*"Pembayaran cicilan minimal Rp100.000 kecuali untuk pelunasan sisa akhir"*). | Menunggu Uji | DRAFT |
| **TC-17** | BR-10, KNF-3 (Direct URL - Unauthenticated) | Pengguna Anonim (Belum Login) | Pengguna langsung membuka URL internal browser:<br>a. `/dashboard`<br>b. `/dashboard/laporan`<br>c. Request GET `/api/status-test` tanpa token. | a & b. Next.js Proxy/Middleware langsung me-redirect ke `/login?callbackUrl=...` (HTTP 401).<br>c. Endpoint API mengembalikan respons JSON 401 Unauthorized. | Menunggu Uji | DRAFT |
| **TC-18** | BR-10, US-10 (Direct URL - Role Forbidden) | `bayu@griyakenanga.test` & `jihan@griyakenanga.test` | a. Bayu (Pengelola) langsung membuka URL `/dashboard/laporan`.<br>b. Jihan (Penyewa) membuka URL `/dashboard/unit` atau API ubah harga. | Akses ditolak dengan HTTP 403 Forbidden (*"Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman atau data ini"*). Pengelola & Penyewa dilarang melihat laporan pendapatan Pemilik. **Status 401 dan 403 tidak tertukar.** | Menunggu Uji | DRAFT |
| **TC-19** | BR-10, KNF-4 | `ratna@griyakenanga.test` | Ratna (Pemilik) membuka daftar data penyewa pada halaman Penyewa. | NIK penyewa disamarkan secara otomatis (hanya menampilkan 4 digit terakhir: `****-****-****-1234`). Tautan foto KTP menggunakan signed URL privat sementara dan tidak dapat diakses publik. HTTP 200. | Menunggu Uji | DRAFT |
| **TC-20** | Bagian 11 (Payment Gateway Idempotency) | Sistem Mayar Webhook & `vina@griyakenanga.test` | 1. Vina klik "Bayar Online", invoice Mayar sandbox terbuat (HTTP 200).<br>2. Webhook `payment.received` dikirim oleh Mayar.<br>3. Webhook yang sama dikirim ulang (jaringan retry). | 1. Tautan invoice Mayar berhasil dibuat (HTTP 200).<br>2. Pembayaran tercatat dengan metode `mayar` dan status tagihan berubah `lunas` (HTTP 200).<br>3. Webhook kedua dideteksi idempoten sehingga pembayaran tidak dicatat dobel (HTTP 200 / diabaikan). | Menunggu Uji | DRAFT |

---

## 3. Ketentuan Pengujian Negatif dan Validasi Error

1. **Uji Validasi Form (HTTP 400)**: Memastikan pesan error inline muncul jelas di bawah field yang salah (contoh: NIK tidak 16 angka, durasi sewa di luar pilihan 1/3/6/12 bulan, tanggal mulai bukan tanggal 1).
2. **Pembedaan Tegas 401 vs 403**:
   - `401 Unauthorized`: Wajib hanya saat tidak ada sesi atau token expired.
   - `403 Forbidden`: Pengguna terautentikasi namun perannya tidak memiliki hak istimewa untuk aksi tersebut.
3. **Uji Kasus 404 Not Found**: Mengakses ID kontrak, tagihan, atau unit fiktif mengembalikan halaman error human-friendly dalam bahasa Indonesia.
4. **Uji Kasus 429 Rate Limit**: Tombol `DebounceButton` menonaktifkan dirinya secara visual dengan label jeda waktu dan mencegah panggilan ganda ke server Supabase.

---

## 4. Rencana Kerja per Halaman & Matriks Eksekusi
- **Masuk & Daftar (`/login`, `/register`)**: Form auth, registrasi mandiri otomatis peran Penyewa.
- **Beranda (`/dashboard`)**: Dashboard operasional adaptif 3 peran dengan status hunian, tagihan jatuh tempo, dan laporan kerusakan terbuka.
- **Unit (`/dashboard/unit`)**: Visualisasi 24 unit, status ubah oleh Pengelola, harga ubah oleh Pemilik.
- **Penyewa (`/dashboard/penyewa`)**: Verifikasi identitas oleh Pengelola, penyamaran NIK untuk Pemilik.
- **Kontrak (`/dashboard/kontrak`)**: Siklus hidup kontrak, aktivasi syarat identitas terverifikasi, pengakhiran awal oleh Pemilik.
- **Tagihan (`/dashboard/tagihan`)**: Pembuatan massal, pembayaran tunai/transfer/Mayar, denda otomatis.
- **Kerusakan (`/dashboard/kerusakan`)**: Laporan 1-3 foto, limit 3 laporan terbuka, approval > Rp1.000.000 oleh Pemilik.
- **Laporan (`/dashboard/laporan`)**: Grafik pendapatan & hunian, ekspor CSV pendapatan, audit log viewer, pengaturan peran (khusus Pemilik).

