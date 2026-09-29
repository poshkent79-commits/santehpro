/**
 * Sound and Push Notification utility for master alerts.
 * Uses Web Audio API with zero external dependencies to synthesize crisp,
 * pleasant notification chimes with zero network latency.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Unlock audio on first user touch / interaction to satisfy mobile & desktop browser autoplay policies
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (isAudioUnlocked) return;
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      } else {
        isAudioUnlocked = true;
      }
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

const STORAGE_KEY_SOUND_ENABLED = 'santehpro_master_sound_enabled';

/**
 * Check whether sound notifications are enabled for the master
 */
export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY_SOUND_ENABLED);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggle sound notifications on or off
 */
export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SOUND_ENABLED, enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Synthesizes a pleasant, modern 3-tone chime for incoming orders / requests
 * (C5 -> E5 -> G5 -> C6 harmonic progression with warm decays)
 */
export function playIncomingRequestSound(force = false): boolean {
  if (!force && !isNotificationSoundEnabled()) {
    return false;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    const now = ctx.currentTime;

    // Chime notes: F#5 (739.99 Hz) -> A#5 (932.33 Hz) -> C#6 (1108.73 Hz) - pleasant modern order notification
    const notes = [
      { freq: 740, time: 0.0, dur: 0.28, gain: 0.22 },
      { freq: 932, time: 0.12, dur: 0.32, gain: 0.26 },
      { freq: 1109, time: 0.24, dur: 0.65, gain: 0.30 },
    ];

    notes.forEach(({ freq, time, dur, gain: vol }) => {
      const startTime = now + time;
      const stopTime = startTime + dur;

      // Primary tone
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Soft harmonic overtone for a warm chime bell feel
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, startTime);

      // Envelope: instant soft attack, gentle exponential decay
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(vol, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      overtoneGain.gain.setValueAtTime(0.001, startTime);
      overtoneGain.gain.exponentialRampToValueAtTime(vol * 0.2, startTime + 0.02);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gainNode);
      overtone.connect(overtoneGain);
      gainNode.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(stopTime);
      overtone.stop(stopTime);
    });

    return true;
  } catch (err) {
    console.warn('Could not play notification sound:', err);
    return false;
  }
}

/**
 * Test the notification sound
 */
export function testNotificationSound(): boolean {
  return playIncomingRequestSound(true);
}

/**
 * Check if the browser supports Desktop/Push Notifications
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isBrowserNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * Send a browser desktop/push notification
 */
export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!isBrowserNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/icon.png',
      tag: 'santehpro-master-order',
      ...(options || {}),
    } as any);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to dispatch browser notification:', err);
    return false;
  }
}
