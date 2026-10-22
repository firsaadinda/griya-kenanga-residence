# Dokumen Test Plan: Griya Kenanga Residence

> **Aplikasi**: 05. Manajemen Properti - Griya Kenanga Residence  
> **Tanggal Acuan Data**: 15 Oktober 2026  
> **Standar Status Code**: 200 (Berhasil), 400 (Data Salah/Kurang), 401 (Belum Login), 403 (Tidak Berhak), 404 (Tidak Ditemukan), 429 (Spam/Rate Limit), 500 (Server Error)  
> **Kata Sandi Akun Uji**: `Latihan#2026`  

---

## 1. Lingkup dan Metodologi Pengujian

Pengujian ini mencakup verifikasi menyeluruh terhadap 12 Aturan Bisnis (**BR-01** s/d **BR-12**), 10 Kebutuhan Pengguna (**US-01** s/d **US-10**), kasus batas pada tanggal acuan **15 Oktober 2026**, uji operasi bersamaan (*concurrency*), proteksi rate limit (*debounce* / 429), dan proteksi hak akses URL langsung (*Direct URL Access* 401 vs 403).

### Catatan Autentikasi & Konfirmasi Akun Uji:
Seluruh **25 akun uji** (1 Pemilik, 2 Pengelola, dan 22 Penyewa) telah sukses disinkronkan dan diuji login ulang ke dalam sistem Supabase Auth menggunakan kata sandi seragam baru:
```
Latihan#2026
```
Hasil pengujian autentikasi otomatis massal membuktikan **25 dari 25 akun uji (100%)** berhasil login dengan status **PASSED**, tanpa penolakan kredensial maupun kendala sesi.

---

## 2. Matriks Kasus Uji (Test Cases)

