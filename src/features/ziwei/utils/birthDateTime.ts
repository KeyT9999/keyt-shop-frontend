import {
  LUNAR_YEAR_MAX,
  LUNAR_YEAR_MIN,
  leapMonthOfLunarYear,
  lunarMonthDayCount,
  lunarToSolar,
  solarToLunar,
} from '../engine/lunar-solar';
import type { BirthFormState } from '../engine/types';

export const BIRTH_YEAR_MIN = 1920;
export const BIRTH_YEAR_MAX = 2030;

const HEAVENLY_STEMS_VI = [
  'Giáp',
  'Ất',
  'Bính',
  'Đinh',
  'Mậu',
  'Kỷ',
  'Canh',
  'Tân',
  'Nhâm',
  'Quý',
] as const;

const EARTHLY_BRANCHES_VI = [
  'Tý',
  'Sửu',
  'Dần',
  'Mão',
  'Thìn',
  'Tỵ',
  'Ngọ',
  'Mùi',
  'Thân',
  'Dậu',
  'Tuất',
  'Hợi',
] as const;

/** Giờ đồng hồ đại diện (giữa canh giờ) cho 12 Địa Chi: Tý=0h, Sửu=2h, ..., Hợi=22h */
export const BRANCH_DEFAULT_CLOCK_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22] as const;

export interface NormalizedBirthDate {
  year: number;
  month: number;
  day: number;
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
}

export interface NormalizedBirthTime {
  hour: number;
  minute: number;
  branchIndex: number;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function parseIntSafe(raw: string | number | undefined, fallback: number): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.trunc(raw);
  const parsed = parseInt(String(raw ?? ''), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

/** Số ngày thực tế của một tháng Dương lịch (tự động tính năm nhuận). */
export function getSolarMonthDayCount(year: number, month: number): number {
  const safeMonth = clampInt(month, 1, 12);
  return new Date(year, safeMonth, 0).getDate();
}

/**
 * Chuẩn hóa ngày sinh (xử lý số 0 ở đầu như "02", giới hạn ngày hợp lệ theo tháng Dương/Âm,
 * và tự tắt cờ tháng nhuận nếu năm Âm lịch đó không có tháng nhuận tương ứng).
 */
export function normalizeBirthDate(
  yearRaw: string | number | undefined,
  monthRaw: string | number | undefined,
  dayRaw: string | number | undefined,
  calendarType: 'solar' | 'lunar' = 'solar',
  isLeapMonth = false
): NormalizedBirthDate {
  const year = clampInt(parseIntSafe(yearRaw, 1998), LUNAR_YEAR_MIN, LUNAR_YEAR_MAX);
  const month = clampInt(parseIntSafe(monthRaw, 1), 1, 12);

  if (calendarType === 'lunar') {
    const leapMonth = leapMonthOfLunarYear(year);
    const validLeap = Boolean(isLeapMonth) && leapMonth === month;
    const maxDay = lunarMonthDayCount(year, month, validLeap) || 29;
    const day = clampInt(parseIntSafe(dayRaw, 1), 1, maxDay);
    return {
      year,
      month,
      day,
      calendarType: 'lunar',
      isLeapMonth: validLeap,
    };
  }

  const maxDay = getSolarMonthDayCount(year, month);
  const day = clampInt(parseIntSafe(dayRaw, 1), 1, maxDay);
  return {
    year,
    month,
    day,
    calendarType: 'solar',
    isLeapMonth: false,
  };
}

/** Ánh xạ giờ đồng hồ (0..23) sang chỉ số 12 Địa Chi (0=Tý .. 11=Hợi). */
export function getClockHourBranchIndex(hour: number): number {
  const normalized = ((Math.trunc(hour) % 24) + 24) % 24;
  if (normalized === 23 || normalized === 0) return 0;
  return Math.floor((normalized + 1) / 2);
}

/** Chuẩn hóa giờ/phút sinh (hỗ trợ cả chuỗi có số 0 đứng đầu như "07", "00"). */
export function normalizeBirthTime(
  hourRaw: string | number | undefined,
  minuteRaw: string | number | undefined
): NormalizedBirthTime {
  const hour = clampInt(parseIntSafe(hourRaw, 8), 0, 23);
  const minute = clampInt(parseIntSafe(minuteRaw, 0), 0, 59);
  return {
    hour,
    minute,
    branchIndex: getClockHourBranchIndex(hour),
  };
}

/** Định dạng hiển thị DD/MM/YYYY với số 2 chữ số ổn định. */
export function formatBirthDateDisplay(date: Pick<NormalizedBirthDate, 'year' | 'month' | 'day'>): string {
  const d = String(date.day).padStart(2, '0');
  const m = String(date.month).padStart(2, '0');
  return `${d}/${m}/${date.year}`;
}

/** Định dạng hiển thị HH:mm (24h). */
export function formatBirthTimeDisplay(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** Can Chi tiếng Việt của một năm (VD: 2004 -> "Giáp Thân"). */
export function getYearGanZhiVi(year: number): string {
  const stemIndex = (((year - 4) % 10) + 10) % 10;
  const branchIndex = (((year - 4) % 12) + 12) % 12;
  return `${HEAVENLY_STEMS_VI[stemIndex]} ${EARTHLY_BRANCHES_VI[branchIndex]}`;
}

/**
 * Chuyển đổi qua lại giữa Dương lịch và Âm lịch mà vẫn giữ đúng cùng một ngày thực tế,
 * tránh lỗi ngày 31 khi chuyển sang Âm lịch hoặc ngày nhuận không tồn tại.
 */
export function convertBirthCalendarType(
  form: BirthFormState,
  targetCalendar: 'solar' | 'lunar'
): BirthFormState {
  const currentCalendar = form.calendarType || 'solar';
  if (currentCalendar === targetCalendar) return form;

  const current = normalizeBirthDate(
    form.year,
    form.month,
    form.day,
    currentCalendar,
    Boolean(form.isLeapMonth)
  );

  if (targetCalendar === 'lunar') {
    const converted = solarToLunar(current.year, current.month, current.day);
    if (converted) {
      return {
        ...form,
        calendarType: 'lunar',
        year: String(converted.lunarYear),
        month: String(converted.lunarMonth),
        day: String(converted.lunarDay),
        isLeapMonth: converted.isLeap,
      };
    }
    const clamped = normalizeBirthDate(current.year, current.month, current.day, 'lunar', false);
    return {
      ...form,
      calendarType: 'lunar',
      year: String(clamped.year),
      month: String(clamped.month),
      day: String(clamped.day),
      isLeapMonth: false,
    };
  }

  const converted = lunarToSolar(current.year, current.month, current.day, current.isLeapMonth);
  if (converted) {
    return {
      ...form,
      calendarType: 'solar',
      year: String(converted.year),
      month: String(converted.month),
      day: String(converted.day),
      isLeapMonth: false,
    };
  }

  const clamped = normalizeBirthDate(current.year, current.month, current.day, 'solar', false);
  return {
    ...form,
    calendarType: 'solar',
    year: String(clamped.year),
    month: String(clamped.month),
    day: String(clamped.day),
    isLeapMonth: false,
  };
}
