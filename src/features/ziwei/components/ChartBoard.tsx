import { useState, useMemo } from 'react';
import {
  Compass,
  Download,
  Languages,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  UserCheck,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ZiweiChart, Palace, Star, SiHua } from '../engine/types';
import { STEMS, BRANCHES, SI_HUA_TABLE } from '../engine/constants';
import { boshiShenName, suiQianShenName } from '../engine/shier-shen';
import {
  CHILDHOOD_DAXIAN_INDEX,
  getChildhoodYears,
  getChildhoodDaXianPalace,
  getDaXianYears,
  getDaXianIndexForYear,
} from '../engine/yunxian-context';
import { getSiHuaByStem, getDaXianSiHua, getLiuNianSiHua } from '../engine/sihua';
import {
  translateStem,
  translateBranch,
  translateGanZhi,
  translateWuxingJu,
  translateStarName,
  translateBrightness,
  translateYinYangGender,
  translatePalaceName,
  translateSiHua,
  HOUR_BRANCH_LABELS_VI,
} from '../utils/ziweiLocalization';
import PalaceCell from './PalaceCell';

export type ZiweiTimeView = 'mingpan' | 'daxian' | 'liunian';

interface ChartBoardProps {
  chart: ZiweiChart;
  selectedPalace: Palace | null;
  onSelectPalace: (palace: Palace | null) => void;
  onSelectStar: (star: Star, palace: Palace) => void;
  onSelectSiHua?: (starNameCn: string, siHuaCn: string, view: ZiweiTimeView) => void;
  onOpenShareModal: () => void;
  onOpenSchoolConfig?: () => void;
  customSchoolRulesCount?: number;
  onSaveChart?: () => void;
  isSavingChart?: boolean;
}

const BRANCH_GRID_POS: Record<number, [number, number]> = {
  5: [1, 1], // Tỵ
  6: [1, 2], // Ngọ
  7: [1, 3], // Mùi
  8: [1, 4], // Thân
  4: [2, 1], // Thìn
  9: [2, 4], // Dậu
  3: [3, 1], // Mão
  10: [3, 4], // Tuất
  2: [4, 1], // Dần
  1: [4, 2], // Sửu
  0: [4, 3], // Tý
  11: [4, 4], // Hợi
};

const BRANCH_SVG_POS: Record<number, [number, number]> = {
  5: [12.5, 12.5],
  6: [37.5, 12.5],
  7: [62.5, 12.5],
  8: [87.5, 12.5],
  4: [12.5, 37.5],
  9: [87.5, 37.5],
  3: [12.5, 62.5],
  10: [87.5, 62.5],
  2: [12.5, 87.5],
  1: [37.5, 87.5],
  0: [62.5, 87.5],
  11: [87.5, 87.5],
};

const DISPLAY_BRANCH_ORDER = [5, 6, 7, 8, 4, 9, 3, 10, 2, 1, 0, 11];

/**
 * Hậu Thiên Bát Quái & Phương vị tương ứng với 12 Địa Chi trên Thiên Bàn Tử Vi
 * (Ngọ = Chính Nam / Quẻ Ly ☲ ở trên; Tý = Chính Bắc / Quẻ Khảm ☵ ở dưới)
 */
const BRANCH_BAGUA_META: Record<
  number,
  { trigram: string; trigramVi: string; directionVi: string }
> = {
  5: { trigram: '☴', trigramVi: 'Tốn', directionVi: 'Đông Nam' }, // Tỵ
  6: { trigram: '☲', trigramVi: 'Ly', directionVi: 'Chính Nam' }, // Ngọ
  7: { trigram: '☷', trigramVi: 'Khôn', directionVi: 'Tây Nam' }, // Mùi
  8: { trigram: '☷', trigramVi: 'Khôn', directionVi: 'Tây Nam' }, // Thân
  4: { trigram: '☴', trigramVi: 'Tốn', directionVi: 'Đông Nam' }, // Thìn
  9: { trigram: '☱', trigramVi: 'Đoài', directionVi: 'Chính Tây' }, // Dậu
  3: { trigram: '☳', trigramVi: 'Chấn', directionVi: 'Chính Đông' }, // Mão
  10: { trigram: '☰', trigramVi: 'Càn', directionVi: 'Tây Bắc' }, // Tuất
  2: { trigram: '☶', trigramVi: 'Cấn', directionVi: 'Đông Bắc' }, // Dần
  1: { trigram: '☶', trigramVi: 'Cấn', directionVi: 'Đông Bắc' }, // Sửu
  0: { trigram: '☵', trigramVi: 'Khảm', directionVi: 'Chính Bắc' }, // Tý
  11: { trigram: '☰', trigramVi: 'Càn', directionVi: 'Tây Bắc' }, // Hợi
};

