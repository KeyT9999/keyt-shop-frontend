import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, User, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';
import { chatWithVideoContext, GeminiApiError } from '../services/geminiService';

interface Props {
  videoContext: string;
  apiKey: string;
  onApiKeyError?: () => void;
}

const quickPrompts = [
  'Giải thích lại cho dễ hiểu hơn',
  'Video này dành cho ai?',
  'Tác giả có nhắc đến ví dụ nào không?',
];

export const ChatInterface: React.FC<Props> = ({ videoContext, apiKey, onApiKeyError }) => {
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
      let errorMessage = 'Xin lỗi, tôi đang gặp sự cố khi trả lời câu hỏi này.';

      if (error instanceof GeminiApiError) {
        errorMessage = error.message;
        if (error.isApiKeyError && onApiKeyError) {
          onApiKeyError();
        }
      } else if (error.message) {
        errorMessage = error.message;
        const errorMsgLower = error.message.toLowerCase();
        if ((errorMsgLower.includes('api key') || errorMsgLower.includes('api_key')) && onApiKeyError) {
          onApiKeyError();
        }
      }

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
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      marginTop: '24px'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ padding: '8px', background: '#F0F9FF', borderRadius: '8px', color: '#0EA5E9' }}>
          <MessageCircle size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>Hỏi thêm về video này</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>AI Assistant</p>
        </div>
      </div>

      {/* Messages Body */}
      <div ref={scrollRef} style={{
        height: '400px',
        overflowY: 'auto',
        padding: '24px',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: '40px' }}>
            <Bot size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontWeight: 500 }}>Bạn cần giải thích thêm phần nào?</p>
            <p style={{ fontSize: '0.9rem' }}>Chat với AI để hiểu sâu hơn nội dung.</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  style={{
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    color: '#475569',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#F05A28';
                    e.currentTarget.style.color = '#F05A28';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#475569';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: '12px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: msg.role === 'user' ? '#F05A28' : 'white',
              border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
              color: msg.role === 'user' ? 'white' : '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              background: msg.role === 'user' ? '#F05A28' : 'white',
              color: msg.role === 'user' ? 'white' : '#1E293B',
              boxShadow: msg.role === 'user' ? '0 4px 6px -1px rgba(240, 90, 40, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
              borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #E2E8F0',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              borderBottomLeftRadius: '4px',
              background: 'white',
              color: '#64748B',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Loader2 size={16} className="animate-spin" />
              <span>Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid #F1F5F9', background: 'white' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Đặt câu hỏi cho AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 50px 14px 20px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#F05A28';
              e.target.style.boxShadow = '0 0 0 1px #F05A28';
              e.target.style.background = 'white';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.boxShadow = 'none';
              e.target.style.background = '#F8FAFC';
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: input.trim() && !loading ? '#F05A28' : '#E2E8F0',
              color: input.trim() && !loading ? 'white' : '#94A3B8',
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
