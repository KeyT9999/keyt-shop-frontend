import { useNavigate } from 'react-router-dom';
import { BookMarked, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CourseLesson } from '../../types';
import CourseProgressBar from '../common/CourseProgressBar';

interface LessonCardProps {
  lesson: CourseLesson;
  courseCode: string;
}

export default function LessonCard({ lesson, courseCode }: LessonCardProps) {
  const navigate = useNavigate();
  const percent = lesson.userProgress?.percentCompleted || 0;
  const mastered = lesson.userProgress?.masteredItems || 0;

  const handleClick = () => {
    navigate(`/courses/${courseCode.toLowerCase()}/vocabulary/${lesson.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div>
        {/* Header with Lesson Code Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F05A28] border border-orange-200/60 flex items-center justify-center font-bold shadow-xs">
              <BookMarked size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-[#F05A28] bg-orange-50/80 px-2.5 py-1 rounded-full border border-orange-200/50">
              LESSON {lesson.lessonCode}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {lesson.itemCount} từ vựng
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors mb-2 line-clamp-1">
          {lesson.lessonCode}: {lesson.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
          {lesson.description}
        </p>
      </div>

      {/* Progress & Start Button */}
      <div className="pt-4 border-t border-slate-100">
        <div className="mb-4">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" />
              Đã thuộc: <strong className="text-slate-800">{mastered} / {lesson.itemCount}</strong>
            </span>
            <span className="font-bold text-slate-800 font-mono">{percent}%</span>
          </div>
          <CourseProgressBar percent={percent} size="sm" color="orange" showPercentText={false} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 group-hover:bg-[#F05A28] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <span>{percent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
