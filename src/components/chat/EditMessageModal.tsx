import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface EditMessageModalProps {
  message: {
    _id: string;
    content: string;
  };
  onSave: (messageId: string, content: string) => void;
  onClose: () => void;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  message,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_LENGTH = 2000;
  const remainingChars = MAX_LENGTH - content.length;
  const isValid = content.trim().length > 0 && content.length <= MAX_LENGTH;
  const hasChanged = content.trim() !== message.content.trim();

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
    // Select all text for easy editing
    textareaRef.current?.select();
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = async () => {
    if (!isValid || !hasChanged || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(message._id, content.trim());
      onClose();
    } catch (error) {
      console.error('Failed to save message:', error);
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Chỉnh sửa tin nhắn</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập nội dung tin nhắn..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F05A28] focus:border-transparent resize-none"
            rows={4}
            maxLength={MAX_LENGTH}
          />
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                remainingChars < 100 ? 'text-orange-500' : 'text-slate-400'
              }`}
            >
              {remainingChars} ký tự còn lại
            </span>
            {!isValid && content.trim().length === 0 && (
              <span className="text-xs text-red-500">Nội dung không được để trống</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || !hasChanged || isSaving}
            className="px-4 py-2 text-sm text-white bg-[#F05A28] hover:bg-[#d94d22] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        {/* Hint */}
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-400">
            Nhấn Ctrl+Enter để lưu nhanh
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditMessageModal;
