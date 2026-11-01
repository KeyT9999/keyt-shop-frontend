import { useNavigate } from 'react-router-dom';
import {
  BookMarked,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Leaf,
  Laptop,
  HeartPulse,
  Scale,
  Briefcase,
  Radio,
  Globe2,
  Users,
  Landmark,
  Trophy
} from 'lucide-react';
import type { CourseLesson } from '../../types';
import CourseProgressBar from '../common/CourseProgressBar';

interface LessonCardProps {
  lesson: CourseLesson;
  courseCode: string;
}

const getEnwTopicIcon = (order: number) => {
  switch (order) {
    case 1: return <GraduationCap size={18} />;
    case 2: return <Leaf size={18} />;
    case 3: return <Laptop size={18} />;
    case 4: return <HeartPulse size={18} />;
    case 5: return <Scale size={18} />;
    case 6: return <Briefcase size={18} />;
    case 7: return <Radio size={18} />;
    case 8: return <Globe2 size={18} />;
    case 9: return <Users size={18} />;
    case 10: return <Landmark size={18} />;
    default: return <Trophy size={18} />;
  }
};

const getEnwTopicColors = (order: number) => {
  switch (order) {
    case 1: return { icon: 'bg-blue-50 text-blue-600 border-blue-200/60', badge: 'bg-blue-50/80 text-blue-700 border-blue-200/60' };
    case 2: return { icon: 'bg-emerald-50 text-emerald-600 border-emerald-200/60', badge: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' };
    case 3: return { icon: 'bg-indigo-50 text-indigo-600 border-indigo-200/60', badge: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60' };
    case 4: return { icon: 'bg-rose-50 text-rose-600 border-rose-200/60', badge: 'bg-rose-50/80 text-rose-700 border-rose-200/60' };
    case 5: return { icon: 'bg-amber-50 text-amber-700 border-amber-200/60', badge: 'bg-amber-50/80 text-amber-800 border-amber-200/60' };
    case 6: return { icon: 'bg-cyan-50 text-cyan-700 border-cyan-200/60', badge: 'bg-cyan-50/80 text-cyan-800 border-cyan-200/60' };
    case 7: return { icon: 'bg-violet-50 text-violet-600 border-violet-200/60', badge: 'bg-violet-50/80 text-violet-700 border-violet-200/60' };
    case 8: return { icon: 'bg-teal-50 text-teal-600 border-teal-200/60', badge: 'bg-teal-50/80 text-teal-700 border-teal-200/60' };
    case 9: return { icon: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/60', badge: 'bg-fuchsia-50/80 text-fuchsia-700 border-fuchsia-200/60' };
    case 10: return { icon: 'bg-slate-100 text-slate-700 border-slate-300', badge: 'bg-slate-100 text-slate-700 border-slate-300' };
    default: return { icon: 'bg-orange-50 text-[#F05A28] border-orange-200/60', badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent' };
  }
};

export default function LessonCard({ lesson, courseCode }: LessonCardProps) {
  const navigate = useNavigate();
  const percent = lesson.userProgress?.percentCompleted || 0;
  const mastered = lesson.userProgress?.masteredItems || 0;

  const handleClick = () => {
    navigate(`/courses/${courseCode.toLowerCase()}/vocabulary/${lesson.slug}`);
  };

  const upperCode = courseCode.toUpperCase();
  const isToeic = upperCode === 'TOEIC120';
  const isHackers = upperCode === 'TOEIC_HACKERS' || upperCode === 'TOEICHACKERS';
  const isBaKhi = upperCode === 'ENGBK' || upperCode === 'ENGBAKHI' || upperCode === 'ENGBK2' || upperCode === 'ENGBAKHI2';
  const isEnw = upperCode === 'ENW' || upperCode === 'ENGW';
  const hasCodeInTitle = lesson.title.toLowerCase().includes(lesson.lessonCode.toLowerCase());
  const isStQuiz = lesson.lessonCode.toUpperCase().includes('_ST');
  const enwColors = isEnw ? getEnwTopicColors(lesson.order) : null;
  const enwIcon = isEnw ? getEnwTopicIcon(lesson.order) : null;

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-white border shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
        isEnw && lesson.order === 11
          ? 'border-orange-300 ring-2 ring-orange-200/50 bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30'
          : 'border-slate-200/80'
      }`}
    >
      <div>
        {/* Header with Lesson Code Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-xs border transition-colors ${
              isEnw && enwColors
                ? enwColors.icon
                : 'bg-orange-50 text-[#F05A28] border-orange-200/60'
            }`}>
              {isEnw && enwIcon ? enwIcon : <BookMarked size={18} />}
            </div>
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isEnw && enwColors
                ? enwColors.badge
                : 'text-[#F05A28] bg-orange-50/80 border-orange-200/50'
            }`}>
              {isEnw
                ? (lesson.order === 11 ? 'FULL 199 TỪ' : `CHỦ ĐỀ ${lesson.order}`)
                : (isToeic || isBaKhi ? `QUIZ ${lesson.order}` : isHackers ? `DAY ${lesson.order}` : isStQuiz ? `QUIZ ${lesson.lessonCode}` : `LESSON ${lesson.lessonCode}`)}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {lesson.itemCount} {isToeic ? 'cụm từ' : isBaKhi || isEnw ? 'mục từ' : 'từ vựng'}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#F05A28] transition-colors mb-2 line-clamp-1">
          {isToeic || isHackers || isBaKhi || hasCodeInTitle ? lesson.title : `${lesson.lessonCode}: ${lesson.title.replace(new RegExp(`^${lesson.lessonCode}[:\\s-]*`, 'i'), '')}`}
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
          <span>{percent > 0 ? (isToeic || isBaKhi ? 'Tiếp tục luyện Quiz' : 'Tiếp tục học') : (isToeic || isBaKhi ? 'Bắt đầu Quiz' : 'Bắt đầu học')}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
