import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Clock,
  FileCheck,
  ArrowRight,
  Mic
} from 'lucide-react';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';
import type { FEExamSummary } from '../../features/courses/types/speaking';
import { speakingApi } from '../../features/courses/api/speakingApi';
import { FEExamRunner } from '../../features/courses/components/exam/FEExamRunner';

export default function ExamListPage() {
  const { courseCode = 'jpd123' } = useParams();
  const upperCode = courseCode.toUpperCase();

  const [exams, setExams] = useState<FEExamSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeExamSlug, setActiveExamSlug] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await speakingApi.getFeExams(courseCode);
        if (isMounted) setExams(data);
      } catch (err) {
        console.error('Failed to load FE exams', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchExams();
    return () => {
      isMounted = false;
    };
  }, [courseCode]);

  // If user selected an exam, show the runner
  if (activeExamSlug) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <FEExamRunner
          courseCode={courseCode}
          slug={activeExamSlug}
          onExit={() => setActiveExamSlug(null)}
        />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`Luyện Thi ${upperCode} - Đề Thi Thử Final Exam (FE) Chuẩn FPT | Mindora AI`}
        description={`Luyện thi tiếng Nhật ${upperCode} với 73 câu hỏi trắc nghiệm Final Exam thi thật có tính giờ 60 phút, kiểm tra phản xạ tổng hợp từ vựng, kanji, trợ từ và ngữ pháp.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/exam`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Luyện Thi (試験)' }
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-1">
              <Award size={15} />
              <span>Chương Trình Khảo Thí &amp; Ôn Tập FE Chuẩn FPT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Luyện Thi Thử &amp; Đánh Giá Năng Lực {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ngân hàng đề thi trắc nghiệm trích xuất từ đề thi Final Exam thật, bấm giờ 60 phút, chấm điểm tự động và có lời giải chi tiết.
            </p>
          </div>

          {/* Quick link to Speaking Exam */}
          <Link
            to={`/courses/${courseCode.toLowerCase()}/speaking`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-[#F05A28] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            Luyện Thi Nói 1-1 (Speaking)
          </Link>
        </div>

        {/* Speaking Exam Highlight Banner */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-700">
          <div className="space-y-2">
            <span className="px-3 py-1 bg-[#F05A28] text-white text-xs font-bold rounded-full uppercase tracking-wider">
              Tính Năng Mới
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Phòng Thi Nói Giả Lập 1-1 Chuẩn FPT University
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Luyện đọc đoạn văn 45đ, Vấn đáp Q&amp;A 3 câu 45đ (có tranh và không tranh), Tác phong 10đ với Giám thị AI. Nhận ngay phiếu điểm đánh giá FPT!
            </p>
          </div>
          <Link
            to={`/courses/${courseCode.toLowerCase()}/speaking`}
            className="shrink-0 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Vào Luyện Thi Nói</span>
            <ArrowRight className="w-4 h-4 text-[#F05A28]" />
          </Link>
        </div>

        {/* Exam Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Đang tải danh sách đề thi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam, idx) => (
              <div
                key={exam.id}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#F05A28] border border-orange-200">
                      ĐỀ SỐ 0{idx + 1}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <Clock size={13} /> {exam.durationMinutes} phút
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                    {exam.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FileCheck size={14} className="text-[#F05A28]" />
                    {exam.totalQuestions} câu hỏi thi thật
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveExamSlug(exam.slug)}
                    className="py-2.5 px-5 rounded-xl bg-[#1E293B] hover:bg-[#F05A28] text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Vào thi thử</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
