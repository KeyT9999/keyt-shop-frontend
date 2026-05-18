import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, Loader2 } from 'lucide-react';
import { useChatSocket, type Message } from '../../hooks/useChatSocket';
import { uploadChatFile } from '../../services/chatUpload';

const ACCEPTED_FILE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip';
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
}: {
  isAdminOnline: boolean;
  onClose: () => void;
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
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Đóng chat"
      >
        <X size={20} />
      </button>
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

function MessageItem({ message }: { message: Message }) {
  const isCustomer = message.senderType === 'customer';

  const renderContent = () => {
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
    <div className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} mb-2`}>
      <span className="text-[10px] text-slate-400 mb-0.5 px-1">
        {isCustomer ? 'Bạn' : 'Admin'}
      </span>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
          isCustomer
            ? 'bg-[#F05A28] text-white rounded-br-sm'
            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        {renderContent()}
      </div>
      <span className="text-[10px] text-slate-400 mt-0.5 px-1">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

function MessageList({
  messages,
  isAdminTyping,
}: {
  messages: Message[];
  isAdminTyping: boolean;
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
        <MessageItem key={msg._id} message={msg} />
      ))}
      {isAdminTyping && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
}

function MessageInput({
  onSend,
  onTyping,
  onFileSelect,
  isUploading,
}: {
  onSend: (content: string) => void;
  onTyping: () => void;
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}) {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
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
        placeholder="Nhập tin nhắn..."
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#F05A28] bg-white"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="p-2 text-white bg-[#F05A28] rounded-lg disabled:opacity-40 hover:bg-[#d94d22] transition-colors"
        aria-label="Gửi tin nhắn"
      >
        <Send size={18} />
      </button>
    </div>
  );
}

// --- Main Widget ---

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const {
    messages,
    isConnected,
    isReconnecting,
    isAdminOnline,
    isAdminTyping,
    sendMessage,
    sendFileMessage,
    emitTyping,
  } = useChatSocket();

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

          <MessageList messages={messages} isAdminTyping={isAdminTyping} />
          <MessageInput
            onSend={sendMessage}
            onTyping={emitTyping}
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
          />
        </div>
      )}
    </>
  );
}