| Kode | Rujukan | Akun Uji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
|:---:|:---:|:---:|---|---|---|:---:|
| **TC-01** | BR-03, US-02, US-03 | `fajar.nugroho@gmail.com` & `bayu.prasetyo@gmail.com` | 1. Bayu mencoba mengaktifkan kontrak draf C-307 milik Fajar sebelum identitas diverifikasi.<br>2. Bayu memverifikasi identitas Fajar (NIK, foto KTP, kontak darurat).<br>3. Bayu mengaktifkan kembali kontrak draf melalui dialog konfirmasi eksplisit. | 1. Aktivasi ditolak dengan HTTP 400 (*"Identitas penyewa belum diverifikasi"*).<br>2. Verifikasi sukses HTTP 200.<br>3. Kontrak berubah jadi `aktif` dengan HTTP 200. | Sesuai. Server Action menolak aktivasi saat verifikasi='belum' (HTTP 400). Setelah verifikasi identitas, aktivasi sukses dan tercatat di audit log. | **PASSED** |
| **TC-02** | BR-01, US-03 | `bayu.prasetyo@gmail.com` | Bayu mencoba membuat kontrak baru untuk Unit C-307 dengan periode 1 Nov 2026 s/d 30 Apr 2027 (periode yang sama dengan kontrak draf Fajar). | Sistem menolak pembuatan kontrak dengan HTTP 400 (*"Unit sudah memiliki kontrak pada periode tersebut"*). Tidak terjadi *double booking*. | Sesuai. Query tumpang tindih mendeteksi bentrok jadwal tanggal mulai dan selesai unit C-307, form menampilkan alert HTTP 400. | **PASSED** |
| **TC-03** | BR-01, BR-03 | `cahya.ramadhan@gmail.com` & `bayu.prasetyo@gmail.com` | Cahya memiliki kontrak aktif di Unit A-103 berakhir 31 Okt 2026. Draf perpanjangan dibuat mulai 1 Nov 2026. Bayu mencoba mengaktifkan draf perpanjangan pada 15 Okt 2026. | Aktivasi ditolak dengan HTTP 400 (*"Penyewa masih memiliki kontrak aktif berjalan. Perpanjangan baru bisa diaktifkan setelah kontrak lama selesai"*). | Sesuai. Validasi kontrak aktif berjalan mencegah aktivasi prematur sebelum kontrak lama berakhir (HTTP 400). | **PASSED** |
| **TC-04** | BR-04 | `bayu.prasetyo@gmail.com` | Bayu mencoba membuat kontrak baru pada:<br>a. Unit B-205 (status: `perbaikan`).<br>b. Unit A-108 (status: `nonaktif`). | Sistem menolak pembuatan kontrak pada kedua unit dengan HTTP 400 (*"Kontrak hanya dapat dibuat untuk unit yang berstatus tersedia"*). | Sesuai. Dropdown unit hanya memvalidasi unit berstatus `tersedia`. Percobaan payload langsung pada unit B-205 dan A-108 ditolak dengan HTTP 400. | **PASSED** |
| **TC-05** | BR-07, US-05 | `dimas.saputra@gmail.com` & `bayu.prasetyo@gmail.com` | Pada 15 Okt 2026, Bayu membuka tagihan Oktober Dimas (jatuh tempo 10 Okt 2026, telat 5 hari) dan mencatat pelunasan tunai. | Sistem otomatis menghitung denda keterlambatan 5 hari x Rp20.000 = Rp100.000. Total tagihan bertambah denda dan status menjadi `lunas` dengan HTTP 200. | Sesuai. Perhitungan denda per 15 Oktober menghasilkan Rp100.000. Pelunasan dicatat tunai, status tagihan berubah lunas (HTTP 200). | **PASSED** |
| **TC-06** | BR-07, US-05 | `hana.puspita@gmail.com` & `bayu.prasetyo@gmail.com` | Pada 15 Okt 2026, Bayu mencatat pelunasan tagihan September Hana (status `sebagian` sejak 8 Sep, telat > 30 hari). | Sistem menghitung denda dan menguncinya tepat pada batas maksimum Rp200.000 (tidak melebihi plafon) dengan HTTP 200. | Sesuai. Rumus `LEAST(hari_telat * 20000, 200000)` mengunci denda tepat pada Rp200.000. Pelunasan berhasil (HTTP 200). | **PASSED** |
| **TC-07** | BR-07 | `raka.aditama@gmail.com` | Memeriksa riwayat tagihan Agustus Raka yang dibayar telat 15 hari dari jatuh tempo 10 Agustus. | Denda tercatat tetap Rp200.000, bukan Rp300.000 (patuh terhadap batas maksimal BR-07). Status HTTP 200. | Sesuai. Database dan UI tagihan Agustus Raka menampilkan denda Rp200.000 sesuai batas plafon BR-07. | **PASSED** |
| **TC-08** | BR-07 | `vina.rahmawati@gmail.com` & `bella.safitri@gmail.com` | Membandingkan perhitungan denda:<br>a. Vina membayar tagihan tepat 10 Okt 2026.<br>b. Bella membayar tagihan pada 11 Okt 2026 (telat 1 hari). | a. Tagihan Vina denda Rp0 (HTTP 200).<br>b. Tagihan Bella dikenai denda Rp20.000 (HTTP 200). Pembayaran tepat tanggal 10 belum dikenakan denda. | Sesuai. Grace period sampai tanggal 10 bebas denda. Pembayaran tanggal 11 menghasilkan denda 1 x Rp20.000 = Rp20.000. | **PASSED** |
| **TC-09** | BR-11, US-07 | `dimas.saputra@gmail.com` | Dimas (memiliki 3 laporan kerusakan berstatus terbuka: dilaporkan/diproses/menunggu) mencoba mengirim laporan kerusakan ke-4 dengan melampirkan 2 foto JPG. | Pengiriman ditolak dengan HTTP 400 (*"Batas maksimal 3 laporan terbuka tercapai. Tunggu laporan sebelumnya selesai dan ditutup"*). | Sesuai. Function / Action memverifikasi jumlah laporan berstatus bukan `ditutup`/`ditolak`. Laporan ke-4 ditolak dengan HTTP 400. | **PASSED** |
| **TC-10** | BR-12, US-08, US-09 | `oki.firmansyah@gmail.com`, `dimas.saputra@gmail.com`, & `bayu.prasetyo@gmail.com` | a. Bayu memproses laporan LK-2026-0012 (Oki) dengan estimasi Rp1.000.000.<br>b. Bayu memproses laporan LK-2026-0010 (Dimas) dengan estimasi Rp1.250.000. | a. LK-2026-0012 langsung berubah ke status `diproses` tanpa persetujuan (HTTP 200).<br>b. LK-2026-0010 otomatis dialihkan ke status `menunggu persetujuan` Pemilik (HTTP 200). Pengelola tidak bisa langsung memproses perbaikan > Rp1.000.000. | Sesuai. Logika threshold Rp1.000.000 mengarahkan LK-2026-0010 ke `menunggu_persetujuan` dengan tombol aksi persetujuan khusus Pemilik. | **PASSED** |
| **TC-11** | BR-12 | `bayu.prasetyo@gmail.com` | a. Bayu mencoba menutup LK-2026-0005 (selesai 10 Okt 2026, sudah 5 hari).<br>b. Bayu mencoba menutup LK-2026-0006 (selesai 14 Okt 2026, baru 1 hari). | a. LK-2026-0005 berhasil ditutup oleh Pengelola karena sudah lewat 3 hari (HTTP 200).<br>b. LK-2026-0006 ditolak dengan HTTP 403 (*"Hanya penyewa pelapor yang dapat menutup laporan sebelum 3 hari"*). | Sesuai. Proteksi waktu 3 hari divalidasi. Sebelum 3 hari ditolak (HTTP 403), setelah lewat 3 hari dapat ditutup oleh Pengelola (HTTP 200). | **PASSED** |
| **TC-12** | BR-11, US-07 | `gilang.mahendra@gmail.com` | Gilang (kontrak telah diakhiri pada 30 Sep 2026 dan identitas ditolak) mencoba mengakses form dan mengirim laporan kerusakan. | Sistem menolak pengiriman dengan HTTP 403 / 400 (*"Hanya penyewa dengan kontrak aktif yang berhak membuat laporan kerusakan"*). | Sesuai. Form input dan Server Action memvalidasi adanya kontrak berstatus `aktif`. Gilang ditolak dengan HTTP 403. | **PASSED** |
| **TC-13** | BR-01, US-03 (Concurrency) | `bayu.prasetyo@gmail.com` & `sinta.maharani@gmail.com` | Bayu dan Sinta secara bersamaan (pada detik yang sama) menekan tombol submit untuk membuat kontrak pada Unit A-106 yang kosong untuk periode 1 Nov 2026. | Transaksi database Supabase / Postgres constraint mengunci unit: 1 pengelola berhasil (HTTP 200), pengelola lainnya menerima error bentrok jadwal (HTTP 400 / Conflict). Unit tidak terpesan ganda. | Sesuai. PostgreSQL exclusion/transaction check mencegah pemesanan ganda. Hanya 1 kontrak yang berhasil dibuat. | **PASSED** |
| **TC-14** | BR-08, US-05 (Concurrency) | `bayu.prasetyo@gmail.com` & `sinta.maharani@gmail.com` | Bayu dan Sinta bersamaan mencatat cicilan pembayaran pada tagihan dengan sisa Rp500.000, masing-masing memasukkan Rp400.000. | Database atomic update / function memvalidasi sisa: pembayaran pertama berhasil mengurangi sisa jadi Rp100.000 (HTTP 200), pembayaran kedua ditolak karena Rp400.000 > sisa Rp100.000 (HTTP 400). | Sesuai. Server action melakukan validasi sisa secara atomik; pembayaran kedua ditolak dengan HTTP 400 karena melebihi sisa berjalan. | **PASSED** |
| **TC-15** | BR-06, US-04 (Anti-Spam / Rate Limit) | `bayu.prasetyo@gmail.com` | Bayu mengklik tombol "Buat Tagihan Bulanan" berkali-kali secara cepat (5 kali dalam 1 detik). | Request pertama diproses membuat tagihan bernomor urut (HTTP 200). Klik bertubi-tubi berikutnya diblokir oleh debounce client / rate limit dengan pesan ramah HTTP 429. Tidak ada nomor invoice yang dobel atau melompat. | Sesuai. Tombol langsung disabled (`isPending`) dengan spinner `<Loader2>`, dan rate limiter di action mengembalikan HTTP 429 jika ada flooding. | **PASSED** |
| **TC-16** | BR-08 | `bayu.prasetyo@gmail.com` | Bayu mencatat pembayaran cicilan tagihan sebesar Rp50.000 (di mana sisa tagihan masih Rp800.000). | Sistem menolak pencatatan dengan HTTP 400 (*"Pembayaran cicilan minimal Rp100.000 kecuali untuk pelunasan sisa akhir"*). | Sesuai. Validasi BR-08 menolak nominal cicilan di bawah Rp100.000 dengan HTTP 400, kecuali jika sisa tagihan memang < Rp100.000. | **PASSED** |
| **TC-17** | BR-10, KNF-3 (Direct URL - Unauthenticated) | Pengguna Anonim (Belum Login) | Pengguna langsung membuka URL internal browser:<br>a. `/dashboard`<br>b. `/dashboard/laporan`<br>c. Request GET `/api/status-test` tanpa token. | a & b. Next.js Proxy/Middleware langsung me-redirect ke `/login?callbackUrl=...` (HTTP 401).<br>c. Endpoint API mengembalikan respons JSON 401 Unauthorized. | Sesuai. Route guard dan middleware me-redirect user anonim ke `/login` (HTTP 401). API merespons HTTP 401. | **PASSED** |
| **TC-18** | BR-10, US-10 (Direct URL - Role Forbidden) | `bayu.prasetyo@gmail.com` & `jihan.aulia@gmail.com` | a. Bayu (Pengelola) langsung membuka URL `/dashboard/laporan`.<br>b. Jihan (Penyewa) membuka URL `/dashboard/unit` atau API ubah harga. | Akses ditolak dengan HTTP 403 Forbidden (*"Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman atau data ini"*). Pengelola & Penyewa dilarang melihat laporan pendapatan Pemilik. **Status 401 dan 403 tidak tertukar.** | Sesuai. Halaman `/dashboard/laporan` secara tegas me-render halaman 403 Forbidden jika diakses oleh Pengelola/Penyewa. | **PASSED** |
| **TC-19** | BR-10, KNF-4 | `ratna.griyakenanga@gmail.com` | Ratna (Pemilik) membuka daftar data penyewa pada halaman Penyewa. | NIK penyewa disamarkan secara otomatis (hanya menampilkan 4 digit terakhir: `****-****-****-1234`). Tautan foto KTP menggunakan signed URL privat sementara dan tidak dapat diakses publik. HTTP 200. | Sesuai. Query untuk Pemilik menyamarkan NIK menjadi `****-****-****-XXXX`, alamat/kontak disembunyikan, dan akses foto KTP dibatasi khusus Pengelola. | **PASSED** |
| **TC-20** | Bagian 11 (Payment Gateway Idempotency) | Sistem Mayar Webhook & `vina.rahmawati@gmail.com` | 1. Vina klik "Bayar Online", invoice Mayar sandbox terbuat (HTTP 200).<br>2. Webhook `payment.received` dikirim oleh Mayar.<br>3. Webhook yang sama dikirim ulang (jaringan retry). | 1. Tautan invoice Mayar berhasil dibuat (HTTP 200).<br>2. Pembayaran tercatat dengan metode `mayar` dan status tagihan berubah `lunas` (HTTP 200).<br>3. Webhook kedua dideteksi idempoten sehingga pembayaran tidak dicatat dobel (HTTP 200 / diabaikan). | Sesuai. Endpoint `/api/webhook/mayar` memvalidasi referensi transaksi; request berulang menghasilkan respons 200 IDEMPOTENT tanpa mendobelkan saldo. | **PASSED** |

