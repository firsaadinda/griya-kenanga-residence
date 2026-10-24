# Sistem Informasi Manajemen Properti dan Kos — Griya Kenanga Residence

Aplikasi web internal untuk mengelola operasional penyewaan kos dan studio di Griya Kenanga Residence. Sistem ini mencakup fitur eksplorasi denah 2D dan model 3D, pengelolaan kontrak sewa, penagihan otomatis via *payment gateway*, pelaporan kerusakan fasilitas, hingga pemantauan keuangan secara *real-time*.

**Tautan Aplikasi (Live URL):** https://griya-kenanga-residence.firsaadinda.site

## Latar Belakang Masalah

Griya Kenanga Residence adalah usaha kos dan studio sewa di Sleman, Yogyakarta, yang memiliki 24 unit hunian di tiga lantai:

* **Blok A — Lantai 1 (Kamar Standar):** 8 unit kamar kos standar.
* **Blok B — Lantai 2 (Kamar Ber-AC):** 8 unit kamar kos kelas menengah dengan AC.
* **Blok C — Lantai 3 (Unit Studio):** 8 unit apartemen studio fasilitas lengkap.

Mayoritas penyewa adalah mahasiswa dan karyawan muda dengan durasi sewa 1 sampai 12 bulan. Sebelumnya, seluruh administrasi masih dikelola manual: kontrak dicatat di Excel, tagihan dikirim satu-satu lewat WhatsApp, pembayaran ditulis di buku kas, dan komplain kerusakan hanya lewat chat pribadi ke pengelola.

Cara manual ini sering menimbulkan masalah operasional seperti:

* Satu kamar tidak sengaja dijanjikan ke dua calon penyewa di bulan yang sama (*double-booking*);
* Tagihan bulanan terlewat atau terkirim dua kali, dengan nomor *invoice* yang berantakan;
* Perhitungan denda keterlambatan tidak konsisten antar pengelola;
* Foto KTP penyewa tersimpan di HP pribadi pengelola tanpa perlindungan privasi;
* Laporan kerusakan tidak jelas statusnya, bahkan perbaikan mahal jalan terus tanpa persetujuan pemilik;
* Pemilik kesulitan memantau pendapatan riil, kamar kosong, dan total tunggakan secara akurat.

Aplikasi ini dibuat untuk menggantikan pencatatan di Excel, buku kas, dan chat pribadi menjadi satu sistem terpusat dengan pembagian akses yang jelas untuk tiga peran: **Pemilik (Owner)**, **Pengelola (Manager)**, dan **Penyewa (Tenant)**.

## Fitur Unggulan Tambahan

Selain menerapkan 12 aturan bisnis utama (*Business Rules*) dan pengamanan data, aplikasi ini memiliki empat fitur unggulan:

1. **Eksplorasi Unit & Lantai Interaktif 2D dan 3D:**
   Visualisasi denah lantai 2D dan model 3D interaktif untuk melihat tata letak bangunan serta bagian dalam tiap tipe unit di Blok A, Blok B, dan Blok C. Pemilik, pengelola, maupun penyewa bisa melihat kondisi ruang secara 360 derajat dan memantau ketersediaan kamar langsung dari web.

2. **Pembayaran Mayar Otomatis via Webhook:**
   Pembayaran tagihan sewa dan denda secara online menggunakan tautan pembayaran dari Mayar Payment Gateway. Sistem terhubung dengan *webhook* yang otomatis memverifikasi transaksi dan memperbarui status lunas dalam hitungan detik tanpa perlu dicek manual.

3. **Cetak Dokumen Resmi Otomatis (Kontrak, Invoice, dan Kwitansi PDF):**
   Pengguna bisa langsung mengunduh dokumen resmi siap cetak dalam format PDF, mulai dari Kontrak Sewa Menyewa, *Invoice* Tagihan Bulanan, hingga Kwitansi Pembayaran setelah tagihan lunas.

4. **Kalkulator & Simulasi Denda:**
   Fitur simulasi bagi pengelola dan penyewa untuk menghitung estimasi denda keterlambatan secara transparan berdasarkan tanggal acuan sistem dan batas denda maksimal.

## 1. Cara Menjalankan Proyek

Aplikasi ini sudah di-*deploy* secara penuh ke server produksi, jadi penguji maupun pengguna bisa langsung mencobanya tanpa perlu instalasi di *localhost*.

### Panduan Akses Langsung

1. Buka *browser* (Chrome, Firefox, atau Edge) di komputer maupun HP.
2. Buka tautan berikut: **https://griya-kenanga-residence.firsaadinda.site**
3. Pada halaman *Login*, masukkan email dan kata sandi dari salah satu daftar 25 akun uji coba di bawah.
4. Jika ingin menguji skenario dua akun sekaligus (misalnya uji *concurrency* antar dua pengelola atau cek tampilan pemilik vs penyewa), gunakan mode *Incognito* atau profil *browser* yang berbeda.

