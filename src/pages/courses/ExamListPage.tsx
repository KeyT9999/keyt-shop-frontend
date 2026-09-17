import { useParams } from 'react-router-dom';
import { Award, Clock, FileCheck, ArrowRight } from 'lucide-react';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';

export default function ExamListPage() {
  const { courseCode = 'jpd123' } = useParams();
  const upperCode = courseCode.toUpperCase();

  return (
    <>
      <Seo
        title={`Luyện Thi ${upperCode} - Đề Thi Thử Định Dạng Chuẩn | Mindora AI`}
        description={`Luyện thi tiếng Nhật ${upperCode} với các bộ đề thi thử có tính giờ, kiểm tra phản xạ tổng hợp từ vựng, kanji và ngữ pháp.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/exam`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Luyện Thi (試験)' }
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <Award size={15} />
              <span>Chương Trình Ôn Tập & Luyện Thi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Luyện Thi Thử & Đánh Giá Năng Lực {upperCode}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tổng hợp đề thi thử trắc nghiệm định dạng JLPT chuẩn giúp bạn tự tin đạt điểm cao trong các kỳ thi.
            </p>
          </div>
        </div>

        {/* Exam Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ĐỀ SỐ 01
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <Clock size={13} /> 45 phút
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Đề Thi Thử Giữa Kỳ {upperCode} (N5 Format)
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Kiểm tra kiến thức Từ vựng, Hán tự và Ngữ pháp bài 4 đến bài 5. Định dạng 4 lựa chọn có chấm điểm tự động.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <FileCheck size={14} className="text-emerald-500" />
                15 câu hỏi trắc nghiệm
              </span>
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Vào phòng thi thử</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 border border-dashed border-slate-300 flex flex-col justify-center items-center text-center p-8">
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-400 flex items-center justify-center mb-3 shadow-xs">
              <Award size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-700 mb-1">Đề Thi Thử Cuối Kỳ {upperCode}</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Bộ đề tổng hợp bài 4 đến bài 7 đang được giảng viên hoàn thiện và sẽ cập nhật sớm.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
