import { useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import type { SubscriptionImportResult } from '../../types/subscription';

interface SubscriptionImportProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubscriptionImport({ onSuccess, onCancel }: SubscriptionImportProps) {
  const { token } = useAuthContext();
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubscriptionImportResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const importResult = await subscriptionService.import(data, token!);
      setResult(importResult);
      if (importResult.failed === 0) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [err.response?.data?.message || 'Có lỗi xảy ra']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Import Subscriptions</h3>
      <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Format: email | serviceName | startDate (dd/MM/yyyy) | endDate (dd/MM/yyyy) | zalo (optional) | instagram (optional)
      </p>

      <textarea
        value={data}
        onChange={(e) => setData(e.target.value)}
        required
        rows={10}
        placeholder="email@example.com | Netflix Premium | 01/01/2025 | 31/01/2025 | 0868899104 | @instagram"
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          background: '#ffffff',
          color: '#1f2937',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}
      />

      {result && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #a7f3d0' }}>
            <strong style={{ color: '#065f46' }}>Thành công: {result.success}</strong>
          </div>
          {result.failed > 0 && (
            <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '6px', marginBottom: '0.5rem', border: '1px solid #fecaca' }}>
              <strong style={{ color: '#dc2626' }}>Thất bại: {result.failed}</strong>
            </div>
          )}
          {result.errors.length > 0 && (
            <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '6px', maxHeight: '200px', overflow: 'auto', border: '1px solid #e5e5e5' }}>
              {result.errors.map((error, idx) => (
                <div key={idx} style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: loading ? '#9ca3af' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#2563eb';
          }}
        >
          {loading ? 'Đang import...' : 'Import'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

