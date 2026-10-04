import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makePng(width, height, isMaskable = false) {
  // Generate RGBA buffer with scanline filter bytes
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2;

  // Safe zone for maskable icon: 80% circle
  const safeMargin = isMaskable ? 0.8 : 0.92;
  const cornerR = isMaskable ? 0 : width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background gradient: #0f172a to #020617
      const t = (x + y) / (width + height);
      let r = Math.round(15 * (1 - t) + 2 * t);
      let g = Math.round(23 * (1 - t) + 6 * t);
      let b = Math.round(42 * (1 - t) + 23 * t);
      let a = 255;

      // Rounded squircle clipping if not maskable
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > cornerR) {
          a = 0;
        }
      }

      if (a > 0) {
        // Distance from center
        const dx = (x - cx) / (width * 0.5);
        const dy = (y - cy) / (height * 0.5);
        const distCenter = Math.sqrt(dx * dx + dy * dy);

        // Ambient cyan glow
        if (distCenter < 0.65) {
          const glowFactor = (1 - distCenter / 0.65) * 0.2;
          r = Math.min(255, Math.round(r + 6 * glowFactor));
          g = Math.min(255, Math.round(g + 182 * glowFactor));
          b = Math.min(255, Math.round(b + 212 * glowFactor));
        }

        // Droplet shape:
        // Top peak at y: -0.6, bottom belly at y: 0.35, radius: 0.4
        // Normalized coord relative to droplet center (cx, cy + height * 0.05)
        const dnx = (x - cx) / (width * 0.36);
        const dny = (y - (cy + height * 0.04)) / (height * 0.4);

        // Circular bottom
        const dropDist = Math.sqrt(dnx * dnx + (dny - 0.2) * (dny - 0.2));
        const isInCircle = dropDist <= 0.6;

        // Cone top
        const isInCone = dny < 0.2 && dny > -0.85 && Math.abs(dnx) <= (0.85 + dny) * 0.55;

        if (isInCircle || isInCone) {
          // Inside water droplet - bright cyan to deep ocean gradient
          const dropT = (dny + 0.85) / 1.5;
          r = Math.round(103 * (1 - dropT) + 14 * dropT);
          g = Math.round(232 * (1 - dropT) + 165 * dropT);
          b = Math.round(249 * (1 - dropT) + 233 * dropT);

          // Wrench silhouette inside droplet
          // Wrench handle from (cx - w*0.08, cy + h*0.02) to (cx + w*0.09, cy + h*0.2)
          const wx = x - cx;
          const wy = y - (cy + height * 0.08);
          // Rotate coordinates by -45 degrees
          const rx = (wx + wy) * 0.7071;
          const ry = (-wx + wy) * 0.7071;

          // Handle: rx in [-width*0.03, width*0.03], ry in [-height*0.18, height*0.14]
          const isHandle = Math.abs(rx) < width * 0.032 && Math.abs(ry) < height * 0.16;

          // Head at top of handle: ry < -height*0.12, circle with cutout
          const headDist = Math.sqrt(rx * rx + (ry + height * 0.16) * (ry + height * 0.16));
          const isHead = headDist < width * 0.075 && !(Math.abs(rx) < width * 0.025 && ry < -height * 0.16);

          // Handle loop at bottom: ry > height*0.14
          const loopDist = Math.sqrt(rx * rx + (ry - height * 0.16) * (ry - height * 0.16));
          const isLoop = loopDist < width * 0.045;
          const isLoopHole = loopDist < width * 0.02;

          if ((isHandle || isHead || isLoop) && !isLoopHole) {
            // White wrench with slight cool tint
            r = 248;
            g = 250;
            b = 252;
          } else {
            // Droplet shine highlight
            if (dnx < -0.15 && dnx > -0.45 && dny > -0.4 && dny < 0.3) {
              r = Math.min(255, r + 70);
              g = Math.min(255, g + 50);
              b = 255;
            }
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // Assemble PNG buffer
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: standard
  ihdrData[12] = 0; // Interlace: None

  const ihdrChunk = Buffer.concat([
    Buffer.from('IHDR'),
    ihdrData
  ]);
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(ihdrChunk), 0);

  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);

  // IDAT
  const idatChunk = Buffer.concat([
    Buffer.from('IDAT'),
    compressed
  ]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(idatChunk), 0);

  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressed.length, 0);

  // IEND
  const iendChunk = Buffer.from('IEND');
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendChunk), 0);

  const iendLength = Buffer.alloc(4);
  iendLength.writeUInt32BE(0, 0);

  return Buffer.concat([
    signature,
    ihdrLength,
    ihdrChunk,
    ihdrCrc,
    idatLength,
    idatChunk,
    idatCrc,
    iendLength,
    iendChunk,
    iendCrc
  ]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA PNG icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), makePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), makePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), makePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), makePng(180, 180, false));
console.log('Icons successfully generated in public/!');
