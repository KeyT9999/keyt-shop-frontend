import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Activity,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  Layers,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import type { ZiweiChart, Palace } from '../engine/types';
import type { TopicKey } from '../engine/db-analysis';
import {
  THIRTEEN_DIMENSIONS_META,
  buildDeterministicDimensionReading,
} from '../engine/thirteen-dimensions';
import { STEMS, BRANCHES } from '../engine/constants';
import {
  translatePalaceName,
  translateStem,
  translateBranch,
  PALACE_ROLE_VI,
  formatPalaceStarsSummaryVi,
} from '../utils/ziweiLocalization';
import { ziweiApiService } from '../services/ziweiApiService';

import { FormattedAiReading } from './FormattedAiReading';

import { buildAnnualOutlook, buildYearOutlook, getChapterPalace, getChapterScore, READING_CHAPTERS, type ReadingChapterKey } from '../engine/reading-report';
import { BirthOverview, getDefaultReadingYear, ReportComparison, ScoreExplanation, ScoreRing, YearOutlook } from './ReadingReport';

import { getFourPalaceGroup } from '../engine/lifetime-reading';
import LifetimeReport from './LifetimeReport';

interface AiInsightPanelProps {
  chart: ZiweiChart;
  unknownTime: boolean;
  chartSummaryText: string;
  selectedPalace: Palace | null;
  onAskQuestion: (prompt: string, context?: string) => void;
  savedReadings?: Record<string, string>;
  onReadingGenerated?: (key: string, content: string) => void;
  autoAnalyzeOverview?: boolean;
}

