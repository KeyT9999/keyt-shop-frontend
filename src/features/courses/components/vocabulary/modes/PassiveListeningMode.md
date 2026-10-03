# PassiveListeningMode

## Purpose

Lets a learner listen to the vocabulary in the currently open lesson for a chosen number of minutes. Each entry is spoken in Japanese, followed by its Vietnamese meaning, then the next entry. The prepared list repeats until the session deadline.

## Component contract

- `items` is the current lesson's vocabulary list. It is normalized and sorted by the sequence utility before playback.
- `speechAdapter` is optional and exists to inject a controlled speech implementation in tests. Production uses the browser Web Speech API.
- Playback does not update progress, bookmarks, or backend learning records.
- Duration presets are 5, 10, 15, 20, and 30 minutes. Custom duration accepts an integer from 1 through 60; the initial preset is 5 minutes.
- The control panel presents the Japanese term, kana reading, romaji when present, and Vietnamese meaning. Speech uses kana reading (falling back to the term) and the Vietnamese meaning.

## Playback and lifecycle

`usePassiveVocabularyPlayer` owns the player and its speech, clock, and voice-listener lifecycle. It speaks only one utterance at a time, uses `ja-JP` and `vi-VN`, waits 300 ms between the two languages, and waits one second between entries. Pause freezes the deadline and pending gap; resume continues the same utterance or gap. Stop, lesson change, and unmount cancel speech and timers.

When the browser does not expose a matching voice, the player keeps the locale hint and shows a fallback notice. Browser speech synthesis may stop when a device locks or switches applications; the component does not promise background playback.

## Accessibility and design

Controls are native buttons and a labeled numeric input. The active playback message uses a polite status region. The countdown is intentionally not a live region so it does not interrupt screen-reader users every second. Focus rings remain visible, controls meet mobile touch sizing, and the layout stacks on narrow screens.
