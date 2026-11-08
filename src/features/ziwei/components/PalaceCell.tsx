import type { Palace, Star } from '../engine/types';
import { STEMS, BRANCHES } from '../engine/constants';
import {
  translatePalaceName,
  translateStarName,
  translateBrightness,
  translateSiHua,
  translateStem,
  translateBranch,
} from '../utils/ziweiLocalization';

interface PalaceCellProps {
  palace: Palace;
  isSelected: boolean;
  isSanFang: boolean;
  isOpposite: boolean;
  bilingual: boolean;
  overlaySiHua?: Record<string, string>; // starNameCn -> '禄' | '权' | '科' | '忌'
  overlayPrefix?: string; // 'Đ.Hạn' | 'L.Niên'
  boshiName?: string;
  suiQianName?: string;
  onSelectPalace: () => void;
  onSelectStar: (star: Star, palace: Palace) => void;
  onSelectSiHua?: (starNameCn: string, siHuaCn: string) => void;
}

const SIHUA_BADGE_STYLE: Record<string, string> = {
  禄: 'bg-emerald-600 text-white border-emerald-700',
  权: 'bg-purple-600 text-white border-purple-700',
  科: 'bg-blue-600 text-white border-blue-700',
  忌: 'bg-red-600 text-white border-red-700',
};

const BRIGHTNESS_COLOR: Record<string, string> = {
  庙: 'text-amber-700 bg-amber-50 border-amber-200',
  旺: 'text-orange-700 bg-orange-50 border-orange-200',
  得: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  地: 'text-cyan-700 bg-cyan-50 border-cyan-200',
  利: 'text-teal-700 bg-teal-50 border-teal-200',
  平: 'text-slate-600 bg-slate-100 border-slate-200',
  闲: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  不: 'text-slate-500 bg-slate-100 border-slate-200',
  陷: 'text-rose-700 bg-rose-50 border-rose-200',
};

