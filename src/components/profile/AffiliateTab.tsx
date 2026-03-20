import { useEffect, useState } from 'react';
import { affiliateService } from '../../services/affiliateService';
import type { AffiliateDashboardResponse } from '../../types/affiliate';
import { formatPrice } from '../../utils/formatPrice';
import { useAuthContext } from '../../context/useAuthContext';

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
}

function getEarningStatusMeta(status: 'pending' | 'available' | 'void' | 'paid_out') {
  switch (status) {
    case 'available':
      return { label: 'Có thể rút', background: '#DCFCE7', color: '#166534' };
    case 'paid_out':
      return { label: 'Đã chi trả', background: '#DBEAFE', color: '#1D4ED8' };
    case 'void':
      return { label: 'Không hợp lệ', background: '#FEE2E2', color: '#991B1B' };
    case 'pending':
    default:
      return { label: 'Đang chờ', background: '#FEF3C7', color: '#92400E' };
  }
}

function getWithdrawalStatusMeta(status: 'pending' | 'approved' | 'paid' | 'rejected') {
  switch (status) {
    case 'approved':
      return { label: 'Đã duyệt', background: '#DBEAFE', color: '#1D4ED8' };
    case 'paid':
      return { label: 'Đã chuyển', background: '#DCFCE7', color: '#166534' };
    case 'rejected':
      return { label: 'Từ chối', background: '#FEE2E2', color: '#991B1B' };
    case 'pending':
    default:
      return { label: 'Chờ duyệt', background: '#FEF3C7', color: '#92400E' };
  }
}

