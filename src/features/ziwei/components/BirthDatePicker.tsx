import { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { Calendar, ChevronDown, Moon, Sun } from 'lucide-react';
import {
  leapMonthOfLunarYear,
  lunarMonthDayCount,
  lunarToSolar,
  solarToLunar,
} from '../engine/lunar-solar';
import { translateGanZhi } from '../utils/ziweiLocalization';
import {
  BIRTH_YEAR_MAX,
  BIRTH_YEAR_MIN,
  formatBirthDateDisplay,
  getYearGanZhiVi,
  normalizeBirthDate,
  type NormalizedBirthDate,
} from '../utils/birthDateTime';

export interface BirthDateChangePayload {
  year: string;
  month: string;
  day: string;
  isLeapMonth: boolean;
}

interface BirthDatePickerProps {
  id?: string;
  year: string;
  month: string;
  day: string;
  calendarType?: 'solar' | 'lunar';
  isLeapMonth?: boolean;
  onChange: (next: BirthDateChangePayload) => void;
  ariaLabel?: string;
}

interface LunarMonthOption {
  key: string;
  month: number;
  isLeap: boolean;
  label: string;
}

interface LunarCalendarPanelProps {
  selected: NormalizedBirthDate;
  viewYear: number;
  viewMonth: number;
  viewLeap: boolean;
  onViewChange: (year: number, month: number, isLeap: boolean) => void;
  onSelectDay: (year: number, month: number, day: number, isLeap: boolean) => void;
}

const SOLAR_START_MONTH = new Date(BIRTH_YEAR_MIN, 0, 1);
const SOLAR_END_MONTH = new Date(BIRTH_YEAR_MAX, 11, 31);
const YEAR_OPTIONS = Array.from(
  { length: BIRTH_YEAR_MAX - BIRTH_YEAR_MIN + 1 },
  (_, index) => BIRTH_YEAR_MAX - index
);

function buildLunarMonthOptions(year: number): LunarMonthOption[] {
  const leapMonth = leapMonthOfLunarYear(year);
  const options: LunarMonthOption[] = [];

  for (let month = 1; month <= 12; month++) {
    options.push({
      key: `${month}-0`,
      month,
      isLeap: false,
      label: `Tháng ${month}`,
    });
    if (leapMonth === month) {
      options.push({
        key: `${month}-1`,
        month,
        isLeap: true,
        label: `Tháng ${month} (Nhuận)`,
      });
    }
  }
  return options;
}

function LunarCalendarPanel({
  selected,
  viewYear,
  viewMonth,
  viewLeap,
  onViewChange,
  onSelectDay,
}: LunarCalendarPanelProps) {
  const monthOptions = useMemo(() => buildLunarMonthOptions(viewYear), [viewYear]);
  const dayCount = useMemo(
    () => lunarMonthDayCount(viewYear, viewMonth, viewLeap) || 29,
    [viewYear, viewMonth, viewLeap]
  );

  const solarEquivalent = useMemo(
    () => lunarToSolar(selected.year, selected.month, selected.day, selected.isLeapMonth),
    [selected.year, selected.month, selected.day, selected.isLeapMonth]
  );

  const selectedMonthKey = `${viewMonth}-${viewLeap ? 1 : 0}`;

  const handleYearChange = (nextYear: number) => {
    const nextLeap = viewLeap && leapMonthOfLunarYear(nextYear) === viewMonth;
    onViewChange(nextYear, viewMonth, nextLeap);
  };

  const handleMonthChange = (key: string) => {
    const found = monthOptions.find((item) => item.key === key);
    if (found) {
      onViewChange(viewYear, found.month, found.isLeap);
    }
  };

  return (
    <div className="ziwei-lunar-panel">
      <div className="ziwei-popover-header">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b583f]">
            Lịch Âm · {getYearGanZhiVi(selected.year)}
          </div>
          <div className="text-sm font-extrabold text-[#17372f] tabular-nums">
            {formatBirthDateDisplay(selected)}
            {selected.isLeapMonth ? ' (Nhuận)' : ''}
          </div>
        </div>
        {solarEquivalent && (
          <span className="ziwei-popover-badge">
            Dương: {formatBirthDateDisplay(solarEquivalent)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 px-3 pt-3 pb-2">
        <select
          aria-label="Chọn tháng Âm lịch"
          value={selectedMonthKey}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="ziwei-popover-select"
        >
          {monthOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Chọn năm Âm lịch"
          value={viewYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="ziwei-popover-select"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y} · {getYearGanZhiVi(y)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 py-2" role="grid" aria-label="Ngày Âm lịch">
        {Array.from({ length: dayCount }, (_, index) => index + 1).map((d) => {
          const isSelected =
            selected.year === viewYear &&
            selected.month === viewMonth &&
            selected.isLeapMonth === viewLeap &&
            selected.day === d;

          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDay(viewYear, viewMonth, d, viewLeap)}
              aria-pressed={isSelected}
              className={`ziwei-lunar-day-btn ${isSelected ? 'is-selected' : ''}`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <div className="ziwei-popover-footer">
        <span className="text-[11px] text-[#6b583f]">
          Tháng {viewMonth}
          {viewLeap ? ' nhuận' : ''} năm {getYearGanZhiVi(viewYear)} có {dayCount} ngày
        </span>
      </div>
    </div>
  );
}

/**
 * Bộ chọn ngày sinh Dương lịch (react-day-picker v10 + Radix Popover) & Âm lịch
 * Hiển thị đầy đủ DD/MM/YYYY dạng tabular-nums không bao giờ bị cắt chữ trên form hẹp.
 */
export default function BirthDatePicker({
  id,
  year,
  month,
  day,
  calendarType = 'solar',
  isLeapMonth = false,
  onChange,
  ariaLabel = 'Chọn ngày sinh',
}: BirthDatePickerProps) {
  const normalized = useMemo(
    () => normalizeBirthDate(year, month, day, calendarType, isLeapMonth),
    [year, month, day, calendarType, isLeapMonth]
  );

  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => new Date(normalized.year, normalized.month - 1, 1)
  );
  const [lunarView, setLunarView] = useState({
    year: normalized.year,
    month: normalized.month,
    isLeap: normalized.isLeapMonth,
  });

  const selectedSolarDate = useMemo(
    () => new Date(normalized.year, normalized.month - 1, normalized.day),
    [normalized.year, normalized.month, normalized.day]
  );

  const lunarPreviewForSolar = useMemo(() => {
    if (normalized.calendarType !== 'solar') return null;
    return solarToLunar(normalized.year, normalized.month, normalized.day);
  }, [normalized]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDisplayMonth(new Date(normalized.year, normalized.month - 1, 1));
      setLunarView({
        year: normalized.year,
        month: normalized.month,
        isLeap: normalized.isLeapMonth,
      });
    }
    setOpen(nextOpen);
  };

  const handleSolarSelect = (picked: Date | undefined) => {
    if (!picked) return;
    onChange({
      year: String(picked.getFullYear()),
      month: String(picked.getMonth() + 1),
      day: String(picked.getDate()),
      isLeapMonth: false,
    });
    setDisplayMonth(new Date(picked.getFullYear(), picked.getMonth(), 1));
    setOpen(false);
  };

  const handlePickToday = () => {
    const today = new Date();
    handleSolarSelect(today);
  };

  const handleLunarSelect = (y: number, m: number, d: number, isLeap: boolean) => {
    onChange({
      year: String(y),
      month: String(m),
      day: String(d),
      isLeapMonth: isLeap,
    });
    setOpen(false);
  };

  const formattedDate = formatBirthDateDisplay(normalized);
  const isLunar = normalized.calendarType === 'lunar';

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className="ziwei-picker-trigger group"
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <Calendar
              size={15}
              className="text-[#8c3528] shrink-0 transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            />
            <span className="font-bold text-[#17372f] tabular-nums tracking-tight whitespace-nowrap">
              {formattedDate}
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 shrink-0">
            <span
              className={`ziwei-picker-tag ${isLunar ? 'is-lunar' : 'is-solar'}`}
            >
              {isLunar ? (
                <>
                  <Moon size={10} aria-hidden="true" />
                  <span>{normalized.isLeapMonth ? 'Âm Nhuận' : 'Âm'}</span>
                </>
              ) : (
                <>
                  <Sun size={10} aria-hidden="true" />
                  <span>Dương</span>
                </>
              )}
            </span>
            <ChevronDown
              size={15}
              className={`text-[#6b583f] transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          side="bottom"
          sideOffset={6}
          collisionPadding={{ top: 84, right: 12, bottom: 12, left: 12 }}
          className="ziwei-popover-content ziwei-date-popover"
        >
          {isLunar ? (
            <LunarCalendarPanel
              selected={normalized}
              viewYear={lunarView.year}
              viewMonth={lunarView.month}
              viewLeap={lunarView.isLeap}
              onViewChange={(y, m, isLeap) => setLunarView({ year: y, month: m, isLeap })}
              onSelectDay={handleLunarSelect}
            />
          ) : (
            <div>
              <div className="ziwei-popover-header">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b583f]">
                    Ngày sinh Dương lịch
                  </div>
                  <div className="text-sm font-extrabold text-[#17372f] tabular-nums">
                    {formattedDate}
                  </div>
                </div>
                {lunarPreviewForSolar && (
                  <span className="ziwei-popover-badge">
                    Âm: {lunarPreviewForSolar.lunarDay}/{lunarPreviewForSolar.lunarMonth}
                    {lunarPreviewForSolar.isLeap ? 'N' : ''} ·{' '}
                    {translateGanZhi(lunarPreviewForSolar.yearGanZhi)}
                  </span>
                )}
              </div>

              <div className="px-2.5 pt-2 pb-1">
                <DayPicker
                  mode="single"
                  locale={vi}
                  selected={selectedSolarDate}
                  onSelect={handleSolarSelect}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  captionLayout="dropdown"
                  navLayout="around"
                  reverseYears
                  fixedWeeks
                  showOutsideDays
                  startMonth={SOLAR_START_MONTH}
                  endMonth={SOLAR_END_MONTH}
                  className="ziwei-rdp"
                  formatters={{
                    formatMonthDropdown: (date) => `Tháng ${date.getMonth() + 1}`,
                  }}
                />
              </div>

              <div className="ziwei-popover-footer">
                <span className="text-[11px] text-[#6b583f]">
                  Chọn tháng/năm rồi chạm ngày
                </span>
                <button
                  type="button"
                  onClick={handlePickToday}
                  className="ziwei-popover-link-btn"
                >
                  Hôm nay
                </button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
