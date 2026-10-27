import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Languages,
  BookOpen,
  Headphones,
  Award,
  Search,
  X,
  CheckSquare,
  Layers,
  Keyboard,
  BookMarked,
  Zap,
  Compass
} from 'lucide-react';
import Seo from '../../components/Seo';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
import CourseProgressBar from '../../features/courses/components/common/CourseProgressBar';

type HubLangFilter = 'all' | 'jp' | 'cn' | 'en';

interface QuizDeckConfig {
  id: string;
  courseCode: string;
  lang: 'jp' | 'cn' | 'en';
  langLabel: string;
  shortTitle: string;
  title: string;
  badge: string;
  badgeClass: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  lessonCount: number;
  wordCount: number;
  unitLabel: string;
  description: string;
  href: string;
  extraLinks?: Array<{
    label: string;
    sub: string;
    href: string;
    highlight?: boolean;
  }>;
}

const QUIZ_DECKS: QuizDeckConfig[] = [
  {
    id: 'engbk',
    courseCode: 'ENGBK',
    lang: 'en',
    langLabel: 'Tiếng Anh',
    shortTitle: 'Tiếng Anh Bá Khí 1 (12 Quiz)',
    title: 'Từ Vựng Tiếng Anh Bá Khí 1 — 12 Phần Quiz Theo Bài Đọc',
    badge: '12 QUIZ BÀI ĐỌC',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    accentText: 'text-indigo-700',
    accentBg: 'bg-indigo-600',
    accentBorder: 'border-indigo-200 hover:border-indigo-400',
    lessonCount: 12,
    wordCount: 1017,
    unitLabel: 'QUIZ',
    description:
      '1.017 từ vựng & cụm từ học thuật chia thành 12 phần Quiz theo ngữ cảnh bài đọc (Test 1 – Test 4) kèm chủ đề và trích dẫn câu thực tế.',
    href: '/courses/engbk/vocabulary'
  },
  {
    id: 'engbk2',
    courseCode: 'ENGBK2',
    lang: 'en',
    langLabel: 'Tiếng Anh',
    shortTitle: 'Từ Vựng Bá Khí 2 (12 Quiz • IPA)',
    title: 'Từ Vựng Bá Khí 2 — 12 Phần Quiz Có Phiên Âm IPA (1.457 Từ Mới)',
    badge: 'MỚI • CÓ IPA',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    accentText: 'text-purple-700',
    accentBg: 'bg-purple-600',
    accentBorder: 'border-purple-200 hover:border-purple-400',
    lessonCount: 12,
    wordCount: 1457,
    unitLabel: 'QUIZ',
    description:
      '1.457 từ vựng & cụm từ học thuật hoàn toàn mới (đã lọc bỏ từ trùng với Bá Khí 1), đầy đủ phiên âm IPA, loại từ và nghĩa tiếng Việt qua 12 bài đọc.',
    href: '/courses/engbk2/vocabulary'
  },
  {
    id: 'toeichackers',
    courseCode: 'TOEICHACKERS',
    lang: 'en',
    langLabel: 'Tiếng Anh',
    shortTitle: 'Hackers TOEIC (30 Day)',
    title: 'Hackers TOEIC Vocabulary — 30 Ngày Luyện Thi (Day 1 – 30)',
    badge: 'HOT • 30 DAY',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-600',
    accentBorder: 'border-blue-200 hover:border-blue-400',
    lessonCount: 30,
    wordCount: 4768,
    unitLabel: 'DAY',
    description:
      'Trọn bộ 30 chủ đề từ vựng Hackers TOEIC kinh điển với 4.768 từ & cụm từ, phiên âm IPA chuẩn và hệ thống Quiz phản xạ.',
    href: '/courses/toeichackers/vocabulary'
  },
  {
    id: 'toeic120',
    courseCode: 'TOEIC120',
    lang: 'en',
    langLabel: 'Tiếng Anh',
    shortTitle: '120 Thành Ngữ TOEIC (6 Quiz)',
    title: '120 Thành Ngữ & Cụm Từ TOEIC (Trang 516 – 521)',
    badge: '6 BÀI QUIZ',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    accentText: 'text-indigo-700',
    accentBg: 'bg-indigo-600',
    accentBorder: 'border-indigo-200 hover:border-indigo-400',
    lessonCount: 6,
    wordCount: 120,
    unitLabel: 'QUIZ',
    description:
      '120 thành ngữ và cụm từ sát đề thi TOEIC chia thành 6 bài Quiz thực hành (20 cụm từ / phần) giúp ghi nhớ siêu tốc.',
    href: '/courses/toeic120/vocabulary'
  },
  {
    id: 'eng1000',
    courseCode: 'ENG1000',
    lang: 'en',
    langLabel: 'Tiếng Anh',
    shortTitle: '1.000 Từ Tiếng Anh (50 Chủ Đề)',
    title: '1.000 Từ Vựng Tiếng Anh Thông Dụng Nhất (50 Chủ Đề)',
    badge: '50 CHỦ ĐỀ',
    badgeClass: 'bg-sky-100 text-sky-700 border-sky-200',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-600',
    accentBorder: 'border-sky-200 hover:border-sky-400',
    lessonCount: 50,
    wordCount: 1044,
    unitLabel: 'CHỦ ĐỀ',
    description:
      '1.044 từ vựng cốt lõi chia theo 50 chủ đề giao tiếp đời sống, gia đình, công sở kèm phiên âm IPA và âm thanh bản xứ.',
    href: '/courses/eng1000/vocabulary'
  },
  {
    id: 'jpd113',
    courseCode: 'JPD113',
    lang: 'jp',
    langLabel: 'Tiếng Nhật',
    shortTitle: 'JPD113 Sơ Cấp 1 (Bài 1–3)',
    title: 'Tiếng Nhật Sơ Cấp 1 — JPD113 (Minna no Nihongo Bài 1 – 3)',
    badge: 'FPT KỲ 1',
    badgeClass: 'bg-orange-100 text-[#F05A28] border-orange-200',
    accentText: 'text-[#F05A28]',
    accentBg: 'bg-[#F05A28]',
    accentBorder: 'border-orange-200 hover:border-[#F05A28]',
    lessonCount: 9,
    wordCount: 379,
    unitLabel: 'BÀI',
    description:
      '9 phần từ vựng & Quiz (379 từ), 35 Hán tự 3D, 21 mẫu ngữ pháp, Phòng thi nói AI 1-1 và 2 đề thi Final Exam 60 phút.',
    href: '/courses/jpd113/vocabulary',
    extraLinks: [
      { label: '35 Hán Tự JPD113', sub: 'Flashcard & Viết nét', href: '/courses/jpd113/kanji' },
      { label: '21 Ngữ Pháp JPD113', sub: 'Mẫu câu Bài 1–3', href: '/courses/jpd113/grammar' },
      { label: 'Thi Nói 1-1 Giám Thị AI', sub: 'Phòng thi JPD113', href: '/courses/jpd113/speaking', highlight: true },
      { label: '2 Đề Thi Thử FE 60p', sub: 'Chuẩn khảo thí FPT', href: '/courses/jpd113/exam' }
    ]
  },
  {
    id: 'jpd123',
    courseCode: 'JPD123',
    lang: 'jp',
    langLabel: 'Tiếng Nhật',
    shortTitle: 'JPD123 Sơ Cấp 2 (Bài 4–7)',
    title: 'Tiếng Nhật Sơ Cấp 2 — JPD123 (Minna no Nihongo Bài 4 – 7)',
    badge: 'FPT KỲ 2',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    accentText: 'text-rose-700',
    accentBg: 'bg-rose-600',
    accentBorder: 'border-rose-200 hover:border-rose-400',
    lessonCount: 14,
    wordCount: 303,
    unitLabel: 'BÀI',
    description:
      '14 phần từ vựng & Quiz (303 từ, có Từ vựng 07_ST1 & 07_ST2), 42 Hán tự N5, 23 mẫu ngữ pháp quá khứ/tính từ, Thi nói tranh AI 1-1 và 73 câu đề FE.',
    href: '/courses/jpd123/vocabulary',
    extraLinks: [
      { label: '42 Hán Tự JPD123', sub: 'Flashcard & Quiz N5', href: '/courses/jpd123/kanji' },
      { label: '23 Ngữ Pháp JPD123', sub: 'Mẫu câu Bài 4–7', href: '/courses/jpd123/grammar' },
      { label: 'Thi Nói Tranh AI 1-1', sub: 'Phòng thi JPD123', href: '/courses/jpd123/speaking', highlight: true },
      { label: 'Đề Thi FE (73 Câu)', sub: 'Thi thử 60 phút', href: '/courses/jpd123/exam' }
    ]
  },
  {
    id: 'kana',
    courseCode: 'KANA',
    lang: 'jp',
    langLabel: 'Tiếng Nhật',
    shortTitle: 'Bảng Chữ Cái Kana Quiz',
    title: 'Kana Quiz — Luyện Phản Xạ Gõ Romaji Hiragana & Katakana',
    badge: 'TOFUGU STYLE',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-600',
    accentBorder: 'border-amber-200 hover:border-amber-400',
    lessonCount: 3,
    wordCount: 214,
    unitLabel: 'CHẾ ĐỘ',
    description:
      'Luyện nhớ mặt chữ và gõ Romaji siêu tốc cho toàn bộ bảng Hiragana, Katakana, âm đục (Dakuon) và âm ghép (Yoon).',
    href: '/courses/kana'
  },
  {
    id: 'hsk1',
    courseCode: 'HSK1',
    lang: 'cn',
    langLabel: 'Tiếng Trung',
    shortTitle: 'Tiếng Trung HSK 1 (11 Quiz)',
    title: 'Từ Vựng Tiếng Trung Sơ Cấp 1 — HSK 1 (150 Từ • 11 Chủ Đề)',
    badge: 'HSK 1 • AUDIO',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-600',
    accentBorder: 'border-emerald-200 hover:border-emerald-400',
    lessonCount: 11,
    wordCount: 150,
    unitLabel: 'CHỦ ĐỀ',
    description:
      '150 từ vựng HSK 1 chia thành 11 chủ đề giao tiếp nền tảng. Có chữ Hán giản thể, Pinyin, Quiz và Nghe thụ động (Passive Listening).',
    href: '/courses/hsk1/vocabulary'
  },
  {
    id: 'hsk2',
    courseCode: 'HSK2',
    lang: 'cn',
    langLabel: 'Tiếng Trung',
    shortTitle: 'Tiếng Trung HSK 2 (11 Quiz)',
    title: 'Từ Vựng Tiếng Trung Sơ Cấp 2 — HSK 2 (140 Từ • 11 Chủ Đề)',
    badge: 'HSK 2 • AUDIO',
    badgeClass: 'bg-teal-100 text-teal-700 border-teal-200',
    accentText: 'text-teal-700',
    accentBg: 'bg-teal-600',
    accentBorder: 'border-teal-200 hover:border-teal-400',
    lessonCount: 11,
    wordCount: 140,
    unitLabel: 'CHỦ ĐỀ',
    description:
      '140 từ vựng HSK 2 mở rộng qua 11 chủ đề đời sống. Luyện Flashcard 3D, gõ chữ Hán, trắc nghiệm phản xạ và Nghe thụ động.',
    href: '/courses/hsk2/vocabulary'
  }
];

