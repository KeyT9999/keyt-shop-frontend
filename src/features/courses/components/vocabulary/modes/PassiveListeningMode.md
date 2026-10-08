# PassiveListeningMode

## Purpose

Lets a learner listen to the vocabulary in the currently open lesson for a chosen number of minutes. Japanese entries use their reading when available; Chinese entries speak the Hanzi and display Pinyin. Each entry is followed by its Vietnamese meaning, then the next entry. The prepared list repeats until the session deadline.

## Component contract

- `items` is the current lesson's vocabulary list. It is normalized and sorted by the sequence utility before playback.
- Opening Chinese passive listening refreshes the current lesson items from the course API, so newly saved audio URLs are picked up without a full page reload. The header shows how many playable entries have saved Chinese audio.
- `speechAdapter` is optional and exists to inject controlled speech and audio implementations in tests. Production uses saved audio URLs for Chinese terms when present. Vietnamese meanings and Japanese terms use browser speech.
- Playback does not update progress, bookmarks, or backend learning records.
- Duration presets are 5, 10, 15, 20, and 30 minutes. Custom duration accepts an integer from 1 through 60; the initial preset is 5 minutes.
- The control panel presents the term, reading (kana or Pinyin), optional romaji, and Vietnamese meaning. Speech uses the Japanese reading or Chinese Hanzi, followed by the Vietnamese meaning.

## Playback and lifecycle

`usePassiveVocabularyPlayer` owns the player and its speech, audio, clock, and voice-listener lifecycle. It plays one Chinese audio file at a time when available; a file playback error stops the session with a clear message rather than playing the word in the wrong language. If no saved URL exists, it uses `zh-CN` browser speech. Japanese uses `ja-JP`, and Vietnamese meanings use `vi-VN`. The player waits 300 ms between the two languages and one second between entries. Pause freezes the deadline and pending gap; resume continues the same audio, utterance, or gap. Stop, lesson change, and unmount cancel audio, speech, and timers.

When the browser does not expose a matching voice, the player keeps the locale hint and leaves `utterance.voice` null so the browser can choose its default voice for that language. If a listed voice is stale and reports `voice-unavailable` or `language-unavailable`, it retries once with the default voice. Saved Chinese audio avoids the need for a Chinese device voice; Vietnamese meanings still use device speech. Browser speech synthesis may stop when a device locks or switches applications; the component does not promise background playback.

## Accessibility and design

Controls are native buttons and a labeled numeric input. The active playback message uses a polite status region. The countdown is intentionally not a live region so it does not interrupt screen-reader users every second. Focus rings remain visible, controls meet mobile touch sizing, and the layout stacks on narrow screens.
