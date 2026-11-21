import { useEffect, useMemo, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, Clock, Compass } from 'lucide-react';
import { HOUR_BRANCH_LABELS_VI } from '../utils/ziweiLocalization';
import {
  BRANCH_DEFAULT_CLOCK_HOURS,
  formatBirthTimeDisplay,
  getClockHourBranchIndex,
  normalizeBirthTime,
} from '../utils/birthDateTime';

export interface BirthTimeChangePayload {
  clockHour: string;
  clockMinute: string;
  unknownTime: boolean;
}

interface BirthTimePickerProps {
  id?: string;
  clockHour: string;
  clockMinute: string;
  unknownTime: boolean;
  onChange: (next: BirthTimeChangePayload) => void;
  ariaLabel?: string;
}

type TimePickerTab = 'clock' | 'branch';

const HOURS_24 = Array.from({ length: 24 }, (_, h) => h);
const MINUTES_60 = Array.from({ length: 60 }, (_, m) => m);
const QUICK_MINUTES = [0, 15, 30, 45] as const;

function centerScrollOnSelected(container: HTMLDivElement | null, selector: string) {
  if (!container) return;
  const active = container.querySelector<HTMLElement>(selector);
  if (!active) return;
  const containerRect = container.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();
  const relativeTop = activeRect.top - containerRect.top + container.scrollTop;
  const targetTop = relativeTop - container.clientHeight / 2 + active.clientHeight / 2;
  container.scrollTop = Math.max(0, targetTop);
}

/**
 * Bộ chọn Giờ & Phút sinh (24h + 12 Canh Giờ Tý–Hợi) sử dụng Radix Popover.
 * Hiển thị rõ HH:mm kèm Canh Giờ ngay trên nút trigger, không cắt chữ trên bố cục 2 cột.
 */
