import { describe, expect, it } from 'vitest';
import { generateChart } from '../engine/algorithm';
import { boshiShenName } from '../engine/shier-shen';
import type { Palace } from '../engine/types';
import { buildPlainReadingPoints } from './plainReading';

const chart = generateChart({ year: 2004, month: 7, day: 2, hour: 4, gender: 'male' });
const mingAtHoi: Palace = {
  ...chart.palaces[11], name: '命宫', branch: 11,
  stars: [{ name: '天梁', type: 'major' }, { name: '天同', type: 'major' }],
};

describe('Detailed Vietnamese star reading', () => {
  it('adds the Hợi-specific note only for Thiên Lương directly in Mệnh at Hợi', () => {
    const reading = buildPlainReadingPoints(mingAtHoi, ['天梁', '天同'], undefined, 'personality')[0];
    expect(reading.label).toContain('Thiên Lương · tại chi Hợi');
    expect(reading.notes?.map(({ label }) => label)).toContain('Khi Thiên Lương ở Hợi');
    expect(reading.about?.text).toContain('Nam Đẩu');
    const other = buildPlainReadingPoints({ ...mingAtHoi, branch: 10 }, ['天梁'], undefined, 'personality')[0];
    expect(other.notes?.map(({ label }) => label)).not.toContain('Khi Thiên Lương ở Hợi');
  });

  it('keeps borrowed stars at their original palace and excludes the direct-position note', () => {
    const focus = { ...mingAtHoi, stars: [] };
    const source = { ...mingAtHoi, branch: 5, name: '迁移宫' };
    const reading = buildPlainReadingPoints(focus, ['天梁'], undefined, 'personality',
      { ...chart, palaces: [focus, source] }).find(({ kind }) => kind === 'Mượn đối cung');
    expect(reading?.label).toContain('mượn từ cung Thiên Di tại Tỵ');
    expect(reading?.notes?.map(({ label }) => label)).not.toContain('Khi Thiên Lương ở Hợi');
  });

  it('reads Đường Phù and Hỷ Thần only where the chart places them', () => {
    const locTon = chart.palaces.find(({ stars }) => stars.some(({ name }) => name === '禄存'))!;
    const duongPhu = chart.palaces.filter(({ stars }) => stars.some(({ name }) => name === '堂符'));
    expect(duongPhu.map(({ branch }) => branch)).toEqual([(locTon.branch + 5) % 12]);
    const hyThan = chart.palaces.find(({ branch }) => boshiShenName(
      chart.lunarInfo.yearStem, chart.birthInfo.gender, branch,
    ) === '喜神')!;
    const notes = (palace: Palace) => buildPlainReadingPoints(palace, [], undefined, 'personality', chart);
    expect(notes(hyThan).filter(({ about }) => about?.name === 'Hỷ Thần')).toHaveLength(1);
    expect(notes(duongPhu[0]).filter(({ about }) => about?.name === 'Đường Phù')).toHaveLength(1);
    const neither = chart.palaces.find((palace) => palace !== hyThan && palace !== duongPhu[0])!;
    expect(notes(neither).some(({ about }) => ['Đường Phù', 'Hỷ Thần'].includes(about?.name ?? ''))).toBe(false);
  });
});