---

## 3. Checklist 15 Kriteria Selesai (PRD Bagian 13)

Berikut adalah status pemenuhan 15 Kriteria Selesai PRD Bagian 13 setelah verifikasi implementasi dan audit sistem:

| No | Kriteria Selesai (PRD Bagian 13) | Rincian Spesifikasi | Status Verifikasi |
|:---:|---|---|:---:|
| 1 | **Autentikasi & Registrasi 3 Peran** | Login berfungsi untuk Pemilik, Pengelola, dan Penyewa (`Latihan#2026`). Registrasi mandiri hanya untuk peran Penyewa. Redirection otomatis ke dashboard yang tepat. | **LOLOS (100%)** |
| 2 | **Otorisasi Berbasis Peran (RBAC)** | Hak akses unit, kontrak, tagihan, kerusakan, dan laporan terisolasi per peran. URL langsung tanpa hak menghasilkan respons HTTP 403 Forbidden (tidak tertukar dengan 401). | **LOLOS (100%)** |
| 3 | **Manajemen Unit Properti** | 24 unit visual ditampilkan lengkap dengan status (tersedia, terisi, perbaikan, nonaktif). Pengelola dapat mengubah status, hanya Pemilik yang berhak mengubah harga sewa bulanan. | **LOLOS (100%)** |
| 4 | **Manajemen Penyewa & Verifikasi Identitas** | Penyewa dapat melengkapi NIK 16 digit, alamat asal, kontak darurat, dan foto KTP. Pengelola memverifikasi atau menolak dengan alasan. NIK disamarkan untuk Pemilik. | **LOLOS (100%)** |
| 5 | **Siklus Hidup Kontrak Sewa** | Pembuatan kontrak durasi 1, 3, 6, 12 bulan; penomoran otomatis `KTR-YYYY-NNNN`. Aktivasi wajib verifikasi identitas (BR-03). Validasi overlap unit (BR-01) dan batas aktif (BR-02). | **LOLOS (100%)** |
| 6 | **Tagihan Bulanan & Denda Otomatis** | Pembuatan tagihan massal tiap tanggal 1 (`INV-YYYYMM-NNNN`). Denda otomatis Rp20.000/hari mulai tanggal 11 dengan batas maksimal Rp200.000 (BR-07). | **LOLOS (100%)** |
| 7 | **Pencatatan & Pembatalan Pembayaran** | Pencatatan tunai dan transfer oleh Pengelola. Validasi cicilan minimal Rp100.000 (BR-08). Pembatalan pembayaran sah oleh Pengelola dengan input alasan wajib (BR-09). | **LOLOS (100%)** |
| 8 | **Integrasi Payment Gateway Mayar** | Pembayaran online penyewa via Mayar Sandbox. Webhook `payment.received` memproses pelunasan otomatis secara atomik dan idempoten (mencegah pencatatan ganda). | **LOLOS (100%)** |
| 9 | **Pelaporan & Penanganan Kerusakan** | Penyewa dapat melapor maksimal 3 laporan terbuka (BR-11). Estimasi > Rp1.000.000 wajib persetujuan Pemilik (BR-12). Penutupan tiket otomatis setelah 3 hari status selesai. | **LOLOS (100%)** |
| 10 | **Dashboard Beranda 3 Peran** | Desain Monte x Terra adaptif: 4 kartu ringkasan hunian (19/23 unit), 7 tagihan lewat jatuh tempo, 5 kerusakan terbuka, dan 5 kontrak perlu tindakan per 15 Oktober 2026. | **LOLOS (100%)** |
| 11 | **Laporan Keuangan & Hunian Pemilik** | Grafik tren pendapatan & hunian Agustus-Oktober 2026. Tabel pendapatan 24 unit lengkap dengan sort default `tunggakan DESC, ditagihkan DESC` dan ekspor CSV 24 unit. | **LOLOS (100%)** |
| 12 | **Audit Log Transparan & Tersanitasi** | Seluruh aksi mutasi tercatat (pelaku, peran, aksi, tabel, data_id, sebelum, sesudah, timestamp). Data sensitif NIK dan foto KTP tersanitasi otomatis sebelum disimpan. | **LOLOS (100%)** |
| 13 | **Presisi Data Contoh Database (PRD Bagian 12)** | Tepat 24 unit, 23 kontrak, 57 tagihan (Agustus-Oktober 2026), 55 pembayaran, 13 laporan kerusakan, dan nomor urut KTR 2026 kembali ke urutan 23. | **LOLOS (100%)** |
| 14 | **Penanganan Error & Alerting (7 Kode HTTP)** | Pemetaan visual AlertBanner untuk 7 kode status HTTP (200, 400, 401, 403, 404, 429, 500) dengan pesan bahasa Indonesia informatif dan proteksi debouncing tombol. | **LOLOS (100%)** |
| 15 | **Kesiapan Industri Level 4 (UI/UX & Accessibility)** | Transisi halaman natural ala Next.js tanpa kedipan skeleton abu-abu, spinner `<Loader2>` pada seluruh tombol aksi saat `isPending`, dialog konfirmasi eksplisit pada seluruh aksi sensitif, dan empty state informatif. | **LOLOS (100%)** |

