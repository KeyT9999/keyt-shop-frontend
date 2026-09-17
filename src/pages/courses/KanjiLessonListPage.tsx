import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, BookOpen, Zap, ChevronRight } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';

// Vocab counts từ vocabularyItems trong lessons.json
const VOCAB_COUNT: Record<string, number> = {
  'LESSON-1': 20,
  'LESSON-2': 50,
  'LESSON-3': 28,
  'LESSON-4': 15,
  'LESSON-5': 31,
  'LESSON-6': 31,
  'LESSON-7': 33,
};

// Màu gradient theo lesson
const LESSON_COLORS: Record<string, { bg: string; badge: string; dot: string }> = {
  'LESSON-1': {
    bg: 'from-blue-500 to-cyan-400',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  'LESSON-2': {
    bg: 'from-amber-500 to-orange-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'LESSON-3': {
    bg: 'from-teal-500 to-emerald-400',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
  'LESSON-4': {
    bg: 'from-rose-500 to-orange-400',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  'LESSON-5': {
    bg: 'from-violet-500 to-indigo-400',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  'LESSON-6': {
    bg: 'from-emerald-500 to-teal-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  'LESSON-7': {
    bg: 'from-amber-500 to-yellow-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
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

export default function KanjiLessonListPage() {
  const { courseCode = 'jpd123' } = useParams();
  const { token } = useAuthContext();
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getSectionLessons(courseCode, 'kanji', token);
        if (!isCancelled) setLessons(data || []);
      } catch (err) {
        if (!isCancelled) console.error('Failed to load kanji lessons:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchLessons();
    return () => { isCancelled = true; };
  }, [courseCode, token]);

  const upperCode = courseCode.toUpperCase();
  const totalKanji = lessons.reduce((s, l) => s + (l.itemCount || 0), 0);
  const totalVocab = lessons.reduce((s, l) => s + (VOCAB_COUNT[l.lessonCode] || 0), 0);

  return (
    <>
      <Seo
        title={`Hán Tự ${upperCode} - Danh Sách 4 Bài Học | Mindora AI`}
        description={`Học Hán Tự (Kanji) khóa học ${upperCode} với 4 bài học trọng tâm, số nét, âm On/Kun và từ vựng phái sinh.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/kanji`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Hán Tự (漢字)' }
          ]}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Layers size={15} />
              <span>Chương Trình Hán Tự Tiếng Nhật</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Danh Sách Bài Học Hán Tự {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Học chữ Hán căn bản qua {lessons.length} bài học trọng tâm giúp nhận diện và đọc chữ Hán mượt mà.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 text-xs font-bold self-start sm:self-auto whitespace-nowrap">
            {loading ? '...' : `${lessons.length} Bài học • ${totalKanji} Kanji • ${totalVocab} Từ vựng`}
          </div>
        </div>

        {/* Lesson Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons.map((l) => {
              const colors = LESSON_COLORS[l.lessonCode] || LESSON_COLORS['LESSON-4'];
              const lessonNum = LESSON_NUMBERS[l.lessonCode] || 4;
              const vocabCount = VOCAB_COUNT[l.lessonCode] || 0;
              const baseUrl = `/courses/${courseCode.toLowerCase()}/kanji/${l.slug}`;

              return (
                <div
                  key={l._id}
                  className="rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
                >
                  {/* Top color bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${colors.bg}`} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Badge row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.badge}`}>
                        Lesson {lessonNum}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          {l.itemCount} Kanji
                        </span>
                        <span>•</span>
                        <span>{vocabCount} Vocab</span>
                      </div>
                    </div>

                    {/* Title + Description */}
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{l.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                      {l.description}
                    </p>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                      <Link
                        to={`${baseUrl}?mode=study`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <BookOpen size={14} />
                        Study Mode
                      </Link>
                      <Link
                        to={`${baseUrl}?mode=flashcard`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Zap size={14} />
                        Flashcard
                      </Link>
                      <Link
                        to={baseUrl}
                        className={`p-2.5 rounded-xl bg-gradient-to-r ${colors.bg} text-white hover:opacity-90 transition-opacity cursor-pointer`}
                        title="Xem chi tiết"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
