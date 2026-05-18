import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import API_BASE_URL from '../config/api';

export interface CompressionOptions {
  format: 'webp' | 'avif' | 'jpeg' | 'png';
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
  data: string;
  error?: boolean;
}

interface CompressionPreviewProps {
  file: File;
  onConfirm: (file: File, options: CompressionOptions) => void;
  onCancel: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function CompressionPreview({ file, onConfirm, onCancel }: CompressionPreviewProps) {
  const [options, setOptions] = useState<CompressionOptions>({
    format: 'webp',
    quality: 80,
    width: 1600,
  });
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Validate file size on mount
  useEffect(() => {
    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(`File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Kích thước tối đa cho phép là 50MB.`);
    } else {
      setFileSizeError(null);
    }
  }, [file]);

  // Generate original image preview
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const callCompressApi = useCallback(async (opts: CompressionOptions) => {
    if (file.size > MAX_FILE_SIZE) return;

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<CompressionResult>(
        `${API_BASE_URL}/compress?format=${opts.format}&quality=${opts.quality}&width=${opts.width}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal,
        }
      );

      if (response.data.error) {
        setError(response.data.name || 'Nén ảnh thất bại');
        setResult(null);
      } else {
        setResult(response.data);
        setError(null);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Đã xảy ra lỗi khi nén ảnh';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [file]);

  // Debounce API calls on option changes
  useEffect(() => {
    if (fileSizeError) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      callCompressApi(options);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [options, callCompressApi, fileSizeError]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleRetry = () => {
    callCompressApi(options);
  };

  const handleConfirm = () => {
    onConfirm(file, options);
  };

  const formatBytes = (bytes: number): string => {
    return (bytes / 1024).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Xem trước nén ảnh</h3>

      {/* File size validation error */}
      {fileSizeError && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{fileSizeError}</span>
        </div>
      )}

      {/* Controls */}
      {!fileSizeError && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Format selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Định dạng</label>
            <select
              value={options.format}
              onChange={(e) => setOptions((prev) => ({ ...prev, format: e.target.value as CompressionOptions['format'] }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            >
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          {/* Quality slider */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chất lượng: {options.quality}
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={options.quality}
              onChange={(e) => setOptions((prev) => ({ ...prev, quality: Number(e.target.value) }))}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Max width */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chiều rộng tối đa (px)</label>
            <input
              type="number"
              min={100}
              max={4000}
              value={options.width}
              onChange={(e) => {
                const val = Math.min(4000, Math.max(100, Number(e.target.value) || 100));
                setOptions((prev) => ({ ...prev, width: val }));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none"
            />
          </div>
        </div>
      )}

      {/* Image comparison */}
      {!fileSizeError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Original */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-600 mb-2">Ảnh gốc</p>
            <div className="aspect-video bg-slate-100 rounded overflow-hidden flex items-center justify-center">
              <img
                src={originalPreview}
                alt="Original"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          {/* Compressed preview */}
          <div className="border border-slate-200 rounded-lg p-3">
            <p className="text-sm font-medium text-slate-600 mb-2">Ảnh đã nén</p>
            <div className="aspect-video bg-slate-100 rounded overflow-hidden flex items-center justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">Đang nén...</span>
                </div>
              )}
              {!loading && result && (
                <img
                  src={`data:${result.mime};base64,${result.data}`}
                  alt="Compressed"
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {!loading && !result && !error && (
                <span className="text-sm text-slate-400">Chưa có kết quả</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {result && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Kích thước gốc</p>
            <p className="text-sm font-semibold text-slate-800">{formatBytes(result.originalSize)} KB</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-500">Sau nén</p>
            <p className="text-sm font-semibold text-slate-800">{formatBytes(result.compressedSize)} KB</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-green-600">Tiết kiệm</p>
            <p className="text-sm font-semibold text-green-700">{formatBytes(result.savedBytes)} KB</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-600">Tỷ lệ nén</p>
            <p className="text-sm font-semibold text-orange-700">{result.ratio}%</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && !loading && (
        <div className="flex items-center justify-between p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
          Hủy
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading || !!fileSizeError || !!error}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Xác nhận upload
        </button>
      </div>
    </div>
  );
}
