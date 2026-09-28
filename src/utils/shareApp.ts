export interface ShareOptions {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Triggers the native system share menu directly (Android / iOS native share sheet).
 * If Web Share API is not available on the current device (e.g., desktop browser),
 * copies the link to the clipboard and returns 'copied'.
 */
export async function triggerNativeShare(
  customOptions?: Partial<ShareOptions>
): Promise<'shared' | 'copied' | 'dismissed' | 'failed'> {
  const shareUrl =
    customOptions?.url ||
    (typeof window !== 'undefined' ? window.location.origin || 'https://santehpro.info' : 'https://santehpro.info');
  const title = customOptions?.title || 'СантехПро';
  const text =
    customOptions?.text ||
    'СантехПро — отличный сервис по сантехнике: пошаговые инструкции, обучающие курсы, расчёт материалов и база проверенных мастеров по всей России и СНГ! Рекомендую 👍';

  // 1. Try Native System Share (Opens phone system share sheet with all installed apps)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User dismissed native share sheet without selecting an app - normal behavior
        return 'dismissed';
      }
      console.warn('Native share error, falling back to clipboard:', err);
    }
  }

  // 2. Fallback: Copy to clipboard if Web Share API is unsupported (e.g. desktop PC)
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      return 'copied';
    } catch {
      try {
        await navigator.clipboard.writeText(shareUrl);
        return 'copied';
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  }

  return 'failed';
}
