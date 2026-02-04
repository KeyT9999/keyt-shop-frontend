import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export default function AnnouncementModal({ open, title, message, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC'
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F05A28', marginBottom: '2px' }}>
              Thông báo
            </div>
            {title?.trim() ? (
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                {title}
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng thông báo"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#64748B',
              padding: '6px',
              borderRadius: '10px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 18px' }}>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#1E293B'
            }}
          >
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