## 2. Daftar Lengkap Akun Uji Coba (25 Akun)

Untuk memudahkan pengujian seluruh alur sistem, ke-25 akun di database menggunakan pengaturan standar berikut:

* **Kata Sandi Seragam:** `Latihan#2026` *(berlaku untuk login semua akun Pemilik, Pengelola, dan Penyewa, serta konfirmasi buka detail data sensitif)*
* **Tanggal Acuan Sistem:** `15 Oktober 2026` *(dipakai sebagai patokan waktu untuk cek jatuh tempo, masa sewa, dan hitung denda)*

Berikut adalah daftar urut ke-25 akun beserta peran dan skenario pengujiannya:

| No | Nama Lengkap | Peran | Email | Kata Sandi | Keterangan / Skenario Khusus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Ratna Kusumawardani** | Pemilik | `ratna.griyakenanga@gmail.com` | `Latihan#2026` | **Pemilik Properti (Owner) — Analitik pendapatan, ubah tarif unit (BR-10), audit log, approval biaya > Rp1.000.000 (BR-12), & penyamaran NIK** |
| 2 | **Bayu Prasetyo** | Pengelola | `bayu.prasetyo@gmail.com` | `Latihan#2026` | **Pengelola Operasional Utama — Kelola kontrak, verifikasi KTP, penagihan, & uji concurrency** |
| 3 | **Sinta Maharani** | Pengelola | `sinta.maharani@gmail.com` | `Latihan#2026` | **Pengelola (dipromosikan Pemilik 5 Okt) — Operasional harian & simulasi uji aksi bersamaan (concurrency) bersama Bayu** |
| 4 | **Aditya Pratama** | Penyewa | `aditya.pratama@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 5 | **Bella Safitri** | Penyewa | `bella.safitri@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 6 | **Cahya Ramadhan** | Penyewa | `cahya.ramadhan@gmail.com` | `Latihan#2026` | **Kontrak berakhir 31 Okt dan draf perpanjangan (uji transisi perpanjangan masa sewa tanpa bentrok tanggal)** |
| 7 | **Dimas Saputra** | Penyewa | `dimas.saputra@gmail.com` | `Latihan#2026` | **3 laporan terbuka, tagihan Okt belum bayar (uji penolakan laporan ke-4 BR-11 & denda berjalan Rp100.000 BR-07)** |
| 8 | **Eka Wulandari** | Penyewa | `eka.wulandari@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 9 | **Fajar Nugroho** | Penyewa | `fajar.nugroho@gmail.com` | `Latihan#2026` | **Identitas berhasil diverifikasi (BR-03), kontrak draf C-307 (siap uji aktivasi kontrak sewa)** |
| 10 | **Gilang Mahendra** | Penyewa | `gilang.mahendra@gmail.com` | `Latihan#2026` | **Kontrak diakhiri, identitas ditolak (uji blokir aktivasi kontrak BR-03 & status terminasi)** |
| 11 | **Hana Puspita** | Penyewa | `hana.puspita@gmail.com` | `Latihan#2026` | **Tunggakan September dan Oktober (uji batas plafon denda maksimal Rp200.000 per tagihan BR-07)** |
| 12 | **Indra Kurniawan** | Penyewa | `indra.kurniawan@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 13 | **Jihan Aulia** | Penyewa | `jihan.aulia@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 14 | **Kevin Wijaya** | Penyewa | `kevin.wijaya@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 15 | **Laras Anggraini** | Penyewa | `laras.anggraini@gmail.com` | `Latihan#2026` | **Tagihan Okt sebagian (uji pembayaran cicilan bertahap minimal Rp100.000 BR-08 & proteksi lebih bayar BR-09)** |
| 16 | **Muhammad Rizki** | Penyewa | `muhammad.rizki@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 17 | **Nadia Salsabila** | Penyewa | `nadia.salsabila@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 18 | **Oki Firmansyah** | Penyewa | `oki.firmansyah@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif dengan skenario pengujian estimasi biaya perbaikan kerusakan Rp1.000.000 BR-12)* |
| 19 | **Putri Lestari** | Penyewa | `putri.lestari@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 20 | **Raka Aditama** | Penyewa | `raka.aditama@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 21 | **Salma Nuraini** | Penyewa | `salma.nuraini@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 22 | **Teguh Santoso** | Penyewa | `teguh.santoso@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 23 | **Vina Rahmawati** | Penyewa | `vina.rahmawati@gmail.com` | `Latihan#2026` | **Pernah bayar lewat Mayar (uji pelunasan otomatis via Mayar Payment Gateway, Webhook, & cetak Kwitansi PDF)** |
| 24 | **Wahyu Hidayat** | Penyewa | `wahyu.hidayat@gmail.com` | `Latihan#2026` | *(kosong — penyewa aktif reguler dengan kontrak dan pembayaran berjalan normal)* |
| 25 | **Yoga Permana** | Penyewa | `yoga.permana@gmail.com` | `Latihan#2026` | **Mantan penyewa (kontrak selesai — uji arsip riwayat sewa penghuni lama)** |

