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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  await supabase.auth.signInWithPassword({
    email: "bayu.prasetyo@gmail.com",
    password: "Bayu#Kelola2026$",
  });

  console.log("\n--- TEST PENYEWA (profiles with identitas_penyewa!penyewa_id) ---");
  const { data: res1, error: err1 } = await supabase
    .from("profiles")
    .select(`
      id,
      nama_lengkap,
      email,
      no_hp,
      identitas_penyewa:identitas_penyewa!penyewa_id (
        nik,
        alamat_asal,
        status_verifikasi
      )
    `)
    .eq("peran", "penyewa");

  if (err1) {
    console.error("Error res1:", err1.message);
  } else {
    console.log("Success res1 count:", res1.length, "Sample 0:", res1[0]);
  }

  console.log("\n--- TEST KONTRAK (kontrak with unit & penyewa) ---");
  const { data: res2, error: err2 } = await supabase
    .from("kontrak")
    .select(`
      id,
      nomor,
      status,
      unit:unit_id (
        id,
        kode
      ),
      penyewa:penyewa_id (
        id,
        nama_lengkap
      )
    `);

  if (err2) {
    console.error("Error res2:", err2.message);
  } else {
    console.log("Success res2 count:", res2.length, "Sample 0:", res2[0]);
  }
}

test().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
