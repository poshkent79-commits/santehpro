/**
 * Media optimization utility for client-side compression and cloud streaming preparation.
 * Handles automatic downscaling, WebP encoding, and media metadata extraction.
 */

export interface ImageOptimizationResult {
  base64Data: string;
  originalSize: string;
  optimizedSize: string;
  savingsPercent: number;
  format: string;
  width: number;
  height: number;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

/**
 * Optimizes an image file using an HTML5 Canvas pipeline.
 * Downscales images exceeding maxWidth/maxHeight while preserving aspect ratio,
 * and encodes to modern WebP with optimal compression.
 */
export function optimizeImageFile(
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82
): Promise<ImageOptimizationResult> {
  return new Promise((resolve, reject) => {
    const originalBytes = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения'));

    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onerror = () => reject(new Error('Не удалось загрузить изображение в декодер'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context недоступен'));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG if needed
        let mimeType = 'image/webp';
        let format = 'webp';
        let base64 = canvas.toDataURL(mimeType, quality);

        if (!base64.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          format = 'jpg';
          base64 = canvas.toDataURL(mimeType, quality);
        }

        // Estimate optimized size from base64 string
        const base64Length = base64.length - (base64.indexOf(',') + 1);
        const optimizedBytes = Math.round((base64Length * 3) / 4);

        const savings = originalBytes > optimizedBytes
          ? Math.round(((originalBytes - optimizedBytes) / originalBytes) * 100)
          : 0;

        resolve({
          base64Data: base64,
          originalSize: formatBytes(originalBytes),
          optimizedSize: formatBytes(optimizedBytes),
          savingsPercent: savings,
          format,
          width,
          height,
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Extracts duration and metadata from video/audio files via HTML5 media elements.
 */
export function extractMediaMetadata(file: File): Promise<{
  duration?: string;
  durationSeconds?: number;
  format: string;
}> {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'media';
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext);
    const isAudio = file.type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);

    if (!isVideo && !isAudio) {
      resolve({ format: ext });
      return;
    }

    const mediaElement = isVideo
      ? document.createElement('video')
      : document.createElement('audio');

    const objectUrl = URL.createObjectURL(file);
    mediaElement.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      mediaElement.remove();
    };

    mediaElement.onloadedmetadata = () => {
      const sec = Math.round(mediaElement.duration);
      const minutes = Math.floor(sec / 60);
      const remainingSeconds = sec % 60;
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

      cleanUp();
      resolve({
        duration: formattedDuration,
        durationSeconds: sec,
        format: ext,
      });
    };

    mediaElement.onerror = () => {
      cleanUp();
      resolve({ format: ext });
    };

    // Timeout fallback
    setTimeout(() => {
      cleanUp();
      resolve({ format: ext });
    }, 4000);

    mediaElement.src = objectUrl;
  });
}
