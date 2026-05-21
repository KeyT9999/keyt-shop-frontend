import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { MessageCircle, X, Send, ChevronLeft, Paperclip, Loader2, Search, Image as ImageIcon } from 'lucide-react';
import { useAuthContext } from '../../context/useAuthContext';
import API_BASE_URL from '../../config/api';
import { uploadChatFile } from '../../services/chatUpload';
import { playChatNotificationSound } from '../../utils/chatNotificationSound';
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

interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  senderType: 'customer' | 'admin';
  content: string;
  messageType?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMime?: string;
  timestamp: string;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  isDeleted?: boolean;
  deletedAt?: string;
  editedAt?: string;
  editHistory?: Array<{
    content: string;
    editedAt: string;
  }>;
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

/**
 * PendingImagePreview — Hiển thị preview ảnh paste từ clipboard (admin).
 * Styling nhất quán với admin theme (slate tones).
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
      style={{ animation: 'adminChatPreviewSlideIn 0.15s ease' }}
    >
      <img
        src={previewUrl}
        alt="preview"
        className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
          <ImageIcon size={11} className="flex-shrink-0 text-slate-500" />
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

// Inject keyframes animation cho preview slide-in
const ANIMATION_STYLE_ID = 'admin-chat-animations';
if (typeof document !== 'undefined' && !document.getElementById(ANIMATION_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = ANIMATION_STYLE_ID;
  style.textContent = `
    @keyframes adminChatPreviewSlideIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

export default function AdminChatBubble() {
  const { token, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);

  // State cho pending image (paste từ clipboard)
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const pasteErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchConversationsRef = useRef<() => void>(() => {});

  // Debounce search term
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
        params: {
          status: 'active',
          ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Conversation[] = res.data.conversations || [];
      data.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setConversations(data);
      setTotalUnread(data.reduce((s, c) => s + c.unreadCount, 0));
    } catch (err) {
      console.error('[AdminChatBubble] Failed to fetch conversations:', err);
    }
  }, [token, debouncedSearchTerm]);

  useEffect(() => {
    fetchConversationsRef.current = fetchConversations;
  }, [fetchConversations]);

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
      // F2: Phát âm thanh thông báo khi có tin nhắn mới từ khách hàng
      // Admin luôn cần biết ngay khi có khách nhắn
      playChatNotificationSound();

      fetchConversationsRef.current();
      if (selectedConv && data.message.conversationId === selectedConv._id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socket.on('chat:conversation_created', () => { fetchConversationsRef.current(); });
    socket.on('admin:conversation_updated', () => { fetchConversationsRef.current(); });
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
    socket.on('chat:message_deleted', (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isDeleted: true, deletedAt: new Date().toISOString() }
            : msg
        )
      );
    });

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

  // Cleanup object URL khi pendingImageUrl thay đổi (tránh memory leak)
  useEffect(() => {
    return () => {
      if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    };
  }, [pendingImageUrl]);

  // Cleanup error timer khi unmount
  useEffect(() => {
    return () => {
      if (pasteErrorTimerRef.current) clearTimeout(pasteErrorTimerRef.current);
    };
  }, []);

  // Xóa pending image khi chuyển conversation
  useEffect(() => {
    clearPendingImage();
    setIsMessageSearchOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConv?._id]);

  function clearPendingImage() {
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    setPendingImage(null);
    setPendingImageUrl(null);
  }

  function showPasteError(msg: string) {
    setPasteError(msg);
    if (pasteErrorTimerRef.current) clearTimeout(pasteErrorTimerRef.current);
    pasteErrorTimerRef.current = setTimeout(() => setPasteError(null), 3000);
  }

  /**
   * Xử lý sự kiện Ctrl+V trong ô chat admin.
   * Chỉ can thiệp khi clipboard chứa ảnh — text paste hoạt động bình thường.
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return; // Không có ảnh → để browser tự xử lý paste text

    e.preventDefault();

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
    if (pendingImageUrl) URL.revokeObjectURL(pendingImageUrl);
    const url = URL.createObjectURL(file);
    setPendingImage(file);
    setPendingImageUrl(url);
    setPasteError(null);
  };

  // Send text message (hoặc pending image)
  const handleSend = async () => {
    if (!socketRef.current || !selectedConv) return;

    // Ưu tiên gửi pending image nếu có
    if (pendingImage) {
      if (!token) return;
      setIsUploading(true);
      try {
        const result = await uploadChatFile(pendingImage, { token });
        const messageType = IMAGE_MIMES.includes(result.fileMime) ? 'image' : 'file';
        socketRef.current.emit('chat:send_message', {
          conversationId: selectedConv._id,
          content: '',
          messageType,
          ...result,
        });
        clearPendingImage();
      } catch (err) {
        console.error('[AdminChat] Paste image upload failed:', err);
        showPasteError('Gửi ảnh thất bại, vui lòng thử lại');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // Gửi text nếu không có pending image
    if (!text.trim()) return;
    socketRef.current.emit('chat:send_message', { conversationId: selectedConv._id, content: text.trim() });
    setText('');
  };

  // Send file qua button đính kèm (không phải paste)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !socketRef.current || !selectedConv) return;
    e.target.value = '';
    setIsUploading(true);
    try {
      const result = await uploadChatFile(file, { token });
      const messageType = IMAGE_MIMES.includes(result.fileMime) ? 'image' : 'file';
      socketRef.current.emit('chat:send_message', {
        conversationId: selectedConv._id,
        content: '',
        messageType,
        ...result,
      });
    } catch (err) {
      console.error('[AdminChat] File upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    socketRef.current?.emit('chat:add_reaction', { messageId, emoji });
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    socketRef.current?.emit('chat:remove_reaction', { messageId, emoji });
  };

  const handleEditMessage = (messageId: string, content: string) => {
    socketRef.current?.emit('chat:edit_message', { messageId, content });
    setEditingMessage(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    socketRef.current?.emit('chat:delete_message', { messageId });
  };

  const handleSearchResultClick = (messageId: string) => {
    setIsMessageSearchOpen(false);
    setTimeout(() => {
      document.getElementById(`admin-bubble-message-${messageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };

  // Render message content
  const renderMessageContent = (msg: Message) => {
    if (msg.isDeleted) {
      return <span className="italic opacity-60">Tin nhắn đã bị xóa</span>;
    }

    if (msg.messageType === 'image' && msg.fileUrl) {
      return (
        <img
          src={msg.fileUrl}
          alt={msg.fileName || 'Hình ảnh'}
          className="max-w-[200px] rounded-lg cursor-pointer"
          onClick={() => window.open(msg.fileUrl, '_blank')}
        />
      );
    }
    if (msg.messageType === 'file' && msg.fileUrl) {
      return (
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <span className="text-lg">📄</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{msg.fileName || 'Tệp đính kèm'}</p>
            {msg.fileSize && (
              <p className="text-xs opacity-75">{formatBytes(msg.fileSize)}</p>
            )}
          </div>
        </a>
      );
    }
    return msg.content;
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
            {selectedConv && (
              <button
                onClick={() => setIsMessageSearchOpen((open) => !open)}
                className="p-1 hover:bg-slate-700 rounded"
                aria-label="Tìm kiếm tin nhắn"
                title="Tìm kiếm tin nhắn"
              >
                <Search size={18} />
              </button>
            )}
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded">
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {!selectedConv ? (
            // Conversation list
            <>
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm khách hàng..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-500"
                    aria-label="Tìm kiếm khách hàng trong chat"
                  />
                </label>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-8">
                    {searchTerm.trim() ? 'Không tìm thấy khách hàng' : 'Chưa có tin nhắn nào'}
                  </p>
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
            </>
          ) : (
            // Chat view
            <>
              {isMessageSearchOpen ? (
                <div className="flex-1 min-h-0">
                  <MessageSearch
                    conversationId={selectedConv._id}
                    onResultClick={handleSearchResultClick}
                    onClose={() => setIsMessageSearchOpen(false)}
                    token={token}
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  {messages.map(msg => (
                    <div
                      id={`admin-bubble-message-${msg._id}`}
                      key={msg._id}
                      className={`flex flex-col ${msg.senderType === 'admin' ? 'items-end' : 'items-start'} mb-2`}
                    >
                      <div className={`relative group max-w-[75%] px-3 py-2 rounded-xl text-sm overflow-visible ${
                        msg.isDeleted
                          ? 'bg-slate-50 text-slate-400 border border-slate-200'
                          : msg.senderType === 'admin'
                            ? 'bg-slate-800 text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}>
                        <div className="absolute -top-2 -right-2 z-20 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                          <MessageActions
                            message={msg}
                            currentUserId={user?.id || ''}
                            onEdit={() => setEditingMessage(msg)}
                            onDelete={() => handleDeleteMessage(msg._id)}
                          />
                        </div>
                        {renderMessageContent(msg)}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                        {formatTime(msg.timestamp)}
                        {msg.editedAt && !msg.isDeleted && (
                          <span className="ml-1 italic">(đã chỉnh sửa)</span>
                        )}
                      </span>
                      {!msg.isDeleted && (
                        <MessageReactions
                          messageId={msg._id}
                          reactions={msg.reactions || []}
                          currentUserId={user?.id || ''}
                          onAddReaction={handleAddReaction}
                          onRemoveReaction={handleRemoveReaction}
                          align={msg.senderType === 'admin' ? 'right' : 'left'}
                        />
                      )}
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
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

              {/* Input area */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-100">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg transition-colors disabled:opacity-40"
                  aria-label="Đính kèm tệp"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                </button>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  onPaste={handlePaste}
                  placeholder={pendingImage ? 'Nhấn gửi để gửi ảnh...' : 'Trả lời...'}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={(!text.trim() && !pendingImage) || isUploading}
                  className="p-2 bg-slate-800 text-white rounded-lg disabled:opacity-40 hover:bg-slate-700"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}

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
