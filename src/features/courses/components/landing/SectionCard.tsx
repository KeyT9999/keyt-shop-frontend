import { useNavigate } from 'react-router-dom';
import { ChevronRight, CheckCircle2, Layers } from 'lucide-react';
import type { CourseSectionMeta } from '../../types';
import CourseProgressBar from '../common/CourseProgressBar';

interface SectionCardProps {
  section: CourseSectionMeta;
  courseCode: string;
}

export default function SectionCard({ section, courseCode }: SectionCardProps) {
  const navigate = useNavigate();

  const themeStyles = {
    rose: {
      borderHover: 'hover:border-rose-400/80',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      charBg: 'bg-rose-100/70 text-rose-800',
      btnHover: 'group-hover:text-rose-600',
      progressColor: 'rose' as const
    },
    orange: {
      borderHover: 'hover:border-orange-400/80',
      badgeBg: 'bg-orange-50 text-[#F05A28] border-orange-200',
      charBg: 'bg-orange-100/70 text-[#F05A28]',
      btnHover: 'group-hover:text-[#F05A28]',
      progressColor: 'orange' as const
    },
    indigo: {
      borderHover: 'hover:border-indigo-400/80',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      charBg: 'bg-indigo-100/70 text-indigo-800',
      btnHover: 'group-hover:text-indigo-600',
      progressColor: 'indigo' as const
    },
    emerald: {
      borderHover: 'hover:border-emerald-400/80',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      charBg: 'bg-emerald-100/70 text-emerald-800',
      btnHover: 'group-hover:text-emerald-600',
      progressColor: 'emerald' as const
    },
    purple: {
      borderHover: 'hover:border-purple-400/80',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      charBg: 'bg-purple-100/70 text-purple-800',
      btnHover: 'group-hover:text-purple-600',
      progressColor: 'purple' as const
    }
  }[section.colorTheme];

  const handleCardClick = () => {
    navigate(`/courses/${courseCode.toLowerCase()}/${section.type}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${themeStyles.borderHover}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Japanese Signature Character Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-japanese font-black text-2xl shadow-xs transition-transform duration-300 group-hover:scale-105 ${themeStyles.charBg}`}
            >
              {section.kanjiChar}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-black text-slate-900 transition-colors ${themeStyles.btnHover}`}>
                  {section.title}
                </h3>
                <span className="text-xs font-japanese text-slate-500 font-semibold">
                  {section.japaneseTitle}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${themeStyles.badgeBg}`}>
                <Layers size={11} />
                {section.totalLessons} bài học
              </span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6">
          {section.description}
        </p>
      </div>

      {/* Progress Footer */}
      <div className="pt-4 border-t border-slate-100/90">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-slate-400" />
            Đã thuộc: <strong className="text-slate-900">{section.userMastered} / {section.totalItems}</strong>
          </span>
          <span className="font-bold text-slate-900 font-mono">{section.percent}%</span>
        </div>

        <CourseProgressBar
          percent={section.percent}
          color={themeStyles.progressColor}
          size="sm"
          showPercentText={false}
        />
      </div>
    </div>
  );
}
