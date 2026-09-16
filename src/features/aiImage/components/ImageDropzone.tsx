import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { ACCEPT_ATTR } from '../constants';

interface Props {
  previewUrl: string | null;
  fileName?: string;
  onSelect: (file: File) => void;
  onClear: () => void;
}

/** Khu vực chọn ảnh: kéo-thả, click chọn, hoặc Ctrl+V dán từ clipboard */
export default function ImageDropzone({ previewUrl, fileName, onSelect, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const file = Array.from(files).find((f) => f.type.startsWith('image/') || f.type === '');
      if (file) onSelect(file as File);
    },
    [onSelect]
  );

  // Dán ảnh từ clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.files;
      if (items && items.length > 0) handleFiles(items);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFiles]);

  if (previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <img src={previewUrl} alt="Ảnh đã chọn" className="mx-auto max-h-[360px] w-auto object-contain" />
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2">
          <span className="truncate text-xs text-slate-500">{fileName || 'Ảnh đã chọn'}</span>
          <button
            onClick={onClear}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 hover:text-red-600"
          >
            <X size={13} /> Chọn ảnh khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition ${
        dragging ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-white hover:border-orange-400 hover:bg-orange-50/40'
      }`}
    >
      <ImagePlus size={36} className="text-slate-400" />
      <p className="text-sm font-semibold text-slate-600">Kéo thả ảnh vào đây, bấm để chọn, hoặc Ctrl+V để dán</p>
      <p className="text-xs text-slate-400">JPEG, PNG, WebP, HEIC — tối đa 20MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
