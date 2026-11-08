import { useState, useMemo } from 'react';
import {
  HeartHandshake,
  Sparkles,
  Send,
  AlertCircle,
  ArrowLeftRight,
  Compass,
  Star,
  Sun,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import type { BirthFormState, ZiweiChart } from '../engine/types';
import { formToBirthInfo } from '../engine/share';
import { generateChart } from '../engine/algorithm';
import { detectPatterns } from '../engine/patterns';
import { analyzeDeterministicHeming } from '../engine/heming-analyzer';
import {
  buildVietnameseChartSummaryText,
  translateWuxingJu,
  translateYinYangGender,
  formatPalaceStarsSummaryVi,
} from '../utils/ziweiLocalization';
import { ziweiApiService } from '../services/ziweiApiService';
import BirthFormCard from './BirthFormCard';
import { FormattedAiReading } from './AiInsightPanel';

interface HemingPanelProps {
  initialFormA: BirthFormState;
}

const HEMING_QUICK_QUESTIONS = [
  'Đánh giá tổng quan mức độ hợp nhau về tình duyên và hôn nhân giữa hai người?',
  'Hai người có hợp để hùn vốn khởi nghiệp hoặc hợp tác kinh doanh lâu dài không?',
  'Khía cạnh nào dễ phát sinh mâu thuẫn nhất giữa hai lá số và cách hóa giải?',
  'Tài vận và cung Phúc Đức của hai người có bổ trợ vượng phu ích tử không?',
];

function QuickChartSummaryBadge({
  label,
  chart,
}: {
  label: string;
  chart: ZiweiChart;
}) {
  const mingPalace = chart.palaces.find((p) => p.branch === chart.mingGongBranch);
  const fuqiPalace = chart.palaces.find((p) => p.name.startsWith('夫妻'));
  const fudePalace = chart.palaces.find((p) => p.name.startsWith('福德'));
  const guanluPalace = chart.palaces.find((p) => p.name.startsWith('官禄'));

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-purple-700" />
          <span className="text-sm font-extrabold text-slate-900">
            {label}: {chart.birthInfo.name || 'Đương số'}
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
          {translateYinYangGender(chart.yinYangGender)} • {translateWuxingJu(chart.wuxingJuName)}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
        <div>
          <strong className="text-slate-900">Cung Mệnh:</strong>{' '}
          {mingPalace ? formatPalaceStarsSummaryVi(mingPalace).majorText : '—'}
        </div>
        <div>
          <strong className="text-slate-900">Cung Phu Thê:</strong>{' '}
          {fuqiPalace ? formatPalaceStarsSummaryVi(fuqiPalace).majorText : '—'}
        </div>
        <div>
          <strong className="text-slate-900">Cung Phúc Đức:</strong>{' '}
          {fudePalace ? formatPalaceStarsSummaryVi(fudePalace).majorText : '—'}
        </div>
        <div>
          <strong className="text-slate-900">Cung Quan Lộc:</strong>{' '}
          {guanluPalace ? formatPalaceStarsSummaryVi(guanluPalace).majorText : '—'}
        </div>
      </div>
    </div>
  );
}

