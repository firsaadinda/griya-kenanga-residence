import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ktpFacesDir = path.join(__dirname, "..", "public", "ktp-faces");
const profilesDir = path.join(__dirname, "..", "public", "profiles");

if (!fs.existsSync(ktpFacesDir)) fs.mkdirSync(ktpFacesDir, { recursive: true });
if (!fs.existsSync(profilesDir)) fs.mkdirSync(profilesDir, { recursive: true });

const brainDir = "C:/Users/Tuf Gaming/.gemini/antigravity-ide/brain/a01ae0a8-5f17-40f3-88e2-846a362e24d9";
const wGridPath = path.join(brainDir, "pas_foto_wanita_grid_1792301173983.jpg");
const mGridPath = path.join(brainDir, "pas_foto_pria_grid_1792301208596.jpg");
const mExtraPath = path.join(brainDir, "pas_foto_pria_extra_1792301260979.jpg");
const ratnaPath = path.join(brainDir, "pas_foto_wanita_1792300023257.jpg");
const bayuPath = path.join(brainDir, "pas_foto_pria_1792299998264.jpg");

// Warna Background Resmi
const COLOR_WHITE = { r: 255, g: 255, b: 255 };
const COLOR_BLUE = { r: 26, g: 86, b: 166 };   // #1A56A6 (e-KTP Tahun Lahir Genap)
const COLOR_RED = { r: 186, g: 26, b: 28 };    // #BA1A1C (e-KTP Tahun Lahir Ganjil)

/**
 * Memproses pas foto secara sempurna:
 * 1. Deteksi studio red background dengan BFS Flood-fill dari sudut & batas atas
 * 2. Hilangkan red-spill pada rambut hitam dan kerah/baju putih di tepi background
 * 3. Pertahankan warna kulit telinga, dagu, & leher alami tanpa disaturasi
 * 4. Untuk hijab merah/maroon (w_5), jaga warna hijab tetap merah marun murni
 * 5. Soft 5x5 feathering ke background target
 * 6. Format standar 300x390 dengan 'contain' agar telinga dan bahu 100% utuh
 */
