import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Seo from '../../components/Seo';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import KanaSetup from '../../features/courses/components/kana/KanaSetup';
import KanaQuizGrid from '../../features/courses/components/kana/KanaQuizGrid';
import KanaResultModal from '../../features/courses/components/kana/KanaResultModal';
import { useSpeechSynthesis } from '../../features/courses/hooks/useSpeechSynthesis';
import {
  ALL_KANA_ROWS,
  MAIN_KANA_ROWS,
  KANA_FONT_OPTIONS,
  type KanaType,
  type KanaItem
} from '../../features/courses/data/kanaData';

export default function KanaQuizPage() {
  const { courseCode, type } = useParams();
  const navigate = useNavigate();

  // Normalize initial kana type from URL param if available
  const initialKanaType: KanaType = useMemo(() => {
    const t = (type || '').toLowerCase();
    if (t === 'katakana') return 'katakana';
    if (t === 'both') return 'both';
    return 'hiragana';
  }, [type]);

  // Mode: 'setup' | 'quiz'
  const [appMode, setAppMode] = useState<'setup' | 'quiz'>('setup');
  // Kana Type: 'hiragana' | 'katakana' | 'both'
  const [kanaType, setKanaType] = useState<KanaType>(initialKanaType);
  // Selected Font
  const [selectedFontId, setSelectedFontId] = useState<string>('noto-sans-jp');
  // Selected Row IDs (Default to all 10 Main Kana rows)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(
    () => new Set(MAIN_KANA_ROWS.map((r) => r.id))
  );
  // Shuffled
  const [isShuffled, setIsShuffled] = useState<boolean>(true);
  // Sound
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Synchronize state when URL parameter :type changes
  useEffect(() => {
    if (type) {
      const t = type.toLowerCase();
      if (t === 'katakana' || t === 'hiragana' || t === 'both') {
        setKanaType(t as KanaType);
      }
    }
  }, [type]);

  // Handle Kana Type change and synchronize URL route
  const handleKanaTypeChange = (newType: KanaType) => {
    setKanaType(newType);
    const basePath = courseCode ? `/courses/${courseCode.toLowerCase()}/kana` : '/courses/kana';
    navigate(`${basePath}/${newType}`, { replace: true });
  };

  // Active quiz items
  const [quizItems, setQuizItems] = useState<KanaItem[]>([]);

  // Results State
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [quizStats, setQuizStats] = useState<{
    totalItems: number;
    solvedCount: number;
    solvedIds: string[];
    missedIds: string[];
    attemptsMap: Record<string, number>;
    startTime: number;
    endTime: number;
  } | null>(null);

  // Speech synthesis
  const { speak } = useSpeechSynthesis();

  const handlePlaySpeech = useCallback(
    (text: string) => {
      speak(text, 1.0);
    },
    [speak]
  );

  // Active Font Def
  const activeFont = useMemo(
    () => KANA_FONT_OPTIONS.find((f) => f.id === selectedFontId) || KANA_FONT_OPTIONS[0],
    [selectedFontId]
  );

  // Toggle single row selection
  const handleToggleRow = (rowId: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Batch toggle rows
  const handleSelectRows = (rowIds: string[], selectAll: boolean) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      rowIds.forEach((id) => {
        if (selectAll) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  // Start Quiz with current selections
  const handleStartQuiz = () => {
    const selectedRows = ALL_KANA_ROWS.filter((row) => selectedRowIds.has(row.id));
    let items: KanaItem[] = [];
    selectedRows.forEach((row) => {
      row.items.forEach((it) => {
        if (kanaType === 'both') {
          if (row.group === 'extended') {
            items.push({ ...it, id: `k-${it.id}`, displayMode: 'katakana' });
          } else {
            items.push({ ...it, id: `h-${it.id}`, displayMode: 'hiragana' });
            items.push({ ...it, id: `k-${it.id}`, displayMode: 'katakana' });
          }
        } else if (kanaType === 'katakana') {
          items.push({ ...it, id: it.id, displayMode: 'katakana' });
        } else {
          if (row.group !== 'extended') {
            items.push({ ...it, id: it.id, displayMode: 'hiragana' });
          }
        }
      });
    });

    if (items.length === 0) return;

    if (isShuffled) {
      // Fisher-Yates shuffle
      const shuffled = [...items];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      items = shuffled;
    }

    setQuizItems(items);
    setAppMode('quiz');
    setIsResultOpen(false);
  };

  // Finish Quiz and open Result Modal
  const handleFinishQuiz = (stats: {
    totalItems: number;
    solvedCount: number;
    solvedIds: string[];
    missedIds: string[];
    attemptsMap: Record<string, number>;
    startTime: number;
    endTime: number;
  }) => {
    setQuizStats(stats);
    setIsResultOpen(true);
  };

  // Retry only missed items
  const handleRetryMissed = () => {
    if (!quizStats || quizStats.missedIds.length === 0) return;

    const missedItems = quizItems.filter((it) => quizStats.missedIds.includes(it.id));
    if (missedItems.length === 0) return;

    if (isShuffled) {
      const shuffled = [...missedItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQuizItems(shuffled);
    } else {
      setQuizItems(missedItems);
    }

    setIsResultOpen(false);
    setAppMode('quiz');
  };

  // Retry all items
  const handleRetryAll = () => {
    setIsResultOpen(false);
    handleStartQuiz();
  };

  // Back to setup
  const handleBackToSetup = () => {
    setIsResultOpen(false);
    setAppMode('setup');
  };

  const backTarget = courseCode
    ? `/courses/${courseCode.toLowerCase()}`
    : '/courses';

  const backLabel = courseCode
    ? `Về Môn Học ${courseCode.toUpperCase()}`
    : 'Về Cổng Môn Học';

  const breadcrumbItems = courseCode
    ? [
        { label: 'Cổng Môn Học FPT', href: '/courses' },
        { label: courseCode.toUpperCase(), href: `/courses/${courseCode.toLowerCase()}` },
        { label: 'Bảng Chữ Cái Kana Quiz' }
      ]
    : [
        { label: 'Cổng Môn Học FPT', href: '/courses' },
        { label: 'Bảng Chữ Cái Kana Quiz' }
      ];

  const canonicalPath = courseCode
    ? `/courses/${courseCode.toLowerCase()}/kana${type ? `/${type.toLowerCase()}` : ''}`
    : `/courses/kana${type ? `/${type.toLowerCase()}` : ''}`;

  return (
    <>
      <Seo
        title={`Luyện Gõ Bảng Chữ Cái Tiếng Nhật ${
          kanaType === 'katakana' ? 'Katakana' : kanaType === 'both' ? 'Hira & Kata' : 'Hiragana'
        } Kana Quiz | Mindora AI`}
        description="Ứng dụng luyện nhớ bảng chữ cái Hiragana và Katakana theo phong cách Tofugu Kana Quiz. Gõ Romaji, hỗ trợ đổi font chữ Noto Sans, Mincho, Maru, nghe phát âm giọng bản xứ."
        canonicalPath={canonicalPath}
      />

      <div className="min-h-screen bg-slate-50/60 pb-20">
        {/* Top Navigation Bar: Breadcrumb + Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CourseBreadcrumb items={breadcrumbItems} />

          <button
            type="button"
            onClick={() => navigate(backTarget)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs text-xs font-bold transition-all cursor-pointer w-fit"
          >
            <ArrowLeft size={14} className="text-slate-500" />
            <span>{backLabel}</span>
          </button>
        </div>

        {appMode === 'setup' ? (
          <KanaSetup
            kanaType={kanaType}
            onKanaTypeChange={handleKanaTypeChange}
            selectedFontId={selectedFontId}
            onFontChange={setSelectedFontId}
            selectedRowIds={selectedRowIds}
            onToggleRow={handleToggleRow}
            onSelectRows={handleSelectRows}
            isShuffled={isShuffled}
            onShuffleChange={setIsShuffled}
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
            onStartQuiz={handleStartQuiz}
          />
        ) : (
          <KanaQuizGrid
            items={quizItems}
            kanaType={kanaType}
            selectedFontId={selectedFontId}
            onFontChange={setSelectedFontId}
            soundEnabled={soundEnabled}
            onSoundChange={setSoundEnabled}
            onPlaySpeech={handlePlaySpeech}
            onBackToSetup={handleBackToSetup}
            onFinishQuiz={handleFinishQuiz}
          />
        )}

        {/* Results Modal */}
        {quizStats && (
          <KanaResultModal
            isOpen={isResultOpen}
            kanaType={kanaType}
            fontFamily={activeFont.fontFamily}
            allItems={quizItems}
            solvedIds={quizStats.solvedIds}
            missedIds={quizStats.missedIds}
            startTime={quizStats.startTime}
            endTime={quizStats.endTime}
            attemptsMap={quizStats.attemptsMap}
            onRetryMissed={handleRetryMissed}
            onRetryAll={handleRetryAll}
            onBackToSetup={handleBackToSetup}
            onPlaySpeech={handlePlaySpeech}
          />
        )}
      </div>
    </>
  );
}
