import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Compass,
  Heart,
  Briefcase,
  Coins,
  Activity,
  User,
  Users,
  Baby,
  Plane,
  Handshake,
  Home,
  Sun,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
  Layers,
  ExternalLink,
  Cpu,
  LayoutGrid,
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

interface AiInsightPanelProps {
  chart: ZiweiChart;
  chartSummaryText: string;
  selectedPalace: Palace | null;
  onAskQuestion: (prompt: string, context: string) => void;
  savedReadings?: Record<string, string>;
  onReadingGenerated?: (key: string, content: string) => void;
  autoAnalyzeOverview?: boolean;
}

const TOPIC_ICON_MAP: Record<TopicKey, typeof Compass> = {
  overview: Compass,
  personality: User,
  love: Heart,
  career: Briefcase,
  wealth: Coins,
  health: Activity,
  family: Users,
  children: Baby,
  move: Plane,
  friends: Handshake,
  home: Home,
  spirit: Sun,
  parents: ShieldCheck,
};

export default function AiInsightPanel({
  chart,
  chartSummaryText,
  selectedPalace,
  onAskQuestion,
  savedReadings = {},
  onReadingGenerated,
  autoAnalyzeOverview = true,
}: AiInsightPanelProps) {
  const [activeTopic, setActiveTopic] = useState<TopicKey>('overview');
  const [showAll13Grid, setShowAll13Grid] = useState<boolean>(false);
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

  // Toàn bộ 13 chiều luận giải cố định của đương số
  const all13DeterministicReadings = useMemo(
    () => showAll13Grid
      ? THIRTEEN_DIMENSIONS_META.map((topic) => ({
          ...topic,
          ...buildDeterministicDimensionReading(chart, topic.key),
        }))
      : [],
    [chart, showAll13Grid]
  );

  // Luận đoán cố định theo quy tắc của chủ đề đang chọn
  const deterministicReading = useMemo(
    () => buildDeterministicDimensionReading(chart, activeTopic),
    [chart, activeTopic]
  );

  // Tìm 4 cung Tam Phương Tứ Chính của chủ đề hiện tại
  const topicFocusPalaces = useMemo(() => {
    const mainPalace =
      chart.palaces.find((p) => p.name.startsWith(currentTopicMeta.palacePrefixCn)) ||
      (currentTopicMeta.palacePrefixCn === '交友'
        ? chart.palaces.find((p) => p.name.startsWith('仆役'))
        : undefined) ||
      chart.palaces.find((p) => p.branch === chart.mingGongBranch) ||
      chart.palaces[0];
    if (!mainPalace) return [];

    const opp = chart.palaces.find((p) => p.branch === (mainPalace.branch + 6) % 12);
    const san1 = chart.palaces.find((p) => p.branch === (mainPalace.branch + 4) % 12);
    const san2 = chart.palaces.find((p) => p.branch === (mainPalace.branch + 8) % 12);

    return [
      { roleLabel: 'Bản Cung Trọng Tâm', palace: mainPalace },
      ...(opp ? [{ roleLabel: 'Đối Cung Xung Chiếu', palace: opp }] : []),
      ...(san1 ? [{ roleLabel: 'Tam Hợp Hội Chiếu 1', palace: san1 }] : []),
      ...(san2 ? [{ roleLabel: 'Tam Hợp Hội Chiếu 2', palace: san2 }] : []),
    ];
  }, [chart, currentTopicMeta]);

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
        {/* Top Banner Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F05A28] to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Luận mệnh
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAll13Grid((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                showAll13Grid
                  ? 'bg-white text-slate-900 border-white shadow-xs'
                  : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
              }`}
            >
              <LayoutGrid size={14} className="text-[#F05A28]" />
              <span>
                {showAll13Grid ? 'Thu gọn tổng quan' : 'Xem 13 chủ đề'}
              </span>
            </button>

            {selectedPalace && (
              <button
                type="button"
                onClick={handleAnalyzeSelectedPalace}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>Hỏi về cung {translatePalaceName(selectedPalace.name)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Lưới Toàn Cảnh 13 Chiều Cuộc Đời (Hiển thị ngay toàn bộ 13 lĩnh vực của đương số) */}
        {showAll13Grid && (
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold">
                  <LayoutGrid size={13} className="text-[#F05A28]" />
                  <span>Bản Đồ 13 Lĩnh Vực Cuộc Đời Của Đương Số</span>
                </span>
                <span className="text-xs text-slate-500">
                  Bấm vào bất kỳ lĩnh vực nào để xem chi tiết Tam Phương Tứ Chính &amp; gọi Đại Sư AI
                  luận giải sâu
                </span>
              </div>
              <span className="text-xs font-bold text-purple-800">
                Đã phân tích AI: {Object.keys(topicReadings).length}/13 chiều
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {all13DeterministicReadings.map((dim) => {
                const Icon = TOPIC_ICON_MAP[dim.key] || Compass;
                const isSelected = activeTopic === dim.key;
                const hasAi = Boolean(topicReadings[dim.key]);
                return (
                  <div
                    key={dim.key}
                    onClick={() => setActiveTopic(dim.key)}
                    className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-orange-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-[#F05A28] text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">
                              {dim.labelVi}
                            </div>
                            <div className="text-[10px] font-semibold text-purple-700">
                              Cung {dim.palaceNameVi} ({dim.palaceGanZhiVi})
                            </div>
                          </div>
                        </div>

                        {hasAi ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 size={10} />
                            Đã có AI
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalyzeTopic(dim.key);
                            }}
                            disabled={loadingTopic}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F05A28] hover:bg-[#d94b1c] text-white text-[10px] font-extrabold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles size={10} />
                            <span>Gọi AI</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-800 font-semibold leading-snug line-clamp-2">
                        {dim.headlineVi}
                      </p>

                      {dim.plainAnalysisVi[0] && (
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {dim.plainAnalysisVi[0].takeaway}
                        </p>
                      )}
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{dim.subVi}</span>
                      <span className="font-bold text-purple-800">Xem chi tiết →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main 2-Column Workstation Layout: Chi tiết 13 Chiều (Cột Trái + Giữa) */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Sidebar: 13 Dimension Selector */}
          <div className="lg:col-span-4 bg-slate-50/80 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                  <span>Chủ đề</span>
                  <span className="text-[11px] text-purple-700 font-bold">
                    {Object.keys(topicReadings).length}/13 đã luận AI
                  </span>
                </div>

                <select
                  aria-label="Chủ đề luận giải"
                  value={activeTopic}
                  onChange={(event) => setActiveTopic(event.target.value as TopicKey)}
                  className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm lg:hidden"
                >
                  {THIRTEEN_DIMENSIONS_META.map((topic) => (
                    <option key={topic.key} value={topic.key}>{topic.labelVi}</option>
                  ))}
                </select>
                <div className="hidden grid-cols-2 gap-2 lg:grid">
                  {THIRTEEN_DIMENSIONS_META.map((t) => {
                    const Icon = TOPIC_ICON_MAP[t.key] || Compass;
                    const isActive = activeTopic === t.key;
                    const hasCached = Boolean(topicReadings[t.key]);
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTopic(t.key)}
                        className={`group text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : hasCached
                            ? 'bg-purple-50/90 text-slate-900 border-purple-200 hover:border-purple-400'
                            : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-[#F05A28] text-white'
                                : hasCached
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-orange-50 group-hover:text-[#F05A28]'
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          {hasCached ? (
                            <span
                              className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              <CheckCircle2 size={9} />
                              AI
                            </span>
                          ) : (
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                isActive
                                  ? 'bg-white/10 text-amber-300'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              Sẵn sàng
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-extrabold leading-tight">{t.labelVi}</div>
                          <div
                            className={`text-[10px] mt-0.5 line-clamp-1 ${
                              isActive ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {t.subVi}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Khẩu quyết Thiên Kỷ của chủ đề đang chọn */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950">
                  <BookOpen size={14} className="text-[#F05A28]" />
                  <span>Nguyên Lý《Thiên Kỷ》— {currentTopicMeta.labelVi}</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed italic">
                  {currentTopicMeta.principleVi}
                </p>
              </div>
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

          {/* Right Content Area: Tầng 1 (Luận giải cố định) + Tầng 2 (Luận giải AI) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-white p-5 sm:p-6 space-y-6">
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
                    {currentTopicMeta.labelVi} — {currentTopicMeta.subVi}
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
                    <span>Căn Cứ Tinh Hệ Tam Phương Tứ Chính Của {currentTopicMeta.labelVi}</span>
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
                        Tầng 2: Diễn Giải Tự Nhiên Bằng Đại Sư AI ({currentTopicMeta.labelVi})
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
                    <span>Tầng 2: Tổng Hợp Chuyên Sâu Bằng AI ({currentTopicMeta.labelVi})</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold">
                    {loadingTopic
                      ? `Đại Sư AI Đang Phân Tích Chuyên Sâu ${currentTopicMeta.labelVi}...`
                      : `Yêu Cầu Đại Sư AI Diễn Giải Sâu Thêm Về ${currentTopicMeta.labelVi}`}
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
                      : `Gọi AI Diễn Giải ${currentTopicMeta.labelVi}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
