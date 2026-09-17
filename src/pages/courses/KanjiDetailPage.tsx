import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Zap,
  Volume2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  RotateCw,
  CheckCircle2,
  Search,
  ArrowLeft,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson, KanjiItem } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';

// Map âm Hán Việt chuẩn cho các chữ Hán JPD113 (Bài 1-3) và JPD123 (Bài 4-7)
const KANJI_HANVIET_MAP: Record<string, string> = {
  // JPD113 - Lesson 1: Giới thiệu bản thân và Trường học
  '私': 'TƯ', '日': 'NHẬT', '本': 'BẢN', '大': 'ĐẠI', '学': 'HỌC',
  '語': 'NGỮ', '校': 'HIỆU', '生': 'SINH', '人': 'NHÂN', '才': 'TÀI',
  // JPD113 - Lesson 2: Số đếm và Đơn vị tiền tệ
  '一': 'NHẤT', '二': 'NHỊ', '三': 'TAM', '四': 'TỨ', '五': 'NGŨ',
  '六': 'LỤC', '七': 'THẤT', '八': 'BÁT', '九': 'CỬU', '十': 'THẬP',
  '百': 'BÁCH', '千': 'THIÊN', '万': 'VẠN', '円': 'VIÊN',
  // JPD113 - Lesson 3: Thời gian và Ngày trong tuần
  '月': 'NGUYỆT', '火': 'HỎA', '水': 'THỦY', '木': 'MỘC', '金': 'KIM',
  '土': 'THỔ', '何': 'HÀ', '年': 'NIÊN', '時': 'THỜI', '間': 'GIAN',
  '分': 'PHÂN',
  // JPD123 - Lesson 4: Địa điểm và Phương hướng
  '東': 'ĐÔNG', '京': 'KINH', '名': 'DANH', '前': 'TIỀN', '国': 'QUỐC',
  '南': 'NAM', '女': 'NỮ', '男': 'NAM', '区': 'KHU', '市': 'THỊ',
  // JPD123 - Lesson 5: Hành động và Nghỉ ngơi
  '先': 'TIÊN', '週': 'CHU', '毎': 'MỖI', '午': 'NGỌ', '後': 'HẬU',
  '見': 'KIẾN', '食': 'THỰC', '飲': 'ẨM', '買': 'MÃI', '物': 'VẬT',
  '行': 'HÀNH', '休': 'HƯU',
  // JPD123 - Lesson 6: Giao tiếp và Sinh hoạt
  '今': 'KIM', '来': 'LAI', '帰': 'QUY', '会': 'HỘI', '社': 'XÃ',
  '聞': 'VĂN', '読': 'ĐỘC', '書': 'THƯ', '話': 'THOẠI',
  // JPD123 - Lesson 7: Tự nhiên và Cơ bản
  '寺': 'TỰ', '言': 'NGÔN', '貝': 'BỐI', '田': 'ĐIỀN', '力': 'LỰC',
  '門': 'MÔN', '肉': 'NHỤC', '料': 'LIỆU', '理': 'LÝ', '野': 'DÃ',
  '半': 'BÁN'
};

const LESSON_NUMBERS: Record<string, number> = {
  'LESSON-1': 1,
  'LESSON-2': 2,
  'LESSON-3': 3,
  'LESSON-4': 4,
  'LESSON-5': 5,
  'LESSON-6': 6,
  'LESSON-7': 7,
};

const VOCAB_COUNTS: Record<string, number> = {
  'LESSON-1': 20,
  'LESSON-2': 50,
  'LESSON-3': 28,
  'LESSON-4': 15,
  'LESSON-5': 31,
  'LESSON-6': 31,
  'LESSON-7': 33,
};

type ViewMode = 'overview' | 'study' | 'flashcard' | 'vocab';

