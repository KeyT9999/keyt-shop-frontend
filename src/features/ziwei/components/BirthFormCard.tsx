import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
  Compass,
  Award,
  Info,
  Check,
} from 'lucide-react';
import type { BirthFormState } from '../engine/types';
import { VIETNAM_CITIES, VIETNAM_REGIONS, findCityByName } from '../engine/vietnam-cities';
import { calculateTrueSolarTime } from '../engine/true-solar-time';
import { solarToLunar, lunarToSolar } from '../engine/lunar-solar';
import { HOUR_BRANCH_LABELS_VI, translateGanZhi } from '../utils/ziweiLocalization';
import { FAMOUS_CHART_PRESETS_VI, type FamousChartPresetVi } from '../data/famousCharts';
import {
  convertBirthCalendarType,
  normalizeBirthDate,
  normalizeBirthTime,
} from '../utils/birthDateTime';
import BirthDatePicker, { type BirthDateChangePayload } from './BirthDatePicker';
import BirthTimePicker, { type BirthTimeChangePayload } from './BirthTimePicker';

interface BirthFormCardProps {
  form: BirthFormState;
  onChange: (next: BirthFormState) => void;
  onSubmit: (form: BirthFormState) => void;
  compact?: boolean;
  title?: string;
  submitLabel?: string;
  hideFamousPresets?: boolean;
}

