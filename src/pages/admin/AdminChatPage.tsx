import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { MessageCircle, Send, CheckCircle, Circle, Search } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import API_BASE_URL from '../../config/api';
import MessageReactions from '../../components/chat/MessageReactions';
import MessageActions from '../../components/chat/MessageActions';
import EditMessageModal from '../../components/chat/EditMessageModal';
import MessageSearch from '../../components/chat/MessageSearch';

// --- Types ---

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  senderType: 'customer' | 'admin';
  content: string;
  readStatus: boolean;
  timestamp: string;
  isDeleted?: boolean;
  deletedAt?: string;
  editedAt?: string;
  editHistory?: Array<{
    content: string;
    editedAt: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
}

interface Conversation {
  _id: string;
  customerId?: string;
  sessionId?: string;
  customerName: string;
  customerEmail?: string;
  status: 'active' | 'resolved';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- Helpers ---

function getSocketUrl(): string {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- Sub-components ---

function ConversationFilter({
  filter,
  onChange,
}: {
  filter: 'active' | 'resolved';
  onChange: (f: 'active' | 'resolved') => void;
}) {
  return (
    <div className="flex border-b border-slate-200">
      <button
        onClick={() => onChange('active')}
        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
          filter === 'active'
            ? 'text-slate-900 border-b-2 border-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Đang hoạt động
      </button>
      <button
        onClick={() => onChange('resolved')}
        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
          filter === 'resolved'
            ? 'text-slate-900 border-b-2 border-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Đã xử lý
      </button>
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        isSelected ? 'bg-slate-100' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-slate-800 truncate">
          {conversation.customerName}
        </span>
        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
          {formatDate(conversation.lastMessageAt)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-slate-500 truncate max-w-[200px]">
          {conversation.lastMessage || 'Chưa có tin nhắn'}
        </p>
        {conversation.unreadCount > 0 && (
          <span className="ml-2 bg-[#F05A28] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {conversation.unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  loading,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: 'active' | 'resolved';
  onFilterChange: (f: 'active' | 'resolved') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
}) {
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MessageCircle size={20} />
          Chat
        </h2>
      </div>
      <ConversationFilter filter={filter} onChange={onFilterChange} />
      <div className="px-3 py-3 border-b border-slate-100">
        <label className="relative block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm tên, email hoặc session..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
            aria-label="Tìm kiếm khách hàng trong chat"
          />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="text-center text-slate-400 text-sm py-8">Đang tải...</p>
        )}
        {!loading && conversations.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            {hasSearch ? 'Không tìm thấy khách hàng' : 'Không có cuộc hội thoại nào'}
          </p>
        )}
        {conversations.map((conv) => (
          <ConversationItem
            key={conv._id}
            conversation={conv}
            isSelected={selectedId === conv._id}
            onClick={() => onSelect(conv._id)}
          />
        ))}
      </div>
    </div>
  );
}

function AdminMessageItem({
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
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
}) {
  const isAdmin = message.senderType === 'admin';
  const isDeleted = Boolean(message.isDeleted);

  return (
    <div
      id={`admin-message-${message._id}`}
      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} mb-2`}
    >
      <span className="text-[10px] text-slate-400 mb-0.5 px-1">
        {isAdmin ? 'Bạn' : 'Khách'}
      </span>
      <div
        className={`relative group max-w-[70%] px-3 py-2 rounded-xl text-sm leading-relaxed overflow-visible ${
          isDeleted
            ? 'bg-slate-50 text-slate-400 border border-slate-200'
            : isAdmin
              ? 'bg-slate-800 text-white rounded-br-sm'
              : 'bg-slate-100 text-slate-800 rounded-bl-sm'
        }`}
      >
        <div className="absolute -top-2 -right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <MessageActions
            message={message}
            currentUserId={currentUserId}
            onEdit={() => onEditMessage(message)}
            onDelete={() => onDeleteMessage(message._id)}
          />
        </div>
        {isDeleted ? (
          <span className="italic opacity-70">Tin nhắn đã bị xóa</span>
        ) : (
          message.content
        )}
      </div>
      <span className="text-[10px] text-slate-400 mt-0.5 px-1">
        {formatTime(message.timestamp)}
        {message.editedAt && !isDeleted && (
          <span className="ml-1 italic">(đã chỉnh sửa)</span>
        )}
      </span>
      {!isDeleted && (
        <MessageReactions
          messageId={message._id}
          reactions={message.reactions || []}
          currentUserId={currentUserId}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
          align={isAdmin ? 'right' : 'left'}
        />
      )}
    </div>
  );
}

function AdminTypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="text-xs text-slate-500">Khách đang nhập</span>
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

function AdminMessageInput({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (content: string) => void;
  onTyping: () => void;
  disabled: boolean;
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
    <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200 bg-white">
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Chọn cuộc hội thoại...' : 'Nhập tin nhắn...'}
        disabled={disabled}
        className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="p-2 text-white bg-slate-800 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors"
        aria-label="Gửi tin nhắn"
      >
        <Send size={18} />
      </button>
    </div>
  );
}

function ConversationView({
  messages,
  isTyping,
  selectedConversation,
  onSend,
  onTyping,
  onResolve,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
  isSearchOpen,
  onSearchToggle,
  onSearchClose,
  onSearchResultClick,
  token,
}: {
  messages: Message[];
  isTyping: boolean;
  selectedConversation: Conversation | null;
  onSend: (content: string) => void;
  onTyping: () => void;
  onResolve: () => void;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  isSearchOpen: boolean;
  onSearchToggle: () => void;
  onSearchClose: () => void;
  onSearchResultClick: (messageId: string) => void;
  token?: string | null;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Chọn cuộc hội thoại để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-slate-800">
            {selectedConversation.customerName}
          </h3>
          <span className="text-xs text-slate-400">
            {selectedConversation.customerEmail || 'Khách ẩn danh'}
          </span>
        </div>
        <button
          onClick={onSearchToggle}
          className={`p-2 rounded-lg transition-colors ${
            isSearchOpen
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
          aria-label="Tìm kiếm tin nhắn"
          title="Tìm kiếm tin nhắn"
        >
          <Search size={16} />
        </button>
        {selectedConversation.status === 'active' && (
          <button
            onClick={onResolve}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle size={14} />
            Đánh dấu đã xử lý
          </button>
        )}
        {selectedConversation.status === 'resolved' && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg">
            <Circle size={14} />
            Đã xử lý
          </span>
        )}
      </div>

      {/* Messages */}
      {isSearchOpen ? (
        <div className="flex-1 min-h-0">
          <MessageSearch
            conversationId={selectedConversation._id}
            onResultClick={onSearchResultClick}
            onClose={onSearchClose}
            token={token}
          />
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm mt-8">Chưa có tin nhắn</p>
        )}
        {messages.map((msg) => (
          <AdminMessageItem
            key={msg._id}
            message={msg}
            currentUserId={currentUserId}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
          />
        ))}
        {isTyping && <AdminTypingIndicator />}
        <div ref={endRef} />
      </div>
      )}

      {/* Input */}
      <AdminMessageInput
        onSend={onSend}
        onTyping={onTyping}
        disabled={selectedConversation.status === 'resolved'}
      />
    </div>
  );
}

