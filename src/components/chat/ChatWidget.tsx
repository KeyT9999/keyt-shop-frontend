import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Paperclip, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { useChatSocket, type Message } from '../../hooks/useChatSocket';
import { uploadChatFile } from '../../services/chatUpload';
import { playChatNotificationSound } from '../../utils/chatNotificationSound';
import { useAuthContext } from '../../context/useAuthContext';
import MessageReactions from './MessageReactions';
import MessageActions from './MessageActions';
import EditMessageModal from './EditMessageModal';
import MessageSearch from './MessageSearch';

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip';
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Giới hạn kích thước ảnh paste từ clipboard: 5MB
const PASTE_MAX_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// --- Sub-components ---

function ChatBubble({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-50 w-12 h-12 bg-[#F05A28] text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-300"
      title="Chat hỗ trợ"
      aria-label="Mở chat hỗ trợ"
    >
      <MessageCircle size={26} />
    </button>
  );
}

function ChatPanelHeader({
  isAdminOnline,
  onClose,
  onSearchToggle,
}: {
  isAdminOnline: boolean;
  onClose: () => void;
  onSearchToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#F05A28] text-white rounded-t-xl">
      <div>
        <h3 className="font-semibold text-sm">Hỗ trợ trực tuyến</h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-300' : 'bg-gray-300'}`}
          />
          <span className="text-xs opacity-90">
            {isAdminOnline ? 'Đang trực tuyến' : 'Thường trả lời trong vài phút'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchToggle}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Tìm kiếm tin nhắn"
        >
          <Search size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Đóng chat"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="text-xs text-slate-500">Admin đang nhập</span>
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function MessageItem({ 
  message,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
}: { 
  message: Message;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
}) {
  const isCustomer = message.senderType === 'customer';

  const renderContent = () => {
    // Check if deleted first
    if (message.isDeleted) {
      return <span className="italic opacity-60">Tin nhắn đã bị xóa</span>;
    }

    if (message.messageType === 'image' && message.fileUrl) {
      return (
        <img
          src={message.fileUrl}
          alt={message.fileName || 'Hình ảnh'}
          className="max-w-[200px] rounded-lg cursor-pointer"
          onClick={() => window.open(message.fileUrl, '_blank')}
        />
      );
    }
    if (message.messageType === 'file' && message.fileUrl) {
      return (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <span className="text-lg">📄</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName || 'Tệp đính kèm'}</p>
            {message.fileSize && (
              <p className="text-xs opacity-75">{formatBytes(message.fileSize)}</p>
            )}
          </div>
        </a>
      );
    }
    return message.content;
  };

  return (
    <div id={`message-${message._id}`} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} mb-2`}>
      <span className="text-[10px] text-slate-400 mb-0.5 px-1">
        {isCustomer ? 'Bạn' : 'Admin'}
      </span>
      <div
        className={`relative group max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed overflow-visible ${
          message.isDeleted
            ? 'bg-slate-50 text-slate-400 border border-slate-200'
            : isCustomer
              ? 'bg-[#F05A28] text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        {/* MessageActions - show on hover */}
        <div className="absolute -top-2 -right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <MessageActions
            message={message}
            currentUserId={currentUserId}
            onEdit={() => onEditMessage?.(message)}
            onDelete={() => onDeleteMessage?.(message._id)}
          />
        </div>
        
        {renderContent()}
      </div>
      <span className="text-[10px] text-slate-400 mt-0.5 px-1">
        {formatTime(message.timestamp)}
        {message.editedAt && !message.isDeleted && (
          <span className="ml-1 italic">(đã chỉnh sửa)</span>
        )}
      </span>
      {!message.isDeleted && (
        <MessageReactions
          messageId={message._id}
          reactions={message.reactions || []}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
          align={isCustomer ? 'right' : 'left'}
        />
      )}
    </div>
  );
}

function MessageList({
  messages,
  isAdminTyping,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
}: {
  messages: Message[];
  isAdminTyping: boolean;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAdminTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3">
      {messages.length === 0 && (
        <p className="text-center text-slate-400 text-sm mt-8">
          Xin chào! Bạn cần hỗ trợ gì?
        </p>
      )}
      {messages.map((msg) => (
        <MessageItem 
          key={msg._id} 
          message={msg}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
        />
      ))}
      {isAdminTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

/**
 * PendingImagePreview — Hiển thị preview ảnh paste từ clipboard trước khi gửi.
 * Cho phép user xem lại và hủy nếu paste nhầm.
 */
function PendingImagePreview({
  file,
  previewUrl,
  onCancel,
}: {
  file: File;
  previewUrl: string;
  onCancel: () => void;
}) {
  return (
    <div
      className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-slate-100 p-2"
      style={{
        animation: 'chatPreviewSlideIn 0.15s ease',
      }}
    >
      <img
        src={previewUrl}
        alt="preview"
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
          <ImageIcon size={11} className="flex-shrink-0 text-[#F05A28]" />
          {file.name || 'Ảnh từ clipboard'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
      </div>
      <button
        onClick={onCancel}
        className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded flex-shrink-0"
        aria-label="Hủy ảnh"
        title="Hủy"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function MessageInput({
  onSend,
  onTyping,
  onFileSelect,
  onPaste,
  isUploading,
  hasPendingImage,
}: {
  onSend: (content: string) => void;
  onTyping: () => void;
  onFileSelect: (file: File) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  hasPendingImage: boolean;
}) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim() && !hasPendingImage) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-slate-500 hover:text-[#F05A28] rounded-lg transition-colors disabled:opacity-40"
        aria-label="Đính kèm tệp"
      >
        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={hasPendingImage ? 'Nhấn gửi để gửi ảnh...' : 'Nhập tin nhắn...'}
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#F05A28] bg-white"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() && !hasPendingImage || isUploading}
        className="p-2 text-white bg-[#F05A28] rounded-lg disabled:opacity-40 hover:bg-[#d94d22] transition-colors"
        aria-label="Gửi tin nhắn"
      >
        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </div>
  );
}

// --- CSS keyframes cho animation (inject vào head nếu chưa có) ---
const ANIMATION_STYLE_ID = 'chat-widget-animations';
if (typeof document !== 'undefined' && !document.getElementById(ANIMATION_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = ANIMATION_STYLE_ID;
  style.textContent = `
    @keyframes chatPreviewSlideIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// --- Main Widget ---

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State cho pending image (paste từ clipboard)
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const pasteErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State cho edit message modal
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // State cho search
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Get user context for reactions
  const { token, user } = useAuthContext();

  /**
   * Callback khi có tin nhắn mới từ admin.
   * useCallback vì isOpen sẽ thay đổi khi user mở/đóng chat.
   * Chỉ phát âm thanh khi:
   *   - Chat panel đang đóng (isOpen === false), HOẶC
   *   - Tab đang bị ẩn (người dùng đang ở tab khác)
   */
  const handleNewAdminMessage = useCallback(() => {
    if (!isOpen || document.hidden) {
      playChatNotificationSound();
    }
  }, [isOpen]);

  const {
    messages,
    isConnected,
    isReconnecting,
    isAdminOnline,
    isAdminTyping,
    sendMessage,
    sendFileMessage,
    emitTyping,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    conversationId,
  } = useChatSocket({ onNewAdminMessage: handleNewAdminMessage });

  // Chat customer messages/reactions are keyed by socket sessionId in the backend.
  // Prefer sessionId so reaction highlighting and edit/delete ownership match Message.sender.
  const sessionId = localStorage.getItem('keyt_chat_session_id') || '';
  const currentUserId = sessionId || user?.id || '';

  // Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    editMessage(messageId, content);
    setEditingMessage(null);
  };

  // Handle delete message
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Handle search result click - scroll to message
  const handleSearchResultClick = (messageId: string) => {
    setIsSearchOpen(false);
    
    // Wait for search panel to close, then scroll
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const clearPendingImage = useCallback(() => {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImage(null);
    setPendingImageUrl(null);
  }, [pendingImageUrl]);

  // Cleanup object URL khi pendingImageUrl thay đổi (tránh memory leak)
  useEffect(() => {
    return () => {
      if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    };
  }, [pendingImageUrl]);

  // Xóa pending image khi đóng chat
  useEffect(() => {
    if (!isOpen) {
      clearPendingImage();
    }
  }, [clearPendingImage, isOpen]);

  // Cleanup error timer khi unmount
  useEffect(() => {
    return () => {
      if (pasteErrorTimerRef.current) clearTimeout(pasteErrorTimerRef.current);
    };
  }, []);

  function showPasteError(msg: string) {
    setPasteError(msg);
    if (pasteErrorTimerRef.current) clearTimeout(pasteErrorTimerRef.current);
    pasteErrorTimerRef.current = setTimeout(() => setPasteError(null), 3000);
  }

  /**
   * Xử lý sự kiện Ctrl+V trong ô chat.
   * Chỉ can thiệp khi clipboard chứa ảnh — để text paste hoạt động bình thường.
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return; // Không có ảnh → để browser tự xử lý paste text

    e.preventDefault(); // Chặn paste text khi có ảnh

    const file = imageItem.getAsFile();
    if (!file) return;

    // Validate MIME type
    if (!IMAGE_MIMES.includes(file.type)) {
      showPasteError('Định dạng ảnh không được hỗ trợ');
      return;
    }

    // Validate kích thước
    if (file.size > PASTE_MAX_SIZE) {
      showPasteError('Ảnh quá lớn (tối đa 5MB)');
      return;
    }

    // Tạo object URL để preview
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl); // Cleanup URL cũ
    const url = URL.createObjectURL(file);
    setPendingImage(file);
    setPendingImageUrl(url);
    setPasteError(null);
  };

  /**
   * Xử lý gửi tin nhắn.
   * Ưu tiên: nếu có pending image → upload + sendFileMessage.
   * Ngược lại → gửi text như bình thường.
   */
  const handleSend = async (content: string) => {
    if (pendingImage) {
      setIsUploading(true);
      try {
        const sessionId = localStorage.getItem('keyt_chat_session_id') || '';
        const result = await uploadChatFile(pendingImage, { sessionId });
        const messageType = IMAGE_MIMES.includes(result.fileMime) ? 'image' : 'file';
        sendFileMessage({ ...result, messageType });
        clearPendingImage();
      } catch (err) {
        console.error('[ChatWidget] Paste image upload failed:', err);
        showPasteError('Gửi ảnh thất bại, vui lòng thử lại');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Không có pending image → gửi text
    if (content.trim()) {
      sendMessage(content);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    try {
      const sessionId = localStorage.getItem('keyt_chat_session_id') || '';
      const result = await uploadChatFile(file, { sessionId });
      const messageType = IMAGE_MIMES.includes(result.fileMime) ? 'image' : 'file';
      sendFileMessage({ ...result, messageType });
    } catch (err) {
      console.error('[ChatWidget] File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {!isOpen && <ChatBubble onClick={() => setIsOpen(true)} />}

      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[350px] h-[500px] flex flex-col bg-[#fdfbf7] rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <ChatPanelHeader
            isAdminOnline={isAdminOnline}
            onClose={() => setIsOpen(false)}
            onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
          />

          {/* Connection status banner */}
          {isReconnecting && (
            <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs text-center">
              Đang kết nối lại...
            </div>
          )}
          {!isConnected && !isReconnecting && (
            <div className="px-3 py-1 bg-red-50 text-red-600 text-xs text-center">
              Mất kết nối
            </div>
          )}

          {/* Conditionally render MessageSearch or MessageList */}
          {isSearchOpen ? (
            <div className="flex-1 min-h-0">
              <MessageSearch
                conversationId={conversationId || ''}
                onResultClick={handleSearchResultClick}
                onClose={() => setIsSearchOpen(false)}
                token={token}
                sessionId={sessionId}
              />
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              isAdminTyping={isAdminTyping}
              currentUserId={currentUserId}
              onAddReaction={addReaction}
              onRemoveReaction={removeReaction}
              onEditMessage={setEditingMessage}
              onDeleteMessage={handleDeleteMessage}
            />
          )}

          {/* Preview ảnh paste từ clipboard */}
          {pendingImage && pendingImageUrl && (
            <PendingImagePreview
              file={pendingImage}
              previewUrl={pendingImageUrl}
              onCancel={clearPendingImage}
            />
          )}

          {/* Inline error message */}
          {pasteError && (
            <p className="text-xs text-red-500 px-4 pb-1">{pasteError}</p>
          )}

          <MessageInput
            onSend={handleSend}
            onTyping={emitTyping}
            onFileSelect={handleFileSelect}
            onPaste={handlePaste}
            isUploading={isUploading}
            hasPendingImage={!!pendingImage}
          />
        </div>
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onSave={handleEditMessage}
          onClose={() => setEditingMessage(null)}
        />
      )}
    </>
  );
}
