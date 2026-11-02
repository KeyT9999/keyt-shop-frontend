import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FOCUS_AMBIENT_SOUNDS,
  FOCUS_BELL_AUDIO_URL,
  FOCUS_SCENES,
  FOCUS_TRACKS,
  LOFT_VARIANT_MEDIA,
} from '../data/focusCatalog';
import {
  computeUpdatedStreak,
  formatSecondsToClock,
} from './focusStorage';

describe('focusStorage pure utilities', () => {
  it('formats seconds into MM:SS or HH:MM:SS cleanly', () => {
    expect(formatSecondsToClock(0)).toBe('00:00');
    expect(formatSecondsToClock(-15)).toBe('00:00');
    expect(formatSecondsToClock(1458)).toBe('24:18');
    expect(formatSecondsToClock(3665)).toBe('01:01:05');
  });

  it('computes study streak accurately across same, consecutive, and skipped days', () => {
    // First study day ever
    expect(computeUpdatedStreak(0, '', '2026-11-02', '2026-11-01')).toEqual({
      streakCount: 1,
      lastStudyDate: '2026-11-02',
    });

    // Consecutive day increments streak
    expect(
      computeUpdatedStreak(4, '2026-11-01', '2026-11-02', '2026-11-01')
    ).toEqual({
      streakCount: 5,
      lastStudyDate: '2026-11-02',
    });

    // Same day does not double-increment
    expect(
      computeUpdatedStreak(5, '2026-11-02', '2026-11-02', '2026-11-01')
    ).toEqual({
      streakCount: 5,
      lastStudyDate: '2026-11-02',
    });

    // Missed day resets streak to 1
    expect(
      computeUpdatedStreak(9, '2026-10-30', '2026-11-02', '2026-11-01')
    ).toEqual({
      streakCount: 1,
      lastStudyDate: '2026-11-02',
    });
  });
});

describe('Focus Café static media catalog integrity', () => {
  const publicDir = path.resolve(__dirname, '../../../../public');

  it('has all 6 scene videos, loft weather videos, and poster thumbnails present in public/focus', () => {
    expect(FOCUS_SCENES).toHaveLength(6);
    for (const scene of FOCUS_SCENES) {
      expect(fs.existsSync(path.join(publicDir, scene.videoUrl))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, scene.posterUrl))).toBe(true);
    }

    for (const variant of Object.values(LOFT_VARIANT_MEDIA)) {
      expect(fs.existsSync(path.join(publicDir, variant.videoUrl))).toBe(true);
      expect(fs.existsSync(path.join(publicDir, variant.posterUrl))).toBe(true);
    }
  });

  it('has all Lofi tracks, ambient sound loops, and bell chime present in public/focus', () => {
    for (const track of FOCUS_TRACKS) {
      expect(fs.existsSync(path.join(publicDir, track.audioUrl))).toBe(true);
    }
    for (const ambient of FOCUS_AMBIENT_SOUNDS) {
      expect(fs.existsSync(path.join(publicDir, ambient.audioUrl))).toBe(true);
    }
    expect(fs.existsSync(path.join(publicDir, FOCUS_BELL_AUDIO_URL))).toBe(true);
  });
});
