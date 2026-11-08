import { useMemo, useState } from 'react';
import { BarChart3, Compass, Layers, ScrollText } from 'lucide-react';
import type { Palace, ZiweiChart } from '../engine/types';
import { buildAnnualOutlook, READING_CHAPTERS, type ReadingChapterKey } from '../engine/reading-report';
import { buildFourPalaceReading, buildLifePeriods, getLifetimeYears, getPalaceFocus } from '../engine/lifetime-reading';
import { getDaXianIndexForYear, isChildhoodYear } from '../engine/yunxian-context';
import { detectPatterns } from '../engine/patterns';
import { formatPalaceStarsSummaryVi, localizePattern, translatePalaceName } from '../utils/ziweiLocalization';
import { buildPlainReadingPoints } from '../utils/plainReading';
import { ScoreExplanation, ScoreRing, TransitList } from './ReadingReport';
import PatternsPanel from './PatternsPanel';

interface LifetimeReportProps {
  chart: ZiweiChart;
  focus: Palace;
  year: number;
  unknownTime: boolean;
  scores: ReadonlyMap<ReadingChapterKey, number | undefined>;
  onSelectYear: (year: number) => void;
  onAskQuestion: (prompt: string) => void;
}

const names = (group: ReturnType<typeof buildFourPalaceReading>['group']) =>
  group.map(({ palace }) => translatePalaceName(palace.name)).join(', ');

