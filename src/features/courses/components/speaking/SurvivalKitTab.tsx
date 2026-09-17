import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Volume2,
  Copy,
  Check,
  Award,
  Sparkles,
  Info,
  Layers,
  Clock
} from 'lucide-react';
import type { SurvivalKit } from '../../types/speaking';
import { speakingApi } from '../../api/speakingApi';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface SurvivalKitTabProps {
  courseCode?: string;
}

export const SurvivalKitTab: React.FC<SurvivalKitTabProps> = ({ courseCode = 'jpd123' }) => {
  const [data, setData] = useState<SurvivalKit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'manners' | 'rubric' | 'particles'>('manners');

  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await speakingApi.getSurvivalKit(courseCode);
        if (isMounted) setData(res);
      } catch (err) {
        console.error('Failed to load survival kit', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [courseCode]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#F05A28] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Đang tải cẩm nang sinh tồn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation Sub-tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl max-w-fit mx-auto border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveSection('manners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'manners'
              ? 'bg-white text-[#F05A28] shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#F05A28]" />
          Chào hỏi & Câu cứu cánh (Tác phong)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('rubric')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'rubric'
              ? 'bg-white text-[#F05A28] shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Award className="w-4 h-4 text-[#F05A28]" />
          Barem điểm FPT (100đ)
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('particles')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeSection === 'particles'
              ? 'bg-white text-[#F05A28] shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4 text-[#F05A28]" />
          Bí kíp 4 Trợ từ (で / に / が / と)
        </button>
      </div>

      {/* SECTION 1: MANNERS & RESCUE PHRASES */}
      {activeSection === 'manners' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200/80 flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-[#F05A28] rounded-xl shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                10 Điểm Tác Phong &amp; Phản Xạ Dễ Lấy Nhất
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Giám thị người Nhật và Việt Nam rất chú trọng lễ nghi (礼儀 - Reigi). Chỉ cần chào đúng lúc, dùng câu cứu cánh tự tin khi nghe chưa rõ thay vì im lặng quá 10 giây, bạn chắc chắn giữ trọn 10 điểm tác phong!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.manners.map((manner, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#F05A28]" />
                      {manner.situation}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => speak(manner.japanese)}
                        title="Nghe phát âm chuẩn"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(manner.japanese, idx)}
                        title="Sao chép câu tiếng Nhật"
                        className="p-2 text-slate-500 hover:text-[#F05A28] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-lg md:text-xl font-bold text-slate-900 tracking-wide mb-1 font-japanese">
                    {manner.japanese}
                  </div>
                  <div className="text-xs text-slate-400 font-mono italic mb-2">
                    {manner.romaji}
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-3">
                    {manner.vietnamese}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-amber-700 bg-amber-50/50 p-2.5 rounded-lg">
                  <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    <strong className="font-semibold text-amber-900">Mẹo FPT: </strong>
                    {manner.tip}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: RUBRIC SUMMARY */}
      {activeSection === 'rubric' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 bg-[#F05A28] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Quy định Khảo Thí FPT University
                </span>
                <h3 className="text-2xl font-bold mt-2">Barem Chấm Điểm Thi Nói JPD123</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Tổng 100 điểm • Đạt yêu cầu từ 50/100 trở lên • Thời gian thi 5-7 phút/thí sinh
                </p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-center min-w-[140px]">
                <div className="text-3xl font-black text-[#F05A28]">50+</div>
                <div className="text-xs text-slate-400 uppercase font-semibold mt-0.5">Điểm Qua Môn</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 1: Đọc Đoạn Văn</span>
                  <span className="text-lg font-bold text-amber-400">45đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Kanji gạch chân: 15đ</li>
                  <li>Từ Katakana: 10đ</li>
                  <li>Âm Hiragana & Ngữ điệu: 20đ</li>
                  <li>20 giây chuẩn bị, không đọc vấp</li>
                </ul>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 2: Hỏi &amp; Đáp Q&amp;A</span>
                  <span className="text-lg font-bold text-sky-400">45đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>3 câu hỏi x 15đ/câu</li>
                  <li>1 câu có tranh + 2 câu không tranh</li>
                  <li>Sai ngữ pháp: -10đ/câu</li>
                  <li>Sai từ vựng: -5 đến -7đ/câu</li>
                  <li>Sai trợ từ / đuôi ます: -2 đến -3đ</li>
                </ul>
              </div>

              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-300">Phần 3: Tác Phong</span>
                  <span className="text-lg font-bold text-emerald-400">10đ</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Chào khi vào phòng thi</li>
                  <li>Dùng câu cứu cánh khi cần nghe lại</li>
                  <li>Không ngập ngừng quá 10 giây/câu</li>
                  <li>Chào cảm ơn khi kết thúc</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Các Lỗi Mất Điểm Phổ Biến &amp; Cách Tránh
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-red-800 block">Lỗi im lặng quá 10 giây</span>
                <p className="text-slate-700 text-xs">
                  Khi không hiểu câu hỏi, nếu im lặng quá 10 giây giám thị sẽ chuyển câu khác và bạn bị trừ trọn 15đ của câu đó.
                </p>
                <div className="text-xs text-red-600 font-semibold pt-1">
                  Khắc phục: Nói ngay "すみません、もう一度お願いします。" để được giám thị đọc lại!
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-800 block">Lỗi quên chia đuôi ます / ました</span>
                <p className="text-slate-700 text-xs">
                  Câu hỏi thì quá khứ (ましたか) nhưng trả lời thì hiện tại (ます) hoặc dùng thể ngắn thân mật.
                </p>
                <div className="text-xs text-amber-700 font-semibold pt-1">
                  Khắc phục: Luôn lắng nghe kỹ đuôi câu của giám thị và giữ thể lịch sự chuẩn mực.
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-blue-800 block">Lỗi nhầm lẫn います và あります</span>
                <p className="text-slate-700 text-xs">
                  Người/Động vật dùng います, đồ vật/thực vật dùng あります. Nhầm lẫn bị trừ từ 5-10đ ngữ pháp.
                </p>
                <div className="text-xs text-blue-700 font-semibold pt-1">
                  Khắc phục: Người/Chó mèo = います, Sách/Bàn/Cây = あります.
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-800 block">Mẹo trả lời mở rộng để lấy điểm tối đa</span>
                <p className="text-slate-700 text-xs">
                  Sau khi trả lời câu hỏi trực tiếp, hãy thêm 1 câu lý do hoặc chi tiết (ví dụ: そして / それから / でも).
                </p>
                <div className="text-xs text-emerald-700 font-semibold pt-1">
                  Giám thị sẽ cộng thêm điểm lưu loát và phản xạ tự nhiên!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PARTICLES CHEAT SHEET */}
      {activeSection === 'particles' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200/80 flex items-start gap-4">
            <div className="p-3 bg-blue-600/10 text-blue-600 rounded-xl shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                Bảng So Sánh 4 Trợ Từ Hay Nhầm Lẫn Nhất (で / に / が / と)
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Trong bài thi nói và trắc nghiệm FE, việc chọn sai trợ từ khiến bạn mất từ 2-3 điểm/câu. Nắm chắc bảng tổng hợp này để phản xạ chính xác 100%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.particlesCheatSheet.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#F05A28] font-japanese font-black text-2xl flex items-center justify-center shadow-inner">
                    {item.particle}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Trợ từ 「 {item.particle} 」
                    </h4>
                    <span className="text-xs text-slate-400">
                      Có {item.meanings.length} vai trò trọng tâm trong JPD123
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {item.meanings.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#F05A28]"></span>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {m.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-japanese font-medium text-slate-900">
                          {m.example}
                        </p>
                        <button
                          type="button"
                          onClick={() => speak(m.example)}
                          title="Nghe câu mẫu"
                          className="p-1.5 text-slate-400 hover:text-[#F05A28] hover:bg-white rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