export default function AiInsightPanel({
  chart,
  unknownTime,
  chartSummaryText,
  selectedPalace,
  onAskQuestion,
  savedReadings = {},
  onReadingGenerated,
  autoAnalyzeOverview = true,
}: AiInsightPanelProps) {
  const [activeChapter, setActiveTopic] = useState<ReadingChapterKey>('overview');
  const activeTopic = activeChapter === 'forecast' ? 'overview' : activeChapter;
  const chapterIndex = READING_CHAPTERS.findIndex(({ key }) => key === activeChapter);
  const chapter = READING_CHAPTERS[chapterIndex];
  const chapterRef = useRef<HTMLElement>(null);
  const [year, setYear] = useState(() => Math.max(chart.lunarInfo.lunarYear, getDefaultReadingYear()));
  const maximumYear = Math.max(2050, chart.lunarInfo.lunarYear + (chart.daXians.at(-1)?.endAge ?? 1) - 1);
  const viewingYear = Math.min(maximumYear, Math.max(chart.lunarInfo.lunarYear, year));
  const outlook = useMemo(() => buildYearOutlook(chart, viewingYear), [chart, viewingYear]);
  const previousOutlook = useMemo(() => buildAnnualOutlook(chart, viewingYear - 1), [chart, viewingYear]);
  const natalScores = useMemo(() => new Map(READING_CHAPTERS
    .filter(({ key }) => key !== 'forecast')
    .map((entry) => [entry.key, getChapterScore(chart, entry)])), [chart]);
  const scores = new Map(READING_CHAPTERS.map(({ key }) => [
    key, key === 'forecast' ? outlook?.score : natalScores.get(key)?.score,
  ]));
  const scoreDetails = activeChapter === 'forecast' ? outlook : natalScores.get(activeChapter);
  const [topicReadings, setTopicReadings] = useState<Record<string, string>>(savedReadings);
  const [loadingTopic, setLoadingTopic] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const autoAnalyzedSignatureRef = useRef<string>('');

  useEffect(() => {
    setTopicReadings(savedReadings);
  }, [savedReadings]);

  const currentTopicMeta = useMemo(
    () =>
      THIRTEEN_DIMENSIONS_META.find((t) => t.key === activeTopic) ||
      THIRTEEN_DIMENSIONS_META[0],
    [activeTopic]
  );

  // Luận đoán cố định theo quy tắc của chủ đề đang chọn
  const deterministicReading = useMemo(
    () => buildDeterministicDimensionReading(chart, activeTopic),
    [chart, activeTopic]
  );

  const focusPalace = activeChapter === 'forecast' && outlook
    ? outlook.focus
    : getChapterPalace(chart, chapter);
  const topicFocusPalaces = getFourPalaceGroup(chart, focusPalace);

  const handleAnalyzeTopic = async (topicKey: TopicKey, forceRefresh = false) => {
    setActiveTopic(topicKey);
    setErrorMsg(null);

    if (!forceRefresh && topicReadings[topicKey]) {
      return;
    }

    const fixedData = buildDeterministicDimensionReading(chart, topicKey);
    setLoadingTopic(true);
    try {
      const res = await ziweiApiService.interpretChart({
        chartSummary: `${chartSummaryText}\n\n${fixedData.promptContextVi}`,
        topic: topicKey,
      });
      setTopicReadings((prev) => ({ ...prev, [topicKey]: res.reply }));
      onReadingGenerated?.(topicKey, res.reply);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi gọi AI luận giải.');
    } finally {
      setLoadingTopic(false);
    }
  };

  // Tự động gọi AI luận giải Tổng Quan Mệnh Cách ngay khi lập lá số mới
  useEffect(() => {
    if (!autoAnalyzeOverview) return;
    const sig = `${chart.birthInfo.year}-${chart.birthInfo.month}-${chart.birthInfo.day}-${chart.birthInfo.hour}-${chart.birthInfo.gender}`;
    if (autoAnalyzedSignatureRef.current === sig) return;
    autoAnalyzedSignatureRef.current = sig;
    if (!savedReadings.overview) {
      handleAnalyzeTopic('overview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, autoAnalyzeOverview]);

  const handleAnalyzeSelectedPalace = () => {
    if (!selectedPalace) return;
    const pNameVi = translatePalaceName(selectedPalace.name);
    const pRole = PALACE_ROLE_VI[selectedPalace.name] || '';
    const { majorText, luckyText, shaText } = formatPalaceStarsSummaryVi(selectedPalace);
    const prompt = `Hãy luận giải chuyên sâu 【Cung ${pNameVi}】 (chủ quản: ${pRole}) trên lá số của tôi. Các sao trong cung gồm — Chính tinh: ${majorText}${
      luckyText ? `, Cát tinh: ${luckyText}` : ''
    }${
      shaText ? `, Sát tinh: ${shaText}` : ''
    }. Hãy phân tích theo 4 mục: **【Định Tính Cung ${pNameVi}】**, **【Giải Mã Các Sao Theo Thiên Kỷ】**, **【Tam Phương Tứ Chính Chiếu Hợp】** và **【Lời Khuyên Thực Tế】**.`;
    onAskQuestion(prompt, deterministicReading.promptContextVi);
  };

  const handleCopyCurrentReading = async () => {
    const textToCopy = topicReadings[activeTopic];
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── KHỐI 1: TOÀN CẢNH 13 CHIỀU LUẬN GIẢI CUỘC ĐỜI CỦA ĐƯƠNG SỐ ─── */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <header className="ziwei-report-header">
          <div>
            <h2>Luận mệnh</h2>
            <p>14 phần · Từ Mệnh – Thân đến vận năm và tháng</p>
          </div>
          <button type="button" className="ziwei-outline" onClick={() =>
            document.getElementById('ziwei-lifetime')?.scrollIntoView({ block: 'start' })}>
            Xem vận trình và tổng kết
          </button>
          {selectedPalace && (
            <button type="button" className="ziwei-outline" onClick={handleAnalyzeSelectedPalace}>
              Hỏi về cung {translatePalaceName(selectedPalace.name)}
            </button>
          )}
        </header>

        <ReportComparison scores={scores} active={activeChapter} onSelect={(key) => {
          setActiveTopic(key);
          chapterRef.current?.scrollIntoView({ block: 'start' });
        }} />

        {/* Main 2-Column Workstation Layout: Chi tiết 13 Chiều (Cột Trái + Giữa) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Sidebar: 13 Dimension Selector */}
          <div className="lg:col-span-4 bg-slate-50/80 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <nav aria-label="14 phần luận giải">
                <label className="ziwei-chapter-select">
                  Chọn phần luận giải
                  <select aria-label="Chủ đề luận giải" value={activeChapter}
                    onChange={(event) => setActiveTopic(event.target.value as ReadingChapterKey)}>
                    {READING_CHAPTERS.map((item, index) => (
                      <option key={item.key} value={item.key}>{index + 1}. {item.title}</option>
                    ))}
                  </select>
                </label>
                <ol className="ziwei-chapter-list">
                  {READING_CHAPTERS.map((item, index) => (
                    <li key={item.key}>
                      <button type="button" aria-pressed={item.key === activeChapter} onClick={() => setActiveTopic(item.key)}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span>{item.title}<small>{item.palace}</small></span>
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>

            </div>

            {/* Cung đang chọn trên bàn lá số */}
            {selectedPalace && (
              <div className="p-3.5 rounded-2xl bg-white border border-purple-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                    Cung Đang Chọn Trên Bàn
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    Cung {translatePalaceName(selectedPalace.name)} (
                    {translateStem(STEMS[selectedPalace.stem] || '')}{' '}
                    {translateBranch(BRANCHES[selectedPalace.branch] || '')})
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Chính tinh:</strong> {formatPalaceStarsSummaryVi(selectedPalace).majorText}
                </p>
                <button
                  type="button"
                  onClick={handleAnalyzeSelectedPalace}
                  className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span>Hỏi AI Về Cung {translatePalaceName(selectedPalace.name)}</span>
                </button>
              </div>
            )}
          </div>

          <div className="ziwei-report-main lg:col-span-8">
            <section ref={chapterRef} className="ziwei-report-card scroll-mt-24" aria-label={chapter.title}>
              <div className="ziwei-chapter-heading">
                <div>
                  <p>Phần {chapterIndex + 1} / 14</p>
                  <h3>{chapter.title}</h3>
                  <p>Cung phân tích · {chapter.palace}</p>
                </div>
                {scoreDetails && <ScoreRing score={scoreDetails.score} />}
              </div>
              <p><strong>Nội dung chính:</strong> {chapter.coverage}.</p>
              <p>{chapter.lens}</p>
              {unknownTime && <p className="ziwei-report-note">Chưa biết giờ sinh. Cung và điểm đang dựa trên giờ mặc định.</p>}
              {scoreDetails && <ScoreExplanation factors={scoreDetails.factors} />}
            </section>
            {activeChapter === 'overview' && <BirthOverview chart={chart} unknownTime={unknownTime} />}
            {activeChapter === 'forecast' ? (
              <YearOutlook year={viewingYear} setYear={setYear} minimumYear={chart.lunarInfo.lunarYear}
                maximumYear={maximumYear} outlook={outlook} previousOutlook={previousOutlook} />
            ) : (
              <>
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Chưa thể hoàn tất luận giải AI</p>
                        <p className="mt-0.5 text-rose-700">{errorMsg}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAnalyzeTopic(activeTopic, true)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Thử lại ngay
                    </button>
                  </div>
                )}

                {/* ─── TẦNG 1: LUẬN ĐOÁN CỐ ĐỊNH THEO THUẬT TOÁN & KHẨU QUYẾT THIÊN KỶ ─── */}
                <div className="rounded-2xl border-2 border-purple-200/90 bg-gradient-to-br from-purple-50/40 via-white to-amber-50/30 p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-200/60">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold">
                        <Cpu size={13} className="text-amber-400" />
                        <span>Luận theo lá số</span>
                      </span>
                      <span className="text-xs font-bold text-purple-900">
                        {chapter.short} — {currentTopicMeta.subVi}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                      Theo quy tắc an sao
                    </span>
                  </div>

                  {/* Định điệu 1 câu */}
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Định Điệu Cốt Lõi (Nhất Cú Định Điệu)
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold leading-relaxed">
                      {deterministicReading.headlineVi}
                    </div>
                  </div>

                  {/* Chẩn đoán Đông Y nếu là chủ đề Sức Khỏe (health) */}
                  {deterministicReading.tcmOrganNoteVi && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                      <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <Activity size={14} className="text-emerald-700" />
                        <span>
                          Đối Chiếu Đông Y Tạng Phủ《Nhân Kỷ – Thiên Kỷ》:{' '}
                          {deterministicReading.tcmOrganNoteVi.organVi}
                        </span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">
                        <strong>Phương pháp dưỡng sinh:</strong>{' '}
                        {deterministicReading.tcmOrganNoteVi.adviceVi}
                      </p>
                    </div>
                  )}

                  <section className="space-y-3" aria-labelledby="ziwei-reading-points">
                    <h3 id="ziwei-reading-points" className="text-base font-bold text-slate-900">
                      Lá số này nói gì?
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700">
                      Mỗi ý bên dưới giải thích một dấu trên lá số theo quy tắc Tử Vi. Hãy đọc như một góc tham khảo về xu hướng.
                    </p>
                    <ul className="space-y-2.5">
                      {deterministicReading.plainAnalysisVi.map(({ label, takeaway, explanation }) => (
                        <li
                          key={label}
                          className="space-y-1.5 rounded-lg border border-slate-200/90 bg-white p-3 text-sm leading-relaxed text-slate-700 sm:p-4"
                        >
                          <h4 className="font-bold text-[#25453d]">{label}</h4>
                          <p><strong className="font-bold text-slate-900">{takeaway}</strong></p>
                          {explanation && <p>{explanation}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <details className="ziwei-disclosure">
                    <summary><BookOpen size={17} aria-hidden="true" /> Căn cứ và trích dẫn</summary>
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers size={13} className="text-purple-700" />
                        <span>Căn Cứ Tinh Hệ Tam Phương Tứ Chính Của {chapter.short}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {topicFocusPalaces.map(({ roleLabel, palace }, idx) => {
                          const starsInfo = formatPalaceStarsSummaryVi(palace);
                          const pVi = translatePalaceName(palace.name);
                          const stemVi = translateStem(STEMS[palace.stem] || '');
                          const branchVi = translateBranch(BRANCHES[palace.branch] || '');
                          return (
                            <div
                              key={palace.branch}
                              className={`p-3 rounded-xl border space-y-1 ${
                                idx === 0
                                  ? 'bg-purple-50/70 border-purple-200'
                                  : 'bg-white border-slate-200/90'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    idx === 0
                                      ? 'bg-purple-700 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {roleLabel}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500">
                                  Cung {pVi} ({stemVi} {branchVi})
                                </span>
                              </div>
                              <div className="text-xs text-slate-800">
                                <strong>Chính tinh:</strong>{' '}
                                <span className="font-bold text-purple-950">{starsInfo.majorText}</span>
                              </div>
                              {starsInfo.luckyText && (
                                <div className="text-[11px] text-emerald-800">
                                  <strong>Cát tinh:</strong> {starsInfo.luckyText}
                                </div>
                              )}
                              {starsInfo.shaText && (
                                <div className="text-[11px] text-rose-700">
                                  <strong>Sát/Kỵ:</strong> {starsInfo.shaText}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Khẩu quyết Nghê Hải Hạ (Trích từ 1.848 mục bài giảng Thiên Kỷ có mốc video) */}
                    {deterministicReading.matchedTianjiQuotes.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                          <BookOpen size={13} className="text-[#F05A28]" />
                          <span>
                            Trích Dẫn Lời Giảng Nghê Hải Hạ《Thiên Kỷ》Ứng Với Cung Này (Có Mốc Video)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {deterministicReading.matchedTianjiQuotes.map((q, qIdx) => (
                            <div
                              key={qIdx}
                              className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between gap-2 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="text-[10px] font-bold text-amber-800">
                                  {q.chapterLabelVi}
                                </div>
                                <div className="text-slate-900 font-semibold leading-relaxed">
                                  “{q.quoteVi}”
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono line-clamp-1">
                                  Nguyên văn: {q.quoteCn}
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-1.5 border-t border-amber-200/60 text-[10px]">
                                <span className="text-amber-900 font-bold">Mốc: {q.timeHms}</span>
                                <a
                                  href={q.bilibiliUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 font-bold text-[#F05A28] hover:underline"
                                >
                                  <span>Xem video gốc</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </details>
                </div>

                {/* ─── TẦNG 2: DIỄN GIẢI CHUYÊN SÂU BẰNG ĐẠI SƯ AI DEEPSEEK ─── */}
                {topicReadings[activeTopic] ? (
                  <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/20 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-orange-200/70">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F05A28] text-white text-xs font-extrabold">
                          <Sparkles size={13} />
                          <span>
                            Tầng 2: Diễn Giải Tự Nhiên Bằng Đại Sư AI ({chapter.short})
                          </span>
                        </span>
                        <span className="text-xs text-slate-500">
                          • Tổng hợp trên nền dữ liệu cố định Tầng 1
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyCurrentReading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="text-emerald-700">Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAnalyzeTopic(activeTopic, true)}
                          disabled={loadingTopic}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw size={13} />
                          <span>Luận giải lại</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-orange-200/80 shadow-2xs">
                      <FormattedAiReading text={topicReadings[activeTopic]} />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={14} className="text-[#F05A28]" />
                        <span>Tầng 2: Tổng Hợp Chuyên Sâu Bằng AI ({chapter.short})</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold">
                        {loadingTopic
                          ? `Đại Sư AI Đang Phân Tích Chuyên Sâu ${chapter.short}...`
                          : `Yêu Cầu Đại Sư AI Diễn Giải Sâu Thêm Về ${chapter.short}`}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        AI sẽ nhận toàn bộ dữ liệu quy tắc cố định ở Tầng 1 cùng 12 cung &amp; Đại Hạn
                        hiện tại để viết bài phân tích hoàn chỉnh bằng ngôn ngữ tự nhiên.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAnalyzeTopic(activeTopic)}
                      disabled={loadingTopic}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Sparkles size={17} className={loadingTopic ? 'animate-spin' : ''} />
                      <span>
                        {loadingTopic
                          ? 'Đang Luận Giải...'
                          : `Gọi AI Diễn Giải ${chapter.short}`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <LifetimeReport
        chart={chart}
        focus={focusPalace}
        year={viewingYear}
        unknownTime={unknownTime}
        scores={scores}
        onAskQuestion={onAskQuestion}
        onSelectYear={(selectedYear) => {
          setYear(selectedYear);
          setActiveTopic('forecast');
          chapterRef.current?.scrollIntoView({ block: 'start' });
        }}
      />
    </div>
  );
}
