import fs from "fs";
import path from "path";

// Cache Base64 gambar wajah dalam memori agar responsif dan cepat
const photoBase64Cache = new Map<string, string>();

function getTenantPhotoBase64(filename: string): string {
  if (photoBase64Cache.has(filename)) {
    return photoBase64Cache.get(filename)!;
  }
  try {
    const filePath = path.join(process.cwd(), "public", "ktp-faces", filename);
    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      const b64 = `data:image/jpeg;base64,${buf.toString("base64")}`;
      photoBase64Cache.set(filename, b64);
      return b64;
    }
  } catch (err) {
    console.error(`Gagal membaca foto ktp-faces/${filename}:`, err);
  }
  return "";
}

// Daftar pemetaan 22 penyewa tetap Griya Kenanga Residence
// 9 Wanita (w_0 s/d w_8) dan 13 Pria (m_0 s/d m_12)
const tenantPhotoRegistry: Record<string, { photoIdx: number; isFemale: boolean }> = {
  // 9 Wanita
  "bella safitri": { photoIdx: 0, isFemale: true },
  "eka wulandari": { photoIdx: 1, isFemale: true },
  "hana puspita": { photoIdx: 2, isFemale: true },
  "jihan aulia": { photoIdx: 3, isFemale: true },
  "laras anggraini": { photoIdx: 4, isFemale: true },
  "nadia salsabila": { photoIdx: 5, isFemale: true },
  "putri lestari": { photoIdx: 6, isFemale: true },
  "salma nuraini": { photoIdx: 7, isFemale: true },
  "vina rahmawati": { photoIdx: 8, isFemale: true },

  // 13 Pria
  "aditya pratama": { photoIdx: 0, isFemale: false },
  "cahya ramadhan": { photoIdx: 1, isFemale: false },
  "dimas saputra": { photoIdx: 2, isFemale: false },
  "fajar nugroho": { photoIdx: 3, isFemale: false },
  "gilang mahendra": { photoIdx: 4, isFemale: false },
  "indra kurniawan": { photoIdx: 5, isFemale: false },
  "kevin wijaya": { photoIdx: 6, isFemale: false },
  "muhammad rizki": { photoIdx: 7, isFemale: false },
  "oki firmansyah": { photoIdx: 8, isFemale: false },
  "raka aditama": { photoIdx: 9, isFemale: false },
  "teguh santoso": { photoIdx: 10, isFemale: false },
  "wahyu hidayat": { photoIdx: 11, isFemale: false },
  "yoga permana": { photoIdx: 12, isFemale: false },
};

const femaleKeywords = [
  "bella", "eka", "hana", "jihan", "laras", "nadia", "putri", "salma",
  "vina", "sinta", "ratna", "mira", "ayu", "lestari", "wulandari",
  "safitri", "aulia", "anisa", "nur", "dewi", "pertiwi", "dian"
];

