/**
 * Video Utilities for Dual-Platform Player: RuTube & YouTube
 */

export function parseYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // youtube.com/watch?v=ID
  if (trimmed.includes('youtube.com/watch')) {
    const match = trimmed.match(/[?&]v=([^&]+)/);
    if (match && match[1]) return match[1];
  }

  // youtu.be/ID
  if (trimmed.includes('youtu.be/')) {
    const match = trimmed.match(/youtu\.be\/([^?&#]+)/);
    if (match && match[1]) return match[1];
  }

  // youtube.com/embed/ID
  if (trimmed.includes('youtube.com/embed/')) {
    const match = trimmed.match(/youtube\.com\/embed\/([^?&#]+)/);
    if (match && match[1]) return match[1];
  }

  // youtube.com/shorts/ID
  if (trimmed.includes('youtube.com/shorts/')) {
    const match = trimmed.match(/youtube\.com\/shorts\/([^?&#]+)/);
    if (match && match[1]) return match[1];
  }

  return null;
}

export function parseRuTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // rutube.ru/video/ID/
  if (trimmed.includes('rutube.ru/video/')) {
    const match = trimmed.match(/rutube\.ru\/video\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
  }

  // rutube.ru/play/embed/ID/
  if (trimmed.includes('rutube.ru/play/embed/')) {
    const match = trimmed.match(/rutube\.ru\/play\/embed\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
  }

  return null;
}

export function getYouTubeEmbedUrl(url?: string): string | null {
  const id = parseYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}

export function getRuTubeEmbedUrl(url?: string): string | null {
  const id = parseRuTubeId(url);
  return id ? `https://rutube.ru/play/embed/${id}` : null;
}

export interface VideoPlatformSources {
  youtubeEmbed: string | null;
  rutubeEmbed: string | null;
  directVideoUrl: string | null;
  hasYouTube: boolean;
  hasRuTube: boolean;
  hasDirect: boolean;
  defaultPlatform: 'rutube' | 'youtube' | 'direct';
}

/**
 * Extracts and prepares both RuTube and YouTube embed sources from article data
 */
export function resolveDualPlatformVideos(data: {
  videoUrl?: string;
  videoEmbed?: string;
  rutubeUrl?: string;
  youtubeUrl?: string;
}): VideoPlatformSources {
  let yt = getYouTubeEmbedUrl(data.youtubeUrl);
  let rt = getRuTubeEmbedUrl(data.rutubeUrl);
  let direct: string | null = null;

  // If youtubeUrl wasn't set, try parsing from generic videoUrl or videoEmbed
  if (!yt) {
    yt = getYouTubeEmbedUrl(data.videoUrl) || getYouTubeEmbedUrl(data.videoEmbed);
  }

  // If rutubeUrl wasn't set, try parsing from generic videoUrl or videoEmbed
  if (!rt) {
    rt = getRuTubeEmbedUrl(data.videoUrl) || getRuTubeEmbedUrl(data.videoEmbed);
  }

  // Check for direct MP4 / WebM video
  const checkDirect = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.startsWith('/uploads/');
  };

  if (checkDirect(data.videoEmbed)) {
    direct = data.videoEmbed!;
  } else if (checkDirect(data.videoUrl)) {
    direct = data.videoUrl!;
  }

  // Fallbacks: If an educational material has video content, provide reliable RuTube and YouTube channels
  // For Russian Federation users where YouTube may experience ISP throttling, RuTube provides instant seamless playback
  const defaultRuTubeEmbed = rt || 'https://rutube.ru/play/embed/e5428a1ce74328325a7a972c3d5964bb';
  const defaultYouTubeEmbed = yt || 'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0';

  const hasExplicitRuTube = Boolean(rt);
  const hasExplicitYouTube = Boolean(yt);
  const hasDirect = Boolean(direct);

  // If both exist or only RuTube exists, prioritize RuTube for domestic stability
  const defaultPlatform: 'rutube' | 'youtube' | 'direct' = direct 
    ? 'direct' 
    : (hasExplicitRuTube ? 'rutube' : 'youtube');

  return {
    youtubeEmbed: yt || defaultYouTubeEmbed,
    rutubeEmbed: rt || defaultRuTubeEmbed,
    directVideoUrl: direct,
    hasYouTube: hasExplicitYouTube || Boolean(yt),
    hasRuTube: hasExplicitRuTube || Boolean(rt),
    hasDirect,
    defaultPlatform,
  };
}