---

## 4. Riwayat Temuan Bug & Perbaikan (Debugging Log)

Selama audit kepatuhan industri Level 4 dan pengujian regresi, ditemukan beberapa celah operasional yang telah diselesaikan secara tuntas:

### 1. Sanitasi Data Sensitif pada Audit Log (Privasi & Keamanan)
- **Temuan**: Saat mencatat perubahan data identitas penyewa atau pembuatan pengguna baru, objek `sebelum` dan `sesudah` pada tabel `audit_log` berpotensi menyimpan NIK 16 digit dan link foto KTP secara mentah (*unmasked*).
- **Solusi**: Diterapkan fungsi sanitasi payload `sanitizeAuditPayload()` di level trigger database PostgreSQL dan server action sehingga NIK selalu disamarkan menjadi `****-****-****-XXXX` dan referensi foto KTP diganti menjadi `[PROTECTED_FILE]`. Baris audit log historis telah dibersihkan secara retroaktif.

### 2. Urutan Sekunder Tabel Pendapatan per Unit & Cakupan Ekspor CSV
- **Temuan**: Tabel Pendapatan per Unit pada halaman Laporan Pemilik (`/dashboard/laporan`) sebelumnya hanya mengurutkan berdasarkan `tunggakan DESC`. Ketika beberapa unit memiliki tunggakan Rp0, urutan baris ke-7 s.d. ke-9 menjadi tidak deterministik dan tidak mencocoki Wireframe Hal 4 (C-302 Rp8.450.000, C-301 Rp8.400.000, C-305 Rp7.950.000). Selain itu, tombol "Unduh CSV" awalnya hanya mengekspor 9 baris yang sedang tampil di layar.
- **Solusi**: Diperbarui logika pengurutan menjadi `tunggakan DESC, ditagihkan DESC`. Tombol "Unduh CSV" diperbaiki agar selalu mengekspor seluruh 24 unit properti lengkap beserta metrik total pendapatan dan tunggakannya.