const KANA_STATIC_LESSONS: CourseLesson[] = [
  {
    _id: 'kana-hiragana',
    courseCode: 'KANA',
    sectionType: 'vocabulary',
    lessonCode: 'KANA-1',
    slug: 'hiragana',
    title: 'Quiz 1 — Bảng Chữ Mềm Hiragana (46 chữ cơ bản + Âm đục + Âm ghép)',
    description:
      'Luyện gõ Romaji phản xạ toàn bộ bảng chữ cái Hiragana chuẩn Tofugu. Cho phép chọn từng hàng chữ và đổi font chữ Nhật.',
    order: 1,
    itemCount: 107
  },
  {
    _id: 'kana-katakana',
    courseCode: 'KANA',
    sectionType: 'vocabulary',
    lessonCode: 'KANA-2',
    slug: 'katakana',
    title: 'Quiz 2 — Bảng Chữ Cứng Katakana (46 chữ cơ bản + Âm đục + Âm ghép)',
    description:
      'Chinh phục bảng chữ cứng Katakana dùng cho từ mượn tiếng nước ngoài. Phản xạ gõ Romaji không giới hạn thời gian.',
    order: 2,
    itemCount: 107
  },
  {
    _id: 'kana-all',
    courseCode: 'KANA',
    sectionType: 'vocabulary',
    lessonCode: 'KANA-3',
    slug: 'all',
    title: 'Quiz 3 — Tổng Hợp Hiragana & Katakana (Full 214 ký tự Kana)',
    description:
      'Bài test tổng hợp kết hợp ngẫu nhiên cả Hiragana và Katakana giúp làm chủ hoàn toàn mặt chữ Nhật Bản trước khi vào JPD113.',
    order: 3,
    itemCount: 214
  }
];

