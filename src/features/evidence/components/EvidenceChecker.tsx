import { useEffect, useRef, useState } from 'react';
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
  History,
  X,
  Clock,
} from 'lucide-react';
import { fetchEvidence } from '../services/evidenceService';
import type { EvidenceItem, VerdictResult, VerdictStatus } from '../types';
import { clearGeminiApiKey, getGeminiApiKey, saveGeminiApiKey } from '../../../utils/geminiApiKey';
import { useSearchHistory } from '../hooks/useSearchHistory';
import ClaimSplitter from './ClaimSplitter';
import { exportToPdf } from '../utils/exportPdfReport';
import './EvidenceChecker.css';

import { useAuthContext } from '../../../context/useAuthContext';
import { profileService } from '../../../services/profileService';

// ─── Verification badge config ────────────────────────────────────────────────
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

// ─── Verdict config ────────────────────────────────────────────────────────────
const verdictConfig: Record<
  VerdictStatus,
  { label: string; emoji: string; colorClass: string; description: string }
> = {
  supported: {
    label: 'Được Ủng Hộ',
    emoji: '✅',
    colorClass: 'verdict--supported',
    description: 'Tuyên bố này được khoa học ủng hộ bởi các nguồn tin cậy.',
  },
  contested: {
    label: 'Còn Tranh Cãi',
    emoji: '⚠️',
    colorClass: 'verdict--contested',
    description: 'Tuyên bố này vẫn còn là chủ đề tranh luận trong cộng đồng khoa học.',
  },
  disputed: {
    label: 'Bị Bác Bỏ',
    emoji: '❌',
    colorClass: 'verdict--disputed',
    description: 'Tuyên bố này mâu thuẫn với bằng chứng khoa học hiện có.',
  },
  insufficient: {
    label: 'Không Đủ Bằng Chứng',
    emoji: '🔍',
    colorClass: 'verdict--insufficient',
    description: 'Chưa có đủ bằng chứng học thuật để kết luận về tuyên bố này.',
  },
};

// ─── History verdict badge labels ─────────────────────────────────────────────
const historyVerdictLabel: Record<VerdictStatus, string> = {
  supported: '✅',
  contested: '⚠️',
  disputed: '❌',
  insufficient: '🔍',
};

