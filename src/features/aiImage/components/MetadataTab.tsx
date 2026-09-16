import { useState } from 'react';
import { CheckCircle2, Download, Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { detectAiMetadata, stripMetadata } from '../services/aiMetadata';
import type { AiMetadataFinding } from '../types';
import ErrorNotice from './ErrorNotice';

interface Props {
  file: File | null;
}

export default function MetadataTab({ file }: Props) {
  const [loading, setLoading] = useState(false);
  const [stripping, setStripping] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [findings, setFindings] = useState<AiMetadataFinding[] | null>(null);

  const scan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setFindings(null);
    try {
      setFindings(await detectAiMetadata(file));
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  };

  const strip = async () => {
    if (!file) return;
    setStripping(true);
    setError(null);
    try {
      const { blob, format } = await stripMetadata(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const base = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo';
      a.download = `${base}-clean.${format === 'png' ? 'png' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setStripping(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Kiểm tra ảnh có chứa metadata do công cụ AI nhúng vào không (chứng chỉ C2PA, thông số Stable Diffusion, marker
        EXIF/XMP...) và xóa sạch bằng cách tạo lại file — xử lý 100% trên trình duyệt.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={scan}
          disabled={!file || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
          Kiểm tra metadata AI
        </button>
        <button
          onClick={strip}
          disabled={!file || stripping}
          className="inline-flex items-center gap-2 rounded-lg border border-orange-600 px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {stripping ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Xóa metadata &amp; tải về
        </button>
      </div>

      {!file && <p className="text-xs text-slate-500">Hãy chọn một ảnh ở khung bên trái trước.</p>}

      <ErrorNotice error={error} />

      {findings !== null && (
        findings.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle2 size={18} /> Không phát hiện metadata AI hiển nhiên trong ảnh này.
          </div>
        ) : (
          <div className="space-y-2">
            {findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <ShieldAlert size={17} className="mt-0.5 shrink-0" />
                <div>
                  <p>{f.label}</p>
                  {f.detail && <p className="mt-0.5 text-xs text-amber-600">({f.detail})</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <p className="text-xs text-slate-400">
        Lưu ý: công cụ này chỉ kiểm tra và xóa <b>metadata hiển nhiên</b> trong file. Watermark vô hình nhúng vào pixel
        (như SynthID của Google) không thể xóa bằng trình duyệt.
      </p>
    </div>
  );
}
