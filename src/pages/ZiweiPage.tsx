import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  HeartHandshake,
  BookOpen,
  History,
  CheckCircle2,
  Trash2,
  Layers,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import type { BirthFormState, Palace, Star } from '../features/ziwei/engine/types';
import {
  formToBirthInfo,
  formToSearchParams,
  searchParamsToForm,
} from '../features/ziwei/engine/share';
import { generateChart } from '../features/ziwei/engine/algorithm';
import {
  type SchoolConfig,
  SCHOOL_DEFAULT_CONFIG,
  SCHOOL_PARAM_KEYS,
  loadSchoolConfig,
  saveSchoolConfig,
  resetSchoolConfig,
  configToParams,
  paramsToConfig,
} from '../features/ziwei/engine/school-config';
import { detectPatterns, getMingGongSummary } from '../features/ziwei/engine/patterns';
import { useHistory } from '../features/ziwei/engine/history';
import {
  buildVietnameseChartSummaryText,
  translateStarName,
  translateSiHua,
  translateWuxingJu,
  translateYinYangGender,
} from '../features/ziwei/utils/ziweiLocalization';
import { FAMOUS_CHART_PRESETS_VI } from '../features/ziwei/data/famousCharts';
import {
  ziweiApiService,
  type SavedZiweiRecord,
} from '../features/ziwei/services/ziweiApiService';
import BirthFormCard from '../features/ziwei/components/BirthFormCard';
import ChartBoard, { type ZiweiTimeView } from '../features/ziwei/components/ChartBoard';
import PatternsPanel from '../features/ziwei/components/PatternsPanel';
import AiInsightPanel from '../features/ziwei/components/AiInsightPanel';
import HemingPanel from '../features/ziwei/components/HemingPanel';
import StarDetailModal from '../features/ziwei/components/StarDetailModal';
import ShareChartModal from '../features/ziwei/components/ShareChartModal';
import SchoolConfigModal from '../features/ziwei/components/SchoolConfigModal';
import ClassicsLibraryPanel from '../features/ziwei/components/ClassicsLibraryPanel';

type ZiweiPageTab = 'chart' | 'heming' | 'classics' | 'history';