export default function PalaceCell({
  palace,
  isSelected,
  isSanFang,
  isOpposite,
  bilingual,
  overlaySiHua = {},
  overlayPrefix,
  boshiName,
  suiQianName,
  onSelectPalace,
  onSelectStar,
  onSelectSiHua,
}: PalaceCellProps) {
  const majorStars = palace.stars.filter((s) => s.type === 'major');
  const luckyStars = palace.stars.filter((s) => s.type === 'lucky');
  const shaStars = palace.stars.filter((s) => s.type === 'sha');
  const minorStars = palace.stars.filter((s) => s.type === 'minor');

  const stemCn = STEMS[palace.stem] || '';
  const branchCn = BRANCHES[palace.branch] || '';
  const ganZhiVi = `${translateStem(stemCn)} ${translateBranch(branchCn)}`;
  const palaceTitle = translatePalaceName(palace.name, bilingual);

  let cellBg = 'bg-white hover:bg-slate-50/90';
  let borderStyle = 'border-slate-200';
  if (isSelected) {
    cellBg = 'bg-purple-50/80';
    borderStyle = 'ring-2 ring-inset ring-purple-600 border-purple-600';
  } else if (isOpposite) {
    cellBg = 'bg-amber-50/60';
    borderStyle = 'ring-1 ring-inset ring-amber-400 border-amber-300';
  } else if (isSanFang) {
    cellBg = 'bg-indigo-50/45';
    borderStyle = 'ring-1 ring-inset ring-indigo-300 border-indigo-200';
  }

  return (
    <div
      onClick={onSelectPalace}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectPalace();
        }
      }}
      className={`relative flex flex-col justify-between p-2 sm:p-2.5 min-h-[145px] sm:min-h-[168px] transition-all duration-150 cursor-pointer select-none ${cellBg} ${borderStyle}`}
    >
      {/* Top section: Chính tinh & Phụ tinh */}
      <div className="space-y-1.5">
        {/* Chính Tinh */}
        <div className="space-y-1">
          {majorStars.length > 0 ? (
            majorStars.map((star) => {
              const overSh = overlaySiHua[star.name];
              const bRaw = star.brightnessRaw;
              return (
                <div
                  key={star.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStar(star, palace);
                  }}
                  className="flex flex-wrap items-center gap-1 group cursor-pointer"
                >
                  <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 group-hover:text-[#F05A28] transition-colors">
                    {translateStarName(star.name, bilingual)}
                  </span>

                  {bRaw && (
                    <span
                      className={`text-[10px] font-semibold px-1 py-0.2 rounded border ${
                        BRIGHTNESS_COLOR[bRaw] || 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}
                    >
                      {translateBrightness(bRaw)}
                    </span>
                  )}

                  {star.siHua && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSiHua?.(star.name, star.siHua!);
                      }}
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shadow-2xs ${
                        SIHUA_BADGE_STYLE[star.siHua] || ''
                      }`}
                      title={`Bản mệnh Hóa ${translateSiHua(star.siHua)}`}
                    >
                      {translateSiHua(star.siHua)}
                    </span>
                  )}

                  {overSh && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSiHua?.(star.name, overSh);
                      }}
                      className={`text-[9px] font-bold px-1 py-0.2 rounded border border-dashed ${
                        SIHUA_BADGE_STYLE[overSh] || ''
                      }`}
                      title={`${overlayPrefix || 'Vận'} Hóa ${translateSiHua(overSh)}`}
                    >
                      {overlayPrefix}:{translateSiHua(overSh)}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-[11px] italic text-slate-400">
              Vô Chính Diệu
              {palace.borrowedStars && palace.borrowedStars.length > 0 && (
                <div className="text-[10px] not-italic text-purple-700 font-medium">
                  Mượn: {palace.borrowedStars.map((s) => translateStarName(s)).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cát tinh & Sát tinh */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {luckyStars.map((star) => {
            const overSh = overlaySiHua[star.name];
            return (
              <span
                key={star.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStar(star, palace);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200/70 cursor-pointer"
              >
                {translateStarName(star.name)}
                {star.siHua && (
                  <strong className="ml-0.5 px-1 rounded bg-emerald-700 text-white text-[9px]">
                    {translateSiHua(star.siHua)}
                  </strong>
                )}
                {overSh && (
                  <strong className="ml-0.5 px-1 rounded bg-amber-600 text-white text-[9px]">
                    {translateSiHua(overSh)}
                  </strong>
                )}
              </span>
            );
          })}

          {shaStars.map((star) => (
            <span
              key={star.name}
              onClick={(e) => {
                e.stopPropagation();
                onSelectStar(star, palace);
              }}
              className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-700 bg-rose-50/90 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200/70 cursor-pointer"
            >
              {translateStarName(star.name)}
            </span>
          ))}
        </div>

        {/* Tạp diệu (Minor stars) */}
        {minorStars.length > 0 && (
          <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 pt-0.5">
            {minorStars.map((star) => (
              <span
                key={star.name}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStar(star, palace);
                }}
                className="text-[10px] text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                {translateStarName(star.name)}
              </span>
            ))}
          </div>
        )}

        {/* Tự Hóa (Self-SiHua do Can Cung kích phát) */}
        {palace.selfSihua && palace.selfSihua.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {palace.selfSihua.map((sh) => (
              <span
                key={`self-${sh.starName}-${sh.siHua}`}
                className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-300/80"
                title={`Can cung ${ganZhiVi} kích phát ${translateStarName(sh.starName)} Tự Hóa ${translateSiHua(sh.siHua)} tại bản cung`}
              >
                ↻ Tự Hóa {translateSiHua(sh.siHua)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Can Chi, Tên Cung, Đại Hạn */}
      <div className="mt-2 pt-1.5 border-t border-slate-100">
        {(boshiName || suiQianName) && (
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
            <span>{boshiName ? translateStarName(boshiName) : ''}</span>
            <span>{suiQianName ? translateStarName(suiQianName) : ''}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-500">
            {ganZhiVi}
            {bilingual ? ` (${stemCn}${branchCn})` : ''}
          </span>

          <div className="flex items-center gap-1">
            {palace.isMingGong && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#F05A28] text-white uppercase">
                Mệnh
              </span>
            )}
            {palace.isShenGong && (
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-700 text-white uppercase">
                Thân
              </span>
            )}
            {!palace.isMingGong && (
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">
                {palaceTitle}
              </span>
            )}
          </div>

          {palace.daXianAge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                palace.isCurrentDaXian
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'text-slate-500 bg-slate-100'
              }`}
              title="Đại hạn 10 năm"
            >
              {palace.daXianAge[0]}–{palace.daXianAge[1]}t
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

