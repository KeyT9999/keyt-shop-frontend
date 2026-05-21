import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  message: {
    _id: string;
    timestamp: string;
    sender: string;
    isDeleted?: boolean;
  };
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionCheckedAt, setActionCheckedAt] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user owns the message
  const isOwner = message.sender === currentUserId;

  // Calculate time limits from the moment the actions menu is opened.
  const messageAge = actionCheckedAt - new Date(message.timestamp).getTime();
  const EDIT_TIME_LIMIT = 15 * 60 * 1000; // 15 minutes
  const DELETE_TIME_LIMIT = 60 * 60 * 1000; // 1 hour

  const canEdit = isOwner && !message.isDeleted && actionCheckedAt > 0 && messageAge < EDIT_TIME_LIMIT;
  const canDelete = isOwner && !message.isDeleted && actionCheckedAt > 0 && messageAge < DELETE_TIME_LIMIT;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      onDelete();
    }
  };

  const handleToggle = () => {
    const nextOpen = !isOpen;
    if (nextOpen) {
      setActionCheckedAt(Date.now());
    }
    setIsOpen(nextOpen);
  };

  // Don't show actions if user doesn't own message or message is deleted
  if (!isOwner || message.isDeleted) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="rounded-full border border-slate-200 bg-white p-1 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
        aria-label="Message actions"
      >
        <MoreVertical size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[70] mt-1 min-w-[120px] rounded-lg border border-slate-200 bg-white py-1 text-slate-700 shadow-lg">
          <button
            onClick={handleEdit}
            disabled={!canEdit}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              canEdit
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title={!canEdit ? 'Chỉ có thể chỉnh sửa trong 15 phút' : ''}
          >
            <Edit2 size={14} />
            <span>Chỉnh sửa</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={!canDelete}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
              canDelete
                ? 'text-red-600 hover:bg-red-50'
                : 'text-slate-300 cursor-not-allowed'
            }`}
            title={!canDelete ? 'Chỉ có thể xóa trong 1 giờ' : ''}
          >
            <Trash2 size={14} />
            <span>Xóa</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageActions;
