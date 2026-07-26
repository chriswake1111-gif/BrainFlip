/**
 * tools/generate_pwa_assets.js
 * 產生 PWA 所需之圖示檔 (包含 SVG 與 PNG 檔)
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#090d16"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#f472b6" stroke-width="20" stroke-dasharray="30 15"/>
  <text x="256" y="270" font-size="180" font-weight="900" fill="#38bdf8" text-anchor="middle" font-family="sans-serif">🧠</text>
  <text x="256" y="420" font-size="42" font-weight="bold" fill="#a7f3d0" text-anchor="middle" font-family="sans-serif">腦齡逆轉</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'vite.svg'), svgContent);

// Function to generate pure uncompressed/deflated PNG buffer in Node.js
function createPngBuffer(width, height, r = 9, g = 13, b = 22) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw IDAT scanlines
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      // Gradient background
      const factor = (x + y) / (width + height);
      rawData[pxOffset] = Math.min(255, Math.floor(r + factor * 50));
      rawData[pxOffset + 1] = Math.min(255, Math.floor(g + factor * 60));
      rawData[pxOffset + 2] = Math.min(255, Math.floor(b + factor * 100));
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);

  const crcBuf = buf.slice(4, 8 + len);
  const crc = crc32(crcBuf);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// Minimal CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xedb88320;
      else crc = crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Write PNG files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPngBuffer(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPngBuffer(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPngBuffer(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPngBuffer(64, 64));

console.log('✅ 成功產生 PWA 所需之所有 PNG, SVG, Icon 圖示素材檔！');