// Koleksi tanda tangan tangan tinta basah yang unik per inisial nama
function getSignatureSvgPath(nama: string): string {
  const cleanName = nama.trim();
  const initial = (cleanName.charAt(0) || "A").toUpperCase();

  switch (initial) {
    case "A":
      // Aditya Pratama: Bentuk A dengan tarikan diagonal tajam & garis penutup
      return `<path d="M 8 36 L 24 6 L 40 36 M 14 24 L 34 24 M 30 20 C 44 10, 58 14, 62 26 C 66 36, 48 38, 42 30 C 35 22, 45 12, 58 18 L 72 35" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 4 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "B":
      // Bella Safitri: Bentuk B ganda dengan lengkungan lembut & underline
      return `<path d="M 10 6 L 10 36 M 10 6 C 24 5, 34 12, 26 20 C 36 20, 42 30, 28 36 L 10 36 M 26 20 C 42 14, 58 18, 62 28 C 65 38, 50 36, 44 26 L 68 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 38 L 76 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="70" cy="30" r="1.5" fill="#0B1320"/>`;
    case "C":
      // Cahya Ramadhan: Bentuk C besar melengkung dengan loop tengah
      return `<path d="M 38 10 C 24 4, 8 16, 12 28 C 16 42, 36 38, 44 26 C 50 18, 58 22, 62 32 L 74 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 36 L 78 34" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "D":
      // Dimas Saputra: Bentuk D tegak dengan perut bulat besar
      return `<path d="M 12 6 L 12 36 M 12 6 C 36 6, 46 18, 38 30 C 30 40, 12 38, 12 36 M 34 22 C 48 16, 62 18, 66 28 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "E":
      // Eka Wulandari: Bentuk E kaligrafi bersusun melengkung
      return `<path d="M 32 8 C 18 6, 10 16, 14 24 C 24 20, 32 22, 26 30 C 20 38, 10 36, 14 36 C 24 36, 46 30, 56 22 L 72 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 38 L 78 36" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "F":
      // Fajar Nugroho: Bentuk F dengan tiang tegak dan garis horizontal tegas
      return `<path d="M 10 8 L 34 8 M 14 8 L 14 36 M 12 22 L 28 22 M 24 22 C 38 12, 54 18, 58 28 L 72 35" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 76 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "G":
      // Gilang Mahendra: Bentuk G melingkar dengan ekor menyilang ke bawah
      return `<path d="M 36 10 C 22 5, 8 16, 12 30 C 16 42, 36 38, 36 24 L 22 24 M 32 28 C 44 20, 58 22, 64 32 L 78 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 36 L 80 34" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "H":
      // Hana Puspita: Bentuk H dengan dua tiang dan jembatan melingkar
      return `<path d="M 10 6 L 10 36 M 26 6 L 26 36 M 10 20 L 26 20 M 26 20 C 38 10, 54 16, 58 26 C 60 36, 46 36, 42 26 L 70 35" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "I":
      // Indra Kurniawan: Bentuk I elegan dengan serif dan swirl akhir
      return `<path d="M 16 6 L 16 36 M 10 6 L 22 6 M 10 36 L 22 36 M 18 22 C 30 12, 48 14, 55 24 C 60 34, 46 36, 42 28 L 74 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "J":
      // Jihan Aulia: Bentuk J meluncur ke bawah dengan kait ekor panjang
      return `<path d="M 10 8 L 28 8 M 22 8 L 22 28 C 22 38, 10 38, 8 30 M 22 20 C 34 10, 50 14, 56 24 L 74 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 4 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "K":
      // Kevin Wijaya: Bentuk K tegas dengan dua sayap diagonal
      return `<path d="M 12 5 L 12 36 M 30 8 L 14 22 L 32 36 M 22 22 C 36 12, 54 15, 60 25 L 74 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "L":
      // Laras Anggraini: Bentuk L halus dengan tarikan horizontal memanjang
      return `<path d="M 14 6 L 14 34 L 34 34 M 25 24 C 38 14, 55 16, 62 26 C 66 36, 50 36, 46 26 L 75 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "M":
      // Muhammad Rizki: Bentuk M bergelombang dengan puncak kembar
      return `<path d="M 8 36 L 8 8 L 20 28 L 32 8 L 32 36 M 32 24 C 44 14, 60 16, 66 26 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 4 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "N":
      // Nadia Salsabila: Bentuk N bersudut dengan garis sambung meliuk
      return `<path d="M 10 36 L 10 8 L 30 36 L 30 8 M 30 22 C 42 12, 58 14, 64 24 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 4 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "O":
      // Oki Firmansyah: Bentuk O elips ganda berputar
      return `<path d="M 22 8 C 10 8, 8 22, 10 30 C 14 40, 32 38, 34 24 C 36 12, 28 8, 22 8 M 32 24 C 45 14, 62 16, 68 26 L 78 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "P":
      // Putri Lestari: Bentuk P dengan tiang turun dan lengkungan atas rapi
      return `<path d="M 12 6 L 12 36 M 12 6 C 32 6, 36 18, 24 22 L 12 22 M 22 22 C 36 14, 54 16, 62 26 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "R":
      // Raka Aditama: Bentuk R dengan loop atas dan tendangan diagonal bawah
      return `<path d="M 12 6 L 12 36 M 12 6 C 30 6, 34 18, 22 22 L 12 22 M 20 22 L 32 36 M 28 22 C 42 14, 58 16, 65 26 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "S":
      // Salma Nuraini: Bentuk S spiral melingkar halus
      return `<path d="M 32 10 C 22 6, 12 12, 14 20 C 16 28, 34 26, 32 34 C 30 40, 16 40, 12 34 M 30 24 C 44 14, 60 16, 66 26 L 78 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "T":
      // Teguh Santoso: Bentuk T dengan atap datar lebar dan tiang tengah
      return `<path d="M 8 8 L 36 8 M 22 8 L 22 36 M 22 24 C 36 14, 54 16, 62 26 C 66 36, 50 36, 46 26 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 78 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "V":
      // Vina Rahmawati: Bentuk V bersudut tajam dengan ekor anggun
      return `<path d="M 10 8 L 22 36 L 34 8 M 30 22 C 42 12, 58 14, 65 24 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "W":
      // Wahyu Hidayat: Bentuk W dengan tiga lembah dinamis
      return `<path d="M 6 8 L 14 36 L 22 18 L 30 36 L 38 8 M 34 22 C 46 12, 62 14, 68 24 L 78 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 4 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    case "Y":
      // Yoga Permana: Bentuk Y dengan batang bercabang dan loop bawah
      return `<path d="M 10 8 L 20 24 L 30 8 M 20 24 L 20 40 C 20 46, 12 44, 10 38 M 22 22 C 36 12, 54 14, 62 24 L 76 34" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 6 37 L 80 35" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
    default:
      // Tanda tangan default umum yang elegan
      return `<path d="M 8 2 L 8 36 M 3 8 L 13 8 M 8 22 C 16 6, 32 6, 36 18 C 40 28, 26 32, 18 25 C 13 18, 22 10, 32 14 L 42 32 C 48 32, 56 26, 58 16 C 60 8, 48 10, 46 20 C 44 28, 58 30, 66 22" fill="none" stroke="#0B1320" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 0 34 L 70 32" fill="none" stroke="#0B1320" stroke-width="1.8" stroke-linecap="round"/>`;
  }
}

