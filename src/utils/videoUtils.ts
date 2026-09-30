/**
 * Video Utilities for Multi-Platform Player: RuTube, VK Video, YouTube & Cloud CDN
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

/**
 * Parses and returns VK Video embed URL for iframe
 * Supports:
 * - https://vk.com/video-123456_789012
 * - https://vkvideo.ru/video-123456_789012
 * - https://vk.com/clip-123456_789012
 * - https://vk.com/video_ext.php?oid=...&id=...&hash=...
 * - <iframe src="https://vk.com/video_ext.php?..."></iframe>
 */
export function parseVkVideoEmbed(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If iframe markup was pasted directly, extract src
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }

  // Direct video_ext.php URL
  if (trimmed.includes('video_ext.php')) {
    return trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  }

  // vk.com/video-123456_789012 or vkvideo.ru/video-123456_789012 or vk.com/clip-123456_789012
  const vkRegex = /(?:vk\.com|vkvideo\.ru)\/(?:video|clip)(-?\d+)_(\d+)/i;
  const match = trimmed.match(vkRegex);
  if (match && match[1] && match[2]) {
    const oid = match[1];
    const id = match[2];
    // Check for optional hash query param
    const hashMatch = trimmed.match(/[?&]hash=([a-zA-Z0-9]+)/);
    const hashQuery = hashMatch && hashMatch[1] ? `&hash=${hashMatch[1]}` : '';
    return `https://vk.com/video_ext.php?oid=${oid}&id=${id}&hd=2${hashQuery}`;
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

export function getVkVideoEmbedUrl(url?: string): string | null {
  return parseVkVideoEmbed(url);
}

export interface VideoPlatformSources {
  youtubeEmbed: string | null;
  rutubeEmbed: string | null;
  vkEmbed: string | null;
  directVideoUrl: string | null;
  hasYouTube: boolean;
  hasRuTube: boolean;
  hasVk: boolean;
  hasDirect: boolean;
  defaultPlatform: 'rutube' | 'vk' | 'youtube' | 'direct';
}

/**
 * Detect which video platform a URL belongs to: 'rutube' | 'vk' | 'youtube' | 'direct' | 'unknown'
 */
export function detectVideoPlatform(url?: string): 'rutube' | 'vk' | 'youtube' | 'direct' | 'unknown' {
  if (!url || typeof url !== 'string') return 'unknown';
  const u = url.toLowerCase().trim();
  if (u.includes('rutube.ru')) return 'rutube';
  if (u.includes('vk.com') || u.includes('vkvideo.ru')) return 'vk';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.ogg') || u.startsWith('/uploads/')) return 'direct';
  return 'unknown';
}

/**
 * Extracts and prepares RuTube, VK Video and YouTube embed sources from article data
 */
export function resolveDualPlatformVideos(data: {
  videoUrl?: string;
  videoEmbed?: string;
  rutubeUrl?: string;
  youtubeUrl?: string;
  vkVideoUrl?: string;
}): VideoPlatformSources {
  let yt = getYouTubeEmbedUrl(data.youtubeUrl);
  let rt = getRuTubeEmbedUrl(data.rutubeUrl);
  let vk = getVkVideoEmbedUrl(data.vkVideoUrl);
  let direct: string | null = null;

  // Check direct video
  const checkDirect = (url?: string) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.startsWith('/uploads/');
  };

  if (checkDirect(data.videoEmbed)) {
    direct = data.videoEmbed!;
  } else if (checkDirect(data.videoUrl)) {
    direct = data.videoUrl!;
  }

  // Parse generic videoUrl or videoEmbed if platform-specific fields were empty
  const rawUrl = data.videoUrl || data.videoEmbed || '';
  if (rawUrl) {
    if (!rt && (rawUrl.includes('rutube.ru') || parseRuTubeId(rawUrl))) {
      rt = getRuTubeEmbedUrl(rawUrl);
    }
    if (!vk && (rawUrl.includes('vk.com') || rawUrl.includes('vkvideo.ru'))) {
      vk = getVkVideoEmbedUrl(rawUrl);
    }
    if (!yt && (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be') || parseYouTubeId(rawUrl))) {
      yt = getYouTubeEmbedUrl(rawUrl);
    }
  }

  const hasExplicitRuTube = Boolean(rt);
  const hasExplicitVk = Boolean(vk);
  const hasExplicitYouTube = Boolean(yt);
  const hasDirect = Boolean(direct);

  // Priority order: direct CDN -> RuTube -> VK Video -> YouTube
  let defaultPlatform: 'rutube' | 'vk' | 'youtube' | 'direct' = 'rutube';
  if (hasDirect) {
    defaultPlatform = 'direct';
  } else if (hasExplicitRuTube) {
    defaultPlatform = 'rutube';
  } else if (hasExplicitVk) {
    defaultPlatform = 'vk';
  } else if (hasExplicitYouTube) {
    defaultPlatform = 'youtube';
  }

  return {
    youtubeEmbed: yt || null,
    rutubeEmbed: rt || null,
    vkEmbed: vk,
    directVideoUrl: direct,
    hasYouTube: hasExplicitYouTube,
    hasRuTube: hasExplicitRuTube,
    hasVk: hasExplicitVk,
    hasDirect,
    defaultPlatform,
  };
}
