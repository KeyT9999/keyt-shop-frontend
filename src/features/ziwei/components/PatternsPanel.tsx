import { useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Compass,
  RefreshCw,
} from 'lucide-react';
import type { ZiweiChart } from '../engine/types';
import { STEMS, BRANCHES } from '../engine/constants';
import { detectPatterns, getMingGongSummary } from '../engine/patterns';
import { buildAllSelfSihua } from '../engine/sihua';
import {
  localizePattern,
  translateStarName,
  translatePalaceName,
  translateStem,
  translateBranch,
  translateSiHua,
  translateChineseAstrologyText,
} from '../utils/ziweiLocalization';

interface PatternsPanelProps {
  chart: ZiweiChart;
  onAskAiPattern?: (prompt: string) => void;
}

export default function PatternsPanel({ chart, onAskAiPattern }: PatternsPanelProps) {
  const rawPatterns = useMemo(() => detectPatterns(chart), [chart]);
  const localizedPatterns = useMemo(() => rawPatterns.map(localizePattern), [rawPatterns]);
  const mingSummary = useMemo(() => getMingGongSummary(chart), [chart]);

  // Tìm Lai Nhân Cung (Cung có Thiên Can trùng với Thiên Can năm sinh, không tính cung Tý/Sửu lặp can nếu ưu tiên 10 cung chính)
  const laiYinPalaces = useMemo(() => {
    return chart.palaces.filter((p) => p.stem === chart.lunarInfo.yearStem);
  }, [chart]);

  // Danh sách các cung có Tự Hóa (Self-SiHua)
  const selfSihuaItems = useMemo(() => {
    const map = buildAllSelfSihua(chart);
    const list: { palaceNameVi: string; branchVi: string; starVi: string; shVi: string }[] = [];
    chart.palaces.forEach((p) => {
      const items = map[p.branch] || [];
      items.forEach((it) => {
        list.push({
          palaceNameVi: translatePalaceName(p.name),
          branchVi: translateBranch(BRANCHES[p.branch] || ''),
          starVi: translateStarName(it.starName),
          shVi: translateSiHua(it.siHua),
        });
      });
    });
    return list;
  }, [chart]);

  const levelStyles = {
    excellent: {
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      card: 'bg-amber-50/40 border-amber-200/80',
      icon: Award,
      iconColor: 'text-amber-600',
    },
    good: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      card: 'bg-emerald-50/40 border-emerald-200/80',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    neutral: {
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      card: 'bg-blue-50/40 border-blue-200/80',
      icon: BookOpen,
      iconColor: 'text-blue-600',
    },
    caution: {
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      card: 'bg-rose-50/40 border-rose-200/80',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Award size={19} className="text-[#F05A28]" />
            <span>
              Giải Thích Cách Cục Có Căn Cứ &amp; Lai Nhân Tự Hóa ({localizedPatterns.length} Cách Cục)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối chiếu tự động hơn 1.100 dòng quy tắc từ《Tử Vi Đẩu Số Toàn Thư》,《Cốt Tủy Phú》và《Thiên
            Kỷ》— chỉ rõ cung kích hoạt, yếu tố gia cát và điều kiện phá cách
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold">
            Chính tinh Mệnh:{' '}
            {mingSummary.stars.length > 0
              ? mingSummary.stars.map((s) => translateStarName(s)).join(', ')
              : 'Vô Chính Diệu (Mượn Thiên Di)'}
          </span>
        </div>
      </div>

      {/* Bảng Lai Nhân Cung & Tự Hóa Toàn Bàn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Compass size={14} className="text-[#F05A28]" />
              <span>Lai Nhân Cung (来因宫 — Cội Nguồn Nhân Quả Tiên Thiên)</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#F05A28]">
              Can năm sinh: {translateStem(STEMS[chart.lunarInfo.yearStem] || '')}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Cung mang Thiên Can trùng với năm sinh là{' '}
            <strong className="text-slate-900">
              {laiYinPalaces
                .map(
                  (p) =>
                    `Cung ${translatePalaceName(p.name)} (${translateStem(
                      STEMS[p.stem] || ''
                    )} ${translateBranch(BRANCHES[p.branch] || '')})`
                )
                .join(' & ')}
            </strong>
            . Đây là nơi phát khởi toàn bộ Tứ Hóa (Lộc – Quyền – Khoa – Kỵ) của cuộc đời, quyết định
            bài học trọng tâm mà đương số đầu thai đến thế gian để trải nghiệm.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
              <RefreshCw size={14} className="text-amber-700" />
              <span>Hiện Tượng Cung Can Tự Hóa (宫干自化)</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {selfSihuaItems.length} cung có Tự Hóa
            </span>
          </div>
          {selfSihuaItems.length === 0 ? (
            <p className="text-xs text-slate-600 leading-relaxed">
              12 cung trên lá số không có hiện tượng Tự Hóa nội cung — khí lực của các cung ổn định,
              ít tự mâu thuẫn hoặc tự tiêu hao.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {selfSihuaItems.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs text-amber-950 font-semibold"
                >
                  Cung {item.palaceNameVi} ({item.branchVi}): <strong>{item.starVi}</strong> Tự Hóa{' '}
                  <strong className="text-[#F05A28]">{item.shVi}</strong>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {localizedPatterns.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          Lá số thuộc dạng bình hòa, không rơi vào các cách cục cực đoan. Trọng tâm luận đoán dựa trên
          độ sáng của Chính tinh tại cung Mệnh và sự hội hợp của Tam Phương Tứ Chính.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {localizedPatterns.map((pt, idx) => {
            const style = levelStyles[pt.level] || levelStyles.neutral;
            const Icon = style.icon;
            return (
              <div
                key={`${pt.originalName}-${idx}`}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${style.card}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Icon size={17} className={`${style.iconColor} shrink-0`} />
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {pt.nameVi}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({pt.originalName})
                        </span>
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${style.badge}`}
                    >
                      {pt.levelLabelVi}
                    </span>
                  </div>

                  {pt.palacesVi.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="font-bold text-slate-600">Cung hội chiếu:</span>
                      {pt.palacesVi.map((pal, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 font-bold text-purple-900"
                        >
                          Cung {pal}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed">{pt.descriptionVi}</p>

                  {pt.conditionsVi && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50 text-[11px]">
                      {pt.conditionsVi.required.length > 0 && (
                        <div className="p-2 rounded-lg bg-white/80 border border-slate-200/80 text-slate-700">
                          <strong className="text-slate-900">✓ Căn cứ kích hoạt cách cục:</strong>{' '}
                          {pt.conditionsVi.required.join(' • ')}
                        </div>
                      )}
                      {pt.conditionsVi.bonus && pt.conditionsVi.bonus.length > 0 && (
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-emerald-800">
                          <strong>★ Yếu tố gia cát (Thăng hoa):</strong>{' '}
                          {pt.conditionsVi.bonus.join(' • ')}
                        </div>
                      )}
                      {pt.conditionsVi.breaking && pt.conditionsVi.breaking.length > 0 && (
                        <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-200/70 text-rose-800 flex items-start gap-1.5">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>
                            <strong>Điều kiện phá cách / loại trừ:</strong>{' '}
                            {pt.conditionsVi.breaking.join(' • ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 truncate">
                    {pt.sourceVi
                      ? `Xuất xứ: ${translateChineseAstrologyText(pt.sourceVi)}`
                      : `Liên quan: Cung ${pt.palacesVi.join(', ')}`}
                  </span>

                  {onAskAiPattern && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskAiPattern(
                          `Lá số của tôi có cách cục "${pt.nameVi} (${pt.originalName})". Hãy giải thích chi tiết ý nghĩa, căn cứ kích hoạt, điều kiện phá cách và cách phát huy / hóa giải cách cục này theo học phái Thiên Kỷ của Nghê Hải Hạ.`
                        )
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-[#F05A28] transition-colors cursor-pointer shrink-0"
                    >
                      <Sparkles size={12} />
                      <span>Luận sâu bằng AI</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
