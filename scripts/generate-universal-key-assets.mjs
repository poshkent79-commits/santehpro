import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Universal Key (Универсальный ключ) Generator for SantehPro
 * 
 * Recreates the exact glowing rounded squircle badge from the site header:
 * - Gradient: from-rose-500 via-red-500 to-indigo-500 (#f43f5e -> #ef4444 -> #6366f1)
 * - Translucent border: rgba(255, 255, 255, 0.3)
 * - Lucide Wrench outline in crisp white with rounded caps
 * - Safe zones for Android Launcher (One UI, MIUI, Pixel), iOS, RuStore, PWA
 * - OpenGraph (og-image.jpg) for Telegram/WhatsApp/VK link preview
 * - Data exchange banner (santehpro-exchange-banner.jpg) for estimates and contracts
 */

// 1. Full-Bleed Icon SVG template (512x512) for Android Maskable, iOS Apple-Touch, and full scale
function getFullBleedIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Vibrant Brand Gradient (Rose-Magenta -> Deep Violet-Indigo) -->
    <linearGradient id="brandGrad" x1="10%" y1="90%" x2="90%" y2="10%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="28%" stop-color="#ec4899" />
      <stop offset="68%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Subtle Depth Vignette for Edge Balance -->
    <radialGradient id="edgeDepth" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="70%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
    </radialGradient>

    <!-- Clean Shadow for Wrench -->
    <filter id="wrenchShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.32" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Full-bleed background covering ALL 512x512 pixels with NO black padding or borders -->
  <rect width="512" height="512" fill="url(#brandGrad)" />
  <rect width="512" height="512" fill="url(#edgeDepth)" />

  <!-- Crisp White Wrench perfectly centered at (256, 256) inside Android 80% Safe Zone -->
  <!-- Scale 12.0 gives width ~269px, well within 410px safe circle -->
  <g transform="translate(112, 112) scale(12.0)" filter="url(#wrenchShadow)">
    <path 
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" 
      fill="none" 
      stroke="#ffffff" 
      stroke-width="2.35" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
  </g>
</svg>`;
}

// Standalone Squircle Icon SVG (512x512) for browser tab / desktop view (Screenshot_20261006_223238_Chrome.jpg)
function getSquircleIconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Vibrant Brand Gradient (Rose-Magenta -> Deep Violet-Indigo) -->
    <linearGradient id="brandGrad" x1="10%" y1="90%" x2="90%" y2="10%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="28%" stop-color="#ec4899" />
      <stop offset="68%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Deep Ambient Glow around the Squircle -->
    <filter id="squircleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#f43f5e" flood-opacity="0.38" />
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.3" />
    </filter>

    <filter id="wrenchShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000000" flood-opacity="0.3" />
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Glowing Squircle Badge matching Chrome preview (Screenshot_20261006_223238_Chrome.jpg) -->
  <g filter="url(#squircleGlow)">
    <rect 
      x="24" 
      y="24" 
      width="464" 
      height="464" 
      rx="106" 
      fill="url(#brandGrad)" 
      stroke="rgba(255, 255, 255, 0.28)" 
      stroke-width="4" 
    />
  </g>

  <!-- White Wrench centered at (256, 256) -->
  <g transform="translate(118, 118) scale(11.5)" filter="url(#wrenchShadow)">
    <path 
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" 
      fill="none" 
      stroke="#ffffff" 
      stroke-width="2.35" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
    />
  </g>
</svg>`;
}

