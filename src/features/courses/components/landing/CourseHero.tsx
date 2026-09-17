import { Sparkles, BookOpen, GraduationCap, Flame, ArrowRight } from 'lucide-react';
import type { CourseData } from '../../types';
import CourseProgressBar from '../common/CourseProgressBar';

interface CourseHeroProps {
  data: CourseData;
  onContinue: () => void;
}

export default function CourseHero({ data, onContinue }: CourseHeroProps) {
  const { course, userProgress } = data;
  const overallPercent = userProgress?.overallPercent || 0;
  const lastLesson = userProgress?.lastAccessedLesson;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-slate-900 to-[#0F172A] text-white p-6 sm:p-10 mb-10 shadow-xl border border-slate-800">
      {/* Background Japanese Watermark Graphic */}
      <div className="absolute right-4 -bottom-10 text-9xl font-black text-white/5 select-none pointer-events-none font-japanese">
        日本語
      </div>
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#F05A28]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#F05A28] text-white shadow-xs">
            <Sparkles size={13} />
            {course.code}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 backdrop-blur-xs border border-white/10">
            <GraduationCap size={13} />
            Trình độ: {course.level}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 backdrop-blur-xs border border-white/10">
            <Flame size={13} />
            Chuẩn ĐH & JLPT
          </span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white leading-tight">
          {course.title}
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
          {course.description}
        </p>

        {/* Progress & Quick Action */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/80 max-w-xl">
          <div className="mb-3">
            <CourseProgressBar
              percent={overallPercent}
              label="Tiến độ hoàn thành khóa học"
              color="orange"
              size="md"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
            <div className="text-xs text-slate-300">
              {lastLesson ? (
                <span>
                  Đang học dở: <strong className="text-white">{lastLesson.title}</strong>
                </span>
              ) : (
                <span>Bắt đầu từ vựng bài 4-1 ngay hôm nay!</span>
              )}
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F05A28] to-[#EA580C] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer shrink-0"
            >
              <BookOpen size={16} />
              <span>{lastLesson ? 'Học tiếp bài gần nhất' : 'Bắt đầu học ngay'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
