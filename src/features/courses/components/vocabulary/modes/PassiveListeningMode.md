# PassiveListeningMode

## Purpose

Lets a learner listen to the vocabulary in the currently open lesson for a chosen number of minutes. Japanese entries use their reading when available; Chinese entries speak the Hanzi and display Pinyin. Each entry is followed by its Vietnamese meaning, then the next entry. The prepared list repeats until the session deadline.

## Component contract

- `items` is the current lesson's vocabulary list. It is normalized and sorted by the sequence utility before playback.
- `speechAdapter` is optional and exists to inject a controlled speech implementation in tests. Production uses the browser Web Speech API.
- Playback does not update progress, bookmarks, or backend learning records.
- Duration presets are 5, 10, 15, 20, and 30 minutes. Custom duration accepts an integer from 1 through 60; the initial preset is 5 minutes.
- The control panel presents the term, reading (kana or Pinyin), optional romaji, and Vietnamese meaning. Speech uses the Japanese reading or Chinese Hanzi, followed by the Vietnamese meaning.

## Playback and lifecycle

`usePassiveVocabularyPlayer` owns the player and its speech, clock, and voice-listener lifecycle. It speaks only one utterance at a time, uses `ja-JP` or `zh-CN` for the course language and `vi-VN` for Vietnamese, waits 300 ms between the two languages, and waits one second between entries. Pause freezes the deadline and pending gap; resume continues the same utterance or gap. Stop, lesson change, and unmount cancel speech and timers.

When the browser does not expose a matching voice, the player keeps the locale hint and leaves `utterance.voice` null so the browser can choose its default voice for that language. If a listed voice is stale and reports `voice-unavailable` or `language-unavailable`, it retries once with the default voice. The interface warns that pronunciation may differ; if the default voice also cannot speak the language, it explains that the device needs a suitable voice installed or enabled. Browser speech synthesis may stop when a device locks or switches applications; the component does not promise background playback.

## Accessibility and design

Controls are native buttons and a labeled numeric input. The active playback message uses a polite status region. The countdown is intentionally not a live region so it does not interrupt screen-reader users every second. Focus rings remain visible, controls meet mobile touch sizing, and the layout stacks on narrow screens.
