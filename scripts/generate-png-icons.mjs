import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

async function generateAllIcons() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const svgPath = path.join(publicDir, 'icon.svg');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generating official SantehPro icons from icon.svg...');

  // 1. Regular 512x512 icon
  const buf512 = await sharp(svgPath).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon.png'), buf512);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);

  // 2. 192x192 icon
  const buf192 = await sharp(svgPath).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);

  // 3. Apple touch icon (180x180)
  const buf180 = await sharp(svgPath).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);

  // 4. Favicon
  const buf64 = await sharp(svgPath).resize(64, 64).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf64);

  // 5. Maskable icon for Android / Samsung One UI:
  // Safe zone: inner 80% circle (or 390x390 inside 512x512)
  const innerResized = await sharp(svgPath).resize(400, 400).toBuffer();
  const maskableBuf = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 14, g: 23, b: 38, alpha: 1 }
    }
  })
  .composite([{ input: innerResized, top: 56, left: 56 }])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskableBuf);

  // Also sync to dist/ if dist exists
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(path.join(publicDir, 'icon.png'), path.join(distDir, 'icon.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-512x512.png'), path.join(distDir, 'pwa-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-192x192.png'), path.join(distDir, 'pwa-192x192.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), path.join(distDir, 'pwa-maskable-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(distDir, 'apple-touch-icon.png'));
    fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
    fs.copyFileSync(svgPath, path.join(distDir, 'icon.svg'));
    console.log('Icons also copied to dist/ directory!');
  }

  console.log('All SantehPro icons successfully generated!');
}

generateAllIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
