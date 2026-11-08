import { describe, expect, it } from 'vitest';
import { generateChart } from './algorithm';
import { buildFourPalaceReading, buildLifePeriods, getLifetimeYears } from './lifetime-reading';
import { buildAnnualOutlook, buildYearOutlook, sumScore } from './reading-report';

const chart = generateChart({ year: 2004, month: 7, day: 2, hour: 4, gender: 'male' });

describe('lifetime reading', () => {
  it('links the focus palace, opposite palace and both trines for every branch', () => {
    for (const palace of chart.palaces) {
      const result = buildFourPalaceReading(chart, palace);
      expect(result.group.map(({ palace: linked }) => linked.branch))
        .toEqual([0, 6, 4, 8].map((offset) => (palace.branch + offset) % 12));
      expect(result.higher.every(({ score }) => score > result.group[0].score)).toBe(true);
      expect(result.lower.every(({ score }) => score < result.group[0].score)).toBe(true);
    }
  });

  it('uses the full sequence of chart periods and connects each year to its annual reading', () => {
    const periods = buildLifePeriods(chart);
    expect(periods).toHaveLength(chart.daXians.length);
    const childhoodYears = getLifetimeYears(chart, -1);
    expect(childhoodYears).toHaveLength(periods[0].startAge - 1);
    for (const period of periods) {
      expect(period.years).toHaveLength(10);
      expect(period.years[0]).toBe(chart.lunarInfo.lunarYear + period.startAge - 1);
      expect(period.score).toBe(sumScore(period.factors));
      expect(period.marks).toHaveLength(4);
      const annual = buildAnnualOutlook(chart, period.years[0]);
      expect(annual?.age).toBe(period.startAge);
      expect(buildYearOutlook(chart, period.years[0])?.score).toBe(annual?.score);
    }
  });
});
