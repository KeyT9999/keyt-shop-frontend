import { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadProps {
  onUpload: (files: File[]) => void;
}

export default function Upload({ onUpload }: UploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === 'image/jpeg' || file.type === 'image/heic' || file.type === 'image/png'
      );
      if (files.length > 20) {
        alert('Please upload a maximum of 20 photos at a time.');
        onUpload(files.slice(0, 20));
      } else if (files.length > 0) {
        onUpload(files);
      }
    },
    [onUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 20) {
      alert('Please upload a maximum of 20 photos at a time.');
      onUpload(files.slice(0, 20));
    } else if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div
      className="upload-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/jpeg, image/png, image/heic"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="upload-content">
        <UploadCloud size={48} className="upload-icon" />
        <p className="upload-text">Drag &amp; drop your photos here</p>
        <p className="upload-subtext">or click to browse from your device</p>
        <p className="upload-hint">Supports JPG, PNG, HEIC (Max 20 photos)</p>
      </div>
    </div>
  );
}