export default function AffiliateTab() {
  const { token } = useAuthContext();
  const [dashboard, setDashboard] = useState<AffiliateDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: ''
  });
  const [bankSaving, setBankSaving] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    void loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await affiliateService.getMyDashboard(token!);
      setDashboard(data);
      setBankForm({
        bankName: data.profile.bankName || '',
        bankAccountNumber: data.profile.bankAccountNumber || '',
        bankAccountHolder: data.profile.bankAccountHolder || ''
      });
    } catch (err: any) {
      console.error('Error loading affiliate dashboard:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu hoa hồng.');
    } finally {
      setLoading(false);
    }
  };

  const setFlashNotice = (message: string, type: 'success' | 'error') => {
    setNotice(message);
    setNoticeType(type);
    window.setTimeout(() => setNotice(null), 3000);
  };

  const handleSaveBank = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bankForm.bankName.trim() || !bankForm.bankAccountNumber.trim() || !bankForm.bankAccountHolder.trim()) {
      setFlashNotice('Vui lòng điền đầy đủ thông tin ngân hàng.', 'error');
      return;
    }

    try {
      setBankSaving(true);
      const profile = await affiliateService.updateBankInfo({
        bankName: bankForm.bankName.trim(),
        bankAccountNumber: bankForm.bankAccountNumber.trim(),
        bankAccountHolder: bankForm.bankAccountHolder.trim()
      }, token!);
      setDashboard((prev) =>
        prev
          ? {
              ...prev,
              profile
            }
          : prev
      );
      setFlashNotice('Đã cập nhật thông tin ngân hàng.', 'success');
    } catch (err: any) {
      setFlashNotice(err.response?.data?.message || 'Không thể cập nhật ngân hàng.', 'error');
    } finally {
      setBankSaving(false);
    }
  };

  const handleRequestWithdrawal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dashboard) return;

    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFlashNotice('Số tiền rút không hợp lệ.', 'error');
      return;
    }

    if (amount < dashboard.minimumWithdrawalAmount) {
      setFlashNotice(
        `Số tiền rút tối thiểu là ${formatPrice(dashboard.minimumWithdrawalAmount, 'VND')}.`,
        'error'
      );
      return;
    }

    if (amount > dashboard.profile.availableBalance) {
      setFlashNotice('Số dư khả dụng không đủ để rút.', 'error');
      return;
    }

    try {
      setWithdrawLoading(true);
      await affiliateService.requestWithdrawal(amount, token!);
      setWithdrawAmount('');
      setFlashNotice('Đã gửi yêu cầu rút tiền cho admin.', 'success');
      await loadDashboard();
    } catch (err: any) {
      setFlashNotice(err.response?.data?.message || 'Không thể tạo yêu cầu rút tiền.', 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading && !dashboard) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#64748B' }}>
          Đang tải dữ liệu hoa hồng...
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #FECACA', color: '#991B1B' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Không thể tải trang hoa hồng</div>
          <div style={{ marginBottom: '16px' }}>{error}</div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: '#F05A28',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { profile, earnings, withdrawals, minimumWithdrawalAmount } = dashboard;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', color: '#fff', borderRadius: '18px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93C5FD', fontWeight: 700, marginBottom: '8px' }}>
              Trung tâm affiliate
            </div>
            <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Hoa hồng của tôi</h2>
            <p style={{ margin: '10px 0 0', color: 'rgba(226,232,240,0.9)', lineHeight: 1.6 }}>
              Mã giới thiệu của bạn là <strong>{profile.referralCode}</strong>. Hãy lấy link chia sẻ ngay tại từng trang sản phẩm để nhận hoa hồng tự động.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            Tải lại
          </button>
        </div>
      </div>

      {notice ? (
        <div
          style={{
            borderRadius: '12px',
            padding: '14px 16px',
            border: `1px solid ${noticeType === 'success' ? '#BBF7D0' : '#FECACA'}`,
            background: noticeType === 'success' ? '#F0FDF4' : '#FEF2F2',
            color: noticeType === 'success' ? '#166534' : '#991B1B'
          }}
        >
          {notice}
        </div>
      ) : null}

      {error ? (
        <div style={{ borderRadius: '12px', padding: '14px 16px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#991B1B' }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Tổng hoa hồng', value: profile.totalEarned, color: '#0F172A' },
          { label: 'Đang chờ', value: profile.pendingBalance, color: '#D97706' },
          { label: 'Có thể rút', value: profile.availableBalance, color: '#16A34A' },
          { label: 'Đã rút', value: profile.totalWithdrawn, color: '#2563EB' }
        ].map((item) => (
          <div key={item.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px' }}>
            <div style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</div>
            <div style={{ color: item.color, fontWeight: 800, fontSize: '1.5rem' }}>{formatPrice(item.value, 'VND')}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '20px' }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0F172A' }}>Tài khoản ngân hàng nhận tiền</h3>
          <form onSubmit={handleSaveBank} style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#334155', fontWeight: 600 }}>Tên ngân hàng</span>
                <input
                  value={bankForm.bankName}
                  onChange={(event) => setBankForm((prev) => ({ ...prev, bankName: event.target.value }))}
                  placeholder="VD: MB Bank, Vietcombank"
                  style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '8px' }}>
                <span style={{ color: '#334155', fontWeight: 600 }}>Số tài khoản</span>
                <input
                  value={bankForm.bankAccountNumber}
                  onChange={(event) => setBankForm((prev) => ({ ...prev, bankAccountNumber: event.target.value }))}
                  placeholder="Nhập số tài khoản"
                  style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>Tên chủ tài khoản</span>
              <input
                value={bankForm.bankAccountHolder}
                onChange={(event) => setBankForm((prev) => ({ ...prev, bankAccountHolder: event.target.value }))}
                placeholder="Nhập đúng tên chủ tài khoản"
                style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ color: '#64748B', fontSize: '0.92rem' }}>
                Thông tin này sẽ được chụp lại vào từng yêu cầu rút tiền để admin chuyển khoản.
              </div>
              <button
                type="submit"
                disabled={bankSaving}
                style={{
                  padding: '12px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0F172A',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: bankSaving ? 'wait' : 'pointer'
                }}
              >
                {bankSaving ? 'Đang lưu...' : 'Lưu thông tin ngân hàng'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#0F172A' }}>Rút tiền hoa hồng</h3>
          <p style={{ marginTop: 0, color: '#64748B', lineHeight: 1.6 }}>
            Số dư có thể rút hiện tại: <strong>{formatPrice(profile.availableBalance, 'VND')}</strong>. Mức tối thiểu mỗi lần rút là{' '}
            <strong>{formatPrice(minimumWithdrawalAmount, 'VND')}</strong>.
          </p>

          <form onSubmit={handleRequestWithdrawal} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="number"
              min={minimumWithdrawalAmount}
              step="1000"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              placeholder="Nhập số tiền muốn rút"
              style={{ flex: '1 1 240px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
            />
            <button
              type="submit"
              disabled={withdrawLoading}
              style={{
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#16A34A',
                color: '#fff',
                fontWeight: 700,
                cursor: withdrawLoading ? 'wait' : 'pointer'
              }}
            >
              {withdrawLoading ? 'Đang gửi...' : 'Gửi yêu cầu rút tiền'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0F172A' }}>Lịch sử hoa hồng</h3>
        {earnings.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
            Chưa có đơn hàng nào mang về hoa hồng cho bạn.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {earnings.map((earning) => {
              const meta = getEarningStatusMeta(earning.status);
              return (
                <div key={earning._id} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 700 }}>{earning.productName}</div>
                      <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                        Đơn #{earning.orderCode || earning.orderId.slice(-6)} • Khách mua: {earning.buyerName || earning.buyerEmail || '--'}
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '6px' }}>
                        Tạo lúc {formatDate(earning.createdAt)} • Tỷ lệ {earning.commissionRate}%
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#16A34A', fontWeight: 800, fontSize: '1.1rem' }}>
                        {formatPrice(earning.commissionAmount, earning.currency || 'VND')}
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          marginTop: '8px',
                          background: meta.background,
                          color: meta.color,
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0F172A' }}>Lịch sử rút tiền</h3>
        {withdrawals.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
            Chưa có yêu cầu rút tiền nào.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {withdrawals.map((withdrawal) => {
              const meta = getWithdrawalStatusMeta(withdrawal.status);
              return (
                <div key={withdrawal._id} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 16px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ color: '#0F172A', fontWeight: 700 }}>{formatPrice(withdrawal.amount, withdrawal.currency || 'VND')}</div>
                      <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                        {withdrawal.bankName} • {withdrawal.bankAccountNumber} • {withdrawal.bankAccountHolder}
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '6px' }}>
                        Tạo lúc {formatDate(withdrawal.createdAt)}
                        {withdrawal.adminNote ? ` • Ghi chú admin: ${withdrawal.adminNote}` : ''}
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignSelf: 'flex-start',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: meta.background,
                        color: meta.color,
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
