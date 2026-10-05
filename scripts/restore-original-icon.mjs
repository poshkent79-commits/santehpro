import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Restores the very first original SantehPro app icon as requested by the user.
 * Preserves the original stylized wrench embracing the house with 4 red-tinted windows,
 * the stacked 3D "САНТЕХ", "ПРО" and subtitle "Твой карманный помощник по сантехнике".
 */
async function restoreOriginalIcon() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const rustoreDir = path.join(publicDir, 'rustore');
  const distRustoreDir = path.join(distDir, 'rustore');

  if (!fs.existsSync(rustoreDir)) fs.mkdirSync(rustoreDir, { recursive: true });
  if (fs.existsSync(distDir) && !fs.existsSync(distRustoreDir)) {
    fs.mkdirSync(distRustoreDir, { recursive: true });
  }

  // Load the exact original maskable svg that was in the repository from the start
  const originalSvgContent = fs.readFileSync(path.join(publicDir, 'pwa-maskable.svg'), 'utf-8');

  // Also create a version for standard square displays (slightly less scaled margin)
  const standardSvgContent = originalSvgContent.replace(
    'transform="translate(51, 51) scale(0.8)"',
    'transform="translate(25, 25) scale(0.9)"'
  );

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvgContent);

  // 1. RuStore 512x512 strictly square PNG (full-bleed background)
  const rustoreBuf = await sharp(Buffer.from(standardSvgContent))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(rustoreDir, 'icon-512x512.png'), rustoreBuf);

  // 2. Standard 512x512 app icon
  fs.writeFileSync(path.join(publicDir, 'icon.png'), rustoreBuf);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), rustoreBuf);

  // 3. Android Maskable 512x512 (exact safe-zone scaling)
  const maskableBuf = await sharp(Buffer.from(originalSvgContent))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskableBuf);

  // 4. 192x192 icon for mobile launchers
  const buf192 = await sharp(Buffer.from(standardSvgContent))
    .resize(192, 192)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);

  // 5. Apple Touch Icon (180x180)
  const buf180 = await sharp(Buffer.from(standardSvgContent))
    .resize(180, 180)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);

  // 6. Favicon (64x64)
  const buf64 = await sharp(Buffer.from(standardSvgContent))
    .resize(64, 64)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf64);

  // 7. Copy to dist/
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(path.join(publicDir, 'icon.svg'), path.join(distDir, 'icon.svg'));
    fs.copyFileSync(path.join(publicDir, 'icon.png'), path.join(distDir, 'icon.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-512x512.png'), path.join(distDir, 'pwa-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), path.join(distDir, 'pwa-maskable-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-192x192.png'), path.join(distDir, 'pwa-192x192.png'));
    fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(distDir, 'apple-touch-icon.png'));
    fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
    fs.copyFileSync(path.join(rustoreDir, 'icon-512x512.png'), path.join(distRustoreDir, 'icon-512x512.png'));
  }

  console.log('✓ Successfully restored the original first variant of the icon!');
}

restoreOriginalIcon().catch(err => {
  console.error('Error restoring original icon:', err);
  process.exit(1);
});
