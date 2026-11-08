import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Star as StarIcon,
  ExternalLink,
  Sparkles,
  Library,
  Video,
  Info,
  Filter,
} from 'lucide-react';
import tianjiEntriesRaw from '../data/tianjiEntries.json';
import type { TianjiCorpusEntry } from '../engine/thirteen-dimensions';
import { guSuiFu } from '../data/classics/gusuifu';
import { ziWeiQuanShu } from '../data/classics/quanshu';
import { ziWeiQuanJi } from '../data/classics/quanji';
import { CLASSICS_KNOWLEDGE_VI } from '../data/classicsData';
import {
  STAR_DETAILS_VI,
  translateChineseAstrologyText,
} from '../utils/ziweiLocalization';

const TIANJI_ENTRIES = tianjiEntriesRaw as TianjiCorpusEntry[];

const TIANJI_BOOK_LABELS_VI: Record<string, string> = {
  all: 'Tất cả 9 Chuyên mục (1.848 mục)',
  '07-methodology': '1. Phương Pháp Luận & Triết Lý Thiên Kỷ',
  '01-stars': '2. Tính Chất 14 Chính Tinh & Phụ Tinh',
  '02-palaces': '3. Luận Giải 12 Cung Vị',
  '04-sihua': '4. Hệ Thống Tứ Hóa (Lộc – Quyền – Khoa – Kỵ)',
  '03-patterns': '5. Nhận Diện Cách Cục Cổ Điển',
  '05-illness': '6. Tật Ách & Đông Y Chẩn Bệnh',
  '11-fengshui': '7. Dương Trạch & Phong Thủy Địa Lý',
  '10-divination': '8. Bốc Dịch & Quẻ Tượng Lục Hào',
  '08-yili': '9. Dịch Lý & Ngũ Hành Sinh Khắc',
};

const QUICK_FILTER_TAGS: { labelVi: string; queryCn: string }[] = [
  { labelVi: 'Tử Vi', queryCn: '紫微' },
  { labelVi: 'Thiên Cơ', queryCn: '天机' },
  { labelVi: 'Thái Dương', queryCn: '太阳' },
  { labelVi: 'Vũ Khúc', queryCn: '武曲' },
  { labelVi: 'Thiên Đồng', queryCn: '天同' },
  { labelVi: 'Liêm Trinh', queryCn: '廉贞' },
  { labelVi: 'Thiên Phủ', queryCn: '天府' },
  { labelVi: 'Thái Âm', queryCn: '太阴' },
  { labelVi: 'Tham Lang', queryCn: '贪狼' },
  { labelVi: 'Cự Môn', queryCn: '巨门' },
  { labelVi: 'Thiên Tướng', queryCn: '天相' },
  { labelVi: 'Thiên Lương', queryCn: '天梁' },
  { labelVi: 'Thất Sát', queryCn: '七杀' },
  { labelVi: 'Phá Quân', queryCn: '破军' },
  { labelVi: 'Hóa Lộc', queryCn: '化禄' },
  { labelVi: 'Hóa Kỵ', queryCn: '化忌' },
  { labelVi: 'Cung Phu Thê', queryCn: '夫妻' },
  { labelVi: 'Cung Phúc Đức', queryCn: '福德' },
  { labelVi: 'Cung Tật Ách', queryCn: '疾厄' },
  { labelVi: 'Cung Tài Bạch', queryCn: '财帛' },
];

const CLASSIC_BOOKS = [
  {
    book: guSuiFu,
    titleVi: '《Cốt Tủy Phú》 (Minh Đại — Phú Cốt Lõi Tử Vi)',
    descVi:
      'Bản phú cô đọng và quyền uy nhất của Tử Vi Đẩu Số (khoảng 1.500 chữ), được Nghê Hải Hạ viện dẫn xuyên suốt bộ《Thiên Kỷ》.',
  },
  {
    book: ziWeiQuanShu,
    titleVi: '《Tử Vi Đẩu Số Toàn Thư》 (Hi Di Trần Đoàn — La Hồng Tiên Biên Tập)',
    descVi:
      'Bộ kinh điển gốc của Tử Vi Đẩu Số thời Minh, ghi chép đầy đủ khẩu quyết an sao, hình tính chư tinh và luận đoán 12 cung.',
  },
  {
    book: ziWeiQuanJi,
    titleVi: '《Đẩu Số Toàn Tập》 (Cổ Bản Khảo Chứng)',
    descVi:
      'Tuyển tập các ca quyết, phú văn và luận đoán chuyên sâu bổ sung cho Toàn Thư.',
  },
];

interface ClassicsLibraryPanelProps {
  onAskAiQuote?: (prompt: string) => void;
}

