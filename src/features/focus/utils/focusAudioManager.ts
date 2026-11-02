import {
  FOCUS_AMBIENT_SOUNDS,
  FOCUS_BELL_AUDIO_URL,
} from '../data/focusCatalog';
import type { FocusAmbientId } from '../types/focusTypes';

/**
 * Decision: Keep audio instances outside React component render cycles so
 * switching routes (e.g., from /focus to /courses/jpd113/vocabulary) never
 * interrupts Lofi music or ambient rain loops.
 */
class FocusAudioManager {
  private trackAudio: HTMLAudioElement | null = null;
  private currentTrackUrl = '';
  private ambientMap = new Map<FocusAmbientId, HTMLAudioElement>();
  private bellAudio: HTMLAudioElement | null = null;
  private onTrackEndedCallback: (() => void) | null = null;

  public setOnTrackEnded(cb: (() => void) | null): void {
    this.onTrackEndedCallback = cb;
  }

  private ensureTrackAudio(): HTMLAudioElement {
    if (!this.trackAudio) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('ended', () => {
        if (this.onTrackEndedCallback) {
          this.onTrackEndedCallback();
        }
      });
      this.trackAudio = audio;
    }
    return this.trackAudio;
  }

  public async playTrack(url: string, volume: number): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const audio = this.ensureTrackAudio();
    if (this.currentTrackUrl !== url) {
      this.currentTrackUrl = url;
      audio.src = url;
    }
    audio.volume = Math.max(0, Math.min(1, volume));
    try {
      await audio.play();
      return true;
    } catch (err) {
      console.warn('⚠️ Autoplay Lofi track blocked until user interaction:', err);
      return false;
    }
  }

  public pauseTrack(): void {
    if (this.trackAudio && !this.trackAudio.paused) {
      this.trackAudio.pause();
    }
  }

  public setTrackVolume(volume: number): void {
    if (this.trackAudio) {
      this.trackAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public syncAmbients(
    volumes: Record<FocusAmbientId, number>,
    shouldPlay: boolean
  ): void {
    if (typeof window === 'undefined') return;

    for (const item of FOCUS_AMBIENT_SOUNDS) {
      const vol = Math.max(0, Math.min(1, volumes[item.id] ?? 0));
      let audio = this.ambientMap.get(item.id);

      if (vol <= 0.01 || !shouldPlay) {
        if (audio && !audio.paused) {
          audio.pause();
        }
        continue;
      }

      if (!audio) {
        audio = new Audio(item.audioUrl);
        audio.loop = true;
        audio.preload = 'auto';
        this.ambientMap.set(item.id, audio);
      }

      audio.volume = vol;
      if (audio.paused) {
        audio.play().catch((err) => {
          console.warn(`⚠️ Ambient [${item.id}] waiting for user gesture:`, err);
        });
      }
    }
  }

  public stopAll(): void {
    this.pauseTrack();
    for (const audio of this.ambientMap.values()) {
      if (!audio.paused) {
        audio.pause();
      }
    }
  }

  public playCompletionBell(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!this.bellAudio) {
        this.bellAudio = new Audio(FOCUS_BELL_AUDIO_URL);
        this.bellAudio.volume = 0.7;
      }
      this.bellAudio.currentTime = 0;
      this.bellAudio.play().catch(() => {
        // Non-blocking if tab muted
      });
    } catch {
      // Ignore audio errors
    }
  }
}

export const focusAudioManager = new FocusAudioManager();
