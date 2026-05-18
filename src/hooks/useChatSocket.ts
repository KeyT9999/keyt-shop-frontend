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
  readStatus: boolean;
  timestamp: string;
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

export function useChatSocket() {
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
        sessionId: getOrCreateSessionId(),
        role: 'customer',
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
    });

    socket.on('chat:typing_indicator', (data: { isTyping: boolean; sender: string }) => {
      if (data.sender !== (user?.id ?? sessionId)) {
        setIsAdminTyping(data.isTyping);
      }
    });

    socket.on('chat:admin_status', (data: { online: boolean }) => {
      setIsAdminOnline(data.online);
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

  return {
    messages,
    isConnected,
    isReconnecting,
    isAdminOnline,
    isAdminTyping,
    sendMessage,
    emitTyping,
    conversationId,
  };
}
