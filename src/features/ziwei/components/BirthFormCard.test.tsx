import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BirthFormState } from '../engine/types';
import BirthFormCard from './BirthFormCard';

const INITIAL_FORM: BirthFormState = {
  name: 'Đương số A',
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

function StatefulBirthFormHarness({
  initial = INITIAL_FORM,
  onSubmit = vi.fn(),
}: {
  initial?: BirthFormState;
  onSubmit?: (form: BirthFormState) => void;
}) {
  const [form, setForm] = useState<BirthFormState>(initial);
  return (
    <BirthFormCard
      form={form}
      onChange={setForm}
      onSubmit={onSubmit}
      compact
      hideFamousPresets
      title="Đương Số Bên A"
      submitLabel="Cập Nhật Lá Số A"
    />
  );
}

describe('BirthFormCard with BirthDatePicker and BirthTimePicker', () => {
  afterEach(() => {
    cleanup();
  });

  it('displays full formatted date & time on trigger buttons and updates immediately when picking a new date', () => {
    render(<StatefulBirthFormHarness />);

    const dateTrigger = screen.getByRole('button', { name: /Ngày sinh Đương Số Bên A/i });
    const timeTrigger = screen.getByRole('button', { name: /Giờ sinh Đương Số Bên A/i });

    expect(dateTrigger.textContent).toContain('02/07/2004');
    expect(dateTrigger.textContent).toContain('Dương');
    expect(timeTrigger.textContent).toContain('07:30');
    expect(timeTrigger.textContent).toContain('Giờ Thìn');

    // Open solar date popover and pick day 21 in the current month (July 2004)
    fireEvent.click(dateTrigger);
    const dialogGrid = screen.getByRole('grid');
    const day21Button = within(dialogGrid).getByRole('button', { name: /21/ });
    fireEvent.click(day21Button);

    expect(dateTrigger.textContent).toContain('21/07/2004');
    // Both the picker trigger and the Dương lịch summary box update in lockstep
    expect(screen.getAllByText('21/07/2004')).toHaveLength(2);
  });

  it('updates selected year and month immediately when changing dropdowns without re-clicking the day', () => {
    render(
      <StatefulBirthFormHarness
        initial={{ ...INITIAL_FORM, year: '1998', month: '9', day: '13' }}
      />
    );

    const dateTrigger = screen.getByRole('button', { name: /Ngày sinh Đương Số Bên A/i });
    expect(dateTrigger.textContent).toContain('13/09/1998');

    fireEvent.click(dateTrigger);
    // Change Year dropdown 1998 -> 2004 directly
    const yearSelect = screen.getByRole('combobox', { name: /năm|year/i });
    fireEvent.change(yearSelect, { target: { value: '2004' } });

    // Trigger and popover header immediately show 13/09/2004
    expect(dateTrigger.textContent).toContain('13/09/2004');
    expect(screen.getAllByText('13/09/2004').length).toBeGreaterThanOrEqual(2);

    // Clamp check: pick day 31 in Oct 2003 then switch month to Feb -> 28/02/2003
    fireEvent.change(yearSelect, { target: { value: '2003' } });
    const monthSelect = screen.getByRole('combobox', { name: /tháng|month/i });
    fireEvent.change(monthSelect, { target: { value: '9' } }); // 0-indexed Oct
    const dialogGrid = screen.getByRole('grid');
    fireEvent.click(within(dialogGrid).getByRole('button', { name: /31/ }));
    expect(dateTrigger.textContent).toContain('31/10/2003');

    fireEvent.click(dateTrigger);
    const monthSelectAgain = screen.getByRole('combobox', { name: /tháng|month/i });
    fireEvent.change(monthSelectAgain, { target: { value: '1' } }); // 0-indexed Feb
    expect(dateTrigger.textContent).toContain('28/02/2003');
  });

  it('converts cleanly to Lunar calendar and updates immediately when changing lunar year/month/day', () => {
    render(<StatefulBirthFormHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Âm Lịch' }));
    const dateTrigger = screen.getByRole('button', { name: /Ngày sinh Đương Số Bên A/i });
    // 02/07/2004 Solar -> 15/05/2004 Lunar
    expect(dateTrigger.textContent).toContain('15/05/2004');
    expect(dateTrigger.textContent).toContain('Âm');

    fireEvent.click(dateTrigger);
    const lunarYearSelect = screen.getByLabelText('Chọn năm Âm lịch');
    fireEvent.change(lunarYearSelect, { target: { value: '1999' } });
    expect(dateTrigger.textContent).toContain('15/05/1999');

    const lunarGrid = screen.getByRole('grid', { name: /Ngày Âm lịch/i });
    fireEvent.click(within(lunarGrid).getByRole('button', { name: '20' }));

    expect(dateTrigger.textContent).toContain('20/05/1999');
  });

  it('updates visible time via 24h columns, 12 Canh Giờ tab, and unknownTime toggle', () => {
    render(<StatefulBirthFormHarness />);

    const timeTrigger = screen.getByRole('button', { name: /Giờ sinh Đương Số Bên A/i });
    fireEvent.click(timeTrigger);

    // Pick 14 giờ and :45 quick minute
    fireEvent.click(screen.getByRole('option', { name: /14 giờ/i }));
    fireEvent.click(screen.getByRole('button', { name: ':45' }));

    expect(timeTrigger.textContent).toContain('14:45');
    expect(timeTrigger.textContent).toContain('Giờ Mùi');

    // Switch to 12 Canh Giờ and pick Giờ Hợi
    fireEvent.click(screen.getByRole('button', { name: /12 Canh Giờ/i }));
    fireEvent.click(screen.getByRole('option', { name: /Giờ Hợi/i }));

    expect(timeTrigger.textContent).toContain('22:00');
    expect(timeTrigger.textContent).toContain('Giờ Hợi');

    // Toggle "Chưa rõ giờ"
    const unknownCheckbox = screen.getByRole('checkbox', { name: /Chưa rõ giờ/i });
    fireEvent.click(unknownCheckbox);
    expect(timeTrigger.textContent).toContain('Chưa rõ giờ');
    expect(timeTrigger.textContent).toContain('Giờ Tý');
  });
});
