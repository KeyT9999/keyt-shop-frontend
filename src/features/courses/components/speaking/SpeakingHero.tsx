import { Mic, BookOpen, MessageSquare, Award, ShieldCheck } from 'lucide-react';

export type SpeakingTab = 'reading' | 'qa' | 'mock' | 'survival';

export interface SpeakingHeroProps {
  activeTab: SpeakingTab;
  onTabChange: (tab: SpeakingTab) => void;
  passagesCount?: number;
  questionsCount?: number;
}

export function SpeakingHero({
  activeTab,
  onTabChange,
  passagesCount = 4,
  questionsCount = 18
}: SpeakingHeroProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/60">
              JPD123 • Khảo Thí FPT
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
              <Award size={13} />
              <span>Thi Nói 1-1 (100 Điểm)</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              Reading 45đ • Q&A 45đ • Tác phong 10đ
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Luyện Thi Nói Tiếng Nhật JPD123
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Hệ thống mô phỏng bài thi nói 1-1 với Giám thị AI chuẩn format trường FPT: Luyện đọc đoạn văn 150 chữ, phản xạ trả lời câu hỏi có tranh & không tranh, cùng cẩm nang câu cứu cánh phòng thi.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl self-start lg:self-auto flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => onTabChange('reading')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reading'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={15} />
            <span>Luyện Đọc ({passagesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('qa')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={15} />
            <span>Phản Xạ Q&A ({questionsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('mock')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mock'
                ? 'bg-[#F05A28] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic size={15} />
            <span>Thi Thử 1-1</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('survival')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'survival'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Cẩm Nang</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpeakingHero;