// --- Main Page ---

export default function AdminChatPage() {
  const { token, user } = useAuthContext();
  const [filter, setFilter] = useState<'active' | 'resolved'>('active');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const lastTypingEmit = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isTabFocused = useRef(true);
  const fetchConversationsRef = useRef<() => void>(() => {});

  // Audio notification setup
  useEffect(() => {
    // Create a simple beep using AudioContext
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkYuBb2RxfYqRjYJ1Z3N/i5GPg3VocoGMko+DdGhygoyTkIN0aXKCjJORg3Rpc4KMk5CDdGlzgYyTkINzaXOBjJOQgnRpc4GMk5CCdGlzgYyTkIJ0aXOBjJOQgnRpc4GMk5CCdGlzgYySkIJ0aXOBjJKQgnRpc4GMkpCCdGlzgYySkIJ0'
    );
    audioRef.current.volume = 0.3;
  }, []);

  // Tab focus tracking for unread count in title
  useEffect(() => {
    const handleFocus = () => {
      isTabFocused.current = true;
      document.title = 'Admin Chat - Mindora AI';
    };
    const handleBlur = () => {
      isTabFocused.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.title = 'Admin Chat - Mindora AI';
    };
  }, []);

  // Update tab title with unread count
  useEffect(() => {
    if (!isTabFocused.current && totalUnread > 0) {
      document.title = `(${totalUnread}) Admin Chat - Mindora AI`;
    }
  }, [totalUnread]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
        params: {
          status: filter,
          ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Conversation[] = res.data.conversations || res.data;
      // Sort by lastMessageAt desc
      data.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      setConversations(data);

      // Calculate total unread
      const unread = data.reduce((sum, c) => sum + c.unreadCount, 0);
      setTotalUnread(unread);
    } catch (err) {
      console.error('[AdminChat] Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filter, debouncedSearchTerm]);

  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when selecting a conversation
  useEffect(() => {
    if (!selectedId || !token) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/chat/conversations/${selectedId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.messages || res.data);
      } catch (err) {
        console.error('[AdminChat] Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, [selectedId, token]);

  useEffect(() => {
    setIsMessageSearchOpen(false);
    setEditingMessage(null);
  }, [selectedId]);

  // Socket.io connection as admin
  useEffect(() => {
    if (!token) return;

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      auth: { token, role: 'admin' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('admin:join', { token });
    });

    // New message from customer
    socket.on('admin:new_message', (data: { message: Message; conversation?: Conversation }) => {
      // Play audio notification
      audioRef.current?.play().catch(() => {});

      // Update unread count for tab title
      if (!isTabFocused.current) {
        setTotalUnread((prev) => prev + 1);
      }

      // If the message is for the currently selected conversation, add it
      if (data.message.conversationId === selectedId) {
        setMessages((prev) => [...prev, data.message]);
      }

      // Refresh conversation list
      fetchConversationsRef.current();
    });

    // Typing indicator from customer
    socket.on('chat:typing_indicator', (data: { conversationId: string; isTyping: boolean; sender: string }) => {
      if (data.conversationId === selectedId) {
        setIsCustomerTyping(data.isTyping);
        // Auto-clear after 3s
        if (data.isTyping) {
          setTimeout(() => setIsCustomerTyping(false), 3000);
        }
      }
    });

    // Conversation updated (e.g. new conversation created, resolved, etc.)
    socket.on('admin:conversation_updated', () => {
      fetchConversationsRef.current();
    });

    socket.on('chat:reaction_updated', (data: { messageId: string; reactions: Message['reactions'] }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions || [] }
            : msg
        )
      );
    });

    socket.on('chat:message_edited', (data: { messageId: string; content: string; editedAt: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, editedAt: data.editedAt }
            : msg
        )
      );
    });

    socket.on('chat:message_deleted', (data: { messageId: string; deletedAt?: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isDeleted: true, deletedAt: data.deletedAt || new Date().toISOString() }
            : msg
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, selectedId]);

  // Send message as admin
  const handleSend = useCallback(
    (content: string) => {
      if (!socketRef.current || !selectedId) return;
      socketRef.current.emit('chat:send_message', {
        conversationId: selectedId,
        content,
      });
      // Optimistic: the server will echo back via admin:new_message or chat:message_received
    },
    [selectedId]
  );

  // Emit typing event (throttled)
  const handleTyping = useCallback(() => {
    if (!socketRef.current || !selectedId) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = now;
    socketRef.current.emit('chat:typing', { conversationId: selectedId });
    setTimeout(() => {
      socketRef.current?.emit('chat:stop_typing', { conversationId: selectedId });
    }, 3000);
  }, [selectedId]);

  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    socketRef.current?.emit('chat:add_reaction', { messageId, emoji });
  }, []);

  const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
    socketRef.current?.emit('chat:remove_reaction', { messageId, emoji });
  }, []);

  const handleEditMessage = useCallback((messageId: string, content: string) => {
    socketRef.current?.emit('chat:edit_message', { messageId, content });
    setEditingMessage(null);
  }, []);

  const handleDeleteMessage = useCallback((messageId: string) => {
    socketRef.current?.emit('chat:delete_message', { messageId });
  }, []);

  const handleSearchResultClick = useCallback((messageId: string) => {
    setIsMessageSearchOpen(false);
    setTimeout(() => {
      document.getElementById(`admin-message-${messageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }, []);

  // Resolve conversation
  const handleResolve = useCallback(() => {
    if (!socketRef.current || !selectedId) return;
    socketRef.current.emit('admin:resolve', { conversationId: selectedId });
    // Refresh after a short delay
    setTimeout(() => fetchConversations(), 500);
  }, [selectedId, fetchConversations]);

  const selectedConversation = conversations.find((c) => c._id === selectedId) || null;

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] bg-white border border-slate-200 rounded-lg overflow-hidden m-4 shadow-sm">
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        filter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={loading}
      />
      <ConversationView
        messages={messages}
        isTyping={isCustomerTyping}
        selectedConversation={selectedConversation}
        onSend={handleSend}
        onTyping={handleTyping}
        onResolve={handleResolve}
        currentUserId={user?.id || ''}
        onAddReaction={handleAddReaction}
        onRemoveReaction={handleRemoveReaction}
        onEditMessage={setEditingMessage}
        onDeleteMessage={handleDeleteMessage}
        isSearchOpen={isMessageSearchOpen}
        onSearchToggle={() => setIsMessageSearchOpen((open) => !open)}
        onSearchClose={() => setIsMessageSearchOpen(false)}
        onSearchResultClick={handleSearchResultClick}
        token={token}
      />
      </div>
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
