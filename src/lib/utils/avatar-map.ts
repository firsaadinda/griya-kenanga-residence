// Pemetaan resmi 25 pengguna Griya Kenanga Residence ke foto profil latar belakang putih
// 1 Pemilik + 2 Pengelola + 22 Penyewa (13 Pria, 9 Wanita)

export function getUserAvatarUrl(namaOrEmail?: string): string {
  if (!namaOrEmail) return "/profiles/bayu_white.jpg";
  const key = namaOrEmail.toLowerCase().trim();

  // 1. Pemilik & Pengelola
  if (key.includes("ratna")) return "/profiles/ratna_white.jpg";
  if (key.includes("bayu")) return "/profiles/bayu_white.jpg";
  if (key.includes("sinta")) return "/profiles/sinta_white.jpg";

  // 2. 9 Penyewa Wanita (Sesuai KTP w_0 s/d w_8)
  if (key.includes("bella")) return "/profiles/w_0_white.jpg";
  if (key.includes("eka")) return "/profiles/w_1_white.jpg";
  if (key.includes("hana")) return "/profiles/w_2_white.jpg";
  if (key.includes("jihan")) return "/profiles/w_3_white.jpg";
  if (key.includes("laras")) return "/profiles/w_4_white.jpg";
  if (key.includes("nadia")) return "/profiles/w_5_white.jpg";
  if (key.includes("putri")) return "/profiles/w_6_white.jpg";
  if (key.includes("salma")) return "/profiles/w_7_white.jpg";
  if (key.includes("vina")) return "/profiles/w_8_white.jpg";

  // 3. 13 Penyewa Pria (Sesuai KTP m_0 s/d m_12)
  if (key.includes("aditya")) return "/profiles/m_0_white.jpg";
  if (key.includes("cahya")) return "/profiles/m_1_white.jpg";
  if (key.includes("dimas")) return "/profiles/m_2_white.jpg";
  if (key.includes("fajar")) return "/profiles/m_3_white.jpg";
  if (key.includes("gilang")) return "/profiles/m_4_white.jpg";
  if (key.includes("indra")) return "/profiles/m_5_white.jpg";
  if (key.includes("kevin")) return "/profiles/m_6_white.jpg";
  if (key.includes("rizki") || key.includes("muhammad")) return "/profiles/m_7_white.jpg";
  if (key.includes("oki")) return "/profiles/m_8_white.jpg";
  if (key.includes("raka")) return "/profiles/m_9_white.jpg";
  if (key.includes("teguh")) return "/profiles/m_10_white.jpg";
  if (key.includes("wahyu")) return "/profiles/m_11_white.jpg";
  if (key.includes("yoga")) return "/profiles/m_12_white.jpg";

  // Fallback berdasarkan jenis kelamin kata kunci
  const femaleKeywords = ["anisa", "ayu", "dewi", "mira", "nur", "safitri", "wulandari"];
  if (femaleKeywords.some((w) => key.includes(w))) {
    return "/profiles/w_0_white.jpg";
  }

  return "/profiles/m_0_white.jpg";
}
