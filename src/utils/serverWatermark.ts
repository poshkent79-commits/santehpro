import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Server-side image watermarking utility for СантехПро using Sharp.
 * Stretches or positions an official "СантехПро • Проверено" watermark badge
 * on photos during Admin approval or direct cloud uploads.
 */

export function generateWatermarkSvg(imageWidth: number, imageHeight: number): { svg: Buffer; top: number; left: number } {
  const minDim = Math.min(imageWidth, imageHeight);
  const scale = Math.min(Math.max(minDim / 900, 0.75), 1.6);

  const titleSize = Math.round(18 * scale);
  const subSize = Math.round(12 * scale);
  const badgeW = Math.round(230 * scale);
  const badgeH = Math.round(38 * scale);
  const margin = Math.round(20 * scale);
  const iconR = Math.round(7 * scale);

  const left = Math.max(10, imageWidth - badgeW - margin);
  const top = Math.max(10, imageHeight - badgeH - margin);

  const svgStr = `
<svg width="${badgeW}" height="${badgeH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${badgeW}" height="${badgeH}" rx="${Math.round(10 * scale)}" 
        fill="#0b1326" fill-opacity="0.85" stroke="#38bdf8" stroke-width="${Math.max(1, 1.5 * scale)}" stroke-opacity="0.7" filter="url(#shadow)"/>
  
  <!-- Cyan water droplet emblem -->
  <circle cx="${Math.round(18 * scale)}" cy="${Math.round(badgeH / 2)}" r="${iconR}" fill="#06b6d4"/>
  <circle cx="${Math.round(16 * scale)}" cy="${Math.round(badgeH / 2 - 2 * scale)}" r="${Math.round(iconR * 0.35)}" fill="#ffffff"/>
  
  <!-- Title: СантехПро -->
  <text x="${Math.round(34 * scale)}" y="${Math.round(badgeH / 2 + titleSize * 0.35)}" 
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
        font-weight="900" font-size="${titleSize}" fill="#ffffff">СантехПро</text>
  
  <!-- Subtitle: • Проверено -->
  <text x="${Math.round(145 * scale)}" y="${Math.round(badgeH / 2 + subSize * 0.3)}" 
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
        font-weight="700" font-size="${subSize}" fill="#38bdf8">• Проверено</text>
</svg>
  `.trim();

  return {
    svg: Buffer.from(svgStr),
    top,
    left,
  };
}

/**
 * Applies the official "СантехПро" watermark to an image buffer and returns the processed buffer.
 */
export async function watermarkImageBuffer(buffer: Buffer, format: 'webp' | 'jpeg' = 'webp'): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || 800;

  const { svg, top, left } = generateWatermarkSvg(width, height);

  const pipeline = sharp(buffer)
    .composite([
      {
        input: svg,
        top,
        left,
      },
    ]);

  if (format === 'webp') {
    return await pipeline.webp({ quality: 86 }).toBuffer();
  } else {
    return await pipeline.jpeg({ quality: 86 }).toBuffer();
  }
}

/**
 * Watermarks a photo URL or data URL on the server.
 * If it points to /uploads/..., the physical file is updated and preserved.
 * If it is a base64 data URL, a watermarked base64 data URL is returned.
 */
export async function watermarkPhoto(
  photoUrl: string,
  uploadsDirs: string[]
): Promise<string> {
  try {
    // Case 1: Uploaded file path (/uploads/...)
    if (typeof photoUrl === 'string' && photoUrl.startsWith('/uploads/')) {
      const fileName = path.basename(photoUrl);
      for (const dir of uploadsDirs) {
        const filePath = path.join(dir, fileName);
        if (fs.existsSync(filePath)) {
          const buffer = await fs.promises.readFile(filePath);
          const ext = path.extname(fileName).toLowerCase();
          const format = ext === '.webp' ? 'webp' : 'jpeg';
          const watermarked = await watermarkImageBuffer(buffer, format);

          // Write back to all directories to keep in sync
          for (const targetDir of uploadsDirs) {
            const targetPath = path.join(targetDir, fileName);
            await fs.promises.writeFile(targetPath, watermarked);
          }
          return photoUrl;
        }
      }
    }

    // Case 2: Base64 data URL
    if (typeof photoUrl === 'string' && photoUrl.startsWith('data:image/')) {
      const match = photoUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const inputBuffer = Buffer.from(base64Data, 'base64');
        const format = mimeType.includes('webp') ? 'webp' : 'jpeg';
        const watermarked = await watermarkImageBuffer(inputBuffer, format);
        return `data:image/${format};base64,${watermarked.toString('base64')}`;
      }
    }

    return photoUrl;
  } catch (err) {
    console.warn('Failed to watermark photo on server:', err);
    return photoUrl;
  }
}
