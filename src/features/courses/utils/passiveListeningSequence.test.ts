import { describe, expect, it } from 'vitest';
import type { VocabularyItem } from '../types';
import {
  parsePassiveListeningDuration,
  preparePassiveListeningSequence
} from './passiveListeningSequence';

function makeVocabularyItem(overrides: Partial<VocabularyItem> = {}): VocabularyItem {
  return {
    _id: 'word-1',
    order: 1,
    term: '北',
    reading: 'きた',
    partOfSpeech: 'Danh từ',
    meaning: 'Phía bắc',
    ...overrides
  };
}

describe('parsePassiveListeningDuration', () => {
  it('accepts whole minutes from 1 through 60', () => {
    expect(parsePassiveListeningDuration('1')).toBe(1);
    expect(parsePassiveListeningDuration('60')).toBe(60);
    expect(parsePassiveListeningDuration(' 5 ')).toBe(5);
  });

  it.each(['', '0', '61', '-1', '4.5', '1e2', 'abc'])('rejects %j', (value) => {
    expect(parsePassiveListeningDuration(value)).toBeNull();
  });
});

describe('preparePassiveListeningSequence', () => {
  it('sorts by lesson order, trims content, and falls back to the term for missing reading', () => {
    const sequence = preparePassiveListeningSequence([
      makeVocabularyItem({
        _id: 'west',
        order: 3,
        term: '西',
        reading: ' にし ',
        meaning: ' Phía tây '
      }),
      makeVocabularyItem({
        _id: 'north',
        order: 1,
        term: ' 北 ',
        reading: '',
        meaning: ' Phía bắc '
      })
    ]);

    expect(sequence.entries).toEqual([
      {
        id: 'north',
        order: 1,
        term: '北',
        reading: '',
        romaji: '',
        japaneseText: '北',
        vietnameseText: 'Phía bắc'
      },
      {
        id: 'west',
        order: 3,
        term: '西',
        reading: 'にし',
        romaji: '',
        japaneseText: 'にし',
        vietnameseText: 'Phía tây'
      }
    ]);
    expect(sequence.skippedCount).toBe(0);
  });

  it('keeps original order for equal lesson-order values', () => {
    const sequence = preparePassiveListeningSequence([
      makeVocabularyItem({ _id: 'first', order: 2 }),
      makeVocabularyItem({ _id: 'second', order: 2 })
    ]);

    expect(sequence.entries.map(({ id }) => id)).toEqual(['first', 'second']);
  });

  it('skips entries without a Japanese word or Vietnamese meaning and reports their count', () => {
    const sequence = preparePassiveListeningSequence([
      makeVocabularyItem({ _id: 'valid', order: 1 }),
      makeVocabularyItem({ _id: 'no-meaning', order: 2, meaning: '   ' }),
      makeVocabularyItem({ _id: 'no-word', order: 3, term: ' ', reading: '' })
    ]);

    expect(sequence.entries.map(({ id }) => id)).toEqual(['valid']);
    expect(sequence.skippedCount).toBe(2);
  });

  it('returns an empty sequence for an empty lesson', () => {
    expect(preparePassiveListeningSequence([])).toEqual({ entries: [], skippedCount: 0 });
  });

  it('skips malformed API entries without throwing', () => {
    const malformedItem = { _id: 'broken', order: 1 } as unknown as VocabularyItem;

    expect(preparePassiveListeningSequence([malformedItem])).toEqual({
      entries: [],
      skippedCount: 1
    });
  });
});