export default function HemingPanel({ initialFormA }: HemingPanelProps) {
  const [formA, setFormA] = useState<BirthFormState>(initialFormA);
  const [formB, setFormB] = useState<BirthFormState>({
    name: 'Đương số B',
    year: '1998',
    month: '8',
    day: '15',
    clockHour: '10',
    clockMinute: '0',
    unknownTime: false,
    gender: initialFormA.gender === 'male' ? 'female' : 'male',
    province: 'Miền Bắc',
    city: 'Hà Nội',
    longitude: 105.85,
    utcOffsetMinutes: 420,
    calendarType: 'solar',
    isLeapMonth: false,
  });

  const [analysisText, setAnalysisText] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { chartA, chartB, summaryA, summaryB, synastryReport } = useMemo(() => {
    const cA = generateChart(formToBirthInfo(formA));
    const cB = generateChart(formToBirthInfo(formB));
    const patA = detectPatterns(cA);
    const patB = detectPatterns(cB);
    const report = analyzeDeterministicHeming(cA, cB);
    return {
      chartA: cA,
      chartB: cB,
      summaryA: `${buildVietnameseChartSummaryText(cA, patA)}\n\n${report.promptContextTextVi}`,
      summaryB: buildVietnameseChartSummaryText(cB, patB),
      synastryReport: report,
    };
  }, [formA, formB]);

  const handleRunHeming = async (questionOverride?: string) => {
    if (loading) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const q = (questionOverride ?? customQuestion).trim() || undefined;
      const res = await ziweiApiService.analyzeHeming({
        chartASummary: summaryA,
        chartBSummary: summaryB,
        question: q,
      });
      setAnalysisText(res.reply);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi phân tích Hợp Hôn.');
    } finally {
      setLoading(false);
    }
  };

  const nameA = chartA.birthInfo.name || 'Bên A';
  const nameB = chartB.birthInfo.name || 'Bên B';

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu Hợp Bàn */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F05A28] text-white flex items-center justify-center shrink-0 shadow-sm">
            <HeartHandshake size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                Tử Vi Hợp Bàn 5 Bước • Học Phái Thiên Kỷ Nghê Hải Hạ
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Thuật Toán 2 Chiều + DeepSeek V3
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
              Hợp Hôn &amp; Hợp Tác Kinh Doanh Chuyên Sâu (Đối Chiếu 5 Bước A ↔ B)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Tự động phân tích 5 bước chuẩn《Thiên Kỷ》: (1) Nền tảng Mệnh–Thân–Phúc, (2) Phu Thê đối
              chiếu 2 chiều, (3) Thái Dương – Thái Âm, (4) Phi Hóa Tứ Hóa A→B &amp; B→A, (5) Vận hạn
              đồng bộ &amp; Hợp tác sự nghiệp.
            </p>
          </div>
        </div>
      </div>

      {/* Form 2 cột: Bên A & Bên B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BirthFormCard
          form={formA}
          onChange={setFormA}
          onSubmit={setFormA}
          compact
          hideFamousPresets
          title="Đương Số Bên A (Nam / Đối tác 1)"
          submitLabel="Cập Nhật Lá Số A"
        />
        <BirthFormCard
          form={formB}
          onChange={setFormB}
          onSubmit={setFormB}
          compact
          hideFamousPresets
          title="Đương Số Bên B (Nữ / Đối tác 2)"
          submitLabel="Cập Nhật Lá Số B"
        />
      </div>

      {/* BÁO CÁO THUẬT TOÁN HỢP BÀN 5 BƯỚC (HIỂN THỊ TỨC THỜI) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
        {/* Tổng điểm Tương hợp & Tóm tắt */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#F05A28] text-white uppercase tracking-wider">
                Kết Quả Thuật Toán Cố Định
              </span>
              <span className="text-xs text-amber-300 font-bold">
                {synastryReport.step2FuqiCross.matchBadgeVi}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold">{synastryReport.scoreTitleVi}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {synastryReport.scoreSummaryVi}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-4 py-3 rounded-2xl border border-white/15 shrink-0">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < synastryReport.overallScore
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-600'
                }
              />
            ))}
            <span className="ml-1.5 text-sm font-extrabold text-amber-300">
              {synastryReport.overallScore}/5
            </span>
          </div>
        </div>

        {/* Đối chiếu nhanh 4 cung trụ cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickChartSummaryBadge label="Lá Số A" chart={chartA} />
          <QuickChartSummaryBadge label="Lá Số B" chart={chartB} />
        </div>

        {/* BƯỚC 1 & BƯỚC 3: NỀN TẢNG MỆNH CÁCH + NHẬT NGUYỆT TINH TƯỢNG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bước 1 */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                Bước 1 / 5 • Nền Tảng Mệnh Cách &amp; Phúc Đức
              </span>
              <span className="text-xs font-bold text-purple-800">
                {synastryReport.step1Foundation.compatibilityLabelVi}
              </span>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div>
                • <strong>{nameA}:</strong> Nhóm {synastryReport.step1Foundation.groupAVi} (Phúc Đức:{' '}
                {synastryReport.step2FuqiCross.auditA.fudeMajorStarsVi.join(', ')})
              </div>
              <div>
                • <strong>{nameB}:</strong> Nhóm {synastryReport.step1Foundation.groupBVi} (Phúc Đức:{' '}
                {synastryReport.step2FuqiCross.auditB.fudeMajorStarsVi.join(', ')})
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/70">
              {synastryReport.step1Foundation.analysisVi}
            </p>
          </div>

          {/* Bước 3 */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-600 text-white inline-flex items-center gap-1">
                <Sun size={12} /> Bước 3 / 5 • Thái Dương &amp; Thái Âm (Nam Thê – Nữ Phu)
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {[synastryReport.step3SunMoon.itemA, synastryReport.step3SunMoon.itemB].map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-amber-200/70 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold text-slate-900">
                      <span>
                        {item.ownerLabel} ({item.gender === 'male' ? 'Nam mệnh' : 'Nữ mệnh'})
                      </span>
                      <span className="text-[11px] text-amber-900">
                        Thái Dương: {item.sunBrightnessVi}
                        {item.sunSiHuaVi ? ` (${item.sunSiHuaVi})` : ''} • Thái Âm:{' '}
                        {item.moonBrightnessVi}
                        {item.moonSiHuaVi ? ` (${item.moonSiHuaVi})` : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.verdictVi}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* BƯỚC 2: ĐỐI CHIẾU CUNG PHU THÊ 2 CHIỀU & KHẨU QUYẾT CỔ TỊCH */}
        <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-800 text-white">
              Bước 2 / 5 • Đối Chiếu Cung Phu Thê 2 Chiều &amp; Khẩu Quyết《Thiên Kỷ》
            </span>
            <span className="text-xs font-extrabold text-[#F05A28]">
              {synastryReport.step2FuqiCross.matchBadgeVi}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {synastryReport.step2FuqiCross.matchDetailVi}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[synastryReport.step2FuqiCross.auditA, synastryReport.step2FuqiCross.auditB].map(
              (aud, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-purple-200/80 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-slate-900">
                      Cung Phu Thê của {aud.ownerLabel} (Cung {aud.palaceBranchVi})
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[11px]">
                      {aud.majorStarsVi.join(', ')}
                    </span>
                  </div>

                  {aud.deductionsVi.map((d, dIdx) => (
                    <div key={dIdx} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-purple-950">
                        ★ Sao {d.starVi} tọa Phu Thê: {d.summaryVi}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        <strong>Cát tượng:</strong> {d.goodVi}
                      </div>
                      <div className="text-[11px] text-rose-800">
                        <strong>Lưu ý:</strong> {d.badVi}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Khuyến nghị độ tuổi kết hôn:</strong> {d.timingVi}
                      </div>
                      {d.niQuoteVi && (
                        <div className="text-[11px] text-amber-950 bg-amber-50/80 p-2 rounded-lg border border-amber-200/70 italic">
                          <BookOpen size={11} className="inline mr-1 text-[#F05A28]" />
                          Nghê Hải Hạ: “{d.niQuoteVi}”
                        </div>
                      )}
                    </div>
                  ))}

                  {aud.sihuaNotesVi.map((note, nIdx) => (
                    <div
                      key={nIdx}
                      className="p-2 rounded-xl bg-orange-50/70 border border-orange-200 text-[11px] text-orange-950"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* BƯỚC 4: TỨ HÓA PHI HÓA TƯƠNG TÁC HAI CHIỀU (A -> B & B -> A) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F05A28] text-white">
              Bước 4 / 5 • Tứ Hóa Năm Sinh Phi Nhập Hai Chiều (A → B &amp; B → A)
            </span>
            <span className="text-xs font-extrabold text-slate-900">
              {synastryReport.step4FlyingSiHua.karmicBondTypeVi}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {synastryReport.step4FlyingSiHua.karmicSummaryVi}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chiều A -> B */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <span>Can năm sinh {nameA} ({synastryReport.step4FlyingSiHua.stemAVi})</span>
                <ArrowRight size={13} className="text-[#F05A28]" />
                <span>Phi nhập vào 12 Cung của {nameB}</span>
              </div>
              <div className="space-y-1.5">
                {synastryReport.step4FlyingSiHua.aToB.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs ${
                      item.nature === 'positive'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : item.nature === 'caution'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>
                        {item.starNameVi} Hóa {item.siHuaVi}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px]">
                        Rơi vào Cung {item.targetPalaceNameVi} của {nameB}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">{item.interpretationVi}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chiều B -> A */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <span>Can năm sinh {nameB} ({synastryReport.step4FlyingSiHua.stemBVi})</span>
                <ArrowRight size={13} className="text-purple-700" />
                <span>Phi nhập vào 12 Cung của {nameA}</span>
              </div>
              <div className="space-y-1.5">
                {synastryReport.step4FlyingSiHua.bToA.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs ${
                      item.nature === 'positive'
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : item.nature === 'caution'
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>
                        {item.starNameVi} Hóa {item.siHuaVi}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px]">
                        Rơi vào Cung {item.targetPalaceNameVi} của {nameA}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">{item.interpretationVi}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BƯỚC 5: VẬN HẠN ĐỒNG BỘ & ĐÁNH GIÁ HỢP TÁC KINH DOANH */}
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-800 text-white inline-flex items-center gap-1.5">
              <Briefcase size={13} /> Bước 5 / 5 • Đồng Bộ Đại Hạn &amp; Hợp Tác Kinh Doanh (Quan Lộc – Huynh Đệ)
            </span>
            <span className="text-xs font-extrabold text-emerald-900">
              Điểm Hợp Tác Sự Nghiệp: {synastryReport.step5DaxianAndBusiness.businessScore}/5 Sao
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1">
              <div className="font-bold text-slate-900">Vận Hạn Hiện Tại &amp; Thời Điểm Hôn Nhân</div>
              <div className="text-slate-700">
                • <strong>{nameA}:</strong> {synastryReport.step5DaxianAndBusiness.daxianAVi}
              </div>
              <div className="text-slate-700">
                • <strong>{nameB}:</strong> {synastryReport.step5DaxianAndBusiness.daxianBVi}
              </div>
              <p className="text-[11px] text-slate-600 pt-1">
                {synastryReport.step5DaxianAndBusiness.marriageTimingAdviceVi}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1.5">
              <div className="font-bold text-emerald-950">
                {synastryReport.step5DaxianAndBusiness.businessVerdictVi}
              </div>
              {synastryReport.step5DaxianAndBusiness.businessDetailsVi.map((dt, idx) => (
                <div key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                  {dt.includes('Lưu ý') || dt.includes('Cự Môn') ? (
                    <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span>{dt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nút bấm Phân Tích Hợp Bàn Bằng AI */}
        <div className="pt-2 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => handleRunHeming()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-sm font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={18} />
            <span>
              {loading
                ? 'Đại Sư AI đang tổng hợp 5 bước Hợp Bàn...'
                : 'Luận Giải Chuyên Sâu 5 Bước Hợp Bàn Bằng Đại Sư AI'}
            </span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={17} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => handleRunHeming()}
              className="px-3.5 py-1.5 rounded-xl bg-rose-700 text-white font-bold cursor-pointer shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Kết quả phân tích AI */}
        {analysisText && (
          <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/90 space-y-4">
            <FormattedAiReading text={analysisText} />
          </div>
        )}

        {/* Khung hỏi sâu thêm về Hợp Bàn */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-[#F05A28]" />
            <span>Câu hỏi chuyên sâu cho cặp lá số {nameA} &amp; {nameB}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {HEMING_QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setCustomQuestion(q);
                  handleRunHeming(q);
                }}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200 hover:border-purple-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  e.preventDefault();
                  handleRunHeming();
                }
              }}
              placeholder="Nhập câu hỏi cụ thể về mối quan hệ hoặc hợp tác giữa A và B..."
              className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleRunHeming()}
              disabled={loading || !customQuestion.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send size={15} />
              <span>Phân tích</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
