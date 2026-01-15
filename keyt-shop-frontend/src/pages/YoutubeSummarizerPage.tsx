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
  Search,
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

const suggestionChips = [
  { label: 'Tóm tắt TED Talk', icon: '🎤', url: 'https://www.youtube.com/watch?v=R1vskiVDwl4' },
  { label: 'Review iPhone 16', icon: '📱', url: 'https://www.youtube.com/watch?v=GHhD4rO5C9I' },
  { label: 'Học ReactJS', icon: '⚛️', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk' },
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
    <div className="ys-page">
      {/* Header Section */}
      <header className="ys-header">
        <div className="ys-header-content">
          <div>
            <p className="ys-eyebrow">AI Video Assistant</p>
            <h1>YouTube Summarizer</h1>
            <p className="ys-lede">
              Tóm tắt video YouTube, tạo ghi chú học tập và hỏi đáp với video trong vài giây.
            </p>
          </div>
          <button
            className={`ys-settings-btn ${showSettingsPanel ? 'active' : ''}`}
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            title="Cấu hình API Key"
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>

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
                  style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}
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
      </header>

      {/* Main Search Section */}
      <section className="ys-search-section">
        <div className="ys-form">
          <div className="ys-search-container">
            <input
              className="ys-search-input"
              placeholder="Dán link YouTube (ví dụ: https://youtu.be/abc123)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              className="ys-search-btn"
              onClick={handleAnalyze}
              disabled={appState === 'analyzing' || !urlInput.trim()}
            >
              {appState === 'analyzing' ? (
                <div className="ys-spinner"></div>
              ) : (
                <>
                  <Search size={18} />
                  <span>Phân tích</span>
                </>
              )}
            </button>
          </div>
          {error && <div className="ys-alert ys-alert--error" style={{ marginTop: '12px' }}><AlertTriangle size={16} /> {error}</div>}
        </div>
      </section>

      {/* Results Section */}
      <section className="ys-results-section">

        {/* Empty State */}
        {!metadata && appState !== 'analyzing' && (
          <div className="ys-empty-state">
            <div className="ys-illustration">
              <Youtube size={64} strokeWidth={1} />
            </div>
            <h3>Sẵn sàng tóm tắt</h3>
            <p>Dán link video YouTube để AI giúp bạn nắm bắt nội dung chính ngay lập tức.</p>
            <div className="ys-suggestions">
              <span>Thử ngay:</span>
              {suggestionChips.map((chip, idx) => (
                <button key={idx} onClick={() => { setUrlInput(chip.url); setTimeout(handleAnalyze, 100); }}>
                  {chip.icon} {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
                <div className="ys-spinner" style={{ width: '32px', height: '32px', margin: '0 auto 16px', borderColor: '#d1d5db', borderTopColor: '#6366f1' }}></div>
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
