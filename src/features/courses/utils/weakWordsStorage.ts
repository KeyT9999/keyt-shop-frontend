/**
 * Storage helper for Mistake Buster / Weak Words tracking
 * Stores weak words and streaks per course + lesson in localStorage
 */

interface WeakWordState {
  wordIds: string[];
  streaks: Record<string, number>; // wordId -> consecutive correct streak (requires 2 to graduate)
}

function getKey(courseCode: string, lessonSlug: string): string {
  return `keyt_weak_words_${(courseCode || 'jpd123').toLowerCase()}_${lessonSlug}`;
}

function loadState(courseCode: string, lessonSlug: string): WeakWordState {
  try {
    const raw = localStorage.getItem(getKey(courseCode, lessonSlug));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        wordIds: Array.isArray(parsed.wordIds) ? parsed.wordIds : [],
        streaks: typeof parsed.streaks === 'object' && parsed.streaks ? parsed.streaks : {}
      };
    }
  } catch {
    // ignore
  }
  return { wordIds: [], streaks: {} };
}

function saveState(courseCode: string, lessonSlug: string, state: WeakWordState): void {
  try {
    localStorage.setItem(getKey(courseCode, lessonSlug), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const weakWordsStorage = {
  getWeakWordIds(courseCode: string, lessonSlug: string): string[] {
    return loadState(courseCode, lessonSlug).wordIds;
  },

  getWeakWordStreaks(courseCode: string, lessonSlug: string): Record<string, number> {
    return loadState(courseCode, lessonSlug).streaks;
  },

  addWeakWord(courseCode: string, lessonSlug: string, wordId: string): void {
    const state = loadState(courseCode, lessonSlug);
    if (!state.wordIds.includes(wordId)) {
      state.wordIds.push(wordId);
    }
    state.streaks[wordId] = 0; // reset streak when made mistake
    saveState(courseCode, lessonSlug, state);
  },

  recordAttempt(
    courseCode: string,
    lessonSlug: string,
    wordId: string,
    isCorrect: boolean
  ): { streak: number; graduated: boolean } {
    const state = loadState(courseCode, lessonSlug);
    if (!state.wordIds.includes(wordId)) {
      if (!isCorrect) {
        state.wordIds.push(wordId);
        state.streaks[wordId] = 0;
        saveState(courseCode, lessonSlug, state);
      }
      return { streak: 0, graduated: false };
    }

    if (isCorrect) {
      const currentStreak = (state.streaks[wordId] || 0) + 1;
      state.streaks[wordId] = currentStreak;

      // 2 consecutive correct answers to graduate!
      if (currentStreak >= 2) {
        state.wordIds = state.wordIds.filter((id) => id !== wordId);
        delete state.streaks[wordId];
        saveState(courseCode, lessonSlug, state);
        return { streak: currentStreak, graduated: true };
      }

      saveState(courseCode, lessonSlug, state);
      return { streak: currentStreak, graduated: false };
    } else {
      // Wrong resets streak to 0
      state.streaks[wordId] = 0;
      saveState(courseCode, lessonSlug, state);
      return { streak: 0, graduated: false };
    }
  },

  removeWeakWord(courseCode: string, lessonSlug: string, wordId: string): void {
    const state = loadState(courseCode, lessonSlug);
    state.wordIds = state.wordIds.filter((id) => id !== wordId);
    delete state.streaks[wordId];
    saveState(courseCode, lessonSlug, state);
  },

  clearAll(courseCode: string, lessonSlug: string): void {
    try {
      localStorage.removeItem(getKey(courseCode, lessonSlug));
    } catch {
      // ignore
    }
  }
};
