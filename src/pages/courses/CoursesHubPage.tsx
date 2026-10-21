import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Languages,
  BookOpen,
  Headphones,
  Award
} from 'lucide-react';
import Seo from '../../components/Seo';

export default function CoursesHubPage() {
  const courses = [
    {
      code: 'JPD113',
      number: '01',
      title: 'Tiếng Nhật Sơ Cấp 1',
      japaneseTitle: '日本語初級 1',
      term: 'Kỳ 1 • Nhập Môn & Khởi Động',
      badge: 'Môn Học 1',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      heroGradient: 'from-blue-600 via-indigo-600 to-[#1E293B]',
      accentColor: 'text-blue-600',
      description:
        'Học phần tiếng Nhật đầu tiên tại Đại học FPT bao gồm Giáo trình Minna no Nihongo Bài 1 đến Bài 3. Xây dựng nền tảng ngữ pháp sơ cấp, hệ thống bảng chữ cái, chữ Hán nhập môn và luyện thi nói 1-1 với Giám thị AI.',
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
      number: '02',
      title: 'Tiếng Nhật Sơ Cấp 2',
      japaneseTitle: '日本語初級 2',
      term: 'Kỳ 2 • Nâng Cao N5',
      badge: 'Môn Học 2',
      badgeColor: 'bg-orange-50 text-[#F05A28] border-orange-200',
      heroGradient: 'from-[#F05A28] via-amber-600 to-[#1E293B]',
      accentColor: 'text-[#F05A28]',
      description:
        'Học phần tiếp nối tại Đại học FPT bao gồm Giáo trình Minna no Nihongo Bài 4 đến Bài 7. Mở rộng kho Hán tự, động từ chia thì, tính từ, so sánh hơn/nhất, cùng ngân hàng 73 câu trắc nghiệm FE và thi nói 1-1 chuyên sâu.',
      stats: {
        kanji: '42 Hán tự',
        vocab: '251 Từ vựng',
        grammar: '23 Mẫu câu',
        speaking: '4 Bài đọc & 18 Q&A',
        exams: '2 Đề thi FE 60p (73 câu)'
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
      title: 'Từ vựng tiếng Trung sơ cấp 1',
      topics: 11,
      vocabulary: 150,
      description:
        'Học chữ Hán giản thể và Pinyin qua flashcard 3D, luyện gõ, trắc nghiệm, ghép cặp và chế độ Nghe thụ động (Passive Listening).',
      href: '/courses/hsk1/vocabulary'
    },
    {
      code: 'HSK2',
      title: 'Từ vựng tiếng Trung sơ cấp 2',
      topics: 11,
      vocabulary: 140,
      description:
        'Ôn từ vựng theo 11 chủ đề HSK2 với chữ Hán giản thể, Pinyin, nghĩa tiếng Việt và hệ thống bài tập phản xạ toàn diện.',
      href: '/courses/hsk2/vocabulary'
    }
  ];

  const englishCourses = [
    {
      code: 'TOEIC HACKERS',
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
      code: 'TIẾNG ANH BÁ KHÍ',
      badge: 'MỚI • 12 QUIZ',
      title: 'Từ Vựng Tiếng Anh Bá Khí',
      topics: 12,
      topicUnit: 'bài đọc / Quiz',
      vocabulary: 1017,
      description:
        'Chinh phục 1.017 từ vựng & cụm từ học thuật chia thành 12 phần Quiz theo ngữ cảnh bài đọc (Test 1 – Test 4) kèm trường hợp sử dụng thực tế.',
      href: '/courses/engbk/vocabulary'
    },
    {
      code: 'TOEIC 120',
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
        title="Cổng Học Ngoại Ngữ – Tiếng Nhật FPT, Tiếng Trung HSK & Tiếng Anh TOEIC | KeyT Hub"
        description="Học tiếng Nhật JPD113/JPD123 & Kana Quiz, từ vựng tiếng Trung HSK1–2 có nghe thụ động, Hackers TOEIC Vocabulary 30 Day, 120 thành ngữ TOEIC và 1.000 từ tiếng Anh theo chủ đề."
        canonicalPath="/courses"
      />

      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        {/* Top Header Banner */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#F05A28] text-xs font-extrabold uppercase tracking-wider mb-4">
              <GraduationCap size={16} />
              <span>Học Viện Ngoại Ngữ Đa Quốc Gia • Nhật • Trung • Anh</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Cổng Học Ngoại Ngữ Tương Tác AI
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Chinh phục Tiếng Nhật FPT (<strong className="text-slate-800">JPD113 • JPD123 • Kana</strong>), Tiếng Trung Sơ Cấp (<strong className="text-slate-800">HSK 1 &amp; HSK 2</strong>) và Tiếng Anh Thực Chiến (<strong className="text-slate-800">Hackers TOEIC • 120 Idioms • 1.000 Từ</strong>) trên cùng một nền tảng.
            </p>
          </div>
        </div>

        {/* Quick Intro Banner: Kana Quiz */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#1E293B] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-9xl font-black text-white/5 select-none font-japanese pointer-events-none">
              あア
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/20 mb-3">
                <Sparkles size={14} />
                <span>Nhập Môn Miễn Phí • Tofugu Kana Quiz Style</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
                Học Thuộc Bảng Chữ Cái Hiragana &amp; Katakana
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
                Phương pháp gõ Romaji và phản xạ trực quan theo chuẩn Tofugu. Tự do lựa chọn hàng chữ, đổi font chữ Nhật Bản và kiểm tra ngay độ nhớ mặt chữ trước khi bước vào giáo trình chính thức.
              </p>
            </div>

            <Link
              to="/courses/kana"
              className="py-3.5 px-6 rounded-2xl bg-white hover:bg-blue-50 text-slate-900 font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer group"
            >
              <span>Vào Luyện Kana Ngay</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#388bea]" />
            </Link>
          </div>
        </div>

        {/* 1. Japanese course cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#F05A28]">
                Phân Khu 01 • Giáo Trình Đại Học FPT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                Tiếng Nhật Sơ Cấp &amp; Giám Thị AI 1-1
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {courses.map((c) => (
              <div
                key={c.code}
                className="group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
              >
                {/* Course Header Banner */}
                <div className={`p-6 sm:p-8 bg-gradient-to-br ${c.heroGradient} text-white relative overflow-hidden`}>
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
                    <span>{c.code}: {c.title}</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-xl">
                    {c.description}
                  </p>

                  {/* Stats Pill Row */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-white/15 text-center">
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                      <div className="text-xs font-bold text-slate-200">Hán Tự</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">{c.stats.kanji}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                      <div className="text-xs font-bold text-slate-200">Từ Vựng</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">{c.stats.vocab}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                      <div className="text-xs font-bold text-slate-200">Ngữ Pháp</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">{c.stats.grammar}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
                      <div className="text-xs font-bold text-slate-200">Thi Nói 1-1</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">{c.stats.speaking}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10 col-span-3 sm:col-span-1">
                      <div className="text-xs font-bold text-slate-200">Đề Thi FE</div>
                      <div className="text-xs sm:text-sm font-black text-white mt-0.5">{c.stats.exams}</div>
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
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
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
                        <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">Hán Tự</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Flashcard 3D</div>
                      </Link>

                      <Link
                        to={`${c.href}/vocabulary`}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-colors cursor-pointer group/link"
                      >
                        <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">Từ Vựng</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Gõ &amp; Trắc nghiệm</div>
                      </Link>

                      <Link
                        to={`${c.href}/grammar`}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-center transition-colors cursor-pointer group/link"
                      >
                        <div className="text-xs font-black text-slate-800 group-hover/link:text-[#F05A28]">Ngữ Pháp</div>
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

                  {/* Primary CTA Button */}
                  <Link
                    to={c.href}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1E293B] hover:bg-slate-900 group-hover:bg-[#F05A28] text-white font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
                  >
                    <span>Vào Không Gian Học Môn {c.code}</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Chinese Courses Section (HSK 1 & HSK 2) */}
          <div className="mt-14 pt-10 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                  Phân Khu 02 • Chữ Hán Giản Thể &amp; Pinyin
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  Tiếng Trung Sơ Cấp (HSK 1 &amp; HSK 2)
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold self-start sm:self-auto">
                <Headphones size={14} /> Hỗ trợ Nghe thụ động (Passive Listening)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {chineseCourses.map((course) => (
                <Link
                  key={course.code}
                  to={course.href}
                  className="group flex flex-col justify-between gap-5 rounded-3xl border border-emerald-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-xl cursor-pointer sm:flex-row sm:items-center sm:p-8"
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
                          {course.topics} chủ đề • {course.vocabulary} từ vựng
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
                  <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-5 py-3.5 text-sm font-black text-white transition-colors group-hover:bg-emerald-600 whitespace-nowrap">
                    <span>Vào học {course.code}</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* 3. English Courses Section (3 Balanced Columns) */}
          <div className="mt-14 pt-10 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Phân Khu 03 • Luyện Thi TOEIC &amp; Từ Vựng Thông Dụng
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                  Tiếng Anh Thực Chiến (6.949 Từ &amp; Cụm Từ)
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold self-start sm:self-auto">
                <Award size={14} /> Chuẩn Hackers TOEIC, Tiếng Anh Bá Khí &amp; IPA bản xứ
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {englishCourses.map((course) => (
                <Link
                  key={course.code}
                  to={course.href}
                  className="group flex flex-col justify-between rounded-3xl border border-blue-200/80 bg-white p-6 sm:p-7 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl cursor-pointer"
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

                  <span className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E293B] px-5 py-3.5 text-xs sm:text-sm font-black text-white transition-colors group-hover:bg-blue-600 whitespace-nowrap">
                    <span>Vào học {course.code}</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
