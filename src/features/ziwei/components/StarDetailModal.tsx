import { X, Sparkles, BookOpen, Star as StarIcon, ShieldCheck } from 'lucide-react';
import type { Palace, Star } from '../engine/types';
import {
  STAR_DETAILS_VI,
  translateStarName,
  translatePalaceName,
  translateBrightness,
  translateSiHua,
  PALACE_ROLE_VI,
} from '../utils/ziweiLocalization';

interface StarDetailModalProps {
  star: Star | null;
  palace: Palace | null;
  onClose: () => void;
  onAskAiAboutStar: (prompt: string) => void;
}

export default function StarDetailModal({
  star,
  palace,
  onClose,
  onAskAiAboutStar,
}: StarDetailModalProps) {
  if (!star || !palace) return null;

  const starNameVi = translateStarName(star.name);
  const palaceNameVi = translatePalaceName(palace.name);
  const detail = STAR_DETAILS_VI[star.name];
  const brightnessVi = star.brightnessRaw ? translateBrightness(star.brightnessRaw) : '';
  const siHuaVi = star.siHua ? `Hóa ${translateSiHua(star.siHua)}` : '';
  const palaceRole = PALACE_ROLE_VI[palace.name] || '';

  const handleAskAi = () => {
    const prompt = `Hãy phân tích chuyên sâu ý nghĩa của sao ${starNameVi} (${star.name})${
      brightnessVi ? ` ở trạng thái ${brightnessVi}` : ''
    }${siHuaVi ? ` đi kèm ${siHuaVi}` : ''} khi tọa thủ tại cung ${palaceNameVi} trên lá số của tôi theo học phái Thiên Kỷ của Nghê Hải Hạ.`;
    onClose();
    onAskAiAboutStar(prompt);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F05A28] text-white">
                Cung {palaceNameVi}
              </span>
              {brightnessVi && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Độ sáng: {brightnessVi}
                </span>
              )}
              {siHuaVi && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {siHuaVi}
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold mt-2 flex items-center gap-2">
              <StarIcon size={20} className="text-amber-400" />
              <span>
                Sao {starNameVi} ({star.name})
              </span>
            </h3>
            {detail && <p className="text-xs text-slate-300 mt-1">{detail.natureVi}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm text-slate-700">
          {detail ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1">Ngũ hành:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
                  {detail.elementVi}
                </span>
                {detail.keywordsVi.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 leading-relaxed">
                <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-purple-600" />
                  <span>Bản chất tinh diệu</span>
                </div>
                <p>{detail.summaryVi}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 leading-relaxed">
                <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-amber-700" />
                  <span>Lời giảng《Thiên Kỷ》— Nghê Hải Hạ</span>
                </div>
                <p className="text-amber-950 text-xs sm:text-sm">{detail.niHaixiaQuoteVi}</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/70 text-xs text-purple-950 italic">
                {detail.classicQuoteVi}
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed">
              <p>
                <strong>
                  Sao {starNameVi} ({star.name})
                </strong>{' '}
                đang tọa thủ tại <strong>Cung {palaceNameVi}</strong> (chủ quản: {palaceRole}).
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Nhấn nút bên dưới để AI kết hợp toàn bộ Tam Phương Tứ Chính của cung {palaceNameVi}{' '}
                và giải mã chi tiết tác động của sao {starNameVi} lên lá số của bạn.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleAskAi}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Nhờ AI Luận Giải Sao {starNameVi} Tại Cung {palaceNameVi}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

