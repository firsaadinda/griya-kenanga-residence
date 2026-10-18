import sharp from "sharp";
import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "public", "ktp-faces");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Flood-fill replace red background with Indonesian e-KTP blue (#1A56A6: R 26, G 86, B 166)
async function createBlueBg(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed with all border pixels (top, bottom, left, right)
  for (let x = 0; x < width; x++) {
    queue.push(x); // top
    queue.push((height - 1) * width + x); // bottom
    visited[x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width); // left
    queue.push(y * width + (width - 1)); // right
    visited[y * width] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  function isRedBg(idx) {
    const p = idx * channels;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    // Red passport studio background threshold
    return r > 120 && (r - g) > 60 && (r - b) > 60;
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const p = curr * channels;

    if (isRedBg(curr)) {
      data[p] = 26;     // Blue R
      data[p + 1] = 86;  // Blue G
      data[p + 2] = 166; // Blue B
    }

    const x = curr % width;
    const y = Math.floor(curr / width);

    // 4-way neighbors
    const neighbors = [];
    if (x > 0) neighbors.push(curr - 1);
    if (x < width - 1) neighbors.push(curr + 1);
    if (y > 0) neighbors.push(curr - width);
    if (y < height - 1) neighbors.push(curr + width);

    for (const n of neighbors) {
      if (!visited[n]) {
        visited[n] = 1;
        if (isRedBg(n)) {
          queue.push(n);
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

async function processAll() {
  const wGridPath = "C:/Users/Tuf Gaming/.gemini/antigravity-ide/brain/a01ae0a8-5f17-40f3-88e2-846a362e24d9/pas_foto_wanita_grid_1792301173983.jpg";
  const mGridPath = "C:/Users/Tuf Gaming/.gemini/antigravity-ide/brain/a01ae0a8-5f17-40f3-88e2-846a362e24d9/pas_foto_pria_grid_1792301208596.jpg";
  const mExtraPath = "C:/Users/Tuf Gaming/.gemini/antigravity-ide/brain/a01ae0a8-5f17-40f3-88e2-846a362e24d9/pas_foto_pria_extra_1792301260979.jpg";

  console.log("Slicing 9 female photos...");
  // 3x3 grid (1024x1024) -> cell ~341px, crop 325x325 centered in each cell
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const left = Math.round(col * 341.33 + 8);
      const top = Math.round(row * 341.33 + 8);
      const width = 325;
      const height = 325;

      const redOut = path.join(outDir, `w_${idx}_red.jpg`);
      const blueOut = path.join(outDir, `w_${idx}_blue.jpg`);

      await sharp(wGridPath)
        .extract({ left, top, width, height })
        .resize(300, 390, { fit: "cover" }) // 3:4 passport aspect ratio
        .jpeg({ quality: 92 })
        .toFile(redOut);

      await createBlueBg(redOut, blueOut);
      console.log(`Saved w_${idx} (red & blue)`);
    }
  }

  console.log("Slicing first 9 male photos...");
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const left = Math.round(col * 341.33 + 8);
      const top = Math.round(row * 341.33 + 8);
      const width = 325;
      const height = 325;

      const redOut = path.join(outDir, `m_${idx}_red.jpg`);
      const blueOut = path.join(outDir, `m_${idx}_blue.jpg`);

      await sharp(mGridPath)
        .extract({ left, top, width, height })
        .resize(300, 390, { fit: "cover" })
        .jpeg({ quality: 92 })
        .toFile(redOut);

      await createBlueBg(redOut, blueOut);
      console.log(`Saved m_${idx} (red & blue)`);
    }
  }

  console.log("Slicing 4 extra male photos (2x2 grid)...");
  // 2x2 grid (1024x1024) -> cell 512px
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const idx = 9 + (row * 2 + col);
      const left = Math.round(col * 512 + 10);
      const top = Math.round(row * 512 + 10);
      const width = 492;
      const height = 492;

      const redOut = path.join(outDir, `m_${idx}_red.jpg`);
      const blueOut = path.join(outDir, `m_${idx}_blue.jpg`);

      await sharp(mExtraPath)
        .extract({ left, top, width, height })
        .resize(300, 390, { fit: "cover" })
        .jpeg({ quality: 92 })
        .toFile(redOut);

      await createBlueBg(redOut, blueOut);
      console.log(`Saved m_${idx} (red & blue)`);
    }
  }

  console.log("All 22 tenant photos (Red & Blue variants) generated successfully in public/ktp-faces/!");
}

processAll().catch(console.error);
