import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
import { getCourseLanguage } from '../../features/courses/utils/courseLanguage';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import LessonCard from '../../features/courses/components/vocabulary/LessonCard';
import Seo from '../../components/Seo';

export default function VocabularyLessonListPage() {
  const { courseCode = 'jpd123' } = useParams();
  const { token } = useAuthContext();

  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getSectionLessons(courseCode, 'vocabulary', token);
        if (!isCancelled) {
          setLessons(data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load vocabulary lessons:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLessons();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, token]);

  const upperCode = courseCode.toUpperCase();
  const language = getCourseLanguage(courseCode);
  const totalItems = lessons.reduce((acc, l) => acc + (l.itemCount || 0), 0);
  const fallbackLessonCount = upperCode === 'JPD113' ? 9 : upperCode.startsWith('HSK') ? 11 : 12;
  const fallbackItemCount = upperCode === 'JPD113' ? 264 : upperCode === 'HSK1' ? 150 : upperCode === 'HSK2' ? 140 : 180;

  return (
    <>
      <Seo
        title={`Từ Vựng ${language.languageName} ${upperCode} - Danh Sách ${lessons.length || fallbackLessonCount} Bài Học | Mindora AI`}
        description={`Học từ vựng ${language.languageName.toLowerCase()} ${upperCode} qua các bài học với Flashcard 3D, luyện gõ và trắc nghiệm.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/vocabulary`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: `Từ Vựng (${language.kind === 'chinese' ? '词汇' : '単語'})` }
          ]}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-1">
              <BookMarked size={15} />
              <span>Chương Trình Từ Vựng {language.languageName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Danh Sách Bài Học Từ Vựng {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bao gồm {lessons.length || fallbackLessonCount} chủ đề từ vựng, kết hợp luyện nhớ và phản xạ nhanh.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-orange-50 text-[#F05A28] border border-orange-200/60 text-xs font-bold self-start sm:self-auto">
            {lessons.length || fallbackLessonCount} Bài học • {totalItems || fallbackItemCount} Từ vựng
          </div>
        </div>

        {/* 3-Column Lesson Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                courseCode={courseCode}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
