"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/**
 * SessionKeeper:
 * Komponen Client-Side yang berjalan di latar belakang halaman dashboard:
 * 1. Mendengarkan perubahan status autentikasi Supabase (onAuthStateChange), seperti TOKEN_REFRESHED.
 * 2. Secara berkala (setiap 4 menit) memeriksa dan memperbarui token sesi di balik layar selama tab aktif.
 * 3. Menjaga sesi saat pengguna kembali membuka tab/jendela yang sebelumnya tidak aktif (visibilitychange & focus).
 */
export function SessionKeeper() {
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // 1. Dengarkan event auth Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        // Token berhasil diperbarui secara otomatis di balik layar
        router.refresh();
      } else if (event === "SIGNED_OUT") {
        // Pengguna sengaja keluar
        router.push("/login");
      }
    });

    // 2. Fungsi untuk refresh token di latar belakang
    const refreshSessionIfNeeded = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Gagal membaca session:", error.message);
          return;
        }

        if (data.session) {
          const expiresAt = data.session.expires_at; // timestamp dalam detik
          const now = Math.floor(Date.now() / 1000);
          
          // Jika token akan habis dalam waktu kurang dari 15 menit (900 detik), refresh sekarang
          if (expiresAt && expiresAt - now < 900) {
            const { error: refreshErr } = await supabase.auth.refreshSession();
            if (refreshErr) {
              console.warn("Auto-refresh session warning:", refreshErr.message);
            }
          }
        }
      } catch (err) {
        console.warn("Session check error:", err);
      }
    };

    // Jalankan periodic heartbeat setiap 4 menit (240.000 ms)
    const intervalId = setInterval(refreshSessionIfNeeded, 4 * 60 * 1000);

    // 3. Ketika pengguna kembali ke tab browser (misal setelah berpindah aplikasi atau tab lain)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSessionIfNeeded();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [router]);

  return null;
}