async function processFaceToBg(rawBuffer, targetColor, outPath, options = {}) {
  const { isMaroonHijab = false } = options;
  const { data, info } = rawBuffer;
  const { width, height, channels } = info;
  const isBg = new Uint8Array(width * height);
  const queue = [];

  const sampleR = data[(6 * width + 6) * channels];
  const sampleG = data[(6 * width + 6) * channels + 1];
  const sampleB = data[(6 * width + 6) * channels + 2];

  function isStudioBg(r, g, b) {
    const dist = Math.abs(r - sampleR) + Math.abs(g - sampleG) + Math.abs(b - sampleB);
    if (dist < 40) return true;
    if (r > 110 && g < 45 && b < 45 && (r - g) > 65 && (r - b) > 65 && dist < 65) return true;
    return false;
  }

  // Seed BFS dari batas atas (6 baris teratas)
  const topRows = Math.min(8, Math.floor(height * 0.05));
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < topRows; y++) {
      const idx = (y * width + x) * channels;
      if (isStudioBg(data[idx], data[idx + 1], data[idx + 2]) && !isBg[y * width + x]) {
        isBg[y * width + x] = 1;
        queue.push(x, y);
      }
    }
  }

  // Seed BFS dari sisi luar kiri & kanan (sampai sebelum bahu)
  const maxSideY = Math.floor(height * 0.65);
  for (let y = topRows; y < maxSideY; y++) {
    for (const x of [0, 1, 2, 3, width - 4, width - 3, width - 2, width - 1]) {
      const idx = (y * width + x) * channels;
      if (isStudioBg(data[idx], data[idx + 1], data[idx + 2]) && !isBg[y * width + x]) {
        isBg[y * width + x] = 1;
        queue.push(x, y);
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];
    const nbrs = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];
    for (const [nx, ny] of nbrs) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!isBg[nPos]) {
          const nIdx = nPos * channels;
          const nr = data[nIdx], ng = data[nIdx + 1], nb = data[nIdx + 2];
          if (isStudioBg(nr, ng, nb)) {
            isBg[nPos] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  const outBuf = Buffer.alloc(width * height * channels);
  const { r: tR, g: tG, b: tB } = targetColor;
  const isWhiteOrBlue = (tR > 200 && tG > 200 && tB > 200) || (tB > tR);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      const idx = pos * channels;
      let r = data[idx], g = data[idx + 1], b = data[idx + 2];

      if (isBg[pos]) {
        outBuf[idx] = tR;
        outBuf[idx + 1] = tG;
        outBuf[idx + 2] = tB;
        continue;
      }

      if (isWhiteOrBlue && !isMaroonHijab) {
        const maxGB = Math.max(g, b);
        // Despill rambut hitam di seluruh zona rambut (mengecualikan leher & dagu di tengah bawah)
        const isHairZone = (y < height * 0.55 || x < width * 0.34 || x > width * 0.66);
        if (isHairZone && maxGB < 85 && r > maxGB + 8) {
          r = maxGB + 4;
        }
      }

      // Hitung jarak ke background (radius 2 untuk 5x5 feathering)
      let bgDistCount = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (isBg[ny * width + nx]) bgDistCount++;
          } else {
            bgDistCount++;
          }
        }
      }

      if (bgDistCount > 0) {
        if (isWhiteOrBlue) {
          const maxGB = Math.max(g, b);
          if (isMaroonHijab) {
            if (maxGB < 60) {
              r = Math.min(r, maxGB);
            } else if (maxGB > 175) {
              r = Math.min(r, Math.round((g + b) / 2));
            } else {
              r = Math.min(r, maxGB + 30);
            }
          } else {
            if (maxGB > 155) {
              // Despill kerah kemeja putih
              r = Math.min(r, Math.round((g + b) / 2));
            } else if (y > height * 0.65 && r > maxGB + 15) {
              // Despill bahu pakaian putih
              r = Math.round((g + b) / 2);
            }
          }
        }

        const fgWeight = Math.max(0, Math.min(1, 1 - (bgDistCount / 20)));
        outBuf[idx] = Math.round(fgWeight * r + (1 - fgWeight) * tR);
        outBuf[idx + 1] = Math.round(fgWeight * g + (1 - fgWeight) * tG);
        outBuf[idx + 2] = Math.round(fgWeight * b + (1 - fgWeight) * tB);
      } else {
        outBuf[idx] = r;
        outBuf[idx + 1] = g;
        outBuf[idx + 2] = b;
      }
    }
  }

  // Format pas foto resmi 300x390 dengan 'contain' agar telinga dan bahu 100% utuh
  await sharp(outBuf, { raw: { width, height, channels } })
    .resize(300, 390, {
      fit: "contain",
      background: { r: tR, g: tG, b: tB }
    })
    .jpeg({ quality: 96 })
    .toFile(outPath);
}