const HOU_TIAN_BAGUA_RING: Array<{
  trigram: string;
  nameVi: string;
  elementVi: string;
  angleDeg: number;
}> = [
  { trigram: '☲', nameVi: 'Ly', elementVi: 'Hỏa', angleDeg: 0 }, // Nam (Top)
  { trigram: '☷', nameVi: 'Khôn', elementVi: 'Thổ', angleDeg: 45 }, // Tây Nam
  { trigram: '☱', nameVi: 'Đoài', elementVi: 'Kim', angleDeg: 90 }, // Tây (Right)
  { trigram: '☰', nameVi: 'Càn', elementVi: 'Kim', angleDeg: 135 }, // Tây Bắc
  { trigram: '☵', nameVi: 'Khảm', elementVi: 'Thủy', angleDeg: 180 }, // Bắc (Bottom)
  { trigram: '☶', nameVi: 'Cấn', elementVi: 'Thổ', angleDeg: 225 }, // Đông Bắc
  { trigram: '☳', nameVi: 'Chấn', elementVi: 'Mộc', angleDeg: 270 }, // Đông (Left)
  { trigram: '☴', nameVi: 'Tốn', elementVi: 'Mộc', angleDeg: 315 }, // Đông Nam
];

function getYearStemIndex(solarYear: number): number {
  return (((solarYear - 4) % 10) + 10) % 10;
}

function getYearBranchIndex(solarYear: number): number {
  return (((solarYear - 4) % 12) + 12) % 12;
}

function buildSiHuaOverlayMap(stemIndex: number): Record<string, string> {
  const row = SI_HUA_TABLE[((stemIndex % 10) + 10) % 10];
  if (!row) return {};
  return {
    [row[0]]: '禄',
    [row[1]]: '权',
    [row[2]]: '科',
    [row[3]]: '忌',
  };
}

