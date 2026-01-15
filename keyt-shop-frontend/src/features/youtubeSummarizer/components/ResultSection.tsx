import React, { useState } from 'react';
import { Copy, Check, FileText, List } from 'lucide-react';
import type { SummaryResult } from '../types';

interface Props {
  result: SummaryResult;
}

export const ResultSection: React.FC<Props> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `${result.shortSummary}\n\nÝ chính:\n${result.keyPoints
      .map((point) => `- ${point}`)
      .join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="result-section">
      <section className="result-card">
        <div className="result-card__header">
          <FileText size={20} />
          <div>
            <p className="result-card__title">Tóm tắt ngắn (TL;DR)</p>
            <p className="result-card__subtitle">
              {result.shortSummary.slice(0, 120)}{result.shortSummary.length > 120 ? '...' : ''}
            </p>
          </div>
        </div>
        <p className="result-card__summary">{result.shortSummary}</p>
      </section>

      <section className="result-card">
        <div className="result-card__header">
          <List size={20} />
          <div>
            <p className="result-card__title">Các ý chính (Key Takeaways)</p>
            <p className="result-card__subtitle">Sao chép nhanh nếu cần</p>
          </div>
          <button className="result-copy-button" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>
        </div>
        <ul className="result-card__list">
          {result.keyPoints.map((point, index) => (
            <li key={index} className="result-card__item">
              <span className="result-card__list-dot" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

