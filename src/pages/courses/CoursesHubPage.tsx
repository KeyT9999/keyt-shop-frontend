import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2
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

  return (
    <>
      <Seo
        title="Cổng Học Tập Tiếng Nhật FPT - Môn JPD113 & JPD123 | Mindora AI"
        description="Hệ thống luyện thi và học tập tiếng Nhật chuẩn chương trình Đại học FPT dành cho 2 môn học riêng biệt: JPD113 (Bài 1-3) và JPD123 (Bài 4-7)."
        canonicalPath="/courses"
      />

      <div className="min-h-screen bg-slate-50/60 pb-24">
        {/* Top Header Banner */}
        <div className="bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[#F05A28] text-xs font-bold uppercase tracking-wider mb-4">
              <GraduationCap size={16} />
              <span>Chương Trình Tiếng Nhật Khảo Thí Đại Học FPT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Cổng Môn Học Tiếng Nhật FPT
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Hai môn học độc lập trong lộ trình đào tạo chuẩn Đại học FPT. Vui lòng chọn đúng môn học bạn đang theo học để truy cập ngân hàng đề thi, bài giảng và phòng thi nói 1-1 tương ứng.
            </p>
          </div>
        </div>

        {/* 2 Distinct Course Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
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

                  <h2 className="text-2xl sm:text-3xl font-black mb-2 flex items-center gap-2.5">
                    <span>{c.code}: {c.title}</span>
                  </h2>

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
                        <div className="text-[11px] text-slate-500 mt-0.5">Gõ & Trắc nghiệm</div>
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
        </div>
      </div>
    </>
  );
}
