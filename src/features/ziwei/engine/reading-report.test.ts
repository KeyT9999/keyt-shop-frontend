import { describe, expect, it } from 'vitest';
import { generateChart } from './algorithm';
import { buildYearOutlook, getBirthOverview, getChapterPalace, getChapterScore, READING_CHAPTERS, sumScore } from './reading-report';

const birth = { year: 2004, month: 7, day: 2, hour: 4, gender: 'male' as const };
const chart = generateChart(birth);

describe('Tử Vi reading report', () => {
  it('keeps the 14 requested chapters in order and scores the matching natal palaces', () => {
    expect(READING_CHAPTERS.map(({ key }) => key)).toEqual([
      'overview', 'personality', 'career', 'wealth', 'love', 'parents', 'family', 'children',
      'health', 'home', 'friends', 'spirit', 'move', 'forecast',
    ]);
    for (const chapter of READING_CHAPTERS.slice(0, -1)) {
      const palace = getChapterPalace(chart, chapter);
      expect(palace.name.startsWith(chapter.prefix) || (chapter.key === 'friends' && palace.name.startsWith('仆役'))).toBe(true);
      const result = getChapterScore(chart, chapter);
      expect(result.score).toBe(sumScore(result.factors));
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('calculates Cân lượng from the four weights and omits it for an unknown hour', () => {
    const birthOverview = getBirthOverview(chart, false);
    expect(birthOverview.weights).toEqual([5, 5, 10, 9]);
    expect(birthOverview.weight).toBe('2 lượng 9 chỉ');
    expect(birthOverview.napAm).toBe('Tuyền Trung Thủy');
    expect(getBirthOverview(chart, true).weight).toBeNull();
  });

  it('uses the Tiểu hạn direction and calculates all 12 lunar months with separate marks', () => {
    const maleFirstYear = buildYearOutlook(chart, 2004)!;
    const maleNextYear = buildYearOutlook(chart, 2005)!;
    const female = generateChart({ ...birth, gender: 'female' });
    const femaleNextYear = buildYearOutlook(female, 2005)!;
    expect(maleFirstYear.focus.branch).toBe(10);
    expect(maleNextYear.focus.branch).toBe(11);
    expect(femaleNextYear.focus.branch).toBe(9);
    expect(buildYearOutlook(chart, 2003)).toBeNull();

    const current = buildYearOutlook(chart, 2026)!;
    expect(current.marks).toHaveLength(4);
    expect(current.months.map(({ month }) => month)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
    expect(current.months[0].marks).not.toEqual(current.months[1].marks);
    for (const month of current.months) {
      expect(month.score).toBe(sumScore(month.factors));
      expect(month.marks).toHaveLength(4);
    }
  });
});
