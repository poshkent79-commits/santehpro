/**
 * Client-side image compression utility using HTML5 Canvas.
 * Resizes high-resolution mobile photos (e.g. 5-15MB) down to optimized web sizes (~150-320KB)
 * with high-fidelity Lanczos/bicubic canvas smoothing without perceptible loss of sharpness,
 * ensuring lightning-fast uploads and smooth responsive viewing for users.
 */

export interface CompressedImageResult {
  base64: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.84
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;

    // If already lightweight SVG or small image under 80KB, return directly
    if (file.size < 80 * 1024 && !file.type.includes('heic') && !file.type.includes('tiff')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        resolve({
          base64: res,
          mimeType: file.type || 'image/jpeg',
          originalSize,
          compressedSize: file.size,
          savedPercent: 0,
          originalSizeFormatted: formatFileSize(originalSize),
          compressedSizeFormatted: formatFileSize(file.size),
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data URL if canvas image decode fails
        const fallbackBase64 = reader.result as string;
        resolve({
          base64: fallbackBase64,
          mimeType: file.type || 'image/jpeg',
          originalSize,
          compressedSize: originalSize,
          savedPercent: 0,
          originalSizeFormatted: formatFileSize(originalSize),
          compressedSizeFormatted: formatFileSize(originalSize),
        });
      };

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Proportional resizing preserving optical sharpness and aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          const fallbackBase64 = reader.result as string;
          resolve({
            base64: fallbackBase64,
            mimeType: file.type || 'image/jpeg',
            originalSize,
            compressedSize: originalSize,
            savedPercent: 0,
            originalSizeFormatted: formatFileSize(originalSize),
            compressedSizeFormatted: formatFileSize(originalSize),
          });
          return;
        }

        // High-quality smooth filtering for crisp optical detail (fittings, welds, manometer gauges)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white background for transparent PNGs converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first if supported (superior visual compression), fallback to high-quality JPEG
        let compressedBase64 = '';
        let chosenMime = 'image/jpeg';

        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            compressedBase64 = webpData;
            chosenMime = 'image/webp';
          }
        } catch {
          // WebP not supported in current environment
        }

        if (!compressedBase64) {
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          chosenMime = 'image/jpeg';
        }

        const estimatedBytes = Math.round((compressedBase64.length * 3) / 4);
        const savedPercent = Math.max(0, Math.round(((originalSize - estimatedBytes) / originalSize) * 100));

        resolve({
          base64: compressedBase64,
          mimeType: chosenMime,
          originalSize,
          compressedSize: estimatedBytes,
          savedPercent,
          originalSizeFormatted: formatFileSize(originalSize),
          compressedSizeFormatted: formatFileSize(estimatedBytes),
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress an array of image files (up to 10 photos) with progress callback
 */
export async function compressMultipleImageFiles(
  files: File[],
  maxDimension = 1600,
  quality = 0.84,
  onProgress?: (completed: number, total: number, latest: CompressedImageResult) => void
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const compressed = await compressImageFile(file, maxDimension, quality);
    results.push(compressed);
    if (onProgress) {
      onProgress(i + 1, files.length, compressed);
    }
  }

  return results;
}

