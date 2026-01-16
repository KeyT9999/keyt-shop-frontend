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
  const [statusFilter, setStatusFilter] = useState<'all' | EvidenceItem['verification']>('all');
  const [textFilter, setTextFilter] = useState('');
  const [sortByScore, setSortByScore] = useState(true);

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

  const statusCounts = evidence.reduce(
    (acc, item) => {
      acc[item.verification] = (acc[item.verification] || 0) + 1;
      return acc;
    },
    {} as Record<EvidenceItem['verification'], number>
  );

  const filteredEvidence = evidence
    .filter((item) => {
      const matchStatus = statusFilter === 'all' || item.verification === statusFilter;
      const matchText =
        !textFilter ||
        item.title.toLowerCase().includes(textFilter.toLowerCase()) ||
        item.snippet.toLowerCase().includes(textFilter.toLowerCase()) ||
        (item.sourceLabel || '').toLowerCase().includes(textFilter.toLowerCase());
      return matchStatus && matchText;
    })
    .sort((a, b) => {
      if (!sortByScore) return 0;
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

              <div className="filter-bar">
                <div className="filter-group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="filter-select"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="verified">Verified</option>
                    <option value="trusted">Trusted</option>
                    <option value="unverified">Unverified</option>
                    <option value="unknown">Unknown</option>
                  </select>

                  <div className="search-filter">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Lọc kết quả..."
                      value={textFilter}
                      onChange={(e) => setTextFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sort-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={sortByScore}
                      onChange={(e) => setSortByScore(e.target.checked)}
                    />
                    <span>Ưu tiên nguồn uy tín</span>
                  </label>
                </div>
              </div>

              <div className="stats-row">
                {statusCounts.verified > 0 && <span className="stat-tag success">Verified: {statusCounts.verified}</span>}
                {statusCounts.trusted > 0 && <span className="stat-tag info">Trusted: {statusCounts.trusted}</span>}
                {statusCounts.unverified > 0 && <span className="stat-tag warning">Unverified: {statusCounts.unverified}</span>}
                {statusCounts.unknown > 0 && <span className="stat-tag neutral">Unknown: {statusCounts.unknown}</span>}
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
        ) : (
          !loading && (
            <div className="empty-state">
              <div className="illustration">
                <FileSearch size={64} strokeWidth={1} />
              </div>
              <h3>Sẵn sàng tìm kiếm</h3>
              <p>Nhập nhận định y khoa của bạn để AI đối chiếu với hàng triệu tài liệu khoa học.</p>
              <div className="suggestions">
                <span>Gợi ý:</span>
                <button type="button" onClick={() => setQuery("Vitamin D liều cao có giảm nguy cơ cúm không?")}>Vitamin D & Cúm</button>
                <button type="button" onClick={() => setQuery("Intermittent Fasting ảnh hưởng thế nào đến cơ bắp?")}>IF & Cơ bắp</button>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
