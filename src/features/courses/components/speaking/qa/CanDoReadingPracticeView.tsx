import React, { useState } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  HelpCircle,
  Lightbulb,
  Play
} from 'lucide-react';
import type { QALessonOverview, SpeakingCanDoSlot, SpeakingCanDoReadingSentence, PronunciationEvaluationResult } from '../../../types/speaking';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../../../hooks/useAudioRecorder';
import { speakingApi } from '../../../api/speakingApi';

interface CanDoReadingPracticeViewProps {
  overview: QALessonOverview;
  courseCode?: string;
}

export const CanDoReadingPracticeView: React.FC<CanDoReadingPracticeViewProps> = ({
  overview,
  courseCode = 'jpd123'
}) => {
  const slots: SpeakingCanDoSlot[] = overview.slots || [];
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  // Active Slot
  const currentSlot: SpeakingCanDoSlot | undefined = slots[selectedSlotIndex] || slots[0];

  // Toggles
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showRomaji, setShowRomaji] = useState<boolean>(false);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);

  // Active sentence recording & evaluation state
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<Record<number, PronunciationEvaluationResult>>({});
  const [evalErrors, setEvalErrors] = useState<Record<number, string>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // TTS & Audio recording
  const { speak, stop: stopAudio } = useSpeechSynthesis();
  const { isRecording, duration, startRecording, stopRecording, resetAudio } = useAudioRecorder();

  // Handle Play audio
  const handlePlaySentence = (text: string) => {
    stopAudio();
    speak(text, 0.95);
  };

  // Handle Play all sentences sequentially
  const handlePlayAll = () => {
    if (!currentSlot || !currentSlot.readingSentences.length) return;
    stopAudio();
    const fullText = currentSlot.readingSentences.map((s) => s.japanese).join('。 ');
    speak(fullText, 0.95);
  };

  // Handle Start Recording for a sentence
  const handleStartShadowing = async (idx: number) => {
    stopAudio();
    setActiveSentenceIndex(idx);
    const updatedErrors = { ...evalErrors };
    delete updatedErrors[idx];
    setEvalErrors(updatedErrors);
    await startRecording();
  };

  // Handle Stop Recording & Evaluate sentence pronunciation
  const handleStopAndEvaluate = async (sentence: SpeakingCanDoReadingSentence) => {
    try {
      const blob = await stopRecording();
      if (!blob) return;

      setIsEvaluating(true);
      const result = await speakingApi.evaluatePronunciation(
        courseCode,
        blob,
        sentence.japanese,
        `SLOT-${currentSlot?.slot}-S${sentence.index}`
      );

      setEvaluationResults((prev) => ({
        ...prev,
        [sentence.index]: result
      }));
    } catch (err: any) {
      console.error('Shadowing evaluation failed:', err);
      setEvalErrors((prev) => ({
        ...prev,
        [sentence.index]:
          err.response?.data?.message ||
          err.message ||
          'Không thể chấm điểm câu đọc. Vui lòng thử lại.'
      }));
    } finally {
      setIsEvaluating(false);
      setActiveSentenceIndex(null);
    }
  };

  const handleResetSentence = (idx: number) => {
    resetAudio();
    const updatedRes = { ...evaluationResults };
    delete updatedRes[idx];
    setEvaluationResults(updatedRes);

    const updatedErr = { ...evalErrors };
    delete updatedErr[idx];
    setEvalErrors(updatedErr);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!slots.length) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
        <HelpCircle size={36} className="mx-auto text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">
          Chưa có dữ liệu mẫu câu Can-do cho bài học này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. SLOT SELECTION TABS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers size={14} className="text-[#F05A28]" />
            <span>Chọn Slot / Mục tiêu Can-do của Bài {overview.lesson}:</span>
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {slots.length} Slots chuẩn phân phối chương trình FPT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {slots.map((s, idx) => {
            const isSelected = selectedSlotIndex === idx;
            return (
              <button
                key={s.slot}
                type="button"
                onClick={() => {
                  setSelectedSlotIndex(idx);
                  stopAudio();
                  resetAudio();
                  setActiveSentenceIndex(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-orange-50/80 to-white border-[#F05A28] shadow-sm ring-2 ring-[#F05A28]/20'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isSelected
                          ? 'bg-[#F05A28] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Slot {s.slot} • Part {s.part}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {s.readingSentences.length} mẫu câu
                    </span>
                  </div>
                  <p
                    className={`text-xs font-bold leading-snug line-clamp-2 mt-1.5 ${
                      isSelected ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {s.canDo}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      isSelected ? 'text-[#F05A28]' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Đang học mẫu câu' : 'Nhấn để học'}
                  </span>
                  <CheckCircle2
                    size={13}
                    className={isSelected ? 'text-[#F05A28]' : 'text-slate-300'}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CAN-DO GOAL BANNER */}
      {currentSlot && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#1E293B] text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F05A28] text-white">
                Slot {currentSlot.slot} - Part {currentSlot.part}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                Chuẩn đầu ra Can-Do
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
              {currentSlot.canDo}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePlayAll}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Play size={13} className="text-orange-400 fill-orange-400" />
              <span>Nghe liên tục {currentSlot.readingSentences.length} câu</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TOOLBAR CONTROLS: Furigana, Romaji, Translation */}
      <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-semibold px-1">Hiển thị:</span>
          <button
            type="button"
            onClick={() => setShowFurigana(!showFurigana)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
              showFurigana
                ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Furigana
          </button>
          <button
            type="button"
            onClick={() => setShowRomaji(!showRomaji)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
              showRomaji
                ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Romaji
          </button>
          <button
            type="button"
            onClick={() => setShowVietnamese(!showVietnamese)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer border ${
              showVietnamese
                ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Tiếng Việt
          </button>
        </div>

        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
          <Lightbulb size={13} className="text-amber-500 shrink-0" />
          <span>Mẹo: Bấm <strong>Mic</strong> ở từng câu để luyện nói theo phương pháp Shadowing</span>
        </div>
      </div>

      {/* 4. SENTENCES LIST CARDS */}
      <div className="space-y-4">
        {currentSlot?.readingSentences.map((sentence) => {
          const isThisRecording = isRecording && activeSentenceIndex === sentence.index;
          const result = evaluationResults[sentence.index];
          const error = evalErrors[sentence.index];

          return (
            <div
              key={sentence.index}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                    {sentence.index}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Mẫu câu Slot {currentSlot.slot} - Câu {sentence.index}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlaySentence(sentence.japanese)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F05A28] text-xs font-bold transition-colors cursor-pointer border border-orange-200"
                  >
                    <Volume2 size={14} />
                    <span>Nghe phát âm</span>
                  </button>
                </div>
              </div>

              {/* Japanese Content */}
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-black font-japanese text-slate-900 leading-relaxed tracking-wide whitespace-pre-line">
                  {sentence.japanese}
                </p>

                {showFurigana && (
                  <p className="text-xs sm:text-sm font-japanese text-[#F05A28] font-medium leading-relaxed whitespace-pre-line">
                    【{sentence.furigana}】
                  </p>
                )}

                {showRomaji && sentence.romaji && (
                  <p className="text-xs font-mono text-slate-500 leading-relaxed whitespace-pre-line">
                    {sentence.romaji}
                  </p>
                )}

                {showVietnamese && (
                  <p className="text-xs sm:text-sm font-medium text-slate-700 pt-2 border-t border-slate-100 whitespace-pre-line">
                    Ý nghĩa: <strong className="text-slate-800">{sentence.vietnamese}</strong>
                  </p>
                )}
              </div>

              {/* Shadowing & Evaluation Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isThisRecording ? (
                    <button
                      type="button"
                      disabled={isRecording}
                      onClick={() => handleStartShadowing(sentence.index)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                        isRecording
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Mic size={14} className="text-orange-400" />
                      <span>Thu âm đọc câu này</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStopAndEvaluate(sentence)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse"
                    >
                      <MicOff size={14} />
                      <span>Dừng & Chấm điểm ({formatTime(duration)})</span>
                    </button>
                  )}

                  {(result || error) && (
                    <button
                      type="button"
                      onClick={() => handleResetSentence(sentence.index)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      <span>Làm lại</span>
                    </button>
                  )}
                </div>

                {isThisRecording && (
                  <div className="text-xs text-red-600 font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span>Đang thu âm: Hãy đọc to và rõ ràng câu trên...</span>
                  </div>
                )}

                {isEvaluating && activeSentenceIndex === null && (
                  <div className="text-xs text-[#F05A28] font-bold flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 border-2 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
                    <span>AI đang phân tích phát âm...</span>
                  </div>
                )}
              </div>

              {/* Evaluation Error Box */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Evaluation Result Box */}
              {result && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>Kết quả chấm phát âm Shadowing:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white">
                        Hạng {result.grade}
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        {result.score} / 100 điểm
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/90 border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Độ chính xác:</span>
                      <strong className="text-slate-800 font-bold">{result.metrics.accuracy}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Độ lưu loát:</span>
                      <strong className="text-slate-800 font-bold">{result.metrics.fluency}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Phát âm:</span>
                      <strong className="text-slate-800 font-bold">{result.metrics.pronunciation}%</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/90 border border-emerald-100">
                      <span className="text-slate-400 block text-[10px]">Nhịp điệu:</span>
                      <strong className="text-slate-800 font-bold">{result.metrics.rhythm}%</strong>
                    </div>
                  </div>

                  {result.summary && (
                    <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                      <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Nhận xét:</strong> {result.summary}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
