import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, User, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';
import { chatWithVideoContext } from '../services/geminiService';

interface Props {
  videoContext: string;
  apiKey: string;
}

const quickPrompts = [
  'Giải thích lại cho dễ hiểu hơn',
  'Video này dành cho ai?',
  'Tác giả có nhắc đến ví dụ nào không?',
];

export const ChatInterface: React.FC<Props> = ({ videoContext, apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!override) {
      setInput('');
    }
    setLoading(true);

    const history = [...messages, userMsg];

    try {
      if (!apiKey || !apiKey.trim()) {
        throw new Error('Vui lòng nhập Gemini API Key để sử dụng tính năng chat.');
      }

      const responseText = await chatWithVideoContext(
        history.map((msg) => ({ role: msg.role, text: msg.text })),
        text,
        videoContext,
        apiKey
      );

      const botMsg: ChatMessage = {
        id: `${Date.now()}-bot`,
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      const errorMessage = error.message || 'Xin lỗi, tôi đang gặp sự cố khi trả lời câu hỏi này.';
      const fallbackMsg: ChatMessage = {
        id: `${Date.now()}-error`,
        role: 'model',
        text: errorMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-interface__header">
        <MessageCircle size={20} />
        <h3>Hỏi thêm về video này</h3>
      </div>

      <div className="chat-interface__body" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="chat-interface__empty">
            <p>Bạn cần giải thích thêm phần nào?</p>
            <p>Chat với AI để hiểu sâu hơn nội dung.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.role === 'user' ? 'chat-message--user' : 'chat-message--bot'}`}
          >
            <div className="chat-message__avatar">
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className="chat-message__bubble">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-message chat-message--bot">
            <div className="chat-message__avatar">
              <Bot size={14} />
            </div>
            <div className="chat-message__bubble chat-message__bubble--loading">
              <Loader2 size={16} className="chat-message__loader" />
              <span>Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && !loading && (
        <div className="chat-interface__quick-prompts">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" className="quick-prompt-btn" onClick={() => handleSend(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="chat-interface__input">
        <input
          type="text"
          placeholder="Đặt câu hỏi cho AI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          className="chat-input"
        />
        <button
          type="button"
          className="chat-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