### 3. Penambahan Dialog Konfirmasi Eksplisit pada Seluruh Aksi Sensitif
- **Temuan**: Beberapa aksi permanen dan berdampak hukum (seperti aktivasi kontrak draf menjadi aktif, pembatalan kontrak, penyelesaian kontrak, pembuatan tagihan massal bulanan, persetujuan biaya kerusakan > Rp1.000.000, penutupan tiket, dan perubahan peran pengguna) dapat terpicu secara tidak sengaja hanya dengan 1 kali klik tanpa konfirmasi.
- **Solusi**: Ditambahkan modal dialog konfirmasi eksplisit dengan gaya Monte x Terra di:
  - `KontrakClientView.tsx`: Dialog konfirmasi aktivasi kontrak, pembatalan kontrak draf, dan penyelesaian kontrak berjalan.
  - `TagihanClientView.tsx`: Dialog konfirmasi pembuatan tagihan bulanan massal dan pembatalan tagihan tanpa pembayaran (BR-09).
  - `KerusakanClientView.tsx`: Dialog konfirmasi persetujuan estimasi perbaikan > Rp1.000.000 (khusus Pemilik) dan penutupan laporan kerusakan.
  - `LaporanClientView.tsx`: Dialog peringatan dampak izin hak akses sebelum mengubah peran pengguna di tab Pengaturan.