export interface KtpParams {
  nik: string;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  tempatTglLahir?: string;
  jenisKelamin?: "LAKI-LAKI" | "PEREMPUAN";
  golDarah?: string;
  rtRw?: string;
  kelDesa?: string;
  kecamatan?: string;
  agama?: string;
  statusPerkawinan?: string;
  pekerjaan?: string;
  kewarganegaraan?: string;
  berlakuHingga?: string;
}

export function generateKtpSvg(params: KtpParams): string {
  const nik = (params.nik || "3171234567890123").replace(/[^0-9]/g, "").padEnd(16, "0").slice(0, 16);
  const rawNama = params.nama || "WARGA NEGARA INDONESIA";
  const nama = rawNama.toUpperCase();
  const namaKey = rawNama.toLowerCase().trim();

  // 1. Deteksi Gender & Profil Penyewa
  let isFemale = false;
  let photoIdx = 0;

  if (tenantPhotoRegistry[namaKey]) {
    isFemale = tenantPhotoRegistry[namaKey].isFemale;
    photoIdx = tenantPhotoRegistry[namaKey].photoIdx;
  } else if (params.jenisKelamin) {
    isFemale = params.jenisKelamin === "PEREMPUAN";
    let hash = 0;
    for (let i = 0; i < namaKey.length; i++) hash = (hash * 31 + namaKey.charCodeAt(i)) >>> 0;
    photoIdx = isFemale ? hash % 9 : hash % 13;
  } else {
    isFemale = femaleKeywords.some((kw) => namaKey.includes(kw));
    let hash = 0;
    for (let i = 0; i < namaKey.length; i++) hash = (hash * 31 + namaKey.charCodeAt(i)) >>> 0;
    photoIdx = isFemale ? hash % 9 : hash % 13;
  }

  const jenisKelamin = isFemale ? "PEREMPUAN" : "LAKI-LAKI";
  const golDarah = params.golDarah || (isFemale ? "B" : "O");

  // 2. Ekstraksi Tanggal & Tahun Lahir dari NIK Disdukcapil (DDMMYY)
  let birthDay = 18;
  let birthMonth = 2;
  let birthYear = 1996;

  if (nik && nik.length === 16) {
    let d = parseInt(nik.substring(6, 8), 10);
    const m = parseInt(nik.substring(8, 10), 10);
    const y = parseInt(nik.substring(10, 12), 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      if (d > 40) d = d - 40; // NIK perempuan tanggal lahir ditambah 40 oleh Disdukcapil
      birthDay = Math.min(Math.max(d, 1), 31);
      birthMonth = Math.min(Math.max(m, 1), 12);
      birthYear = y > 35 ? 1900 + y : 2000 + y;
    }
  }

  const ddStr = String(birthDay).padStart(2, "0");
  const mmStr = String(birthMonth).padStart(2, "0");
  const tglLahirStr = `${ddStr}-${mmStr}-${birthYear}`;

  // 3. Aturan Latar Belakang Resmi Disdukcapil:
  // - Tahun Lahir GANJIL = Latar MERAH (#BA1A1C)
  // - Tahun Lahir GENAP = Latar BIRU (#1A56A6)
  const isEvenBirthYear = birthYear % 2 === 0;
  const bgType = isEvenBirthYear ? "blue" : "red";
  const photoBgColorHex = isEvenBirthYear ? "#1A56A6" : "#BA1A1C";

  // Pilih file foto yang sesuai gender dan warna latar belakang
  const photoFilename = isFemale ? `w_${photoIdx}_${bgType}.jpg` : `m_${photoIdx}_${bgType}.jpg`;
  const fotoBase64 = getTenantPhotoBase64(photoFilename);

  // 4. Tanggal Pembuatan KTP Unik (Saat Warga Berusia 17 Tahun)
  const issuanceYear = birthYear + 17;
  // Offset beberapa hari setelah ulang tahun ke-17
  const issuanceDay = String(Math.min(birthDay + 4, 28)).padStart(2, "0");
  const tglPenerbit = `${issuanceDay}-${mmStr}-${issuanceYear}`;

  // 5. Wilayah Asal Berdasarkan Alamat
  const rawAlamat = params.alamat || "JL. PASTI CEPAT A7/66";
  const alamatUpper = rawAlamat.toUpperCase();

  let provinsi = params.provinsi || "PROVINSI DKI JAKARTA";
  let kota = params.kota || "JAKARTA BARAT";
  let rtRw = params.rtRw || "007/008";
  let kelDesa = params.kelDesa || "PEGADUNGAN";
  let kecamatan = params.kecamatan || "KALIDERES";
  let kotaPenerbit = "JAKARTA BARAT";
  let kotaLahir = "JAKARTA";

  if (alamatUpper.includes("BANDUNG")) {
    provinsi = "PROVINSI JAWA BARAT";
    kota = "KOTA BANDUNG";
    kotaLahir = "BANDUNG";
    rtRw = "004/009";
    kelDesa = "BABAKAN CIAMIS";
    kecamatan = "SUMUR BANDUNG";
    kotaPenerbit = "KOTA BANDUNG";
  } else if (alamatUpper.includes("SEMARANG")) {
    provinsi = "PROVINSI JAWA TENGAH";
    kota = "KOTA SEMARANG";
    kotaLahir = "SEMARANG";
    rtRw = "002/006";
    kelDesa = "LEMPONGSARI";
    kecamatan = "GAJAHMUNGKUR";
    kotaPenerbit = "KOTA SEMARANG";
  } else if (alamatUpper.includes("SLEMAN") || alamatUpper.includes("YOGYAKARTA") || alamatUpper.includes("JOGJA")) {
    provinsi = "PROVINSI D.I. YOGYAKARTA";
    kota = "KABUPATEN SLEMAN";
    kotaLahir = "SLEMAN";
    rtRw = "003/007";
    kelDesa = "CATURTUNGGAL";
    kecamatan = "DEPOK";
    kotaPenerbit = "SLEMAN";
  } else if (alamatUpper.includes("KEBUMEN")) {
    provinsi = "PROVINSI JAWA TENGAH";
    kota = "KABUPATEN KEBUMEN";
    kotaLahir = "KEBUMEN";
    rtRw = "005/002";
    kelDesa = "PANJER";
    kecamatan = "KEBUMEN";
    kotaPenerbit = "KEBUMEN";
  } else if (alamatUpper.includes("PURWOKERTO") || alamatUpper.includes("BANYUMAS")) {
    provinsi = "PROVINSI JAWA TENGAH";
    kota = "KABUPATEN BANYUMAS";
    kotaLahir = "PURWOKERTO";
    rtRw = "007/003";
    kelDesa = "KRANJI";
    kecamatan = "PURWOKERTO TIMUR";
    kotaPenerbit = "BANYUMAS";
  } else if (alamatUpper.includes("SURABAYA")) {
    provinsi = "PROVINSI JAWA TIMUR";
    kota = "KOTA SURABAYA";
    kotaLahir = "SURABAYA";
    rtRw = "008/004";
    kelDesa = "GUBENG";
    kecamatan = "GUBENG";
    kotaPenerbit = "KOTA SURABAYA";
  } else if (alamatUpper.includes("MAGELANG")) {
    provinsi = "PROVINSI JAWA TENGAH";
    kota = "KOTA MAGELANG";
    kotaLahir = "MAGELANG";
    rtRw = "003/005";
    kelDesa = "MAGELANG";
    kecamatan = "MAGELANG TENGAH";
    kotaPenerbit = "KOTA MAGELANG";
  } else if (alamatUpper.includes("KLATEN")) {
    provinsi = "PROVINSI JAWA TENGAH";
    kota = "KABUPATEN KLATEN";
    kotaLahir = "KLATEN";
    rtRw = "002/004";
    kelDesa = "KLATEN";
    kecamatan = "KLATEN TENGAH";
    kotaPenerbit = "KLATEN";
  }

  const tempatTglLahir = params.tempatTglLahir || `${kotaLahir}, ${tglLahirStr}`;
  const alamat = alamatUpper;
  const agama = params.agama || "ISLAM";
  const statusPerkawinan = params.statusPerkawinan || (birthYear < 2000 ? "KAWIN" : "BELUM KAWIN");
  const pekerjaan = params.pekerjaan || (birthYear >= 2003 ? "PELAJAR / MAHASISWA" : "PEGAWAI SWASTA");
  const kewarganegaraan = params.kewarganegaraan || "WNI";
  const berlakuHingga = params.berlakuHingga || "SEUMUR HIDUP";

  // 6. Tanda Tangan Unik Berdasarkan Nama Pemilik KTP
  const signaturePath = getSignatureSvgPath(rawNama);

  // SVG Presisi Kartu e-KTP Republik Indonesia Resmi (100% Cocok dengan Foto KTP Nyata)
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="760" height="500" viewBox="0 0 760 500">
  <defs>
    <!-- Background Bayangan Kartu Fisik Realistis -->
    <filter id="cardElevation" x="-15%" y="-15%" width="130%" height="135%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.24"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.14"/>
    </filter>

    <!-- Gradasi Biru Cyan Khas e-KTP Indonesia -->
    <linearGradient id="ktpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CBE5F6"/>
      <stop offset="35%" stop-color="#ADD7F1"/>
      <stop offset="70%" stop-color="#99CCE9"/>
      <stop offset="100%" stop-color="#84BDE0"/>
    </linearGradient>

    <!-- Pola Gelombang Keamanan Guilloche -->
    <pattern id="guillocheWaves" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 0 40 Q 20 15, 40 40 T 80 40" fill="none" stroke="#68A9D4" stroke-width="0.8" opacity="0.38"/>
      <path d="M 0 20 Q 20 45, 40 20 T 80 20" fill="none" stroke="#FFFFFF" stroke-width="0.6" opacity="0.45"/>
      <path d="M 0 60 Q 20 35, 40 60 T 80 60" fill="none" stroke="#5C9ECA" stroke-width="0.7" opacity="0.32"/>
      <circle cx="40" cy="40" r="30" fill="none" stroke="#7CB6DC" stroke-width="0.6" opacity="0.25"/>
    </pattern>

    <!-- Clip Path Sudut Membulat Kartu e-KTP -->
    <clipPath id="ktpCardClip">
      <rect x="35" y="32" width="690" height="436" rx="28" ry="28"/>
    </clipPath>

    <!-- Clip Path Pas Foto -->
    <clipPath id="ktpPhotoClip">
      <rect x="490" y="132" width="165" height="215" rx="3" ry="3"/>
    </clipPath>
  </defs>

  <!-- LATAR BELAKANG DINDING/MEJA BERTEKSTUR NETRAL -->
  <rect x="0" y="0" width="760" height="500" fill="#ECEEEF"/>

  <!-- KARTU FISIK e-KTP DENGAN ELEVASI BAYANGAN 3D -->
  <g filter="url(#cardElevation)">
    <rect x="35" y="32" width="690" height="436" rx="28" ry="28" fill="url(#ktpGrad)"/>
  </g>

  <!-- KONTEN DI DALAM KARTU DENGAN SUDUT MEMBULAT PRESISI -->
  <g clip-path="url(#ktpCardClip)">
    <!-- Pola Pengaman Guilloche Berulang -->
    <rect x="35" y="32" width="690" height="436" fill="url(#guillocheWaves)"/>

    <!-- WATERMARK RESMI e-KTP: BOLA DUNIA TERBAGI DUA (MERIDIAN & PARALEL) DI BAGIAN ATAS + PETA KEPULAUAN INDONESIA -->
    <g opacity="0.28" transform="translate(0, 0)">
      <!-- Lingkaran Luar Bola Dunia (Agak ke Atas) -->
      <ellipse cx="330" cy="130" rx="180" ry="165" fill="none" stroke="#226D9B" stroke-width="2.2"/>
      
      <!-- Garis Bujur Utama / Meridian Tengah (Membelah Dunia Jadi 2) -->
      <line x1="330" y1="-35" x2="330" y2="295" stroke="#226D9B" stroke-width="2.2"/>
      <line x1="330" y1="-35" x2="330" y2="295" stroke="#FFFFFF" stroke-width="1.0" opacity="0.6"/>

      <!-- Garis Bujur / Meridian Sebelah Kanan -->
      <path d="M 330 -35 C 390 40, 390 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.8"/>
      <path d="M 330 -35 C 445 40, 445 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.8"/>
      <path d="M 330 -35 C 495 40, 495 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.5"/>

      <!-- Garis Bujur / Meridian Sebelah Kiri -->
      <path d="M 330 -35 C 270 40, 270 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.8"/>
      <path d="M 330 -35 C 215 40, 215 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.8"/>
      <path d="M 330 -35 C 165 40, 165 220, 330 295" fill="none" stroke="#226D9B" stroke-width="1.5"/>

      <!-- Garis Lintang Khatulistiwa & Paralel (Melengkung) -->
      <path d="M 150 130 C 210 155, 450 155, 510 130" fill="none" stroke="#226D9B" stroke-width="2.0"/>
      <path d="M 165 80 C 220 102, 440 102, 495 80" fill="none" stroke="#226D9B" stroke-width="1.5"/>
      <path d="M 205 30 C 250 50, 410 50, 455 30" fill="none" stroke="#226D9B" stroke-width="1.4"/>
      <path d="M 165 180 C 220 205, 440 205, 495 180" fill="none" stroke="#226D9B" stroke-width="1.5"/>
      <path d="M 205 230 C 250 252, 410 252, 455 230" fill="none" stroke="#226D9B" stroke-width="1.4"/>

      <!-- SILUET KEPULAUAN INDONESIA RESMI DI SEPANJANG KHATULISTIWA (SUMATRA, JAWA, KALIMANTAN, SULAWESI, PAPUA) -->
      <!-- Sumatra -->
      <path d="M 95 90 C 105 115, 120 150, 140 190 C 135 195, 125 180, 112 150 C 100 125, 90 100, 95 90 Z" 
            fill="#2A75A0" stroke="#1D5B80" stroke-width="1" opacity="0.6"/>
      <!-- Jawa -->
      <path d="M 148 210 C 175 214, 215 218, 245 222 C 245 227, 210 228, 175 225 C 152 222, 144 216, 148 210 Z" 
            fill="#2A75A0" stroke="#1D5B80" stroke-width="1" opacity="0.6"/>
      <!-- Kalimantan -->
      <path d="M 185 105 C 215 100, 245 110, 250 135 C 255 155, 230 170, 205 168 C 185 162, 175 135, 185 105 Z" 
            fill="#2A75A0" stroke="#1D5B80" stroke-width="1" opacity="0.6"/>
      <!-- Sulawesi -->
      <path d="M 268 120 C 282 110, 296 125, 288 138 C 305 138, 310 155, 296 160 C 282 165, 274 178, 264 170 C 264 152, 272 138, 268 120 Z" 
            fill="#2A75A0" stroke="#1D5B80" stroke-width="1" opacity="0.6"/>
      <!-- Maluku & Papua -->
      <path d="M 315 145 C 322 140, 328 145, 324 152 C 320 158, 314 155, 315 145 Z" fill="#2A75A0" opacity="0.6"/>
      <path d="M 345 150 C 370 138, 405 145, 415 168 C 420 190, 388 200, 360 188 C 345 174, 340 160, 345 150 Z" 
            fill="#2A75A0" stroke="#1D5B80" stroke-width="1" opacity="0.6"/>
    </g>

    <!-- Faint Text Watermark "REPUBLIK INDONESIA" -->
    <g opacity="0.14" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#003366" letter-spacing="4">
      <text x="70" y="450">REPUBLIK INDONESIA KARTU TANDA PENDUDUK</text>
      <text x="180" y="430">KARTU TANDA PENDUDUK ELEKTRONIK</text>
    </g>

    <!-- HEADER KARTU (TENGAH ATAS) -->
    <text x="380" y="58" font-family="'Arial Black', Arial, Helvetica, sans-serif" font-size="17" font-weight="900" text-anchor="middle" fill="#0A111F" letter-spacing="1">${provinsi}</text>
    <text x="380" y="80" font-family="'Arial Black', Arial, Helvetica, sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="#0A111F" letter-spacing="1">${kota}</text>

    <!-- NIK RESMI (BOLD & BESAR) -->
    <text x="65" y="122" font-family="'Arial Black', Arial, sans-serif" font-size="18" font-weight="900" fill="#000000" letter-spacing="1.5">NIK</text>
    <text x="195" y="122" font-family="Arial, sans-serif" font-size="19" font-weight="900" fill="#000000">:</text>
    <text x="215" y="122" font-family="'Arial Black', Arial, sans-serif" font-size="19" font-weight="900" fill="#000000" letter-spacing="2.5">${nik}</text>

    <!-- FORMULIR IDENTITAS LENGKAP -->
    <g font-family="Arial, Helvetica, sans-serif" font-size="12.5" font-weight="700" fill="#0B1320">
      <!-- Nama -->
      <text x="65" y="152">Nama</text>
      <text x="195" y="152">:</text>
      <text x="215" y="152">${nama}</text>

      <!-- Tempat / Tgl Lahir -->
      <text x="65" y="175">Tempat/Tgl Lahir</text>
      <text x="195" y="175">:</text>
      <text x="215" y="175">${tempatTglLahir}</text>

      <!-- Jenis Kelamin & Gol Darah -->
      <text x="65" y="198">Jenis Kelamin</text>
      <text x="195" y="198">:</text>
      <text x="215" y="198">${jenisKelamin}</text>
      <text x="355" y="198">Gol. Darah : ${golDarah}</text>

      <!-- Alamat -->
      <text x="65" y="221">Alamat</text>
      <text x="195" y="221">:</text>
      <text x="215" y="221">${alamat}</text>

      <!-- RT / RW -->
      <text x="96" y="244">RT/RW</text>
      <text x="195" y="244">:</text>
      <text x="215" y="244">${rtRw}</text>

      <!-- Kel / Desa -->
      <text x="96" y="267">Kel/Desa</text>
      <text x="195" y="267">:</text>
      <text x="215" y="267">${kelDesa}</text>

      <!-- Kecamatan -->
      <text x="96" y="290">Kecamatan</text>
      <text x="195" y="290">:</text>
      <text x="215" y="290">${kecamatan}</text>

      <!-- Agama -->
      <text x="65" y="313">Agama</text>
      <text x="195" y="313">:</text>
      <text x="215" y="313">${agama}</text>

      <!-- Status Perkawinan -->
      <text x="65" y="336">Status Perkawinan</text>
      <text x="195" y="336">:</text>
      <text x="215" y="336">${statusPerkawinan}</text>

      <!-- Pekerjaan -->
      <text x="65" y="359">Pekerjaan</text>
      <text x="195" y="359">:</text>
      <text x="215" y="359">${pekerjaan}</text>

      <!-- Kewarganegaraan -->
      <text x="65" y="382">Kewarganegaraan</text>
      <text x="195" y="382">:</text>
      <text x="215" y="382">${kewarganegaraan}</text>

      <!-- Berlaku Hingga -->
      <text x="65" y="405">Berlaku Hingga</text>
      <text x="195" y="405">:</text>
      <text x="215" y="405">${berlakuHingga}</text>
    </g>

    <!-- PAS FOTO RESMI (LATAR MERAH/BIRU SESUAI TAHUN KELAHIRAN GANJIL/GENAP) -->
    <rect x="490" y="132" width="165" height="215" fill="${photoBgColorHex}" rx="3" ry="3"/>
    ${fotoBase64 ? `<image href="${fotoBase64}" x="490" y="132" width="165" height="215" preserveAspectRatio="xMidYMid slice" clip-path="url(#ktpPhotoClip)"/>` : ""}
    <rect x="490" y="132" width="165" height="215" fill="none" stroke="#FFFFFF" stroke-width="1.8" rx="3" ry="3"/>

    <!-- TANGGAL & TEMPAT PENERBITAN (SESUAI USIA 17 TAHUN PEMBUATAN PERTAMA KTP) -->
    <text x="572" y="364" text-anchor="middle" font-family="Arial, sans-serif" font-size="12.5" font-weight="700" fill="#0B1320">${kotaPenerbit}</text>
    <text x="572" y="382" text-anchor="middle" font-family="Arial, sans-serif" font-size="11.5" font-weight="700" fill="#0B1320">${tglPenerbit}</text>

    <!-- TANDA TANGAN ASLI TINTA HITAM (INDIVIDUAL / BERBEDA PER ORANG) -->
    <g transform="translate(535, 388)">
      ${signaturePath}
    </g>

    <!-- Garis Tepi Halus Kartu (Border Bevel) -->
    <rect x="35" y="32" width="690" height="436" rx="28" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.6"/>
    <rect x="36" y="33" width="688" height="434" rx="27" fill="none" stroke="#7BAECE" stroke-width="1.2" opacity="0.45"/>
  </g>
</svg>`;
}
