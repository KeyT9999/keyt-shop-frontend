import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchEvidence } from '../services/evidenceService';
import type { EvidenceItem } from '../types';
import { clearGeminiApiKey, getGeminiApiKey, saveGeminiApiKey } from '../../../utils/geminiApiKey';
import './EvidenceChecker.css';

const verificationLabels: Record<EvidenceItem['verification'], string> = {
  verified: 'Đã kiểm chứng',
  unverified: 'Chưa khớp nguồn',
  unknown: 'Chưa xác định',
  trusted: 'Nguồn uy tín (chờ tải)',
};

const verificationClass: Record<EvidenceItem['verification'], string> = {
  verified: 'badge badge--success',
  unverified: 'badge badge--warning',
  unknown: 'badge badge--neutral',
  trusted: 'badge badge--info',
};

export default function EvidenceChecker() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | EvidenceItem['verification']>('all');
  const [textFilter, setTextFilter] = useState('');
  const [sortByScore, setSortByScore] = useState(true);

  useEffect(() => {
    const storedKey = getGeminiApiKey();
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const results = await fetchEvidence({ query, apiKey, maxResults });
      setEvidence(results);
      saveGeminiApiKey(apiKey);
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
    <div className="evidence-page">
      <header className="evidence-header">
        <div>
          <p className="eyebrow">Evidence Finder</p>
          <h1>Tìm nguồn có dẫn chứng kiểm chứng</h1>
          <p className="lede">
            Nhập nội dung cần xác thực, hệ thống sẽ tìm nguồn uy tín (DOI/PDF/nhà xuất bản)
            kèm trích dẫn và kiểm chứng snippet để tránh bịa nguồn.
          </p>
        </div>
      </header>

      <section className="panel">
        <form className="evidence-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="apiKey">Google AI Studio API Key</label>
            <div className="input-row">
              <input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Nhập API key (chỉ lưu trên trình duyệt)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <a
                className="ghost-btn"
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                title="Mở trang lấy Google AI Studio API Key"
              >
                Lấy key
              </a>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShowApiKey((prev) => !prev)}
              >
                {showApiKey ? 'Ẩn' : 'Hiện'}
              </button>
              <button type="button" className="ghost-btn" onClick={handleClearApiKey}>
                Xóa
              </button>
            </div>
            <p className="hint">API key chỉ được dùng trên trình duyệt, không gửi lên server khác.</p>
          </div>

          <div className="field">
            <label htmlFor="query">Thông tin cần xác thực</label>
            <textarea
              id="query"
              placeholder="Ví dụ: “Metformin có cải thiện kháng insulin ở PCOS?”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-footer">
            <div className="field inline">
              <label htmlFor="maxResults">Số kết quả tối đa</label>
              <input
                id="maxResults"
                type="number"
                min={1}
                max={5}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
              />
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tìm evidence'}
            </button>
          </div>

          {error && <div className="alert alert--error">{error}</div>}
        </form>
      </section>

      <section className="panel">
        <div className="panel-header results-header">
          <div>
            <h2>Kết quả</h2>
            <p className="hint">
              Mỗi kết quả hiển thị snippet, vị trí và trạng thái kiểm chứng (verified/trusted/unverified/unknown).
            </p>
          </div>
          <div className="results-actions">
            <div className="chip-row">
              <span className="chip">Tổng: {evidence.length}</span>
              <span className="chip chip--success">Verified: {statusCounts.verified || 0}</span>
              <span className="chip chip--info">Trusted: {statusCounts.trusted || 0}</span>
              <span className="chip chip--warning">Unverified: {statusCounts.unverified || 0}</span>
              <span className="chip chip--neutral">Unknown: {statusCounts.unknown || 0}</span>
            </div>
            <div className="controls-row">
              <div className="field inline">
                <label htmlFor="statusFilter">Trạng thái</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Tất cả</option>
                  <option value="verified">Verified</option>
                  <option value="trusted">Trusted</option>
                  <option value="unverified">Unverified</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="field inline">
                <label htmlFor="textFilter">Tìm nhanh</label>
                <input
                  id="textFilter"
                  type="text"
                  placeholder="Tìm theo tiêu đề/snippet/nguồn"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.target.value)}
                />
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={sortByScore}
                  onChange={(e) => setSortByScore(e.target.checked)}
                />
                <span>Sắp xếp ưu tiên nguồn uy tín</span>
              </label>
            </div>
          </div>
        </div>

        {evidence.length === 0 && !loading && (
          <div className="empty-state">
            <p>Chưa có kết quả. Nhập nội dung và bấm “Tìm evidence”.</p>
          </div>
        )}

        <div className="evidence-grid">
          {filteredEvidence.map((item, index) => (
            <article key={index} className="evidence-card">
              <div className="evidence-card__header">
                <div className="title-row">
                  <span className={verificationClass[item.verification]}>
                    {verificationLabels[item.verification]}
                  </span>
                  {typeof item.sourceScore === 'number' && (
                    <span className="confidence">
                      Nguồn: {item.sourceLabel || 'N/A'} ({(item.sourceScore * 100).toFixed(0)}%)
                    </span>
                  )}
                  {typeof item.confidence === 'number' && (
                    <span className="confidence">Độ tin cậy: {(item.confidence * 100).toFixed(0)}%</span>
                  )}
                  {typeof item.verificationScore === 'number' && (
                    <span className="confidence">
                      Match: {(item.verificationScore * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <h3 className="evidence-title">{item.title || 'Không rõ tiêu đề'}</h3>
                {item.url && (
                  <a className="evidence-link" href={item.url} target="_blank" rel="noreferrer">
                    {item.url}
                  </a>
                )}
              </div>

              <div className="evidence-body">
                {item.snippet && <p className="snippet">“{item.snippet}”</p>}
                {item.location && <p className="meta">Vị trí: {item.location}</p>}
                {item.reasoning && <p className="meta">Giải thích: {item.reasoning}</p>}
                {item.verificationNote && <p className="meta">Ghi chú: {item.verificationNote}</p>}
                {item.sourceType && <p className="meta">Nguồn: {item.sourceType.toUpperCase()}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
