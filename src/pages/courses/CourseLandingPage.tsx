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
      // Default to first vocabulary lesson
      navigate(`/courses/${courseCode.toLowerCase()}/vocabulary/4-1-phuong-huong-va-phuong-tien`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Đang tải thông tin khóa học {courseCode.toUpperCase()}...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Thông báo</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'Không tìm thấy dữ liệu.'}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-[#F05A28] transition-colors cursor-pointer"
          >
            Quay về trang chủ
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
          items={[{ label: `${data.course.code} - ${data.course.title}` }]}
        />

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
                4 Phân Mục Học Tập Cốt Lõi
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
