import { useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
  AlertCircle,
  Timer,
  Sparkles,
  RefreshCw,
  AudioWaveform
} from 'lucide-react';


import type {
  SpeakingReadingPassage,
  PronunciationEvaluationResult,
  PronunciationWordEvaluation
} from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

export interface ReadingPracticeTabProps {
  passages?: SpeakingReadingPassage[];
  courseCode?: string;
}

export function ReadingPracticeTab({
  passages: initialPassages,
  courseCode = 'jpd123'
}: ReadingPracticeTabProps) {
  const [passages, setPassages] = useState<SpeakingReadingPassage[]>(initialPassages || []);
  const [loading, setLoading] = useState<boolean>(!initialPassages || initialPassages.length === 0);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(initialPassages?.[0]?.id || 'A-0');
  const [showFurigana, setShowFurigana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);

  // Preparation Countdown Timer (20s)
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(20);
  const [isPrepping, setIsPrepping] = useState(false);

  // Audio evaluation state
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationEvaluationResult | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<PronunciationWordEvaluation | null>(null);

  const { isPlaying, speak, stop: stopAudio } = useSpeechSynthesis();
  const {
    isRecording,
    duration,
    volumeLevel,
    audioUrl,
    error: recorderError,
    isSupported: isMicSupported,
    startRecording,
    stopRecording,
    resetAudio
  } = useAudioRecorder();

  useEffect(() => {
    if (initialPassages && initialPassages.length > 0) {
      setPassages(initialPassages);
      setSelectedPassageId(initialPassages[0].id);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchPassages = async () => {
      try {
        setLoading(true);
        const data = await speakingApi.getReadingPassages(courseCode);
        if (isMounted) {
          setPassages(data);
          if (data.length > 0) setSelectedPassageId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load reading passages', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPassages();
    return () => {
      isMounted = false;
    };
  }, [initialPassages, courseCode]);

  const currentPassage = passages.find((p) => p.id === selectedPassageId) || passages[0];

  // Preparation timer tick
  useEffect(() => {
    let timer: any;
    if (isPrepping && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (prepTimeLeft === 0 && isPrepping) {
      setIsPrepping(false);
      // Auto trigger start reading
      handleStartRecording();
    }
    return () => clearInterval(timer);
  }, [isPrepping, prepTimeLeft]);

  const handleStartPrep = () => {
    setPrepTimeLeft(20);
    setIsPrepping(true);
    stopAudio();
    resetAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
  };

  const handlePassageSelect = (id: string) => {
    setSelectedPassageId(id);
    setIsPrepping(false);
    setPrepTimeLeft(20);
    stopAudio();
    resetAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
  };

  const handleStartRecording = async () => {
    stopAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
    await startRecording();
  };

  const handleStopAndEvaluate = async () => {
    try {
      const blob = await stopRecording();
      if (!blob || !currentPassage) return;

      setIsEvaluating(true);
      setEvalError(null);

      const result = await speakingApi.evaluatePronunciation(
        courseCode,
        blob,
        currentPassage.contentJapanese,
        currentPassage.id
      );

      setEvaluationResult(result);
      if (result.words && result.words.length > 0) {
        // Find first word with warning or error to show hint initially, or first word
        const flawedWord = result.words.find((w) => w.status !== 'correct');
        setSelectedWordDetail(flawedWord || result.words[0]);
      }
    } catch (err: any) {
      console.error('Pronunciation evaluation failed:', err);
      setEvalError(
        err.response?.data?.message ||
        err.message ||
        'Không thể chấm điểm bài đọc. Vui lòng đảm bảo dịch vụ AI Speech đang chạy.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    resetAudio();
    setEvaluationResult(null);
    setSelectedWordDetail(null);
    setEvalError(null);
    setIsPrepping(false);
    setPrepTimeLeft(20);
  };

  if (loading || !currentPassage) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải bài đọc mẫu Đề A...</p>
      </div>
    );
  }

  // Format recording seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Passage Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {passages.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePassageSelect(p.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer border ${
              p.id === selectedPassageId
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[#F05A28] mr-1.5">{p.code}:</span>
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {currentPassage && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header row of Passage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-[#F05A28] border border-orange-200/60">
                  {currentPassage.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Chủ đề: <strong className="text-slate-800">{currentPassage.topic}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentPassage.wordCount} chữ
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-emerald-600">
                  Rubric: 45đ FE
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {currentPassage.title}
              </h2>
            </div>

            {/* Preparation timer button */}
            <div className="flex items-center gap-2">
              {isPrepping ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 animate-pulse">
                  <Timer size={16} className="text-amber-600" />
                  <span className="text-xs font-bold">
                    Chuẩn bị đọc: <strong className="text-sm font-black">{prepTimeLeft}s</strong>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartPrep}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-sm"
                >
                  <Timer size={15} />
                  <span>20s Chuẩn Bị (Chuẩn FE)</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            {/* Audio playback buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isPlaying) stopAudio();
                  else speak(currentPassage.contentJapanese, readingSpeed);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-[#F05A28] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Volume2 size={15} />
                <span>{isPlaying ? 'Dừng đọc' : 'Nghe AI đọc mẫu'}</span>
              </button>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setReadingSpeed(0.8)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    readingSpeed === 0.8 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  0.8x (Chậm)
                </button>
                <button
                  type="button"
                  onClick={() => setReadingSpeed(1.0)}
                  className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    readingSpeed === 1.0 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1.0x (Chuẩn)
                </button>
              </div>
            </div>

            {/* Display View Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFurigana(!showFurigana)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  showFurigana
                    ? 'bg-orange-50 text-[#F05A28] border-orange-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="Bật/Tắt phiên âm Hiragana trên chữ Hán"
              >
                {showFurigana ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTranslation(!showTranslation)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  showTranslation
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Languages size={14} />
                <span>{showTranslation ? 'Ẩn dịch' : 'Bản dịch'}</span>
              </button>
            </div>
          </div>

          {/* Reading Passage Main Text (or Interactive Word Highlighting if Evaluated) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/20 border-2 border-slate-200/80 leading-loose">
            {evaluationResult && evaluationResult.words ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#F05A28]" />
                    <span>Phân tích từng từ trong câu (Click vào từ để xem gợi ý phát âm)</span>
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Chuẩn xác
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Gượng/Ngập ngừng
                    </span>
                    <span className="flex items-center gap-1 text-rose-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Đọc sai/Bỏ sót
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-3 pt-2">
                  {evaluationResult.words.map((w, index) => {
                    const isSelected = selectedWordDetail?.word === w.word && selectedWordDetail?.reading === w.reading;
                    const isCorrect = w.status === 'correct';
                    const isWarning = w.status === 'warning';

                    return (
                      <button
                        key={`${w.word}-${index}`}
                        type="button"
                        onClick={() => setSelectedWordDetail(w)}
                        className={`group relative inline-flex flex-col items-center px-3 py-1.5 rounded-2xl font-japanese transition-all cursor-pointer border ${
                          isSelected
                            ? 'ring-2 ring-[#F05A28] shadow-md scale-105'
                            : 'hover:scale-102'
                        } ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                            : isWarning
                            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {showFurigana && (
                          <span className="text-[11px] font-sans text-slate-500 leading-none mb-0.5">
                            {w.reading}
                          </span>
                        )}
                        <span className="text-xl sm:text-2xl font-bold tracking-wide">
                          {w.word}
                        </span>
                        <span
                          className={`text-[10px] font-sans font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                            isCorrect
                              ? 'bg-emerald-200 text-emerald-800'
                              : isWarning
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-rose-200 text-rose-800'
                          }`}
                        >
                          {w.score}đ
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xl sm:text-2xl font-japanese text-slate-900 font-medium tracking-wide">
                {showFurigana ? currentPassage.contentFurigana : currentPassage.contentJapanese}
              </p>
            )}

            {showTranslation && (
              <div className="mt-6 pt-5 border-t border-slate-200/80 text-sm sm:text-base text-slate-600 leading-relaxed font-sans bg-white/60 p-4 rounded-2xl">
                <span className="font-bold text-slate-800 block mb-1 text-xs uppercase tracking-wider">
                  Bản Dịch Tiếng Việt:
                </span>
                {currentPassage.contentVietnamese}
              </div>
            )}
          </div>

          {/* Word Popover Hint when a word is clicked */}
          {selectedWordDetail && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-md animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-japanese text-amber-400">
                    {selectedWordDetail.word}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-japanese">
                    【{selectedWordDetail.reading}】
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    /{selectedWordDetail.romaji}/
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      selectedWordDetail.status === 'correct'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedWordDetail.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    Điểm âm vị: {selectedWordDetail.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedWordDetail.feedback}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => speak(selectedWordDetail.word, 0.9)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                >
                  <Volume2 size={14} className="text-[#F05A28]" />
                  <span>Nghe từ này</span>
                </button>
              </div>
            </div>
          )}

          {/* Mic Recording Panel with Live Sound Waveform */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mic size={16} className="text-[#F05A28]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                    Ghi Âm & Chấm Điểm Phát Âm AI (faster-whisper + VAD)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {isRecording
                    ? 'Đang lắng nghe... Hãy đọc to, tròn vành rõ chữ theo nhịp ngắt chuẩn.'
                    : isEvaluating
                    ? 'AI đang phân tích âm vị học tiếng Nhật, tốc độ đọc và ngắt nghỉ...'
                    : 'Bấm nút để bắt đầu thu âm giọng đọc của bạn và nhận phân tích 4 tiêu chí FE.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isMicSupported ? (
                  <>
                    {!isRecording ? (
                      <button
                        type="button"
                        disabled={isEvaluating}
                        onClick={handleStartRecording}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F05A28] text-white text-xs font-bold hover:bg-orange-600 transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Mic size={16} />
                        <span>Bắt đầu đọc</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopAndEvaluate}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-md animate-pulse"
                      >
                        <MicOff size={16} />
                        <span>Dừng & Chấm Điểm ({formatTime(duration)})</span>
                      </button>
                    )}

                    {(audioUrl || evaluationResult) && !isRecording && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Đọc lại bài này"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-amber-300 flex items-center gap-1.5">
                    <AlertCircle size={15} />
                    <span>Trình duyệt không hỗ trợ MediaRecorder microphone.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Audio Visualizer Waveform when recording */}
            {isRecording && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    REC: {formatTime(duration)}
                  </span>
                </div>

                {/* Animated Sound Bars */}
                <div className="flex items-center gap-1.5 h-8">
                  {[...Array(16)].map((_, i) => {
                    const dynamicHeight = Math.max(
                      15,
                      Math.min(100, (volumeLevel * (0.6 + ((i * 17) % 50) / 100)))
                    );
                    return (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-[#F05A28] to-amber-400 rounded-full transition-all duration-75"
                        style={{ height: `${dynamicHeight}%` }}
                      ></div>
                    );
                  })}
                </div>

                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  Âm lượng: {volumeLevel}%
                </span>
              </div>
            )}

            {/* Loading Analysis state */}
            {isEvaluating && (
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-4">
                <div className="w-6 h-6 border-3 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-200">
                    Đang xử lý âm thanh qua FFmpeg và chấm điểm bằng mô hình AI...
                  </span>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#F05A28] animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Recorder Error display */}
            {(recorderError || evalError) && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{recorderError || evalError}</span>
              </div>
            )}

            {/* Audio Playback of User Recording */}
            {audioUrl && !isRecording && (
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AudioWaveform size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Bản thu âm của bạn ({formatTime(duration || 0)}):
                  </span>
                </div>
                <audio src={audioUrl} controls className="h-8 max-w-full sm:max-w-xs" />
              </div>
            )}
          </div>

          {/* AI Pronunciation Scorecard Result */}
          {evaluationResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border-2 border-orange-200/80 space-y-6 animate-fadeIn">
              {/* Top Score Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-5">
                  {/* Circular / Large Score Badge */}
                  <div className="relative flex flex-col items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md border-2 border-orange-500/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                      Điểm FE
                    </span>
                    <span className="text-3xl font-black text-white">
                      {evaluationResult.feScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      / 45 điểm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${
                          evaluationResult.grade === 'S'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : evaluationResult.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : evaluationResult.grade === 'B'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        Hạng {evaluationResult.grade} • {evaluationResult.score}/100đ
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {evaluationResult.feScore >= 25 ? 'Đạt Chuẩn Qua Môn' : 'Cần Cải Thiện'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Kết Quả Chấm Điểm Luyện Đọc Tiếng Nhật
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {evaluationResult.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F05A28] text-white text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={14} />
                    <span>Luyện lại bài này</span>
                  </button>
                </div>
              </div>

              {/* 4 Rubric Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Accuracy */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">1. Độ Chính Xác (40%)</span>
                    <span className="text-sm font-black text-emerald-600">
                      {evaluationResult.metrics.accuracy}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.accuracy}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Khớp mặt chữ & âm đọc Hiragana
                  </span>
                </div>

                {/* 2. Pronunciation */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">2. Phát Âm (35%)</span>
                    <span className="text-sm font-black text-orange-600">
                      {evaluationResult.metrics.pronunciation}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.pronunciation}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Độ chuẩn xác âm vị (Acoustic confidence)
                  </span>
                </div>

                {/* 3. Fluency */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">3. Độ Trôi Chảy (15%)</span>
                    <span className="text-sm font-black text-sky-600">
                      {evaluationResult.metrics.fluency}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.fluency}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Tốc độ: {evaluationResult.details.moraRate} mora/s • Ngập ngừng: {evaluationResult.details.hesitationCount}
                  </span>
                </div>

                {/* 4. Rhythm */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">4. Nhịp Điệu (10%)</span>
                    <span className="text-sm font-black text-indigo-600">
                      {evaluationResult.metrics.rhythm}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${evaluationResult.metrics.rhythm}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Hoàn thành câu & ngắt câu tự nhiên
                  </span>
                </div>
              </div>

              {/* Spoken Transcript row */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Văn bản nhận diện từ giọng đọc của bạn (faster-whisper):
                </span>
                <p className="font-japanese text-base text-slate-800">
                  {evaluationResult.transcript || '(Không nhận diện được giọng đọc, hãy thử lại)'}
                </p>
              </div>
            </div>
          )}

          {/* Key Kanji & Katakana checklist (FPT FE Rubric) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F05A28]" />
              <span>Chữ Hán & Từ Katakana Trọng Tâm Được Chấm Điểm (Rubric FPT)</span>
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {currentPassage.targetKanji.map((k, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs"
                >
                  <span className="font-bold font-japanese text-slate-900 text-sm">
                    {k.character}
                  </span>
                  <span className="text-[11px] font-japanese text-[#F05A28]">
                    【{k.reading}】
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {k.hanViet}
                  </span>
                </div>
              ))}

              {currentPassage.targetKatakana.map((kat, i) => (
                <div
                  key={`kat-${i}`}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center gap-1 text-xs"
                >
                  <span className="font-bold font-japanese text-sky-900 text-sm">
                    {kat}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600">Katakana</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingPracticeTab;
