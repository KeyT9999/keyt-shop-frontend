import { useState } from 'react';
import { BarChart3, BookOpen, CalendarDays } from 'lucide-react';
import type { ZiweiChart } from '../engine/types';
import {
  buildAnnualOutlook,
  buildYearOutlook,
  getBirthOverview,
  READING_CHAPTERS,
  type ReadingChapterKey,
  type ScoreFactor,
} from '../engine/reading-report';
import { leapMonthOfLunarYear, solarToLunar } from '../engine/lunar-solar';
import { translatePalaceName } from '../utils/ziweiLocalization';

export function getDefaultReadingYear() {
  const [year, month, day] = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).split('-').map(Number);
  return solarToLunar(year, month, day)?.lunarYear ?? year;
}

export function ScoreRing({ score }: { score: number }) {
  return (
    <div className="ziwei-score-ring" role="img" aria-label={`${score} trên 100 điểm tham chiếu`}>
      <svg viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="36" />
        <circle cx="42" cy="42" r="36" pathLength="100" strokeDasharray={`${score} 100`} />
      </svg>
      <span aria-hidden="true"><strong>{score}</strong><small>/100</small></span>
    </div>
  );
}

export function ScoreExplanation({ factors }: { factors: ScoreFactor[] }) {
  return (
    <details className="ziwei-disclosure ziwei-score-explanation">
      <summary><BookOpen size={15} aria-hidden="true" /> Cách tính điểm</summary>
      <dl>
        <div><dt>Điểm nền</dt><dd>50</dd></div>
        {factors.map(({ label, value }) => (
          <div key={label}><dt>{label}</dt><dd>{value > 0 ? '+' : ''}{value}</dd></div>
        ))}
      </dl>
      <p>Tứ Hóa tính Lộc +6, Quyền và Khoa +4, Kỵ −8. Với sao lưu, cung trọng tâm nhận đủ điểm, các cung đối chiếu nhận nửa điểm.</p>
      <p>Điểm được giới hạn trong khoảng 0–100. Đây là thang tham chiếu nội bộ của KeyT, không phải xác suất xảy ra sự kiện.</p>
    </details>
  );
}

export function ReportComparison({ scores, active, onSelect }: {
  scores: ReadonlyMap<ReadingChapterKey, number | undefined>;
  active: ReadingChapterKey;
  onSelect: (key: ReadingChapterKey) => void;
}) {
  return (
    <details className="ziwei-disclosure ziwei-report-comparison" open={window.matchMedia('(min-width: 1024px)').matches}>
      <summary><BarChart3 size={18} aria-hidden="true" /> Biểu đồ 14 phần</summary>
      <p className="ziwei-report-note">Điểm tham chiếu theo dấu hỗ trợ và thử thách trên lá số, cùng thang 0–100.</p>
      <ol>
        {READING_CHAPTERS.map(({ key, short }, index) => {
          const score = scores.get(key);
          return (
            <li key={key}>
              <button type="button" aria-pressed={key === active} onClick={() => onSelect(key)}>
                <span>{String(index + 1).padStart(2, '0')}. {short}</span>
                {score !== undefined
                  ? <progress value={score} max={100} aria-label={`Điểm ${short}`} />
                  : <span className="ziwei-score-unavailable">Chưa có điểm</span>}
                <strong>{score ?? '—'}</strong>
              </button>
            </li>
          );
        })}
      </ol>
    </details>
  );
}

