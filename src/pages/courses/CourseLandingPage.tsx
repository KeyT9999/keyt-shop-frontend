import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseData } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import CourseHero from '../../features/courses/components/landing/CourseHero';
import SectionCard from '../../features/courses/components/landing/SectionCard';
import Seo from '../../components/Seo';

export default function CourseLandingPage() {
  const { courseCode = 'jpd123' } = useParams();
  const { token } = useAuthContext();
  const navigate = useNavigate();

  const [data, setData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await courseApi.getCourse(courseCode, token);
        if (!isCancelled) {
          setData(res);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error('Failed to load course:', err);
          setError('Không tìm thấy khóa học hoặc khóa học chưa được kích hoạt.');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourse();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, token]);

  const handleContinue = () => {
    if (data?.userProgress?.lastAccessedLesson) {
      const { slug, sectionType } = data.userProgress.lastAccessedLesson;
      navigate(`/courses/${courseCode.toLowerCase()}/${sectionType}/${slug}`);
    } else {
      navigate(`/courses/${courseCode.toLowerCase()}/vocabulary`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
        <div className="h-64 bg-slate-200 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-rose-800 mb-2">Thông báo</h2>
          <p className="text-sm text-rose-600 mb-6">{error || 'Không thể tải khóa học.'}</p>
          <button
            onClick={() => navigate('/courses/jpd123')}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Về khóa học JPD123
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${data.course.title} | Mindora AI`}
        description={data.course.description}
        canonicalPath={`/courses/${courseCode.toLowerCase()}`}
        type="website"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: 'Cổng Môn Học FPT', href: '/courses' },
            { label: `${data.course.code} - ${data.course.title}` }
          ]}
        />

        {/* Academic Course Separation Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                courseCode.toLowerCase() === 'jpd113'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-orange-100 text-[#F05A28] border border-orange-200'
              }`}
            >
              {courseCode.toLowerCase() === 'jpd113' ? 'HỌC PHẦN 1 • KỲ 1' : 'HỌC PHẦN 2 • KỲ 2'}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
              Môn Học Độc Lập Chuẩn Chương Trình Khảo Thí Đại Học FPT
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold shrink-0">
            {courseCode.toLowerCase() === 'jpd113' ? (
              <button
                type="button"
                onClick={() => navigate('/courses/jpd123')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#F05A28] text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80"
              >
                <span>Chuyển sang Môn JPD123 (Bài 4 - 7)</span>
                <span className="text-slate-400">→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/courses/jpd113')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80"
              >
                <span className="text-slate-400">←</span>
                <span>Về Môn Tiên Quyết JPD113 (Bài 1 - 3)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Tất cả môn học
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <CourseHero data={data} onContinue={handleContinue} />

        {/* 4 Section Cards Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28]">
                Nội Dung Trọng Tâm
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {data.sections.length} Phân Mục Học Tập Cốt Lõi Môn {data.course.code}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {data.sections.map((section) => (
              <SectionCard
                key={section.type}
                section={section}
                courseCode={courseCode}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
