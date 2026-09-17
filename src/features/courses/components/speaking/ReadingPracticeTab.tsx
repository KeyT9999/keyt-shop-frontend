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
  Sparkles
} from 'lucide-react';
import type { SpeakingReadingPassage } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

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

  // Preparation Countdown Timer (20s)
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(20);
  const [isPrepping, setIsPrepping] = useState(false);

  const { isPlaying, speak, stop: stopAudio } = useSpeechSynthesis();
  const {
    isSupported: isMicSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    calculateMatchRate
  } = useSpeechRecognition();

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
      startListening();
    }
    return () => clearInterval(timer);
  }, [isPrepping, prepTimeLeft, startListening]);

  if (loading || !currentPassage) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải bài đọc mẫu Đề A...</p>
      </div>
    );
  }

  const handleStartPrep = () => {
    setPrepTimeLeft(20);
    setIsPrepping(true);
    resetTranscript();
    stopAudio();
  };

  const handlePassageSelect = (id: string) => {
    setSelectedPassageId(id);
    resetTranscript();
    setIsPrepping(false);
    setPrepTimeLeft(20);
    stopAudio();
    if (isListening) stopListening();
  };

  const matchStats = currentPassage
    ? calculateMatchRate(currentPassage.contentJapanese)
    : { matchPercentage: 0 };

  // Calculate Reading score /45 points
  const estimatedScore = Math.min(45, Math.round((matchStats.matchPercentage / 100) * 45));

  return (
    <div className="space-y-6">
      {/* Passage Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {passages.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePassageSelect(p.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer border ${
              p.id === selectedPassageId
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-rose-500 mr-1.5">{p.code}:</span>
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {currentPassage && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Header row of Passage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  {currentPassage.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Chủ đề: <strong className="text-slate-800">{currentPassage.topic}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {currentPassage.wordCount} chữ
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-xs"
                >
                  <Timer size={15} />
                  <span>20s Chuẩn Bị (Mô Phỏng)</span>
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
                    ? 'bg-rose-600 text-white'
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
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
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

          {/* Reading Passage Main Text */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/20 border-2 border-slate-200/80 leading-loose">
            <p className="text-xl sm:text-2xl font-japanese text-slate-900 font-medium tracking-wide">
              {showFurigana ? currentPassage.contentFurigana : currentPassage.contentJapanese}
            </p>

            {showTranslation && (
              <div className="mt-6 pt-5 border-t border-slate-200/80 text-sm sm:text-base text-slate-600 leading-relaxed font-sans bg-white/60 p-4 rounded-2xl">
                <span className="font-bold text-slate-800 block mb-1 text-xs uppercase tracking-wider">
                  Bản Dịch Tiếng Việt:
                </span>
                {currentPassage.contentVietnamese}
              </div>
            )}
          </div>

          {/* Mic Recording & Scoring Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Mic size={16} className="text-[#F05A28]" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Luyện Phát Âm Với Nhận Diện Giọng Nói
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {isListening
                  ? 'Đang lắng nghe... Hãy đọc to đoạn văn trên theo phát âm chuẩn tiếng Nhật.'
                  : 'Bấm nút để bắt đầu thu âm và so khớp độ chính xác của bạn.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isMicSupported ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) stopListening();
                      else startListening();
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-[#F05A28] text-white hover:bg-orange-600'
                    }`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isListening ? 'Dừng đọc' : 'Bắt đầu đọc'}</span>
                  </button>

                  {transcript && (
                    <button
                      type="button"
                      onClick={resetTranscript}
                      className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Thu âm lại"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </>
              ) : (
                <div className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle size={15} />
                  <span>Trình duyệt không hỗ trợ Mic Web Speech. Bạn có thể tự đọc và nghe AI đọc mẫu.</span>
                </div>
              )}
            </div>
          </div>

          {/* Transcript & Match Results */}
          {transcript && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Văn bản nhận diện từ giọng đọc của bạn:
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Độ khớp: <strong className="text-emerald-600 text-sm font-black">{matchStats.matchPercentage}%</strong>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Điểm ước lượng: <strong className="text-[#F05A28] text-sm font-black">{estimatedScore} / 45đ</strong>
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-japanese text-sm text-slate-800">
                {transcript}
              </div>
            </div>
          )}

          {/* Key Kanji & Katakana checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-rose-500" />
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
                  <span className="text-[11px] font-japanese text-rose-600">
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
