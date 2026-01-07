import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../features/youtubeSummarizer/components/Header';
import { VideoMetadataCard } from '../features/youtubeSummarizer/components/VideoMetadataCard';
import { ResultSection } from '../features/youtubeSummarizer/components/ResultSection';
import { ChatInterface } from '../features/youtubeSummarizer/components/ChatInterface';
import { fetchVideoMetadata } from '../features/youtubeSummarizer/services/youtubeService';
import { generateVideoSummary, GeminiApiError } from '../features/youtubeSummarizer/services/geminiService';
import { SummaryStyle } from '../features/youtubeSummarizer/types';
import type { AppState, VideoMetadata, SummaryResult } from '../features/youtubeSummarizer/types';
import { useAuthContext } from '../context/useAuthContext';
import { profileService } from '../services/profileService';
import './YoutubeSummarizerPage.css';

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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(true);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [appState, setAppState] = useState<AppState>('idle');
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<SummaryStyle>(SummaryStyle.BRIEF);
  const [error, setError] = useState<string | null>(null);
  const summarySectionRef = useRef<HTMLElement | null>(null);

  // Load API key from backend on mount
  useEffect(() => {
    const loadApiKey = async () => {
      if (!user) {
        setLoadingApiKey(false);
        setShowApiKeyInput(true);
        return;
      }

      try {
        const profile = await profileService.getProfile();
        if (profile.geminiApiKey) {
          setGeminiApiKey(profile.geminiApiKey);
          setShowApiKeyInput(false);
        } else {
          setShowApiKeyInput(true);
        }
      } catch (err) {
        console.error('Error loading API key:', err);
        setShowApiKeyInput(true);
      } finally {
        setLoadingApiKey(false);
      }
    };

    loadApiKey();
  }, [user]);

  // Save API key to backend
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Vui lòng nhập Gemini API Key');
      return;
    }

    if (!user) {
      setError('Vui lòng đăng nhập để lưu API Key');
      return;
    }

    setSavingApiKey(true);
    setError(null);

    try {
      await profileService.saveGeminiApiKey(apiKeyInput.trim());
      setGeminiApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiKeyInput(false);
    } catch (err: any) {
      console.error('Error saving API key:', err);
      setError(err.response?.data?.message || 'Không thể lưu API Key. Vui lòng thử lại.');
    } finally {
      setSavingApiKey(false);
    }
  };

  // Allow user to re-enter API key if it fails
  const handleApiKeyError = () => {
    setShowApiKeyInput(true);
    setGeminiApiKey('');
  };

  // Edit API key
  const handleEditApiKey = () => {
    setShowApiKeyInput(true);
    setApiKeyInput(geminiApiKey);
  };

  // Delete API key
  const handleDeleteApiKey = async () => {
    if (!user) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa Gemini API Key?')) {
      return;
    }

    try {
      await profileService.saveGeminiApiKey('');
      setGeminiApiKey('');
      setShowApiKeyInput(true);
      setApiKeyInput('');
    } catch (err: any) {
      console.error('Error deleting API key:', err);
      setError('Không thể xóa API Key. Vui lòng thử lại.');
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
      setError('Không thể lấy thông tin video. Vui lòng kiểm tra lại đường dẫn.');
      setAppState('idle');
    }
  };

  const handleSummarize = async () => {
    if (!metadata) return;
    
    if (!geminiApiKey || !geminiApiKey.trim()) {
      setError('Vui lòng nhập Gemini API Key để sử dụng tính năng AI.');
      setShowApiKeyInput(true);
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
      
      // Handle GeminiApiError specifically
      if (err instanceof GeminiApiError) {
        setError(err.message);
        
        // If API key is invalid or leaked, clear it and prompt user to re-enter
        if (err.isApiKeyError) {
          handleApiKeyError();
        }
      } else {
        // Handle other errors
        const errorMessage = err.message || 'AI đang quá tải hoặc gặp lỗi. Vui lòng thử lại sau.';
        setError(errorMessage);
        
        // Check if error message contains API key related keywords
        const errorMsgLower = errorMessage.toLowerCase();
        if (errorMsgLower.includes('api key') || errorMsgLower.includes('api_key') || errorMsgLower.includes('key')) {
          handleApiKeyError();
        }
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

  return (
    <div className="summarizer-page">
      <Header />

      <main>
        <section className="summarizer-intro">
          <h2>Tiết kiệm thời gian học tập & làm việc với AI</h2>
          <p>
            Dán link YouTube vào, để Gemini 2.5 Flash đọc tiêu đề & ngữ cảnh rồi trả về tóm tắt cùng điểm nổi bật, sau
            đó thoải mái hỏi thêm trong chat.
          </p>
        </section>


        <section className="summarizer-input-section">
          <div className="summarizer-input-row">
            <input
              type="text"
              placeholder="Dán link YouTube (ví dụ: https://youtu.be/abc123)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="summarizer-input"
              disabled={appState === 'analyzing'}
            />
            <button
              className="summarizer-button"
              onClick={handleAnalyze}
              disabled={!urlInput.trim() || appState === 'analyzing'}
            >
              {appState === 'analyzing' ? 'Đang phân tích...' : 'Phân tích video'}
            </button>
          </div>
          {(appState === 'analyzing' || appState === 'summarizing') && (
            <div className="status-pill">
              {appState === 'analyzing' ? 'Đang kiểm tra đường dẫn...' : 'Đang gửi yêu cầu tới Gemini...'}
            </div>
          )}
          {error && <div className="error-pill">{error}</div>}
        </section>

        {metadata && (
          <section className="summarizer-meta-section">
            <VideoMetadataCard metadata={metadata} onClear={handleReset} />

            {appState === 'ready_to_summarize' && (
              <div className="summarizer-style-panel">
                <p className="summarizer-style-panel__title">Chọn kiểu tóm tắt</p>
                <div className="summarizer-style-options">
                  {styleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`summarizer-style-option ${
                        selectedStyle === option.value ? 'active' : ''
                      }`}
                      onClick={() => setSelectedStyle(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <p>{option.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="summarizer-style-actions">
                  <button className="summarizer-button" onClick={handleSummarize}>
                    Tóm tắt ngay
                  </button>
                </div>
              </div>
            )}

            {appState === 'summarizing' && (
              <div className="summarizer-status">Gemini đang tạo tóm tắt, chờ chút nhé...</div>
            )}
          </section>
        )}

        {summaryResult && appState === 'finished' && (
          <section className="summarizer-result-grid" ref={summarySectionRef}>
            <ResultSection result={summaryResult} />
            <ChatInterface
              videoContext={`Title: ${metadata?.title}\nSummary: ${summaryResult.shortSummary}\nKey Points: ${summaryResult.keyPoints.join(
                '\n'
              )}`}
              apiKey={geminiApiKey}
              onApiKeyError={handleApiKeyError}
            />
          </section>
        )}
      </main>

      {/* Gemini API Key Panel - Fixed bottom right */}
      <div className="gemini-key-panel">
        <div className="gemini-key-panel__header">
          <h4>Gemini API Key</h4>
          {geminiApiKey && !showApiKeyInput && (
            <div className="gemini-key-panel__actions">
              <button
                className="gemini-key-panel__btn gemini-key-panel__btn--edit"
                onClick={handleEditApiKey}
                title="Sửa"
              >
                ✏️
              </button>
              <button
                className="gemini-key-panel__btn gemini-key-panel__btn--delete"
                onClick={handleDeleteApiKey}
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {showApiKeyInput ? (
          <div className="gemini-key-panel__content">
            <input
              type="password"
              placeholder="Nhập Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
              className="gemini-key-panel__input"
              disabled={savingApiKey || loadingApiKey}
            />
            <button
              className="gemini-key-panel__save-btn"
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || savingApiKey || loadingApiKey}
            >
              {savingApiKey ? 'Đang lưu...' : 'Lưu'}
            </button>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="gemini-key-panel__help-link"
            >
              📖 Lấy API Key tại Google AI Studio
            </a>
          </div>
        ) : (
          <div className="gemini-key-panel__content">
            <div className="gemini-key-panel__status">
              <span className="gemini-key-panel__status-icon">✓</span>
              <span className="gemini-key-panel__status-text">Đã cấu hình</span>
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="gemini-key-panel__help-link"
            >
              📖 Hướng dẫn lấy API Key
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default YoutubeSummarizerPage;