async function main() {
  console.log("=== MEMULAI REGENERASI LENGKAP SEMUA FOTO KTP & PROFIL ===");

  // 1. 9 Wanita (w_0 s/d w_8) dari grid 3x3
  console.log("\n[1/5] Memproses 9 foto wanita (w_0 s/d w_8)...");
  const wLefts = [12, 351, 690];
  const wTops = [12, 351, 690];
  const wSize = 320;

  let sintaRawCell = null;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const left = wLefts[col];
      const top = wTops[row];
      const isMaroonHijab = (idx === 5); // w_5 = Nadia Salsabila (maroon hijab)

      const rawCell = await sharp(wGridPath)
        .extract({ left, top, width: wSize, height: wSize })
        .raw()
        .toBuffer({ resolveWithObject: true });

      if (idx === 7) {
        sintaRawCell = rawCell; // Simpan untuk foto profil Sinta Maharani
      }

      // KTP Merah
      await processFaceToBg(rawCell, COLOR_RED, path.join(ktpFacesDir, `w_${idx}_red.jpg`), { isMaroonHijab });
      // KTP Biru
      await processFaceToBg(rawCell, COLOR_BLUE, path.join(ktpFacesDir, `w_${idx}_blue.jpg`), { isMaroonHijab });
      // Profil Putih
      await processFaceToBg(rawCell, COLOR_WHITE, path.join(profilesDir, `w_${idx}_white.jpg`), { isMaroonHijab });

      console.log(`  -> w_${idx} selesai (red, blue, white)`);
    }
  }

  // 2. 9 Pria Pertama (m_0 s/d m_8) dari grid 3x3
  console.log("\n[2/5] Memproses 9 foto pria pertama (m_0 s/d m_8)...");
  const mLefts = [12, 351, 690];
  const mTops = [12, 351, 690];
  const mSize = 320;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const left = mLefts[col];
      const top = mTops[row];

      const rawCell = await sharp(mGridPath)
        .extract({ left, top, width: mSize, height: mSize })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // KTP Merah
      await processFaceToBg(rawCell, COLOR_RED, path.join(ktpFacesDir, `m_${idx}_red.jpg`));
      // KTP Biru
      await processFaceToBg(rawCell, COLOR_BLUE, path.join(ktpFacesDir, `m_${idx}_blue.jpg`));
      // Profil Putih
      await processFaceToBg(rawCell, COLOR_WHITE, path.join(profilesDir, `m_${idx}_white.jpg`));

      console.log(`  -> m_${idx} selesai (red, blue, white)`);
    }
  }

  // 3. 4 Pria Tambahan (m_9 s/d m_12) dari grid 2x2
  console.log("\n[3/5] Memproses 4 foto pria tambahan (m_9 s/d m_12)...");
  const extraLefts = [20, 524];
  const extraTops = [20, 524];
  const extraSize = 480;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const idx = 9 + (row * 2 + col);
      const left = extraLefts[col];
      const top = extraTops[row];

      const rawCell = await sharp(mExtraPath)
        .extract({ left, top, width: extraSize, height: extraSize })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // KTP Merah
      await processFaceToBg(rawCell, COLOR_RED, path.join(ktpFacesDir, `m_${idx}_red.jpg`));
      // KTP Biru
      await processFaceToBg(rawCell, COLOR_BLUE, path.join(ktpFacesDir, `m_${idx}_blue.jpg`));
      // Profil Putih
      await processFaceToBg(rawCell, COLOR_WHITE, path.join(profilesDir, `m_${idx}_white.jpg`));

      console.log(`  -> m_${idx} selesai (red, blue, white)`);
    }
  }

  // 4. Foto Pemilik: Ratna Kusumawardani
  console.log("\n[4/5] Memproses foto profil Pemilik (Ratna Kusumawardani)...");
  const ratnaRaw = await sharp(ratnaPath).raw().toBuffer({ resolveWithObject: true });
  await processFaceToBg(ratnaRaw, COLOR_WHITE, path.join(profilesDir, "ratna_white.jpg"));
  console.log("  -> ratna_white.jpg selesai");

  // 5. Foto Pengelola: Bayu Prasetyo & Sinta Maharani
  console.log("\n[5/5] Memproses foto profil Pengelola (Bayu & Sinta)...");
  const bayuRaw = await sharp(bayuPath).raw().toBuffer({ resolveWithObject: true });
  await processFaceToBg(bayuRaw, COLOR_WHITE, path.join(profilesDir, "bayu_white.jpg"));
  console.log("  -> bayu_white.jpg selesai");

  if (sintaRawCell) {
    await processFaceToBg(sintaRawCell, COLOR_WHITE, path.join(profilesDir, "sinta_white.jpg"));
    console.log("  -> sinta_white.jpg selesai");
  }

  console.log("\n=== SEMUA 44 FOTO KTP & 25 FOTO PROFIL BERHASIL DIREGENERASI SEMPURNA! ===");
}

main().catch((err) => {
  console.error("Gagal meregenerasi foto:", err);
  process.exit(1);
});