// 2. OpenGraph Card SVG (1200x630) for link preview in Telegram, WhatsApp, VK, SMS
function getOpenGraphSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0a1329" />
    </linearGradient>

    <!-- Key Badge Gradient -->
    <linearGradient id="ogKeyBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="38%" stop-color="#ef4444" />
      <stop offset="72%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Glow Filter for the Universal Key -->
    <filter id="ogKeyGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="28" flood-color="#f43f5e" flood-opacity="0.55" />
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <filter id="ogTextShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.7" />
    </filter>

    <!-- Ambient Glow Orbs -->
    <radialGradient id="orbRed" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="orbBlue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)" />

  <!-- Ambient Glow Orbs -->
  <circle cx="280" cy="315" r="380" fill="url(#orbRed)" />
  <circle cx="1050" cy="200" r="350" fill="url(#orbBlue)" />

  <!-- Subtle Blueprint Grid Lines -->
  <g opacity="0.05" stroke="#38bdf8" stroke-width="1">
    <line x1="0" y1="126" x2="1200" y2="126" />
    <line x1="0" y1="252" x2="1200" y2="252" />
    <line x1="0" y1="378" x2="1200" y2="378" />
    <line x1="0" y1="504" x2="1200" y2="504" />
    <line x1="300" y1="0" x2="300" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="900" y1="0" x2="900" y2="630" />
  </g>

  <!-- LEFT: The Iconic Universal Key Squircle Badge (200x200) -->
  <g transform="translate(100, 215)" filter="url(#ogKeyGlow)">
    <rect 
      x="0" 
      y="0" 
      width="200" 
      height="200" 
      rx="48" 
      fill="url(#ogKeyBadgeGrad)" 
      stroke="rgba(255, 255, 255, 0.35)" 
      stroke-width="3.5" 
    />
    <!-- Wrench icon centered inside 200x200 (scale 4.8, centered at 100, 100) -->
    <g transform="translate(42.4, 42.4) scale(4.8)">
      <path 
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="2.35" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
      />
    </g>
  </g>

  <!-- RIGHT: Typography & Feature Highlights -->
  <g transform="translate(350, 0)">
    <!-- Small Category Pill -->
    <g transform="translate(0, 155)">
      <rect x="0" y="0" width="220" height="36" rx="18" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2" />
      <text x="110" y="24" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#38bdf8" letter-spacing="1">
        СЕРВИС №1 ПО САНТЕХНИКЕ
      </text>
    </g>

    <!-- Main Title: СантехПро -->
    <g transform="translate(0, 260)" filter="url(#ogTextShadow)">
      <text font-family="system-ui, -apple-system, 'SF Pro Display', Roboto, sans-serif" font-size="76" font-weight="900" letter-spacing="-1">
        <tspan fill="#ef4444">Сантех</tspan><tspan fill="#38bdf8">Про</tspan>
      </text>
    </g>

    <!-- Subtitle: Твой карманный помощник по сантехнике -->
    <text x="0" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#f8fafc">
      Твой карманный помощник по сантехнике
    </text>

    <!-- Description -->
    <text x="0" y="365" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94a3b8">
      Поиск проверенных мастеров по РФ и СНГ, электронные сметы и договоры,
    </text>
    <text x="0" y="395" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94a3b8">
      калькуляторы материалов и 100+ пошаговых видеоинструкций.
    </text>

    <!-- 4 Feature Pills -->
    <g transform="translate(0, 440)">
      <!-- Pill 1 -->
      <g transform="translate(0, 0)">
        <rect width="180" height="42" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="90" y="26" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#e2e8f0">⚡ Электронные сметы</text>
      </g>
      <!-- Pill 2 -->
      <g transform="translate(195, 0)">
        <rect width="185" height="42" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="92" y="26" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#e2e8f0">🔍 Поиск специалистов</text>
      </g>
      <!-- Pill 3 -->
      <g transform="translate(395, 0)">
        <rect width="195" height="42" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="97" y="26" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#e2e8f0">📋 Договоры подряда</text>
      </g>
      <!-- Pill 4 -->
      <g transform="translate(605, 0)">
        <rect width="165" height="42" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1" />
        <text x="82" y="26" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#e2e8f0">📱 PWA Приложение</text>
      </g>
    </g>

    <!-- Web Link -->
    <text x="0" y="535" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#38bdf8" letter-spacing="0.5">
      santehpro.info
    </text>
  </g>
</svg>`;
}

// 3. Official Data Exchange Banner (santehpro-exchange-banner.svg) (1200x480)
function getDataExchangeBannerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="1200" height="480">
  <defs>
    <linearGradient id="exBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080e1a" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#0a1224" />
    </linearGradient>

    <linearGradient id="exKeyBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="38%" stop-color="#ef4444" />
      <stop offset="72%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <filter id="exKeyGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#f43f5e" flood-opacity="0.5" />
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <radialGradient id="exGlowRed" cx="30%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="1200" height="480" fill="url(#exBg)" />
  <circle cx="250" cy="240" r="320" fill="url(#exGlowRed)" />

  <!-- Subtle Blueprint Tech Lines -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120" />
    <line x1="0" y1="240" x2="1200" y2="240" />
    <line x1="0" y1="360" x2="1200" y2="360" />
    <line x1="200" y1="0" x2="200" y2="480" />
    <line x1="500" y1="0" x2="500" y2="480" />
    <line x1="800" y1="0" x2="800" y2="480" />
    <line x1="1000" y1="0" x2="1000" y2="480" />
  </g>

  <!-- Iconic Universal Key Squircle Badge (140x140) -->
  <g transform="translate(80, 170)" filter="url(#exKeyGlow)">
    <rect 
      x="0" 
      y="0" 
      width="140" 
      height="140" 
      rx="34" 
      fill="url(#exKeyBadgeGrad)" 
      stroke="rgba(255, 255, 255, 0.35)" 
      stroke-width="3" 
    />
    <g transform="translate(29.6, 29.6) scale(3.36)">
      <path 
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="2.35" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
      />
    </g>
  </g>

  <!-- Text Info -->
  <g transform="translate(260, 0)">
    <g transform="translate(0, 120)">
      <rect x="0" y="0" width="280" height="30" rx="15" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="1.2" />
      <text x="140" y="20" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#34d399" letter-spacing="1">
        ОФИЦИАЛЬНЫЙ ЭЛЕКТРОННЫЙ ДОКУМЕНТ
      </text>
    </g>

    <g transform="translate(0, 205)">
      <text font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-0.5">
        <tspan fill="#ef4444">Сантех</tspan><tspan fill="#38bdf8">Про</tspan>
      </text>
    </g>

    <text x="0" y="250" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#f8fafc">
      Электронный обмен данными: Сметы • Договоры • Спецификации
    </text>

    <text x="0" y="285" font-family="system-ui, sans-serif" font-size="15" font-weight="400" fill="#94a3b8">
      Единая цифровая среда взаимодействия заказчиков и проверенных мастеров
    </text>

    <g transform="translate(0, 325)">
      <text font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">
        santehpro.info • Защищённая передача данных • QR-верификация
      </text>
    </g>
  </g>
</svg>`;
}

