import {
  MAX_PASSIVE_LISTENING_MINUTES,
  MIN_PASSIVE_LISTENING_MINUTES,
  type PassiveListeningEntry
} from '../utils/passiveListeningSequence';
import type { PassiveSpeechAdapter, PassiveSpeechLocale } from './passiveSpeechSynthesis';

export const PASSIVE_LISTENING_JAPANESE_MEANING_GAP_MS = 300;
export const PASSIVE_LISTENING_INTER_ITEM_GAP_MS = 1_000;
const COUNTDOWN_INTERVAL_MS = 1_000;

export type PassivePlayerStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'stopped' | 'error';
export type PassivePlayerPhase =
  | 'idle'
  | 'japanese'
  | 'gap-before-meaning'
  | 'vietnamese'
  | 'gap-before-next';

export interface PassiveListeningClock {
  now: () => number;
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (handle: number) => void;
  setInterval: (callback: () => void, delayMs: number) => number;
  clearInterval: (handle: number) => void;
}

export interface PassiveVocabularyPlayerSnapshot {
  status: PassivePlayerStatus;
  phase: PassivePlayerPhase;
  currentIndex: number;
  cycleNumber: number;
  remainingMs: number;
  errorMessage: string | null;
  voiceAvailability: { japanese: boolean; vietnamese: boolean };
}

interface PendingDelay {
  handle: number | null;
  deadline: number;
  remainingMs: number;
  phase: PassivePlayerPhase;
  callback: () => void;
}

const browserClock: PassiveListeningClock = {
  now: () => performance.now(),
  setTimeout: (callback, delayMs) => window.setTimeout(callback, delayMs),
  clearTimeout: (handle) => window.clearTimeout(handle),
  setInterval: (callback, delayMs) => window.setInterval(callback, delayMs),
  clearInterval: (handle) => window.clearInterval(handle)
};

export class PassiveVocabularyPlayer {
  private readonly entries: PassiveListeningEntry[];
  private readonly speech: PassiveSpeechAdapter;
  private readonly clock: PassiveListeningClock;
  private readonly primaryLocale: 'ja-JP' | 'zh-CN';
  private activeAudioPlayback = false;
  private snapshot: PassiveVocabularyPlayerSnapshot;
  private sessionId = 0;
  private deadline = 0;
  private pausedRemainingMs = 0;
  private countdownHandle: number | null = null;
  private pendingDelay: PendingDelay | null = null;
  private listeners = new Set<() => void>();
  private disposed = false;

  constructor(
    entries: PassiveListeningEntry[],
    speech: PassiveSpeechAdapter,
    clock: PassiveListeningClock = browserClock,
    primaryLocale: 'ja-JP' | 'zh-CN' = 'ja-JP'
  ) {
    this.entries = entries;
    this.speech = speech;
    this.clock = clock;
    this.primaryLocale = primaryLocale;
    this.snapshot = {
      status: 'idle',
      phase: 'idle',
      currentIndex: 0,
      cycleNumber: 1,
      remainingMs: 0,
      errorMessage: null,
      voiceAvailability: this.getVoiceAvailability()
    };
  }

  readonly getSnapshot = () => this.snapshot;

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  refreshVoiceAvailability() {
    if (this.disposed) return;
    const nextAvailability = this.getVoiceAvailability();
    if (
      nextAvailability.japanese === this.snapshot.voiceAvailability.japanese &&
      nextAvailability.vietnamese === this.snapshot.voiceAvailability.vietnamese
    ) {
      return;
    }
    this.publish({ voiceAvailability: nextAvailability });
  }

  start(durationMinutes: number): boolean {
    if (this.disposed) return false;
    const validationMessage = this.getStartError(durationMinutes);
    if (validationMessage) {
      if (this.snapshot.status !== 'playing' && this.snapshot.status !== 'paused') {
        this.publish({ status: 'error', phase: 'idle', errorMessage: validationMessage });
      }
      return false;
    }

    this.invalidateAndCancelSpeech();
    const durationMs = durationMinutes * 60_000;
    this.deadline = this.clock.now() + durationMs;
    this.pausedRemainingMs = durationMs;
    this.publish({
      status: 'playing',
      phase: 'japanese',
      currentIndex: 0,
      cycleNumber: 1,
      remainingMs: durationMs,
      errorMessage: null
    });

    const activeSessionId = this.sessionId;
    this.startCountdown(activeSessionId);
    this.speakJapanese(activeSessionId);
    return true;
  }

  pause() {
    if (this.snapshot.status !== 'playing') return;

    this.pausedRemainingMs = Math.max(0, this.deadline - this.clock.now());
    if (this.pausedRemainingMs === 0) {
      this.completeSession();
      return;
    }

    this.clearCountdown();
    this.preservePendingDelay();
    if (this.activeAudioPlayback && this.speech.pauseAudio) this.speech.pauseAudio();
    else this.speech.pause();
    this.publish({ status: 'paused', remainingMs: this.pausedRemainingMs });
  }

