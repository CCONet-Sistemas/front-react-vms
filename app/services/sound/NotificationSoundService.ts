import type { SoundSeverity } from '~/store/notification-preferences.store';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  pattern: number[]; // Array of beep durations in ms, 0 = pause
}

const SOUND_CONFIGS: Record<SoundSeverity, SoundConfig> = {
  low: {
    frequency: 440, // A4 - gentle tone
    duration: 150,
    type: 'sine',
    pattern: [150],
  },
  medium: {
    frequency: 523, // C5 - noticeable
    duration: 200,
    type: 'sine',
    pattern: [150, 50, 150],
  },
  high: {
    frequency: 659, // E5 - attention-grabbing
    duration: 250,
    type: 'triangle',
    pattern: [150, 50, 150, 50, 150],
  },
  critical: {
    frequency: 880, // A5 - urgent
    duration: 300,
    type: 'square',
    pattern: [100, 50, 100, 50, 100, 100, 200],
  },
};

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private isAudioUnlocked = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch {
        console.warn('Web Audio API not supported');
        return null;
      }
    }

    return this.audioContext;
  }

  /**
   * Unlock audio on user interaction (required by browsers)
   * Call this on first user click/touch
   */
  async unlockAudio(): Promise<void> {
    if (this.isAudioUnlocked) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignore errors - user interaction may not be present
      }
    }

    // Play a silent sound to unlock
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.001);

    this.isAudioUnlocked = true;
  }

  /**
   * Play a notification sound with the given severity
   * @param severity - Sound severity level
   * @param volume - Volume level (0-100)
   */
  async play(severity: SoundSeverity, volume: number): Promise<void> {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Ensure audio is resumed
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        console.warn('Could not resume audio context');
        return;
      }
    }

    const config = SOUND_CONFIGS[severity];
    const normalizedVolume = Math.max(0, Math.min(1, volume / 100));

    let currentTime = ctx.currentTime;

    for (const duration of config.pattern) {
      if (duration === 0) {
        // Pause
        currentTime += 0.05;
        continue;
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.value = config.frequency;

      // Apply volume with envelope for smoother sound
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(normalizedVolume * 0.3, currentTime + duration / 1000 - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration / 1000);

      currentTime += duration / 1000 + 0.05; // Add small gap between beeps
    }
  }

  /**
   * Test sound at given volume
   * @param volume - Volume level (0-100)
   */
  async testSound(volume: number): Promise<void> {
    // Play a medium severity sound for testing
    await this.play('medium', volume);
  }

  /**
   * Preview a specific severity sound
   * @param severity - Sound severity to preview
   * @param volume - Volume level (0-100)
   */
  async previewSeverity(severity: SoundSeverity, volume: number): Promise<void> {
    await this.play(severity, volume);
  }
}

export const notificationSound = new NotificationSoundService();