export function BirthOverview({ chart, unknownTime }: { chart: ZiweiChart; unknownTime: boolean }) {
  const birth = getBirthOverview(chart, unknownTime);
  const facts = [
    ['Can Chi năm sinh', birth.year],
    ['Bản mệnh (nạp âm)', birth.napAm],
    ['Ngũ hành bản mệnh', birth.element],
    ['Cục mệnh', birth.cycle],
    ['Chủ mệnh', birth.ming],
    ['Chủ thân', birth.shen],
    ['Thân cư', birth.shenPalace],
    ['Cân lượng', birth.weight ?? 'Cần giờ sinh'],
  ];
  return (
    <section className="ziwei-report-card" aria-label="Hồ sơ Mệnh – Thân">
      <h4>Hồ sơ Mệnh – Thân</h4>
      <dl className="ziwei-report-facts">
        {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {birth.weight && (
        <p className="ziwei-report-note">
          Cân lượng theo bảng dân gian. Năm, tháng, ngày và giờ lần lượt là {birth.weights.join(' + ')} chỉ.
        </p>
      )}
    </section>
  );
}

type Outlook = NonNullable<ReturnType<typeof buildYearOutlook>>;

export function TransitList({ marks }: { marks: Outlook['marks'] }) {
  return <ul className="ziwei-transit-list">
    {marks.map(({ label, palace, value }) => (
      <li key={label}><span><strong>{label}</strong> · {palace}</span><span>{value > 0 ? '+' : ''}{value}</span></li>
    ))}
  </ul>;
}

export function YearOutlook({ year, setYear, minimumYear, maximumYear, outlook, previousOutlook }: {
  year: number;
  setYear: (year: number) => void;
  minimumYear: number;
  maximumYear: number;
  outlook: Outlook | null;
  previousOutlook: ReturnType<typeof buildAnnualOutlook>;
}) {
  const [month, setMonth] = useState(1);
  const selected = outlook?.months[month - 1];
  const leapMonth = leapMonthOfLunarYear(year);
  return (
    <section className="ziwei-report-card ziwei-year-outlook" aria-label="Vận hạn năm và tháng">
      <div className="ziwei-report-controls">
        <h4><CalendarDays size={18} aria-hidden="true" /> Vận năm {year}</h4>
        <label>Năm âm lịch
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: Math.max(0, maximumYear - minimumYear + 1) }, (_, i) => minimumYear + i).map((option) =>
              <option key={option} value={option}>{option}</option>
            )}
          </select>
        </label>
      </div>
      {outlook && selected ? (
        <>
          <p><strong>Tiểu hạn tại cung {translatePalaceName(outlook.focus.name)}</strong> · {outlook.age} tuổi âm</p>
          <TransitList marks={outlook.marks} />
          {previousOutlook && (
            <details className="ziwei-disclosure">
              <summary>So với năm {year - 1}</summary>
              <p>Tiểu hạn chuyển từ <strong>{translatePalaceName(previousOutlook.focus.name)}</strong> sang <strong>{translatePalaceName(outlook.focus.name)}</strong>. Điểm tham chiếu từ {previousOutlook.score}/100 sang {outlook.score}/100.</p>
              <p className="ziwei-report-note">Các sao lưu của năm {year - 1}</p>
              <TransitList marks={previousOutlook.marks} />
            </details>
          )}
          <h4>Điểm theo 12 tháng âm lịch</h4>
          <p className="ziwei-report-note">Mỗi tháng dùng điểm nền của vận năm, rồi cộng trừ theo các sao Tứ Hóa lưu tháng. Chọn tháng để xem chi tiết.</p>
          {leapMonth > 0 && <p className="ziwei-report-note">Năm này có tháng {leapMonth} nhuận. Biểu đồ hiển thị 12 tháng chính.</p>}
          <ol className="ziwei-month-chart">
            {outlook.months.map((entry) => (
              <li key={entry.month}>
                <button type="button" aria-pressed={entry.month === month}
                  aria-label={`Tháng ${entry.month}, ${entry.score} trên 100`} onClick={() => setMonth(entry.month)}>
                  <strong>{entry.score}</strong>
                  <span className="ziwei-month-track" aria-hidden="true"><span style={{ height: `${entry.score}%` }} /></span>
                  <span>T{entry.month}</span>
                </button>
              </li>
            ))}
          </ol>
          <section className="ziwei-report-card ziwei-month-detail" aria-label={`Tháng ${month} âm lịch`}>
            <h4>Tháng {month} âm lịch · {selected.score}/100</h4>
            <p>{selected.score > outlook.score ? 'Các dấu trong tháng hỗ trợ nhiều hơn so với điểm vận năm.' :
              selected.score < outlook.score ? 'Tháng này có thêm dấu cần chú ý so với điểm vận năm.' :
              'Tổng cộng trừ của tháng cân bằng với điểm vận năm.'}</p>
            <TransitList marks={selected.marks} />
            <ScoreExplanation factors={selected.factors} />
          </section>
        </>
      ) : <p>Chưa tính được vận hạn cho năm này.</p>}
    </section>
  );
}
