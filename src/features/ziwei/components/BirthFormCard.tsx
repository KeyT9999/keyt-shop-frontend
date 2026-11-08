import { useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
  Compass,
  Award,
  Info,
} from 'lucide-react';
import type { BirthFormState } from '../engine/types';
import { VIETNAM_CITIES, VIETNAM_REGIONS, findCityByName } from '../engine/vietnam-cities';
import { calculateTrueSolarTime } from '../engine/true-solar-time';
import { solarToLunar, lunarToSolar } from '../engine/lunar-solar';
import { HOUR_BRANCH_LABELS_VI, translateGanZhi } from '../utils/ziweiLocalization';
import { FAMOUS_CHART_PRESETS_VI, type FamousChartPresetVi } from '../data/famousCharts';

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
  const updateField = <K extends keyof BirthFormState>(key: K, value: BirthFormState[K]) => {
    onChange({ ...form, [key]: value });
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

  // Tính Giờ Mặt Trời Thực & Đối chiếu Âm-Dương theo thời gian thực
  const previewInfo = useMemo(() => {
    let y = parseInt(form.year, 10) || 2000;
    let m = parseInt(form.month, 10) || 1;
    let d = parseInt(form.day, 10) || 1;

    if (form.calendarType === 'lunar') {
      const sol = lunarToSolar(y, m, d, Boolean(form.isLeapMonth));
      if (sol) {
        y = sol.year;
        m = sol.month;
        d = sol.day;
      }
    }

    const clockHour = parseInt(form.clockHour, 10) || 0;
    const clockMinute = parseInt(form.clockMinute, 10) || 0;
    const utcOffsetMinutes = form.utcOffsetMinutes ?? 420;

    const tst = calculateTrueSolarTime({
      year: y,
      month: m,
      day: d,
      clockHour,
      clockMinute,
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
            <Compass size={20} />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              Hệ thống an sao chuẩn《Thiên Kỷ》Nghê Hải Hạ &amp; hiệu chỉnh Giờ Mặt Trời Thực (UTC+7)
            </p>
          </div>
        </div>

        {/* Chuyển đổi Lịch Dương / Lịch Âm */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => updateField('calendarType', 'solar')}
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
            onClick={() => updateField('calendarType', 'lunar')}
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

      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-12'} gap-4`}>
        {/* Họ tên */}
        <div className={compact ? 'md:col-span-1' : 'md:col-span-5'}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <User size={13} className="text-purple-600" />
              Họ tên đương số
            </span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nhập họ tên (VD: Nguyễn Văn A)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Giới tính */}
        <div className={compact ? 'md:col-span-1' : 'md:col-span-3'}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Giới tính</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField('gender', 'male')}
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
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
              className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
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
        <div className={compact ? 'md:col-span-2' : 'md:col-span-4'}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-[#F05A28]" />
              Nơi sinh (Tính Giờ Mặt Trời Thực)
            </span>
          </label>
          <select
            value={form.city || 'Hà Nội'}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
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

        {/* Ngày / Tháng / Năm sinh */}
        <div className={compact ? 'md:col-span-1' : 'md:col-span-6'}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} className="text-purple-600" />
              Ngày • Tháng • Năm sinh ({form.calendarType === 'lunar' ? 'Âm lịch' : 'Dương lịch'})
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              aria-label="Ngày sinh"
              value={form.day}
              onChange={(e) => updateField('day', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>
                  Ngày {d}
                </option>
              ))}
            </select>
            <select
              aria-label="Tháng sinh"
              value={form.month}
              onChange={(e) => updateField('month', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={String(m)}>
                  Tháng {m}
                </option>
              ))}
            </select>
            <select
              aria-label="Năm sinh"
              value={form.year}
              onChange={(e) => updateField('year', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 105 }, (_, i) => 2028 - i).map((y) => (
                <option key={y} value={String(y)}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
          {form.calendarType === 'lunar' && (
            <label className="inline-flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.isLeapMonth)}
                onChange={(e) => updateField('isLeapMonth', e.target.checked)}
                className="rounded text-purple-600 cursor-pointer"
              />
              Tháng nhuận Âm lịch
            </label>
          )}
        </div>

        {/* Giờ / Phút sinh */}
        <div className={compact ? 'md:col-span-1' : 'md:col-span-6'}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5">
              <Clock size={13} className="text-purple-600" />
              Giờ &amp; Phút sinh (24h)
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.unknownTime}
                onChange={(e) => updateField('unknownTime', e.target.checked)}
                className="rounded text-purple-600 cursor-pointer"
              />
              Chưa rõ giờ (mặc định giờ Tý)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="Giờ sinh"
              disabled={form.unknownTime}
              value={form.clockHour}
              onChange={(e) => updateField('clockHour', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 disabled:opacity-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }, (_, h) => h).map((h) => (
                <option key={h} value={String(h)}>
                  {String(h).padStart(2, '0')} giờ
                </option>
              ))}
            </select>
            <select
              aria-label="Phút sinh"
              disabled={form.unknownTime}
              value={form.clockMinute}
              onChange={(e) => updateField('clockMinute', e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 disabled:opacity-50 focus:bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 60 }, (_, m) => m).map((m) => (
                <option key={m} value={String(m)}>
                  {String(m).padStart(2, '0')} phút
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thanh tóm tắt Lịch Âm Dương & Giờ Mặt Trời Thực */}
      <div className="mt-4 p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-medium text-purple-900">
            <Info size={14} className="text-purple-700 shrink-0" />
            Dương lịch: <strong>{previewInfo.solarStr}</strong>
          </span>
          {previewInfo.lunarStr && (
            <span className="text-slate-700">
              • Âm lịch: <strong className="text-purple-900">{previewInfo.lunarStr}</strong>
            </span>
          )}
          {!form.unknownTime && (
            <span className="text-slate-700">
              • Giờ Mặt Trời Thực:{' '}
              <strong className="text-[#F05A28]">
                {previewInfo.trueSolarClock} ({previewInfo.branchLabel})
              </strong>{' '}
              <span className="text-slate-500">[{previewInfo.diffText}]</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSubmit(form)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
        >
          <Sparkles size={16} />
          <span>{submitLabel}</span>
        </button>
      </div>

      {/* Lá Số Danh Nhân Mẫu */}
      {!hideFamousPresets && (
        <div className="mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Award size={14} className="text-amber-600" />
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