### 4. Penyediaan Komponen Empty State Informatif
- **Temuan**: Saat pengguna melakukan pencarian atau filtering status yang tidak menghasilkan baris data, tampilan tabel menjadi kosong mendadak tanpa panduan visual.
- **Solusi**: Dibuat komponen modular `src/components/feedback/EmptyState.tsx` dengan ikon relevan, judul, dan pesan instruktif, kemudian diintegrasikan ke `KontrakClientView.tsx`, `UnitClientView.tsx`, `PenyewaClientView.tsx`, dan `KerusakanClientView.tsx`.

### 5. Transisi Halaman Natural & Spinner Tombol Tindakan
- **Temuan**: Tombol aksi sebelumnya belum memiliki feedback visual spinner yang seragam saat proses async berjalan sehingga rawan memicu double-click.
- **Solusi**: Diterapkan transisi halaman natural ala Next.js di mana konten halaman sebelumnya tetap bertahan bersih hingga data halaman baru siap tampil secara instan (tanpa kedipan/flicker skeleton abu-abu). Seluruh tombol aksi di semua modul dilengkapi dengan `<Loader2 className="animate-spin" />` dan atribut `disabled={isPending}` guna mencegah *double-click/spamming*.

### 6. Standardisasi AlertBanner dengan 7 Kode Status HTTP
- **Temuan**: Format notifikasi alert pada beberapa modul sebelumnya masih menggunakan format sederhana `{ type: 'success' | 'error' }` yang belum terstandarisasi dengan kode status HTTP.
- **Solusi**: Seluruh modul (`TagihanClientView`, `KontrakClientView`, `KerusakanClientView`, `UnitClientView`, `PenyewaClientView`, `LaporanClientView`, dan `PenyewaHomeView`) diseragamkan menggunakan `AlertBanner.tsx` yang memetakan status code 200, 400, 401, 403, 404, 429, dan 500 lengkap dengan badge kode dan bahasa Indonesia yang ramah.

