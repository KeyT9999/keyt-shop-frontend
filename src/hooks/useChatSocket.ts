import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthContext } from '../context/useAuthContext';
import API_BASE_URL from '../config/api';

export interface Message {
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
  readStatus: boolean;
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

/**
 * Options cho useChatSocket.
 * onNewAdminMessage: callback khi nhận tin nhắn mới từ admin.
 * Dùng để ChatWidget tự quyết định có phát âm thanh hay không.
 */
export interface UseChatSocketOptions {
  onNewAdminMessage?: () => void;
}

// Derive socket URL from API_BASE_URL: strip /api path
function getSocketUrl(): string {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    // Fallback: remove trailing /api
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
}

const SESSION_ID_KEY = 'keyt_chat_session_id';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const { token, user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const lastTypingEmit = useRef<number>(0);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const sessionId = getOrCreateSessionId();

    const socket = io(socketUrl, {
      auth: {
        sessionId,
        role: 'customer',
        ...(token ? { token } : {}),
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setIsReconnecting(false);
      // Join or resume conversation
      socket.emit('chat:join', {
        sessionId,
        ...(user ? { customerId: user.id, customerName: user.username, customerEmail: user.email } : {}),
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.io.on('reconnect_attempt', () => {
      setIsReconnecting(true);
    });

    socket.io.on('reconnect', () => {
      setIsReconnecting(false);
      setIsConnected(true);
    });

    // Server events
    socket.on('chat:joined', (data: { conversation: { _id: string }; messages?: Message[] }) => {
      setConversationId(data.conversation._id);
      if (data.messages) {
        setMessages(data.messages);
      }
    });

    socket.on('chat:message_received', (data: { message: Message }) => {
      setMessages((prev) => [...prev, data.message]);
      // Notify ChatWidget khi có tin từ admin để quyết định phát âm thanh
      if (data.message.senderType === 'admin') {
        options.onNewAdminMessage?.();
      }
    });

    socket.on('chat:typing_indicator', (data: { isTyping: boolean; sender: string }) => {
      if (data.sender !== (user?.id ?? sessionId)) {
        setIsAdminTyping(data.isTyping);
      }
    });

    socket.on('chat:admin_status', (data: { online: boolean }) => {
      setIsAdminOnline(data.online);
    });

    socket.on('chat:reaction_updated', (data: { messageId: string; reactions: NonNullable<Message['reactions']> }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
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

    socket.on('error', (data: { code: string; message: string }) => {
      console.error('[Chat Socket Error]', data.code, data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || !conversationId || !content.trim()) return;
    socketRef.current.emit('chat:send_message', {
      conversationId,
      content: content.trim(),
    });
  }, [conversationId]);

  const sendFileMessage = useCallback((fileData: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileMime: string;
    messageType: 'image' | 'file';
  }) => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit('chat:send_message', {
      conversationId,
      content: '',
      ...fileData,
    });
  }, [conversationId]);

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 2000) return;
    lastTypingEmit.current = now;
    socketRef.current.emit('chat:typing', { conversationId });

    // Auto stop typing after 3s
    setTimeout(() => {
      socketRef.current?.emit('chat:stop_typing', { conversationId });
    }, 3000);
  }, [conversationId]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    const currentUserId = getOrCreateSessionId();

    // Optimistic update so the selected emoji appears immediately.
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id !== messageId) return msg;

        const reactions = [...(msg.reactions || [])];
        const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === emoji);

        if (reactionIndex === -1) {
          reactions.push({ emoji, users: [currentUserId] });
        } else if (!reactions[reactionIndex].users.includes(currentUserId)) {
          reactions[reactionIndex] = {
            ...reactions[reactionIndex],
            users: [...reactions[reactionIndex].users, currentUserId],
          };
        }

        return { ...msg, reactions };
      })
    );

    socketRef.current.emit('chat:add_reaction', { messageId, emoji });
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    const currentUserId = getOrCreateSessionId();

    // Optimistic update; authoritative state still comes back via chat:reaction_updated.
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id !== messageId) return msg;

        const reactions = (msg.reactions || [])
          .map((reaction) =>
            reaction.emoji === emoji
              ? { ...reaction, users: reaction.users.filter((userId) => userId !== currentUserId) }
              : reaction
          )
          .filter((reaction) => reaction.users.length > 0);

        return { ...msg, reactions };
      })
    );

    socketRef.current.emit('chat:remove_reaction', { messageId, emoji });
  }, []);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat:edit_message', { messageId, content });
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat:delete_message', { messageId });
  }, []);

  return {
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
  };
}
