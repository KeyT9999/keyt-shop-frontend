import { useRef, useState, useEffect } from 'react';
import { VideoMetadataCard } from '../features/youtubeSummarizer/components/VideoMetadataCard';
import { ResultSection } from '../features/youtubeSummarizer/components/ResultSection';
import { ChatInterface } from '../features/youtubeSummarizer/components/ChatInterface';
import { fetchVideoMetadata } from '../features/youtubeSummarizer/services/youtubeService';
import { generateVideoSummary, GeminiApiError } from '../features/youtubeSummarizer/services/geminiService';
import { SummaryStyle } from '../features/youtubeSummarizer/types';
import type { AppState, VideoMetadata, SummaryResult } from '../features/youtubeSummarizer/types';
import { useAuthContext } from '../context/useAuthContext';
import { profileService } from '../services/profileService';
import {
  Settings,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  Youtube,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import './YoutubeSummarizerPage.css';
import { saveGeminiApiKey as saveToLocal, getGeminiApiKey as getFromLocal, clearGeminiApiKey as clearLocal } from '../utils/geminiApiKey';

const styleOptions = [
  {
    label: 'Ngắn gọn',
    desc: '3-5 câu TL;DR',
    value: SummaryStyle.BRIEF,
  },
  {
    label: 'Chi tiết',
    desc: 'Tập trung ý chính & bullet',
    value: SummaryStyle.DETAILED,
  },
  {
    label: 'Dành cho học tập',
    desc: 'Giải thích khái niệm, ví dụ',
    value: SummaryStyle.LEARNING,
  },
];


const YoutubeSummarizerPage: React.FC = () => {
  const { user } = useAuthContext();
  const [urlInput, setUrlInput] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showSettingsPanel, setShowSettingsPanel] = useState(false); // Changed from Modal to Panel
  const [apiKeyInput, setApiKeyInput] = useState(''); // Used for manual entry
  const [showApiKey, setShowApiKey] = useState(false);

  const [appState, setAppState] = useState<AppState>('idle');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<SummaryStyle>(SummaryStyle.BRIEF);
  const [error, setError] = useState<string | null>(null);
  const summarySectionRef = useRef<HTMLElement | null>(null);

  // Load API key from LocalStorage and Backend on mount
  useEffect(() => {
    // 1. Load Local (Fast)
    const localKey = getFromLocal();
    if (localKey) {
      setGeminiApiKey(localKey);
      setApiKeyInput(localKey);
    }

    // 2. Load Backend (Source of Truth if logged in)
    const loadApiKey = async () => {
      if (!user) return;
      try {
        const profile = await profileService.getProfile();
        if (profile.geminiApiKey) {
          setGeminiApiKey(profile.geminiApiKey);
          setApiKeyInput(profile.geminiApiKey);
          // Sync to local if valid
          if (profile.geminiApiKey !== localKey) {
            saveToLocal(profile.geminiApiKey);
          }
        }
      } catch (err) {
        console.error('Error loading API key:', err);
      }
    };
    loadApiKey();
  }, [user]);

  const handleSaveApiKey = async () => {
    const trimmedKey = apiKeyInput.trim();

    if (!trimmedKey) {
      setGeminiApiKey('');
      clearLocal();
      if (user) {
        try {
          await profileService.saveGeminiApiKey('');
        } catch (e) { console.error(e); }
      }
      return;
    }

    try {
      // Always save to local
      saveToLocal(trimmedKey);
      setGeminiApiKey(trimmedKey);

      // Save to backend if user exists
      if (user) {
        await profileService.saveGeminiApiKey(trimmedKey);
      }

      setShowSettingsPanel(false);
    } catch (err) {
      console.error("Error saving API Key", err);
    }
  };

  const handleAnalyze = async () => {
    if (!urlInput.trim()) return;

    setError(null);
    setAppState('analyzing');
    setMetadata(null);
    setSummaryResult(null);

    try {
      const data = await fetchVideoMetadata(urlInput.trim());
      setMetadata(data);
      setAppState('ready_to_summarize');
    } catch (err) {
      setError('Không thể lấy thông tin video. Vui lòng kiểm tra lại đường dẫn và thử lại.');
      setAppState('idle');
    }
  };

  const handleSummarize = async () => {
    if (!metadata) return;

    if (!geminiApiKey || !geminiApiKey.trim()) {
      setError('Vui lòng nhập Gemini API Key để sử dụng tính năng AI.');
      setShowSettingsPanel(true);
      return;
    }

    setAppState('summarizing');
    setError(null);

    try {
      const result = await generateVideoSummary(metadata.title, metadata.url, selectedStyle, geminiApiKey);
      setSummaryResult(result);
      setAppState('finished');
      setTimeout(() => {
        summarySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (err: any) {
      console.error(err);
      if (err instanceof GeminiApiError && err.isApiKeyError) {
        setShowSettingsPanel(true);
        setError(err.message);
      } else {
        setError(err.message || 'Lỗi khi tóm tắt video.');
      }
      setAppState('ready_to_summarize');
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setMetadata(null);
    setSummaryResult(null);
    setUrlInput('');
    setError(null);
  };

  // Render Logic
  return (
    <div className="ys-page-new">
      {/* Settings Button - Floating */}
      <button
        className={`ys-settings-floating-btn ${showSettingsPanel ? 'active' : ''}`}
        onClick={() => setShowSettingsPanel(!showSettingsPanel)}
        title="Cấu hình API Key"
      >
        <Settings size={20} />
      </button>

      {/* Settings Panel (Collapsible) */}
      {showSettingsPanel && (
        <div className="ys-settings-panel">
          <div className="ys-setting-group">
            <label className="ys-setting-label">
              <Key size={14} /> Google AI Studio API Key
            </label>
            <div className="ys-input-group">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Paste your API key here..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <button
                type="button"
                className="ys-icon-btn"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                type="button"
                className="ys-icon-btn"
                onClick={handleSaveApiKey}
                title="Lưu key"
                style={{ backgroundColor: '#fff7ed', color: '#f97316' }}
              >
                <CheckCircle2 size={16} />
              </button>
            </div>
            <p className="ys-hint">
              Chưa có key? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">Lấy key tại đây</a>. Key được lưu bảo mật.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="ys-hero">
        {/* YouTube Icon */}
        <div className="ys-youtube-icon">
          <Youtube size={40} />
        </div>

        {/* Title */}
        <h1 className="ys-hero-title">YouTube Summarizer</h1>
        <p className="ys-hero-subtitle">
          Tóm tắt nội dung video YouTube một cách nhanh chóng và chính xác với AI
        </p>

        {/* Compact How to Use */}
        <div className="ys-compact-steps">
          <div className="ys-compact-step">
            <span className="ys-compact-number">1</span>
            <span>Sao chép URL</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2"/>
          </svg>
          <div className="ys-compact-step">
            <span className="ys-compact-number">2</span>
            <span>Dán và xử lý</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2"/>
          </svg>
          <div className="ys-compact-step">
            <span className="ys-compact-number">3</span>
            <span>Nhận kết quả</span>
          </div>
        </div>

        {/* Input Form */}
        <div className="ys-input-section">
          <label className="ys-input-label">Nhập URL video YouTube</label>
          <div className="ys-input-wrapper">
            <input
              className="ys-url-input"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              className="ys-summarize-btn"
              onClick={handleAnalyze}
              disabled={appState === 'analyzing' || !urlInput.trim()}
            >
              {appState === 'analyzing' ? (
                <div className="ys-spinner"></div>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Tóm tắt</span>
                </>
              )}
            </button>
          </div>
          <p className="ys-input-hint">
            Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ
          </p>
          {error && (
            <div className="ys-error-alert">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <section className="ys-results-section">


        {/* Content Flow */}
        {metadata && (
          <div className="ys-card-container">

            {/* 1. Metadata Card */}
            <VideoMetadataCard metadata={metadata} onClear={handleReset} />

            {/* 2. Style Selection (If not yet summarized) */}
            {appState === 'ready_to_summarize' && (
              <div className="ys-card">
                <div className="ys-card-header">
                  <h3 className="ys-card-title"><Sparkles size={18} /> Chọn phong cách tóm tắt</h3>
                </div>
                <div className="ys-style-grid">
                  {styleOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`ys-style-option ${selectedStyle === option.value ? 'active' : ''}`}
                      onClick={() => setSelectedStyle(option.value)}
                    >
                      <span className="ys-style-title">{option.label}</span>
                      <span className="ys-style-desc">{option.desc}</span>
                    </div>
                  ))}
                </div>
                <button className="ys-action-btn" onClick={handleSummarize}>
                  <Sparkles size={18} />
                  Tạo tóm tắt ngay
                </button>
              </div>
            )}

            {/* Loading State */}
            {appState === 'summarizing' && (
              <div className="ys-card" style={{ textAlign: 'center', padding: '40px' }}>
                <div className="ys-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px', borderColor: '#d1d5db', borderTopColor: '#f97316' }}></div>
                <p style={{ color: '#4b5563', fontWeight: 500 }}>Gemini đang xem video và tổng hợp nội dung...</p>
              </div>
            )}

            {/* 3. Summary Results */}
            {summaryResult && appState === 'finished' && (
              <div ref={summarySectionRef as any}>
                <ResultSection result={summaryResult} />
              </div>
            )}

            {/* 4. Chat Interface */}
            {summaryResult && appState === 'finished' && (
              <ChatInterface
                videoContext={`Title: ${metadata.title}\nSummary: ${summaryResult.shortSummary}\nKey Points: ${summaryResult.keyPoints.join('\n')}`}
                apiKey={geminiApiKey}
                onApiKeyError={() => setShowSettingsPanel(true)}
              />
            )}

          </div>
        )}
      </section>
    </div>
  );
};

export default YoutubeSummarizerPage;
