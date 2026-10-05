import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Recreates the exact original launch logo from Screenshot_20261005_184221_WhatsApp.jpg:
 * - Deep dark navy / midnight slate background.
 * - Vibrant cyan water droplet with smooth geometric curves and left-side vertical highlight.
 * - Bold, crisp white wrench (рожковый ключ) diagonally positioned at 45 degrees with circular eyelet handle.
 * - Pure iconic minimalist design with zero text clutter.
 */
function createExactDropletWrenchSvg({ isMaskable = false } = {}) {
  // Safe scale: maskable fits inside 80% circle, standard has ample breathing room
  const scale = isMaskable ? 0.80 : 0.88;
  const transform = `translate(256, 256) scale(${scale}) translate(-256, -256)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Deep Midnight Slate (#080d18 to #0b1322) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a101d" />
      <stop offset="50%" stop-color="#070c16" />
      <stop offset="100%" stop-color="#040810" />
    </linearGradient>

    <!-- Droplet Cyan-Blue Gradient -->
    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#40c4ff" />
      <stop offset="35%" stop-color="#00b0ff" />
      <stop offset="75%" stop-color="#0091ea" />
      <stop offset="100%" stop-color="#0277bd" />
    </linearGradient>

    <!-- Subtle Droplet Glow/Shadow -->
    <filter id="dropGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#00b0ff" flood-opacity="0.25" />
    </filter>

    <!-- Wrench Drop Shadow for Depth -->
    <filter id="wrenchShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.3" />
    </filter>

    <!-- Clip Path for the Water Droplet (to contain the left highlight stripe) -->
    <clipPath id="dropClip">
      <path d="M 256 115 
               C 272 150, 375 255, 375 330 
               C 375 395, 322 445, 256 445 
               C 190 445, 137 395, 137 330 
               C 137 255, 240 150, 256 115 
               Z" />
    </clipPath>
  </defs>

  <!-- Full-bleed edge-to-edge background (512x512) -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <g transform="${transform}">
    <!-- ============================================== -->
    <!-- 1. WATER DROPLET (Main Body)                   -->
    <!-- ============================================== -->
    <g filter="url(#dropGlow)">
      <!-- Base Droplet -->
      <path
        d="M 256 115 
           C 272 150, 375 255, 375 330 
           C 375 395, 322 445, 256 445 
           C 190 445, 137 395, 137 330 
           C 137 255, 240 150, 256 115 
           Z"
        fill="url(#dropGrad)"
      />

      <!-- Left Vertical Highlight Stripe (clipped inside droplet) -->
      <g clip-path="url(#dropClip)">
        <rect
          x="165"
          y="200"
          width="76"
          height="160"
          fill="#80d8ff"
          opacity="0.45"
        />
      </g>
    </g>

    <!-- ============================================== -->
    <!-- 2. WHITE PLUMBING WRENCH (Rotated 45 degrees)  -->
    <!-- ============================================== -->
    <!-- Positioned diagonally from bottom-left to top-right across the droplet -->
    <g transform="translate(256, 310) rotate(-45)" filter="url(#wrenchShadow)">
      
      <!-- Wrench Handle: Rounded eyelet at bottom, shaft going up -->
      <!-- Bottom ring / eyelet: outer circle r=30, inner cutout r=15 -->
      <path
        d="M -16 65
           L -16 115
           A 32 32 0 1 0 16 115
           L 16 65
           Z"
        fill="#ffffff"
      />
      <!-- Eyelet center hole -->
      <circle cx="0" cy="115" r="14" fill="#0091ea" />

      <!-- Main Straight Shaft -->
      <rect x="-16" y="-30" width="32" height="100" fill="#ffffff" />

      <!-- Upper Wrench Head (Open-ended Jaw / рожковый ключ) -->
      <!-- Outer head contour with open U-shaped jaw pointing up -->
      <path
        d="M -16 -25
           C -38 -20, -50 -45, -45 -70
           C -42 -85, -28 -105, -5 -110
           C 10 -113, 30 -105, 42 -85
           C 48 -70, 42 -45, 16 -25
           Z"
        fill="#ffffff"
      />

      <!-- U-Cutout for the open jaw gripping mouth -->
      <path
        d="M -22 -115
           L -5 -60
           C -2 -50, 6 -50, 10 -60
           L 26 -115
           Z"
        fill="#00b0ff"
      />

    </g>
  </g>
</svg>`;
}

async function main() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const rustoreDir = path.join(publicDir, 'rustore');
  const distRustoreDir = path.join(distDir, 'rustore');

  if (!fs.existsSync(rustoreDir)) fs.mkdirSync(rustoreDir, { recursive: true });
  if (fs.existsSync(distDir) && !fs.existsSync(distRustoreDir)) {
    fs.mkdirSync(distRustoreDir, { recursive: true });
  }

  console.log('Generating exact original Water-Droplet + Wrench icon...');

  const standardSvg = createExactDropletWrenchSvg({ isMaskable: false });
  const maskableSvg = createExactDropletWrenchSvg({ isMaskable: true });

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);

  // 1. RuStore 512x512 strictly square PNG
  const rustoreBuf = await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(rustoreDir, 'icon-512x512.png'), rustoreBuf);
  console.log('✓ RuStore icon-512x512.png created');

  // 2. Standard 512x512 app icon
  fs.writeFileSync(path.join(publicDir, 'icon.png'), rustoreBuf);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), rustoreBuf);
  console.log('✓ Standard pwa-512x512.png created');

  // 3. Android Maskable 512x512
  const maskableBuf = await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskableBuf);
  console.log('✓ Android Maskable pwa-maskable-512x512.png created');

  // 4. 192x192 icon for mobile launchers
  const buf192 = await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);
  console.log('✓ pwa-192x192.png created');

  // 5. Apple Touch Icon (180x180)
  const buf180 = await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
  console.log('✓ apple-touch-icon.png created');

  // 6. Favicon (64x64)
  const buf64 = await sharp(Buffer.from(standardSvg))
    .resize(64, 64)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf64);
  console.log('✓ favicon.ico created');

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
    console.log('✓ All icons copied to dist/');
  }

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating droplet-wrench icon:', err);
  process.exit(1);
});