export default function BirthTimePicker({
  id,
  clockHour,
  clockMinute,
  unknownTime,
  onChange,
  ariaLabel = 'Chọn giờ và phút sinh',
}: BirthTimePickerProps) {
  const normalized = useMemo(
    () => normalizeBirthTime(clockHour, clockMinute),
    [clockHour, clockMinute]
  );

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TimePickerTab>('clock');

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || activeTab !== 'clock') return;
    const rafId = window.requestAnimationFrame(() => {
      centerScrollOnSelected(hourListRef.current, '[data-selected="true"]');
      centerScrollOnSelected(minuteListRef.current, '[data-selected="true"]');
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [open, activeTab]);

  const activeBranchInfo = HOUR_BRANCH_LABELS_VI[unknownTime ? 0 : normalized.branchIndex] ?? HOUR_BRANCH_LABELS_VI[0];
  const formattedTime = formatBirthTimeDisplay(normalized.hour, normalized.minute);

  const handleSelectHour = (hour: number) => {
    onChange({
      clockHour: String(hour),
      clockMinute: String(normalized.minute),
      unknownTime: false,
    });
  };

  const handleSelectMinute = (minute: number) => {
    onChange({
      clockHour: String(normalized.hour),
      clockMinute: String(minute),
      unknownTime: false,
    });
  };

  const handleSelectBranch = (branchIndex: number) => {
    const defaultHour = BRANCH_DEFAULT_CLOCK_HOURS[branchIndex] ?? 0;
    onChange({
      clockHour: String(defaultHour),
      clockMinute: '0',
      unknownTime: false,
    });
    setOpen(false);
  };

  const handleToggleUnknown = () => {
    onChange({
      clockHour: String(normalized.hour),
      clockMinute: String(normalized.minute),
      unknownTime: !unknownTime,
    });
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={`ziwei-picker-trigger group ${unknownTime ? 'is-muted' : ''}`}
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <Clock
              size={15}
              className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                unknownTime ? 'text-[#8c785c]' : 'text-[#8c3528]'
              }`}
              aria-hidden="true"
            />
            <span
              className={`font-bold tabular-nums tracking-tight whitespace-nowrap ${
                unknownTime ? 'text-[#6b583f]' : 'text-[#17372f]'
              }`}
            >
              {unknownTime ? 'Chưa rõ giờ' : formattedTime}
            </span>
          </span>

          <span className="inline-flex items-center gap-1.5 shrink-0">
            <span className={`ziwei-picker-tag ${unknownTime ? 'is-muted' : 'is-branch'}`}>
              <span>{activeBranchInfo.nameVi}</span>
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
          className="ziwei-popover-content ziwei-time-popover"
        >
          {/* Header */}
          <div className="ziwei-popover-header">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b583f]">
                {unknownTime ? 'Mặc định giờ Tý' : 'Giờ đồng hồ (24h)'}
              </div>
              <div className="text-sm font-extrabold text-[#17372f] tabular-nums">
                {unknownTime ? 'Chưa rõ giờ' : formattedTime}{' '}
                <span className="font-semibold text-[#8c3528]">
                  · {activeBranchInfo.nameVi} ({activeBranchInfo.nameCn})
                </span>
              </div>
            </div>
            <span className="ziwei-popover-badge">{activeBranchInfo.range}</span>
          </div>

          {/* Segmented mode tabs */}
          <div className="px-3 pt-2.5 pb-1.5">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#efe3cb] border border-[#d9c8a8]">
              <button
                type="button"
                onClick={() => setActiveTab('clock')}
                className={`ziwei-time-tab ${activeTab === 'clock' ? 'is-active' : ''}`}
              >
                <Clock size={12} aria-hidden="true" />
                <span>Giờ &amp; Phút</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('branch')}
                className={`ziwei-time-tab ${activeTab === 'branch' ? 'is-active' : ''}`}
              >
                <Compass size={12} aria-hidden="true" />
                <span>12 Canh Giờ</span>
              </button>
            </div>
          </div>

          {activeTab === 'clock' ? (
            <div className="px-3 pb-2.5 space-y-2">
              {/* Quick minute shortcuts */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-[#6b583f]">Phút nhanh:</span>
                <div className="flex items-center gap-1">
                  {QUICK_MINUTES.map((qm) => {
                    const isQuickSelected = !unknownTime && normalized.minute === qm;
                    return (
                      <button
                        key={qm}
                        type="button"
                        onClick={() => handleSelectMinute(qm)}
                        className={`ziwei-quick-min-btn ${isQuickSelected ? 'is-selected' : ''}`}
                      >
                        :{String(qm).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dual scrollable columns */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b583f] text-center pb-1">
                    Giờ (00–23)
                  </div>
                  <div
                    ref={hourListRef}
                    role="listbox"
                    aria-label="Chọn giờ sinh"
                    className="ziwei-time-col"
                  >
                    {HOURS_24.map((h) => {
                      const isSelected = !unknownTime && normalized.hour === h;
                      const branchShort = HOUR_BRANCH_LABELS_VI[getClockHourBranchIndex(h)].nameVi.replace(
                        'Giờ ',
                        ''
                      );
                      return (
                        <button
                          key={h}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-selected={isSelected ? 'true' : undefined}
                          onClick={() => handleSelectHour(h)}
                          className={`ziwei-time-option ${isSelected ? 'is-selected' : ''}`}
                        >
                          <span className="tabular-nums font-bold">
                            {String(h).padStart(2, '0')} giờ
                          </span>
                          <span className="ziwei-time-branch-hint">{branchShort}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b583f] text-center pb-1">
                    Phút (00–59)
                  </div>
                  <div
                    ref={minuteListRef}
                    role="listbox"
                    aria-label="Chọn phút sinh"
                    className="ziwei-time-col"
                  >
                    {MINUTES_60.map((m) => {
                      const isSelected = !unknownTime && normalized.minute === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-selected={isSelected ? 'true' : undefined}
                          onClick={() => handleSelectMinute(m)}
                          className={`ziwei-time-option justify-center ${
                            isSelected ? 'is-selected' : ''
                          }`}
                        >
                          <span className="tabular-nums font-bold">
                            {String(m).padStart(2, '0')} phút
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 px-3 py-2" role="listbox" aria-label="Chọn 12 Canh Giờ">
              {HOUR_BRANCH_LABELS_VI.map((item) => {
                const isSelected = !unknownTime && normalized.branchIndex === item.branch;
                return (
                  <button
                    key={item.branch}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectBranch(item.branch)}
                    className={`ziwei-branch-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs">{item.nameVi}</span>
                      <span className="text-[10px] opacity-80">{item.nameCn}</span>
                    </div>
                    <div className="text-[10px] tabular-nums opacity-80">{item.range}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="ziwei-popover-footer">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4a3c28] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={handleToggleUnknown}
                className="rounded accent-[#17372f] cursor-pointer"
              />
              <span>Chưa rõ giờ</span>
            </label>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ziwei-popover-done-btn"
            >
              <Check size={13} aria-hidden="true" />
              <span>Xong</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
