import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  BookOpen,
  MessageSquare,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Printer,
  ShieldCheck
} from 'lucide-react';
import type { MockExamScorecard } from '../../types/speaking';

interface SpeakingScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scorecard: MockExamScorecard | null;
  onRetry: () => void;
  onNewExam: () => void;
}

export const SpeakingScorecardModal: React.FC<SpeakingScorecardModalProps> = ({
  isOpen,
  onClose,
  scorecard,
  onRetry,
  onNewExam
}) => {
  if (!isOpen || !scorecard) return null;

  const isPassed = scorecard.passed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Header Ribbon */}
        <div
          className={`p-6 text-white text-center relative ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-slate-800 to-[#1E293B]'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Phiếu Đánh Giá Chuẩn Khảo Thí FPT
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            KẾT QUẢ THI NÓI JPD123
          </h2>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            Mã đề thi: <strong className="text-white font-mono">{scorecard.examCode}</strong> • Ngày thực hiện: {scorecard.date}
          </p>

          {/* Main Score Badge */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center bg-white shadow-xl ${
                isPassed
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-[#F05A28] text-[#F05A28]'
              }`}
            >
              <span className="text-4xl font-black leading-none">{scorecard.totalScore}</span>
              <span className="text-xs font-bold text-slate-400 mt-0.5">/ 100 ĐIỂM</span>
            </div>

            <div className="mt-3">
              {isPassed ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/20 text-emerald-100 rounded-full text-sm font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-4 h-4" /> ĐẠT YÊU CẦU (PASS)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/30 text-rose-200 rounded-full text-sm font-bold border border-rose-400/30">
                  <XCircle className="w-4 h-4" /> CẦN ÔN LUYỆN THÊM (CHƯA ĐẠT)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Detailed Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Reading */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#F05A28]" /> Đọc Đoạn Văn
                </span>
                <span className="text-lg font-black text-amber-900">
                  {scorecard.readingScore}
                  <span className="text-xs text-amber-600 font-normal">/45</span>
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-amber-200/60">
                <div className="flex justify-between">
                  <span>Kanji (15đ):</span>
                  <span className="font-semibold">{scorecard.readingDetails.kanjiScore}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Katakana (10đ):</span>
                  <span className="font-semibold">{scorecard.readingDetails.katakanaScore}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Hiragana &amp; Ngắt câu (20đ):</span>
                  <span className="font-semibold">{scorecard.readingDetails.hiraganaScore}đ</span>
                </div>
              </div>
            </div>

            {/* QA */}
            <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-sky-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-sky-600" /> Hỏi Đáp (Q&amp;A)
                </span>
                <span className="text-lg font-black text-sky-900">
                  {scorecard.qaScore}
                  <span className="text-xs text-sky-600 font-normal">/45</span>
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-sky-200/60">
                {scorecard.qaDetails.map((q, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>Câu {idx + 1} (15đ):</span>
                    <span className="font-semibold">{q.score}đ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manners */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Tác Phong
                </span>
                <span className="text-lg font-black text-emerald-900">
                  {scorecard.mannerScore}
                  <span className="text-xs text-emerald-600 font-normal">/10</span>
                </span>
              </div>
              <div className="text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
                <p className="leading-relaxed">
                  Chào hỏi đầu/cuối buổi thi, phản xạ không ngập ngừng quá 10s.
                </p>
              </div>
            </div>
          </div>

          {/* Q&A Detailed Log */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase text-slate-700 tracking-wider">
              Chi tiết câu trả lời Q&amp;A:
            </h4>
            {scorecard.qaDetails.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs md:text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">
                    Câu {idx + 1}: <span className="font-japanese">{q.questionText}</span>
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-slate-300 font-bold text-slate-800 rounded text-xs shrink-0">
                    {q.score} / 15đ
                  </span>
                </div>
                <div className="text-slate-600">
                  <strong>Thí sinh trả lời: </strong>
                  <span className="font-japanese text-slate-800">
                    {q.studentAnswerText || '(Chưa ghi nhận câu trả lời)'}
                  </span>
                </div>
                <div className="p-2 bg-blue-50 text-blue-900 rounded-lg text-xs">
                  <strong>Đánh giá giám thị: </strong> {q.feedback}
                </div>
              </div>
            ))}
          </div>

          {/* General Feedback */}
          <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-2xl">
            <h4 className="text-xs font-bold uppercase text-[#F05A28] tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Lời khuyên từ Giám Thị AI FPT:
            </h4>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              {scorecard.generalFeedback}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> In / Lưu Phiếu Điểm
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Thi lại đề này
            </button>
            <button
              type="button"
              onClick={onNewExam}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#F05A28] hover:bg-[#d94819] rounded-xl transition-all shadow-md cursor-pointer"
            >
              Thi đề mới ngẫu nhiên <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