async function generateAllAssets() {
  const publicDir = path.resolve('public');
  const distDir = path.resolve('dist');
  const rustoreDir = path.join(publicDir, 'rustore');
  const distRustoreDir = path.join(distDir, 'rustore');

  if (!fs.existsSync(rustoreDir)) fs.mkdirSync(rustoreDir, { recursive: true });
  if (fs.existsSync(distDir) && !fs.existsSync(distRustoreDir)) {
    fs.mkdirSync(distRustoreDir, { recursive: true });
  }

  const squircleSvg = getSquircleIconSvg();
  const fullBleedSvg = getFullBleedIconSvg();
  const ogSvg = getOpenGraphSvg();
  const exchangeSvg = getDataExchangeBannerSvg();

  // Save SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), squircleSvg);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable.svg'), fullBleedSvg);
  fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogSvg);
  fs.writeFileSync(path.join(publicDir, 'santehpro-exchange-banner.svg'), exchangeSvg);

  // 1. Full-Bleed 512x512 PNGs (Android Maskable, RuStore, Standard PWA) - NO BLACK MARGINS!
  const buf512FullBleed = await sharp(Buffer.from(fullBleedSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  // Standalone Squircle 512x512 PNG (for browser tabs and preview)
  const buf512Squircle = await sharp(Buffer.from(squircleSvg))
    .resize(512, 512)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'icon.png'), buf512Squircle);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512FullBleed);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), buf512FullBleed);
  fs.writeFileSync(path.join(rustoreDir, 'icon-512x512.png'), buf512FullBleed);

  // Also write to workspace root for fallbacks
  fs.writeFileSync(path.resolve('icon.png'), buf512Squircle);

  // 2. 192x192 PNG for mobile devices (Full-Bleed)
  const buf192 = await sharp(Buffer.from(fullBleedSvg))
    .resize(192, 192)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);

  // 3. Apple Touch Icon (180x180) (Full-Bleed - iOS automatically clips to squircle)
  const buf180 = await sharp(Buffer.from(fullBleedSvg))
    .resize(180, 180)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buf180);
  fs.writeFileSync(path.resolve('apple-touch-icon.png'), buf180);

  // 4. Favicon (64x64)
  const buf64 = await sharp(Buffer.from(squircleSvg))
    .resize(64, 64)
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf64);
  fs.writeFileSync(path.resolve('favicon.ico'), buf64);

  // 5. OpenGraph JPEG (1200x630) for link preview in Telegram, WhatsApp, VK
  const ogJpg = await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), ogJpg);

  // 6. Data Exchange Banner JPEG (1200x480)
  const exchangeJpg = await sharp(Buffer.from(exchangeSvg))
    .resize(1200, 480)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'santehpro-exchange-banner.jpg'), exchangeJpg);

  // Copy to dist/ if dist exists
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(path.join(publicDir, 'icon.svg'), path.join(distDir, 'icon.svg'));
    fs.copyFileSync(path.join(publicDir, 'icon.png'), path.join(distDir, 'icon.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-512x512.png'), path.join(distDir, 'pwa-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), path.join(distDir, 'pwa-maskable-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'pwa-192x192.png'), path.join(distDir, 'pwa-192x192.png'));
    fs.copyFileSync(path.join(publicDir, 'apple-touch-icon.png'), path.join(distDir, 'apple-touch-icon.png'));
    fs.copyFileSync(path.join(publicDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
    fs.copyFileSync(path.join(rustoreDir, 'icon-512x512.png'), path.join(distRustoreDir, 'icon-512x512.png'));
    fs.copyFileSync(path.join(publicDir, 'og-image.jpg'), path.join(distDir, 'og-image.jpg'));
    fs.copyFileSync(path.join(publicDir, 'og-image.svg'), path.join(distDir, 'og-image.svg'));
    fs.copyFileSync(path.join(publicDir, 'santehpro-exchange-banner.jpg'), path.join(distDir, 'santehpro-exchange-banner.jpg'));
    fs.copyFileSync(path.join(publicDir, 'santehpro-exchange-banner.svg'), path.join(distDir, 'santehpro-exchange-banner.svg'));
  }

  console.log('✓ Successfully generated all Universal Key assets for all devices & sharing channels!');
}

generateAllAssets().catch((err) => {
  console.error('Error generating universal key assets:', err);
  process.exit(1);
});