### 7. Reset dan Presisi Data Contoh Database Sesuai PRD Bagian 12
- **Temuan**: Setelah proses pengujian fungsional modul dan pembuatan tagihan uji, terdapat data kontrak uji `KTR-2026-0024`, tagihan uji coba November 2026 (16 baris), serta 3 data pembayaran pembatalan uji yang menyebabkan jumlah data tidak presisi dengan PRD Bagian 12.
- **Solusi**:
  - Dihapus kontrak uji `KTR-2026-0024` dan diset kembali `nomor_urut` KTR 2026 ke nilai `23`.
  - Dihapus 16 tagihan uji coba November 2026 beserta lognya, dan dihapus `nomor_urut` INV `202611`.
  - Dihapus 3 transaksi pembayaran uji sehingga total baris pembayaran kembali ke 55 baris sesuai seed.
  - Verifikasi query membuktikan data database saat ini: 24 unit, 23 kontrak, 57 tagihan (Agustus s.d. Oktober 2026), 55 pembayaran, dan 13 laporan kerusakan.

---

## 5. Rencana Kerja per Halaman & Matriks Eksekusi
- **Masuk & Daftar (`/login`, `/register`)**: Form auth, registrasi mandiri otomatis peran Penyewa.
- **Beranda (`/dashboard`)**: Dashboard operasional adaptif 3 peran dengan status hunian, tagihan jatuh tempo, dan laporan kerusakan terbuka.
- **Unit (`/dashboard/unit`)**: Visualisasi 24 unit, status ubah oleh Pengelola, harga ubah oleh Pemilik.
- **Penyewa (`/dashboard/penyewa`)**: Verifikasi identitas oleh Pengelola, penyamaran NIK untuk Pemilik.
- **Kontrak (`/dashboard/kontrak`)**: Siklus hidup kontrak, aktivasi syarat identitas terverifikasi, pengakhiran awal oleh Pemilik.
- **Tagihan (`/dashboard/tagihan`)**: Pembuatan massal, pembayaran tunai/transfer/Mayar, denda otomatis.
- **Kerusakan (`/dashboard/kerusakan`)**: Laporan 1-3 foto, limit 3 laporan terbuka, approval > Rp1.000.000 oleh Pemilik.
- **Laporan (`/dashboard/laporan`)**: Grafik pendapatan & hunian, ekspor CSV pendapatan, audit log viewer, pengaturan peran (khusus Pemilik).
