const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImageClean(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isStudioBlue(r, g, b) {
    // Studio blue: Blue > 95 AND Blue is much greater than Red (b > r * 1.35) AND Blue > Green
    return (b > 90 && b > r * 1.35 && b > g * 1.05);
  }

  // Seed BFS hanya dari baris paling atas (y = 0) dan kolom tepi luar (x=0, x=width-1)
  for (let x = 0; x < width; x++) {
    const idx = (0 * width + x) * channels;
    if (isStudioBlue(data[idx], data[idx + 1], data[idx + 2])) {
      visited[0 * width + x] = 1;
      queue.push(x, 0);
    }
  }

  for (let y = 1; y < height; y++) {
    const idxL = (y * width + 0) * channels;
    if (!visited[y * width + 0] && isStudioBlue(data[idxL], data[idxL + 1], data[idxL + 2])) {
      visited[y * width + 0] = 1;
      queue.push(0, y);
    }
    const idxR = (y * width + (width - 1)) * channels;
    if (!visited[y * width + (width - 1)] && isStudioBlue(data[idxR], data[idxR + 1], data[idxR + 2])) {
      visited[y * width + (width - 1)] = 1;
      queue.push(width - 1, y);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const curPos = (cy * width + cx) * channels;
    // Ubah background ke putih murni
    data[curPos] = 255;
    data[curPos + 1] = 255;
    data[curPos + 2] = 255;

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          visited[nPos] = 1;
          const nIdx = nPos * channels;
          if (isStudioBlue(data[nIdx], data[nIdx + 1], data[nIdx + 2])) {
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .jpeg({ quality: 96 })
    .toFile(outputPath);
}

async function main() {
  const ktpFacesDir = path.join(__dirname, '..', 'public', 'ktp-faces');
  const profilesDir = path.join(__dirname, '..', 'public', 'profiles');

  // 1. 9 Wanita
  for (let i = 0; i < 9; i++) {
    await processImageClean(
      path.join(ktpFacesDir, `w_${i}_blue.jpg`),
      path.join(profilesDir, `w_${i}_white.jpg`)
    );
  }

  // 2. 13 Pria
  for (let i = 0; i < 13; i++) {
    await processImageClean(
      path.join(ktpFacesDir, `m_${i}_blue.jpg`),
      path.join(profilesDir, `m_${i}_white.jpg`)
    );
  }

  // 3. Staf: Ratna (Pemilik), Bayu (Pengelola), Sinta (Pengelola)
  await processImageClean(path.join(ktpFacesDir, 'w_6_blue.jpg'), path.join(profilesDir, 'ratna_white.jpg'));
  await processImageClean(path.join(ktpFacesDir, 'm_7_blue.jpg'), path.join(profilesDir, 'bayu_white.jpg'));
  await processImageClean(path.join(ktpFacesDir, 'w_7_blue.jpg'), path.join(profilesDir, 'sinta_white.jpg'));

  console.log('CLEAN PROFILE PHOTOS GENERATED');
}

main().catch(console.error);