## 3. Catatan Keputusan

Pengembangan sistem Griya Kenanga Residence didasarkan pada beberapa keputusan teknis untuk memastikan transaksi keuangan tetap akurat, data aman, bebas dari bentrok proses (*race condition*), dan sesuai dengan 12 aturan bisnis:

### 1. Eksekusi Sisi Server dengan Next.js App Router & Server Actions

Semua logika bisnis utama, perhitungan uang, validasi masa sewa, dan perubahan data sensitif dijalankan sepenuhnya di sisi server menggunakan *Next.js Server Actions* dan *Route Handlers*. Tampilan di sisi pengguna (*client*) hanya bertugas menampilkan status dan mengirim permintaan, sehingga pengguna tidak bisa mengakali validasi dari *browser*.

### 2. Pengamanan Ganda (Middleware RBAC + Database RLS)

Sistem menggunakan dua lapis pengamanan untuk membatasi akses halaman dan data:

* **Lapisan Aplikasi (Middleware & Guard):** Membedakan dengan jelas antara pengguna yang belum *login* (`HTTP 401 Unauthorized` / diarahkan ke halaman *login*) dan pengguna yang mencoba membuka halaman yang bukan hak aksesnya (`HTTP 403 Forbidden`).
* **Lapisan Database (Supabase Row Level Security):** Semua tabel di skema `public` PostgreSQL sudah dipasangi aturan RLS. Penyewa hanya bisa melihat data kontrak, tagihan, pembayaran, dan laporan kerusakan miliknya sendiri, meskipun mencoba mengakses kueri secara langsung.

### 3. Perlindungan Privasi Data Kependudukan (Kepatuhan UU PDP)

Untuk menjaga kerahasiaan data pribadi penghuni kos, ada pembatasan khusus yang diterapkan sesuai peran akun:

* **Penyamaran NIK (*Data Masking*) & Akses Data di Akun Pemilik:** Nomor Induk Kependudukan (NIK) penyewa otomatis disensor menjadi `****-****-****-XXXX` (hanya 4 angka terakhir yang terlihat) saat dibuka dari akun Pemilik atau di halaman ringkasan internal. Jika Pemilik ingin melihat detail informasi kontak seperti **Nomor Telepon** dan **Email** penyewa, Pemilik wajib memasukkan kata sandi konfirmasi (`Latihan#2026`).
* **Verifikasi Kata Sandi & Penyimpanan Foto KTP Privat di Akun Pengelola (*Expiring Signed URLs*):** File foto KTP disimpan di *private storage bucket* Supabase yang tertutup dari publik dan hanya bisa diakses lewat tautan khusus (*Signed URL*) berbatas waktu singkat. Saat Pengelola ingin membuka detail **Data KTP, NIK penuh, Email, dan Nomor Telepon** penyewa, sistem mengharuskan Pengelola memasukkan kata sandi konfirmasi (`Latihan#2026`) terlebih dahulu.

### 4. Pencegahan Bentrok Kontrak & Penanganan Concurrency (BR-01, BR-02, BR-03)

Untuk mencegah masalah satu kamar disewakan ke dua orang di waktu yang sama:

* Saat membuat atau mengaktifkan kontrak, sistem mengecek apakah tanggal sewa (`tanggal_mulai` sampai `tanggal_selesai`) bentrok dengan kontrak aktif lain di kamar tersebut, memastikan masa sewa antara 1–12 bulan (BR-02), dan mengecek apakah KTP penyewa sudah diverifikasi (BR-03).
* Jika ada dua pengelola yang menekan tombol aktivasi bersamaan untuk kamar yang sama (*concurrency*), database PostgreSQL akan mengunci proses tersebut sehingga hanya satu kontrak yang berhasil aktif, sedangkan proses satunya otomatis ditolak dengan pesan error yang jelas.

### 5. Pencegahan Tagihan Ganda & Verifikasi Webhook Mayar (BR-05, BR-06)

* **Pencegahan Tagihan Ganda (*Double-Invoice Protection*):** Setiap kontrak hanya boleh punya satu tagihan per bulan (BR-05) dengan format nomor urut