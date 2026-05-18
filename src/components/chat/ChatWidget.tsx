import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChatSocket, type Message } from '../../hooks/useChatSocket';

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
        {message.content}
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
}: {
  onSend: (content: string) => void;
  onTyping: () => void;
}) {
  const [text, setText] = useState('');

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

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100">
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
  const {
    messages,
    isConnected,
    isReconnecting,
    isAdminOnline,
    isAdminTyping,
    sendMessage,
    emitTyping,
  } = useChatSocket();

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
          <MessageInput onSend={sendMessage} onTyping={emitTyping} />
        </div>
      )}
    </>
  );
}