export default function ChartBoard({
  chart,
  selectedPalace,
  onSelectPalace,
  onSelectStar,
  onSelectSiHua,
  onOpenShareModal,
  onOpenSchoolConfig,
  customSchoolRulesCount = 0,
  onSaveChart,
  isSavingChart = false,
}: ChartBoardProps) {
  const [timeView, setTimeView] = useState<ZiweiTimeView>('mingpan');
  const [selectedDaXianIdx, setSelectedDaXianIdx] = useState<number>(() =>
    chart.currentDaXianIndex >= 0 ? chart.currentDaXianIndex : 0
  );
  const [liunianYear, setLiunianYear] = useState<number>(() => new Date().getFullYear());
  const [liunianBaseYear, setLiunianBaseYear] = useState<number>(
    () => new Date().getFullYear() - 3
  );
  const [showFullBoard, setShowFullBoard] = useState(false);
  const [bilingual, setBilingual] = useState<boolean>(false);

  const palaceByBranch = useMemo(() => {
    const map: Record<number, Palace> = {};
    chart.palaces.forEach((p) => {
      map[p.branch] = p;
    });
    return map;
  }, [chart]);

  const starToPalaceMap = useMemo(() => {
    const map: Record<string, Palace> = {};
    chart.palaces.forEach((p) => {
      p.stars.forEach((s) => {
        map[s.name] = p;
      });
    });
    return map;
  }, [chart]);

  const childhoodYears = useMemo(() => getChildhoodYears(chart), [chart]);

  const activeBranch = selectedPalace ? selectedPalace.branch : chart.mingGongBranch;
  const activePalace = palaceByBranch[activeBranch];
  const oppositeBranch = (activeBranch + 6) % 12;
  const sanHeBranch1 = (activeBranch + 4) % 12;
  const sanHeBranch2 = (activeBranch + 8) % 12;

  // Tứ Hóa Overlay cho Đại Hạn (kể cả Đồng Hạn) hoặc Lưu Niên
  const { overlaySiHua, overlayPrefix, activeAnchorBranch } = useMemo<{
    overlaySiHua: Record<string, string>;
    overlayPrefix?: string;
    activeAnchorBranch: number;
  }>(() => {
    if (timeView === 'daxian') {
      if (selectedDaXianIdx === CHILDHOOD_DAXIAN_INDEX) {
        const chPalace = getChildhoodDaXianPalace(chart, liunianYear);
        return {
          overlaySiHua: chPalace ? buildSiHuaOverlayMap(chPalace.stem) : ({} as Record<string, string>),
          overlayPrefix: 'Đồng Hạn',
          activeAnchorBranch: chPalace ? chPalace.branch : chart.mingGongBranch,
        };
      }
      const dx = chart.daXians[selectedDaXianIdx] || chart.daXians[0];
      if (dx) {
        const dxPalace = palaceByBranch[dx.palaceBranch];
        return {
          overlaySiHua: dxPalace ? buildSiHuaOverlayMap(dxPalace.stem) : ({} as Record<string, string>),
          overlayPrefix: 'Đ.Hạn',
          activeAnchorBranch: dx.palaceBranch,
        };
      }
    }
    if (timeView === 'liunian') {
      const stemIdx = getYearStemIndex(liunianYear);
      const branchIdx = getYearBranchIndex(liunianYear);
      return {
        overlaySiHua: buildSiHuaOverlayMap(stemIdx),
        overlayPrefix: 'L.Niên',
        activeAnchorBranch: branchIdx,
      };
    }
    return {
      overlaySiHua: {} as Record<string, string>,
      overlayPrefix: undefined,
      activeAnchorBranch: chart.lunarInfo.yearBranch,
    };
  }, [timeView, selectedDaXianIdx, liunianYear, chart, palaceByBranch]);

  // Đối chiếu Tứ Hóa 3 tầng (Bản mệnh / Đại hạn / Lưu niên)
  const threeLayerSiHua = useMemo(() => {
    const natalTransforms = getSiHuaByStem(chart.lunarInfo.yearStem);
    const effectiveDxIdx =
      timeView === 'liunian'
        ? getDaXianIndexForYear(chart, liunianYear)
        : selectedDaXianIdx;
    const dxInfo = getDaXianSiHua(
      chart,
      effectiveDxIdx >= 0 || effectiveDxIdx === CHILDHOOD_DAXIAN_INDEX
        ? effectiveDxIdx
        : chart.currentDaXianIndex >= 0
        ? chart.currentDaXianIndex
        : 0,
      liunianYear
    );
    const lnInfo = getLiuNianSiHua(liunianYear);

    const formatRow = (transforms: Record<SiHua, string>) =>
      (['禄', '权', '科', '忌'] as SiHua[]).map((sh) => {
        const starName = transforms[sh];
        const pal = starToPalaceMap[starName];
        return {
          sh,
          shVi: translateSiHua(sh),
          starName,
          starVi: translateStarName(starName),
          palaceVi: pal ? translatePalaceName(pal.name) : '—',
        };
      });

    return {
      natal: {
        stemVi: translateStem(STEMS[chart.lunarInfo.yearStem] || ''),
        items: formatRow(natalTransforms),
      },
      daxian: dxInfo
        ? {
            stemVi: translateStem(dxInfo.stemName),
            items: formatRow(dxInfo.transforms),
          }
        : null,
      liunian: {
        year: liunianYear,
        stemVi: translateStem(lnInfo.stemName),
        branchVi: translateBranch(BRANCHES[getYearBranchIndex(liunianYear)] || ''),
        items: formatRow(lnInfo.transforms),
      },
    };
  }, [chart, timeView, selectedDaXianIdx, liunianYear, starToPalaceMap]);

  const { birthInfo, lunarInfo } = chart;
  const yearStemCn = STEMS[lunarInfo.yearStem] || '';
  const yearBranchCn = BRANCHES[lunarInfo.yearBranch] || '';
  const lunarYearVi = `${translateStem(yearStemCn)} ${translateBranch(yearBranchCn)}`;
  const hourInfo = HOUR_BRANCH_LABELS_VI[birthInfo.hour] || HOUR_BRANCH_LABELS_VI[0];

  const handlePalaceClick = (branch: number) => {
    const target = palaceByBranch[branch];
    if (!target) return;
    if (selectedPalace?.branch === branch) {
      onSelectPalace(null);
    } else {
      onSelectPalace(target);
    }
  };

  const pMain = BRANCH_SVG_POS[activeBranch];
  const pOpp = BRANCH_SVG_POS[oppositeBranch];
  const pSan1 = BRANCH_SVG_POS[sanHeBranch1];
  const pSan2 = BRANCH_SVG_POS[sanHeBranch2];

  const selectedDaXianYears = useMemo(
    () =>
      selectedDaXianIdx === CHILDHOOD_DAXIAN_INDEX
        ? childhoodYears
        : getDaXianYears(chart, selectedDaXianIdx),
    [chart, selectedDaXianIdx, childhoodYears]
  );

  return (
    <div className="space-y-3">
      {/* Thanh Điều Hướng Vận Hạn & Tác Vụ */}
      <div className="ziwei-chart-toolbar">
        <div className="ziwei-time-nav">
          <button
            type="button"
            onClick={() => setTimeView('mingpan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeView === 'mingpan'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bản mệnh
          </button>
          <button
            type="button"
            onClick={() => setTimeView('daxian')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeView === 'daxian'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Đại hạn
          </button>
          <button
            type="button"
            onClick={() => setTimeView('liunian')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeView === 'liunian'
                ? 'bg-[#F05A28] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lưu niên
          </button>
        </div>

        <div className="ziwei-chart-actions">
          {onOpenSchoolConfig && (
            <button
              type="button"
              onClick={onOpenSchoolConfig}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                customSchoolRulesCount > 0
                  ? 'bg-orange-50 text-[#F05A28] border-[#F05A28]/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>
                An sao
                {customSchoolRulesCount > 0 ? ` (${customSchoolRulesCount})` : ''}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setBilingual((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              bilingual
                ? 'bg-purple-50 text-purple-800 border-purple-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Languages size={14} />
            <span>{bilingual ? 'Hán–Việt' : 'Tiếng Việt'}</span>
          </button>

          {onSaveChart && (
            <button
              type="button"
              onClick={onSaveChart}
              disabled={isSavingChart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={14} />
              <span>{isSavingChart ? 'Đang lưu...' : 'Lưu'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Tải ảnh</span>
          </button>
          <button type="button" className="ziwei-outline ziwei-board-toggle" aria-pressed={showFullBoard}
            onClick={() => setShowFullBoard((value) => !value)}>
            {showFullBoard ? 'Thu gọn bàn sao' : 'Bàn sao đầy đủ'}
          </button>
        </div>
      </div>

      {/* Thanh chọn Đại Hạn (có Đồng Hạn + Năm Dương Lịch tương ứng) */}
      {timeView === 'daxian' && (
        <div className="bg-purple-50/75 rounded-2xl border border-purple-200/80 p-3 space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-extrabold text-purple-950 mr-1 inline-flex items-center gap-1">
              <Layers size={14} /> Chọn Vận 10 Năm:
            </span>

            {childhoodYears.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDaXianIdx(CHILDHOOD_DAXIAN_INDEX);
                  const chPalace = getChildhoodDaXianPalace(chart, liunianYear);
                  if (chPalace) onSelectPalace(chPalace);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDaXianIdx === CHILDHOOD_DAXIAN_INDEX
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                Đồng Hạn (1–{(chart.daXians[0]?.startAge || 2) - 1}t • {childhoodYears[0]}–
                {childhoodYears[childhoodYears.length - 1]})
              </button>
            )}

            {chart.daXians.map((dx, idx) => {
              const yrs = getDaXianYears(chart, idx);
              const yrLabel = yrs.length > 0 ? `${yrs[0]}–${yrs[yrs.length - 1]}` : '';
              return (
                <button
                  key={dx.palaceBranch}
                  type="button"
                  onClick={() => {
                    setSelectedDaXianIdx(idx);
                    const p = palaceByBranch[dx.palaceBranch];
                    if (p) onSelectPalace(p);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedDaXianIdx === idx
                      ? 'bg-purple-700 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {dx.startAge}–{dx.endAge}t ({translatePalaceName(dx.palaceName)}
                  {yrLabel ? ` • ${yrLabel}` : ''})
                </button>
              );
            })}
          </div>

          {selectedDaXianYears.length > 0 && (
            <div className="pt-2 border-t border-purple-200/60 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-purple-900 mr-1">
                Các năm Lưu Niên trong vận này (bấm để xem chi tiết năm):
              </span>
              {selectedDaXianYears.map((yr) => {
                const age = yr - chart.lunarInfo.lunarYear + 1;
                const sCn = STEMS[getYearStemIndex(yr)];
                const bCn = BRANCHES[getYearBranchIndex(yr)];
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setLiunianYear(yr);
                      setTimeView('liunian');
                      const p = palaceByBranch[getYearBranchIndex(yr)];
                      if (p) onSelectPalace(p);
                    }}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white hover:bg-[#F05A28] text-slate-700 hover:text-white border border-purple-200 transition-colors cursor-pointer"
                  >
                    {yr} ({translateStem(sCn)} {translateBranch(bCn)} • {age}t)
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Thanh chọn Năm Lưu Niên (có chuyển thập niên & hiển thị Đại Hạn tương ứng) */}
      {timeView === 'liunian' && (
        <div className="bg-orange-50/80 rounded-2xl border border-orange-200/80 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-orange-950 inline-flex items-center gap-1.5">
              <Calendar size={14} className="text-[#F05A28]" />
              <span>
                Năm Lưu Niên Đang Xem: <strong>{liunianYear}</strong> (Tuổi Âm:{' '}
                <strong>{liunianYear - chart.lunarInfo.lunarYear + 1} tuổi</strong>)
              </span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLiunianBaseYear((y) => y - 12)}
                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white hover:bg-orange-100 text-slate-700 border border-orange-200 text-xs font-bold cursor-pointer"
              >
                <ChevronLeft size={13} /> 12 năm trước
              </button>
              <button
                type="button"
                onClick={() => {
                  const nowYr = new Date().getFullYear();
                  setLiunianBaseYear(nowYr - 3);
                  setLiunianYear(nowYr);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Năm nay ({new Date().getFullYear()})
              </button>
              <button
                type="button"
                onClick={() => setLiunianBaseYear((y) => y + 12)}
                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white hover:bg-orange-100 text-slate-700 border border-orange-200 text-xs font-bold cursor-pointer"
              >
                12 năm sau <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: 12 }, (_, i) => liunianBaseYear + i).map((yr) => {
              const sCn = STEMS[getYearStemIndex(yr)];
              const bCn = BRANCHES[getYearBranchIndex(yr)];
              const age = yr - chart.lunarInfo.lunarYear + 1;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setLiunianYear(yr);
                    const p = palaceByBranch[getYearBranchIndex(yr)];
                    if (p) onSelectPalace(p);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    liunianYear === yr
                      ? 'bg-[#F05A28] text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-orange-200 hover:bg-orange-100'
                  }`}
                >
                  {yr} ({translateStem(sCn)} {translateBranch(bCn)} • {age}t)
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BẢNG ĐỐI CHIẾU TỨ HÓA 3 TẦNG (BẢN MỆNH — ĐẠI HẠN — LƯU NIÊN) */}
      <div className={`ziwei-board ${showFullBoard ? 'ziwei-board-full' : ''}`}>
        <div
          className="ziwei-grid"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(4, auto)',
          }}
        >
          {DISPLAY_BRANCH_ORDER.map((branch) => {
            const [row, col] = BRANCH_GRID_POS[branch];
            const palace = palaceByBranch[branch];
            if (!palace) return null;

            const isSelected = activeBranch === branch;
            const isOpposite = oppositeBranch === branch;
            const isSanFang = sanHeBranch1 === branch || sanHeBranch2 === branch;
            const relation = isSelected
              ? 'selected'
              : isOpposite
              ? 'opposite'
              : isSanFang
              ? 'sanfang'
              : 'none';

            const stemCn = STEMS[palace.stem] || '';
            const branchCn = BRANCHES[branch] || '';
            const ganZhiVi = `${translateStem(stemCn)} ${translateBranch(branchCn)}`;
            const bagua = BRANCH_BAGUA_META[branch];
            const majorStars = palace.stars.filter((star) => star.type === 'major');
            const notableAuxStars = palace.stars
              .filter((star) => star.type === 'lucky' || star.type === 'sha')
              .slice(0, 4);

            return (
              <div
                key={branch}
                className="ziwei-palace-slot"
                data-relation={relation}
                style={{ gridRow: row, gridColumn: col }}
              >
                <button
                  type="button"
                  className="ziwei-palace-preview"
                  data-relation={relation}
                  aria-pressed={isSelected}
                  onClick={() => onSelectPalace(palace)}
                >
                  {/* Chữ Địa Chi & Quẻ Bát Quái chìm dưới nền */}
                  <span className="ziwei-palace-watermark" aria-hidden="true">
                    {branchCn}
                  </span>

                  {/* Đầu cung: Tên cung + Ấn Mệnh/Thân + Vai trò Tam Phương / Quẻ */}
                  <div className="ziwei-palace-head">
                    <div className="ziwei-palace-title-group">
                      <strong>{translatePalaceName(palace.name)}</strong>
                      {bilingual && <small lang="zh">{palace.name}</small>}
                      {palace.isMingGong && (
                        <em className="ziwei-seal-tag ziwei-seal-ming">Mệnh</em>
                      )}
                      {palace.isShenGong && (
                        <em className="ziwei-seal-tag ziwei-seal-shen">Thân</em>
                      )}
                    </div>

                    {isSelected ? (
                      <span className="ziwei-relation-pill ziwei-relation-selected">
                        Bản cung
                      </span>
                    ) : isOpposite ? (
                      <span className="ziwei-relation-pill ziwei-relation-opposite">
                        Xung chiếu
                      </span>
                    ) : isSanFang ? (
                      <span className="ziwei-relation-pill ziwei-relation-sanfang">
                        Tam hợp
                      </span>
                    ) : (
                      bagua && (
                        <span
                          className="ziwei-bagua-chip"
                          title={`Phương ${bagua.directionVi} • Quẻ ${bagua.trigramVi}`}
                        >
                          {bagua.trigram} {bagua.trigramVi}
                        </span>
                      )
                    )}
                  </div>

                  {/* Thân cung: Chính tinh + Độ sáng + Tứ Hóa + Cát/Sát tinh */}
                  <div className="ziwei-palace-body">
                    {majorStars.length > 0 ? (
                      <div className="ziwei-major-list">
                        {majorStars.map((star) => {
                          const overSh = overlaySiHua[star.name];
                          return (
                            <div key={star.name} className="ziwei-major-item">
                              <span className="ziwei-major-name">
                                {translateStarName(star.name, bilingual)}
                              </span>
                              {star.brightnessRaw && (
                                <span className="ziwei-brightness-tag">
                                  {translateBrightness(star.brightnessRaw)}
                                </span>
                              )}
                              {star.siHua && (
                                <span
                                  className={`ziwei-sihua-pill ziwei-sihua-${star.siHua}`}
                                >
                                  {translateSiHua(star.siHua)}
                                </span>
                              )}
                              {overSh && (
                                <span
                                  className={`ziwei-sihua-pill ziwei-sihua-overlay ziwei-sihua-${overSh}`}
                                >
                                  {overlayPrefix}:{translateSiHua(overSh)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ziwei-empty-major">
                        <span>Vô chính diệu</span>
                        {palace.borrowedStars && palace.borrowedStars.length > 0 && (
                          <small>
                            Mượn:{' '}
                            {palace.borrowedStars
                              .map((s) => translateStarName(s))
                              .join(' · ')}
                          </small>
                        )}
                      </div>
                    )}

                    {notableAuxStars.length > 0 && (
                      <div className="ziwei-aux-row">
                        {notableAuxStars.map((star) => (
                          <span
                            key={star.name}
                            className={`ziwei-aux-chip ${
                              star.type === 'lucky' ? 'is-lucky' : 'is-sha'
                            }`}
                          >
                            {translateStarName(star.name)}
                            {star.siHua ? ` (${translateSiHua(star.siHua)})` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chân cung: Can Chi + Đại Hạn */}
                  <div className="ziwei-palace-foot">
                    <span className="ziwei-ganzhi-label">
                      {ganZhiVi}
                      {bilingual ? ` · ${stemCn}${branchCn}` : ''}
                    </span>
                    {palace.daXianAge && (
                      <span
                        className={`ziwei-daxian-label ${
                          palace.isCurrentDaXian ? 'is-current' : ''
                        }`}
                      >
                        {palace.daXianAge[0]}–{palace.daXianAge[1]}t
                      </span>
                    )}
                  </div>
                </button>
                <div className="ziwei-palace-full">
                <PalaceCell
                  palace={palace}
                  isSelected={isSelected}
                  isOpposite={isOpposite}
                  isSanFang={isSanFang}
                  bilingual={bilingual}
                  overlaySiHua={overlaySiHua}
                  overlayPrefix={overlayPrefix}
                  boshiName={boshiShenName(lunarInfo.yearStem, birthInfo.gender, branch)}
                  suiQianName={suiQianShenName(activeAnchorBranch, branch)}
                  onSelectPalace={() => handlePalaceClick(branch)}
                  onSelectStar={onSelectStar}
                  onSelectSiHua={(starNameCn, siHuaCn) =>
                    onSelectSiHua?.(starNameCn, siHuaCn, timeView)
                  }
                />
                </div>
              </div>
            );
          })}

          {/* THIÊN BÀN TRUNG TÂM (2x2 Ô Giữa) — LA KINH BÁT QUÁI & THÁI CỰC ĐỒ */}
          <div
            style={{ gridRow: '2 / 4', gridColumn: '2 / 4' }}
            className="ziwei-board-center"
          >
            {/* Vòng La Kinh Bát Quái & Thái Cực Đồ (SVG Cổ Phong Chìm + Tâm Ấn) */}
            <svg
              viewBox="0 0 320 320"
              className="ziwei-bagua-mandala"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="ziweiBaguaGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.26" />
                  <stop offset="65%" stopColor="#8c3528" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#17372f" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="160" cy="160" r="150" fill="url(#ziweiBaguaGlow)" />

              {/* Bát Giác Hậu Thiên Bát Quái Ngoại Vi */}
              <polygon
                points="160,12 265,55 308,160 265,265 160,308 55,265 12,160 55,55"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeOpacity="0.45"
              />
              <polygon
                points="160,24 256,64 296,160 256,256 160,296 64,256 24,160 64,64"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="3 3"
                strokeOpacity="0.35"
              />

              {/* Vòng La Kinh 24 Sơn & Tinh Bàn */}
              <circle
                cx="160"
                cy="160"
                r="116"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeOpacity="0.4"
              />
              <circle
                cx="160"
                cy="160"
                r="88"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2 4"
                strokeOpacity="0.35"
              />
              <circle
                cx="160"
                cy="160"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.35"
              />

              {/* 8 Trục Phương Vị Bát Quái & Quẻ Hậu Thiên */}
              {HOU_TIAN_BAGUA_RING.map((item) => (
                <g
                  key={item.nameVi}
                  transform={`rotate(${item.angleDeg} 160 160)`}
                >
                  <line
                    x1="160"
                    y1="24"
                    x2="160"
                    y2="104"
                    stroke="currentColor"
                    strokeWidth="0.65"
                    strokeOpacity="0.25"
                  />
                  <text
                    x="160"
                    y="42"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="16"
                    fontWeight="700"
                    opacity="0.62"
                  >
                    {item.trigram}
                  </text>
                  <text
                    x="160"
                    y="55"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="7.5"
                    fontWeight="700"
                    letterSpacing="1"
                    opacity="0.48"
                  >
                    {item.nameVi.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* Thái Cực Âm Dương Đồ ở Tâm */}
              <g opacity="0.22">
                <circle
                  cx="160"
                  cy="160"
                  r="34"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M160,126 A34,34 0 0,1 160,194 A17,17 0 0,1 160,160 A17,17 0 0,0 160,126 Z"
                  fill="currentColor"
                />
                <circle cx="160" cy="143" r="4.5" fill="currentColor" />
                <circle cx="160" cy="177" r="4.5" fill="#fcf5e8" />
              </g>
            </svg>

            <div className="ziwei-center-preview">
              {/* Huy hiệu Thái Cực Bát Quái & Triện Chu Sa */}
              <div className="ziwei-center-crest">
                <span className="ziwei-crest-line" aria-hidden="true" />
                <span className="ziwei-crest-badge">
                  <span className="ziwei-taiji-symbol" aria-hidden="true">
                    ☯
                  </span>
                  <span>THIÊN KỶ • TỬ VI ĐẨU SỐ</span>
                </span>
                <span className="ziwei-crest-seal" aria-hidden="true">
                  紫微命盤
                </span>
                <span className="ziwei-crest-line" aria-hidden="true" />
              </div>

              <h3>{birthInfo.name || 'Lá số Tử Vi'}</h3>

              <div className="ziwei-center-meta-pills">
                <span className="ziwei-meta-pill is-primary">
                  {translateYinYangGender(chart.yinYangGender)} ·{' '}
                  {translateWuxingJu(chart.wuxingJuName)}
                </span>
                <span className="ziwei-meta-pill">
                  Mệnh chủ:{' '}
                  <strong>{translateStarName(chart.mingZhu || '', bilingual)}</strong>
                </span>
                <span className="ziwei-meta-pill">
                  Thân chủ:{' '}
                  <strong>{translateStarName(chart.shenZhu || '', bilingual)}</strong>
                </span>
              </div>

              {/* Tứ Trụ Bát Tự Cổ Phong (Năm - Tháng - Ngày - Giờ) */}
              {lunarInfo.fourPillars && lunarInfo.fourPillars.length === 4 && (
                <div className="ziwei-four-pillars" aria-label="Tứ trụ Bát tự">
                  {(['Năm', 'Tháng', 'Ngày', 'Giờ'] as const).map((label, idx) => (
                    <div key={label} className="ziwei-pillar-box">
                      <small>{label}</small>
                      <strong>
                        {translateGanZhi(lunarInfo.fourPillars![idx] || '')}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              <p className="ziwei-center-dates">
                Dương lịch:{' '}
                <strong>
                  {String(birthInfo.day).padStart(2, '0')}/
                  {String(birthInfo.month).padStart(2, '0')}/{birthInfo.year}
                </strong>{' '}
                · Âm lịch:{' '}
                <strong>
                  {lunarInfo.lunarDay}/{Math.abs(lunarInfo.lunarMonth)} {lunarYearVi}
                </strong>{' '}
                ({hourInfo.nameVi})
              </p>

              {/* Thanh trạng thái Tam Phương Tứ Chính & Phương Vị Bát Quái */}
              <div className="ziwei-center-compass-bar">
                <span>
                  ☯ Đang chiếu:{' '}
                  <strong>
                    Cung {translatePalaceName(palaceByBranch[activeBranch]?.name || '命宫')}
                  </strong>
                  {BRANCH_BAGUA_META[activeBranch] && (
                    <em>
                      {' '}
                      ({BRANCH_BAGUA_META[activeBranch].trigram} Quẻ{' '}
                      {BRANCH_BAGUA_META[activeBranch].trigramVi} ·{' '}
                      {BRANCH_BAGUA_META[activeBranch].directionVi})
                    </em>
                  )}
                </span>
                <small>
                  Đối cung: {translatePalaceName(palaceByBranch[oppositeBranch]?.name || '')} ·
                  Tam hợp: {translatePalaceName(palaceByBranch[sanHeBranch1]?.name || '')},{' '}
                  {translatePalaceName(palaceByBranch[sanHeBranch2]?.name || '')}
                </small>
              </div>
            </div>
            <div className="ziwei-center-full">
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F05A28]/20 border border-[#F05A28]/40 text-[#F05A28] flex items-center justify-center">
                    <Compass size={15} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-amber-300/90 font-bold">
                      Thiên Kỷ • Tử Vi Đẩu Số
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {birthInfo.name || 'Lá Số Đương Số'}
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-amber-300 border border-white/15">
                  {translateYinYangGender(chart.yinYangGender)} • {translateWuxingJu(chart.wuxingJuName)}
                </span>
              </div>

              {/* Thông tin Ngày Giờ Sinh & Bát Tự */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Thời Gian &amp; Nơi Sinh
                  </div>
                  <div>
                    Dương lịch:{' '}
                    <strong className="text-white">
                      {String(birthInfo.day).padStart(2, '0')}/
                      {String(birthInfo.month).padStart(2, '0')}/{birthInfo.year}
                    </strong>
                  </div>
                  <div>
                    Âm lịch:{' '}
                    <strong className="text-amber-300">
                      {lunarInfo.lunarDay}/{Math.abs(lunarInfo.lunarMonth)} năm {lunarYearVi}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-300">
                    <Clock size={11} className="text-[#F05A28]" />
                    <span>
                      {hourInfo.nameVi} ({hourInfo.range}) • {birthInfo.city || 'Việt Nam'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    Tứ Trụ &amp; Chủ Tinh
                  </div>
                  {lunarInfo.fourPillars && (
                    <div>
                      Bát tự:{' '}
                      <strong className="text-amber-300">
                        {lunarInfo.fourPillars.map(translateGanZhi).join(' • ')}
                      </strong>
                    </div>
                  )}
                  <div>
                    Mệnh chủ:{' '}
                    <strong className="text-emerald-300">
                      {translateStarName(chart.mingZhu || '', bilingual)}
                    </strong>{' '}
                    • Thân chủ:{' '}
                    <strong className="text-purple-300">
                      {translateStarName(chart.shenZhu || '', bilingual)}
                    </strong>
                  </div>
                  <div>
                    Tuổi Âm lịch: <strong className="text-white">{chart.currentAge} tuổi</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Chú giải Tam Phương Tứ Chính & Tứ Hóa */}
            <div className="ziwei-center-full mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Sparkles size={12} className="text-amber-400" />
                  Đang chiếu:{' '}
                  <strong className="text-amber-300">
                    Cung {translatePalaceName(palaceByBranch[activeBranch]?.name || '命宫')}
                  </strong>
                </span>
                <span className="text-slate-400">
                  (Đối cung: {translatePalaceName(palaceByBranch[oppositeBranch]?.name || '')} • Tam
                  hợp: {translatePalaceName(palaceByBranch[sanHeBranch1]?.name || '')},{' '}
                  {translatePalaceName(palaceByBranch[sanHeBranch2]?.name || '')})
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">Lộc</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">
                  Quyền
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">Khoa</span>
                <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">Kỵ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lớp SVG vẽ đường chiếu Tam Phương Tứ Chính (Tinh Đồ Cổ Phong) */}
        {pMain && pOpp && pSan1 && pSan2 && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="ziwei-constellation-lines absolute inset-0 w-full h-full pointer-events-none z-10"
          >
            {/* Đường Tam Hợp */}
            <polygon
              points={`${pMain[0]},${pMain[1]} ${pSan1[0]},${pSan1[1]} ${pSan2[0]},${pSan2[1]}`}
              fill="rgba(182, 154, 105, 0.05)"
              stroke="rgba(37, 69, 61, 0.35)"
              strokeWidth="0.32"
              strokeDasharray="1.2 0.8"
            />
            {/* Đường Xung Chiếu (Đối cung) */}
            <line
              x1={pMain[0]}
              y1={pMain[1]}
              x2={pOpp[0]}
              y2={pOpp[1]}
              stroke="rgba(140, 53, 40, 0.55)"
              strokeWidth="0.4"
              strokeDasharray="1.4 0.9"
            />
            <circle cx={pMain[0]} cy={pMain[1]} r="1.05" fill="#8c3528" />
            <circle cx={pOpp[0]} cy={pOpp[1]} r="0.85" fill="#b68d40" />
            <circle cx={pSan1[0]} cy={pSan1[1]} r="0.75" fill="#25453d" />
            <circle cx={pSan2[0]} cy={pSan2[1]} r="0.75" fill="#25453d" />
          </svg>
        )}
      </div>
      {activePalace && (
        <section className="ziwei-palace-detail" aria-label="Cung đang chọn">
          <h3>Cung {translatePalaceName(activePalace.name)}</h3>
          <PalaceCell
            palace={activePalace}
            isSelected={false}
            isOpposite={false}
            isSanFang={false}
            bilingual={bilingual}
            overlaySiHua={overlaySiHua}
            overlayPrefix={overlayPrefix}
            boshiName={boshiShenName(lunarInfo.yearStem, birthInfo.gender, activeBranch)}
            suiQianName={suiQianShenName(activeAnchorBranch, activeBranch)}
            onSelectStar={onSelectStar}
            onSelectSiHua={(starNameCn, siHuaCn) => onSelectSiHua?.(starNameCn, siHuaCn, timeView)}
          />
        </section>
      )}
      <details className="ziwei-disclosure">
        <summary><Layers size={17} aria-hidden="true" /> Tứ Hóa</summary>
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs grid grid-cols-1 lg:grid-cols-3 gap-2.5 text-xs">
        {/* Tầng 1: Bản Mệnh */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900">
              1. Tứ Hóa Năm Sinh (Can {threeLayerSiHua.natal.stemVi})
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              Tiên Thiên
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {threeLayerSiHua.natal.items.map((it) => (
              <div key={it.sh} className="truncate text-slate-700">
                <strong className="text-slate-900">Hóa {it.shVi}:</strong> {it.starVi} ({it.palaceVi})
              </div>
            ))}
          </div>
        </div>

        {/* Tầng 2: Đại Hạn */}
        {threeLayerSiHua.daxian && (
          <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-950">
                2. Tứ Hóa Đại Hạn (Can {threeLayerSiHua.daxian.stemVi})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
                Vận 10 Năm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {threeLayerSiHua.daxian.items.map((it) => (
                <div key={it.sh} className="truncate text-purple-900">
                  <strong>Hóa {it.shVi}:</strong> {it.starVi} ({it.palaceVi})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tầng 3: Lưu Niên */}
        <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-orange-950">
              3. Tứ Hóa Lưu Niên {threeLayerSiHua.liunian.year} ({threeLayerSiHua.liunian.stemVi}{' '}
              {threeLayerSiHua.liunian.branchVi})
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-200 text-orange-950">
              Tiểu Vận Năm
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            {threeLayerSiHua.liunian.items.map((it) => (
              <div key={it.sh} className="truncate text-orange-950">
                <strong>Hóa {it.shVi}:</strong> {it.starVi} ({it.palaceVi})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BÀN LÁ SỐ 12 CUNG (4x4 GRID) + THIÊN BÀN TRUNG TÂM */}
      </details>
    </div>
  );
}

