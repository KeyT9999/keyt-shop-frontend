import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import '../features/ziwei/ziwei.css';
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
  RotateCcw,
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
} from '../features/ziwei/utils/ziweiLocalization';
import { FAMOUS_CHART_PRESETS_VI } from '../features/ziwei/data/famousCharts';
import {
  ziweiApiService,
  type SavedZiweiRecord,
} from '../features/ziwei/services/ziweiApiService';
import BirthFormCard from '../features/ziwei/components/BirthFormCard';
import ZiweiChat, { type ZiweiChatRequest } from '../features/ziwei/components/ZiweiChat';
import ChartBoard, { type ZiweiTimeView } from '../features/ziwei/components/ChartBoard';
import StarDetailModal from '../features/ziwei/components/StarDetailModal';
import ShareChartModal from '../features/ziwei/components/ShareChartModal';
import SchoolConfigModal from '../features/ziwei/components/SchoolConfigModal';

const AiInsightPanel = lazy(() => import('../features/ziwei/components/AiInsightPanel'));
const HemingPanel = lazy(() => import('../features/ziwei/components/HemingPanel'));
const ClassicsLibraryPanel = lazy(() => import('../features/ziwei/components/ClassicsLibraryPanel'));

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
  const [hasOpenedReading, setHasOpenedReading] = useState(false);
  const [formState, setFormState] = useState<BirthFormState>(() => {
    const parsed = searchParamsToForm(searchParams);
    return parsed ? { ...DEFAULT_FORM, ...parsed } : DEFAULT_FORM;
  });
  const [committedForm, setCommittedForm] = useState<BirthFormState>(formState);
  // Bước 1: Nếu người dùng mới vào /tu-vi chưa có query params thì yêu cầu điền Thông Tin Lập Lá Số Tử Vi trước
  const [hasSubmittedChart, setHasSubmittedChart] = useState<boolean>(() =>
    Boolean(searchParamsToForm(searchParams))
  );
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
  const [chatRequest, setChatRequest] = useState<ZiweiChatRequest | null>(null);
  const chatRequestId = useRef(0);

  const aiSectionRef = useRef<HTMLDetailsElement>(null);

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
    setChatRequest(null);
    setSelectedPalace(null);
    setSavedReadingsMap({});
    setHasSubmittedChart(true);
    setShowBirthForm(false);
    saveToLocalHistory(nextForm);
    syncUrlParams(nextForm, schoolConfig);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToInputStep = () => {
    setHasSubmittedChart(false);
    setChatRequest(null);
    setHasOpenedReading(false);
    setShowBirthForm(false);
    setSearchParams(new URLSearchParams(), { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSchoolConfig = (nextConfig: SchoolConfig) => {
    setSchoolConfig(nextConfig);
    setChatRequest(null);
    saveSchoolConfig(nextConfig);
    if (hasSubmittedChart) {
      syncUrlParams(committedForm, nextConfig);
    }
  };

  const handleResetSchoolConfig = () => {
    resetSchoolConfig();
    setSchoolConfig({ ...SCHOOL_DEFAULT_CONFIG });
    setChatRequest(null);
    if (hasSubmittedChart) {
      syncUrlParams(committedForm, SCHOOL_DEFAULT_CONFIG);
    }
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
    setHasOpenedReading(true);
    setTimeout(() => {
      const section = aiSectionRef.current;
      if (!section) return;
      section.open = true;
      section.scrollIntoView({ block: 'start' });
    }, 100);
  };

  const handleSelectSiHua = (starNameCn: string, siHuaCn: string, view: ZiweiTimeView) => {
    const starVi = translateStarName(starNameCn);
    const shVi = translateSiHua(siHuaCn);
    const viewLabel =
      view === 'daxian' ? 'Đại Hạn' : view === 'liunian' ? 'Lưu Niên' : 'Bản Mệnh';
    const prompt = `Hãy phân tích chuyên sâu hiện tượng 【${viewLabel}: Sao ${starVi} Hóa ${shVi}】 trên lá số của tôi theo học phái Thiên Kỷ của Nghê Hải Hạ (bao gồm ý nghĩa cốt lõi, tác động lên cung tọa thủ, đường chiếu Tam Phương Tứ Chính và lời khuyên ứng xử).`;
    handleTriggerAiPrompt(prompt);
  };

  const handleTriggerAiPrompt = (prompt: string, context?: string) => {
    setChatRequest({ id: ++chatRequestId.current, prompt, context });
  };

  return (
    <div className="ziwei-page">
      <section className="ziwei-masthead">
        <div className="ziwei-masthead-inner">
          <div className="ziwei-title">
            <span className="ziwei-seal" aria-hidden="true">紫微</span>
            <h1>Tử Vi Mệnh Thư</h1>
          </div>
          <nav className="ziwei-nav" aria-label="Tử Vi Mệnh Thư">
            {([
              ['chart', Compass, 'Lá số'],
              ['heming', HeartHandshake, 'Hợp mệnh'],
              ['classics', BookOpen, 'Tàng thư'],
              ['history', History, 'Đã lưu'],
            ] as const).map(([tab, Icon, label]) => (
              <button key={tab} type="button" aria-current={activeTab === tab ? 'page' : undefined}
                onClick={() => setActiveTab(tab)}>
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      <div className="ziwei-content">
        {saveFeedback && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xs">
            <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {/* TAB 1: BÀN LÁ SỐ 12 CUNG & ĐẠI SƯ AI LUẬN GIẢI */}
        {activeTab === 'chart' && (
          <>
            {!hasSubmittedChart ? (
              /* ─── BƯỚC 1: GIAO DIỆN YÊU CẦU ĐIỀN THÔNG TIN LẬP LÁ SỐ TỬ VI KHI MỚI VÀO TRANG ─── */
              <div className="max-w-5xl mx-auto py-4 space-y-6">
                <BirthFormCard
                  form={formState}
                  onChange={setFormState}
                  onSubmit={handleApplyBirthForm}
                  title="Lập lá số"
                  submitLabel="Lập lá số"
                />

                {/* Chọn nhanh Lá số Danh nhân mẫu hoặc Lá số đã lưu gần đây */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      <Award size={15} className="text-[#F05A28]" />
                      <span>Lá số mẫu</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSchoolModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Cài đặt an sao</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {FAMOUS_CHART_PRESETS_VI.map((preset) => (
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
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 hover:border-[#F05A28] hover:bg-orange-50/70 transition-all cursor-pointer"
                        title={preset.highlightVi}
                      >
                        {preset.nameVi} ({preset.highlightVi})
                      </button>
                    ))}
                  </div>

                  {localHistory.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Lá Số Bạn Đã Lập Gần Đây:
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {localHistory.slice(0, 6).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleApplyBirthForm(item.form)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200 hover:border-purple-400 cursor-pointer"
                          >
                            {item.form.name || 'Lá số Tử Vi'} ({item.form.day}/{item.form.month}/
                            {item.form.year})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ─── BƯỚC 2: HIỂN THỊ TẤT CẢ MỌI THỨ VỀ ĐƯƠNG SỐ + 13 CHIỀU + CHAT AI ─── */
              <div className="space-y-3 sm:space-y-4">
                {/* Thanh Hồ Sơ Đương Số & Điều Khiển Nhanh */}
                <div className="ziwei-profile">
                  <div className="ziwei-profile-info">
                    <h2>{birthInfo.name || 'Lá số Tử Vi'}</h2>
                    <p>
                      {committedForm.day}/{committedForm.month}/{committedForm.year}
                      {' · '}
                      {committedForm.unknownTime
                        ? 'Giờ Tý'
                        : `${committedForm.clockHour}:${committedForm.clockMinute.padStart(2, '0')}`}
                      {' · '}{committedForm.city}
                    </p>
                  </div>
                  <div className="ziwei-profile-actions">
                    <button
                      type="button"
                      onClick={scrollToAiSection}
                      className="ziwei-outline ziwei-primary"
                    >
                      <Sparkles size={14} className="text-[#F05A28]" />
                      <span>Luận giải</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowBirthForm((v) => !v)}
                      className="ziwei-outline"
                    >
                      <SlidersHorizontal size={14} />
                      <span>
                        {showBirthForm
                          ? 'Đóng'
                          : 'Sửa lá số'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToInputStep}
                      className="ziwei-outline"
                      title="Quay về màn hình nhập mới"
                    >
                      <RotateCcw size={13} />
                      <span>Lập mới</span>
                    </button>
                  </div>
                </div>

                {showBirthForm && (
                  <BirthFormCard
                    form={formState}
                    onChange={setFormState}
                    onSubmit={handleApplyBirthForm}
                  />
                )}

                {/* 1. BÀN LÁ SỐ 12 CUNG 4x4 TOÀN CHIỀU RỘNG & VẬN HẠN ĐA TẦNG */}
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

                {/* 2. Luận giải lá số */}
                <details ref={aiSectionRef} className="ziwei-disclosure scroll-mt-20"
                  onToggle={(event) => { if (event.currentTarget.open) setHasOpenedReading(true); }}>
                  <summary><Sparkles size={17} aria-hidden="true" /> Luận giải lá số</summary>
                  {hasOpenedReading && (
                    <Suspense fallback={<p role="status">Đang tải luận giải…</p>}>
                      <AiInsightPanel
                        chart={chart}
                        unknownTime={committedForm.unknownTime}
                        chartSummaryText={chartSummaryText}
                        selectedPalace={selectedPalace}
                        onAskQuestion={handleTriggerAiPrompt}
                        savedReadings={savedReadingsMap}
                        onReadingGenerated={(topicKey, content) =>
                          setSavedReadingsMap((prev) => ({ ...prev, [topicKey]: content }))
                        }
                        autoAnalyzeOverview={false}
                      />
                    </Suspense>
                  )}
                </details>

              </div>
            )}
          </>
        )}

        {/* TAB 2: XEM HỢP HÔN & HỢP TÁC ĐÔI (HEMING) */}
        {activeTab === 'heming' && (
          <Suspense fallback={<p role="status">Đang tải hợp mệnh…</p>}>
            <HemingPanel initialFormA={committedForm} />
          </Suspense>
        )}

        {/* TAB 3: KHO CỔ TỊCH THIÊN KỶ (1.848 KHẨU QUYẾT CÓ MỐC VIDEO) & TAM ĐẠI CỔ TỊCH */}
        {activeTab === 'classics' && (
          <Suspense fallback={<p role="status">Đang tải tàng thư…</p>}>
            <ClassicsLibraryPanel onAskAiQuote={handleTriggerAiPrompt} />
          </Suspense>
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
                            setChatRequest(null);
                            setSavedReadingsMap(rec.aiReadings || {});
                            setHasSubmittedChart(true);
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
      </div>

      <ZiweiChat
        key={hasSubmittedChart ? shareUrl : 'birth-form'}
        chartSummary={hasSubmittedChart ? chartSummaryText : null}
        request={chatRequest}
        onOpenBirthForm={() => {
          setActiveTab('chart');
          window.scrollTo({ top: 0 });
        }}
      />

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