export default function ClassicsLibraryPanel({ onAskAiQuote }: ClassicsLibraryPanelProps) {
  const [subTab, setSubTab] = useState<'tianji1848' | 'threeBooks' | 'encyclopedia'>('tianji1848');
  const [selectedBookCategory, setSelectedBookCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeClassicSlug, setActiveClassicSlug] = useState<string>('gusuifu');
  const [visibleLimit, setVisibleLimit] = useState<number>(30);

  // Lọc 1.848 mục bài giảng Nghê Hải Hạ
  const filteredTianjiEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TIANJI_ENTRIES.filter((entry) => {
      if (selectedBookCategory !== 'all' && entry.book !== selectedBookCategory) {
        return false;
      }
      if (!q) return true;
      const rawText = `${entry.h2} ${entry.h3} ${entry.quote} ${entry.note}`.toLowerCase();
      if (rawText.includes(q)) return true;
      const viText = translateChineseAstrologyText(
        `${entry.h2} ${entry.h3} ${entry.quote}`
      ).toLowerCase();
      return viText.includes(q);
    });
  }, [selectedBookCategory, searchQuery]);

  const currentClassicBookObj = useMemo(
    () =>
      CLASSIC_BOOKS.find((b) => b.book.slug === activeClassicSlug) || CLASSIC_BOOKS[0],
    [activeClassicSlug]
  );

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#F05A28]">
              <Library size={15} />
              <span>Kho Học Liệu &amp; Truy Xuất Nguồn Gốc Cổ Tịch</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Thư Viện《Thiên Kỷ》Nghê Hải Hạ (1.848 Mục Có Mốc Video) &amp; Tam Đại Cổ Tịch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Tra cứu trực tiếp theo tên Sao, Cung vị, Tứ Hóa, Cách Cục với liên kết dẫn nguồn tới
              video bài giảng gốc và nguyên bản cổ thư.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSubTab('tianji1848')}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                subTab === 'tianji1848'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Video size={15} className="text-[#F05A28]" />
              <span>1.848 Khẩu Quyết《Thiên Kỷ》</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('threeBooks')}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                subTab === 'threeBooks'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={15} className="text-purple-600" />
              <span>3 Bộ Cổ Tịch Nguyên Điển</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('encyclopedia')}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                subTab === 'encyclopedia'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <StarIcon size={15} className="text-amber-500" />
              <span>Bách Khoa 14 Chính Tinh</span>
            </button>
          </div>
        </div>

        {/* Ghi chú bản quyền học thuật phi thương mại */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-950">
          <Info size={16} className="text-[#F05A28] shrink-0 mt-0.5" />
          <div>
            <strong>Chú dẫn bản quyền &amp; Học thuật:</strong> Kho trích dẫn lời giảng《Thiên Kỷ》của
            cố đạo sư Nghê Hải Hạ kèm mốc thời gian video được tích hợp phục vụ mục đích nghiên cứu,
            đối chiếu học thuật phi thương mại. Các cổ tịch《Tử Vi Đẩu Số Toàn Thư》,《Cốt Tủy Phú》và
            《Đẩu Số Toàn Tập》thuộc phạm vi di sản văn hóa công cộng (Public Domain).
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: 1.848 KHẨU QUYẾT BÀI GIẢNG THIÊN KỶ */}
      {subTab === 'tianji1848' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
          {/* Thanh tìm kiếm & Bộ lọc chuyên mục */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-7 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(30);
                }}
                placeholder="Tìm theo tên Sao, Cung vị, Tứ Hóa (VD: Thái Âm, Hóa Kỵ, Phu Thê, Phá Quân)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="lg:col-span-5 flex items-center gap-2">
              <Filter size={15} className="text-slate-500 shrink-0" />
              <select
                value={selectedBookCategory}
                onChange={(e) => {
                  setSelectedBookCategory(e.target.value);
                  setVisibleLimit(30);
                }}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:border-purple-600 focus:outline-none cursor-pointer"
              >
                {Object.entries(TIANJI_BOOK_LABELS_VI).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Từ khóa chọn nhanh */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Lọc nhanh theo Sao/Cung:</span>
            {QUICK_FILTER_TAGS.map((tag) => {
              const active = searchQuery === tag.labelVi || searchQuery === tag.queryCn;
              return (
                <button
                  key={tag.queryCn}
                  type="button"
                  onClick={() => {
                    setSearchQuery(active ? '' : tag.labelVi);
                    setVisibleLimit(30);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#F05A28] text-white border-[#F05A28]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {tag.labelVi}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
            <span>
              Tìm thấy <strong className="text-slate-900">{filteredTianjiEntries.length}</strong>{' '}
              đoạn ghi chép bài giảng《Thiên Kỷ》
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#F05A28] font-bold hover:underline cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Danh sách Kết quả */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredTianjiEntries.slice(0, visibleLimit).map((entry, idx) => {
              const quoteVi = translateChineseAstrologyText(entry.quote);
              const topicBreadcrumbVi = translateChineseAstrologyText(
                `${entry.h2} • ${entry.h3}`
              );
              const videoUrl = `https://www.bilibili.com/video/${entry.bvid}?p=${entry.part}`;
              return (
                <div
                  key={`${entry.bvid}-${entry.t_hms}-${idx}`}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 flex flex-col justify-between gap-3 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold">
                        {TIANJI_BOOK_LABELS_VI[entry.book] || entry.book}
                      </span>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Tập {entry.part} • {entry.t_hms}
                      </span>
                    </div>

                    <div className="text-xs font-extrabold text-slate-700">
                      {topicBreadcrumbVi}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      “{quoteVi}”
                    </p>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Nguyên văn: {entry.quote}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#F05A28]"
                    >
                      <Video size={12} />
                      <span>Video gốc ({entry.bvid})</span>
                      <ExternalLink size={10} />
                    </a>

                    {onAskAiQuote && (
                      <button
                        type="button"
                        onClick={() =>
                          onAskAiQuote(
                            `Trong《Thiên Kỷ》, thầy Nghê Hải Hạ có giảng: “${quoteVi}” (${entry.quote}). Hãy giải thích sâu câu khẩu quyết này và đối chiếu xem nó ứng nghiệm thế nào trên lá số của tôi.`
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-purple-700 hover:text-[#F05A28] cursor-pointer"
                      >
                        <Sparkles size={12} />
                        <span>Đối chiếu vào lá số của tôi</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTianjiEntries.length > visibleLimit && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((v) => v + 40)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold cursor-pointer"
              >
                Xem thêm ({filteredTianjiEntries.length - visibleLimit} mục còn lại)
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: 3 BỘ CỔ TỊCH NGUYÊN ĐIỂN */}
      {subTab === 'threeBooks' && (
        <div className="space-y-5">
          {/* Chọn Sách */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {CLASSIC_BOOKS.map((item) => {
              const selected = item.book.slug === activeClassicSlug;
              return (
                <button
                  key={item.book.slug}
                  type="button"
                  onClick={() => setActiveClassicSlug(item.book.slug)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-sm font-extrabold">{item.titleVi}</div>
                  <p
                    className={`text-xs leading-relaxed ${
                      selected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {item.descVi}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Nội dung các chương của sách đang chọn */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            {currentClassicBookObj.book.chapters.map((ch, cIdx) => (
              <div
                key={cIdx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3"
              >
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Chương {cIdx + 1}: {translateChineseAstrologyText(ch.title)} ({ch.title})
                  </h3>
                  {ch.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {translateChineseAstrologyText(ch.subtitle)}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  {ch.paragraphs.map((p) => {
                    const viText = translateChineseAstrologyText(p.text);
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200/90 space-y-1.5 text-xs"
                      >
                        <div className="text-slate-900 font-semibold leading-relaxed">
                          “{viText}”
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          Nguyên văn cổ tịch: {p.text}
                        </div>
                        {onAskAiQuote && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                onAskAiQuote(
                                  `Hãy giảng giải câu cổ phú trong ${currentClassicBookObj.titleVi}: “${viText}” (${p.text}) và phân tích xem câu phú này ứng dụng thế nào trên lá số của tôi.`
                                )
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-[#F05A28] cursor-pointer"
                            >
                              <Sparkles size={11} />
                              <span>Nhờ AI giảng giải &amp; đối chiếu lá số</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: BÁCH KHOA 14 CHÍNH TINH & CHUYÊN ĐỀ TINH HOA */}
      {subTab === 'encyclopedia' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <StarIcon size={19} className="text-amber-500" />
              <span>Bách Khoa 14 Chính Tinh Bắc Đẩu &amp; Nam Đẩu</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(STAR_DETAILS_VI).map((st) => (
                <div
                  key={st.nameCn}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-white transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-slate-900">
                      {st.nameVi} ({st.nameCn})
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      {st.elementVi}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#F05A28]">{st.natureVi}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.summaryVi}</p>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-950">
                    {st.niHaixiaQuoteVi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen size={19} className="text-[#F05A28]" />
              <span>Tổng Hợp Nguyên Lý Cốt Lõi《Thiên Kỷ》</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CLASSICS_KNOWLEDGE_VI.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {sec.category}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-2">
                      {sec.titleVi}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{sec.summaryVi}</p>
                  </div>

                  <div className="space-y-2.5">
                    {sec.quotes.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 space-y-1.5 text-xs"
                      >
                        <div className="text-slate-400 font-mono text-[11px]">{q.originalCn}</div>
                        <div className="text-slate-900 font-semibold leading-relaxed">
                          “{q.translationVi}”
                        </div>
                        <div className="text-purple-800 bg-purple-50/70 p-2 rounded-lg">
                          <strong>Ứng dụng:</strong> {q.applicationVi}
                        </div>
                        <div className="text-[10px] text-slate-400 text-right">{q.sourceRef}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
