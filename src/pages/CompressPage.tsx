import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Download,
  RotateCcw,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

// Types
type OutputFormat = 'webp' | 'avif' | 'jpeg' | 'png';

interface CompressionOptions {
  format: OutputFormat;
  quality: number;
  width: number;
}

interface CompressionResult {
  name: string;
  mime: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  ratio: number;
  data: string; // base64
  error?: boolean;
}

type FileStatus = 'pending' | 'processing' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  result?: CompressionResult;
  errorMessage?: string;
  previewUrl?: string;
}

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (match server limit)

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function CompressPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [options, setOptions] = useState<CompressionOptions>({
    format: 'webp',
    quality: 80,
    width: 1600,
  });
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Validate files before adding
  const validateFiles = (newFiles: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];

    const remainingSlots = MAX_FILES - files.length;
    if (newFiles.length > remainingSlots) {
      errors.push(`Tối đa ${MAX_FILES} ảnh. Còn ${remainingSlots} chỗ trống.`);
      newFiles = newFiles.slice(0, remainingSlots);
    }

    for (const file of newFiles) {
      if (!SUPPORTED_TYPES.includes(file.type)) {
        errors.push(
          `"${file.name}" không được hỗ trợ. Định dạng cho phép: JPEG, PNG, WebP, AVIF, GIF`
        );
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" vượt quá 10MB.`);
        continue;
      }
      valid.push(file);
    }

    return { valid, errors };
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const { valid, errors } = validateFiles(newFiles);

      if (errors.length > 0) {
        setValidationError(errors.join(' '));
        setTimeout(() => setValidationError(null), 5000);
      }

      if (valid.length === 0) return;

      const entries: FileEntry[] = valid.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: 'pending' as FileStatus,
        previewUrl: URL.createObjectURL(file),
      }));

      setFiles((prev) => [...prev, ...entries]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files.length]
  );

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    },
    [addFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
        e.target.value = '';
      }
    },
    [addFiles]
  );

  // Compress a single file
  const compressFile = async (entry: FileEntry): Promise<CompressionResult | null> => {
    const formData = new FormData();
    formData.append('file', entry.file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/compress?format=${options.format}&quality=${options.quality}&width=${options.width}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        }
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Lỗi khi nén ảnh';
      throw new Error(message);
    }
  };

  // Compress all files
  const compressAll = async () => {
    if (files.length === 0 || isProcessingRef.current) return;
    isProcessingRef.current = true;

    // Reset all statuses
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'pending' as FileStatus, result: undefined, errorMessage: undefined }))
    );

    for (let i = 0; i < files.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'processing' as FileStatus } : f))
      );

      try {
        const result = await compressFile(files[i]);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'done' as FileStatus, result: result! } : f
          )
        );
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error' as FileStatus, errorMessage } : f
          )
        );
      }
    }

    isProcessingRef.current = false;
  };

  // Re-compress with current options
  const recompress = () => {
    compressAll();
  };

  // Download a single compressed image
  const downloadOne = (entry: FileEntry) => {
    if (!entry.result) return;
    const byteString = atob(entry.result.data);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: entry.result.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = options.format;
    const baseName = entry.file.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}-compressed.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all compressed images
  const downloadAll = () => {
    const doneFiles = files.filter((f) => f.status === 'done' && f.result);
    doneFiles.forEach((entry) => downloadOne(entry));
  };

  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Clear all files
  const clearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
  };

  const hasResults = files.some((f) => f.status === 'done');
  const isProcessing = files.some((f) => f.status === 'processing');
  const doneCount = files.filter((f) => f.status === 'done').length;

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#F05A28]/10 via-[#fdfbf7] to-[#F05A28]/5 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F05A28]/10 text-[#F05A28] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <ImageIcon size={16} />
            <span>Miễn phí • Không giới hạn</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Nén Ảnh Online Miễn Phí
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Giảm dung lượng ảnh tới 90% mà vẫn giữ chất lượng cao. Hỗ trợ WebP, AVIF, JPEG, PNG, GIF.
            Không cần đăng ký, xử lý nhanh, không lưu trữ ảnh trên server.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        {/* Options Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
            Tùy chọn nén
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Format */}
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Định dạng</label>
              <select
                value={options.format}
                onChange={(e) => setOptions((o) => ({ ...o, format: e.target.value as OutputFormat }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F05A28]/30 focus:border-[#F05A28] bg-white"
              >
                <option value="webp">WebP (khuyên dùng)</option>
                <option value="avif">AVIF (nhẹ nhất)</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">
                Chất lượng: <span className="font-semibold text-[#F05A28]">{options.quality}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={options.quality}
                onChange={(e) => setOptions((o) => ({ ...o, quality: Number(e.target.value) }))}
                className="w-full accent-[#F05A28]"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>Nhẹ nhất</span>
                <span>Chất lượng cao</span>
              </div>
            </div>

            {/* Width */}
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Chiều rộng tối đa (px)</label>
              <input
                type="number"
                min={100}
                max={4096}
                value={options.width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 100 && val <= 4096) {
                    setOptions((o) => ({ ...o, width: val }));
                  }
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F05A28]/30 focus:border-[#F05A28]"
              />
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer
            ${dragActive ? 'border-[#F05A28] bg-[#F05A28]/5 scale-[1.01]' : 'border-slate-200 hover:border-[#F05A28]/50 hover:bg-[#F05A28]/[0.02]'}
            ${files.length >= MAX_FILES ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload size={40} className="mx-auto mb-4 text-[#F05A28]/70" />
          <p className="text-slate-700 font-medium text-lg mb-1">
            Kéo thả ảnh vào đây hoặc nhấn để chọn
          </p>
          <p className="text-slate-400 text-sm">
            Tối đa {MAX_FILES} ảnh • Mỗi ảnh tối đa 10MB • JPEG, PNG, WebP, AVIF, GIF
          </p>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* File list & actions */}
        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={compressAll}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 bg-[#F05A28] hover:bg-[#d94d20] disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                {isProcessing ? 'Đang nén...' : hasResults ? 'Nén lại' : 'Nén ảnh'}
              </button>

              {hasResults && (
                <button
                  onClick={recompress}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 border border-[#F05A28] text-[#F05A28] hover:bg-[#F05A28]/5 disabled:opacity-50 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <RotateCcw size={16} />
                  Nén lại với tùy chọn mới
                </button>
              )}

              {doneCount > 1 && (
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <FileDown size={16} />
                  Tải tất cả ({doneCount})
                </button>
              )}

              <button
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1.5 text-slate-500 hover:text-red-500 text-sm transition-colors"
              >
                <X size={16} />
                Xóa tất cả
              </button>
            </div>

            {/* File cards */}
            <div className="space-y-3">
              {files.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm"
                >
                  {/* Preview thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    {entry.previewUrl && (
                      <img
                        src={entry.previewUrl}
                        alt={entry.file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{entry.file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatBytes(entry.file.size)}
                      {entry.result && (
                        <>
                          {' → '}
                          <span className="text-emerald-600 font-medium">
                            {formatBytes(entry.result.compressedSize)}
                          </span>
                          <span className="text-emerald-600 ml-1">
                            (giảm {entry.result.ratio}%)
                          </span>
                        </>
                      )}
                    </p>

                    {/* Stats row */}
                    {entry.result && (
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                        <span>Gốc: {formatBytes(entry.result.originalSize)}</span>
                        <span>Sau nén: {formatBytes(entry.result.compressedSize)}</span>
                        <span>Tiết kiệm: {formatBytes(entry.result.savedBytes)}</span>
                      </div>
                    )}

                    {entry.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">{entry.errorMessage}</p>
                    )}
                  </div>

                  {/* Status & actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.status === 'pending' && (
                      <span className="text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded-lg">Chờ nén</span>
                    )}
                    {entry.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#F05A28] px-2 py-1 bg-[#F05A28]/5 rounded-lg">
                        <Loader2 size={12} className="animate-spin" />
                        Đang nén
                      </span>
                    )}
                    {entry.status === 'done' && (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg">
                          <CheckCircle2 size={12} />
                          Xong
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadOne(entry);
                          }}
                          className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Download size={12} />
                          Tải
                        </button>
                      </>
                    )}
                    {entry.status === 'error' && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 px-2 py-1 bg-red-50 rounded-lg">
                        <AlertCircle size={12} />
                        Lỗi
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(entry.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="w-12 h-12 bg-[#F05A28]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={24} className="text-[#F05A28]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Nhiều định dạng</h3>
            <p className="text-sm text-slate-500">
              Hỗ trợ WebP, AVIF, JPEG, PNG. Chuyển đổi định dạng tự do.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-[#F05A28]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Download size={24} className="text-[#F05A28]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Tải về ngay</h3>
            <p className="text-sm text-slate-500">
              Ảnh nén không lưu trên server. Tải về trực tiếp sau khi nén.
            </p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 bg-[#F05A28]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload size={24} className="text-[#F05A28]" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Batch processing</h3>
            <p className="text-sm text-slate-500">
              Nén tối đa 10 ảnh cùng lúc, mỗi ảnh tối đa 10MB.
            </p>
          </div>
        </div>

        {/* SEO Content - How it works */}
        <section className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Cách nén ảnh online với KeyT Compress</h2>
          <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
            <p><strong>Bước 1:</strong> Chọn định dạng đầu ra (WebP, AVIF, JPEG hoặc PNG) và điều chỉnh chất lượng mong muốn.</p>
            <p><strong>Bước 2:</strong> Kéo thả ảnh vào vùng upload hoặc nhấn để chọn file từ máy tính. Hỗ trợ tối đa 10 ảnh cùng lúc.</p>
            <p><strong>Bước 3:</strong> Nhấn "Nén ảnh" và đợi vài giây. Hệ thống sẽ xử lý từng ảnh và hiển thị kết quả.</p>
            <p><strong>Bước 4:</strong> Tải về ảnh đã nén. Bạn có thể tải từng ảnh hoặc tải tất cả cùng lúc.</p>
          </div>
        </section>

        {/* SEO Content - Why compress */}
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tại sao cần nén ảnh?</h2>
          <ul className="space-y-2 text-slate-600 text-sm leading-relaxed list-disc list-inside">
            <li><strong>Tăng tốc website:</strong> Ảnh chiếm 50-80% dung lượng trang web. Nén ảnh giúp website load nhanh hơn đáng kể.</li>
            <li><strong>Cải thiện SEO:</strong> Google ưu tiên xếp hạng website có tốc độ tải nhanh. Ảnh nhẹ = Core Web Vitals tốt hơn.</li>
            <li><strong>Tiết kiệm băng thông:</strong> Giảm chi phí hosting và CDN khi ảnh nhẹ hơn 70-90%.</li>
            <li><strong>Tối ưu bán hàng online:</strong> Shopee, Lazada, Facebook yêu cầu ảnh dưới 2MB. Nén ảnh giúp ảnh sản phẩm đạt chuẩn.</li>
            <li><strong>Trải nghiệm người dùng:</strong> Ảnh tải nhanh giúp khách hàng không rời trang, tăng tỷ lệ chuyển đổi.</li>
          </ul>
        </section>

        {/* SEO Content - Format comparison */}
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">So sánh định dạng ảnh</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Định dạng</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Ưu điểm</th>
                  <th className="px-4 py-3 font-semibold text-slate-700">Phù hợp cho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-3 font-medium text-[#F05A28]">WebP</td><td className="px-4 py-3 text-slate-600">Nhẹ hơn JPEG 25-35%, hỗ trợ transparency</td><td className="px-4 py-3 text-slate-600">Website, blog, e-commerce</td></tr>
                <tr><td className="px-4 py-3 font-medium text-[#F05A28]">AVIF</td><td className="px-4 py-3 text-slate-600">Nhẹ nhất, chất lượng cao nhất</td><td className="px-4 py-3 text-slate-600">Website hiện đại, CDN</td></tr>
                <tr><td className="px-4 py-3 font-medium text-[#F05A28]">JPEG</td><td className="px-4 py-3 text-slate-600">Tương thích mọi nơi</td><td className="px-4 py-3 text-slate-600">Ảnh chụp, social media, email</td></tr>
                <tr><td className="px-4 py-3 font-medium text-[#F05A28]">PNG</td><td className="px-4 py-3 text-slate-600">Không mất chất lượng, hỗ trợ nền trong suốt</td><td className="px-4 py-3 text-slate-600">Logo, icon, ảnh cần nền trong suốt</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SEO Content - FAQ */}
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Nén ảnh có giảm chất lượng không?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Công cụ sử dụng thuật toán nén thông minh (lossy), giảm dung lượng 70-90% trong khi mắt thường gần như không nhận ra sự khác biệt. Bạn có thể điều chỉnh thanh chất lượng từ 1-100 để kiểm soát mức nén.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Ảnh có bị lưu trên server không?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Không. Ảnh được xử lý hoàn toàn trong bộ nhớ tạm và trả về ngay cho bạn. Không có ảnh nào được lưu trữ trên server sau khi xử lý. Quyền riêng tư của bạn được đảm bảo tuyệt đối.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Nên dùng WebP hay JPEG?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">WebP nhẹ hơn JPEG 25-35% ở cùng chất lượng và được hỗ trợ bởi mọi trình duyệt hiện đại (Chrome, Firefox, Safari, Edge). Nếu website bạn không cần hỗ trợ IE cũ, WebP là lựa chọn tốt nhất.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Có giới hạn bao nhiêu ảnh?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Bạn có thể nén tối đa 10 ảnh cùng lúc, mỗi ảnh tối đa 10MB. Không giới hạn số lần sử dụng trong ngày, hoàn toàn miễn phí.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Có cần đăng ký tài khoản không?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Không cần đăng ký, không cần đăng nhập. Chỉ cần mở trang và bắt đầu nén ảnh ngay lập tức.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Nén ảnh cho Shopee/Lazada có phù hợp không?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Hoàn toàn phù hợp. Các sàn thương mại điện tử yêu cầu ảnh sản phẩm dưới 2MB. Công cụ giúp bạn giảm dung lượng ảnh mà vẫn giữ chất lượng sắc nét, đạt chuẩn upload.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Ảnh GIF động có hỗ trợ không?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Có, công cụ hỗ trợ nén ảnh GIF động (animated GIF), giữ nguyên animation và giảm dung lượng đáng kể.</p>
            </details>
            <details className="group border border-slate-200 rounded-lg">
              <summary className="flex justify-between items-center cursor-pointer px-5 py-4 text-sm font-medium text-slate-800">Nén ảnh cho website thế nào cho tốt?<span className="ml-2 text-[#F05A28] group-open:rotate-180 transition-transform">▼</span></summary>
              <p className="px-5 pb-4 text-sm text-slate-600">Chọn format WebP, chất lượng 75-80, chiều rộng 1200-1600px. Cách này giảm 80-90% dung lượng mà vẫn đẹp trên mọi màn hình. Google khuyến nghị ảnh web dưới 200KB mỗi ảnh.</p>
            </details>
          </div>
        </section>

        {/* SEO Content - Related tools */}
        <section className="mt-12 max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Công cụ liên quan</h2>
          <div className="flex flex-wrap gap-3">
            <a href="/photo-frame" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-[#F05A28] hover:text-[#F05A28] transition-colors">
              🖼️ Photo Frame — Tạo khung ảnh chuyên nghiệp
            </a>
            <a href="/products" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-[#F05A28] hover:text-[#F05A28] transition-colors">
              🛒 Canva Pro, CapCut Pro giá rẻ
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
