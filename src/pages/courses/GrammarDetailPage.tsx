import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Volume2,
  Zap,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lightbulb,
  HelpCircle,
  X,
  RotateCcw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson, GrammarItem } from '../../features/courses/types';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import Seo from '../../components/Seo';

interface PlayingState {
  text: string;
  speed: number;
}

interface PracticeQuestion {
  id: number;
  question: string;
  subQuestion?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function GrammarDetailPage() {
  const { courseCode = 'jpd123', lessonSlug = '' } = useParams();
  const { token, user } = useAuthContext();

  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [items, setItems] = useState<GrammarItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playingState, setPlayingState] = useState<PlayingState | null>(null);

  // Bookmarks state persisted in localStorage
  const storageKey = `keyt_grammar_bookmarks_${user?.id || 'guest'}_${lessonSlug}`;
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Practice Quiz Modal State
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Fetch lesson data and grammar items
  useEffect(() => {
    let isCancelled = false;

    const fetchLesson = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getLessonItems(courseCode, 'grammar', lessonSlug, token);
        if (!isCancelled && data) {
          setLesson(data.lesson);
          setItems(data.items || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load grammar lesson detail:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLesson();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, lessonSlug, token]);

  // Toggle bookmark for pattern
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Failed to save bookmarks:', e);
      }
      return next;
    });
  };

  // Play audio speech synthesis
  const playAudio = useCallback((text: string, speed: number) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn không hỗ trợ phát âm thanh Web Speech.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = speed;

    utterance.onstart = () => {
      setPlayingState({ text, speed });
    };

    utterance.onend = () => {
      setPlayingState(null);
    };

    utterance.onerror = () => {
      setPlayingState(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const currentItem = items[selectedIndex] || null;

  // Generate dynamic practice questions based on current lesson
  const practiceQuestions: PracticeQuestion[] = useMemo(() => {
    if (!items || items.length === 0) return [];

    if (lessonSlug.includes('bai-5')) {
      return [
        {
          id: 1,
          question: 'Điền dạng quá khứ của động từ: "おととい、新宿へ _____。 (đã đi)"',
          subQuestion: 'Động từ thời quá khứ khẳng định',
          options: [
            '行きます',
            '行きました',
            '行きませんでした',
            '行きたいです'
          ],
          correctAnswer: 1,
          explanation: 'Động từ thời quá khứ khẳng định thay ます bằng ました: 行きます -> 行きました.'
        },
        {
          id: 2,
          question: 'Chọn dạng quá khứ đúng của tính từ: "旅行はとても _____。 (đã rất vui)"',
          subQuestion: 'Tính từ đuôi い ở thì quá khứ',
          options: [
            '楽しいでした',
            '楽しかったです',
            '楽しいかったです',
            '楽しくないでした'
          ],
          correctAnswer: 1,
          explanation: 'Tính từ đuôi い ở thì quá khứ: bỏ い thêm かったです (楽しい -> 楽しかったです).'
        },
        {
          id: 3,
          question: 'Chọn trợ từ thích hợp: "私は日本のアニメ _____ 好きです。"',
          subQuestion: 'Bày tỏ cảm xúc yêu ghét: N が 好き/嫌い です',
          options: [
            'を',
            'が',
            'に',
            'で'
          ],
          correctAnswer: 1,
          explanation: 'Với tính từ biểu thị sở thích/ghét như 好き/嫌い, trợ từ đi kèm đối tượng luôn là が, không dùng を.'
        },
        {
          id: 4,
          question: 'Chọn câu đúng: "Tôi muốn có đôi giày mới."',
          subQuestion: 'Mong muốn sở hữu đồ vật: N が ほしいです',
          options: [
            '新しい靴が欲しいです。',
            '新しい靴を欲しいです。',
            '新しい靴が欲しです。',
            '新しい靴を買います。'
          ],
          correctAnswer: 0,
          explanation: 'Mẫu câu mong muốn có vật: N が ほしいです (新しい靴が欲しいです).'
        },
        {
          id: 5,
          question: 'Chia động từ trong câu: "おいしい寿司を _____ たいです。 (muốn ăn)"',
          subQuestion: 'Mẫu câu mong muốn làm hành động: V(bỏ ます) + たいです',
          options: [
            '食べる',
            '食べ',
            '食べた',
            '食べます'
          ],
          correctAnswer: 1,
          explanation: 'Động từ bỏ ます ghép với たいです: 食べます -> 食べたいです.'
        },
        {
          id: 6,
          question: 'Điền trợ từ mục đích: "新宿へ買い物 _____ 行きます。 (Đi Shinjuku để mua sắm)"',
          subQuestion: 'Mục đích di chuyển: N (địa điểm) へ V(bỏ ます)/N に 行きます',
          options: [
            'で',
            'を',
            'に',
            'が'
          ],
          correctAnswer: 2,
          explanation: 'Cấu trúc chỉ mục đích di chuyển: [Địa điểm] へ [Mục đích] に 行きます/来ます/帰ります.'
        }
      ];
    }

    if (lessonSlug.includes('bai-6')) {
      return [
        {
          id: 1,
          question: 'Chọn câu mời lịch sự nhất: "Cùng đi xem phim ngày mai không?"',
          subQuestion: 'Mẫu câu mời rủ lịch sự: Vませんか',
          options: [
            '明日、映画を見に行きます。',
            '明日、映画を見に行きましょう。',
            '明日、映画を見に行きませんか。',
            '明日、映画を見たいです。'
          ],
          correctAnswer: 2,
          explanation: 'Vませんか dùng để mời lịch sự. Vましょう là đề nghị chủ động hơn. (明日、映画を見に行きませんか).'
        },
        {
          id: 2,
          question: 'Điền dạng ましょう đúng: "Cùng bắt đầu nào! (始める)"',
          subQuestion: 'Lời đề nghị cùng làm: V(bỏ ます) + ましょう',
          options: [
            '始まりましょう。',
            '始めましょう。',
            '始めませんか。',
            '始めるましょう。'
          ],
          correctAnswer: 1,
          explanation: 'Vましょう: bỏ ます thêm ましょう. 始めます -> 始めましょう (Cùng bắt đầu nào!).'
        },
        {
          id: 3,
          question: 'Chọn câu đúng: "Trong các môn thể thao, bóng chày là thú vị nhất."',
          subQuestion: 'So sánh nhất: N1 で N2 が いちばん A です',
          options: [
            'スポーツは野球がいちばんおもしろいです。',
            'スポーツより野球がおもしろいです。',
            'スポーツで野球がいちばんおもしろいです。',
            'スポーツと野球がどちらがおもしろいですか。'
          ],
          correctAnswer: 2,
          explanation: 'So sánh nhất dùng: [Phạm vi] で [Đối tượng] が いちばん [Tính từ] です. (スポーツで野球がいちばんおもしろいです).'
        },
        {
          id: 4,
          question: 'Điền trợ từ: "Tàu Shinkansen ___ tàu thường nhanh hơn."',
          subQuestion: 'So sánh hơn: N1 は N2 より A です',
          options: [
            'に',
            'が',
            'より',
            'で'
          ],
          correctAnswer: 2,
          explanation: 'So sánh hơn dùng より: N1 は N2 より A です. (新幹線は電車より速いです).'
        },
        {
          id: 5,
          question: 'Chọn câu hỏi so sánh đúng: "Mùa hè và mùa đông, bạn thích mùa nào hơn?"',
          subQuestion: 'Câu hỏi so sánh 2 đối tượng: N1 と N2 と どちらが A ですか',
          options: [
            '夏か冬はどちらが好きですか。',
            '夏と冬とどちらが好きですか。',
            '夏より冬がいちばん好きですか。',
            '夏と冬でどちらが好きですか。'
          ],
          correctAnswer: 1,
          explanation: 'Câu hỏi so sánh 2 đối tượng: N1 と N2 と どちらが A ですか. (夏と冬とどちらが好きですか).'
        }
      ];
    }

    if (lessonSlug.includes('bai-7')) {
      return [
        {
          id: 1,
          question: 'Chọn trợ từ đúng: "部屋 _____ 猫 _____ います。" (Trong phòng có con mèo)',
          subQuestion: 'Sự hiện diện của sinh vật: Nơi chốn に Sinh vật が います',
          options: [
            'で / が',
            'に / が',
            'に / を',
            'へ / は'
          ],
          correctAnswer: 1,
          explanation: 'Cấu trúc sự hiện diện của sinh vật: [Địa điểm] に [Sinh vật] が います. (部屋に猫がいます).'
        },
        {
          id: 2,
          question: 'Chọn câu yêu cầu lịch sự: "Xin hãy đợi một chút."',
          subQuestion: 'Yêu cầu lịch sự: Vて ください — 待ちます (đợi)',
          options: [
            '少し待ちました。',
            '少し待ちますか。',
            '少し待ってください。',
            '少し待ちましょうか。'
          ],
          correctAnswer: 2,
          explanation: 'Vてください: 待ちます (nhóm 1) → thể て là 待って → 待ってください. (少し待ってください).'
        },
        {
          id: 3,
          question: 'Điền dạng tiếp diễn: "パクさんは電話を _____。 (đang gọi điện)"',
          subQuestion: 'Thì hiện tại tiếp diễn: Vて います',
          options: [
            'かけます',
            'かけました',
            'かけています',
            'かけてください'
          ],
          correctAnswer: 2,
          explanation: 'Vています diễn tả hành động đang diễn ra: かけます → かけて + います → かけています.'
        },
        {
          id: 4,
          question: 'Chọn câu đề nghị giúp đỡ phù hợp: "Để tôi bê hành lý giúp bạn nhé?"',
          subQuestion: 'Đề nghị giúp đỡ: Vましょうか',
          options: [
            '荷物を持ちませんか。',
            '荷物を持ちましょう。',
            '荷物を持ちましょうか。',
            '荷物を持ってください。'
          ],
          correctAnswer: 2,
          explanation: 'Vましょうか là đề nghị làm giúp người khác. Vましょう là đề nghị cùng làm. (荷物を持ちましょうか).'
        },
        {
          id: 5,
          question: 'Chọn câu đúng với かた: "Xin chỉ cho tôi cách đọc chữ Kanji này."',
          subQuestion: 'Cách thức: V(bỏ ます) + かた — 読みます (đọc)',
          options: [
            'この漢字の読みかたを教えてください。',
            'この漢字の読むかたを教えてください。',
            'この漢字の読むかたをしてください。',
            'この漢字の読みますかたを教えてください。'
          ],
          correctAnswer: 0,
          explanation: 'かた: bỏ ます thêm かた. 読みます → 読み + かた = 読みかた. (この漢字の読み方を教えてください).'
        }
      ];
    }

    // Default / Lesson 4
    return [
      {
        id: 1,
        question: 'Chọn dạng phủ định đúng của tính từ: この料理は辛い (cay) です。',
        subQuestion: 'Tính từ đuôi い khi phủ định sẽ biến đổi như thế nào?',
        options: [
          'この料理は辛ないです。',
          'この料理は辛くないです。',
          'この料理は辛じゃありません。',
          'この料理は辛くありませんでした。'
        ],
        correctAnswer: 1,
        explanation: 'Tính từ đuôi い khi chuyển sang phủ định: bỏ い thêm くない (辛い -> 辛くない).'
      },
      {
        id: 2,
        question: 'Từ "いい" (tốt) khi chuyển sang dạng phủ định là ngoại lệ nào?',
        subQuestion: 'Ngoại lệ quan trọng của tính từ đuôi い',
        options: [
          'いくない',
          'いいくない',
          'よくない',
          'いいじゃありません'
        ],
        correctAnswer: 2,
        explanation: 'いい là ngoại lệ, khi chia phủ định phải đổi thành よくない (hoặc よい -> よくない).'
      },
      {
        id: 3,
        question: 'Chọn cách dùng đúng với tính từ đuôi な: "佐藤先生は (nổi tiếng) です。"',
        subQuestion: 'Lưu ý tính từ 有名 (ゆうめい) là tính từ đuôi な',
        options: [
          '佐藤先生は有名いです。',
          '佐藤先生は有名です。',
          '佐藤先生は有名ないです。',
          '佐藤先生は有名くありません。'
        ],
        correctAnswer: 1,
        explanation: 'Tính từ đuôi な khi đi với です sẽ bỏ な: Danh từ + は + A-na (bỏ na) + です. (佐藤先生は有名です).'
      },
      {
        id: 4,
        question: 'Điền phó từ phù hợp vào câu: "昨日は _____ 寒くなかったです。" (không lạnh lắm)',
        subQuestion: 'Phó từ nào luôn đi kèm với dạng phủ định?',
        options: [
          'とても',
          'すこし',
          'あまり',
          'たいへん'
        ],
        correctAnswer: 2,
        explanation: 'あまり luôn đi với thể phủ định để diễn tả ý "không... lắm" (あまり寒くない).'
      },
      {
        id: 5,
        question: 'Chọn trợ từ thích hợp: "机の上 _____ 本 _____ あります。"',
        subQuestion: 'Mẫu câu diễn tả sự hiện diện của vật: N1 に N2 が あります',
        options: [
          'で / を',
          'に / が',
          'へ / は',
          'と / も'
        ],
        correctAnswer: 1,
        explanation: 'Cấu trúc sự tồn tại của vật: [Địa điểm] に [Vật] が あります. (机の上に本があります).'
      }
    ];
  }, [items, lessonSlug]);

  const handleStartPractice = () => {
    setIsPracticeOpen(true);
    setPracticeIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === practiceQuestions[practiceIndex].correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (practiceIndex + 1 < practiceQuestions.length) {
      setPracticeIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const upperCode = courseCode.toUpperCase();
  const bookmarkedCount = items.filter((it) => bookmarkedIds.has(it._id)).length;
  const progressPercent = items.length > 0 ? Math.round((bookmarkedCount / items.length) * 100) : 0;

  return (
    <>
      <Seo
        title={`${lesson?.title || 'Bài học'} - Ngữ Pháp ${upperCode} | Mindora AI`}
        description={lesson?.description || 'Học ngữ pháp tiếng Nhật N5 với cấu trúc chuẩn, giải nghĩa chi tiết, lưu ý và ví dụ phát âm.'}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/grammar/${lessonSlug}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: 'Ngữ Pháp (文法)', href: `/courses/${courseCode.toLowerCase()}/grammar` },
            { label: lesson ? `${lesson.lessonCode}: ${lesson.title}` : 'Bài học' }
          ]}
        />

        {/* Lesson Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 shadow-xl mb-8 border border-slate-700/50">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-[#F05A28]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F05A28] text-white shadow-xs">
                  {lesson?.lessonCode || 'LESSON'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/10">
                  Trình độ JLPT N5
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                  {items.length} mẫu ngữ pháp trọng điểm
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {lesson?.title || 'Đang tải bài học...'}
              </h1>
              <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                {lesson?.description || 'Học về tính từ đuôi い và な, phó từ mức độ, và cách diễn tả sự tồn tại với あります.'}
              </p>
            </div>

            {/* Quick Action & Progress Tracker */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-xs text-slate-400 font-medium">Ghi nhớ bài học</div>
                <div className="text-lg font-black text-[#F05A28]">
                  {bookmarkedCount} / {items.length} <span className="text-xs text-slate-400">({progressPercent}%)</span>
                </div>
              </div>

              <button
                onClick={handleStartPractice}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#F05A28] hover:bg-[#d94817] text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <Sparkles size={16} />
                <span>Làm bài tập củng cố</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-4 h-96 rounded-3xl bg-slate-200" />
            <div className="lg:col-span-8 h-96 rounded-3xl bg-slate-200" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Pattern Navigator */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 px-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Layers size={16} className="text-[#F05A28]" />
                  <span>Danh Sách {items.length} Mẫu Câu</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedIndex + 1}/{items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item, idx) => {
                  const isActive = idx === selectedIndex;
                  const isBookmarked = bookmarkedIds.has(item._id);

                  return (
                    <button
                      key={item._id || idx}
                      onClick={() => {
                        setSelectedIndex(idx);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group ${
                        isActive
                          ? 'bg-linear-to-r from-orange-50 to-orange-100/60 border-2 border-[#F05A28] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isActive
                              ? 'bg-[#F05A28] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="min-w-0">
                          <div className={`font-bold text-sm truncate font-japanese ${isActive ? 'text-[#F05A28]' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                            {item.pattern}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {item.meaning}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isBookmarked && (
                          <span className="text-amber-500" title="Đã ghi nhớ">
                            <BookmarkCheck size={16} />
                          </span>
                        )}
                        <ChevronRight
                          size={16}
                          className={`transition-transform duration-200 ${
                            isActive ? 'text-[#F05A28] translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Back to list button */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <Link
                  to={`/courses/${courseCode.toLowerCase()}/grammar`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại danh sách bài học</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Pattern Detailed Viewer */}
            <div className="lg:col-span-8 space-y-6">
              {currentItem ? (
                <>
                  {/* Pattern Header Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-[#F05A28] border border-orange-200">
                          Mẫu {selectedIndex + 1} / {items.length}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {currentItem.title}
                        </span>
                      </div>

                      {/* Header Actions: Ghi nhớ & Làm bài tập */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBookmark(currentItem._id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                            bookmarkedIds.has(currentItem._id)
                              ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {bookmarkedIds.has(currentItem._id) ? (
                            <>
                              <BookmarkCheck size={14} className="text-amber-600" />
                              <span>Đã ghi nhớ</span>
                            </>
                          ) : (
                            <>
                              <Bookmark size={14} />
                              <span>Thêm vào ghi nhớ</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleStartPractice}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <HelpCircle size={14} />
                          <span>Làm bài tập</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Pattern Formula */}
                    <div className="py-2">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-japanese mb-2">
                        {currentItem.pattern}
                      </h2>
                      <p className="text-base sm:text-lg font-bold text-[#F05A28]">
                        {currentItem.meaning}
                      </p>
                    </div>

                    {/* Formula Structures */}
                    {currentItem.structures && currentItem.structures.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-indigo-600" />
                          <span>Cấu Trúc Mẫu Câu</span>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {currentItem.structures.map((st, i) => (
                            <div
                              key={i}
                              className="px-4 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs sm:text-sm font-bold text-indigo-900 shadow-xs flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation & Usage Scope */}
                    {currentItem.explanation && (
                      <div className="mt-5 pt-5 border-t border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Giải Nghĩa & Phạm Vi Sử Dụng
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                          {currentItem.explanation}
                        </p>
                      </div>
                    )}

                    {/* Notes Alert Box */}
                    {currentItem.notes && currentItem.notes.length > 0 && (
                      <div className="mt-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 text-amber-900">
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-2">
                          <Lightbulb size={15} className="text-amber-600" />
                          <span>Lưu Ý Quan Trọng</span>
                        </div>
                        <ul className="space-y-1.5 text-xs sm:text-sm">
                          {currentItem.notes.map((note, idx) => (
                            <li key={idx} className="flex items-start gap-2 font-medium">
                              <span className="text-amber-600 font-bold mt-0.5">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Examples Section */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-0.5">
                          Luyện Đọc & Nghe
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          5 Câu Ví Dụ Thực Tế
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        Phát âm AI (1x / 2x)
                      </span>
                    </div>

                    <div className="space-y-4">
                      {currentItem.examples && currentItem.examples.map((ex, idx) => {
                        const isSpeaking1x =
                          playingState?.text === ex.japanese && playingState?.speed === 0.95;
                        const isSpeaking2x =
                          playingState?.text === ex.japanese && playingState?.speed === 1.7;

                        return (
                          <div
                            key={idx}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                              isSpeaking1x || isSpeaking2x
                                ? 'bg-orange-50/60 border-[#F05A28] shadow-md'
                                : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/70'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white text-slate-600 border border-slate-200 shadow-xs">
                                    Ví dụ {idx + 1}
                                  </span>
                                  <div className="text-xs font-semibold text-indigo-600 font-japanese">
                                    {ex.reading}
                                  </div>
                                </div>

                                <div className="text-lg sm:text-xl font-extrabold text-slate-900 font-japanese tracking-wide">
                                  {ex.japanese}
                                </div>

                                <div className="text-sm font-medium text-slate-600 pt-0.5">
                                  {ex.vietnamese}
                                </div>
                              </div>

                              {/* Audio Speed Controls */}
                              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                <button
                                  onClick={() => playAudio(ex.japanese, 0.95)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                    isSpeaking1x
                                      ? 'bg-[#F05A28] text-white shadow-md shadow-orange-500/30 scale-105'
                                      : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200/90 shadow-2xs'
                                  }`}
                                  title="Phát âm tốc độ bình thường (1x)"
                                >
                                  <Volume2 size={14} className={isSpeaking1x ? 'animate-bounce' : ''} />
                                  <span>1x</span>
                                </button>

                                <button
                                  onClick={() => playAudio(ex.japanese, 1.7)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                    isSpeaking2x
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                                      : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200/90 shadow-2xs'
                                  }`}
                                  title="Phát âm tốc độ nhanh luyện phản xạ (2x)"
                                >
                                  <Zap size={14} className={isSpeaking2x ? 'animate-spin' : ''} />
                                  <span>2x</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Previous / Next Pattern Navigation Footer */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      disabled={selectedIndex === 0}
                      onClick={() => {
                        setSelectedIndex((i) => Math.max(0, i - 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    >
                      <ArrowLeft size={16} />
                      <span>Mẫu trước</span>
                    </button>

                    <span className="text-xs font-semibold text-slate-500">
                      Mẫu {selectedIndex + 1} / {items.length}
                    </span>

                    <button
                      disabled={selectedIndex === items.length - 1}
                      onClick={() => {
                        setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E293B] hover:bg-slate-800 text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    >
                      <span>Mẫu tiếp theo</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
                  Không tìm thấy nội dung mẫu ngữ pháp.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Practice Modal */}
      {isPracticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F05A28] flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Bài Tập Củng Cố Ngữ Pháp
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {lesson?.title} (5 câu hỏi)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPracticeOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {!isQuizCompleted ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
                    <span>Câu hỏi {practiceIndex + 1} / {practiceQuestions.length}</span>
                    <span className="text-[#F05A28]">Điểm: {score}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 mb-6 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#F05A28] to-amber-500 transition-all duration-300 rounded-full"
                      style={{
                        width: `${((practiceIndex + 1) / practiceQuestions.length) * 100}%`
                      }}
                    />
                  </div>

                  {/* Question */}
                  <div className="mb-6">
                    <h5 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                      {practiceQuestions[practiceIndex].question}
                    </h5>
                    {practiceQuestions[practiceIndex].subQuestion && (
                      <p className="text-xs text-slate-500 font-medium">
                        {practiceQuestions[practiceIndex].subQuestion}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {practiceQuestions[practiceIndex].options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === practiceQuestions[practiceIndex].correctAnswer;

                      let btnStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 text-rose-800 border-rose-500 ring-2 ring-rose-500/20';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-orange-50 text-[#F05A28] border-[#F05A28] ring-2 ring-orange-500/20';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={isAnswerSubmitted}
                          className={`w-full text-left p-4 rounded-2xl border font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-japanese leading-relaxed">{opt}</span>
                          {isAnswerSubmitted && isCorrect && (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {isAnswerSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs text-slate-700 mb-4 animate-fadeIn">
                      <strong className="font-bold text-slate-900 block mb-1">Giải thích chi tiết:</strong>
                      {practiceQuestions[practiceIndex].explanation}
                    </div>
                  )}
                </>
              ) : (
                /* Completion Summary */
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">
                    Hoàn Thành Bài Luyện Tập!
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Bạn đã trả lời đúng <strong className="text-[#F05A28] font-black">{score} / {practiceQuestions.length}</strong> câu hỏi củng cố.
                  </p>

                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 text-xs text-[#F05A28] font-bold mb-6">
                    {score >= 4
                      ? 'Xuất sắc! Bạn đã nắm rất vững kiến thức ngữ pháp của bài này.'
                      : 'Hãy xem lại các lưu ý quan trọng và luyện tập thêm nhé!'}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={handleStartPractice}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      <span>Làm lại</span>
                    </button>

                    <button
                      onClick={() => setIsPracticeOpen(false)}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F05A28] text-white hover:bg-[#d94817] transition-colors cursor-pointer shadow-md"
                    >
                      <span>Hoàn tất & Tiếp tục học</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!isQuizCompleted && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => setIsPracticeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F05A28] hover:bg-[#d94817] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E293B] hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs"
                  >
                    {practiceIndex + 1 < practiceQuestions.length ? 'Câu tiếp theo →' : 'Xem kết quả'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
