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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      setError(t('summarizer.api_key_placeholder'));
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
      setError(err?.message || t('common.error'));
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
    <div className="evidence-page">
      {/* Header Section */}
      <header className="evidence-header">
        <div className="header-content">
          <div>
            <p className="eyebrow">{t('evidence.eyebrow')}</p>
            <h1>{t('evidence.header_title')}</h1>
            <p className="lede">
              {t('evidence.subtitle')}
            </p>
          </div>
          <button
            className={`settings-btn ${isSettingsOpen ? 'active' : ''}`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title={t('evidence.settings_config')}
          >
            <Settings size={20} />
            <span>{t('evidence.settings')}</span>
          </button>
        </div>

        {/* Settings Panel (Collapsible) */}
        {isSettingsOpen && (
          <div className="settings-panel">
            <div className="setting-group">
              <label htmlFor="apiKey" className="setting-label">
                <Key size={14} /> {t('evidence.api_key_label')}
              </label>
              <div className="input-group">
                <input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={t('evidence.api_key_placeholder')}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowApiKey(!showApiKey)}
                  title={showApiKey ? t('evidence.hide_key') : t('evidence.show_key')}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={handleClearApiKey}
                  title={t('evidence.delete_key')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="hint">
                {t('summarizer.get_key')}? <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noreferrer">{t('evidence.get_key')}</a>. {t('evidence.key_saved')}
              </p>
            </div>

            <div className="setting-group inline">
              <label htmlFor="maxResults" className="setting-label">{t('evidence.max_results')}</label>
              <input
                id="maxResults"
                type="number"
                min={1}
                max={10}
                className="small-input"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Search Section */}
      <section className="search-section">
        <form className="evidence-form" onSubmit={handleSubmit}>
          <div className="search-container">
            <textarea
              id="query"
              className="search-input"
              placeholder={t('evidence.input_placeholder')}
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
            <button type="submit" className="evidence-search-btn" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Search size={18} />
                  <span>{t('evidence.check')}</span>
                </>
              )}
            </button>
          </div>
          {error && <div className="alert alert--error"><AlertTriangle size={16} /> {error}</div>}
        </form>
      </section>

      {/* Results Section */}
      <section className="results-section">
        {evidence.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-title">
                <h2>{t('evidence.results_analysis')} <span className="count-badge">{evidence.length}</span></h2>
              </div>

              <div className="filter-bar">
                <div className="filter-group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="filter-select"
                  >
                    <option value="all">{t('evidence.filter_all')}</option>
                    <option value="verified">{t('evidence.verified')}</option>
                    <option value="trusted">{t('evidence.trusted')}</option>
                    <option value="unverified">{t('evidence.unverified')}</option>
                    <option value="unknown">{t('evidence.unknown')}</option>
                  </select>

                  <div className="search-filter">
                    <Search size={14} className="search-icon" />
                    <input
                      type="text"
                      placeholder={t('evidence.filter_results')}
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
                    <span>{t('evidence.sort_by_trust')}</span>
                  </label>
                </div>
              </div>

              <div className="stats-row">
                {statusCounts.verified > 0 && <span className="stat-tag success">{t('evidence.verified')}: {statusCounts.verified}</span>}
                {statusCounts.trusted > 0 && <span className="stat-tag info">{t('evidence.trusted')}: {statusCounts.trusted}</span>}
                {statusCounts.unverified > 0 && <span className="stat-tag warning">{t('evidence.unverified')}: {statusCounts.unverified}</span>}
                {statusCounts.unknown > 0 && <span className="stat-tag neutral">{t('evidence.unknown')}: {statusCounts.unknown}</span>}
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
                      <h3 className="card-title">{item.title || t('evidence.source_unknown')}</h3>
                      {item.url && (
                        <a className="card-link" href={item.url} target="_blank" rel="noreferrer">
                          {item.url} <ExternalLink size={12} />
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
                            <span className="label">{t('evidence.location')}</span> <span className="value">{item.location}</span>
                          </div>
                        )}
                        {item.sourceType && (
                          <div className="meta-item">
                            <span className="label">{t('evidence.source_type')}</span> <span className="value">{item.sourceType}</span>
                          </div>
                        )}
                        {item.verificationNote && (
                          <div className="meta-item full">
                            <span className="label">{t('evidence.note')}</span> <span className="value">{item.verificationNote}</span>
                          </div>
                        )}
                        {item.reasoning && (
                          <div className="meta-item full reasoning">
                            <div className="reasoning-label">{t('evidence.ai_reasoning')}</div>
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
              <h3>{t('evidence.empty_state_title')}</h3>
              <p>{t('evidence.empty_state_desc')}</p>
              <div className="suggestions">
                <span>{t('evidence.suggestions')}</span>
                <button type="button" onClick={() => setQuery(t('evidence.suggestion_1'))}>Vitamin D & Flu</button>
                <button type="button" onClick={() => setQuery(t('evidence.suggestion_2'))}>IF & Muscle</button>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
