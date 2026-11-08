import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { ziweiApiService, type ZiweiChatMessage } from '../services/ziweiApiService';
import { FormattedAiReading } from './FormattedAiReading';

export interface ZiweiChatRequest {
  id: number;
  prompt: string;
  context?: string;
}

interface ZiweiChatProps {
  chartSummary: string | null;
  request: ZiweiChatRequest | null;
  onOpenBirthForm: () => void;
}

const SUGGESTIONS = [
  'Năm nay lá số gợi ý gì về công việc?',
  'Tôi cần chú ý gì về tài chính?',
  'Cung Phu Thê nói gì về tình cảm?',
];

export default function ZiweiChat({ chartSummary, request, onOpenBirthForm }: ZiweiChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ZiweiChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const handledRequest = useRef(0);
  const dockRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async (question: string, context?: string) => {
    const text = question.trim();
    if (!chartSummary || !text || sending.current) return;
    sending.current = true;
    setLoading(true);
    setError(null);
    const history: ZiweiChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(history);

    try {
      const response = await ziweiApiService.interpretChart({
        chartSummary: context ? `${chartSummary}\n\n${context}` : chartSummary,
        messages: history,
      });
      setMessages([...history, { role: 'assistant', content: response.reply }]);
    } catch (err) {
      setMessages(messages);
      setDraft((current) => current || text);
      setError(err instanceof Error ? err.message : 'Chưa gửi được câu hỏi. Bạn có thể thử lại.');
    } finally {
      sending.current = false;
      setLoading(false);
    }
  }, [chartSummary, messages]);

  useEffect(() => {
    if (!request || request.id === handledRequest.current) return;
    handledRequest.current = request.id;
    setOpen(true);
    if (!chartSummary) return;
    if (sending.current) {
      setDraft(request.prompt);
    } else {
      void send(request.prompt, request.context);
    }
  }, [chartSummary, request, send]);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus({ preventScroll: true });
    const viewport = window.visualViewport;
    const dock = dockRef.current;
    if (!viewport || !dock) return;
    const syncViewport = () => {
      dock.style.setProperty('--zi-chat-keyboard', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`);
      dock.style.setProperty('--zi-chat-viewport', `${viewport.height}px`);
    };
    syncViewport();
    viewport.addEventListener('resize', syncViewport);
    viewport.addEventListener('scroll', syncViewport);
    return () => {
      viewport.removeEventListener('resize', syncViewport);
      viewport.removeEventListener('scroll', syncViewport);
      dock.style.removeProperty('--zi-chat-keyboard');
      dock.style.removeProperty('--zi-chat-viewport');
    };
  }, [open]);

  useEffect(() => {
    if (open && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [open, messages, loading]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div ref={dockRef} className="ziwei-chat-dock" onKeyDown={(event) => {
      if (open && event.key === 'Escape') {
        event.stopPropagation();
        close();
      }
    }}>
      {open ? (
        <section id="ziwei-chat-panel" className="ziwei-chat-panel" role="dialog" aria-labelledby="ziwei-chat-title">
          <header className="ziwei-chat-header">
            <MessageCircle size={21} aria-hidden="true" />
            <h2 ref={headingRef} id="ziwei-chat-title" tabIndex={-1}>Hỏi AI về lá số</h2>
            <button type="button" onClick={close} aria-label="Thu gọn chat">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          {chartSummary ? (
            <>
              <div ref={logRef} className="ziwei-chat-log" role="log" aria-label="Cuộc trò chuyện">
                {!messages.length && (
                  <div className="ziwei-chat-suggestions">
                    <p>Bạn muốn hỏi gì về lá số đang xem?</p>
                    {SUGGESTIONS.map((question) => (
                      <button key={question} type="button" onClick={() => void send(question)}>{question}</button>
                    ))}
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={index} className={`ziwei-chat-message ziwei-chat-${message.role}`}>
                    {message.role === 'assistant' ? (
                      <FormattedAiReading text={message.content} />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                ))}
                {loading && <p role="status">AI đang trả lời…</p>}
              </div>
              {error && <p className="ziwei-chat-error" role="alert">{error}</p>}
              <form className="ziwei-chat-form" onSubmit={(event) => {
                event.preventDefault();
                if (sending.current || !draft.trim()) return;
                void send(draft);
                setDraft('');
              }}>
                <input
                  aria-label="Câu hỏi về lá số"
                  placeholder="Nhập câu hỏi…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault();
                  }}
                />
                <button type="submit" aria-label="Gửi câu hỏi" disabled={loading || !draft.trim()}>
                  <Send size={18} aria-hidden="true" />
                </button>
              </form>
            </>
          ) : (
            <div className="ziwei-chat-suggestions">
              <p>Lập lá số để AI có thông tin trả lời câu hỏi của bạn.</p>
              <button type="button" onClick={() => { close(); onOpenBirthForm(); }}>Đi tới phần lập lá số</button>
            </div>
          )}
        </section>
      ) : (
        <button ref={launcherRef} className="ziwei-chat-launcher" type="button"
          aria-haspopup="dialog" aria-expanded={false} onClick={() => setOpen(true)}>
          <MessageCircle size={20} aria-hidden="true" /> Hỏi AI
        </button>
      )}
    </div>
  );
}
