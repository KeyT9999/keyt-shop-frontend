import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { affiliateService } from '../../services/affiliateService';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/formatPrice';
import { useAuthContext } from '../../context/useAuthContext';

interface AffiliateShareBoxProps {
  product: Product;
  currentPrice: number;
}

export default function AffiliateShareBox({ product, currentPrice }: AffiliateShareBoxProps) {
  const { user, token } = useAuthContext();
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const affiliateEnabled =
    product.affiliateEnabled === true && (Number(product.affiliateCommissionPercent) || 0) > 0;
  const commissionPercent = Number(product.affiliateCommissionPercent) || 0;
  const estimatedCommission = Math.round((Number(currentPrice) * commissionPercent) / 100);

  useEffect(() => {
    if (!affiliateEnabled || !user) return;

    let cancelled = false;

    const loadAffiliateProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await affiliateService.getMyDashboard(token!);
        if (!cancelled) {
          setReferralCode(data.profile.referralCode);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Không lấy được link affiliate');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAffiliateProfile();

    return () => {
      cancelled = true;
    };
  }, [affiliateEnabled, user]);

  const referralLink = useMemo(() => {
    if (!referralCode || typeof window === 'undefined') return '';
    return `${window.location.origin}/products/${product._id}?ref=${referralCode}`;
  }, [referralCode, product._id]);

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setMessage('Đã sao chép link giới thiệu.');
      setError(null);
      window.setTimeout(() => setMessage(null), 2500);
    } catch {
      setError('Không thể sao chép link, vui lòng copy thủ công.');
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Mua ${product.name} qua link này để mình nhận hoa hồng nhé.`,
          url: referralLink
        });
        setMessage('Đã mở hộp chia sẻ.');
      } else {
        await navigator.clipboard.writeText(referralLink);
        setMessage('Thiết bị không hỗ trợ chia sẻ nhanh, mình đã copy link giúp bạn.');
      }
      setError(null);
      window.setTimeout(() => setMessage(null), 2500);
    } catch {
      /* user cancelled share */
    }
  };

  if (!affiliateEnabled) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom right, #ffffff, rgba(255, 247, 237, 0.8))',
        backdropFilter: 'blur(24px)',
        color: '#1e293b',
        borderRadius: '18px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.03)'
      }}
    >
      <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
        Chia sẻ ngay để nhận hoa hồng <span style={{ color: '#F05A28' }}>{formatPrice(estimatedCommission, product.currency)}</span>
      </div>
      <p style={{ margin: '0 0 1.2rem', color: '#475569', lineHeight: 1.6, fontSize: '0.95rem' }}>
        Sản phẩm này đang có mức hoa hồng <strong>{commissionPercent}%</strong> trên giá bán thực tế. Mỗi đơn hợp lệ qua link của bạn sẽ được cộng tự động vào tài khoản hoa hồng.
      </p>

      {!user ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(226,232,240,0.6)'
          }}
        >
          <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>Đăng nhập để lấy link giới thiệu riêng của bạn.</div>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 18px',
              borderRadius: '12px',
              background: '#0ea5e9',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            Đăng nhập để nhận hoa hồng
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
            <input
              type="text"
              value={loading ? 'Đang tạo link affiliate...' : referralLink}
              readOnly
              style={{
                flex: '1 1 320px',
                minWidth: 0,
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#334155',
                fontSize: '1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              }}
            />
            <button
              type="button"
              disabled={loading || !referralLink}
              onClick={handleCopy}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: 'none',
                background: '#0ea5e9',
                color: '#fff',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              Sao chép
            </button>
            <button
              type="button"
              disabled={loading || !referralLink}
              onClick={handleShare}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              Chia sẻ
            </button>
          </div>

          {message && <p style={{ margin: '0.75rem 0 0', color: '#16a34a', fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>}
          {error && <p style={{ margin: '0.75rem 0 0', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>{error}</p>}
        </>
      )}
    </div>
  );
}
