import { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
  AlertCircle,
  Timer,
  Sparkles,
  RefreshCw,
  AudioWaveform,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  ListOrdered,
  FileText,
  Keyboard,
  Type
} from 'lucide-react';

import type {
  SpeakingReadingPassage,
  PronunciationEvaluationResult,
  PronunciationWordEvaluation
} from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { JPD123_28_READING_LESSONS } from '../../data/speakingReadingPassagesData';

export interface ReadingPracticeTabProps {
  passages?: SpeakingReadingPassage[];
  courseCode?: string;
}

export function ReadingPracticeTab({
  passages: initialPassages,
  courseCode = 'jpd123'
}: ReadingPracticeTabProps) {
  // Default to bundled 28 lessons for JPD123 to guarantee 0ms instant load
  const isJpd123 = courseCode.toLowerCase() === 'jpd123';
  const defaultPassages = initialPassages && initialPassages.length > 0
    ? initialPassages
    : (isJpd123 ? JPD123_28_READING_LESSONS : []);

  const [passages, setPassages] = useState<SpeakingReadingPassage[]>(defaultPassages);
  const [loading, setLoading] = useState<boolean>(!defaultPassages || defaultPassages.length === 0);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(
    defaultPassages[0]?.id || 'lesson-1'
  );

  // View modes: 'sentences' (Luyện từng câu) vs 'full' (Đoạn văn hoàn chỉnh)
  const [viewMode, setViewMode] = useState<'sentences' | 'full'>('sentences');

  // Display toggles
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showRomaji, setShowRomaji] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | '1-7' | '8-14' | '15-21' | '22-28'>('all');

  // Sentence Audio Playback
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);

  // Preparation Countdown Timer (20s)
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(20);
  const [isPrepping, setIsPrepping] = useState(false);

  // Audio evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<PronunciationWordEvaluation | null>(null);

  const { isPlaying, speak, stop: stopAudio } = useSpeechSynthesis();
  const {
    isRecording,
    duration,
    volumeLevel,
    audioUrl,
    error: recorderError,
    startRecording,
    stopRecording,
    resetAudio
  } = useAudioRecorder();

  // Fetch from backend API while having bundled fallback
  useEffect(() => {
    let isMounted = true;
    const fetchPassages = async () => {
      try {
        const data = await speakingApi.getReadingPassages(courseCode);
        if (isMounted && data && data.length > 0) {
          setPassages(data);
          if (!data.some((p) => p.id === selectedPassageId)) {
            setSelectedPassageId(data[0].id);
          }
        }
      } catch (err) {
        console.warn('API getReadingPassages failed, using bundled 28 lessons:', err);
        if (isMounted && isJpd123) {
          setPassages(JPD123_28_READING_LESSONS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPassages();
    return () => {
      isMounted = false;
    };
  }, [courseCode]);

  // Current passage
  const currentIndex = passages.findIndex((p) => p.id === selectedPassageId);
  const currentPassage = passages[currentIndex >= 0 ? currentIndex : 0] || passages[0] || JPD123_28_READING_LESSONS[0];

  // Stop sentence audio if general speech stopped
  useEffect(() => {
    if (!isPlaying) {
      setActiveSentenceIndex(null);
    }
  }, [isPlaying]);

  // Preparation timer tick
  useEffect(() => {
    let timer: any;
    if (isPrepping && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepTimeLeft === 0 && isPrepping) {
      setIsPrepping(false);
      handleStartRecording();
    }
    return () => clearInterval(timer);
  }, [isPrepping, prepTimeLeft]);

  // Keyboard navigation (ArrowLeft: Previous, ArrowRight: Next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          handlePassageSelect(passages[currentIndex - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < passages.length - 1) {
          handlePassageSelect(passages[currentIndex + 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, passages]);

  const handleStartPrep = () => {
    setPrepTimeLeft(20);
    setIsPrepping(true);
    stopAudio();
    resetAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
  };

  const handlePassageSelect = (id: string) => {
    setSelectedPassageId(id);
    setIsPrepping(false);
    setPrepTimeLeft(20);
    stopAudio();
    resetAudio();
    setActiveSentenceIndex(null);
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handlePassageSelect(passages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < passages.length - 1) {
      handlePassageSelect(passages[currentIndex + 1].id);
    }
  };

  const handlePlaySentence = (idx: number, text: string) => {
    if (isPlaying && activeSentenceIndex === idx) {
      stopAudio();
      setActiveSentenceIndex(null);
    } else {
      stopAudio();
      setActiveSentenceIndex(idx);
      speak(text, readingSpeed);
    }
  };

  const handleStartRecording = async () => {
    stopAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
    await startRecording();
  };

  const handleStopAndEvaluate = async () => {
    try {
      const blob = await stopRecording();
      if (!blob || !currentPassage) return;

      setIsEvaluating(true);
      setEvalError(null);

      const result = await speakingApi.evaluatePronunciation(
        courseCode,
        blob,
        currentPassage.contentJapanese,
        currentPassage.id
      );

      setEvaluationResult(result);
      if (result.words && result.words.length > 0) {
        const flawedWord = result.words.find((w) => w.status !== 'correct');
        setSelectedWordDetail(flawedWord || result.words[0]);
      }
    } catch (err: any) {
      console.error('Pronunciation evaluation failed:', err);
      setEvalError(
        err.response?.data?.message ||
        err.message ||
        'Không thể chấm điểm bài đọc. Vui lòng đảm bảo dịch vụ AI Speech đang chạy.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    resetAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
    setIsPrepping(false);
    setPrepTimeLeft(20);
  };

  // Filter passages by search term and group
  const filteredPassages = useMemo(() => {
    return passages.filter((p) => {
      const numMatch = p.code.match(/\d+/);
      const num = numMatch ? parseInt(numMatch[0], 10) : 0;

      if (groupFilter === '1-7' && (num < 1 || num > 7)) return false;
      if (groupFilter === '8-14' && (num < 8 || num > 14)) return false;
      if (groupFilter === '15-21' && (num < 15 || num > 21)) return false;
      if (groupFilter === '22-28' && (num < 22 || num > 28)) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchTopic = p.topic.toLowerCase().includes(q);
        const matchContent = p.contentVietnamese.toLowerCase().includes(q);
        return matchTitle || matchCode || matchTopic || matchContent;
      }

      return true;
    });
  }, [passages, groupFilter, searchTerm]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && (!passages || passages.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách 28 bài đọc JPD123...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 28 Lessons Top Filter & Selector Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-50 text-[#F05A28] flex items-center justify-center font-bold">
              <BookOpen size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Danh Sách 28 Bài Đọc Luyện Nói JPD123</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-[#F05A28] font-bold">
                  {passages.length} Bài
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Toàn diện 28 đề đọc hiểu & luyện phản xạ theo giáo trình Minna no Nihongo & Chuẩn khảo thí FPT
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bài theo tên, chủ đề..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#F05A28] bg-slate-50/50"
            />
          </div>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin text-xs">
          <button
            type="button"
            onClick={() => setGroupFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              groupFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả (28)
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('1-7')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              groupFilter === '1-7'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lesson 1–7 (Khởi động)
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('8-14')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              groupFilter === '8-14'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lesson 8–14 (Sinh hoạt & Địa danh)
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('15-21')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              groupFilter === '15-21'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lesson 15–21 (Ước muốn & Học tập)
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('22-28')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              groupFilter === '22-28'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lesson 22–28 (Du lịch & Đời sống)
          </button>
        </div>

        {/* Horizontal Lesson Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin pt-1">
          {filteredPassages.map((p) => {
            const isSelected = p.id === selectedPassageId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePassageSelect(p.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={isSelected ? 'text-[#F05A28]' : 'text-[#F05A28] font-bold'}>
                  {p.code}:
                </span>
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{p.title}</span>
                {p.sentenceCount && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {p.sentenceCount} câu
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {currentPassage && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Row of Passage */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-[#F05A28] border border-orange-200/60">
                  桜花 {currentPassage.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                  Chủ đề: <strong className="text-sky-900">{currentPassage.topic}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentPassage.sentences?.length || currentPassage.sentenceCount || 8} câu đọc
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentPassage.wordCount} chữ
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-emerald-600">
                  Rubric: 45đ FE
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                {currentPassage.title}
              </h2>

              {currentPassage.description && (
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                  {currentPassage.description}
                </p>
              )}
            </div>

            {/* Quick Navigation & Prep timer */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                  title="Bài trước (←)"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Dropdown fast switch */}
                <select
                  value={currentPassage.id}
                  onChange={(e) => handlePassageSelect(e.target.value)}
                  aria-label="Chọn bài đọc JPD123"
                  className="text-xs font-bold bg-transparent text-slate-800 border-none focus:outline-none cursor-pointer py-1 px-1.5"
                >
                  {passages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}: {p.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={currentIndex >= passages.length - 1}
                  onClick={handleNext}
                  className="p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-xs disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
                  title="Bài sau (→)"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* 20s Preparation button */}
              {isPrepping ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 animate-pulse">
                  <Timer size={16} className="text-amber-600" />
                  <span className="text-xs font-bold">
                    Chuẩn bị đọc: <strong className="text-sm font-black">{prepTimeLeft}s</strong>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartPrep}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs"
                >
                  <Timer size={14} />
                  <span>20s Chuẩn Bị (FE)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action & Toggle Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('sentences')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'sentences'
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered size={14} />
                <span>Luyện Từng Câu ({currentPassage.sentences?.length || currentPassage.sentenceCount || 8})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'full'
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={14} />
                <span>Đoạn Văn Hoàn Chỉnh (Thi 1-1)</span>
              </button>
            </div>

            {/* Audio Playback & Speed */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (isPlaying && activeSentenceIndex === null) stopAudio();
                  else {
                    setActiveSentenceIndex(null);
                    speak(currentPassage.contentJapanese, readingSpeed);
                  }
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isPlaying && activeSentenceIndex === null
                    ? 'bg-[#F05A28] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-xs'
                }`}
              >
                <Volume2 size={14} />
                <span>{isPlaying && activeSentenceIndex === null ? 'Dừng đọc' : 'Nghe toàn bài'}</span>
              </button>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold shadow-xs">
                <button
                  type="button"
                  onClick={() => setReadingSpeed(0.8)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    readingSpeed === 0.8 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  0.8x Chậm
                </button>
                <button
                  type="button"
                  onClick={() => setReadingSpeed(1.0)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    readingSpeed === 1.0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1.0x Chuẩn
                </button>
              </div>

              {/* Toggles: Nghĩa, Cách đọc Kanji, Romaji */}
              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border shadow-xs ${
                  showTranslation
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Bật/Tắt bản dịch tiếng Việt"
              >
                <Languages size={13} />
                <span>Nghĩa</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFurigana(!showFurigana)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border shadow-xs ${
                  showFurigana
                    ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Bật/Tắt phiên âm Hiragana trên chữ Hán"
              >
                {showFurigana ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>Cách đọc Kanji</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRomaji(!showRomaji)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border shadow-xs ${
                  showRomaji
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Bật/Tắt phiên âm Romaji"
              >
                <Type size={13} />
                <span>Romaji</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {viewMode === 'sentences' ? (
            /* MODE 1: Luyện từng câu (Sentence-by-sentence) */
            <div className="space-y-4">
              {currentPassage.sentences && currentPassage.sentences.length > 0 ? (
                currentPassage.sentences.map((sentence) => {
                  const isSentenceActive = isPlaying && activeSentenceIndex === sentence.index;
                  return (
                    <div
                      key={sentence.index}
                      className={`p-5 rounded-2xl border transition-all duration-200 ${
                        isSentenceActive
                          ? 'bg-orange-50/50 border-[#F05A28] shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                          Câu {sentence.index}
                        </span>

                        <button
                          type="button"
                          onClick={() => handlePlaySentence(sentence.index, sentence.japanese)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSentenceActive
                              ? 'bg-[#F05A28] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-[#F05A28]'
                          }`}
                        >
                          <Volume2 size={13} />
                          <span>{isSentenceActive ? 'Đang phát...' : 'Nghe câu'}</span>
                        </button>
                      </div>

                      {/* Japanese Text */}
                      <p className="text-lg sm:text-xl font-japanese font-medium text-slate-900 leading-relaxed tracking-wide">
                        {showFurigana ? sentence.furigana : sentence.japanese}
                      </p>

                      {/* Romaji Text */}
                      {showRomaji && sentence.romaji && (
                        <p className="mt-1.5 text-xs sm:text-sm font-mono text-slate-500 italic">
                          {sentence.romaji}
                        </p>
                      )}

                      {/* Vietnamese Translation */}
                      {showTranslation && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 font-sans flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F05A28] mt-1.5 shrink-0"></span>
                          <span>{sentence.vietnamese}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                  <p>Không có dữ liệu câu chi tiết cho bài đọc này.</p>
                </div>
              )}
            </div>
          ) : (
            /* MODE 2: Đoạn văn hoàn chỉnh (Full Passage) */
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/20 border-2 border-slate-200/80 leading-loose">
              {evaluationResult && evaluationResult.words ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#F05A28]" />
                      <span>Phân tích từng từ trong câu (Click vào từ để xem gợi ý phát âm)</span>
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Chuẩn xác
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Gượng/Ngập ngừng
                      </span>
                      <span className="flex items-center gap-1 text-rose-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Đọc sai/Bỏ sót
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-3 pt-2">
                    {evaluationResult.words.map((w, index) => {
                      const isSelected = selectedWordDetail?.word === w.word && selectedWordDetail?.reading === w.reading;
                      const isCorrect = w.status === 'correct';
                      const isWarning = w.status === 'warning';

                      return (
                        <button
                          key={`${w.word}-${index}`}
                          type="button"
                          onClick={() => setSelectedWordDetail(w)}
                          className={`group relative inline-flex flex-col items-center px-3 py-1.5 rounded-2xl font-japanese transition-all cursor-pointer border ${
                            isSelected
                              ? 'ring-2 ring-[#F05A28] shadow-md scale-105'
                              : 'hover:scale-102'
                          } ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              : isWarning
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {showFurigana && (
                            <span className="text-[11px] font-sans text-slate-500 leading-none mb-0.5">
                              {w.reading}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-bold tracking-wide">
                            {w.word}
                          </span>
                          <span
                            className={`text-[10px] font-sans font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                              isCorrect
                                ? 'bg-emerald-200 text-emerald-800'
                                : isWarning
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-rose-200 text-rose-800'
                            }`}
                          >
                            {w.score}đ
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl font-japanese text-slate-900 font-medium tracking-wide">
                  {showFurigana ? currentPassage.contentFurigana : currentPassage.contentJapanese}
                </p>
              )}

              {showTranslation && (
                <div className="mt-6 pt-5 border-t border-slate-200/80 text-sm sm:text-base text-slate-600 leading-relaxed font-sans bg-white/70 p-4 rounded-2xl">
                  <span className="font-bold text-slate-800 block mb-1 text-xs uppercase tracking-wider">
                    Bản Dịch Tiếng Việt:
                  </span>
                  {currentPassage.contentVietnamese}
                </div>
              )}
            </div>
          )}

          {/* Word Popover Hint when a word is clicked */}
          {selectedWordDetail && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-md animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-japanese text-amber-400">
                    {selectedWordDetail.word}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-japanese">
                    【{selectedWordDetail.reading}】
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    /{selectedWordDetail.romaji}/
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedWordDetail.status === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedWordDetail.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    Điểm âm vị: {selectedWordDetail.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedWordDetail.feedback}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => speak(selectedWordDetail.word, 0.9)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                >
                  <Volume2 size={14} className="text-[#F05A28]" />
                  <span>Nghe từ này</span>
                </button>
              </div>
            </div>
          )}

          {/* Mic Recording Panel with Live Sound Waveform */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={16} className="text-[#F05A28]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Ghi Âm & Chấm Điểm Phát Âm AI (faster-whisper + VAD)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isRecording
                    ? 'Đang lắng nghe... Hãy đọc to, tròn vành rõ chữ theo nhịp ngắt chuẩn.'
                    : isEvaluating
                    ? 'AI đang phân tích âm vị học tiếng Nhật, tốc độ đọc và ngắt nghỉ...'
                    : 'Bấm nút để bắt đầu thu âm giọng đọc của bạn và nhận phân tích 4 tiêu chí FE.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={handleStartRecording}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F05A28] text-white text-xs font-bold hover:bg-orange-600 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Mic size={16} />
                    <span>Bắt đầu đọc</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopAndEvaluate}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-md animate-pulse"
                  >
                    <MicOff size={16} />
                    <span>Dừng & Chấm Điểm ({formatTime(duration)})</span>
                  </button>
                )}

                {(audioUrl || evaluationResult) && !isRecording && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Đọc lại bài này"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Live Audio Visualizer Waveform when recording */}
            {isRecording && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    REC: {formatTime(duration)}
                  </span>
                </div>

                {/* Animated Sound Bars */}
                <div className="flex items-center gap-1.5 h-8">
                  {[...Array(16)].map((_, i) => {
                    const dynamicHeight = Math.max(
                      15,
                      Math.min(100, volumeLevel * (0.6 + ((i * 17) % 50) / 100))
                    );
                    return (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-[#F05A28] to-amber-400 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}%` }}
                      ></div>
                    );
                  })}
                </div>

                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Âm lượng: {volumeLevel}%
                </span>
              </div>
            )}

            {/* Loading Analysis state */}
            {isEvaluating && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-4">
                <div className="w-6 h-6 border-3 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">
                    Đang xử lý âm thanh qua FFmpeg và chấm điểm bằng mô hình AI...
                  </span>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#F05A28] animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Recorder Error display */}
            {(recorderError || evalError) && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{recorderError || evalError}</span>
              </div>
            )}

            {/* Audio Playback of User Recording */}
            {audioUrl && !isRecording && (
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AudioWaveform size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Bản thu âm của bạn ({formatTime(duration || 0)}):
                  </span>
                </div>
                <audio src={audioUrl} controls className="h-8 max-w-full sm:max-w-xs" />
              </div>
            )}
          </div>

          {/* AI Pronunciation Scorecard Result */}
          {evaluationResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border-2 border-orange-200/80 space-y-6 animate-fadeIn">
              {/* Top Score Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-5">
                  <div className="relative flex flex-col items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border-2 border-orange-500/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      Điểm FE
                    </span>
                    <span className="text-3xl font-black text-white">
                      {evaluationResult.feScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      / 45 điểm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${
                          evaluationResult.grade === 'S'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : evaluationResult.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : evaluationResult.grade === 'B'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        Hạng {evaluationResult.grade} • {evaluationResult.score}/100đ
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {evaluationResult.feScore >= 25 ? 'Đạt Chuẩn Qua Môn' : 'Cần Cải Thiện'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Kết Quả Chấm Điểm Luyện Đọc Tiếng Nhật
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {evaluationResult.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F05A28] text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Luyện lại bài này</span>
                  </button>
                </div>
              </div>

              {/* 4 Rubric Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Accuracy */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1. Độ Chính Xác (40%)</span>
                    <span className="text-sm font-black text-emerald-600">
                      {evaluationResult.metrics.accuracy}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Khớp mặt chữ & âm đọc Hiragana
                  </span>
                </div>

                {/* 2. Pronunciation */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">2. Phát Âm (35%)</span>
                    <span className="text-sm font-black text-orange-600">
                      {evaluationResult.metrics.pronunciation}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.pronunciation}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Độ chuẩn xác âm vị (Acoustic confidence)
                  </span>
                </div>

                {/* 3. Fluency */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">3. Độ Trôi Chảy (15%)</span>
                    <span className="text-sm font-black text-sky-600">
                      {evaluationResult.metrics.fluency}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.fluency}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Tốc độ: {evaluationResult.details.moraRate} mora/s • Ngập ngừng: {evaluationResult.details.hesitationCount}
                  </span>
                </div>

                {/* 4. Rhythm */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">4. Nhịp Điệu (10%)</span>
                    <span className="text-sm font-black text-indigo-600">
                      {evaluationResult.metrics.rhythm}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.rhythm}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Hoàn thành câu & ngắt câu tự nhiên
                  </span>
                </div>
              </div>

              {/* Spoken Transcript row */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Văn bản nhận diện từ giọng đọc của bạn (faster-whisper):
                </span>
                <p className="font-japanese text-base text-slate-800">
                  {evaluationResult.transcript || '(Không nhận diện được giọng đọc, hãy thử lại)'}
                </p>
              </div>
            </div>
          )}

          {/* Key Kanji & Katakana checklist (FPT FE Rubric) */}
          {((currentPassage.targetKanji && currentPassage.targetKanji.length > 0) ||
            (currentPassage.targetKatakana && currentPassage.targetKatakana.length > 0)) && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#F05A28]" />
                <span>Chữ Hán & Từ Katakana Trọng Tâm Được Chấm Điểm (Rubric FPT)</span>
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {currentPassage.targetKanji.map((k, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs"
                  >
                    <span className="font-bold font-japanese text-slate-900 text-sm">
                      {k.character}
                    </span>
                    {k.reading && (
                      <span className="text-[11px] font-japanese text-[#F05A28]">
                        【{k.reading}】
                      </span>
                    )}
                    {k.hanViet && (
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {k.hanViet}
                      </span>
                    )}
                  </div>
                ))}

                {currentPassage.targetKatakana.map((kat, i) => (
                  <div
                    key={`kat-${i}`}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center gap-1 text-xs"
                  >
                    <span className="font-bold font-japanese text-sky-900 text-sm">
                      {kat}
                    </span>
                    <span className="text-[10px] font-bold text-sky-600">Katakana</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Lesson Navigation Bar */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={handlePrev}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-white shadow-xs"
            >
              <ChevronLeft size={16} />
              <span>
                {currentIndex > 0 ? `Bài trước: ${passages[currentIndex - 1]?.code}` : 'Đã ở bài đầu tiên'}
              </span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Keyboard size={14} className="text-slate-400" />
              <span>Dùng phím <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">←</kbd> / <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">→</kbd> để chuyển bài</span>
            </div>

            <button
              type="button"
              disabled={currentIndex >= passages.length - 1}
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-white shadow-xs"
            >
              <span>
                {currentIndex < passages.length - 1 ? `Bài sau: ${passages[currentIndex + 1]?.code}` : 'Đã ở bài cuối cùng'}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingPracticeTab;
