import type { VocabularyItem } from '../types';

export interface PassiveListeningEntry {
  id: string;
  order: number;
  term: string;
  reading: string;
  romaji: string;
  japaneseText: string;
  vietnameseText: string;
}

export interface PassiveListeningSequence {
  entries: PassiveListeningEntry[];
  skippedCount: number;
}

export const MIN_PASSIVE_LISTENING_MINUTES = 1;
export const MAX_PASSIVE_LISTENING_MINUTES = 60;

export function parsePassiveListeningDuration(value: string): number | null {
  const normalizedValue = value.trim();
  if (!/^\d+$/.test(normalizedValue)) return null;

  const minutes = Number(normalizedValue);
  if (!Number.isSafeInteger(minutes)) return null;
  if (minutes < MIN_PASSIVE_LISTENING_MINUTES || minutes > MAX_PASSIVE_LISTENING_MINUTES) {
    return null;
  }

  return minutes;
}

export function preparePassiveListeningSequence(
  items: VocabularyItem[]
): PassiveListeningSequence {
  const lessonItems = Array.isArray(items) ? items : [];
  const normalizedEntries = lessonItems
    .map((item, originalIndex) => {
      const term = typeof item?.term === 'string' ? item.term.trim() : '';
      const reading = typeof item?.reading === 'string' ? item.reading.trim() : '';
      const japaneseText = reading || term;
      const vietnameseText = typeof item?.meaning === 'string' ? item.meaning.trim() : '';
      const romaji = typeof item?.romaji === 'string' ? item.romaji.trim() : '';
      const itemId = typeof item?._id === 'string' ? item._id.trim() : '';
      const order =
        typeof item?.order === 'number' && Number.isFinite(item.order)
          ? item.order
          : originalIndex + 1;

      return {
        entry: {
          id: itemId || `item-${originalIndex + 1}`,
          order,
          term,
          reading,
          romaji,
          japaneseText,
          vietnameseText
        },
        originalIndex
      };
    })
    .sort((a, b) => a.entry.order - b.entry.order || a.originalIndex - b.originalIndex);

  const entries = normalizedEntries
    .filter(({ entry }) => entry.japaneseText.length > 0 && entry.vietnameseText.length > 0)
    .map(({ entry }) => entry);

  return {
    entries,
    skippedCount: lessonItems.length - entries.length
  };
}
