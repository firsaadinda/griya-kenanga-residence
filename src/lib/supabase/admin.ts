import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * Supabase Admin Client
 * PENTING: Hanya boleh digunakan di server backend untuk operasi dengan hak istimewa
 * (misal webhook Mayar, sinkronisasi akun pengguna, atau operasi database bypass RLS).
 * DILARANG mengekspos client ini ke sisi browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi di environment variables."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
