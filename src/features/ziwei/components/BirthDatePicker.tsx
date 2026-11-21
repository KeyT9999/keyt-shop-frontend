import { useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { Calendar, Check, ChevronDown, Moon, Sun } from 'lucide-react';
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
  getSolarMonthDayCount,
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
  onSyncDate: (year: number, month: number, day: number, isLeap: boolean, closePopover: boolean) => void;
  onClose: () => void;
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

function LunarCalendarPanel({ selected, onSyncDate, onClose }: LunarCalendarPanelProps) {
  const monthOptions = useMemo(() => buildLunarMonthOptions(selected.year), [selected.year]);
  const dayCount = useMemo(
    () => lunarMonthDayCount(selected.year, selected.month, selected.isLeapMonth) || 29,
    [selected.year, selected.month, selected.isLeapMonth]
  );

  const solarEquivalent = useMemo(
    () => lunarToSolar(selected.year, selected.month, selected.day, selected.isLeapMonth),
    [selected.year, selected.month, selected.day, selected.isLeapMonth]
  );

  const selectedMonthKey = `${selected.month}-${selected.isLeapMonth ? 1 : 0}`;

  const handleYearChange = (nextYear: number) => {
    const nextLeap = selected.isLeapMonth && leapMonthOfLunarYear(nextYear) === selected.month;
    const maxDay = lunarMonthDayCount(nextYear, selected.month, nextLeap) || 29;
    const clampedDay = Math.min(selected.day, maxDay);
    onSyncDate(nextYear, selected.month, clampedDay, nextLeap, false);
  };

  const handleMonthChange = (key: string) => {
    const found = monthOptions.find((item) => item.key === key);
    if (!found) return;
    const maxDay = lunarMonthDayCount(selected.year, found.month, found.isLeap) || 29;
    const clampedDay = Math.min(selected.day, maxDay);
    onSyncDate(selected.year, found.month, clampedDay, found.isLeap, false);
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
          value={selected.year}
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
          const isSelected = selected.day === d;

          return (
            <button
              key={d}
              type="button"
              onClick={() => onSyncDate(selected.year, selected.month, d, selected.isLeapMonth, true)}
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
          Tháng {selected.month}
          {selected.isLeapMonth ? ' nhuận' : ''} có {dayCount} ngày
        </span>
        <button type="button" onClick={onClose} className="ziwei-popover-done-btn">
          <Check size={13} aria-hidden="true" />
          <span>Xong</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Bộ chọn ngày sinh Dương lịch (react-day-picker v10 + Radix Popover) & Âm lịch.
 * Đổi tháng/năm cập nhật ngay ngày đang chọn (kèm tự clamp ngày cuối tháng hợp lệ)
 * để người dùng chọn theo bất kỳ thứ tự nào (ngày → tháng → năm hoặc năm → tháng → ngày) đều khớp tức thì.
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

  const selectedSolarDate = useMemo(
    () => new Date(normalized.year, normalized.month - 1, normalized.day),
    [normalized.year, normalized.month, normalized.day]
  );

  const displayedSolarMonth = useMemo(
    () => new Date(normalized.year, normalized.month - 1, 1),
    [normalized.year, normalized.month]
  );

  const lunarPreviewForSolar = useMemo(() => {
    if (normalized.calendarType !== 'solar') return null;
    return solarToLunar(normalized.year, normalized.month, normalized.day);
  }, [normalized]);

  const handleSolarMonthChange = (nextMonth: Date) => {
    const nextYear = nextMonth.getFullYear();
    const nextMonthNum = nextMonth.getMonth() + 1;
    const maxDay = getSolarMonthDayCount(nextYear, nextMonthNum);
    const clampedDay = Math.min(normalized.day, maxDay);

    onChange({
      year: String(nextYear),
      month: String(nextMonthNum),
      day: String(clampedDay),
      isLeapMonth: false,
    });
  };

  const handleSolarSelect = (picked: Date | undefined) => {
    if (!picked) {
      setOpen(false);
      return;
    }
    onChange({
      year: String(picked.getFullYear()),
      month: String(picked.getMonth() + 1),
      day: String(picked.getDate()),
      isLeapMonth: false,
    });
    setOpen(false);
  };

  const handlePickToday = () => {
    handleSolarSelect(new Date());
  };

  const handleLunarSync = (
    y: number,
    m: number,
    d: number,
    isLeap: boolean,
    closePopover: boolean
  ) => {
    onChange({
      year: String(y),
      month: String(m),
      day: String(d),
      isLeapMonth: isLeap,
    });
    if (closePopover) {
      setOpen(false);
    }
  };

  const formattedDate = formatBirthDateDisplay(normalized);
  const isLunar = normalized.calendarType === 'lunar';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
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
            <span className={`ziwei-picker-tag ${isLunar ? 'is-lunar' : 'is-solar'}`}>
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
              onSyncDate={handleLunarSync}
              onClose={() => setOpen(false)}
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
                  required
                  locale={vi}
                  selected={selectedSolarDate}
                  onSelect={handleSolarSelect}
                  month={displayedSolarMonth}
                  onMonthChange={handleSolarMonthChange}
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
                <button
                  type="button"
                  onClick={handlePickToday}
                  className="ziwei-popover-link-btn"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ziwei-popover-done-btn"
                >
                  <Check size={13} aria-hidden="true" />
                  <span>Xong</span>
                </button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
