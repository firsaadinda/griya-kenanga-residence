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

async function testKtp() {
  await supabase.auth.signInWithPassword({
    email: "bayu.prasetyo@gmail.com",
    password: "Bayu#Kelola2026$",
  });

  const path = "ktp/4dfac964-253c-5ff5-829a-503cabaffead/ktp.jpg";
  console.log("Testing createSignedUrl with path:", path);
  const { data, error } = await supabase.storage.from("ktp").createSignedUrl(path, 600);

  if (error) {
    console.error("Error createSignedUrl:", error);
  } else {
    console.log("Success signedUrl:", data.signedUrl);
    // Fetch URL untuk cek status HTTP
    try {
      const res = await fetch(data.signedUrl);
      console.log("Fetch response status:", res.status, res.statusText);
    } catch (e) {
      console.error("Fetch error:", e.message);
    }
  }

  // Cek daftar file di bucket
  const { data: list, error: listErr } = await supabase.storage.from("ktp").list();
  console.log("Bucket ktp list root:", listErr ? listErr.message : list);
}

testKtp().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