  resume() {
    if (this.snapshot.status !== 'paused') return;

    this.deadline = this.clock.now() + this.pausedRemainingMs;
    this.publish({ status: 'playing', remainingMs: this.pausedRemainingMs });
    if (this.activeAudioPlayback && this.speech.resumeAudio) this.speech.resumeAudio();
    else this.speech.resume();

    const activeSessionId = this.sessionId;
    this.startCountdown(activeSessionId);
    this.resumePendingDelay(activeSessionId);
  }

  stop() {
    if (this.snapshot.status !== 'playing' && this.snapshot.status !== 'paused') {
      this.publish({ status: 'stopped', phase: 'idle', remainingMs: 0, errorMessage: null });
      return;
    }

    this.invalidateAndCancelSpeech();
    this.publish({ status: 'stopped', phase: 'idle', remainingMs: 0, errorMessage: null });
  }

  syncTime() {
    if (this.snapshot.status === 'playing') this.updateCountdown(this.sessionId);
  }

  release() {
    const shouldCancelSpeech = this.snapshot.status === 'playing' || this.snapshot.status === 'paused';
    this.sessionId += 1;
    this.clearAllTimers();
    if (shouldCancelSpeech) this.speech.cancel();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const shouldCancelSpeech = this.snapshot.status === 'playing' || this.snapshot.status === 'paused';
    this.sessionId += 1;
    this.clearAllTimers();
    if (shouldCancelSpeech) this.speech.cancel();
    this.listeners.clear();
  }

  private getStartError(durationMinutes: number): string | null {
    if (!this.speech.isSupported) return 'Trình duyệt này chưa hỗ trợ đọc văn bản.';
    if (this.entries.length === 0) return 'Bài học chưa có từ vựng và nghĩa hợp lệ để phát.';
    if (
      !Number.isInteger(durationMinutes) ||
      durationMinutes < MIN_PASSIVE_LISTENING_MINUTES ||
      durationMinutes > MAX_PASSIVE_LISTENING_MINUTES
    ) {
      return 'Vui lòng chọn thời lượng từ 1 đến 60 phút.';
    }

    return null;
  }

  private speakJapanese(activeSessionId: number) {
    if (!this.canContinue(activeSessionId)) return;
    const entry = this.entries[this.snapshot.currentIndex];
    if (!entry) {
      this.failSession(activeSessionId, 'missing-entry', this.primaryLocale);
      return;
    }

    this.publish({ phase: 'japanese' });
    const onSpoken = () => {
      this.scheduleDelay(
        activeSessionId,
        PASSIVE_LISTENING_JAPANESE_MEANING_GAP_MS,
        'gap-before-meaning',
        () => this.speakVietnamese(activeSessionId)
      );
    };

    if (this.primaryLocale === 'zh-CN' && entry.audioUrl && this.speech.playAudio) {
      this.activeAudioPlayback = true;
      try {
        this.speech.playAudio(entry.audioUrl, {
          onEnd: () => {
            if (!this.canContinue(activeSessionId)) return;
            this.activeAudioPlayback = false;
            onSpoken();
          },
          onError: () => {
            if (!this.canContinue(activeSessionId)) return;
            this.activeAudioPlayback = false;
            this.speak(entry.japaneseText, this.primaryLocale, activeSessionId, onSpoken);
          }
        });
        return;
      } catch {
        this.activeAudioPlayback = false;
      }
    }

    this.speak(entry.japaneseText, this.primaryLocale, activeSessionId, onSpoken);
  }

  private speakVietnamese(activeSessionId: number) {
    if (!this.canContinue(activeSessionId)) return;
    const entry = this.entries[this.snapshot.currentIndex];
    if (!entry) {
      this.failSession(activeSessionId, 'missing-entry', 'vi-VN');
      return;
    }

    this.publish({ phase: 'vietnamese' });
    this.speak(entry.vietnameseText, 'vi-VN', activeSessionId, () => {
      this.scheduleDelay(
        activeSessionId,
        PASSIVE_LISTENING_INTER_ITEM_GAP_MS,
        'gap-before-next',
        () => this.advanceToNextEntry(activeSessionId)
      );
    });
  }

  private speak(
    text: string,
    locale: PassiveSpeechLocale,
    activeSessionId: number,
    onEnd: () => void
  ) {
    this.speech.speak(text, locale, {
      onEnd: () => {
        if (this.canContinue(activeSessionId)) onEnd();
      },
      onError: (reason) => this.failSession(activeSessionId, reason, locale)
    });
  }