const DEFAULT_FORM: BirthFormState = {
  name: '',
  year: '1998',
  month: '6',
  day: '15',
  clockHour: '9',
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

export default function ZiweiPage() {
  const { token } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { history: localHistory, save: saveToLocalHistory, remove: removeFromLocalHistory } =
    useHistory();

  const [activeTab, setActiveTab] = useState<ZiweiPageTab>('chart');
  const [formState, setFormState] = useState<BirthFormState>(() => {
    const parsed = searchParamsToForm(searchParams);
    return parsed ? { ...DEFAULT_FORM, ...parsed } : DEFAULT_FORM;
  });
  const [committedForm, setCommittedForm] = useState<BirthFormState>(formState);
  const [showBirthForm, setShowBirthForm] = useState<boolean>(false);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const hasSchoolInUrl = SCHOOL_PARAM_KEYS.some((k) => searchParams.has(k));
    return hasSchoolInUrl ? paramsToConfig(searchParams) : loadSchoolConfig();
  });
  const [schoolModalOpen, setSchoolModalOpen] = useState<boolean>(false);

  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [inspectingStar, setInspectingStar] = useState<{
    star: Star;
    palace: Palace;
  } | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [externalPromptRequest, setExternalPromptRequest] = useState<{
    id: number;
    prompt: string;
  } | null>(null);

  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Cloud Saved Records & AI Readings Cache
  const [cloudRecords, setCloudRecords] = useState<SavedZiweiRecord[]>([]);
  const [savedReadingsMap, setSavedReadingsMap] = useState<Record<string, string>>({});
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Load cloud saved charts when logged in
  useEffect(() => {
    if (!token) return;
    ziweiApiService
      .listRecords(token)
      .then((records) => setCloudRecords(records))
      .catch(() => {});
  }, [token]);

  const customSchoolRulesCount = useMemo(() => {
    let count = 0;
    (Object.keys(SCHOOL_DEFAULT_CONFIG) as (keyof SchoolConfig)[]).forEach((k) => {
      if (schoolConfig[k] !== SCHOOL_DEFAULT_CONFIG[k]) count++;
    });
    return count;
  }, [schoolConfig]);

  // Compute Ziwei Chart, Patterns, and Vietnamese Summary
  const { chart, chartSummaryText, mingMainStarsVi, birthInfo } = useMemo(() => {
    const bInfo = formToBirthInfo(committedForm);
    const generated = generateChart(bInfo, schoolConfig);
    const detected = detectPatterns(generated);
    const summaryText = buildVietnameseChartSummaryText(generated, detected);
    const mingSummary = getMingGongSummary(generated);
    const mingVi =
      mingSummary.stars.length > 0
        ? mingSummary.stars.map((s) => translateStarName(s)).join(', ')
        : 'Vô Chính Diệu';

    return {
      chart: generated,
      chartSummaryText: summaryText,
      mingMainStarsVi: mingVi,
      birthInfo: bInfo,
    };
  }, [committedForm, schoolConfig]);

  const shareUrl = useMemo(() => {
    const params = formToSearchParams(committedForm);
    const schoolParams = configToParams(schoolConfig);
    Object.entries(schoolParams).forEach(([k, v]) => params.set(k, v));
    return `${window.location.origin}/tu-vi?${params.toString()}`;
  }, [committedForm, schoolConfig]);

  const syncUrlParams = (form: BirthFormState, cfg: SchoolConfig) => {
    const params = formToSearchParams(form);
    const schoolParams = configToParams(cfg);
    Object.entries(schoolParams).forEach(([k, v]) => params.set(k, v));
    setSearchParams(params, { replace: true });
  };

  const handleApplyBirthForm = (nextForm: BirthFormState) => {
    setFormState(nextForm);
    setCommittedForm(nextForm);
    setSelectedPalace(null);
    setSavedReadingsMap({});
    setShowBirthForm(false);
    saveToLocalHistory(nextForm);
    syncUrlParams(nextForm, schoolConfig);
  };

  const handleUpdateSchoolConfig = (nextConfig: SchoolConfig) => {
    setSchoolConfig(nextConfig);
    saveSchoolConfig(nextConfig);
    syncUrlParams(committedForm, nextConfig);
  };

  const handleResetSchoolConfig = () => {
    resetSchoolConfig();
    setSchoolConfig({ ...SCHOOL_DEFAULT_CONFIG });
    syncUrlParams(committedForm, SCHOOL_DEFAULT_CONFIG);
  };

  const handleSaveChartToAccount = async () => {
    saveToLocalHistory(committedForm);
    if (!token) {
      setSaveFeedback('Đã lưu lá số vào trình duyệt (Đăng nhập để đồng bộ đám mây).');
      setTimeout(() => setSaveFeedback(null), 3500);
      return;
    }

    setIsSavingRecord(true);
    try {
      const saved = await ziweiApiService.saveRecord(token, {
        name: committedForm.name || 'Lá số Tử Vi',
        gender: committedForm.gender,
        year: parseInt(committedForm.year, 10) || 2000,
        month: parseInt(committedForm.month, 10) || 1,
        day: parseInt(committedForm.day, 10) || 1,
        clockHour: parseInt(committedForm.clockHour, 10) || 0,
        clockMinute: parseInt(committedForm.clockMinute, 10) || 0,
        unknownTime: committedForm.unknownTime,
        city: committedForm.city || 'Hà Nội',
        longitude: committedForm.longitude,
        utcOffsetMinutes: committedForm.utcOffsetMinutes ?? 420,
        wuxingJuName: translateWuxingJu(chart.wuxingJuName),
        mingMainStars: mingMainStarsVi,
        aiReadings: savedReadingsMap,
      });

      setCloudRecords((prev) => [saved, ...prev.filter((r) => r._id !== saved._id)]);
      setSaveFeedback('Đã lưu lá số & bài luận AI vào tài khoản KeyT thành công!');
      setTimeout(() => setSaveFeedback(null), 3500);
    } catch (err) {
      setSaveFeedback(err instanceof Error ? err.message : 'Lỗi khi lưu lá số.');
      setTimeout(() => setSaveFeedback(null), 3500);
    } finally {
      setIsSavingRecord(false);
    }
  };

  const scrollToAiSection = () => {
    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSelectSiHua = (starNameCn: string, siHuaCn: string, view: ZiweiTimeView) => {
    const starVi = translateStarName(starNameCn);
    const shVi = translateSiHua(siHuaCn);
    const viewLabel =
      view === 'daxian' ? 'Đại Hạn' : view === 'liunian' ? 'Lưu Niên' : 'Bản Mệnh';
    const prompt = `Hãy phân tích chuyên sâu hiện tượng 【${viewLabel}: Sao ${starVi} Hóa ${shVi}】 trên lá số của tôi theo học phái Thiên Kỷ của Nghê Hải Hạ (bao gồm ý nghĩa cốt lõi, tác động lên cung tọa thủ, đường chiếu Tam Phương Tứ Chính và lời khuyên ứng xử).`;
    setExternalPromptRequest({ id: Date.now(), prompt });
    scrollToAiSection();
  };

  const handleTriggerAiPrompt = (prompt: string) => {
    setActiveTab('chart');
    setExternalPromptRequest({ id: Date.now(), prompt });
    scrollToAiSection();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white py-6 px-4 border-b border-indigo-900/50">
        <div className="max-w-[1380px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold">
              <Compass size={14} className="text-[#F05A28]" />
              <span>TỬ VI ĐẨU SỐ THIÊN KỶ • NGHÊ HẢI HẠ &amp; CỔ TỊCH TOÀN THƯ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              La Kinh Tử Vi Đẩu Số &amp; Đại Sư AI Luận Giải
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              An sao chính xác theo lịch pháp Âm Dương &amp; Chân Thái Dương Thời 63 tỉnh thành Việt
              Nam (UTC+7), tự động nhận diện hơn 40 Cách Cục cổ điển, chấm lá số Hợp Hôn và luận
              giải chuyên sâu bằng DeepSeek AI.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('chart')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-[#F05A28] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Compass size={16} />
              <span>Bàn Lá Số &amp; AI Đại Sư</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('heming')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'heming'
                  ? 'bg-[#F05A28] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <HeartHandshake size={16} />
              <span>Xem Hợp Hôn (A &amp; B)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('classics')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'classics'
                  ? 'bg-[#F05A28] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <BookOpen size={16} />
              <span>Kho Cổ Tịch《Thiên Kỷ》</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#F05A28] text-white shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <History size={16} />
              <span>Lá Số Đã Lưu ({cloudRecords.length || localHistory.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 pt-5 space-y-6">
        {saveFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {/* TAB 1: BÀN LÁ SỐ 12 CUNG & ĐẠI SƯ AI LUẬN GIẢI */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            {/* Thanh Điều Khiển Đương Số & Chọn Nhanh Danh Nhân */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold">
                    <Compass size={14} className="text-[#F05A28]" />
                    <span>{committedForm.name || 'Lá Số Đương Số'}</span>
                  </span>

                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 font-bold">
                    {translateYinYangGender(chart.yinYangGender)} •{' '}
                    {translateWuxingJu(chart.wuxingJuName)}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-950 border border-amber-200 font-bold">
                    Mệnh: {mingMainStarsVi}
                  </span>

                  <span className="text-slate-600 font-medium">
                    Dương lịch:{' '}
                    <strong className="text-slate-900">
                      {committedForm.day}/{committedForm.month}/{committedForm.year}
                    </strong>{' '}
                    ({committedForm.unknownTime ? 'Giờ Tý' : `${committedForm.clockHour}:${committedForm.clockMinute.padStart(2, '0')}`}) •{' '}
                    <strong className="text-purple-800">{committedForm.city}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSchoolModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-colors cursor-pointer ${
                      customSchoolRulesCount > 0
                        ? 'bg-orange-50 text-[#F05A28] border-[#F05A28]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>
                      Cài Đặt Trường Phái
                      {customSchoolRulesCount > 0 ? ` (${customSchoolRulesCount}/10)` : ' (10 Nhóm)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={scrollToAiSection}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold transition-colors cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#F05A28]" />
                    <span>Luận Giải 13 Chiều &amp; AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBirthForm((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
                  >
                    <SlidersHorizontal size={14} />
                    <span>
                      {showBirthForm
                        ? 'Thu Gọn Khung Nhập'
                        : 'Đổi Ngày Giờ Sinh / Lập Lá Số Mới'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Thanh chọn nhanh Lá Số Danh Nhân Thế Giới */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
                  <Award size={13} className="text-[#F05A28]" />
                  <span>Lá Số Danh Nhân Mẫu:</span>
                </span>
                {FAMOUS_CHART_PRESETS_VI.map((preset) => {
                  const isCurrent = committedForm.name === preset.nameVi;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        const next: BirthFormState = {
                          name: preset.nameVi,
                          year: String(preset.year),
                          month: String(preset.month),
                          day: String(preset.day),
                          clockHour: String(preset.clockHour),
                          clockMinute: '0',
                          unknownTime: false,
                          gender: preset.gender,
                          province: 'Miền Bắc',
                          city: 'Hà Nội',
                          longitude: 105.85,
                          utcOffsetMinutes: 420,
                          calendarType: 'solar',
                          isLeapMonth: false,
                        };
                        handleApplyBirthForm(next);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/60'
                      }`}
                      title={preset.highlightVi}
                    >
                      {preset.nameVi}
                    </button>
                  );
                })}
              </div>
            </div>

            {showBirthForm && (
              <BirthFormCard
                form={formState}
                onChange={setFormState}
                onSubmit={handleApplyBirthForm}
              />
            )}

            {/* 1. BÀN LÁ SỐ 12 CUNG 4x4 TOÀN CHIỀU RỘNG (Rõ ràng, thoáng đãng, chuẩn truyền thống) */}
            <ChartBoard
              chart={chart}
              selectedPalace={selectedPalace}
              onSelectPalace={setSelectedPalace}
              onSelectStar={(star, palace) => setInspectingStar({ star, palace })}
              onSelectSiHua={handleSelectSiHua}
              onOpenShareModal={() => setShareModalOpen(true)}
              onOpenSchoolConfig={() => setSchoolModalOpen(true)}
              customSchoolRulesCount={customSchoolRulesCount}
              onSaveChart={handleSaveChartToAccount}
              isSavingChart={isSavingRecord}
            />

            {/* 2. TRẠM ĐẠI SƯ AI LUẬN GIẢI (Bố cục 2 cột rộng rãi, có Bảng Tóm Tắt Tinh Hệ Tức Thời) */}
            <div ref={aiSectionRef} className="scroll-mt-20">
              <AiInsightPanel
                chart={chart}
                chartSummaryText={chartSummaryText}
                selectedPalace={selectedPalace}
                externalPromptRequest={externalPromptRequest}
                savedReadings={savedReadingsMap}
                onReadingGenerated={(topicKey, content) =>
                  setSavedReadingsMap((prev) => ({ ...prev, [topicKey]: content }))
                }
              />
            </div>

            {/* 3. NHẬN DIỆN CÁCH CỤC CỔ ĐIỂN & ĐOẠN NGỮ THIÊN KỶ */}
            <PatternsPanel chart={chart} onAskAiPattern={handleTriggerAiPrompt} />
          </div>
        )}

        {/* TAB 2: XEM HỢP HÔN & HỢP TÁC ĐÔI (HEMING) */}
        {activeTab === 'heming' && <HemingPanel initialFormA={committedForm} />}

        {/* TAB 3: KHO CỔ TỊCH THIÊN KỶ (1.848 KHẨU QUYẾT CÓ MỐC VIDEO) & TAM ĐẠI CỔ TỊCH */}
        {activeTab === 'classics' && (
          <ClassicsLibraryPanel onAskAiQuote={handleTriggerAiPrompt} />
        )}

        {/* TAB 4: LÁ SỐ ĐÃ LƯU */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers size={19} className="text-purple-700" />
                  <span>Danh Sách Lá Số Đã Lưu</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn một lá số để mở lại bàn an sao và các bài luận giải AI đã lưu.
                </p>
              </div>
            </div>

            {cloudRecords.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Đồng bộ trên tài khoản KeyT ({cloudRecords.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cloudRecords.map((rec) => (
                    <div
                      key={rec._id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/60 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-900">{rec.name}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                            {rec.gender === 'male' ? 'Nam' : 'Nữ'} • {rec.wuxingJuName || ''}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Ngày sinh: {rec.day}/{rec.month}/{rec.year} — {rec.clockHour}:
                          {String(rec.clockMinute).padStart(2, '0')} ({rec.city})
                        </div>
                        {rec.mingMainStars && (
                          <div className="text-xs text-purple-800 font-semibold mt-1">
                            Chính tinh Mệnh: {rec.mingMainStars}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            const restored: BirthFormState = {
                              name: rec.name,
                              year: String(rec.year),
                              month: String(rec.month),
                              day: String(rec.day),
                              clockHour: String(rec.clockHour),
                              clockMinute: String(rec.clockMinute),
                              unknownTime: rec.unknownTime,
                              gender: rec.gender,
                              province: 'Việt Nam',
                              city: rec.city,
                              longitude: rec.longitude,
                              utcOffsetMinutes: rec.utcOffsetMinutes,
                              calendarType: 'solar',
                            };
                            setFormState(restored);
                            setCommittedForm(restored);
                            setSavedReadingsMap(rec.aiReadings || {});
                            setActiveTab('chart');
                          }}
                          className="text-xs font-bold text-[#F05A28] hover:underline cursor-pointer"
                        >
                          Mở Lá Số Này →
                        </button>

                        {token && (
                          <button
                            type="button"
                            onClick={async () => {
                              await ziweiApiService.deleteRecord(token, rec._id);
                              setCloudRecords((prev) => prev.filter((x) => x._id !== rec._id));
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Xóa lá số"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lịch sử trên trình duyệt (LocalStorage) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lịch sử tra cứu gần đây trên thiết bị ({localHistory.length})
              </h3>
              {localHistory.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  Chưa có lá số nào được lưu. Hãy lập lá số ở tab đầu tiên và nhấn &ldquo;Lưu Lá
                  Số&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {localHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          handleApplyBirthForm(item.form);
                          setActiveTab('chart');
                        }}
                        className="text-left flex-1 cursor-pointer"
                      >
                        <div className="text-xs font-bold text-slate-900">
                          {item.form.name || 'Lá số Tử Vi'} (
                          {item.form.gender === 'male' ? 'Nam' : 'Nữ'})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.form.day}/{item.form.month}/{item.form.year} • {item.form.city}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromLocalHistory(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                        aria-label="Xóa"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal Chi Tiết Sao */}
      <StarDetailModal
        star={inspectingStar?.star || null}
        palace={inspectingStar?.palace || null}
        onClose={() => setInspectingStar(null)}
        onAskAiAboutStar={handleTriggerAiPrompt}
      />

      {/* Modal Tải Ảnh & Chia Sẻ Lá Số */}
      {shareModalOpen && (
        <ShareChartModal
          chart={chart}
          shareUrl={shareUrl}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {/* Modal Thiết Lập 10 Nhóm Trường Phái An Sao & Đối Chiếu Trước/Sau */}
      {schoolModalOpen && (
        <SchoolConfigModal
          birthInfo={birthInfo}
          config={schoolConfig}
          onChange={handleUpdateSchoolConfig}
          onReset={handleResetSchoolConfig}
          onClose={() => setSchoolModalOpen(false)}
        />
      )}
    </div>
  );
}
