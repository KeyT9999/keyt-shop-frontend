import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Volume2,
  Copy,
  Check,
  Award,
  Sparkles,
  Info,
  Layers,
  Clock,
  Zap,
  Target,
  BookOpen,
  UserCheck,
  Search,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import type { SurvivalKit } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { defaultSurvivalKitData } from '../../data/speakingMasterSheetData';

interface SurvivalKitTabProps {
  courseCode?: string;
}

type SubSection =
  | 'reflex'
  | 'question_words'
  | 'grammar'
  | 'particles'
  | 'manners'
  | 'rubric';

export const SurvivalKitTab: React.FC<SurvivalKitTabProps> = ({ courseCode = 'jpd123' }) => {
  const [data, setData] = useState<SurvivalKit>(defaultSurvivalKitData);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SubSection>('reflex');

  // Reflex tab state
  const [reflexFilter, setReflexFilter] = useState<string>('all');
  const [reflexSearch, setReflexSearch] = useState<string>('');

  // Question words search
  const [qWordSearch, setQWordSearch] = useState<string>('');

  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await speakingApi.getSurvivalKit(courseCode);
        if (isMounted && res) {
          setData((prev) => ({
            ...prev,
            ...res,
            reflexList20: res.reflexList20?.length ? res.reflexList20 : prev.reflexList20,
            questionWordsSystem: res.questionWordsSystem?.length ? res.questionWordsSystem : prev.questionWordsSystem,
            grammarTables: res.grammarTables || prev.grammarTables,
            particlesCheatSheet: res.particlesCheatSheet?.length ? res.particlesCheatSheet : prev.particlesCheatSheet
          }));
        }
      } catch (err) {
        console.warn('Using bundled speaking master sheet fallback:', err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [courseCode]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  // Filter reflex list
  const reflexList = data?.reflexList20 && data.reflexList20.length > 0
    ? data.reflexList20
    : defaultSurvivalKitData.reflexList20 || [];

  const filteredReflex = reflexList.filter((item) => {
    const matchFilter = reflexFilter === 'all' || item.lesson.toLowerCase().includes(reflexFilter.toLowerCase());
    const matchSearch =
      !reflexSearch.trim() ||
      item.question.toLowerCase().includes(reflexSearch.toLowerCase()) ||
      item.reflex.toLowerCase().includes(reflexSearch.toLowerCase()) ||
      item.explanation.toLowerCase().includes(reflexSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Filter question words
  const qWordsList = data?.questionWordsSystem && data.questionWordsSystem.length > 0
    ? data.questionWordsSystem
    : defaultSurvivalKitData.questionWordsSystem || [];

  const filteredQWords = qWordsList.filter((item) => {
    if (!qWordSearch.trim()) return true;
    const query = qWordSearch.toLowerCase();
    return (
      item.word.toLowerCase().includes(query) ||
      item.meaning.toLowerCase().includes(query) ||
      item.responseGuide.toLowerCase().includes(query) ||
      item.exampleQ.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Banner: Master Sheet Info */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-[#F05A28]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F05A28]/20 border border-[#F05A28]/40 rounded-full text-xs font-semibold text-[#F05A28] mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F05A28]" />
              Master Sheet Khảo Thí FPT University
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Cẩm Nang Sinh Tồn &amp; Phản Xạ Nói JPD123
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Tổng hợp toàn diện 22 mục kiến thức: 20 mẫu phản xạ nghe-đáp, 15 từ để hỏi, quy tắc trừ điểm, bảng chia ngữ pháp L4–L7 và trọn bộ 10 trợ từ.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 shrink-0 backdrop-blur-sm">
            <div className="text-center px-2">
              <div className="text-2xl font-black text-[#F05A28]">100</div>
              <div className="text-[11px] text-slate-400 font-medium">Thang điểm</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center px-2">
              <div className="text-2xl font-black text-amber-400">20s</div>
              <div className="text-[11px] text-slate-400 font-medium">Chuẩn bị đọc</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="text-center px-2">
              <div className="text-2xl font-black text-emerald-400">10s</div>
              <div className="text-[11px] text-slate-400 font-medium">Suy nghĩ Q&amp;A</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveSection('reflex')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'reflex'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Zap className="w-4 h-4 text-[#F05A28]" />
          20 Mẫu Phản Xạ Nhanh
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('question_words')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'question_words'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Target className="w-4 h-4 text-[#F05A28]" />
          15 Từ Để Hỏi &amp; Bắt Đề
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('grammar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'grammar'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#F05A28]" />
          Bảng Chia Ngữ Pháp (L4–L7)
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('particles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'particles'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4 text-[#F05A28]" />
          10 Trợ Từ Sống Còn
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('manners')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'manners'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#F05A28]" />
          Tác Phong &amp; Câu Cứu Mạng (10đ)
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rubric')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
            activeSection === 'rubric'
              ? 'bg-white text-[#F05A28] shadow-sm ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Award className="w-4 h-4 text-[#F05A28]" />
          Barem Điểm &amp; Mẹo Reading (45đ)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 20 MẪU PHẢN XẠ NHANH */}
      {/* ========================================================================= */}
      {activeSection === 'reflex' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/40 p-5 rounded-2xl border border-orange-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-[#F05A28]/10 text-[#F05A28] rounded-xl shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base md:text-lg">
                  Bộ 20 Mẫu Phản Xạ &quot;Nghe Là Bật Ra Ngay&quot; (Mục 22 Master Sheet)
                </h3>
                <p className="text-slate-600 text-xs md:text-sm mt-0.5">
                  Không cần học thuộc hàng trăm câu riêng lẻ. Chỉ cần nghe từ để hỏi &rarr; nhận ra mẫu &rarr; thay dữ liệu &rarr; đáp 1 câu đúng trọng tâm!
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              {['all', 'Lesson 4', 'Lesson 5', 'Lesson 6', 'Lesson 7'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setReflexFilter(l === 'all' ? 'all' : l.toLowerCase())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    (l === 'all' && reflexFilter === 'all') || reflexFilter.includes(l.toLowerCase().replace('lesson ', ''))
                      ? 'bg-[#F05A28] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {l === 'all' ? 'Tất cả (20+)' : l}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={reflexSearch}
              onChange={(e) => setReflexSearch(e.target.value)}
              placeholder="Tìm nhanh câu hỏi, câu phản xạ hoặc ngữ pháp..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/30 focus:border-[#F05A28] transition-all"
            />
          </div>

          {/* Reflex Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReflex.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-[#F05A28] text-xs font-bold flex items-center justify-center">
                        {item.id}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                        {item.lesson}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speak(item.question)}
                        title="Nghe giáo viên hỏi"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.reflex, `reflex-${item.id}`)}
                        title="Sao chép câu phản xạ"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedIndex === `reflex-${item.id}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Giám thị hỏi:
                    </span>
                    <div className="text-base md:text-lg font-bold text-slate-900 font-japanese">
                      {item.question}
                    </div>
                  </div>

                  {/* Reflex Answer Box */}
                  <div className="bg-orange-50/70 p-3 rounded-xl border border-orange-200/80 mb-3">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[11px] font-bold text-[#F05A28] uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Bật ra ngay:
                      </span>
                      <button
                        type="button"
                        onClick={() => speak(item.reflex)}
                        title="Nghe câu phản xạ"
                        className="text-xs text-[#F05A28] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Volume2 className="w-3 h-3" />
                        Nghe mẫu
                      </button>
                    </div>
                    <div className="text-base md:text-lg font-bold text-slate-900 font-japanese">
                      {item.reflex}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{item.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: 15 TỪ ĐỂ HỎI & CHIẾN THUẬT 3 BƯỚC */}
      {/* ========================================================================= */}
      {activeSection === 'question_words' && (
        <div className="space-y-6">
          {/* 3-Step Strategy Card */}
          <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-sky-800 shadow-lg">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Target className="w-4 h-4" />
              Chiến thuật giải phóng tâm lý (Mục 20 Master Sheet)
            </div>
            <h3 className="text-xl font-bold mb-4">
              Công Thức 3 Bước Xử Lý Câu Hỏi Trong Đầu (Không Dịch Cả Câu)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(data?.threeStepMethod || []).map((step) => (
                <div
                  key={step.step}
                  className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm relative"
                >
                  <div className="w-7 h-7 rounded-full bg-[#F05A28] text-white font-black text-xs flex items-center justify-center mb-2.5 shadow-md">
                    {step.step}
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mb-1.5">{step.title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image Q&A Strategy Warning (Mục 19) */}
          <div className="bg-amber-50 border border-amber-300/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <span>{data?.imageStrategy?.title || 'Chiến thuật câu 1 có tranh (15đ) - Tránh bẫy sai số liệu'}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">Trừ 5đ nếu sai tranh</span>
                </h4>
                <p className="text-slate-700 text-xs md:text-sm mt-1">
                  {data?.imageStrategy?.rule}
                </p>
                <div className="mt-2 text-xs text-amber-900 bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  <strong className="text-amber-800">Demo Đề FPT: </strong>
                  {data?.imageStrategy?.demoFpt} &rarr; Trả lời: <strong className="font-japanese text-slate-900">{data?.imageStrategy?.demoAnswer}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 15 Question Words Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Hệ Thống 15 Từ Để Hỏi Trọng Tâm (Mục 3 Master Sheet)
              </h3>
              <p className="text-xs text-slate-500">
                Nghe được từ để hỏi = Đã xác định được 70–80% cấu trúc câu trả lời
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={qWordSearch}
                onChange={(e) => setQWordSearch(e.target.value)}
                placeholder="Tìm từ để hỏi..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F05A28]/30"
              />
            </div>
          </div>

          {/* Question Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQWords.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-black text-[#F05A28] font-japanese">
                        {item.word}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded">
                        {item.meaning}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => speak(item.exampleQ)}
                      title="Nghe câu hỏi ví dụ"
                      className="p-1.5 text-slate-400 hover:text-[#F05A28] hover:bg-orange-50 rounded-md transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Cách nghĩ câu trả lời:
                      </span>
                      <p className="font-bold text-slate-800 mt-0.5">{item.responseGuide}</p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div className="text-slate-600 font-japanese">
                        <strong className="text-slate-400 font-sans mr-1">Q:</strong>
                        {item.exampleQ}
                      </div>
                      <div className="text-slate-900 font-japanese font-semibold">
                        <strong className="text-[#F05A28] font-sans mr-1">A:</strong>
                        {item.exampleA}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: BẢNG CHIA NGỮ PHÁP (L4–L7) */}
      {/* ========================================================================= */}
      {activeSection === 'grammar' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200/80 flex items-start gap-4">
            <div className="p-3 bg-emerald-600/10 text-emerald-600 rounded-xl shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                Bảng Chia Động Từ, Tính Từ &amp; Mẫu Phụ L4–L7 (Mục 16, 17 Master Sheet)
              </h3>
              <p className="text-slate-600 text-xs md:text-sm mt-1">
                Lỗi sai thì quá khứ (ました / でした) hoặc chia sai tính từ (くない / かった) sẽ bị trừ 2–3 điểm hoặc trừ toàn bộ 10đ ngữ pháp. Hãy nằm lòng các bảng dưới đây!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table 1: Verbs */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <h4 className="font-bold text-slate-900 text-base">
                  1. Chia Thể Động Từ (Đặc biệt thì Quá khứ L5)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Ý nghĩa / Thể</th>
                      <th className="py-2.5 px-3">Mẫu ngữ pháp</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Ví dụ chuẩn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data?.grammarTables?.verbs.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{row.form}</td>
                        <td className="py-2.5 px-3 font-japanese font-bold text-[#F05A28]">
                          {row.pattern}
                        </td>
                        <td className="py-2.5 px-3 font-japanese text-slate-800">{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: I-Adjectives */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-slate-900 text-base">
                  2. Chia Tính Từ Đuôi い (L4 – L5)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Ý nghĩa / Thể</th>
                      <th className="py-2.5 px-3">Mẫu ngữ pháp</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Ví dụ (あつい)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data?.grammarTables?.iAdjectives.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{row.form}</td>
                        <td className="py-2.5 px-3 font-japanese font-bold text-[#F05A28]">
                          {row.pattern}
                        </td>
                        <td className="py-2.5 px-3 font-japanese text-slate-800">{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Na-Adjectives */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-slate-900 text-base">
                  3. Chia Tính Từ Đuôi な (L4 – L5)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Ý nghĩa / Thể</th>
                      <th className="py-2.5 px-3">Mẫu ngữ pháp</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Ví dụ (にぎやか)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data?.grammarTables?.naAdjectives.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{row.form}</td>
                        <td className="py-2.5 px-3 font-japanese font-bold text-[#F05A28]">
                          {row.pattern}
                        </td>
                        <td className="py-2.5 px-3 font-japanese text-slate-800">{row.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Sub-Grammar L7 & De vs Ni */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <h4 className="font-bold text-slate-900 text-base">
                    4. Cấu Trúc Phụ Lesson 7 Cần Biết
                  </h4>
                </div>
                <div className="space-y-2 text-xs">
                  {data?.grammarTables?.subGrammar.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-japanese font-bold text-purple-700 block">
                          {sub.pattern}
                        </span>
                        <span className="text-slate-600 text-[11px]">{sub.meaning}</span>
                      </div>
                      <div className="text-right font-japanese text-slate-800 text-[11px] shrink-0">
                        {sub.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event vs Existence */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-orange-50/60 p-3 rounded-xl border border-orange-200">
                <span className="text-xs font-bold text-orange-900 block mb-1">
                  Phân biệt cực dễ nhầm: で あります vs に あります (Mục 6.2)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-orange-100">
                    <strong className="text-blue-600 block">Địa điểm で あります:</strong>
                    Sự kiện diễn ra (コンサートが あります)
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-orange-100">
                    <strong className="text-emerald-600 block">Địa điểm に あります:</strong>
                    Vật thể tồn tại (スーパーが あります)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: 10 TRỢ TỪ SỐNG CÒN */}
      {/* ========================================================================= */}
      {activeSection === 'particles' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200/80 flex items-start gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                Trọn Bộ 10 Trợ Từ Quan Trọng Nhất (Mục 18 Master Sheet)
              </h3>
              <p className="text-slate-600 text-xs md:text-sm mt-1">
                Sai trợ từ trong thi nói bị trừ <strong>2–3 điểm/lỗi</strong>. Nắm chắc 10 trợ từ này cùng các cặp phân biệt: で (phương tiện/dụng cụ/nơi hành động) vs に (nơi tồn tại/thời gian), が (thích/muốn/nghi vấn) vs を (tân ngữ).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.particlesCheatSheet.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-slate-100">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#F05A28] font-japanese font-black text-2xl flex items-center justify-center shadow-inner">
                    {item.particle.split(' ')[0]}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Trợ từ 「 {item.particle} 」
                    </h4>
                    <span className="text-xs text-slate-400">
                      {item.meanings.length} vai trò trọng tâm cần nhớ
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {item.meanings.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F05A28]"></span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {m.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs md:text-sm font-japanese font-medium text-slate-900">
                          {m.example}
                        </p>
                        <button
                          type="button"
                          onClick={() => speak(m.example)}
                          title="Nghe câu mẫu"
                          className="p-1 text-slate-400 hover:text-[#F05A28] hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: TÁC PHONG & CÂU CỨU MẠNG */}
      {/* ========================================================================= */}
      {activeSection === 'manners' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/80 flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-[#F05A28] rounded-xl shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                10 Điểm Tác Phong &amp; Phản Xạ Dễ Lấy Nhất (Mục 2 Master Sheet)
              </h3>
              <p className="text-slate-600 text-xs md:text-sm mt-1">
                Giám thị người Nhật và Việt Nam rất chú trọng lễ nghi (礼儀 - Reigi). Chỉ cần chào đúng lúc, dùng câu cứu cánh tự tin khi nghe chưa rõ thay vì im lặng quá 10 giây, bạn chắc chắn giữ trọn 10 điểm tác phong!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.manners.map((manner, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#F05A28]" />
                      {manner.situation}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speak(manner.japanese)}
                        title="Nghe phát âm chuẩn"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(manner.japanese, `manner-${idx}`)}
                        title="Sao chép câu tiếng Nhật"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedIndex === `manner-${idx}` ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-lg md:text-xl font-bold text-slate-900 tracking-wide mb-1 font-japanese">
                    {manner.japanese}
                  </div>
                  <div className="text-xs text-slate-400 font-mono italic mb-2">
                    {manner.romaji}
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-3">
                    {manner.vietnamese}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-lg">
                  <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-amber-900">Mẹo FPT: </strong>
                    {manner.tip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: BAREM ĐIỂM & MẸO READING */}
      {/* ========================================================================= */}
      {activeSection === 'rubric' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 bg-[#F05A28] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Quy định Khảo Thí FPT University
                </span>
                <h3 className="text-2xl font-bold mt-2">Barem Chấm Điểm Thi Nói JPD123 (100đ)</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Đạt yêu cầu từ 50/100 trở lên • Thời gian thi 6–8 phút/thí sinh • Reading chuẩn bị 20 giây
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center min-w-[140px]">
                <div className="text-3xl font-black text-[#F05A28]">50+</div>
                <div className="text-xs text-slate-400 uppercase font-semibold mt-0.5">Điểm Qua Môn</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 1: Đọc Đoạn Văn</span>
                  <span className="text-lg font-bold text-amber-400">45đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>5-7 chữ Kanji: 15đ</li>
                  <li>2-4 từ Katakana: 10đ</li>
                  <li>115-125 chữ Hiragana: 20đ (sai -0.2đ/chữ)</li>
                  <li>20 giây chuẩn bị, đọc lưu loát trong 50s</li>
                </ul>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 2: Vấn Đáp Q&amp;A</span>
                  <span className="text-lg font-bold text-sky-400">45đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>3 câu hỏi x 15đ/câu (1 câu tranh + 2 câu không tranh)</li>
                  <li>Sai ngữ pháp: -10đ/câu</li>
                  <li>Sai từ vựng: -5 đến -7đ/câu</li>
                  <li>Sai dữ liệu trong tranh: -5đ/câu</li>
                  <li>Sai trợ từ / đuôi câu: -2 đến -3đ/lỗi</li>
                </ul>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 3: Tác Phong</span>
                  <span className="text-lg font-bold text-emerald-400">10đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Chào hỏi khi vào &amp; ra khỏi phòng (2đ)</li>
                  <li>Dùng câu cứu cánh khi cần nghe lại</li>
                  <li>Không ngập ngừng quá 10 giây/câu</li>
                  <li>Phát âm, độ lưu loát toàn bài (8đ)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reading Tips Card (Mục 21 Master Sheet) */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-emerald-800 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4" />
              Chiến thuật lấy trọn 45đ Reading (Mục 21 Master Sheet)
            </div>
            <h4 className="text-lg font-bold mb-3">
              {data?.readingTips?.title || 'Kỹ thuật đọc đoạn văn an toàn'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <strong className="text-emerald-300 block font-semibold">
                  Nguyên tắc vàng: Đọc theo cụm nghĩa (スラッシュ・リーディング)
                </strong>
                <p className="text-slate-300">
                  Tuyệt đối không đọc rời từng chữ hiragana. Hãy ngắt hơi theo từng cụm từ hoàn chỉnh:
                </p>
                <div className="bg-black/30 p-2.5 rounded font-japanese text-slate-200">
                  <span className="text-red-400 block line-through">わ・た・し・は / こ・と・し・の… (Sai - vấp trừ điểm)</span>
                  <span className="text-emerald-400 block font-bold mt-1">わたしは / 今年の8月に / ベトナムへ行きました。 (Đúng)</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
                <strong className="text-amber-300 block font-semibold">
                  Khi gặp Kanji khó: Không đứng im quá 3 giây
                </strong>
                <p className="text-slate-300">
                  {data?.readingTips?.stallAdvice || 'Nếu gặp chữ Kanji không nhớ cách đọc, không đứng im quá lâu. Hãy đọc lướt qua hoặc đọc âm gần đúng rồi tiếp tục đoạn văn. Đứng im sẽ bị trừ điểm ngập ngừng toàn bài.'}
                </p>
                <div className="text-slate-400 pt-1">
                  Đoạn văn có 140–150 chữ: Kanji chiếm 15đ, Katakana 10đ, Hiragana 20đ.
                </div>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Tổng Hợp Các Lỗi Trừ Điểm Nặng Nhất Cần Tránh
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-red-800 block">Lỗi im lặng quá 10 giây</span>
                <p className="text-slate-700">
                  Khi không hiểu câu hỏi, nếu im lặng quá 10 giây giám thị sẽ chuyển câu khác và bạn bị trừ trọn 15đ của câu đó.
                </p>
                <div className="text-red-600 font-semibold pt-1">
                  Khắc phục: Nói ngay &quot;すみません、もう一度お願いします。&quot; để được đọc lại tối đa 3 lần!
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-800 block">Lỗi sai dữ liệu trong tranh (Câu 1)</span>
                <p className="text-slate-700">
                  Đúng ngữ pháp nhưng nói sai số giờ, phương tiện hoặc địa điểm trong tranh bị trừ ngay 5 điểm.
                </p>
                <div className="text-amber-700 font-semibold pt-1">
                  Khắc phục: Nhìn kỹ số liệu (ví dụ: ２時間半, ひこうきで) trước khi cất lời.
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-blue-800 block">Lỗi quên chia đuôi ました (Quá khứ)</span>
                <p className="text-slate-700">
                  Giáo viên hỏi quá khứ (きのう、何をしましたか) nhưng trả lời thì hiện tại (ます) hoặc dùng thể thân mật.
                </p>
                <div className="text-blue-700 font-semibold pt-1">
                  Khắc phục: Bắt được きのう/せんしゅう &rarr; kết thúc câu luôn là ～ました.
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-800 block">Chiến thuật trả lời 1 câu đơn giản đúng mẫu</span>
                <p className="text-slate-700">
                  Không cần cố nói phức tạp. Nói 1 câu đơn giản nhưng đúng mẫu, đúng trợ từ, đúng thông tin tốt hơn rất nhiều so với cố nói dài mà sai trợ từ.
                </p>
                <div className="text-emerald-700 font-semibold pt-1">
                  Nguyên tắc: Bắt từ để hỏi &rarr; lắp dữ liệu &rarr; 1 câu lịch sự chuẩn mực.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