  private scheduleDelay(
    activeSessionId: number,
    delayMs: number,
    phase: PassivePlayerPhase,
    callback: () => void
  ) {
    if (!this.canContinue(activeSessionId)) return;
    this.clearPendingDelay();

    const pending: PendingDelay = {
      handle: null,
      deadline: this.clock.now() + delayMs,
      remainingMs: delayMs,
      phase,
      callback
    };
    pending.handle = this.clock.setTimeout(() => {
      if (this.pendingDelay !== pending || !this.canContinue(activeSessionId)) return;
      this.pendingDelay = null;
      if (this.isPastDeadline(activeSessionId)) return;
      pending.callback();
    }, delayMs);
    this.pendingDelay = pending;
    this.publish({ phase });
  }

  private advanceToNextEntry(activeSessionId: number) {
    if (!this.canContinue(activeSessionId)) return;

    let currentIndex = this.snapshot.currentIndex + 1;
    let cycleNumber = this.snapshot.cycleNumber;
    if (currentIndex >= this.entries.length) {
      currentIndex = 0;
      cycleNumber += 1;
    }

    this.publish({ currentIndex, cycleNumber, phase: 'japanese' });
    this.speakJapanese(activeSessionId);
  }

  private startCountdown(activeSessionId: number) {
    this.clearCountdown();
    this.countdownHandle = this.clock.setInterval(
      () => this.updateCountdown(activeSessionId),
      COUNTDOWN_INTERVAL_MS
    );
  }

  private updateCountdown(activeSessionId: number) {
    if (!this.canContinue(activeSessionId)) return;
    const remainingMs = Math.max(0, this.deadline - this.clock.now());
    if (remainingMs === 0) {
      this.completeSession();
      return;
    }
    this.publish({ remainingMs });
  }

  private isPastDeadline(activeSessionId: number): boolean {
    if (!this.canContinue(activeSessionId)) return true;
    if (this.clock.now() < this.deadline) return false;
    this.completeSession();
    return true;
  }

  private canContinue(activeSessionId: number): boolean {
    return !this.disposed && activeSessionId === this.sessionId && this.snapshot.status === 'playing';
  }

  private preservePendingDelay() {
    const pending = this.pendingDelay;
    if (!pending) return;

    if (pending.handle !== null) this.clock.clearTimeout(pending.handle);
    this.pendingDelay = {
      ...pending,
      handle: null,
      remainingMs: Math.max(0, pending.deadline - this.clock.now())
    };
  }

  private resumePendingDelay(activeSessionId: number) {
    const pending = this.pendingDelay;
    if (!pending) return;

    this.pendingDelay = null;
    this.scheduleDelay(activeSessionId, pending.remainingMs, pending.phase, pending.callback);
  }

  private failSession(activeSessionId: number, reason: string, locale: PassiveSpeechLocale) {
    if (!this.canContinue(activeSessionId)) return;
    console.warn('[PassiveVocabularyPlayer] Speech synthesis failed.', {
      sessionId: activeSessionId,
      phase: this.snapshot.phase,
      reason
    });
    this.invalidateAndCancelSpeech();
    const unavailableVoice = reason === 'language-unavailable' || reason === 'voice-unavailable';
    const languageName = locale === 'zh-CN' ? 'tiếng Trung' : locale === 'ja-JP' ? 'tiếng Nhật' : 'tiếng Việt';
    this.publish({
      status: 'error',
      phase: 'idle',
      remainingMs: 0,
      errorMessage: unavailableVoice
        ? `Không có giọng đọc ${languageName} phù hợp. Hãy cài hoặc bật giọng đọc này trên thiết bị rồi thử lại.`
        : 'Giọng đọc bị gián đoạn. Hãy kiểm tra giọng đọc trên thiết bị rồi thử lại.'
    });
  }

  private completeSession() {
    this.invalidateAndCancelSpeech();
    this.publish({ status: 'completed', phase: 'idle', remainingMs: 0, errorMessage: null });
  }

  private invalidateAndCancelSpeech() {
    this.sessionId += 1;
    this.activeAudioPlayback = false;
    this.clearAllTimers();
    this.speech.cancel();
  }

  private getVoiceAvailability() {
    const availability = this.speech.getVoiceAvailability(this.primaryLocale);
    const hasSavedChineseAudio =
      this.primaryLocale === 'zh-CN' &&
      this.entries.length > 0 &&
      typeof this.speech.playAudio === 'function' &&
      this.entries.every((entry) => Boolean(entry.audioUrl));

    return {
      ...availability,
      japanese: availability.japanese || hasSavedChineseAudio
    };
  }

  private clearAllTimers() {
    this.clearCountdown();
    this.clearPendingDelay();
  }

  private clearCountdown() {
    if (this.countdownHandle === null) return;
    this.clock.clearInterval(this.countdownHandle);
    this.countdownHandle = null;
  }

  private clearPendingDelay() {
    if (this.pendingDelay?.handle !== null && this.pendingDelay?.handle !== undefined) {
      this.clock.clearTimeout(this.pendingDelay.handle);
    }
    this.pendingDelay = null;
  }

  private publish(patch: Partial<PassiveVocabularyPlayerSnapshot>) {
    if (this.disposed) return;
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}
