import { describe, expect, it } from 'vitest';
import type { BirthFormState } from '../engine/types';
import {
  convertBirthCalendarType,
  formatBirthDateDisplay,
  formatBirthTimeDisplay,
  getClockHourBranchIndex,
  getSolarMonthDayCount,
  getYearGanZhiVi,
  normalizeBirthDate,
  normalizeBirthTime,
} from './birthDateTime';

const BASE_FORM: BirthFormState = {
  name: 'Nguyễn Văn A',
  year: '2004',
  month: '7',
  day: '2',
  clockHour: '7',
  clockMinute: '30',
  unknownTime: false,
  gender: 'male',
  province: 'Miền Bắc',
  city: 'Hà Nội',
  longitude: 105.85,
  utcOffsetMinutes: 420,
  calendarType: 'solar',
  isLeapMonth: false,
};

describe('birthDateTime utilities', () => {
  it('handles leading zeros and clamps invalid solar days per month and leap year', () => {
    expect(normalizeBirthDate('2004', '07', '02', 'solar')).toEqual({
      year: 2004,
      month: 7,
      day: 2,
      calendarType: 'solar',
      isLeapMonth: false,
    });

    expect(getSolarMonthDayCount(2004, 2)).toBe(29);
    expect(getSolarMonthDayCount(2003, 2)).toBe(28);
    expect(normalizeBirthDate('2003', '2', '31', 'solar').day).toBe(28);
    expect(normalizeBirthDate('2004', '2', '31', 'solar').day).toBe(29);
  });

  it('normalizes lunar dates and strips non-existent leap month flags', () => {
    // 2004 has leap month 2, not month 5
    const normalized = normalizeBirthDate('2004', '5', '31', 'lunar', true);
    expect(normalized.isLeapMonth).toBe(false);
    expect(normalized.day).toBeLessThanOrEqual(30);

    const leapValid = normalizeBirthDate('2004', '2', '15', 'lunar', true);
    expect(leapValid.isLeapMonth).toBe(true);
    expect(leapValid.day).toBe(15);
  });

  it('maps 24h clock hours to the 12 Vietnamese Địa Chi branches accurately', () => {
    expect(getClockHourBranchIndex(23)).toBe(0); // Tý
    expect(getClockHourBranchIndex(0)).toBe(0);  // Tý
    expect(getClockHourBranchIndex(1)).toBe(1);  // Sửu
    expect(getClockHourBranchIndex(7)).toBe(4);  // Thìn
    expect(getClockHourBranchIndex(8)).toBe(4);  // Thìn
    expect(getClockHourBranchIndex(22)).toBe(11); // Hợi
  });

  it('normalizes padded time strings and formats displays consistently', () => {
    const t = normalizeBirthTime('07', '05');
    expect(t).toEqual({ hour: 7, minute: 5, branchIndex: 4 });
    expect(formatBirthTimeDisplay(t.hour, t.minute)).toBe('07:05');
    expect(formatBirthDateDisplay({ year: 2004, month: 7, day: 2 })).toBe('02/07/2004');
    expect(getYearGanZhiVi(2004)).toBe('Giáp Thân');
  });

  it('round-trips solar <-> lunar calendar conversion without losing the date', () => {
    const asLunar = convertBirthCalendarType(BASE_FORM, 'lunar');
    expect(asLunar.calendarType).toBe('lunar');
    expect(asLunar.year).toBe('2004');
    expect(asLunar.month).toBe('5');
    expect(asLunar.day).toBe('15');
    expect(asLunar.isLeapMonth).toBe(false);

    const backToSolar = convertBirthCalendarType(asLunar, 'solar');
    expect(backToSolar.calendarType).toBe('solar');
    expect(backToSolar.year).toBe('2004');
    expect(backToSolar.month).toBe('7');
    expect(backToSolar.day).toBe('2');
  });
});
