import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Settings,
  Key,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { fetchEvidence } from '../services/evidenceService';
import type { EvidenceItem } from '../types';
import { clearGeminiApiKey, getGeminiApiKey, saveGeminiApiKey } from '../../../utils/geminiApiKey';
import './EvidenceChecker.css';

const verificationLabels: Record<EvidenceItem['verification'], string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  unknown: 'Unknown',
  trusted: 'Trusted Source',
};

const verificationIcons: Record<EvidenceItem['verification'], any> = {
  verified: CheckCircle2,
  unverified: XCircle,
  unknown: HelpCircle,
  trusted: ShieldCheck,
};

const verificationClass: Record<EvidenceItem['verification'], string> = {
  verified: 'badge badge--success',
  unverified: 'badge badge--error',
  unknown: 'badge badge--neutral',
  trusted: 'badge badge--info',
};

import { useAuthContext } from '../../../context/useAuthContext';
import { profileService } from '../../../services/profileService';

export default function EvidenceChecker() {
  const { user } = useAuthContext();
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);

  // Initial load: Try LocalStorage first, then Backend if logged in
  useEffect(() => {
    // 1. Check LocalStorage (Fast)
    const localKey = getGeminiApiKey();
    if (localKey) {
      setApiKey(localKey);
    }

    // 2. Check Backend (Source of Truth for Logged In)
    const loadFromBackend = async () => {
      if (user) {
        try {
          const profile = await profileService.getProfile();
          if (profile.geminiApiKey) {
            setApiKey(profile.geminiApiKey);
            // Sync back to local if missing/different
            if (profile.geminiApiKey !== localKey) {
              saveGeminiApiKey(profile.geminiApiKey);
            }
          }
        } catch (err) {
          console.error('Failed to load API key from profile', err);
        }
      }
    };
    loadFromBackend();
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Vui lòng nhập Google AI Studio API Key để tiếp tục.');
      return;
    }

    setLoading(true);

    try {
      // Save Key on use (Sync both Local and Backend)
      saveGeminiApiKey(apiKey);
      if (user) {
        // Silently sync to backend
        profileService.saveGeminiApiKey(apiKey).catch(console.error);
      }

      const results = await fetchEvidence({ query, apiKey, maxResults });
      setEvidence(results);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi tìm kiếm evidence.');
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearApiKey = () => {
    clearGeminiApiKey();
    setApiKey('');
  };

  const filteredEvidence = evidence.sort((a, b) => {
    const order: Record<EvidenceItem['verification'], number> = {
      verified: 3,
      trusted: 2,
      unverified: 1,
      unknown: 0,
    };
    const diffStatus = order[b.verification] - order[a.verification];
    if (diffStatus !== 0) return diffStatus;
    const scoreA = a.sourceScore ?? 0;
    const scoreB = b.sourceScore ?? 0;
    return scoreB - scoreA;
  });

  return (
    <div className="evidence-page-new">
      {/* Settings Button - Floating */}
      <button
        className={`ec-settings-floating-btn ${isSettingsOpen ? 'active' : ''}`}
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title="Cấu hình API Key"
      >
        <Settings size={20} />
      </button>

      {/* Settings Panel (Collapsible) */}
      {isSettingsOpen && (
        <div className="ec-settings-panel">
          <div className="ec-setting-group">
            <label htmlFor="apiKey" className="ec-setting-label">
              <Key size={14} /> Google AI Studio API Key
            </label>
            <div className="ec-input-group">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Paste your API key here..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                type="button"
                className="ec-icon-btn"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                type="button"
                className="ec-icon-btn"
                onClick={handleClearApiKey}
                title="Xóa key đã lưu"
                style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p className="ec-hint">
              Chưa có key? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">Lấy key tại đây</a>. Key được lưu bảo mật.
            </p>
          </div>

          <div className="ec-setting-group-inline">
            <label htmlFor="maxResults" className="ec-setting-label">Số kết quả</label>
            <input
              id="maxResults"
              type="number"
              min={1}
              max={10}
              className="ec-small-input"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="ec-hero">
        {/* Search Icon */}
        <div className="ec-search-icon">
          <FileSearch size={40} />
        </div>

        {/* Title */}
        <h1 className="ec-hero-title">Evidence Checker</h1>
        <p className="ec-hero-subtitle">
          Kiểm tra độ chính xác của thông tin với AI và nguồn tin đáng tin cậy
        </p>

        {/* Compact Steps */}
        <div className="ec-compact-steps">
          <div className="ec-compact-step">
            <span className="ec-compact-number">1</span>
            <span>Thu thập</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2"/>
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">2</span>
            <span>Phân tích</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2"/>
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">3</span>
            <span>Đánh giá</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2"/>
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">4</span>
            <span>Kết luận</span>
          </div>
        </div>

        {/* Input Form */}
        <div className="ec-input-section">
          <label className="ec-input-label">Nhập thông tin cần kiểm tra</label>
          <form onSubmit={handleSubmit}>
            <div className="ec-input-wrapper">
              <textarea
                id="query"
                className="ec-textarea-input"
                placeholder="Ví dụ: AI đã thay đổi cách con người làm việc trong thập kỷ qua"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={1}
                required
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
              />
              <button type="submit" className="ec-check-btn" disabled={loading}>
                {loading ? (
                  <div className="ec-spinner"></div>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Kiểm tra</span>
                  </>
                )}
              </button>
            </div>
          </form>
          <p className="ec-input-hint">
            Nhập bất kỳ thông tin, tin tức hoặc tuyên bố nào bạn muốn xác minh
          </p>
          {error && (
            <div className="ec-error-alert">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <section className="results-section">
        {evidence.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-title">
                <h2>Kết quả phân tích <span className="count-badge">{evidence.length}</span></h2>
              </div>
            </div>

            <div className="evidence-grid">
              {filteredEvidence.map((item, index) => {
                const Icon = verificationIcons[item.verification] || HelpCircle;
                return (
                  <article key={index} className="evidence-card">
                    <div className="card-header">
                      <div className="badge-row">
                        <span className={verificationClass[item.verification]}>
                          <Icon size={14} strokeWidth={2.5} />
                          {verificationLabels[item.verification]}
                        </span>
                        {item.sourceScore && (
                          <span className="sc-score" title={`Reliability Score: ${Math.round(item.sourceScore * 100)}%`}>
                            Confidence: {Math.round(item.sourceScore * 100)}%
                          </span>
                        )}
                      </div>
                      <h3 className="card-title">{item.title || 'Nguồn không xác định'}</h3>
                      {item.url && (
                        <a className="card-link" href={item.url} target="_blank" rel="noreferrer">
                          {item.url} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="card-body">
                      {item.snippet && (
                        <div className="snippet-box">
                          <p>“{item.snippet}”</p>
                        </div>
                      )}

                      <div className="meta-grid">
                        {item.location && (
                          <div className="meta-item">
                            <span className="label">Vị trí:</span> <span className="value">{item.location}</span>
                          </div>
                        )}
                        {item.sourceType && (
                          <div className="meta-item">
                            <span className="label">Loại nguồn:</span> <span className="value">{item.sourceType}</span>
                          </div>
                        )}
                        {item.verificationNote && (
                          <div className="meta-item full">
                            <span className="label">Ghi chú:</span> <span className="value">{item.verificationNote}</span>
                          </div>
                        )}
                        {item.reasoning && (
                          <div className="meta-item full reasoning">
                            <div className="reasoning-label">💡 AI Reasoning:</div>
                            <div className="reasoning-text">{item.reasoning}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
