import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';

export default function GrammarLessonListPage() {
  const { courseCode = 'jpd123' } = useParams();
  const { token } = useAuthContext();
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getSectionLessons(courseCode, 'grammar', token);
        if (!isCancelled) {
          setLessons(data || []);
        }
      } catch (err) {
        if (!isCancelled) console.error('Failed to load grammar lessons:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchLessons();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, token]);

  const upperCode = courseCode.toUpperCase();
  const totalItems = lessons.reduce((acc, l) => acc + (l.itemCount || 0), 0);

  return (
    <>
      <Seo
        title={`Ngữ Pháp ${upperCode} - Danh Sách ${lessons.length || (upperCode === 'JPD113' ? 3 : 4)} Bài Học | Mindora AI`}
        description={`Học các mẫu ngữ pháp tiếng Nhật ${upperCode} qua các bài học trọng tâm, công thức mẫu câu và ví dụ hội thoại.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/grammar`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Ngữ Pháp (文法)' }
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <BookOpen size={15} />
              <span>Chương Trình Ngữ Pháp Tiếng Nhật</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Danh Sách Bài Học Ngữ Pháp {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bao gồm các mẫu ngữ pháp quan trọng nhất cho cấp độ N5 với ví dụ trực quan.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 text-xs font-bold self-start sm:self-auto">
            {lessons.length || (upperCode === 'JPD113' ? 3 : 4)} Bài học • {totalItems || (upperCode === 'JPD113' ? 21 : 23)} Mẫu câu
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lessons.map((l) => (
              <Link
                key={l._id}
                to={`/courses/${courseCode.toLowerCase()}/grammar/${l.slug}`}
                className="group p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {l.lessonCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {l.itemCount} mẫu câu
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{l.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">{l.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Trình độ JLPT N5</span>
                  <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Khám phá mẫu câu →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
