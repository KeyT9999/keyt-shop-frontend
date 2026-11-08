import type { BirthInfo, BirthFormState } from './types';
import {
  branchFromSolarMinutes,
  calculateTrueSolarTime,
  resolveZiweiDayOffset,
  shiftGregorianDate,
} from './true-solar-time';
import { lunarToSolar } from './lunar-solar';

/**
 * Tính Chi giờ sinh (0-11) theo Giờ Mặt Trời Thực (True Solar Time)
 * Mặc định Việt Nam: UTC+7 (utcOffsetMinutes = 420, kinh tuyến chuẩn 105°E)
 */
export function calcTrueSolarBranch(
  clockHour: number,
  clockMinute: number,
  longitude: number,
  utcOffsetMinutes = 420
): number {
  const meridian = utcOffsetMinutes / 4;
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (longitude - meridian) * 4;
  const solar = (((clockMins + offset) % 1440) + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

/**
 * BirthFormState → BirthInfo
 * Hỗ trợ cả Dương lịch (solar) và Âm lịch (lunar), hiệu chỉnh Giờ Mặt Trời Thực theo kinh độ
 * và quy tắc Giờ Tý muộn (23:00-23:59 tính sang ngày hôm sau theo chuẩn Thiên Kỷ / Tam Hợp Phái).
 */
export function formToBirthInfo(form: BirthFormState): BirthInfo {
  let y = parseInt(form.year, 10) || 2000;
  let m = parseInt(form.month, 10) || 1;
  let d = parseInt(form.day, 10) || 1;

  if (form.calendarType === 'lunar') {
    const converted = lunarToSolar(y, m, d, Boolean(form.isLeapMonth));
    if (converted) {
      y = converted.year;
      m = converted.month;
      d = converted.day;
    }
  }

  const origY = y;
  const origM = m;
  const origD = d;
  const clockHour = parseInt(form.clockHour, 10) || 0;
  const clockMinute = parseInt(form.clockMinute, 10) || 0;
  const utcOffsetMinutes = form.utcOffsetMinutes ?? 420;
  let hour = 0;

  if (!form.unknownTime) {
    const tst = calculateTrueSolarTime({
      year: y,
      month: m,
      day: d,
      clockHour,
      clockMinute,
      longitude: form.province ? form.longitude : undefined,
      utcOffsetMinutes,
    });
    hour = tst.branch ?? branchFromSolarMinutes(tst.normalizedMinutes);
    const dayOffset = resolveZiweiDayOffset({
      dayOffset: tst.dayOffset,
      normalizedMinutes: tst.normalizedMinutes,
      branch: hour,
    });
    if (dayOffset !== 0 && y > 0 && m > 0 && d > 0) {
      ({ year: y, month: m, day: d } = shiftGregorianDate(
        { year: y, month: m, day: d },
        dayOffset
      ));
    }
  }

  return {
    year: y,
    month: m,
    day: d,
    hour,
    gender: form.gender,
    name: form.name?.trim() || undefined,
    province: form.province || undefined,
    city: form.city || undefined,
    longitude: form.province ? form.longitude : undefined,
    origInput: form.unknownTime
      ? undefined
      : {
          year: origY,
          month: origM,
          day: origD,
          clockHour,
          clockMinute,
        },
  };
}

/** BirthFormState → URLSearchParams (dùng cho chia sẻ link lá số) */
export function formToSearchParams(form: BirthFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.name) p.set('n', form.name);
  p.set('y', form.year);
  p.set('m', form.month);
  p.set('d', form.day);
  if (form.unknownTime) {
    p.set('u', '1');
  } else {
    p.set('h', form.clockHour);
    p.set('mi', form.clockMinute);
  }
  if (form.province) p.set('p', form.province);
  if (form.city) p.set('c', form.city);
  if (form.longitude) p.set('lo', String(form.longitude));
  if (form.utcOffsetMinutes) p.set('tz', String(form.utcOffsetMinutes));
  p.set('g', form.gender === 'male' ? 'm' : 'f');
  return p;
}

/** URLSearchParams → Partial<BirthFormState> */
export function searchParamsToForm(params: URLSearchParams): Partial<BirthFormState> | null {
  const year = params.get('y');
  const month = params.get('m');
  const day = params.get('d');
  if (!year || !month || !day) return null;
  return {
    name: params.get('n') || '',
    year,
    month,
    day,
    unknownTime: params.get('u') === '1',
    clockHour: params.get('h') || '8',
    clockMinute: params.get('mi') || '0',
    province: params.get('p') || 'Hà Nội',
    city: params.get('c') || 'Hà Nội',
    longitude: parseFloat(params.get('lo') || '105.85'),
    utcOffsetMinutes: parseInt(params.get('tz') || '420', 10),
    gender: params.get('g') === 'f' ? 'female' : 'male',
  };
}