function PalaceConnections({ chart, focus }: { chart: ZiweiChart; focus: Palace }) {
  const [branch, setBranch] = useState<number | null>(null);
  const selected = chart.palaces.find((palace) => palace.branch === branch) ?? focus;
  const { group, higher, lower } = buildFourPalaceReading(chart, selected);

  return (
    <div className="ziwei-lifetime-body">
      <label className="ziwei-report-controls">
        Cung trọng tâm
        <select value={selected.branch} onChange={(event) => setBranch(Number(event.target.value))}>
          {chart.palaces.map((palace) => <option key={palace.branch} value={palace.branch}>{translatePalaceName(palace.name)}</option>)}
        </select>
      </label>
      <p>Đọc <strong>{translatePalaceName(selected.name)}</strong> cùng đối cung và hai cung tam hợp để đặt các dấu sao vào bối cảnh của nhau.</p>
      <p><strong>Đọc kết hợp:</strong> {
        higher.length || lower.length ? (
          <>
            {higher.length > 0 && <>Các dấu ở <strong>{names(higher)}</strong> có điểm tham chiếu cao hơn cung trọng tâm. Hãy đối chiếu các mặt {higher.map(({ palace }) => getPalaceFocus(palace)).join('; ')}. </>}
            {lower.length > 0 && <>Nên xem kỹ thêm <strong>{names(lower)}</strong>, nhất là {lower.map(({ palace }) => getPalaceFocus(palace)).join('; ')}.</>}
          </>
        ) : 'Các cung liên quan có điểm tham chiếu ngang nhau. Hãy xem từng nhóm sao hỗ trợ và sao thử thách để phân biệt vai trò.'
      }</p>
      <div className="ziwei-linked-grid">
        {group.map(({ palace, roleLabel, score }) => {
          const stars = formatPalaceStarsSummaryVi(palace);
          return (
            <div className="ziwei-report-card" key={palace.branch}>
              <p className="ziwei-report-note">{roleLabel} · {score}/100</p>
              <h4>{translatePalaceName(palace.name)}</h4>
              <p><strong>Chính tinh:</strong> {stars.majorText}</p>
              <p><strong>Sao hỗ trợ:</strong> {stars.luckyText || 'Không ghi nhận trong nhóm đang xét'}</p>
              <p><strong>Sao thử thách:</strong> {stars.shaText || 'Không ghi nhận trong nhóm đang xét'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LifetimeReport({ chart, focus, year, unknownTime, scores, onSelectYear, onAskQuestion }: LifetimeReportProps) {
  const periods = useMemo(() => buildLifePeriods(chart), [chart]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentIndex = getDaXianIndexForYear(chart, year);
  const index = selectedIndex ?? (currentIndex >= 0 || isChildhoodYear(chart, year) ? currentIndex : periods.at(-1)?.index);
  const selected = periods.find((period) => period.index === index);
  const years = useMemo(() => getLifetimeYears(chart, index ?? -1).map((year) => ({
    year, outlook: buildAnnualOutlook(chart, year),
  })), [chart, index]);
  const patterns = useMemo(() => detectPatterns(chart).map(localizePattern), [chart]);
  const highlightedPatterns = [...patterns].sort((a, b) => {
    const priority = { excellent: 0, good: 1, caution: 2, neutral: 3 };
    return priority[a.level] - priority[b.level];
  }).slice(0, 3);
  const ranked = READING_CHAPTERS.filter(({ key }) => key !== 'forecast' && key !== 'overview')
    .map(({ key, short }) => ({ short, score: scores.get(key) ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const strongest = ranked.slice(0, 2);
  const toReview = ranked.slice(-2).filter(({ score }) => score < (strongest.at(-1)?.score ?? 0));
  const current = periods.find((period) => period.index === currentIndex);
  const periodStarNotes = selected ? buildPlainReadingPoints(
    selected.palace,
    selected.palace.stars.some(({ type }) => type === 'major')
      ? selected.palace.stars.filter(({ type }) => type === 'major').map(({ name }) => name)
      : selected.palace.borrowedStars ?? [],
    undefined,
    'overview',
  ).slice(0, 3) : [];

  return (
    <section id="ziwei-lifetime" className="ziwei-lifetime scroll-mt-24" aria-labelledby="ziwei-lifetime-title">
      <h3 id="ziwei-lifetime-title">Vận trình và tổng kết</h3>
      <p className="ziwei-report-note">Đọc lá số qua các giai đoạn và đối chiếu nhiều cung cùng lúc.</p>
      {unknownTime && <p className="ziwei-report-note">Chưa biết giờ sinh. Các cung và điểm bên dưới dùng giờ mặc định.</p>}

      <details className="ziwei-disclosure">
        <summary><BarChart3 size={18} aria-hidden="true" /> Bản đồ vận trình · Đại vận 10 năm</summary>
        <div className="ziwei-lifetime-body">
          <p>Chọn một giai đoạn theo tuổi âm để xem cung chủ vận, sao Tứ Hóa và từng Tiểu vận trong giai đoạn.</p>
          <ol className="ziwei-life-chart" aria-label="Biểu đồ thời gian các Đại vận">
            {getLifetimeYears(chart, -1).length > 0 && (
              <li>
                <button type="button" aria-pressed={index === -1} onClick={() => setSelectedIndex(-1)}>
                  <span>Tuổi nhỏ</span><span className="ziwei-report-note">Trước Đại vận đầu</span>
                </button>
              </li>
            )}
            {periods.map((period) => (
              <li key={period.index}>
                <button type="button" aria-pressed={period.index === index} onClick={() => setSelectedIndex(period.index)}>
                  <strong>{period.startAge}–{period.endAge} tuổi</strong>
                  <span>{period.years[0]}–{period.years.at(-1)} âm lịch</span>
                  <span>{translatePalaceName(period.palace.name)} · {period.score}/100</span>
                  <progress max={100} value={period.score} aria-label={`Điểm giai đoạn ${period.startAge}–${period.endAge} tuổi`} />
                </button>
              </li>
            ))}
          </ol>

          {selected ? (
            <section className="ziwei-report-card" aria-label="Luận Đại vận đã chọn">
              <div className="ziwei-chapter-heading">
                <div>
                  <p>{selected.years[0]}–{selected.years.at(-1)} âm lịch</p>
                  <h4>Đại vận {selected.startAge}–{selected.endAge} tuổi</h4>
                  <p>Cung chủ vận · {translatePalaceName(selected.palace.name)}</p>
                </div>
                <ScoreRing score={selected.score} />
              </div>
              <p><strong>Trọng tâm giai đoạn:</strong> {getPalaceFocus(selected.palace)}.</p>
              <p><strong>Chính tinh:</strong> {formatPalaceStarsSummaryVi(selected.palace).majorText}.</p>
              <ul className="ziwei-summary-patterns">
                {periodStarNotes.map(({ label, takeaway }) => <li key={label}><strong>{label}:</strong> {takeaway}</li>)}
              </ul>
              <p className="ziwei-report-note">Điểm Đại vận kết hợp các dấu tại cung chủ vận và Tứ Hóa theo can của cung đó.</p>
              <TransitList marks={selected.marks} />
              <ScoreExplanation factors={selected.factors} />
            </section>
          ) : <p>Giai đoạn tuổi nhỏ. Các năm dưới đây vẫn có cung Tiểu hạn và sao lưu riêng.</p>}

          <section className="ziwei-report-card" aria-label="Tiểu vận từng năm trong giai đoạn">
            <h4>Tiểu vận từng năm</h4>
            <p className="ziwei-report-note">Chọn năm để mở chi tiết sao lưu, cách tính điểm và biểu đồ tháng.</p>
            <ol className="ziwei-year-list">
              {years.map(({ year: option, outlook }) => outlook && (
                <li key={option}>
                  <button type="button" aria-pressed={year === option} onClick={() => onSelectYear(option)}>
                    <strong>{option}</strong>
                    <span>{outlook.age} tuổi · {translatePalaceName(outlook.focus.name)}</span>
                    <strong>{outlook.score}/100</strong>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </details>

      <details className="ziwei-disclosure">
        <summary><Compass size={18} aria-hidden="true" /> Phân tích Tam phương tứ chính</summary>
        <PalaceConnections chart={chart} focus={focus} />
      </details>

      <details className="ziwei-disclosure">
        <summary><Layers size={18} aria-hidden="true" /> Phân tích Cách cục · {patterns.length} tổ hợp</summary>
        <PatternsPanel chart={chart} onAskAiPattern={onAskQuestion} />
      </details>

      <details className="ziwei-disclosure">
        <summary><ScrollText size={18} aria-hidden="true" /> Báo cáo tổng kết</summary>
        <div className="ziwei-lifetime-body">
          <p><strong>Chủ đề nổi bật:</strong> {strongest.map(({ short, score }) => `${short} (${score}/100)`).join(' và ')}.</p>
          {toReview.length > 0 && <p><strong>Nên đối chiếu kỹ:</strong> {toReview.map(({ short, score }) => `${short} (${score}/100)`).join(' và ')}.</p>}
          {current && <p><strong>Đại vận của năm đang xem:</strong> {current.startAge}–{current.endAge} tuổi, tại cung {translatePalaceName(current.palace.name)}. Trọng tâm là {getPalaceFocus(current.palace)}.</p>}
          {highlightedPatterns.length > 0 ? (
            <>
              <h4>Tổ hợp sao nổi bật</h4>
              <ul className="ziwei-summary-patterns">
                {highlightedPatterns.map((pattern) => <li key={pattern.originalName}><strong>{pattern.nameVi}:</strong> {pattern.descriptionVi}</li>)}
              </ul>
            </>
          ) : <p>Chưa có tổ hợp sao nào thỏa điều kiện nhận diện trong bộ quy tắc hiện tại.</p>}
          <p className="ziwei-report-note">Các chủ đề được xếp theo điểm tham chiếu bản mệnh. Phần vận trình dùng điểm riêng theo giai đoạn và theo năm.</p>
        </div>
      </details>
    </section>
  );
}
