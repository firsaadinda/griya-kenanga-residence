import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Baca .env.local jika belum dimuat
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length) {
        process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Environment variables missing!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndRoles() {
  console.log("=== PENGUJIAN TAHAP 3: AUTENTIKASI 3 PERAN & ROLE GUARD ===");

  const testAccounts = [
    { email: "ratna.griyakenanga@gmail.com", pass: "Ratna#Pemilik2026!", expectedRole: "pemilik", name: "Ibu Ratna" },
    { email: "bayu.prasetyo@gmail.com", pass: "Bayu#Kelola2026$", expectedRole: "pengelola", name: "Bayu Prasetyo" },
    { email: "dimas.saputra@gmail.com", pass: "Dimas#SewaA101*", expectedRole: "penyewa", name: "Dimas Saputra" },
  ];

  for (const acc of testAccounts) {
    console.log(`\nTesting login untuk ${acc.name} (${acc.email})...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.pass,
    });


    if (authError || !authData.user) {
      console.error(`❌ GAGAL login ${acc.email}:`, authError?.message);
      continue;
    }

    console.log(`✓ Login berhasil! User ID: ${authData.user.id}`);

    // Periksa role di tabel profiles
    const { data: profile, error: profError } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, peran, aktif")
      .eq("id", authData.user.id)
      .single();

    if (profError || !profile) {
      console.error(`❌ GAGAL membaca profil:`, profError?.message);
    } else {
      console.log(`✓ Profil database terverifikasi:`);
      console.log(`  Nama: ${profile.nama_lengkap}`);
      console.log(`  Peran: ${profile.peran} (Ekspektasi: ${acc.expectedRole})`);
      console.log(`  Status Aktif: ${profile.aktif}`);
      if (profile.peran === acc.expectedRole) {
        console.log(`  ✅ ROLE MATCH: Sesuai harapan!`);
      } else {
        console.error(`  ❌ ROLE MISMATCH!`);
      }
    }

    await supabase.auth.signOut();
  }

  console.log("\n=== SIMULASI MATRIKS HAK AKSES ROUTE GUARD (401 vs 403) ===");

  function checkRouteAccess(role, pathname) {
    if (pathname === "/dashboard" || pathname === "/dashboard/") return true;
    if (pathname.startsWith("/dashboard/laporan")) return role === "pemilik";
    if (
      pathname.startsWith("/dashboard/unit") ||
      pathname.startsWith("/dashboard/penyewa") ||
      pathname.startsWith("/dashboard/kontrak")
    ) {
      return role === "pemilik" || role === "pengelola";
    }
    return true;
  }

  const testMatrix = [
    { role: "penyewa", path: "/dashboard", expectAllowed: true },
    { role: "penyewa", path: "/dashboard/unit", expectAllowed: false, expectStatus: 403 },
    { role: "penyewa", path: "/dashboard/kontrak", expectAllowed: false, expectStatus: 403 },
    { role: "penyewa", path: "/dashboard/laporan", expectAllowed: false, expectStatus: 403 },
    { role: "pengelola", path: "/dashboard/unit", expectAllowed: true },
    { role: "pengelola", path: "/dashboard/kontrak", expectAllowed: true },
    { role: "pengelola", path: "/dashboard/laporan", expectAllowed: false, expectStatus: 403 },
    { role: "pemilik", path: "/dashboard/unit", expectAllowed: true },
    { role: "pemilik", path: "/dashboard/laporan", expectAllowed: true },
  ];

  for (const item of testMatrix) {
    const isAllowed = checkRouteAccess(item.role, item.path);
    const pass = isAllowed === item.expectAllowed;
    const statusNote = item.expectAllowed ? "200 OK" : "403 Forbidden";
    console.log(
      `${pass ? "✅ PASS" : "❌ FAIL"} - Peran [${item.role.padEnd(9)}] akses [${item.path.padEnd(19)}] -> ${
        isAllowed ? "DIIZINKAN" : "DITOLAK (403)"
      } [${statusNote}]`
    );
  }

  console.log("\nSemua pengujian autentikasi dan route guard Tahap 3 selesai.");
}

testAuthAndRoles();
