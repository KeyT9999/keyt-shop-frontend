import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookMarked, Trophy, ArrowRight, Layers, LayoutGrid } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import { courseApi } from '../../features/courses/api/courseApi';
import type { CourseLesson } from '../../features/courses/types';
import { getCourseLanguage } from '../../features/courses/utils/courseLanguage';
import CourseBreadcrumb from '../../features/courses/components/common/CourseBreadcrumb';
import LessonCard from '../../features/courses/components/vocabulary/LessonCard';
import Seo from '../../components/Seo';

export default function VocabularyLessonListPage() {
  const navigate = useNavigate();
  const { courseCode = 'jpd123' } = useParams();
  const { token } = useAuthContext();

  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enwFilter, setEnwFilter] = useState<'all' | 'topics' | 'master'>('all');

  useEffect(() => {
    let isCancelled = false;

    const fetchLessons = async () => {
      setLoading(true);
      try {
        const data = await courseApi.getSectionLessons(courseCode, 'vocabulary', token);
        if (!isCancelled) {
          setLessons(data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to load vocabulary lessons:', err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchLessons();
    return () => {
      isCancelled = true;
    };
  }, [courseCode, token]);

  const upperCode = courseCode.toUpperCase();
  const language = getCourseLanguage(courseCode);
  const totalItems = lessons.reduce((acc, l) => acc + (l.itemCount || 0), 0);
  const isToeic = upperCode === 'TOEIC120';
  const isHackers = upperCode === 'TOEIC_HACKERS' || upperCode === 'TOEICHACKERS';
  const isBaKhi1 = upperCode === 'ENGBK' || upperCode === 'ENGBAKHI';
  const isBaKhi2 = upperCode === 'ENGBK2' || upperCode === 'ENGBAKHI2';
  const isBaKhi = isBaKhi1 || isBaKhi2;
  const isEnw = upperCode === 'ENW' || upperCode === 'ENGW';
  const fallbackLessonCount = upperCode === 'JPD113' ? 9 : upperCode.startsWith('HSK') ? 11 : upperCode === 'ENG1000' ? 50 : isToeic ? 6 : isHackers ? 30 : isBaKhi ? 12 : isEnw ? 11 : 14;
  const fallbackItemCount = upperCode === 'JPD113' ? 264 : upperCode === 'HSK1' ? 150 : upperCode === 'HSK2' ? 140 : upperCode === 'ENG1000' ? 1044 : isToeic ? 120 : isHackers ? 4768 : isBaKhi2 ? 1457 : isBaKhi1 ? 1017 : isEnw ? 199 : 310;

  const pageHeading = isToeic
    ? '120 Thành Ngữ & Cụm Từ TOEIC (6 Phần Quiz)'
    : isHackers
    ? 'Hackers TOEIC Vocabulary — 30 Chủ Đề (Day 1 – 30)'
    : isBaKhi2
    ? 'Từ Vựng Bá Khí 2 (12 Phần Quiz Theo Bài Đọc • Có IPA)'
    : isBaKhi1
    ? 'Từ Vựng Tiếng Anh Bá Khí (12 Phần Quiz Theo Bài Đọc)'
    : isEnw
    ? 'Từ Vựng Tiếng Anh ENW (10 Chủ Đề • 11 Phần Quiz)'
    : `Danh Sách Bài Học Từ Vựng ${upperCode}`;
  const unitName = isToeic || isBaKhi || isEnw ? 'phần / Quiz' : isHackers ? 'ngày / chủ đề' : 'chủ đề từ vựng';
  const termTypeName = isToeic ? 'Cụm từ' : isBaKhi || isEnw ? 'Từ & Cụm từ' : 'Từ vựng';

  return (
    <>
      <Seo
        title={`${isToeic ? '120 Thành Ngữ và Cụm Từ TOEIC (6 Quiz)' : isHackers ? 'Hackers TOEIC Vocabulary 30 Day (4.768 Từ Vựng)' : isBaKhi2 ? 'Từ Vựng Bá Khí 2 (1.457 Từ Có IPA & 12 Quiz)' : isBaKhi1 ? 'Từ Vựng Tiếng Anh Bá Khí (1.017 Từ & 12 Quiz)' : isEnw ? 'Từ Vựng Tiếng Anh ENW (10 Chủ Đề • 11 Quiz)' : `Từ Vựng ${language.languageName} ${upperCode}`} - Danh Sách ${lessons.length || fallbackLessonCount} Bài Học | Mindora AI`}
        description={isToeic ? 'Luyện tập 120 thành ngữ và cụm từ TOEIC qua 6 bài Quiz, Flashcard 3D, luyện gõ và phản xạ nhanh.' : isHackers ? 'Trọn bộ 30 ngày từ vựng Hackers TOEIC với 4.768 từ và cụm từ theo ngữ cảnh bài thi, luyện Flashcard 3D, làm Quiz trắc nghiệm và gõ từ.' : isBaKhi2 ? 'Chinh phục 1.457 từ vựng và cụm từ học thuật Từ Vựng Bá Khí 2 kèm phiên âm IPA chia thành 12 phần Quiz theo bài đọc.' : isBaKhi1 ? 'Chinh phục 1.017 từ vựng và cụm từ học thuật Tiếng Anh Bá Khí chia thành 12 phần Quiz theo ngữ cảnh bài đọc (Test 1 – Test 4).' : isEnw ? 'Chinh phục 199 từ vựng và cụm từ học thuật tiếng Anh viết luận ENW chia theo 10 chủ đề kèm bài Quiz tổng hợp toàn bộ.' : `Học từ vựng ${language.languageName.toLowerCase()} ${upperCode} qua các bài học với Flashcard 3D, luyện gõ và trắc nghiệm.`}
        canonicalPath={`/courses/${courseCode.toLowerCase()}/vocabulary`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <CourseBreadcrumb
          items={[
            { label: isToeic ? 'TOEIC 120' : isHackers ? 'Hackers TOEIC' : isBaKhi2 ? 'Từ Vựng Bá Khí 2' : isBaKhi1 ? 'Tiếng Anh Bá Khí' : isEnw ? 'Từ Vựng ENW' : upperCode, href: `/courses/${courseCode.toLowerCase()}` },
            { label: `${isToeic ? 'Thành Ngữ & Cụm Từ' : isBaKhi || isEnw ? 'Từ Vựng & Quiz' : 'Từ Vựng'} (${language.kind === 'chinese' ? '词汇' : language.kind === 'english' ? 'Vocabulary' : '単語'})` }
          ]}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F05A28] mb-1">
              <BookMarked size={15} />
              <span>Chương Trình {isToeic ? 'Thành Ngữ & Cụm Từ TOEIC' : isBaKhi2 ? 'Từ Vựng Bá Khí 2 (Có Phiên Âm IPA)' : isBaKhi1 ? 'Từ Vựng Tiếng Anh Bá Khí' : isEnw ? 'Từ Vựng Tiếng Anh ENW (10 Chủ Đề)' : `Từ Vựng ${language.languageName}`}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {pageHeading}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Bao gồm {lessons.length || fallbackLessonCount} {unitName}, {isToeic ? 'chia từ Trang 516 đến Trang 521 kèm 6 bài Quiz trắc nghiệm và phản xạ nhanh.' : isBaKhi ? 'trích xuất theo ngữ cảnh 12 bài đọc học thuật (Test 1 – Test 4) kèm trường hợp sử dụng và Quiz phản xạ.' : isEnw ? 'chia nhỏ thành 10 chủ đề học thuật chuyên sâu (mỗi bài ~20 từ) kèm 1 bài Quiz tổng hợp 199 từ.' : 'kết hợp luyện nhớ và phản xạ nhanh.'}
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-orange-50 text-[#F05A28] border border-orange-200/60 text-xs font-bold self-start sm:self-auto">
            {lessons.length || fallbackLessonCount} {isToeic || isBaKhi || isEnw ? 'Phần Quiz' : 'Bài học'} • {(totalItems || fallbackItemCount).toLocaleString('vi-VN')} {termTypeName}
          </div>
        </div>

        {/* ENW Group Filter Tabs */}
        {isEnw && !loading && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100/80 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEnwFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  enwFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <LayoutGrid size={14} className={enwFilter === 'all' ? 'text-[#F05A28]' : ''} />
                <span>Tất cả (11 Quiz)</span>
              </button>
              <button
                type="button"
                onClick={() => setEnwFilter('topics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  enwFilter === 'topics'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Layers size={14} className={enwFilter === 'topics' ? 'text-[#F05A28]' : ''} />
                <span>10 Chủ đề (~20 từ/bài)</span>
              </button>
              <button
                type="button"
                onClick={() => setEnwFilter('master')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  enwFilter === 'master'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Trophy size={14} className={enwFilter === 'master' ? 'text-[#F05A28]' : ''} />
                <span>Quiz Tổng Hợp (199 từ)</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline px-2">
              Bấm vào từng bài để luyện Flashcard 3D &amp; Trắc nghiệm
            </span>
          </div>
        )}

        {/* ENW Master Quiz Showcase Banner */}
        {isEnw && !loading && (enwFilter === 'all' || enwFilter === 'master') && (() => {
          const master = lessons.find((l) => l.order === 11 || (l.itemCount && l.itemCount >= 100));
          if (!master) return null;
          return (
            <div
              onClick={() => navigate(`/courses/${courseCode.toLowerCase()}/vocabulary/${master.slug}`)}
              className="mb-8 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-orange-500/30 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-orange-500/15 blur-3xl pointer-events-none group-hover:bg-orange-500/25 transition-all" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#F05A28] text-white shadow-xs">
                      🏆 QUIZ TỔNG HỢP • 10 CHỦ ĐỀ
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-orange-200 border border-white/15">
                      199 TỪ VỰNG FULL
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-300 transition-colors mb-2">
                    {master.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Trộn lẫn ngẫu nhiên cả 10 chủ đề học thuật viết luận. Tích hợp đầy đủ Flashcard 3D, Luyện gõ từ, Trắc nghiệm phản xạ, Smart Quiz và Lọc theo từng nhóm trực tiếp khi học.
                  </p>
                </div>
                <div className="shrink-0 flex items-center">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-2xl bg-[#F05A28] hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 group-hover:translate-x-1 transition-all cursor-pointer"
                  >
                    <span>Luyện Phản Xạ Tổng Hợp</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Section Heading for Topics (when viewing ENW all or topics) */}
        {isEnw && !loading && (enwFilter === 'all' || enwFilter === 'topics') && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Layers size={18} className="text-[#F05A28]" />
                10 Chủ Đề Học Thuật &amp; Viết Luận (~20 từ / chủ đề)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chia nhỏ gọn gàng, học chỉ 3–5 phút mỗi chủ đề để dễ nhớ sâu và đạt 100% điểm
              </p>
            </div>
            <span className="text-xs font-bold text-[#F05A28] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 hidden sm:inline">
              10 Chủ Đề
            </span>
          </div>
        )}

        {/* 3-Column Lesson Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons
              .filter((lesson) => {
                if (!isEnw) return true;
                if (enwFilter === 'master') return lesson.order === 11;
                if (enwFilter === 'topics') return lesson.order !== 11;
                // 'all': display topics in the grid (master is already hero banner)
                return lesson.order !== 11;
              })
              .map((lesson) => (
                <LessonCard
                  key={lesson._id}
                  lesson={lesson}
                  courseCode={courseCode}
                />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
