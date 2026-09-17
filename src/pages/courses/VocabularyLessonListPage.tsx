import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
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

  return (
    <>
      <Seo
        title={`Từ Vựng ${upperCode} - Danh Sách 12 Bài Học | Mindora AI`}
        description={`Học từ vựng tiếng Nhật ${upperCode} qua 12 bài học chi tiết với chế độ Flashcard 3D, luyện gõ và trắc nghiệm.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/vocabulary`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Từ Vựng (単語)' }
          ]}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-1">
              <BookMarked size={15} />
              <span>Chương Trình Từ Vựng Tiếng Nhật</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Danh Sách Bài Học Từ Vựng {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bao gồm 12 bài học trọng tâm chuẩn chương trình giảng dạy, kết hợp luyện nhớ phản xạ nhanh.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-orange-50 text-[#F05A28] border border-orange-200/60 text-xs font-bold self-start sm:self-auto">
            12 Bài học • 180 Từ vựng
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
