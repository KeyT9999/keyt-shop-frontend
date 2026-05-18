import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import API_BASE_URL from '../../config/api';

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  senderType: 'customer' | 'admin';
  content: string;
  timestamp: string;
}

interface Conversation {
  _id: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: string;
}

function getSocketUrl(): string {
  try { return new URL(API_BASE_URL).origin; }
  catch { return API_BASE_URL.replace(/\/api\/?$/, ''); }
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminChatBubble() {
  const { token } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==');
    audioRef.current.volume = 0.3;
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
        params: { status: 'active' },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Conversation[] = res.data.conversations || [];
      data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setConversations(data);
      setTotalUnread(data.reduce((s, c) => s + c.unreadCount, 0));
    } catch {}
  }, [token]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Socket connection as admin
  useEffect(() => {
    if (!token) return;
    const socket = io(getSocketUrl(), {
      auth: { token, role: 'admin' },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => { socket.emit('admin:join', { token }); });

    socket.on('admin:new_message', (data: { message: Message }) => {
      audioRef.current?.play().catch(() => {});
      fetchConversations();
      if (selectedConv && data.message.conversationId === selectedConv._id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socket.on('chat:conversation_created', () => { fetchConversations(); });
    socket.on('admin:conversation_updated', () => { fetchConversations(); });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedConv?._id]);

  // Fetch messages when selecting conversation
  useEffect(() => {
    if (!selectedConv || !token) { setMessages([]); return; }
    axios.get(`${API_BASE_URL}/chat/conversations/${selectedConv._id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setMessages(res.data.messages || [])).catch(() => {});
  }, [selectedConv, token]);

  // Auto scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Send message
  const handleSend = () => {
    if (!text.trim() || !socketRef.current || !selectedConv) return;
    socketRef.current.emit('chat:send_message', { conversationId: selectedConv._id, content: text.trim() });
    setText('');
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 bg-slate-800 text-white rounded-full shadow-md flex items-center justify-center hover:bg-slate-700 transition-all"
      >
        <MessageCircle size={22} />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[380px] h-[520px] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white">
            {selectedConv && (
              <button onClick={() => setSelectedConv(null)} className="p-1 hover:bg-slate-700 rounded">
                <ChevronLeft size={18} />
              </button>
            )}
            <h3 className="font-semibold text-sm flex-1">
              {selectedConv ? selectedConv.customerName : `Tin nhắn (${totalUnread})`}
            </h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {!selectedConv ? (
            // Conversation list
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">Chưa có tin nhắn nào</p>
              )}
              {conversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConv(conv)}
                  className="w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-slate-800">{conv.customerName}</span>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage || '...'}</p>
                </button>
              ))}
            </div>
          ) : (
            // Chat view
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                {messages.map(msg => (
                  <div key={msg._id} className={`flex flex-col ${msg.senderType === 'admin' ? 'items-end' : 'items-start'} mb-2`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                      msg.senderType === 'admin' ? 'bg-slate-800 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100">
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Trả lời..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-500"
                />
                <button onClick={handleSend} disabled={!text.trim()} className="p-2 bg-slate-800 text-white rounded-lg disabled:opacity-40 hover:bg-slate-700">
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
