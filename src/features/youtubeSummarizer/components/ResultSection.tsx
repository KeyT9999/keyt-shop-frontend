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
    <div className="result-section" style={{ display: 'grid', gap: '24px' }}>
      {/* TL;DR Card */}
      <section style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '8px', color: '#1E293B' }}>
            <FileText size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>Tóm tắt ngắn (TL;DR)</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Nội dung cốt lõi trong vài dòng</p>
          </div>
        </div>
        <p style={{
          margin: 0,
          lineHeight: '1.6',
          color: '#334155',
          fontSize: '1rem',
          background: '#F8FAFC',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #F1F5F9'
        }}>
          {result.shortSummary}
        </p>
      </section>

      {/* Key Points Card */}
      <section style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E2E8F0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#FFF7ED', borderRadius: '8px', color: '#F05A28' }}>
              <List size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B' }}>Các ý chính</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Key Takeaways</p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              background: copied ? '#F0FDF4' : 'white',
              color: copied ? '#16A34A' : '#64748B',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Đã sao chép' : 'Sao chép'}
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
          {result.keyPoints.map((point, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{
                minWidth: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F05A28',
                marginTop: '8px'
              }} />
              <span style={{ lineHeight: '1.6', color: '#475569' }}>{point}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