export default function CoursesHubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuthContext();
  const quizExplorerRef = useRef<HTMLDivElement>(null);

  const initialLangParam = (searchParams.get('lang') || 'all').toLowerCase();
  const initialLang: HubLangFilter =
    initialLangParam === 'jp' || initialLangParam === 'cn' || initialLangParam === 'en'
      ? initialLangParam
      : 'all';

  const [langFilter, setLangFilter] = useState<HubLangFilter>(initialLang);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('engbk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllLessons, setShowAllLessons] = useState<boolean>(false);

  // Cache lessons per deck id
  const [lessonsByDeck, setLessonsByDeck] = useState<Record<string, CourseLesson[]>>({
    kana: KANA_STATIC_LESSONS
  });
  const [loadingDeckId, setLoadingDeckId] = useState<string | null>(null);

  // Visible decks for current language tab
  const filteredDecks = useMemo(() => {
    if (langFilter === 'all') return QUIZ_DECKS;
    return QUIZ_DECKS.filter((d) => d.lang === langFilter);
  }, [langFilter]);

  // Keep selectedDeckId valid when switching language tab
  useEffect(() => {
    if (!filteredDecks.some((d) => d.id === selectedDeckId)) {
      if (filteredDecks.length > 0) {
        setSelectedDeckId(filteredDecks[0].id);
        setShowAllLessons(false);
      }
    }
  }, [filteredDecks, selectedDeckId]);

  const activeDeck = useMemo(
    () => QUIZ_DECKS.find((d) => d.id === selectedDeckId) || QUIZ_DECKS[0],
    [selectedDeckId]
  );

  // Fetch lessons for activeDeck if not cached yet
  useEffect(() => {
    if (!activeDeck || activeDeck.id === 'kana') return;
    if (lessonsByDeck[activeDeck.id]) return;

    let isCancelled = false;
    const loadLessons = async () => {
      setLoadingDeckId(activeDeck.id);
      try {
        const data = await courseApi.getSectionLessons(activeDeck.courseCode, 'vocabulary', token);
        if (!isCancelled) {
          setLessonsByDeck((prev) => ({
            ...prev,
            [activeDeck.id]: data || []
          }));
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(`Failed to load lessons for ${activeDeck.courseCode}:`, err);
        }
      } finally {
        if (!isCancelled) {
          setLoadingDeckId(null);
        }
      }
    };

    void loadLessons();
    return () => {
      isCancelled = true;
    };
  }, [activeDeck, lessonsByDeck, token]);

  const activeLessons = useMemo(() => {
    const raw = lessonsByDeck[activeDeck.id] || [];
    if (!searchQuery.trim()) return raw;
    const q = searchQuery.toLowerCase().trim();
    return raw.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description || '').toLowerCase().includes(q) ||
        l.lessonCode.toLowerCase().includes(q) ||
        String(l.order).includes(q)
    );
  }, [lessonsByDeck, activeDeck.id, searchQuery]);

  const displayedLessons = useMemo(() => {
    if (showAllLessons || searchQuery.trim()) return activeLessons;
    return activeLessons.slice(0, 18);
  }, [activeLessons, showAllLessons, searchQuery]);

  const handleLanguageChange = (lang: HubLangFilter) => {
    setLangFilter(lang);
    setShowAllLessons(false);
    if (lang === 'all') {
      searchParams.delete('lang');
    } else {
      searchParams.set('lang', lang);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleJumpToDeck = (deckId: string, lang?: HubLangFilter) => {
    if (lang) {
      setLangFilter(lang);
    }
    setSelectedDeckId(deckId);
    setShowAllLessons(true);
    quizExplorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const japaneseCourses = [
    {
      code: 'JPD113',
      deckId: 'jpd113',
      title: 'Tiếng Nhật Sơ Cấp 1',
      japaneseTitle: '日本語初級 1',
      term: 'Kỳ 1 • Nhập Môn & Khởi Động',
      heroGradient: 'from-blue-600 via-indigo-600 to-[#1E293B]',
      description:
        'Học phần tiếng Nhật đầu tiên tại Đại học FPT (Minna no Nihongo Bài 1 – 3). Gồm 9 bài Quiz từ vựng, 35 chữ Hán, 21 mẫu câu, thi nói 1-1 với Giám thị AI và 2 đề thi FE.',
      stats: {
        kanji: '35 Hán tự',
        vocab: '379 Từ vựng',
        grammar: '21 Mẫu câu',
        speaking: '4 Bài đọc & 18 Q&A',
        exams: '2 Đề thi FE 60p'
      },
      highlights: [
        '35 Chữ Hán cơ bản đầu tiên (Bài 1 - 3)',
        '21 Mẫu câu ngữ pháp khẳng định, phủ định, đại từ chỉ định',
        'Giả lập phòng thi nói 1-1 với Giám thị AI chuẩn FPT',
        'Bộ đề thi thử Final Exam trích xuất từ đề khảo thí thật'
      ],
      href: '/courses/jpd113'
    },
    {
      code: 'JPD123',
      deckId: 'jpd123',
      title: 'Tiếng Nhật Sơ Cấp 2',
      japaneseTitle: '日本語初級 2',
      term: 'Kỳ 2 • Nâng Cao N5',
      heroGradient: 'from-[#F05A28] via-amber-600 to-[#1E293B]',
      description:
        'Học phần tiếp nối tại Đại học FPT (Minna no Nihongo Bài 4 – 7). Gồm 14 bài Quiz từ vựng (có 07_ST1 & 07_ST2), 42 chữ Hán, động từ/tính từ, 73 câu trắc nghiệm FE và thi nói tranh AI 1-1.',
      stats: {
        kanji: '42 Hán tự',
        vocab: '303 Từ vựng',
        grammar: '23 Mẫu câu',
        speaking: '4 Bài đọc & 18 Q&A',
        exams: '2 Đề thi FE (73 câu)'
      },
      highlights: [
        '42 Chữ Hán nâng cao N5 (Bài 4 - 7)',
        '23 Mẫu câu ngữ pháp thì quá khứ, chia thể tính từ, so sánh',
        'Phòng thi nói 1-1 Giám thị AI có câu hỏi tranh minh họa',
        'Bộ đề thi Final Exam 73 câu hỏi khảo thí trường FPT'
      ],
      href: '/courses/jpd123'
    }
  ];

  const chineseCourses = [
    {
      code: 'HSK1',
      deckId: 'hsk1',
      title: 'Từ vựng tiếng Trung sơ cấp 1',
      topics: 11,
      vocabulary: 150,
      description:
        'Học chữ Hán giản thể và Pinyin qua 11 bài Quiz chủ đề, Flashcard 3D, luyện gõ, ghép cặp và chế độ Nghe thụ động (Passive Listening).',
      href: '/courses/hsk1/vocabulary'
    },
    {
      code: 'HSK2',
      deckId: 'hsk2',
      title: 'Từ vựng tiếng Trung sơ cấp 2',
      topics: 11,
      vocabulary: 140,
      description:
        'Ôn từ vựng theo 11 bài Quiz chủ đề HSK2 với chữ Hán giản thể, Pinyin, nghĩa tiếng Việt và hệ thống bài tập phản xạ toàn diện.',
      href: '/courses/hsk2/vocabulary'
    }
  ];

  const englishCourses = [
    {
      code: 'TIẾNG ANH BÁ KHÍ 1',
      deckId: 'engbk',
      badge: '12 QUIZ BÀI ĐỌC',
      title: 'Từ Vựng Tiếng Anh Bá Khí 1',
      topics: 12,
      topicUnit: 'bài đọc / Quiz',
      vocabulary: 1017,
      description:
        'Chinh phục 1.017 từ vựng & cụm từ học thuật chia thành 12 phần Quiz theo ngữ cảnh bài đọc (Test 1 – Test 4) kèm trường hợp sử dụng thực tế.',
      href: '/courses/engbk/vocabulary'
    },
    {
      code: 'TỪ VỰNG BÁ KHÍ 2',
      deckId: 'engbk2',
      badge: 'MỚI • 12 QUIZ IPA',
      title: 'Từ Vựng Bá Khí 2 (Có Phiên Âm IPA)',
      topics: 12,
      topicUnit: 'bài đọc / Quiz',
      vocabulary: 1457,
      description:
        '1.457 từ vựng & cụm từ học thuật hoàn toàn mới (đã lọc trùng với Bá Khí 1), đầy đủ phiên âm IPA, loại từ và nghĩa tiếng Việt qua 12 chủ đề.',
      href: '/courses/engbk2/vocabulary'
    },
    {
      code: 'TOEIC HACKERS',
      deckId: 'toeichackers',
      badge: 'HOT • 30 DAY',
      title: 'Hackers TOEIC Vocabulary',
      topics: 30,
      topicUnit: 'ngày luyện thi',
      vocabulary: 4768,
      description:
        '30 chủ đề từ vựng Hackers TOEIC kinh điển với 4.768 từ & cụm từ, kèm nghĩa tiếng Việt, phát âm IPA và đa dạng chế độ Flashcard, Quiz.',
      href: '/courses/toeichackers/vocabulary'
    },
    {
      code: 'TOEIC 120',
      deckId: 'toeic120',
      badge: '6 BÀI QUIZ',
      title: '120 Thành Ngữ & Cụm Từ TOEIC',
      topics: 6,
      topicUnit: 'phần thực hành',
      vocabulary: 120,
      description:
        'Nắm vững 120 thành ngữ & cụm từ TOEIC then chốt (Trang 516 - 521), tích hợp sẵn 6 bài Quiz kiểm tra phản xạ và Flashcard.',
      href: '/courses/toeic120/vocabulary'
    },
    {
      code: 'ENG 1000',
      deckId: 'eng1000',
      badge: '50 CHỦ ĐỀ',
      title: '1.000 Từ Tiếng Anh Thông Dụng',
      topics: 50,
      topicUnit: 'chủ đề giao tiếp',
      vocabulary: 1044,
      description:
        'Học theo 50 chủ đề thông dụng từ gia đình, đời sống đến công sở; đầy đủ phiên âm IPA, âm thanh bản xứ và nghĩa tiếng Việt.',
      href: '/courses/eng1000/vocabulary'
    }
  ];

  return (
    <>
      <Seo
        title="Trung Tâm Học & Chọn Quiz Nhật • Trung • Anh – JPD113/123, HSK 1–2, Tiếng Anh Bá Khí & TOEIC | KeyT Hub"
        description="Cổng chọn nhanh 140+ bài Quiz ngoại ngữ: Tiếng Nhật FPT (JPD113, JPD123, Kana Quiz), Tiếng Trung (HSK 1 & HSK 2), Tiếng Anh Bá Khí (1.017 từ), Hackers TOEIC (4.768 từ), 120 Idioms và 1.000 từ thông dụng."
        canonicalPath="/courses"
      />

      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        {/* ============================================================
            1. TOP ARGON HERO BANNER + LANGUAGE FILTER TABS
           ============================================================ */}
        <div className="bg-white border-b border-slate-200/80 relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[320px] rounded-full blur-3xl opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(240,90,40,0.12) 0%, rgba(59,130,246,0.08) 55%, transparent 75%)'
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#F05A28] text-xs font-extrabold uppercase tracking-wider mb-4">
              <GraduationCap size={16} />
              <span>Trung Tâm Học &amp; Chọn Quiz Đa Ngôn Ngữ • Nhật • Trung • Anh</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Chọn Bộ Quiz Ngoại Ngữ Để Học Ngay
            </h1>

            <p className="mt-3.5 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Tổng hợp toàn bộ <strong className="text-slate-900">10 bộ khóa học &amp; 156 bài Quiz</strong> thuộc{' '}
              <strong className="text-slate-900">Tiếng Nhật FPT (JPD113 • JPD123 • Kana)</strong>,{' '}
              <strong className="text-slate-900">Tiếng Trung (HSK 1 &amp; HSK 2)</strong> và{' '}
              <strong className="text-slate-900">
                Tiếng Anh (Bá Khí 1 &amp; 2 • Hackers TOEIC • 120 Thành Ngữ • 1.000 Từ)
              </strong>
              . Chọn ngôn ngữ và bấm trực tiếp vào bất kỳ bài Quiz nào bên dưới để bắt đầu!
            </p>

            {/* Quick Summary Stat Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold">
                <Zap size={13} className="text-[#F05A28]" /> 10 Bộ Khóa Học &amp; Quiz
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F05A28] border border-orange-200 text-xs font-bold">
                <span className="px-1.5 py-0.2 rounded bg-[#F05A28] text-white text-[10px] font-black">JP</span>
                Tiếng Nhật: 26 Quiz + Thi Nói AI + FE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-black">CN</span>
                Tiếng Trung: 22 Chủ Đề HSK 1–2 (290 Từ)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px] font-black">EN</span>
                Tiếng Anh: 110 Bài Quiz (8.406 Từ &amp; Cụm Từ)
              </span>
            </div>

            {/* 4 Main Language Filter Pills */}
            <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
              {[
                { id: 'all', label: 'Tất Cả (Nhật • Trung • Anh)', count: '10 Bộ Quiz' },
                { id: 'en', label: 'Tiếng Anh (Bá Khí 1–2 • TOEIC)', count: '5 Bộ • 110 Quiz' },
                { id: 'jp', label: 'Tiếng Nhật (JPD113 • 123 • Kana)', count: '3 Bộ • 26 Bài' },
                { id: 'cn', label: 'Tiếng Trung (HSK 1 & HSK 2)', count: '2 Bộ • 22 Bài' }
              ].map((tab) => {
                const active = langFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleLanguageChange(tab.id as HubLangFilter)}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        active ? 'bg-[#F05A28] text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================
            2. INTERACTIVE QUIZ EXPLORER (CHỌN TRỰC TIẾP TỪNG BÀI QUIZ)
           ============================================================ */}
        <div ref={quizExplorerRef} className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 scroll-mt-24">
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_18px_50px_-15px_rgba(15,23,42,0.07)] p-5 sm:p-7 lg:p-8">
            {/* Top Bar: Title + Search Input */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#F05A28] mb-1">
                  <Compass size={15} />
                  <span>Bảng Điều Khiển Chọn Nhanh Bài Quiz (1 Chạm Vào Học)</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Bước 1: Chọn Bộ Khóa Học • Bước 2: Bấm Vào Bài Quiz Muốn Luyện
                </h2>
              </div>

              {/* Search Input inside current deck */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Tìm bài trong ${activeDeck.shortTitle}...`}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#F05A28] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Xóa tìm kiếm"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Step 1: Deck Selector Pills */}
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Chọn bộ Quiz ({filteredDecks.length} bộ đang hiển thị):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredDecks.map((deck) => {
                  const isSelected = deck.id === activeDeck.id;
                  return (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeckId(deck.id);
                        setShowAllLessons(false);
                      }}
                      className={`group p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-md'
                          : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              isSelected ? 'bg-[#F05A28] text-white' : deck.badgeClass
                            }`}
                          >
                            {deck.langLabel}
                          </span>
                          <span
                            className={`text-[11px] font-bold ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {deck.lessonCount} {deck.unitLabel.toLowerCase()} •{' '}
                            {deck.wordCount.toLocaleString('vi-VN')} từ
                          </span>
                        </div>
                        <div
                          className={`text-sm font-extrabold truncate ${
                            isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#F05A28]'
                          }`}
                        >
                          {deck.shortTitle}
                        </div>
                      </div>
                      <ArrowRight
                        size={16}
                        className={`shrink-0 transition-transform ${
                          isSelected
                            ? 'text-[#F05A28] translate-x-0.5'
                            : 'text-slate-400 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Deck Info Bar */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${activeDeck.badgeClass}`}
                  >
                    {activeDeck.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {activeDeck.lessonCount} bài học / Quiz •{' '}
                    {activeDeck.wordCount.toLocaleString('vi-VN')} mục từ
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">{activeDeck.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {activeDeck.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to={activeDeck.href}
                  className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Mở Trang Riêng Bộ Này</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Extra Specialized Modules for JPD113 / JPD123 (Kanji, Grammar, AI Speaking, FE Exam) */}
            {activeDeck.extraLinks && activeDeck.extraLinks.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Học phần chuyên biệt đi kèm của {activeDeck.courseCode}:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {activeDeck.extraLinks.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        item.highlight
                          ? 'bg-orange-50/80 hover:bg-orange-100/80 border-orange-200 text-[#F05A28]'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-black">{item.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
                      </div>
                      <ArrowRight size={15} className="shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Grid of Individual Quizzes / Lessons */}
            {loadingDeckId === activeDeck.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-48 rounded-2xl bg-slate-100 border border-slate-200/60" />
                ))}
              </div>
            ) : displayedLessons.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-sm font-bold text-slate-700 mb-1">
                  Không tìm thấy bài Quiz nào khớp với &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-2 px-4 py-2 rounded-xl bg-[#F05A28] text-white text-xs font-bold cursor-pointer"
                >
                  Hiển thị lại tất cả bài Quiz
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedLessons.map((lesson) => {
                    const isKana = activeDeck.id === 'kana';
                    const percent = lesson.userProgress?.percentCompleted || 0;
                    const mastered = lesson.userProgress?.masteredItems || 0;
                    const baseLessonUrl = isKana
                      ? `/courses/kana/${lesson.slug}`
                      : `/courses/${activeDeck.courseCode.toLowerCase()}/vocabulary/${lesson.slug}`;

                    return (
                      <div
                        key={lesson._id || lesson.slug}
                        onClick={() =>
                          navigate(isKana ? baseLessonUrl : `${baseLessonUrl}?mode=multichoice`)
                        }
                        className="group rounded-2xl bg-white border border-slate-200/90 hover:border-[#F05A28] p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          {/* Top row: Badge + Word Count */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border ${activeDeck.badgeClass}`}
                            >
                              {activeDeck.lang === 'jp' && activeDeck.id !== 'kana'
                                ? `${lesson.lessonCode.toUpperCase().includes('_ST') ? 'QUIZ' : activeDeck.unitLabel} ${lesson.lessonCode}`
                                : `${activeDeck.unitLabel} ${lesson.order}`}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {lesson.itemCount}{' '}
                              {activeDeck.id === 'kana'
                                ? 'ký tự'
                                : activeDeck.id === 'toeic120'
                                ? 'cụm từ'
                                : 'mục từ'}
                            </span>
                          </div>

                          {/* Lesson Title */}
                          <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#F05A28] transition-colors line-clamp-2 mb-1.5">
                            {lesson.title}
                          </h4>

                          {/* Lesson Description */}
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                            {lesson.description}
                          </p>
                        </div>

                        <div>
                          {/* Progress Bar (for vocabulary courses) */}
                          {!isKana && (
                            <div className="mb-3 pt-2.5 border-t border-slate-100">
                              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 size={12} className="text-emerald-500" />
                                  Đã thuộc:{' '}
                                  <strong className="text-slate-800">
                                    {mastered} / {lesson.itemCount}
                                  </strong>
                                </span>
                                <span className="font-bold text-slate-800 font-mono">{percent}%</span>
                              </div>
                              <CourseProgressBar
                                percent={percent}
                                size="sm"
                                color="orange"
                                showPercentText={false}
                              />
                            </div>
                          )}

                          {/* 3 Direct Launch Mode Buttons */}
                          {isKana ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(baseLessonUrl);
                              }}
                              className="w-full py-2.5 px-3 rounded-xl bg-[#0F172A] group-hover:bg-[#F05A28] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Keyboard size={14} />
                              <span>Vào Luyện Gõ Kana Quiz</span>
                              <ArrowRight size={13} />
                            </button>
                          ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${baseLessonUrl}?mode=multichoice`);
                                }}
                                className="py-2 px-2 rounded-xl bg-[#F05A28] hover:bg-[#d94a1b] text-white text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="Làm Quiz trắc nghiệm"
                              >
                                <CheckSquare size={12} className="shrink-0" />
                                <span>Làm Quiz</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${baseLessonUrl}?mode=flashcard`);
                                }}
                                className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="Học qua Flashcard 3D"
                              >
                                <Layers size={12} className="shrink-0" />
                                <span>Flashcard</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${baseLessonUrl}?mode=typing`);
                                }}
                                className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                                title="Luyện gõ từ vựng"
                              >
                                <Keyboard size={12} className="shrink-0" />
                                <span>Luyện Gõ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Show All / Collapse Toggle if > 18 lessons */}
                {activeLessons.length > 18 && !searchQuery.trim() && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllLessons((prev) => !prev)}
                      className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-[#F05A28] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span>
                        {showAllLessons
                          ? 'Thu gọn danh sách bài Quiz'
                          : `Xem toàn bộ ${activeLessons.length} bài Quiz của ${activeDeck.shortTitle}`}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ============================================================
            3. PHÂN KHU TIẾNG ANH THỰC CHIẾN (4 KHÓA • 6.949 TỪ)
           ============================================================ */}
        {(langFilter === 'all' || langFilter === 'en') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Phân Khu Tiếng Anh • Học Thuật, Giao Tiếp &amp; Luyện Thi TOEIC
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  Tiếng Anh Thực Chiến (4 Bộ Quiz • 6.949 Từ &amp; Cụm Từ)
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold self-start sm:self-auto">
                <Award size={14} /> Tiếng Anh Bá Khí, Hackers TOEIC, 120 Idioms &amp; 1.000 Từ
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {englishCourses.map((course) => (
                <div
                  key={course.code}
                  className="group flex flex-col justify-between rounded-3xl border border-blue-200/80 bg-white p-6 sm:p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600">
                        <BookOpen size={22} />
                      </div>
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                        {course.badge}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-500 mb-1">
                      {course.topics} {course.topicUnit} • {course.vocabulary.toLocaleString('vi-VN')} mục từ
                    </div>

                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {course.title}
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-6">
                      {course.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleJumpToDeck(course.deckId)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-3 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                    >
                      <CheckSquare size={15} />
                      <span>Chọn Bài Quiz ({course.topics})</span>
                    </button>

                    <Link
                      to={course.href}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-4 py-3 text-xs sm:text-sm font-black text-white transition-colors hover:bg-blue-600 whitespace-nowrap cursor-pointer"
                    >
                      <span>Vào học {course.code}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            4. PHÂN KHU TIẾNG NHẬT FPT (JPD113, JPD123 & KANA QUIZ)
           ============================================================ */}
        {(langFilter === 'all' || langFilter === 'jp') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 pt-10 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#F05A28]">
                  Phân Khu Tiếng Nhật • Giáo Trình Đại Học FPT &amp; Tofugu Kana
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  Tiếng Nhật Sơ Cấp (JPD113 • JPD123 • Kana Quiz &amp; Giám Thị AI)
                </h2>
              </div>
              <Link
                to="/courses/kana"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#F05A28] text-xs font-extrabold hover:bg-orange-100 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Sparkles size={14} /> Luyện Bảng Chữ Cái Kana Quiz →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {japaneseCourses.map((c) => (
                <div
                  key={c.code}
                  className="group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  {/* Course Header Banner */}
                  <div
                    className={`p-6 sm:p-8 bg-gradient-to-br ${c.heroGradient} text-white relative overflow-hidden`}
                  >
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 font-black text-8xl text-white/5 select-none font-japanese pointer-events-none">
                      {c.code}
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs text-white border border-white/30">
                        {c.term}
                      </span>
                      <span className="text-sm font-black text-white/80 font-japanese">
                        {c.japaneseTitle}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2.5">
                      <span>
                        {c.code}: {c.title}
                      </span>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                      {c.description}
                    </p>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/15 text-center">
                      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                        <div className="text-xs font-bold text-slate-200">Hán Tự</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                          {c.stats.kanji}
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                        <div className="text-xs font-bold text-slate-200">Từ Vựng</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                          {c.stats.vocab}
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                        <div className="text-xs font-bold text-slate-200">Ngữ Pháp</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                          {c.stats.grammar}
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                        <div className="text-xs font-bold text-slate-200">Thi Nói 1-1</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                          {c.stats.speaking}
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10 col-span-3 sm:col-span-1">
                        <div className="text-xs font-bold text-slate-200">Đề Thi FE</div>
                        <div className="text-xs sm:text-sm font-black text-white mt-0.5">
                          {c.stats.exams}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Modules & Quick Links */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Nội Dung Cốt Lõi Học Phần {c.code}
                      </h4>
                      <ul className="space-y-2.5 mb-6">
                        {c.highlights.map((h, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                          >
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Sub-links grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                        <Link
                          to={`${c.href}/kanji`}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-colors cursor-pointer group/link"
                        >
                          <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">
                            Hán Tự
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Flashcard 3D</div>
                        </Link>

                        <Link
                          to={`${c.href}/vocabulary`}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-colors cursor-pointer group/link"
                        >
                          <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">
                            Từ Vựng
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Gõ &amp; Trắc nghiệm
                          </div>
                        </Link>

                        <Link
                          to={`${c.href}/grammar`}
                          className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-colors cursor-pointer group/link"
                        >
                          <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">
                            Ngữ Pháp
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Mẫu câu N5</div>
                        </Link>

                        <Link
                          to={`${c.href}/speaking`}
                          className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-center transition-colors cursor-pointer group/link"
                        >
                          <div className="text-xs font-black text-purple-700">Thi Nói 1-1</div>
                          <div className="text-[11px] text-purple-600 mt-0.5">Giám thị AI</div>
                        </Link>
                      </div>
                    </div>

                    {/* Primary CTA Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleJumpToDeck(c.deckId)}
                        className="py-3.5 px-4 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F05A28] border border-orange-200 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <BookMarked size={15} />
                        <span>Chọn Bài Quiz {c.code}</span>
                      </button>

                      <Link
                        to={c.href}
                        className="py-3.5 px-4 rounded-2xl bg-[#1E293B] hover:bg-[#F05A28] text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>Không Gian Môn {c.code}</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            5. PHÂN KHU TIẾNG TRUNG SƠ CẤP (HSK 1 & HSK 2)
           ============================================================ */}
        {(langFilter === 'all' || langFilter === 'cn') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 pt-10 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Phân Khu Tiếng Trung • Chữ Hán Giản Thể, Pinyin &amp; Audio
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  Tiếng Trung Sơ Cấp HSK 1 &amp; HSK 2 (22 Chủ Đề • 290 Từ)
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                <Headphones size={14} /> Có chế độ Nghe thụ động (Passive Listening)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {chineseCourses.map((course) => (
                <div
                  key={course.code}
                  className="group flex flex-col justify-between gap-5 rounded-3xl border border-emerald-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <Languages size={26} />
                    </div>
                    <div>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                          Tiếng Trung • {course.code}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {course.topics} chủ đề Quiz • {course.vocabulary} từ vựng
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {course.code}: {course.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleJumpToDeck(course.deckId)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-3 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                    >
                      <CheckSquare size={15} />
                      <span>Chọn Chủ Đề Quiz ({course.topics})</span>
                    </button>

                    <Link
                      to={course.href}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-5 py-3 text-xs sm:text-sm font-black text-white transition-colors hover:bg-emerald-600 whitespace-nowrap cursor-pointer"
                    >
                      <span>Vào học {course.code}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
