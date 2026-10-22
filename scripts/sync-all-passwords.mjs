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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE credentials");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const NEW_PASSWORD = "Latihan#2026";

const accountEmails = [
  "ratna.griyakenanga@gmail.com",
  "bayu.prasetyo@gmail.com",
  "sinta.maharani@gmail.com",
  "cahya.ramadhan@gmail.com",
  "dimas.saputra@gmail.com",
  "fajar.nugroho@gmail.com",
  "gilang.mahendra@gmail.com",
  "hana.puspita@gmail.com",
  "laras.anggraini@gmail.com",
  "vina.rahmawati@gmail.com",
  "yoga.permana@gmail.com",
  "aditya.pratama@gmail.com",
  "bella.safitri@gmail.com",
  "eka.wulandari@gmail.com",
  "indra.kurniawan@gmail.com",
  "jihan.aulia@gmail.com",
  "kevin.wijaya@gmail.com",
  "muhammad.rizki@gmail.com",
  "nadia.salsabila@gmail.com",
  "oki.firmansyah@gmail.com",
  "putri.lestari@gmail.com",
  "raka.aditama@gmail.com",
  "salma.nuraini@gmail.com",
  "teguh.santoso@gmail.com",
  "wahyu.hidayat@gmail.com",
];

async function updateAllPasswords() {
  console.log(`Mengambil daftar user dari Supabase Auth...`);
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  if (listError) {
    console.error("Gagal mengambil data user:", listError);
    process.exit(1);
  }

  const userMap = new Map();
  for (const u of usersData.users) {
    if (u.email) {
      userMap.set(u.email.toLowerCase(), u.id);
    }
  }

  let updated = 0;
  for (const email of accountEmails) {
    const userId = userMap.get(email.toLowerCase());
    if (!userId) {
      console.warn(`User tidak ditemukan di auth.users: ${email}`);
      continue;
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: NEW_PASSWORD,
      email_confirm: true,
    });

    if (updateError) {
      console.error(`Gagal update password ${email}:`, updateError.message);
    } else {
      console.log(`Berhasil update password: ${email} -> ${NEW_PASSWORD}`);
      updated++;
    }
  }

  console.log(`\nSelesai! Berhasil memperbarui ${updated} dari ${accountEmails.length} akun.`);
}

updateAllPasswords();