export default function EvidenceChecker() {
  const { user } = useAuthContext();
  const { history, addToHistory, removeItem, clearHistory } = useSearchHistory();

  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);
  const [showBroken, setShowBroken] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);

  // Đóng history dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
    }
    if (isHistoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isHistoryOpen]);

  // Load API key từ LocalStorage → Backend (nếu đăng nhập)
  useEffect(() => {
    const localKey = getGeminiApiKey();
    if (localKey) setApiKey(localKey);

    const loadFromBackend = async () => {
      if (user) {
        try {
          const profile = await profileService.getProfile();
          if (profile.geminiApiKey) {
            setApiKey(profile.geminiApiKey);
            if (profile.geminiApiKey !== localKey) {
              saveGeminiApiKey(profile.geminiApiKey);
            }
          }
        } catch (err) {
          console.error('❌ Failed to load API key from profile', err);
        }
      }
    };
    loadFromBackend();
  }, [user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement> | { preventDefault: () => void }) => {
    event.preventDefault();
    setError('');
    setIsHistoryOpen(false);

    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Vui lòng nhập Google AI Studio API Key để tiếp tục.');
      return;
    }

    setLoading(true);
    setEvidence([]);
    setVerdict(null);

    try {
      saveGeminiApiKey(apiKey);
      if (user) {
        profileService.saveGeminiApiKey(apiKey).catch((err) => {
          console.error('❌ Failed to save API key to profile', err);
        });
      }

      const result = await fetchEvidence({ query, apiKey, maxResults });
      setEvidence(result.evidence);
      setVerdict(result.verdict);

      // Lưu vào lịch sử
      addToHistory(query, result.evidence.length, result.verdict?.verdict ?? null);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi tìm kiếm evidence.');
      setEvidence([]);
      setVerdict(null);
    } finally {
      setLoading(false);
    }
  };

  const runClaimEvidenceCheck = async (claim: string) => {
    setError('');
    setIsHistoryOpen(false);
    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Vui lòng nhập Google AI Studio API Key để tiếp tục.');
      return;
    }

    setLoading(true);
    setEvidence([]);
    setVerdict(null);
    try {
      saveGeminiApiKey(apiKey);
      const result = await fetchEvidence({ query: claim, apiKey, maxResults });
      setEvidence(result.evidence.map((item) => ({ ...item, claim })));
      setVerdict(result.verdict);
      addToHistory(claim, result.evidence.length, result.verdict?.verdict ?? null);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi tìm kiếm evidence.');
      setEvidence([]);
      setVerdict(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClaim = (claim: string) => {
    setQuery(claim);
    void runClaimEvidenceCheck(claim);
  };

  const handleCheckAllClaims = async (claims: string[]) => {
    setError('');
    setIsHistoryOpen(false);
    if (!apiKey) {
      setIsSettingsOpen(true);
      setError('Vui lòng nhập Google AI Studio API Key để tiếp tục.');
      return;
    }

    setLoading(true);
    setEvidence([]);
    setVerdict(null);
    const mergedEvidence: EvidenceItem[] = [];
    try {
      saveGeminiApiKey(apiKey);
      for (const claim of claims) {
        const result = await fetchEvidence({ query: claim, apiKey, maxResults });
        mergedEvidence.push(...result.evidence.map((item) => ({ ...item, claim })));
        setEvidence([...mergedEvidence]);
      }
      addToHistory(`${claims.length} claims từ đoạn văn`, mergedEvidence.length, null);
    } catch (err: any) {
      setError(err?.message || 'Đã xảy ra lỗi khi kiểm tra các claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    setIsHistoryOpen(false);
  };

  const handleClearApiKey = () => {
    clearGeminiApiKey();
    setApiKey('');
  };

  // Sắp xếp: verified > trusted > unverified > unknown
  const sortedEvidence = [...evidence].sort((a, b) => {
    const order: Record<EvidenceItem['verification'], number> = {
      verified: 3,
      trusted: 2,
      unverified: 1,
      unknown: 0,
    };
    const diffStatus = order[b.verification] - order[a.verification];
    if (diffStatus !== 0) return diffStatus;
    return (b.sourceScore ?? 0) - (a.sourceScore ?? 0);
  });

  // Filter lọc link lỗi nếu user không muốn xem
  const displayedEvidence = showBroken
    ? sortedEvidence
    : sortedEvidence.filter((item) => !item.broken);

  const brokenCount = sortedEvidence.filter((item) => item.broken).length;

  return (
    <div className="evidence-page-new">
      {/* ── Settings Button ── */}
      <button
        className={`ec-settings-floating-btn ${isSettingsOpen ? 'active' : ''}`}
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        title="Cấu hình API Key"
      >
        <Settings size={20} />
      </button>

      {/* ── Settings Panel ── */}
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
              Chưa có key?{' '}
              <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">
                Lấy key tại đây
              </a>
              . Key được lưu bảo mật trên thiết bị của bạn.
            </p>
          </div>

          <div className="ec-setting-group-inline">
            <label htmlFor="maxResults" className="ec-setting-label">
              Số kết quả
            </label>
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

      {/* ── Hero Section ── */}
      <div className="ec-hero">
        <div className="ec-search-icon">
          <FileSearch size={40} />
        </div>

        <h1 className="ec-hero-title">Evidence Checker</h1>
        <p className="ec-hero-subtitle">
          Kiểm tra độ chính xác của thông tin với AI và nguồn tin đáng tin cậy
        </p>

        <div className="ec-compact-steps">
          <div className="ec-compact-step">
            <span className="ec-compact-number">1</span>
            <span>Thu thập</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2" />
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">2</span>
            <span>Phân tích</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2" />
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">3</span>
            <span>Đánh giá</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5 0M12 10l-2 -2M12 10l-2 2" />
          </svg>
          <div className="ec-compact-step">
            <span className="ec-compact-number">4</span>
            <span>Kết luận</span>
          </div>
        </div>

        {/* ── Input Form ── */}
        <div className="ec-input-section">
          <label className="ec-input-label">Nhập thông tin cần kiểm tra</label>
          <form onSubmit={handleSubmit}>
            <div className="ec-input-wrapper">
              {/* History Dropdown Trigger bên trong textarea wrapper */}
              <div className="ec-textarea-container" ref={historyRef}>
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

                {/* History button */}
                {history.length > 0 && (
                  <button
                    type="button"
                    className={`ec-history-trigger ${isHistoryOpen ? 'active' : ''}`}
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    title="Lịch sử tìm kiếm"
                  >
                    <History size={15} />
                  </button>
                )}

                {/* History Dropdown */}
                {isHistoryOpen && history.length > 0 && (
                  <div className="ec-history-dropdown">
                    <div className="ec-history-header">
                      <span>
                        <Clock size={13} /> Lịch sử tìm kiếm
                      </span>
                      <button
                        type="button"
                        className="ec-history-clear"
                        onClick={clearHistory}
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <ul className="ec-history-list">
                      {history.map((item) => (
                        <li key={item.id} className="ec-history-item">
                          <button
                            type="button"
                            className="ec-history-query"
                            onClick={() => handleSelectHistory(item.query)}
                          >
                            <span className="ec-history-text">{item.query}</span>
                            <span className="ec-history-meta">
                              {item.verdict && historyVerdictLabel[item.verdict]}{' '}
                              {item.resultCount} kết quả
                            </span>
                          </button>
                          <button
                            type="button"
                            className="ec-history-remove"
                            onClick={() => removeItem(item.id)}
                            title="Xóa"
                          >
                            <X size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {query.length > 100 && query.includes('.') && (
                <ClaimSplitter
                  text={query}
                  apiKey={apiKey}
                  onSelectClaim={handleSelectClaim}
                  onCheckAll={handleCheckAllClaims}
                />
              )}

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

      {/* ── Results Section ── */}
      <section className="results-section">
        {/* Overall Verdict Panel */}
        {verdict && (() => {
          const cfg = verdictConfig[verdict.verdict];
          return (
            <div className={`ec-verdict-panel ${cfg.colorClass}`}>
              <div className="ec-verdict-main">
                <span className="ec-verdict-emoji">{cfg.emoji}</span>
                <div className="ec-verdict-info">
                  <div className="ec-verdict-label">Kết luận tổng thể</div>
                  <div className="ec-verdict-title">{cfg.label}</div>
                  <p className="ec-verdict-description">{cfg.description}</p>
                </div>
                <div className="ec-verdict-confidence">
                  <div className="ec-confidence-ring">
                    <svg viewBox="0 0 36 36" className="ec-confidence-svg">
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        strokeWidth="3"
                        className="ec-confidence-track"
                      />
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        strokeWidth="3"
                        strokeDasharray={`${verdict.confidence}, 100`}
                        strokeLinecap="round"
                        className="ec-confidence-bar"
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <span className="ec-confidence-text">{verdict.confidence}%</span>
                  </div>
                  <span className="ec-confidence-label">Độ tin cậy</span>
                </div>
              </div>

              <p className="ec-verdict-summary">{verdict.summary}</p>

              <div className="ec-verdict-counts">
                <span className="ec-count ec-count--support">
                  ✅ {verdict.supporting_count} nguồn ủng hộ
                </span>
                <span className="ec-count ec-count--oppose">
                  ❌ {verdict.opposing_count} nguồn phản bác
                </span>
              </div>
            </div>
          );
        })()}

        {/* Evidence Results */}
        {sortedEvidence.length > 0 && (
          <>
            <div className="results-header">
              <div className="results-title">
                <h2>
                  Kết quả phân tích{' '}
                  <span className="count-badge">{displayedEvidence.length}</span>
                  {brokenCount > 0 && (
                    <span className="broken-count-badge">
                      {brokenCount} link lỗi
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  className="ec-export-btn"
                  onClick={() => exportToPdf(query, sortedEvidence, verdict)}
                >
                  📄 Xuất PDF
                </button>
              </div>

              {/* Toggle hiện/ẩn broken links */}
              {brokenCount > 0 && (
                <button
                  type="button"
                  className={`ec-toggle-broken ${showBroken ? 'active' : ''}`}
                  onClick={() => setShowBroken(!showBroken)}
                >
                  {showBroken ? (
                    <><AlertTriangle size={13} /> Ẩn link lỗi ({brokenCount})</>
                  ) : (
                    <><AlertTriangle size={13} /> Hiện link lỗi ({brokenCount})</>
                  )}
                </button>
              )}
            </div>

            <div className="evidence-grid">
              {displayedEvidence.map((item, index) => {
                const Icon = verificationIcons[item.verification] || HelpCircle;
                return (
                  <article
                    key={index}
                    className={`evidence-card ${item.broken ? 'evidence-card--broken' : ''}`}
                  >
                    <div className="card-header">
                      <div className="badge-row">
                        <span className={verificationClass[item.verification]}>
                          <Icon size={14} strokeWidth={2.5} />
                          {verificationLabels[item.verification]}
                        </span>
                        {item.broken && (
                          <span className="badge badge--broken">
                            <AlertTriangle size={12} /> Link lỗi
                          </span>
                        )}
                        {item.sourceScore != null && !item.broken && (
                          <span
                            className="sc-score"
                            title={`Độ uy tín nguồn: ${Math.round(item.sourceScore * 100)}%`}
                          >
                            Uy tín: {Math.round(item.sourceScore * 100)}%
                          </span>
                        )}
                      </div>
                      <h3 className="card-title">{item.title || 'Nguồn không xác định'}</h3>
                      {item.claim && (
                        <div className="ec-claim-label">
                          Claim: {item.claim}
                        </div>
                      )}
                      {item.url && (
                        <a
                          className={`card-link ${item.broken ? 'card-link--broken' : ''}`}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          title={item.broken ? 'Link này có thể không truy cập được' : undefined}
                        >
                          {item.url} <ExternalLink size={12} />
                          {item.broken && <span className="broken-tag">⚠️</span>}
                        </a>
                      )}
                    </div>

                    <div className="card-body">
                      {item.snippet && (
                        <div className="snippet-box">
                          <p>"{item.snippet}"</p>
                        </div>
                      )}

                      <div className="meta-grid">
                        {item.location && (
                          <div className="meta-item">
                            <span className="label">Vị trí:</span>{' '}
                            <span className="value">{item.location}</span>
                          </div>
                        )}
                        {item.sourceType && (
                          <div className="meta-item">
                            <span className="label">Loại nguồn:</span>{' '}
                            <span className="value">{item.sourceType}</span>
                          </div>
                        )}
                        {item.verificationNote && (
                          <div className="meta-item full">
                            <span className="label">Ghi chú:</span>{' '}
                            <span className="value">{item.verificationNote}</span>
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
        )}
      </section>
    </div>
  );
}