export default function KanjiDetailPage() {
  const { courseCode = 'jpd123', lessonSlug = '', mode: routeMode } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuthContext();

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [items, setItems] = useState<KanjiItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active mode: overview | study | flashcard | vocab
  const queryMode = (searchParams.get('mode') as ViewMode) || (routeMode as ViewMode) || 'overview';
  const activeMode: ViewMode = ['overview', 'study', 'flashcard', 'vocab'].includes(queryMode)
    ? queryMode
    : 'overview';

  // Study Mode State
  const initialIndex = parseInt(searchParams.get('index') || '0', 10);
  const [studyIndex, setStudyIndex] = useState(Number.isNaN(initialIndex) ? 0 : initialIndex);

  // Flashcard State
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Vocab search filter
  const [vocabSearch, setVocabSearch] = useState('');

  // Fetch lesson and items
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getLessonItems(courseCode, 'kanji', lessonSlug, token);
        if (!isCancelled && data) {
          setLesson(data.lesson);
          const mappedItems: KanjiItem[] = (data.items || []).map((item: KanjiItem) => ({
            ...item,
            hanViet: item.hanViet || KANJI_HANVIET_MAP[item.character] || ''
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        if (!isCancelled) console.error('Failed to load kanji lesson items:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { isCancelled = true; };
  }, [courseCode, lessonSlug, token]);

  // Sync index from URL query param if present
  useEffect(() => {
    const idx = parseInt(searchParams.get('index') || '', 10);
    if (!Number.isNaN(idx) && idx >= 0 && items.length > 0) {
      setStudyIndex(Math.min(idx, items.length - 1));
    }
  }, [searchParams, items.length]);

  // Speech synthesis
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  };

  const handleModeChange = (newMode: ViewMode, extraIndex?: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', newMode);
    if (typeof extraIndex === 'number') {
      newParams.set('index', extraIndex.toString());
      setStudyIndex(extraIndex);
    } else if (newMode !== 'study') {
      newParams.delete('index');
    }
    setSearchParams(newParams);
    setIsFlipped(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Keyboard navigation for study and flashcard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (activeMode === 'study') {
        if (e.key === 'ArrowRight' && studyIndex < items.length - 1) {
          handleModeChange('study', studyIndex + 1);
        } else if (e.key === 'ArrowLeft' && studyIndex > 0) {
          handleModeChange('study', studyIndex - 1);
        }
      } else if (activeMode === 'flashcard') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setIsFlipped((f) => !f);
        } else if (e.key === 'ArrowRight' && fcIndex < items.length - 1) {
          setFcIndex((i) => i + 1);
          setIsFlipped(false);
        } else if (e.key === 'ArrowLeft' && fcIndex > 0) {
          setFcIndex((i) => i - 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, studyIndex, fcIndex, items.length]);

  // Aggregate all example vocabulary words from items
  const allVocabWords = useMemo(() => {
    const list: Array<{
      term: string;
      reading: string;
      meaning: string;
      parentKanji: string;
      parentHanViet: string;
    }> = [];

    items.forEach((item) => {
      if (item.exampleWords) {
        item.exampleWords.forEach((word) => {
          list.push({
            ...word,
            parentKanji: item.character,
            parentHanViet: item.hanViet || KANJI_HANVIET_MAP[item.character] || ''
          });
        });
      }
    });

    return list;
  }, [items]);

  const filteredVocab = useMemo(() => {
    if (!vocabSearch.trim()) return allVocabWords;
    const q = vocabSearch.toLowerCase().trim();
    return allVocabWords.filter(
      (v) =>
        v.term.toLowerCase().includes(q) ||
        v.reading.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        v.parentHanViet.toLowerCase().includes(q)
    );
  }, [allVocabWords, vocabSearch]);

  const currentStudyKanji = items[studyIndex] || items[0];
  const currentFcKanji = items[fcIndex] || items[0];
  const upperCode = courseCode.toUpperCase();
  const lessonNumber = lesson?.lessonCode ? LESSON_NUMBERS[lesson.lessonCode] || 4 : 4;
  const targetVocabCount = lesson?.lessonCode ? VOCAB_COUNTS[lesson.lessonCode] || allVocabWords.length : allVocabWords.length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 rounded-md mb-6" />
        <div className="h-10 w-96 bg-slate-200 rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <Layers size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài học Hán Tự</h2>
        <p className="text-slate-500 mb-6">Bài học bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link
          to={`/courses/${courseCode.toLowerCase()}/kanji`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách Hán Tự
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${lesson.title} - Hán Tự ${upperCode} L${lessonNumber} | Mindora AI`}
        description={`Học Hán Tự bài ${lessonNumber}: ${lesson.title} với ${items.length} chữ Hán trọng tâm, âm On/Kun, nghĩa và ${targetVocabCount} từ vựng phái sinh.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/kanji/${lessonSlug}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Hán Tự (漢字)', href: `/courses/${courseCode.toLowerCase()}/kanji` },
            { label: `Bài ${lessonNumber}: ${lesson.title}` }
          ]}
        />

        {/* Lesson Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
                  {courseCode.toUpperCase()} • L{lessonNumber}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Kanji Core ({items.length})
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                  {targetVocabCount} Vocab
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                {lesson.title}
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                {lesson.description || `Học ${items.length} chữ Hán căn bản và các từ ghép thông dụng trong bài học ${lesson.title}.`}
              </p>
            </div>

            {/* Mode Switching Buttons */}
            <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl self-start lg:self-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={() => handleModeChange('overview')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'overview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers size={15} />
                <span>Thẻ Hán Tự</span>
              </button>

              <button
                onClick={() => handleModeChange('study', 0)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'study'
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={15} />
                <span>Study Mode</span>
              </button>

              <button
                onClick={() => handleModeChange('flashcard')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'flashcard'
                    ? 'bg-[#F05A28] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap size={15} />
                <span>Flashcard</span>
              </button>

              <button
                onClick={() => handleModeChange('vocab')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'vocab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap size={15} />
                <span>Từ Vựng ({allVocabWords.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODE 1: OVERVIEW (KANJI CARD GRID)
        ======================================================== */}
        {activeMode === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Danh Sách Chữ Hán ({items.length} chữ)
                </span>
                <span className="text-xs text-slate-400">
                  • Click vào chữ để mở chi tiết Study Mode
                </span>
              </div>
              <div className="text-xs font-medium text-slate-500">
                Đã đánh dấu ghi nhớ: <strong className="text-amber-600">{bookmarkedIds.size}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {items.map((item, idx) => {
                const hanViet = item.hanViet || KANJI_HANVIET_MAP[item.character] || '';
                const meaningStr = Array.isArray(item.meaning) ? item.meaning.join(', ') : item.meaning;
                const kunStr = Array.isArray(item.kunyomi) ? item.kunyomi.join('、') : item.kunyomi;
                const onStr = Array.isArray(item.onyomi) ? item.onyomi.join('、') : item.onyomi;
                const isBookmarked = bookmarkedIds.has(item._id);

                return (
                  <div
                    key={item._id || idx}
                    className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-rose-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between"
                  >
                    {/* Top row: Order badge + Bookmark button */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(item._id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                        }`}
                        title={isBookmarked ? 'Bỏ ghi nhớ' : 'Ghi nhớ chữ này'}
                      >
                        {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                    </div>

                    {/* Main Character Display */}
                    <div
                      onClick={() => handleModeChange('study', idx)}
                      className="cursor-pointer text-center my-2"
                    >
                      <div className="text-5xl sm:text-6xl font-black text-slate-900 group-hover:text-[#F05A28] transition-colors font-japanese leading-none mb-2 select-none">
                        {item.character}
                      </div>
                      <div className="text-sm font-extrabold uppercase tracking-wider text-rose-600 mb-0.5">
                        {hanViet}
                      </div>
                      <div className="text-xs font-semibold text-slate-700 line-clamp-1">
                        {meaningStr}
                      </div>
                    </div>

                    {/* Readings (Kunyomi & Onyomi) */}
                    <div className="pt-3 border-t border-slate-100 mt-2 space-y-1 text-[11px]">
                      {kunStr ? (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-[10px] uppercase font-bold text-amber-600">Kun:</span>
                          <span className="font-japanese font-medium text-slate-800 truncate ml-1">
                            {kunStr}
                          </span>
                        </div>
                      ) : null}
                      {onStr ? (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-[10px] uppercase font-bold text-sky-600">On:</span>
                          <span className="font-japanese font-medium text-slate-800 truncate ml-1">
                            {onStr}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action footer */}
                    <div className="mt-3 pt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleModeChange('study', idx)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <BookOpen size={12} />
                        <span>Học chữ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => speak(item.character)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 2: STUDY MODE (CHẾ ĐỘ HỌC CHI TIẾT TỪNG CHỮ)
        ======================================================== */}
        {activeMode === 'study' && currentStudyKanji && (
          <div className="space-y-6">
            {/* Navigation bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex-wrap gap-4">
              <button
                type="button"
                onClick={() => handleModeChange('overview')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Danh sách ({items.length})</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Chữ</span>
                <span className="text-sm font-black text-rose-600">
                  {studyIndex + 1}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ {items.length}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={studyIndex === 0}
                  onClick={() => handleModeChange('study', studyIndex - 1)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                <button
                  type="button"
                  disabled={studyIndex === items.length - 1}
                  onClick={() => handleModeChange('study', studyIndex + 1)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Tiếp theo</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Main Study Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Huge Character, Han Viet, Stroke count */}
              <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-b from-rose-50/50 via-white to-amber-50/30 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-slate-200/80">
                <div className="relative mb-6">
                  {/* Huge Character */}
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white border-2 border-rose-200 shadow-md flex items-center justify-center relative group">
                    <span className="text-8xl sm:text-9xl font-black text-slate-900 font-japanese select-none">
                      {currentStudyKanji.character}
                    </span>

                    {/* Pronunciation button overlay */}
                    <button
                      type="button"
                      onClick={() => speak(currentStudyKanji.character)}
                      className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-slate-900/90 text-white hover:bg-[#F05A28] transition-colors cursor-pointer shadow-md"
                      title="Nghe phát âm chữ Hán"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Hán Việt & Nghĩa */}
                <div className="text-3xl sm:text-4xl font-black uppercase text-[#F05A28] tracking-wide mb-1">
                  {currentStudyKanji.hanViet || KANJI_HANVIET_MAP[currentStudyKanji.character] || ''}
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-800 mb-4">
                  {Array.isArray(currentStudyKanji.meaning)
                    ? currentStudyKanji.meaning.join(', ')
                    : currentStudyKanji.meaning}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    JLPT {currentStudyKanji.jlptLevel || 'N5'}
                  </span>
                  {currentStudyKanji.strokeCount ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                      {currentStudyKanji.strokeCount} Nét
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleBookmark(currentStudyKanji._id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      bookmarkedIds.has(currentStudyKanji._id)
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bookmarkedIds.has(currentStudyKanji._id) ? (
                      <>
                        <BookmarkCheck size={13} />
                        <span>Đã ghi nhớ</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={13} />
                        <span>Ghi nhớ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Readings, Mnemonic, Examples */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                {/* Readings Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-rose-500" />
                    <span>Âm Đọc (Onyomi & Kunyomi)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Kunyomi */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                      <div className="text-[11px] font-bold uppercase text-amber-700 mb-1">
                        Kunyomi (Âm thuần Nhật)
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900 font-japanese">
                          {Array.isArray(currentStudyKanji.kunyomi) && currentStudyKanji.kunyomi.length > 0
                            ? currentStudyKanji.kunyomi.join('、')
                            : '—'}
                        </span>
                        {currentStudyKanji.kunyomi?.[0] && (
                          <button
                            type="button"
                            onClick={() => speak(currentStudyKanji.kunyomi[0])}
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 cursor-pointer transition-colors"
                            title="Nghe Kunyomi"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Onyomi */}
                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/60">
                      <div className="text-[11px] font-bold uppercase text-sky-700 mb-1">
                        Onyomi (Âm Hán Nhật)
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-900 font-japanese">
                          {Array.isArray(currentStudyKanji.onyomi) && currentStudyKanji.onyomi.length > 0
                            ? currentStudyKanji.onyomi.join('、')
                            : '—'}
                        </span>
                        {currentStudyKanji.onyomi?.[0] && (
                          <button
                            type="button"
                            onClick={() => speak(currentStudyKanji.onyomi[0])}
                            className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-100 cursor-pointer transition-colors"
                            title="Nghe Onyomi"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mnemonic / Story */}
                {currentStudyKanji.mnemonic && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1.5">
                      <Lightbulb size={16} className="text-amber-600" />
                      <span>Câu Chuyện & Mẹo Ghi Nhớ</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {currentStudyKanji.mnemonic}
                    </p>
                  </div>
                )}

                {/* Example Words */}
                {currentStudyKanji.exampleWords && currentStudyKanji.exampleWords.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-rose-500" />
                      <span>Từ Vựng Ghép Thường Gặp ({currentStudyKanji.exampleWords.length})</span>
                    </h3>

                    <div className="space-y-2.5">
                      {currentStudyKanji.exampleWords.map((word, wIdx) => (
                        <div
                          key={wIdx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => speak(word.term || word.reading)}
                              className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-[#F05A28] border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                              title="Nghe phát âm từ ghép"
                            >
                              <Volume2 size={15} />
                            </button>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-base font-bold text-slate-900 font-japanese">
                                  {word.term}
                                </span>
                                <span className="text-xs text-rose-600 font-medium font-japanese">
                                  【{word.reading}】
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {word.meaning}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Kanji Thumbnail Strip for Fast Switching */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 overflow-x-auto">
              <div className="text-xs font-bold text-slate-500 mb-3">
                Chuyển nhanh giữa các chữ trong bài:
              </div>
              <div className="flex items-center gap-2">
                {items.map((it, i) => (
                  <button
                    key={it._id || i}
                    type="button"
                    onClick={() => handleModeChange('study', i)}
                    className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border transition-all cursor-pointer ${
                      i === studyIndex
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-rose-300'
                    }`}
                  >
                    <span className="text-lg font-black font-japanese leading-none">
                      {it.character}
                    </span>
                    <span className={`text-[10px] font-bold uppercase mt-0.5 ${i === studyIndex ? 'text-rose-100' : 'text-slate-400'}`}>
                      {it.hanViet || KANJI_HANVIET_MAP[it.character] || ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 3: FLASHCARD MODE (LẬT THẺ 3D)
        ======================================================== */}
        {activeMode === 'flashcard' && currentFcKanji && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('overview')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Danh sách</span>
              </button>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-slate-500">
                  Thẻ <span className="text-slate-900 font-extrabold">{fcIndex + 1}</span> / {items.length}
                </span>
                <span>•</span>
                <span className="text-emerald-600">Đã thuộc: {masteredIds.size}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFcIndex(0);
                  setIsFlipped(false);
                  setMasteredIds(new Set());
                }}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Đặt lại tiến trình thẻ"
              >
                <RotateCw size={13} />
                <span>Học lại</span>
              </button>
            </div>

            {/* Flashcard 3D container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[380px] sm:min-h-[420px] rounded-3xl cursor-pointer select-none transition-all duration-300 transform perspective-1000"
            >
              <div
                className={`w-full min-h-[380px] sm:min-h-[420px] rounded-3xl p-8 sm:p-12 bg-white border-2 ${
                  isFlipped ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200 hover:border-rose-400 shadow-lg'
                } flex flex-col items-center justify-center text-center transition-all duration-300 relative`}
              >
                {/* Hint badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                  <RotateCw size={12} />
                  <span>Click hoặc phím Space để lật</span>
                </div>

                {!isFlipped ? (
                  /* FRONT OF FLASHCARD */
                  <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                      Chữ Hán #{fcIndex + 1}
                    </span>
                    <div className="text-8xl sm:text-9xl font-black text-slate-900 font-japanese leading-none my-2">
                      {currentFcKanji.character}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black uppercase text-[#F05A28] tracking-widest">
                      {currentFcKanji.hanViet || KANJI_HANVIET_MAP[currentFcKanji.character] || ''}
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      {currentFcKanji.strokeCount ? `${currentFcKanji.strokeCount} Nét • ` : ''}Chạm để xem âm đọc & nghĩa
                    </div>
                  </div>
                ) : (
                  /* BACK OF FLASHCARD */
                  <div className="flex flex-col items-center justify-center space-y-4 max-w-lg animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-slate-900 font-japanese">
                        {currentFcKanji.character}
                      </span>
                      <span className="text-2xl font-black uppercase text-[#F05A28]">
                        {currentFcKanji.hanViet || KANJI_HANVIET_MAP[currentFcKanji.character] || ''}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(currentFcKanji.character);
                        }}
                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#F05A28] hover:text-white transition-colors cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div className="text-xl font-bold text-slate-900">
                      {Array.isArray(currentFcKanji.meaning)
                        ? currentFcKanji.meaning.join(', ')
                        : currentFcKanji.meaning}
                    </div>

                    {/* Readings */}
                    <div className="flex items-center gap-3 flex-wrap justify-center text-xs">
                      {currentFcKanji.kunyomi?.length ? (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold font-japanese">
                          <span className="font-bold text-amber-600 mr-1">Kun:</span>
                          {currentFcKanji.kunyomi.join('、')}
                        </div>
                      ) : null}
                      {currentFcKanji.onyomi?.length ? (
                        <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-semibold font-japanese">
                          <span className="font-bold text-sky-600 mr-1">On:</span>
                          {currentFcKanji.onyomi.join('、')}
                        </div>
                      ) : null}
                    </div>

                    {/* Mnemonic */}
                    {currentFcKanji.mnemonic && (
                      <p className="text-xs sm:text-sm text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                        💡 {currentFcKanji.mnemonic}
                      </p>
                    )}

                    {/* Example Word */}
                    {currentFcKanji.exampleWords?.[0] && (
                      <div className="text-xs text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                        Từ tiêu biểu: <strong className="font-japanese text-rose-600">{currentFcKanji.exampleWords[0].term}</strong> ({currentFcKanji.exampleWords[0].reading}) — {currentFcKanji.exampleWords[0].meaning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={fcIndex === 0}
                onClick={() => {
                  setFcIndex((i) => Math.max(0, i - 1));
                  setIsFlipped(false);
                }}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ChevronLeft size={16} />
                <span>Thẻ trước</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleMastered(currentFcKanji._id);
                    if (fcIndex < items.length - 1) {
                      setFcIndex((i) => i + 1);
                      setIsFlipped(false);
                    }
                  }}
                  className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    masteredIds.has(currentFcKanji._id)
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{masteredIds.has(currentFcKanji._id) ? 'Đã thuộc' : 'Đánh dấu thuộc'}</span>
                </button>
              </div>

              <button
                type="button"
                disabled={fcIndex === items.length - 1}
                onClick={() => {
                  setFcIndex((i) => Math.min(items.length - 1, i + 1));
                  setIsFlipped(false);
                }}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Thẻ sau</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE 4: VOCABULARY TAB (BỘ TỪ GHÉP LIÊN QUAN)
        ======================================================== */}
        {activeMode === 'vocab' && (
          <div className="space-y-6">
            {/* Filter / Search header */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Từ Vựng Cấu Thành Từ Các Chữ Hán ({allVocabWords.length} từ)
                </h3>
                <p className="text-xs text-slate-500">
                  Tổng hợp các từ ghép từ {items.length} chữ Kanji của bài học này
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={vocabSearch}
                  onChange={(e) => setVocabSearch(e.target.value)}
                  placeholder="Tìm từ vựng, cách đọc..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Vocab Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">Từ Ghép (Kanji)</th>
                      <th className="py-3.5 px-4">Cách Đọc</th>
                      <th className="py-3.5 px-4">Ý Nghĩa</th>
                      <th className="py-3.5 px-4">Chữ Hán Gốc</th>
                      <th className="py-3.5 px-4 text-center w-20">Phát Âm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredVocab.map((w, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-base font-bold text-slate-900 font-japanese">
                            {w.term}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-japanese text-rose-600 font-bold">
                            {w.reading}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {w.meaning}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold font-japanese">
                            {w.parentKanji}
                            <span className="text-[10px] text-rose-600 uppercase font-sans">
                              ({w.parentHanViet})
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => speak(w.term || w.reading)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#F05A28] hover:text-white transition-colors cursor-pointer"
                            title="Nghe phát âm"
                          >
                            <Volume2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