export default function BirthFormCard({
  form,
  onChange,
  onSubmit,
  compact = false,
  title = 'Thông Tin Lập Lá Số Tử Vi',
  submitLabel = 'An Sao Lập Lá Số Ngay',
  hideFamousPresets = false,
}: BirthFormCardProps) {
  const fieldPrefix = useId();
  const [justSubmitted, setJustSubmitted] = useState(false);
  const submitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  const updateField = <K extends keyof BirthFormState>(key: K, value: BirthFormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  const handleCalendarTypeSwitch = (targetCalendar: 'solar' | 'lunar') => {
    onChange(convertBirthCalendarType(form, targetCalendar));
  };

  const handleDateChange = (nextDate: BirthDateChangePayload) => {
    onChange({
      ...form,
      year: nextDate.year,
      month: nextDate.month,
      day: nextDate.day,
      isLeapMonth: nextDate.isLeapMonth,
    });
  };

  const handleTimeChange = (nextTime: BirthTimeChangePayload) => {
    onChange({
      ...form,
      clockHour: nextTime.clockHour,
      clockMinute: nextTime.clockMinute,
      unknownTime: nextTime.unknownTime,
    });
  };

  const handleCityChange = (cityName: string) => {
    const found = findCityByName(cityName);
    if (found) {
      onChange({
        ...form,
        province: found.region,
        city: found.name,
        longitude: found.longitude,
        utcOffsetMinutes: found.utcOffsetMinutes,
      });
    } else {
      onChange({ ...form, city: cityName });
    }
  };

  const handleSelectFamous = (preset: FamousChartPresetVi) => {
    const next: BirthFormState = {
      name: preset.nameVi,
      year: String(preset.year),
      month: String(preset.month),
      day: String(preset.day),
      clockHour: String(preset.clockHour),
      clockMinute: '0',
      unknownTime: false,
      gender: preset.gender,
      province: 'Quốc Tế',
      city: 'Bắc Kinh (Trung Quốc)',
      longitude: 120,
      utcOffsetMinutes: 480,
      calendarType: 'solar',
      isLeapMonth: false,
    };
    onChange(next);
    onSubmit(next);
  };

  const handleSubmitClick = () => {
    onSubmit(form);
    if (compact) {
      setJustSubmitted(true);
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
      submitTimerRef.current = window.setTimeout(() => {
        setJustSubmitted(false);
      }, 1800);
    }
  };

  // Tính Giờ Mặt Trời Thực & Đối chiếu Âm-Dương theo thời gian thực
  const previewInfo = useMemo(() => {
    const calendarType = form.calendarType || 'solar';
    const normalizedDate = normalizeBirthDate(
      form.year,
      form.month,
      form.day,
      calendarType,
      Boolean(form.isLeapMonth)
    );
    const normalizedTime = normalizeBirthTime(form.clockHour, form.clockMinute);

    let y = normalizedDate.year;
    let m = normalizedDate.month;
    let d = normalizedDate.day;

    if (calendarType === 'lunar') {
      const sol = lunarToSolar(y, m, d, normalizedDate.isLeapMonth);
      if (sol) {
        y = sol.year;
        m = sol.month;
        d = sol.day;
      }
    }

    const utcOffsetMinutes = form.utcOffsetMinutes ?? 420;
    const tst = calculateTrueSolarTime({
      year: y,
      month: m,
      day: d,
      clockHour: normalizedTime.hour,
      clockMinute: normalizedTime.minute,
      longitude: form.longitude,
      utcOffsetMinutes,
    });

    const lunar = solarToLunar(y, m, d);
    const branchInfo = HOUR_BRANCH_LABELS_VI[tst.branch] || HOUR_BRANCH_LABELS_VI[0];
    const diffMins = Math.round(tst.totalCorrectionMinutes);
    const diffSign = diffMins >= 0 ? `+${diffMins}` : `${diffMins}`;

    return {
      solarStr: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
      lunarStr: lunar
        ? `Ngày ${lunar.lunarDay} tháng ${Math.abs(lunar.lunarMonth)}${
            lunar.isLeap ? ' (Nhuận)' : ''
          } năm ${translateGanZhi(lunar.yearGanZhi)}`
        : '',
      trueSolarClock: `${String(tst.hour).padStart(2, '0')}:${String(tst.minute).padStart(2, '0')}`,
      branchLabel: `${branchInfo.nameVi} (${branchInfo.nameCn})`,
      diffText: `${diffSign} phút so với giờ đồng hồ`,
    };
  }, [form]);

  const nameInputId = `${fieldPrefix}-name`;
  const citySelectId = `${fieldPrefix}-city`;
  const datePickerId = `${fieldPrefix}-date`;
  const timePickerId = `${fieldPrefix}-time`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60 shrink-0">
            <Compass size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              An sao theo Thiên Kỷ · Hiệu chỉnh giờ Mặt Trời thực
            </p>
          </div>
        </div>

        {/* Chuyển đổi Lịch Dương / Lịch Âm */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => handleCalendarTypeSwitch('solar')}
            aria-pressed={(form.calendarType || 'solar') === 'solar'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              (form.calendarType || 'solar') === 'solar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dương Lịch
          </button>
          <button
            type="button"
            onClick={() => handleCalendarTypeSwitch('lunar')}
            aria-pressed={form.calendarType === 'lunar'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              form.calendarType === 'lunar'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Âm Lịch
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-2' : 'md:grid-cols-12'} gap-4`}>
        {/* Họ tên */}
        <div className={compact ? 'sm:col-span-1' : 'md:col-span-5'}>
          <label htmlFor={nameInputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <User size={13} className="text-purple-600" aria-hidden="true" />
              Họ tên đương số
            </span>
          </label>
          <input
            id={nameInputId}
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nhập họ tên (VD: Nguyễn Văn A)"
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Giới tính */}
        <div className={compact ? 'sm:col-span-1' : 'md:col-span-3'}>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Giới tính</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('gender', 'male')}
              aria-pressed={form.gender === 'male'}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                form.gender === 'male'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Nam Mệnh
            </button>
            <button
              type="button"
              onClick={() => updateField('gender', 'female')}
              aria-pressed={form.gender === 'female'}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                form.gender === 'female'
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Nữ Mệnh
            </button>
          </div>
        </div>

        {/* Nơi sinh (Tỉnh/Thành phố Việt Nam & Quốc tế) */}
        <div className={compact ? 'sm:col-span-2' : 'md:col-span-4'}>
          <label htmlFor={citySelectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-[#F05A28]" aria-hidden="true" />
              Nơi sinh (Tính Giờ Mặt Trời Thực)
            </span>
          </label>
          <select
            id={citySelectId}
            value={form.city || 'Hà Nội'}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer transition-colors"
          >
            {VIETNAM_REGIONS.map((region) => (
              <optgroup key={region} label={region}>
                {VIETNAM_CITIES.filter((c) => c.region === region).map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name} ({city.longitude}°E)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Ngày sinh (Calendar Popover: react-day-picker Dương lịch & Lịch Âm thông minh) */}
        <div className={compact ? 'sm:col-span-1' : 'md:col-span-6'}>
          <div className="flex items-center justify-between gap-2 min-h-[20px] mb-1.5">
            <label
              htmlFor={datePickerId}
              className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Calendar size={13} className="text-purple-600 shrink-0" aria-hidden="true" />
              <span>Ngày sinh ({form.calendarType === 'lunar' ? 'Âm lịch' : 'Dương lịch'})</span>
            </label>
          </div>
          <BirthDatePicker
            id={datePickerId}
            year={form.year}
            month={form.month}
            day={form.day}
            calendarType={form.calendarType || 'solar'}
            isLeapMonth={Boolean(form.isLeapMonth)}
            onChange={handleDateChange}
            ariaLabel={`Ngày sinh ${title}`}
          />
        </div>

        {/* Giờ & Phút sinh (Time & 12 Canh Giờ Popover) */}
        <div className={compact ? 'sm:col-span-1' : 'md:col-span-6'}>
          <div className="flex items-center justify-between gap-2 min-h-[20px] mb-1.5">
            <label
              htmlFor={timePickerId}
              className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <Clock size={13} className="text-purple-600 shrink-0" aria-hidden="true" />
              <span>Giờ sinh (24h)</span>
            </label>
            <label
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap select-none"
              title="Nếu không nhớ giờ sinh, hệ thống sẽ an sao mặc định theo Giờ Tý"
            >
              <input
                type="checkbox"
                checked={form.unknownTime}
                onChange={(e) => updateField('unknownTime', e.target.checked)}
                className="rounded accent-[#17372f] cursor-pointer"
              />
              <span>Chưa rõ giờ</span>
            </label>
          </div>
          <BirthTimePicker
            id={timePickerId}
            clockHour={form.clockHour}
            clockMinute={form.clockMinute}
            unknownTime={form.unknownTime}
            onChange={handleTimeChange}
            ariaLabel={`Giờ sinh ${title}`}
          />
        </div>
      </div>

      {/* Thanh tóm tắt Lịch Âm Dương & Giờ Mặt Trời Thực */}
      <div className="mt-4 p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-medium text-purple-900">
            <Info size={14} className="text-purple-700 shrink-0" aria-hidden="true" />
            Dương lịch: <strong className="tabular-nums">{previewInfo.solarStr}</strong>
          </span>
          {previewInfo.lunarStr && (
            <span className="text-slate-700">
              • Âm lịch: <strong className="text-purple-900">{previewInfo.lunarStr}</strong>
            </span>
          )}
          {!form.unknownTime && (
            <span className="text-slate-700">
              • Giờ Mặt Trời Thực:{' '}
              <strong className="text-[#F05A28] tabular-nums">
                {previewInfo.trueSolarClock} ({previewInfo.branchLabel})
              </strong>{' '}
              <span className="text-slate-500">[{previewInfo.diffText}]</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmitClick}
          className="ziwei-outline ziwei-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
        >
          {justSubmitted ? (
            <>
              <Check size={16} aria-hidden="true" />
              <span>Đã cập nhật lá số</span>
            </>
          ) : (
            <>
              <Sparkles size={16} aria-hidden="true" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>

      {/* Lá Số Danh Nhân Mẫu */}
      {!hideFamousPresets && (
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Award size={14} className="text-amber-600" aria-hidden="true" />
            <span>Khám phá nhanh Lá Số Danh Nhân Thế Giới:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FAMOUS_CHART_PRESETS_VI.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectFamous(preset)}
                title={preset.highlightVi}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-800 border border-slate-200/80 hover:border-purple-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                {preset.nameVi} ({preset.year})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
