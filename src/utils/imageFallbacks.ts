/**
 * Self-contained SVG image fallbacks that NEVER fail, NEVER require external CDNs (like Unsplash),
 * and render instantaneously regardless of VPN, RKN blocks, or offline PWA state.
 */

export const DEFAULT_WORK_PHOTO = 
  "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="none">
  <rect width="800" height="450" fill="#0f172a"/>
  <!-- Blueprint grid background -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#grid)" />
  
  <!-- Stylized Pipes Graphic -->
  <path d="M 120 225 L 340 225 L 340 140 L 480 140 L 480 280 L 680 280" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>
  <circle cx="340" cy="140" r="14" fill="#38bdf8" opacity="0.5"/>
  <circle cx="480" cy="280" r="14" fill="#38bdf8" opacity="0.5"/>
  
  <!-- Central Badge -->
  <rect x="250" y="165" width="300" height="120" rx="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6"/>
  
  <!-- Water Drop / Wrench icon -->
  <circle cx="310" cy="225" r="24" fill="#0284c7" fill-opacity="0.25" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 310 211 C 310 211 324 225 324 231 C 324 239 318 244 310 244 C 302 244 296 239 296 231 C 296 225 310 211 310 211 Z" fill="#38bdf8"/>
  
  <text x="350" y="218" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22">СантехПро</text>
  <text x="350" y="242" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="13">Фотография объекта</text>
</svg>
  `.trim());

export const DEFAULT_SPECIALIST_AVATAR = 
  "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#avatarGrad)"/>
  
  <!-- Outer border -->
  <rect x="2" y="2" width="196" height="196" rx="38" fill="none" stroke="#38bdf8" stroke-width="3" stroke-opacity="0.4"/>
  
  <!-- Head -->
  <circle cx="100" cy="74" r="32" fill="#e2e8f0"/>
  
  <!-- Shoulders & Torso with plumbing jacket -->
  <path d="M 40 168 C 40 126 68 116 100 116 C 132 116 160 126 160 168" fill="#e2e8f0"/>
  
  <!-- Specialist badge overlay -->
  <circle cx="145" cy="145" r="22" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M 145 133 C 145 133 154 143 154 147 C 154 152 150 156 145 156 C 140 156 136 152 136 147 C 136 143 145 133 145 133 Z" fill="#38bdf8"/>
</svg>
  `.trim());

/**
 * Returns a personalized SVG avatar with the specialist's initials if photo is empty or fails.
 */
export function getSpecialistAvatar(photo?: string | null, name?: string): string {
  if (photo && photo.trim() && !photo.includes('images.unsplash.com')) {
    return photo.trim();
  }

  const cleanName = (name || 'Мастер').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'СП';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length >= 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }

  return "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="initGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="50%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#initGrad)"/>
  <rect x="2" y="2" width="196" height="196" rx="38" fill="none" stroke="#38bdf8" stroke-width="3" stroke-opacity="0.45"/>
  
  <text x="100" y="118" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="54" text-anchor="middle">${initials}</text>
  
  <!-- Little verified check emblem -->
  <circle cx="152" cy="152" r="20" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 143 152 L 149 158 L 161 146" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  `.trim());
}
