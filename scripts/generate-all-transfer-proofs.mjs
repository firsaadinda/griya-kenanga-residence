import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// Baca env
const env = {};
fs.readFileSync(".env.local", "utf-8")
  .split("\n")
  .forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed
          .substring(idx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");
      }
    }
  });

const outputDir = path.resolve("public/bukti-bayar");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Data 21 Penyewa dengan Unit, Nominal, dan Bank
const tenantReceipts = [
  {
    slug: "aditya-pratama",
    tenantName: "ADITYA PRATAMA",
    unit: "A-101",
    bank: "BCA",
    accountNumber: "037-1122334",
    amount: 1350000,
    dateStr: "02 Okt 2026",
    timeStr: "08:45 WIB",
    refNumber: "3345100101",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "bella-safitri",
    tenantName: "BELLA SAFITRI",
    unit: "A-102",
    bank: "Mayar",
    accountNumber: "VA-880914501102",
    amount: 1470000,
    dateStr: "11 Okt 2026",
    timeStr: "14:03 WIB",
    refNumber: "MAYAR-INV-202610-0002",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "Mayar Virtual Account",
  },
  {
    slug: "cahya-ramadhan",
    tenantName: "CAHYA RAMADHAN",
    unit: "A-103",
    bank: "BCA",
    accountNumber: "037-2233445",
    amount: 1450000,
    dateStr: "08 Okt 2026",
    timeStr: "11:20 WIB",
    refNumber: "3345100103",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "dimas-saputra",
    tenantName: "DIMAS SAPUTRA",
    unit: "A-104",
    bank: "BCA",
    accountNumber: "037-3345678",
    amount: 1000000,
    dateStr: "15 Okt 2026",
    timeStr: "09:15 WIB",
    refNumber: "3345678901",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "eka-wulandari",
    tenantName: "EKA WULANDARI",
    unit: "A-105",
    bank: "Gopay",
    accountNumber: "085743427281",
    amount: 1450000,
    dateStr: "09 Okt 2026",
    timeStr: "13:40 WIB",
    refNumber: "GPAY88100105",
    recipientName: "Griya Kenanga Residence",
    recipientRek: "GoPay Merchant Kenanga",
  },
  {
    slug: "gilang-mahendra",
    tenantName: "GILANG MAHENDRA",
    unit: "A-106",
    bank: "BNI",
    accountNumber: "089-3344-556",
    amount: 1450000,
    dateStr: "07 Agu 2026",
    timeStr: "14:10 WIB",
    refNumber: "5566100106",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "089-1234-567 (BNI)",
  },
  {
    slug: "hana-puspita",
    tenantName: "HANA PUSPITA",
    unit: "A-107",
    bank: "Mandiri",
    accountNumber: "137-00-3344556-7",
    amount: 1350000,
    dateStr: "06 Agu 2026",
    timeStr: "09:30 WIB",
    refNumber: "7788100107",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "137-00-1234567-8 (Mandiri)",
  },
  {
    slug: "indra-kurniawan",
    tenantName: "INDRA KURNIAWAN",
    unit: "B-201",
    bank: "BNI",
    accountNumber: "089-4455-667",
    amount: 1900000,
    dateStr: "05 Okt 2026",
    timeStr: "11:30 WIB",
    refNumber: "5566100201",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "089-1234-567 (BNI)",
  },
  {
    slug: "jihan-aulia",
    tenantName: "JIHAN AULIA",
    unit: "B-202",
    bank: "BCA",
    accountNumber: "037-5566778",
    amount: 1850000,
    dateStr: "02 Okt 2026",
    timeStr: "16:05 WIB",
    refNumber: "3345100202",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "kevin-wijaya",
    tenantName: "KEVIN WIJAYA",
    unit: "B-203",
    bank: "Mandiri",
    accountNumber: "137-00-5566778-9",
    amount: 1850000,
    dateStr: "08 Sep 2026",
    timeStr: "10:50 WIB",
    refNumber: "7788100203",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "137-00-1234567-8 (Mandiri)",
  },
  {
    slug: "laras-anggraini",
    tenantName: "LARAS ANGGRAINI",
    unit: "B-204",
    bank: "Mandiri",
    accountNumber: "137-00-7788990-1",
    amount: 1000000,
    dateStr: "09 Okt 2026",
    timeStr: "14:03 WIB",
    refNumber: "7788990011",
    recipientName: "Griya Kenanga Residence",
    recipientRek: "137-00-1234567-8 (Mandiri)",
  },
  {
    slug: "muhammad-rizki",
    tenantName: "MUHAMMAD RIZKI",
    unit: "B-206",
    bank: "BNI",
    accountNumber: "089-7788-990",
    amount: 1750000,
    dateStr: "09 Okt 2026",
    timeStr: "11:45 WIB",
    refNumber: "5566100206",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "089-1234-567 (BNI)",
  },
  {
    slug: "nadia-salsabila",
    tenantName: "NADIA SALSABILA",
    unit: "B-207",
    bank: "BCA",
    accountNumber: "037-8899001",
    amount: 1850000,
    dateStr: "04 Okt 2026",
    timeStr: "08:15 WIB",
    refNumber: "3345100207",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "oki-firmansyah",
    tenantName: "OKI FIRMANSYAH",
    unit: "B-208",
    bank: "BCA",
    accountNumber: "037-9900112",
    amount: 2000000,
    dateStr: "06 Sep 2026",
    timeStr: "17:30 WIB",
    refNumber: "3345100208",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
  {
    slug: "putri-lestari",
    tenantName: "PUTRI LESTARI",
    unit: "C-301",
    bank: "Gopay",
    accountNumber: "081392936648",
    amount: 2800000,
    dateStr: "06 Okt 2026",
    timeStr: "12:00 WIB",
    refNumber: "GPAY88100301",
    recipientName: "Griya Kenanga Residence",
    recipientRek: "GoPay Merchant Kenanga",
  },
  {
    slug: "raka-aditama",
    tenantName: "RAKA ADITAMA",
    unit: "C-302",
    bank: "Mandiri",
    accountNumber: "137-00-8899001-2",
    amount: 2750000,
    dateStr: "09 Okt 2026",
    timeStr: "15:10 WIB",
    refNumber: "7788100302",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "137-00-1234567-8 (Mandiri)",
  },
  {
    slug: "salma-nuraini",
    tenantName: "SALMA NURAINI",
    unit: "C-303",
    bank: "BNI",
    accountNumber: "089-9900-112",
    amount: 2750000,
    dateStr: "02 Okt 2026",
    timeStr: "09:40 WIB",
    refNumber: "5566100303",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "089-1234-567 (BNI)",
  },
  {
    slug: "teguh-santoso",
    tenantName: "TEGUH SANTOSO",
    unit: "C-304",
    bank: "Gopay",
    accountNumber: "081210713117",
    amount: 2000000,
    dateStr: "03 Okt 2026",
    timeStr: "18:20 WIB",
    refNumber: "GPAY88100304",
    recipientName: "Griya Kenanga Residence",
    recipientRek: "GoPay Merchant Kenanga",
  },
  {
    slug: "vina-rahmawati",
    tenantName: "VINA RAHMAWATI",
    unit: "C-305",
    bank: "Mayar",
    accountNumber: "VA-880912345678",
    amount: 2650000,
    dateStr: "10 Okt 2026",
    timeStr: "10:15 WIB",
    refNumber: "MAYAR-INV-202610-0018",
    recipientName: "Griya Kenanga Residence",
    recipientRek: "Mayar Virtual Account",
  },
  {
    slug: "wahyu-hidayat",
    tenantName: "WAHYU HIDAYAT",
    unit: "C-306",
    bank: "Mandiri",
    accountNumber: "137-00-9900112-3",
    amount: 2750000,
    dateStr: "06 Okt 2026",
    timeStr: "13:10 WIB",
    refNumber: "7788100306",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "137-00-1234567-8 (Mandiri)",
  },
  {
    slug: "yoga-permana",
    tenantName: "YOGA PERMANA",
    unit: "C-307",
    bank: "BCA",
    accountNumber: "037-4455667",
    amount: 2750000,
    dateStr: "04 Agu 2026",
    timeStr: "11:55 WIB",
    refNumber: "3345100307",
    recipientName: "GRIYA KENANGA RESIDENCE",
    recipientRek: "037-889-1234 (BCA)",
  },
];

function formatRupiah(num) {
  return "Rp " + Number(num).toLocaleString("id-ID");
}

// 1. Template SVG BCA
function generateBcaSvg(item) {
  return `
<svg width="600" height="960" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Background Phone / Outer Bezel -->
  <rect width="600" height="960" rx="36" fill="#0A192F" />
  
  <!-- Status Bar Phone -->
  <rect x="0" y="0" width="600" height="44" rx="36" fill="#003D7A" />
  <circle cx="50" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="62" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="74" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <text x="300" y="28" fill="#FFFFFF" font-size="12" text-anchor="middle" font-weight="600">09:41</text>
  <rect x="530" y="18" width="22" height="12" rx="3" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <rect x="532" y="20" width="14" height="8" rx="1.5" fill="#FFFFFF" />

  <!-- App Header BCA Mobile -->
  <rect x="0" y="44" width="600" height="76" fill="#005BAA" />
  <path d="M 32 82 L 44 70 M 32 82 L 44 94" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <text x="60" y="88" fill="#FFFFFF" font-size="20" font-weight="bold">Bukti Transfer</text>
  
  <!-- BCA Logo Badge -->
  <rect x="475" y="60" width="95" height="42" rx="8" fill="#FFFFFF" />
  <text x="522" y="87" fill="#005BAA" font-size="18" font-weight="900" letter-spacing="1" text-anchor="middle">BCA</text>

  <!-- White Card Slip -->
  <rect x="24" y="140" width="552" height="770" rx="24" fill="#FFFFFF" />

  <!-- Checkmark Banner -->
  <rect x="24" y="140" width="552" height="180" rx="24" fill="#F0F7FF" />
  <circle cx="300" cy="205" r="32" fill="#10B981" />
  <path d="M 288 205 L 296 213 L 314 195" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  
  <text x="300" y="262" fill="#059669" font-size="16" font-weight="bold" text-anchor="middle">TRANSAKSI BERHASIL</text>
  <text x="300" y="285" fill="#64748B" font-size="13" text-anchor="middle">${item.dateStr}  ${item.timeStr}</text>

  <!-- Nominal Besar -->
  <text x="300" y="360" fill="#0F172A" font-size="34" font-weight="800" text-anchor="middle">${formatRupiah(item.amount)}</text>
  <text x="300" y="385" fill="#64748B" font-size="12" text-anchor="middle">Pembayaran Sewa Unit ${item.unit}</text>

  <!-- Garis Pemisah Berigi (Receipt Tear) -->
  <line x1="48" y1="410" x2="552" y2="410" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- Detail Transaksi Box -->
  <g transform="translate(48, 435)">
    <!-- Row 1: Penerima -->
    <text x="0" y="20" fill="#64748B" font-size="12">Nama Penerima</text>
    <text x="504" y="20" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.recipientName}</text>
    <line x1="0" y1="36" x2="504" y2="36" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 2: Rekening Tujuan -->
    <text x="0" y="60" fill="#64748B" font-size="12">Rekening Tujuan</text>
    <text x="504" y="60" fill="#005BAA" font-size="13" font-weight="600" text-anchor="end">${item.recipientRek}</text>
    <line x1="0" y1="76" x2="504" y2="76" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 3: Nama Pengirim -->
    <text x="0" y="100" fill="#64748B" font-size="12">Nama Pengirim</text>
    <text x="504" y="100" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.tenantName}</text>
    <line x1="0" y1="116" x2="504" y2="116" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 4: Rekening Pengirim -->
    <text x="0" y="140" fill="#64748B" font-size="12">Rekening Pengirim</text>
    <text x="504" y="140" fill="#334155" font-size="13" font-weight="500" text-anchor="end">${item.accountNumber}</text>
    <line x1="0" y1="156" x2="504" y2="156" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 5: Bank Pengirim -->
    <text x="0" y="180" fill="#64748B" font-size="12">Bank Pengirim</text>
    <text x="504" y="180" fill="#0F172A" font-size="13" font-weight="600" text-anchor="end">Bank Central Asia (BCA)</text>
    <line x1="0" y1="196" x2="504" y2="196" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 6: No. Referensi -->
    <text x="0" y="220" fill="#64748B" font-size="12">No. Referensi</text>
    <text x="504" y="220" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" font-weight="bold" text-anchor="end">${item.refNumber}</text>
    <line x1="0" y1="236" x2="504" y2="236" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 7: Jenis Transfer -->
    <text x="0" y="260" fill="#64748B" font-size="12">Jenis Transfer</text>
    <text x="504" y="260" fill="#0F172A" font-size="13" font-weight="500" text-anchor="end">Transfer Antar Rekening BCA</text>
    <line x1="0" y1="276" x2="504" y2="276" stroke="#F1F5F9" stroke-width="1" />

    <!-- Row 8: Berita / Keterangan -->
    <text x="0" y="300" fill="#64748B" font-size="12">Berita Transfer</text>
    <text x="504" y="300" fill="#005BAA" font-size="13" font-weight="bold" text-anchor="end">Sewa Unit ${item.unit} Kenanga</text>
  </g>

  <!-- Footer Catatan Keamanan -->
  <rect x="48" y="780" width="504" height="60" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
  <circle cx="70" cy="810" r="10" fill="#005BAA" />
  <text x="70" y="814" fill="#FFFFFF" font-size="12" text-anchor="middle" font-weight="bold">i</text>
  <text x="90" y="805" fill="#475569" font-size="11" font-weight="500">Bukti transfer ini merupakan dokumen transaksi digital resmi.</text>
  <text x="90" y="822" fill="#64748B" font-size="10">Simpan slip ini sebagai konfirmasi pelunasan hunian Griya Kenanga Residence.</text>

  <!-- Watermark Barcode Bawah -->
  <rect x="220" y="865" width="160" height="20" rx="4" fill="#E2E8F0" opacity="0.6" />
  <text x="300" y="879" fill="#64748B" font-size="10" font-family="'Consolas', monospace" text-anchor="middle" letter-spacing="3">BCA-TRX-2026-OKT</text>
</svg>
`;
}

// 2. Template SVG Mandiri Livin'
function generateMandiriSvg(item) {
  return `
<svg width="600" height="960" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Phone Frame -->
  <rect width="600" height="960" rx="36" fill="#041B2D" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="600" height="44" rx="36" fill="#00213D" />
  <circle cx="50" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="62" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <circle cx="74" cy="24" r="4" fill="#FFFFFF" opacity="0.8"/>
  <text x="300" y="28" fill="#FFFFFF" font-size="12" text-anchor="middle" font-weight="600">14:03</text>
  <rect x="530" y="18" width="22" height="12" rx="3" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
  <rect x="532" y="20" width="16" height="8" rx="1.5" fill="#FFFFFF" />

  <!-- Header Mandiri Livin -->
  <rect x="0" y="44" width="600" height="110" fill="#002B49" />
  <path d="M 32 90 L 44 78 M 32 90 L 44 102" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  
  <!-- Mandiri Logo Curve -->
  <g transform="translate(440, 68)">
    <path d="M 0 15 Q 40 -10 90 20 Q 50 15 20 28 Z" fill="#FBBF24" />
    <text x="50" y="38" fill="#FFFFFF" font-size="22" font-weight="900" letter-spacing="0.5">mandiri</text>
  </g>
  <text x="60" y="96" fill="#FFFFFF" font-size="20" font-weight="bold">Transaksi Berhasil</text>

  <!-- Body Container -->
  <rect x="24" y="130" width="552" height="790" rx="24" fill="#FFFFFF" />

  <!-- Mandiri Blue Curve Accent -->
  <rect x="24" y="130" width="552" height="170" rx="24" fill="#002B49" />
  <rect x="24" y="270" width="552" height="30" fill="#002B49" />

  <!-- Yellow Stripe -->
  <rect x="24" y="295" width="552" height="6" fill="#FBBF24" />

  <!-- Checkmark & Title -->
  <circle cx="300" cy="180" r="28" fill="#FBBF24" />
  <path d="M 290 180 L 297 187 L 311 173" fill="none" stroke="#002B49" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  
  <text x="300" y="230" fill="#FFFFFF" font-size="18" font-weight="bold" text-anchor="middle">Tagihan Sewa Hunian</text>
  <text x="300" y="255" fill="#93C5FD" font-size="13" text-anchor="middle">${item.dateStr}   ${item.timeStr}</text>

  <!-- Nominal Besar -->
  <text x="300" y="360" fill="#002B49" font-size="36" font-weight="800" text-anchor="middle">${formatRupiah(item.amount)}</text>
  <rect x="230" y="380" width="140" height="24" rx="12" fill="#ECFDF5" />
  <text x="300" y="396" fill="#059669" font-size="11" font-weight="bold" text-anchor="middle">STATUS: BERHASIL</text>

  <!-- Garis Pemisah -->
  <line x1="48" y1="425" x2="552" y2="425" stroke="#E2E8F0" stroke-width="1" />

  <!-- Detail Information -->
  <g transform="translate(48, 445)">
    <!-- Row 1: Tujuan -->
    <text x="0" y="20" fill="#64748B" font-size="12">Penerima</text>
    <text x="504" y="20" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.recipientName}</text>
    <line x1="0" y1="36" x2="504" y2="36" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 2: No Rekening -->
    <text x="0" y="60" fill="#64748B" font-size="12">Rekening Penerima</text>
    <text x="504" y="60" fill="#002B49" font-size="13" font-weight="bold" text-anchor="end">${item.recipientRek}</text>
    <line x1="0" y1="76" x2="504" y2="76" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 3: Pengirim -->
    <text x="0" y="100" fill="#64748B" font-size="12">Pengirim</text>
    <text x="504" y="100" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.tenantName}</text>
    <line x1="0" y1="116" x2="504" y2="116" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 4: Rekening Pengirim -->
    <text x="0" y="140" fill="#64748B" font-size="12">Rekening Pengirim</text>
    <text x="504" y="140" fill="#334155" font-size="13" font-weight="500" text-anchor="end">${item.accountNumber}</text>
    <line x1="0" y1="156" x2="504" y2="156" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 5: Bank -->
    <text x="0" y="180" fill="#64748B" font-size="12">Bank</text>
    <text x="504" y="180" fill="#0F172A" font-size="13" font-weight="600" text-anchor="end">Bank Mandiri</text>
    <line x1="0" y1="196" x2="504" y2="196" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 6: Ref -->
    <text x="0" y="220" fill="#64748B" font-size="12">Ref.</text>
    <text x="504" y="220" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" font-weight="bold" text-anchor="end">${item.refNumber}</text>
    <line x1="0" y1="236" x2="504" y2="236" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 7: Transaction ID -->
    <text x="0" y="260" fill="#64748B" font-size="12">Transaction ID</text>
    <text x="504" y="260" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" text-anchor="end">TRX${item.refNumber.substring(0, 8)}</text>
    <line x1="0" y1="276" x2="504" y2="276" stroke="#F8FAFC" stroke-width="1" />

    <!-- Row 8: Catatan -->
    <text x="0" y="300" fill="#64748B" font-size="12">Keterangan</text>
    <text x="504" y="300" fill="#002B49" font-size="13" font-weight="bold" text-anchor="end">Pelunasan Sewa Unit ${item.unit}</text>
  </g>

  <!-- Livin Badge Footer -->
  <rect x="48" y="800" width="504" height="60" rx="14" fill="#F0F9FF" border="1" stroke="#BAE6FD" />
  <text x="300" y="828" fill="#0369A1" font-size="13" font-weight="bold" text-anchor="middle">Livin' by Mandiri</text>
  <text x="300" y="846" fill="#0284C7" font-size="11" text-anchor="middle">Resmi terverifikasi sistem pembayaran elektronik nasional</text>
</svg>
`;
}

// 3. Template SVG BNI Mobile Banking
function generateBniSvg(item) {
  return `
<svg width="600" height="960" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Phone Frame -->
  <rect width="600" height="960" rx="36" fill="#1C2127" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="600" height="44" rx="36" fill="#F4F4F2" />
  <text x="300" y="28" fill="#1E293B" font-size="12" text-anchor="middle" font-weight="600">11:30</text>

  <!-- App Header BNI Mobile -->
  <rect x="0" y="44" width="600" height="80" fill="#FFFFFF" />
  <!-- BNI Logo -->
  <g transform="translate(48, 64)">
    <text x="0" y="30" fill="#F15A24" font-size="28" font-weight="900" letter-spacing="-1">BNI</text>
    <text x="65" y="28" fill="#005E6A" font-size="16" font-weight="bold">Mobile Banking</text>
  </g>
  <rect x="450" y="68" width="100" height="32" rx="16" fill="#ECFDF5" />
  <text x="500" y="89" fill="#059669" font-size="12" font-weight="bold" text-anchor="middle">✓ Berhasil</text>

  <!-- Main Slip Container -->
  <rect x="24" y="140" width="552" height="770" rx="20" fill="#FFFFFF" />

  <!-- Sub Header -->
  <rect x="24" y="140" width="552" height="150" rx="20" fill="#FFF7ED" />
  <text x="300" y="185" fill="#C2410C" font-size="16" font-weight="bold" text-anchor="middle">Pembayaran Sewa Properti</text>
  <text x="300" y="208" fill="#9A3412" font-size="12" text-anchor="middle">Griya Kenanga Residence Sleman</text>
  <text x="300" y="230" fill="#64748B" font-size="12" text-anchor="middle">Waktu: ${item.dateStr}  ${item.timeStr}</text>

  <!-- Nominal -->
  <text x="300" y="325" fill="#0F172A" font-size="34" font-weight="800" text-anchor="middle">${formatRupiah(item.amount)}</text>
  <text x="300" y="350" fill="#059669" font-size="13" font-weight="bold" text-anchor="middle">TRANSAKSI SUKSES DIPROSES</text>

  <line x1="48" y1="380" x2="552" y2="380" stroke="#FED7AA" stroke-width="1.5" stroke-dasharray="4,4" />

  <!-- Detail BNI -->
  <g transform="translate(48, 400)">
    <text x="0" y="25" fill="#64748B" font-size="12">Rekening Tujuan</text>
    <text x="504" y="25" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.recipientName}</text>
    <line x1="0" y1="42" x2="504" y2="42" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="70" fill="#64748B" font-size="12">Nomor Rekening</text>
    <text x="504" y="70" fill="#005E6A" font-size="13" font-weight="bold" text-anchor="end">${item.recipientRek}</text>
    <line x1="0" y1="87" x2="504" y2="87" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="115" fill="#64748B" font-size="12">Nama Pengirim</text>
    <text x="504" y="115" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.tenantName}</text>
    <line x1="0" y1="132" x2="504" y2="132" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="160" fill="#64748B" font-size="12">Rekening Asal</text>
    <text x="504" y="160" fill="#334155" font-size="13" font-weight="500" text-anchor="end">${item.accountNumber}</text>
    <line x1="0" y1="177" x2="504" y2="177" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="205" fill="#64748B" font-size="12">Bank Pengirim</text>
    <text x="504" y="205" fill="#0F172A" font-size="13" font-weight="600" text-anchor="end">Bank Negara Indonesia (BNI)</text>
    <line x1="0" y1="222" x2="504" y2="222" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="250" fill="#64748B" font-size="12">Nomor Referensi</text>
    <text x="504" y="250" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" font-weight="bold" text-anchor="end">${item.refNumber}</text>
    <line x1="0" y1="267" x2="504" y2="267" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="295" fill="#64748B" font-size="12">Trace Number</text>
    <text x="504" y="295" fill="#005E6A" font-size="13" font-family="'Consolas', monospace" text-anchor="end">098${item.refNumber.substring(6)}</text>
    <line x1="0" y1="312" x2="504" y2="312" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="340" fill="#64748B" font-size="12">Keterangan</text>
    <text x="504" y="340" fill="#C2410C" font-size="13" font-weight="bold" text-anchor="end">Tagihan Unit ${item.unit}</text>
  </g>

  <!-- Footer Seal BNI -->
  <rect x="48" y="790" width="504" height="60" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
  <text x="300" y="818" fill="#334155" font-size="12" font-weight="bold" text-anchor="middle">PT Bank Negara Indonesia (Persero) Tbk.</text>
  <text x="300" y="836" fill="#64748B" font-size="10" text-anchor="middle">Terdaftar dan diawasi oleh Otoritas Jasa Keuangan (OJK)</text>
</svg>
`;
}

// 4. Template SVG GoPay (Transfer Saldo E-Wallet Resmi - Konsisten)
function generateGopaySvg(item) {
  return `
<svg width="600" height="960" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Phone Frame -->
  <rect width="600" height="960" rx="36" fill="#002D38" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="600" height="44" rx="36" fill="#00AED6" />
  <text x="300" y="28" fill="#FFFFFF" font-size="12" text-anchor="middle" font-weight="600">18:45</text>

  <!-- Header GoPay Resmi (Tanpa QRIS) -->
  <rect x="0" y="44" width="600" height="85" fill="#00AED6" />
  <!-- GoPay Logo -->
  <g transform="translate(48, 65)">
    <circle cx="16" cy="18" r="14" fill="#FFFFFF" />
    <circle cx="16" cy="18" r="7" fill="#00AED6" />
    <text x="38" y="25" fill="#FFFFFF" font-size="22" font-weight="800">gopay</text>
  </g>
  <!-- Transfer Badge -->
  <g transform="translate(420, 68)">
    <rect width="130" height="34" rx="17" fill="#008EA6" />
    <text x="65" y="22" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">Transfer Sukses</text>
  </g>

  <!-- White Slip -->
  <rect x="24" y="145" width="552" height="770" rx="24" fill="#FFFFFF" />

  <!-- GoPay Check Circle Badge -->
  <g transform="translate(260, 185)">
    <circle cx="40" cy="40" r="38" fill="#00AED6" />
    <circle cx="40" cy="40" r="32" fill="#00AED6" stroke="#FFFFFF" stroke-width="2" />
    <path d="M 28 40 L 36 48 L 54 28" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  </g>

  <text x="300" y="300" fill="#0F172A" font-size="18" font-weight="bold" text-anchor="middle">Transfer Saldo GoPay Berhasil</text>
  <text x="300" y="325" fill="#64748B" font-size="12" text-anchor="middle">${item.dateStr}  ${item.timeStr}</text>

  <text x="300" y="385" fill="#0F172A" font-size="36" font-weight="800" text-anchor="middle">${formatRupiah(item.amount)}</text>
  <text x="300" y="415" fill="#00AED6" font-size="12" font-weight="bold" text-anchor="middle">TRANSAKSI SUKSES DITERIMA</text>

  <line x1="48" y1="445" x2="552" y2="445" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="6,6" />

  <!-- Details -->
  <g transform="translate(48, 470)">
    <text x="0" y="20" fill="#64748B" font-size="12">Penerima</text>
    <text x="504" y="20" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">Griya Kenanga Residence</text>
    <line x1="0" y1="36" x2="504" y2="36" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="60" fill="#64748B" font-size="12">Nomor HP Penerima / Akun</text>
    <text x="504" y="60" fill="#005E6A" font-size="13" font-weight="bold" text-anchor="end">${item.recipientRek || "0812-9876-5432 (Griya Kenanga)"}</text>
    <line x1="0" y1="76" x2="504" y2="76" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="100" fill="#64748B" font-size="12">Pengirim (Penyewa)</text>
    <text x="504" y="100" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.tenantName}</text>
    <line x1="0" y1="116" x2="504" y2="116" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="140" fill="#64748B" font-size="12">Nomor Ponsel Pengirim</text>
    <text x="504" y="140" fill="#334155" font-size="13" font-weight="500" text-anchor="end">${item.accountNumber}</text>
    <line x1="0" y1="156" x2="504" y2="156" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="180" fill="#64748B" font-size="12">Metode Pembayaran</text>
    <text x="504" y="180" fill="#00AED6" font-size="13" font-weight="bold" text-anchor="end">Saldo GoPay</text>
    <line x1="0" y1="196" x2="504" y2="196" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="220" fill="#64748B" font-size="12">ID Transaksi GoPay</text>
    <text x="504" y="220" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" font-weight="bold" text-anchor="end">${item.refNumber}</text>
    <line x1="0" y1="236" x2="504" y2="236" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="260" fill="#64748B" font-size="12">Catatan Transaksi</text>
    <text x="504" y="260" fill="#0F172A" font-size="13" font-weight="600" text-anchor="end">Tagihan Sewa Unit ${item.unit}</text>
  </g>

  <!-- GoPay Security Shield -->
  <rect x="48" y="780" width="504" height="65" rx="14" fill="#F0FDFA" stroke="#99F6E4" />
  <circle cx="75" cy="812" r="12" fill="#0D9488" />
  <path d="M 69 812 L 73 816 L 81 808" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
  <text x="96" y="808" fill="#0F766E" font-size="12" font-weight="bold">Pembayaran Dilindungi GoPay Aman</text>
  <text x="96" y="825" fill="#115E59" font-size="10">Resmi diproses PT Dompet Anak Bangsa (GoTo Financial)</text>
</svg>
`;
}

// 5. Template SVG Mayar
function generateMayarSvg(item) {
  return `
<svg width="600" height="960" viewBox="0 0 600 960" xmlns="http://www.w3.org/2000/svg" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <!-- Phone Frame -->
  <rect width="600" height="960" rx="36" fill="#1E1B4B" />

  <!-- Status Bar -->
  <rect x="0" y="0" width="600" height="44" rx="36" fill="#4F46E5" />
  <text x="300" y="28" fill="#FFFFFF" font-size="12" text-anchor="middle" font-weight="600">10:15</text>

  <!-- Header Mayar -->
  <rect x="0" y="44" width="600" height="90" fill="#4F46E5" />
  <text x="48" y="96" fill="#FFFFFF" font-size="24" font-weight="900" letter-spacing="1">mayar<tspan fill="#A5B4FC">.id</tspan></text>
  <rect x="440" y="65" width="112" height="32" rx="16" fill="#EEF2FF" />
  <text x="496" y="86" fill="#4F46E5" font-size="11" font-weight="bold" text-anchor="middle">PAID INVOICE</text>

  <!-- Card Body -->
  <rect x="24" y="150" width="552" height="760" rx="24" fill="#FFFFFF" />

  <circle cx="300" cy="220" r="32" fill="#6366F1" />
  <path d="M 288 220 L 296 228 L 314 210" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

  <text x="300" y="285" fill="#4F46E5" font-size="18" font-weight="bold" text-anchor="middle">Pembayaran Sukses</text>
  <text x="300" y="308" fill="#64748B" font-size="12" text-anchor="middle">${item.dateStr}  ${item.timeStr}</text>

  <text x="300" y="375" fill="#0F172A" font-size="36" font-weight="800" text-anchor="middle">${formatRupiah(item.amount)}</text>
  <text x="300" y="402" fill="#4338CA" font-size="12" font-weight="600" text-anchor="middle">Invoice Sewa Unit ${item.unit} Griya Kenanga</text>

  <line x1="48" y1="435" x2="552" y2="435" stroke="#E2E8F0" stroke-width="1" />

  <g transform="translate(48, 460)">
    <text x="0" y="20" fill="#64748B" font-size="12">Penyewa</text>
    <text x="504" y="20" fill="#0F172A" font-size="13" font-weight="bold" text-anchor="end">${item.tenantName}</text>
    <line x1="0" y1="36" x2="504" y2="36" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="60" fill="#64748B" font-size="12">Metode Pembayaran</text>
    <text x="504" y="60" fill="#4F46E5" font-size="13" font-weight="bold" text-anchor="end">Mayar Virtual Account</text>
    <line x1="0" y1="76" x2="504" y2="76" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="100" fill="#64748B" font-size="12">No. Akun Virtual</text>
    <text x="504" y="100" fill="#334155" font-size="13" font-weight="500" text-anchor="end">${item.accountNumber}</text>
    <line x1="0" y1="116" x2="504" y2="116" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="140" fill="#64748B" font-size="12">Nomor Invoice</text>
    <text x="504" y="140" fill="#0F172A" font-size="13" font-family="'Consolas', monospace" font-weight="bold" text-anchor="end">${item.refNumber}</text>
    <line x1="0" y1="156" x2="504" y2="156" stroke="#F1F5F9" stroke-width="1" />

    <text x="0" y="180" fill="#64748B" font-size="12">Status Gateway</text>
    <text x="504" y="180" fill="#059669" font-size="13" font-weight="bold" text-anchor="end">SETTLED (LUNAS)</text>
  </g>

  <rect x="48" y="780" width="504" height="60" rx="14" fill="#EEF2FF" stroke="#C7D2FE" />
  <text x="300" y="808" fill="#4338CA" font-size="12" font-weight="bold" text-anchor="middle">Payment Gateway Mayar Indonesia</text>
  <text x="300" y="826" fill="#6366F1" font-size="10" text-anchor="middle">Terverifikasi otomatis dengan callback server Griya Kenanga Residence</text>
</svg>
`;
}

async function generateAllReceipts() {
  console.log("=== MEMULAI GENERASI BUKTI TRANSFER PORTRAIT 21 PENYEWA ===");

  for (const item of tenantReceipts) {
    let svgContent = "";
    if (item.bank === "BCA") {
      svgContent = generateBcaSvg(item);
    } else if (item.bank === "Mandiri") {
      svgContent = generateMandiriSvg(item);
    } else if (item.bank === "BNI") {
      svgContent = generateBniSvg(item);
    } else if (item.bank === "Gopay" || item.bank === "QRIS") {
      svgContent = generateGopaySvg(item);
    } else if (item.bank === "Mayar") {
      svgContent = generateMayarSvg(item);
    }

    const pngFileName = `bukti-${item.slug}-${item.bank.toLowerCase()}.png`;
    const svgFileName = `bukti-${item.slug}-${item.bank.toLowerCase()}.svg`;
    
    const pngFilePath = path.join(outputDir, pngFileName);
    const svgFilePath = path.join(outputDir, svgFileName);

    // Tulis SVG
    fs.writeFileSync(svgFilePath, svgContent, "utf-8");

    // Render PNG dengan Sharp
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .png({ quality: 95 })
      .toBuffer();

    fs.writeFileSync(pngFilePath, pngBuffer);

    // Salin juga ke nama alias lama agar aman dari cache browser lama
    if (item.bank === "Gopay") {
      fs.writeFileSync(path.join(outputDir, `bukti-${item.slug}-qris.png`), pngBuffer);
    }
    if (item.slug === "bella-safitri") {
      fs.writeFileSync(path.join(outputDir, `bukti-${item.slug}-mandiri.png`), pngBuffer);
    }

    console.log(`✓ [${item.bank.padEnd(7)}] Generated: ${pngFileName} (Unit: ${item.unit}, ${item.tenantName}, ${formatRupiah(item.amount)})`);
  }

  console.log("\nSemua 21 gambar bukti transfer portrait berhasil dibuat di public/bukti-bayar/");
}

generateAllReceipts().catch((err) => {
  console.error("Gagal membuat bukti transfer:", err);
  process.exit(1);
});
