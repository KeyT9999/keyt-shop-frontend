import { useEffect, useRef, useState } from 'react';
import { X, Download, Link2, CheckCircle2 } from 'lucide-react';
import type { ZiweiChart } from '../engine/types';
import { STEMS, BRANCHES } from '../engine/constants';
import {
  translatePalaceName,
  translateStarName,
  translateBrightness,
  translateSiHua,
  translateWuxingJu,
  translateYinYangGender,
  translateStem,
  translateBranch,
  HOUR_BRANCH_LABELS_VI,
} from '../utils/ziweiLocalization';

interface ShareChartModalProps {
  chart: ZiweiChart | null;
  shareUrl: string;
  onClose: () => void;
}

const GRID_CELL_MAP: Record<number, [number, number]> = {
  5: [0, 0],
  6: [0, 1],
  7: [0, 2],
  8: [0, 3],
  4: [1, 0],
  9: [1, 3],
  3: [2, 0],
  10: [2, 3],
  2: [3, 0],
  1: [3, 1],
  0: [3, 2],
  11: [3, 3],
};

export default function ShareChartModal({ chart, shareUrl, onClose }: ShareChartModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!chart || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 920;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    const pad = 28;
    const gridW = W - pad * 2;
    const gridH = H - pad * 2;
    const cellW = gridW / 4;
    const cellH = gridH / 4;

    // Draw 12 palaces
    chart.palaces.forEach((palace) => {
      const pos = GRID_CELL_MAP[palace.branch];
      if (!pos) return;
      const [r, c] = pos;
      const x = pad + c * cellW;
      const y = pad + r * cellH;

      ctx.fillStyle = palace.isMingGong ? '#fff7ed' : '#ffffff';
      ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

      ctx.strokeStyle = palace.isMingGong ? '#F05A28' : '#cbd5e1';
      ctx.lineWidth = palace.isMingGong ? 2.5 : 1;
      ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);

      // Major stars
      const majors = palace.stars.filter((s) => s.type === 'major');
      ctx.font = 'bold 16px Inter, sans-serif';
      if (majors.length > 0) {
        majors.forEach((st, idx) => {
          ctx.fillStyle = '#0f172a';
          const bStr = st.brightnessRaw ? ` (${translateBrightness(st.brightnessRaw)})` : '';
          const shStr = st.siHua ? ` [${translateSiHua(st.siHua)}]` : '';
          ctx.fillText(
            `${translateStarName(st.name)}${bStr}${shStr}`,
            x + 14,
            y + 28 + idx * 22
          );
        });
      } else {
        ctx.font = 'italic 14px Inter, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Vô Chính Diệu', x + 14, y + 28);
      }

      // Lucky & Sha stars
      const aux = palace.stars.filter((s) => s.type === 'lucky' || s.type === 'sha');
      ctx.font = '600 12px Inter, sans-serif';
      const auxText = aux
        .slice(0, 6)
        .map((s) => translateStarName(s.name))
        .join(' • ');
      ctx.fillStyle = '#475569';
      ctx.fillText(auxText, x + 14, y + 92, cellW - 28);

      // Footer of cell: GanZhi + Palace Name + DaXian
      const sCn = STEMS[palace.stem] || '';
      const bCn = BRANCHES[palace.branch] || '';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${translateStem(sCn)} ${translateBranch(bCn)}`, x + 14, y + cellH - 16);

      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillStyle = palace.isMingGong ? '#F05A28' : '#1e293b';
      const pName = translatePalaceName(palace.name).toUpperCase();
      ctx.fillText(
        palace.isMingGong ? `★ ${pName}` : pName,
        x + cellW / 2 - 35,
        y + cellH - 16
      );

      if (palace.daXianAge) {
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(
          `${palace.daXianAge[0]}-${palace.daXianAge[1]}t`,
          x + cellW - 64,
          y + cellH - 16
        );
      }
    });

    // Center 2x2 Heaven Plate
    const cx = pad + cellW;
    const cy = pad + cellH;
    const cw = cellW * 2;
    const ch = cellH * 2;

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(cx + 2, cy + 2, cw - 4, ch - 4);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('TIỆM TẠP HÓA KEYT • TỬ VI ĐẨU SỐ THIÊN KỶ', cx + 32, cy + 46);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(chart.birthInfo.name || 'Lá Số Đương Số', cx + 32, cy + 84);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '600 15px Inter, sans-serif';
    const hourLabel = HOUR_BRANCH_LABELS_VI[chart.birthInfo.hour]?.nameVi || '';
    ctx.fillText(
      `Giới tính: ${translateYinYangGender(chart.yinYangGender)} • Cục: ${translateWuxingJu(
        chart.wuxingJuName
      )}`,
      cx + 32,
      cy + 125
    );
    ctx.fillText(
      `Dương lịch: ${chart.birthInfo.day}/${chart.birthInfo.month}/${chart.birthInfo.year} (${hourLabel})`,
      cx + 32,
      cy + 155
    );
    ctx.fillText(
      `Âm lịch: Ngày ${chart.lunarInfo.lunarDay}/${Math.abs(
        chart.lunarInfo.lunarMonth
      )} năm ${translateStem(STEMS[chart.lunarInfo.yearStem])} ${translateBranch(
        BRANCHES[chart.lunarInfo.yearBranch]
      )}`,
      cx + 32,
      cy + 185
    );
    ctx.fillText(
      `Mệnh chủ: ${translateStarName(chart.mingZhu || '')} • Thân chủ: ${translateStarName(
        chart.shenZhu || ''
      )}`,
      cx + 32,
      cy + 215
    );
    ctx.fillText(`Nơi sinh: ${chart.birthInfo.city || 'Việt Nam'}`, cx + 32, cy + 245);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillText('taphoakeyt.com/tu-vi — Hệ thống Lập Lá Số & Luận Giải Tử Vi AI', cx + 32, cy + ch - 28);
  }, [chart]);

  if (!chart) return null;

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    const safeName = (chart.birthInfo.name || 'la-so-tu-vi').replace(/\s+/g, '-').toLowerCase();
    a.href = dataUrl;
    a.download = `${safeName}-${chart.birthInfo.year}.png`;
    a.click();
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">Xuất Ảnh &amp; Chia Sẻ Lá Số Tử Vi</h3>
            <p className="text-xs text-slate-300">
              Tải ảnh lá số độ phân giải cao (PNG) hoặc sao chép liên kết chia sẻ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-slate-100 flex justify-center overflow-auto max-h-[65vh]">
          <canvas
            ref={canvasRef}
            className="w-full max-w-[680px] h-auto rounded-xl shadow-md border border-slate-300"
          />
        </div>

        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span className="text-emerald-700">Đã sao chép liên kết lá số!</span>
              </>
            ) : (
              <>
                <Link2 size={15} />
                <span>Sao Chép Link Lá Số</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>Tải Ảnh Lá Số PNG (HD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

