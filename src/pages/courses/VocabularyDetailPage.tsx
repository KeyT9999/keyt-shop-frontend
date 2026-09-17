import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson, VocabularyItem, LearningMode } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import CourseProgressBar from '../../features/courses/components/common/CourseProgressBar';
import LearningModeSelector from '../../features/courses/components/vocabulary/LearningModeSelector';
import VocabularyTable from '../../features/courses/components/vocabulary/VocabularyTable';
import FlashcardMode from '../../features/courses/components/vocabulary/modes/FlashcardMode';
import TypingMode from '../../features/courses/components/vocabulary/modes/TypingMode';
import MultiChoiceMode from '../../features/courses/components/vocabulary/modes/MultiChoiceMode';
import SpeedMatchMode from '../../features/courses/components/vocabulary/modes/SpeedMatchMode';
import SmartQuizMode from '../../features/courses/components/vocabulary/modes/SmartQuizMode';
import TimeAttackMode from '../../features/courses/components/vocabulary/modes/TimeAttackMode';
import MistakeBusterMode from '../../features/courses/components/vocabulary/modes/MistakeBusterMode';
import { weakWordsStorage } from '../../features/courses/utils/weakWordsStorage';
import Seo from '../../components/Seo';

export default function VocabularyDetailPage() {
  const { courseCode = 'jpd123', lessonSlug = '' } = useParams();
  const { token, user } = useAuthContext();

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [activeMode, setActiveMode] = useState<LearningMode>('flashcard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchLessonItems = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getLessonItems(courseCode, 'vocabulary', lessonSlug, token);
        if (!isCancelled && data) {
          setLesson(data.lesson);
          setItems(data.items || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load lesson items:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLessonItems();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, lessonSlug, token]);

  const handleRecordResult = async (id: string, isCorrect: boolean) => {
    // Optimistic UI state update
    setItems((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const oldScore = item.userProgress?.masteryScore || 0;
          const newScore = isCorrect
            ? Math.min(100, oldScore + 15)
            : Math.max(0, oldScore - 15);

          let newStatus: 'new' | 'learning' | 'familiar' | 'mastered' = 'new';
          if (newScore >= 85) newStatus = 'mastered';
          else if (newScore >= 60) newStatus = 'familiar';
          else if (newScore >= 30) newStatus = 'learning';

          return {
            ...item,
            userProgress: {
              status: newStatus,
              masteryScore: newScore,
              streak: isCorrect ? (item.userProgress?.streak || 0) + 1 : 0,
              isBookmarked: item.userProgress?.isBookmarked || false
            }
          };
        }
        return item;
      })
    );

    // Sync to backend if authenticated
    if (token) {
      try {
        await courseApi.recordVocabularyResult(id, activeMode, isCorrect, token);
      } catch (err) {
        console.error('Failed to record learning result:', err);
      }
    }
  };

  const handleToggleBookmark = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const current = !!item.userProgress?.isBookmarked;
          return {
            ...item,
            userProgress: {
              status: item.userProgress?.status || 'new',
              masteryScore: item.userProgress?.masteryScore || 0,
              streak: item.userProgress?.streak || 0,
              isBookmarked: !current
            }
          };
        }
        return item;
      })
    );

    if (token) {
      try {
        await courseApi.toggleBookmark(id, token);
      } catch (err) {
        console.error('Failed to toggle bookmark:', err);
      }
    }
  };

  const upperCode = courseCode.toUpperCase();
  const masteredCount = items.filter((i) => i.userProgress?.status === 'mastered').length;
  const percent = items.length > 0 ? Math.round((masteredCount / items.length) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Đang nạp bài học và thẻ từ vựng...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy bài học</h2>
          <p className="text-slate-500 text-sm mb-6">Bài học này có thể chưa được xuất bản.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`Bài ${lesson.lessonCode}: ${lesson.title} - Từ Vựng ${upperCode} | Mindora AI`}
        description={`Học từ vựng bài ${lesson.lessonCode}: ${lesson.title} (${items.length} từ vựng). Luyện Flashcard, gõ từ và làm bài tập trắc nghiệm miễn phí.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/vocabulary/${lesson.slug}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Từ Vựng', href: `/courses/${courseCode.toLowerCase()}/vocabulary` },
            { label: `Bài ${lesson.lessonCode}` }
          ]}
        />

        {/* Lesson Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-[#F05A28] border border-orange-200">
                  LESSON {lesson.lessonCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {items.length} từ vựng
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {lesson.lessonCode}: {lesson.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Progress Bar Widget */}
            <div className="min-w-[220px] max-w-xs p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Đã thuộc: <strong className="text-slate-900 font-bold">{masteredCount} / {items.length}</strong>
                </span>
                <span className="font-bold text-slate-900 font-mono">{percent}%</span>
              </div>
              <CourseProgressBar percent={percent} size="sm" color="orange" showPercentText={false} />
            </div>
          </div>

          {!user && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-amber-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
              <Sparkles size={14} className="shrink-0 text-amber-600" />
              <span>
                Bạn đang học ở chế độ khách. Đăng nhập để lưu vĩnh viễn tiến độ học tập và chuỗi ngày học trên mọi thiết bị!
              </span>
            </div>
          )}
        </div>

        {/* Learning Mode Tabs */}
        <LearningModeSelector
          activeMode={activeMode}
          onSelectMode={setActiveMode}
          weakWordsCount={weakWordsStorage.getWeakWordIds(courseCode, lesson.slug).length}
        />

        {/* Interactive Mode Content */}
        <div className="mb-12">
          {activeMode === 'flashcard' && (
            <FlashcardMode
              items={items}
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'typing' && (
            <TypingMode
              items={items}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'multichoice' && (
            <MultiChoiceMode
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'smart-quiz' && (
            <SmartQuizMode
              items={items}
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'speed-match' && (
            <SpeedMatchMode
              items={items}
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'time-attack' && (
            <TimeAttackMode
              items={items}
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
            />
          )}

          {activeMode === 'mistake-buster' && (
            <MistakeBusterMode
              items={items}
              courseCode={courseCode}
              lessonSlug={lesson.slug}
              onRecordResult={handleRecordResult}
              onSwitchMode={(m) => setActiveMode(m as LearningMode)}
            />
          )}

          {activeMode === 'table' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-[#F05A28]" />
                  Danh Sách Từ Vựng Chi Tiết ({items.length} từ)
                </h3>
              </div>
              <VocabularyTable
                items={items}
                onToggleBookmark={handleToggleBookmark}
              />
            </div>
          )}
        </div>

        {/* Always Show Reference Vocabulary Table Below when in interactive modes */}
        {activeMode !== 'table' && (
          <div className="pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-[#F05A28]" />
                Bảng Tra Cứu Từ Vựng Bài {lesson.lessonCode}
              </h3>
            </div>
            <VocabularyTable
              items={items}
              onToggleBookmark={handleToggleBookmark}
            />
          </div>
        )}
      </div>
    </>
  );
}
