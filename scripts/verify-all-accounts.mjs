import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [k, ...v] = trimmed.split("=");
    env[k.trim()] = v.join("=").trim().replace(/^['"]|['"]$/g, "");
  }
}

const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const allAccounts = [
  { name: "Ratna Kusumawardani", email: "ratna.griyakenanga@gmail.com", pass: "Ratna#Pemilik2026!", catatan: "Pemilik" },
  { name: "Bayu Prasetyo", email: "bayu.prasetyo@gmail.com", pass: "Bayu#Kelola2026$", catatan: "Pengelola utama" },
  { name: "Sinta Maharani", email: "sinta.maharani@gmail.com", pass: "Sinta#Admin2026%", catatan: "Pengelola (dipromosikan Pemilik 5 Okt)" },
  { name: "Cahya Ramadhan", email: "cahya.ramadhan@gmail.com", pass: "Cahya#SewaA103^", catatan: "Kontrak berakhir 31 Okt dan draf perpanjangan" },
  { name: "Dimas Saputra", email: "dimas.saputra@gmail.com", pass: "Dimas#SewaA101*", catatan: "3 laporan terbuka, tagihan Okt belum bayar" },
  { name: "Fajar Nugroho", email: "fajar.nugroho@gmail.com", pass: "Fajar#SewaC307!", catatan: "Identitas belum diverifikasi, kontrak draf C-307" },
  { name: "Gilang Mahendra", email: "gilang.mahendra@gmail.com", pass: "Gilang#SewaB202#", catatan: "Kontrak diakhiri, identitas ditolak" },
  { name: "Hana Puspita", email: "hana.puspita@gmail.com", pass: "Hana#SewaA104$", catatan: "Tunggakan September dan Oktober" },
  { name: "Laras Anggraini", email: "laras.anggraini@gmail.com", pass: "Laras#SewaA107*", catatan: "Tagihan Okt sebagian" },
  { name: "Vina Rahmawati", email: "vina.rahmawati@gmail.com", pass: "Vina#SewaC304#", catatan: "Pernah bayar lewat Mayar" },
  { name: "Yoga Permana", email: "yoga.permana@gmail.com", pass: "Yoga#SewaC308%", catatan: "Mantan penyewa (kontrak selesai)" },
  { name: "Aditya Pratama", email: "aditya.pratama@gmail.com", pass: "Aditya#SewaB201*", catatan: "" },
  { name: "Bella Safitri", email: "bella.safitri@gmail.com", pass: "Bella#SewaA102&", catatan: "" },
  { name: "Eka Wulandari", email: "eka.wulandari@gmail.com", pass: "Eka#SewaA105@", catatan: "" },
  { name: "Indra Kurniawan", email: "indra.kurniawan@gmail.com", pass: "Indra#SewaB203%", catatan: "" },
  { name: "Jihan Aulia", email: "jihan.aulia@gmail.com", pass: "Jihan#SewaA106^", catatan: "" },
  { name: "Kevin Wijaya", email: "kevin.wijaya@gmail.com", pass: "Kevin#SewaB204&", catatan: "" },
  { name: "Muhammad Rizki", email: "muhammad.rizki@gmail.com", pass: "Rizki#SewaB205(", catatan: "" },
  { name: "Nadia Salsabila", email: "nadia.salsabila@gmail.com", pass: "Nadia#SewaB207)", catatan: "" },
  { name: "Oki Firmansyah", email: "oki.firmansyah@gmail.com", pass: "Oki#SewaA108-", catatan: "" },
  { name: "Putri Lestari", email: "putri.lestari@gmail.com", pass: "Putri#SewaB208+", catatan: "" },
  { name: "Raka Aditama", email: "raka.aditama@gmail.com", pass: "Raka#SewaC301=", catatan: "" },
  { name: "Salma Nuraini", email: "salma.nuraini@gmail.com", pass: "Salma#SewaC302~", catatan: "" },
  { name: "Teguh Santoso", email: "teguh.santoso@gmail.com", pass: "Teguh#SewaC303!", catatan: "" },
  { name: "Wahyu Hidayat", email: "wahyu.hidayat@gmail.com", pass: "Wahyu#SewaC306$", catatan: "" },
];

async function testAll() {
  let passed = 0;
  let failed = 0;

  for (const acc of allAccounts) {
    const { data, error } = await client.auth.signInWithPassword({
      email: acc.email,
      password: acc.pass,
    });

    if (error) {
      console.error(`❌ GAGAL: ${acc.name} (${acc.email}): ${error.message}`);
      failed++;
    } else {
      console.log(`✅ OK: ${acc.name.padEnd(20)} | ${acc.email.padEnd(28)} | Catatan: ${acc.catatan || '(kosong)'}`);
      passed++;
      await client.auth.signOut();
    }
  }

  console.log(`\nRingkasan: ${passed} Berhasil, ${failed} Gagal dari ${allAccounts.length} akun.`);
}

testAll();
