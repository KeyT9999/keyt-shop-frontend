import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, Wallet, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { affiliateService } from '../../services/affiliateService';
import type {
  AdminAffiliateEarningsResponse,
  AdminAffiliateOverviewResponse,
  AdminAffiliateWithdrawalsResponse
} from '../../types/affiliate';
import { formatPrice } from '../../utils/formatPrice';

type WithdrawalStatus = 'pending' | 'approved' | 'paid' | 'rejected';
type EarningStatus = 'pending' | 'available' | 'void' | 'paid_out';

function formatDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN');
}

function getWithdrawalBadge(status: WithdrawalStatus) {
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

function getEarningBadge(status: EarningStatus) {
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

function getUserLabel(user?: { username?: string; email?: string; displayName?: string | null } | string) {
  if (!user || typeof user === 'string') return '--';
  return user.displayName || user.username || user.email || '--';
}

export default function AdminAffiliatePage() {
  const { token, user } = useAuthContext();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AdminAffiliateOverviewResponse | null>(null);
  const [withdrawals, setWithdrawals] = useState<AdminAffiliateWithdrawalsResponse | null>(null);
  const [earnings, setEarnings] = useState<AdminAffiliateEarningsResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus>('pending');
  const [earningStatus, setEarningStatus] = useState<EarningStatus>('pending');
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (token && user?.admin) {
      void loadOverview();
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user?.admin) {
      void loadWithdrawals();
    }
  }, [token, user, withdrawalStatus]);

  useEffect(() => {
    if (token && user?.admin) {
      void loadEarnings();
    }
  }, [token, user, earningStatus]);

  const loadOverview = async () => {
    try {
      setError(null);
      setLoadingOverview(true);
      const data = await affiliateService.getAdminOverview(token!);
      setOverview(data);
    } catch (err: any) {
      console.error('Error loading affiliate overview:', err);
      setError(err.response?.data?.message || 'Không thể tải overview affiliate.');
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadWithdrawals = async () => {
    try {
      setLoadingWithdrawals(true);
      const data = await affiliateService.getAdminWithdrawals({ status: withdrawalStatus, limit: 20, page: 1 }, token!);
      setWithdrawals(data);
    } catch (err: any) {
      console.error('Error loading affiliate withdrawals:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách rút tiền.');
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const loadEarnings = async () => {
    try {
      setLoadingEarnings(true);
      const data = await affiliateService.getAdminEarnings({ status: earningStatus, limit: 20, page: 1 }, token!);
      setEarnings(data);
    } catch (err: any) {
      console.error('Error loading affiliate earnings:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách hoa hồng.');
    } finally {
      setLoadingEarnings(false);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadOverview(), loadWithdrawals(), loadEarnings()]);
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject' | 'pay') => {
    if (!token) return;
    const adminNote = draftNotes[withdrawalId]?.trim() || '';

    try {
      setActionId(withdrawalId);
      if (action === 'approve') {
        await affiliateService.approveWithdrawal(withdrawalId, adminNote, token);
      } else if (action === 'reject') {
        await affiliateService.rejectWithdrawal(withdrawalId, adminNote, token);
      } else {
        await affiliateService.markWithdrawalPaid(withdrawalId, adminNote, token);
      }
      await reloadAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật yêu cầu rút tiền.');
    } finally {
      setActionId(null);
    }
  };

  if (!user?.admin) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>
          <h1>403 - Không có quyền truy cập</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fff',
                border: '1px solid #E2E8F0',
                color: '#475569',
                borderRadius: '8px',
                padding: '8px 14px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              <ArrowLeft size={16} />
              Quay lại admin
            </button>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#0F172A' }}>Affiliate và rút tiền hoa hồng</h1>
            <p style={{ margin: '8px 0 0', color: '#64748B', lineHeight: 1.6 }}>
              Quản lý tổng quan cộng tác viên, theo dõi hoa hồng phát sinh và duyệt chuyển khoản cho từng user.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void reloadAll()}
            disabled={loadingOverview || loadingWithdrawals || loadingEarnings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1D4ED8',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '11px 16px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <RefreshCw size={16} />
            Tải lại
          </button>
        </div>

        {error ? (
          <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px' }}>
            {error}
          </div>
        ) : null}

        {loadingOverview && !overview ? (
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '36px', textAlign: 'center', color: '#64748B' }}>
            Đang tải tổng quan affiliate...
          </div>
        ) : null}

        {overview ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { label: 'Tổng hoa hồng phát sinh', value: overview.stats.totalGenerated, color: '#0F172A', plainNumber: false },
                { label: 'Tổng đã chi', value: overview.stats.totalPaidOut, color: '#16A34A', plainNumber: false },
                { label: 'Đang chờ chốt', value: overview.stats.totalPending, color: '#D97706', plainNumber: false },
                { label: 'Có thể rút', value: overview.stats.totalAvailable, color: '#2563EB', plainNumber: false },
                { label: 'Rút tiền chờ duyệt', value: overview.stats.pendingWithdrawals, color: '#7C3AED', plainNumber: true }
              ].map((item) => (
                <div key={item.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>{item.label}</div>
                  <div style={{ color: item.color, fontWeight: 800, fontSize: '1.45rem' }}>
                    {item.plainNumber
                      ? item.value.toLocaleString('vi-VN')
                      : formatPrice(item.value, 'VND')}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
              <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#0F172A' }}>Top cộng tác viên</h2>
              {overview.topAffiliates.length === 0 ? (
                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', textAlign: 'center', color: '#64748B' }}>
                  Chưa có dữ liệu affiliate.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {overview.topAffiliates.map((profile, index) => (
                    <div key={profile._id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto auto', gap: '12px', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#94A3B8' }}>#{index + 1}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{getUserLabel(profile.userId as any)}</div>
                        <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                          Code: {profile.referralCode} • Đã rút: {formatPrice(profile.totalWithdrawn, 'VND')}
                        </div>
                      </div>
                      <div style={{ color: '#2563EB', fontWeight: 700 }}>{formatPrice(profile.availableBalance, 'VND')}</div>
                      <div style={{ color: '#16A34A', fontWeight: 800 }}>{formatPrice(profile.totalEarned, 'VND')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0F172A' }}>Yêu cầu rút tiền</h2>
              <p style={{ margin: '6px 0 0', color: '#64748B' }}>Pending trước, admin duyệt rồi đánh dấu đã chuyển sau khi chuyển khoản xong.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['pending', 'approved', 'paid', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setWithdrawalStatus(status)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '999px',
                    border: withdrawalStatus === status ? '2px solid #0F172A' : '1px solid #CBD5E1',
                    background: withdrawalStatus === status ? '#E2E8F0' : '#fff',
                    color: '#0F172A',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loadingWithdrawals && !withdrawals ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Đang tải danh sách rút tiền...</div>
          ) : withdrawals && withdrawals.withdrawals.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
              Không có yêu cầu rút tiền trong trạng thái này.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {withdrawals?.withdrawals.map((withdrawal) => {
                const badge = getWithdrawalBadge(withdrawal.status);
                const note = draftNotes[withdrawal._id] ?? withdrawal.adminNote ?? '';
                const acting = actionId === withdrawal._id;

                return (
                  <div key={withdrawal._id} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                            {formatPrice(withdrawal.amount, withdrawal.currency || 'VND')}
                          </div>
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', background: badge.background, color: badge.color, fontWeight: 700, fontSize: '0.8rem' }}>
                            {badge.label}
                          </span>
                        </div>
                        <div style={{ color: '#475569', marginTop: '6px', lineHeight: 1.6 }}>
                          {getUserLabel(withdrawal.userId as any)} • {withdrawal.bankName} • {withdrawal.bankAccountNumber} • {withdrawal.bankAccountHolder}
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '6px' }}>
                          Tạo lúc {formatDate(withdrawal.createdAt)} • Xử lý lúc {formatDate(withdrawal.paidAt || withdrawal.approvedAt || withdrawal.rejectedAt)}
                        </div>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 600 }}>
                        <Wallet size={16} />
                        {withdrawal.status}
                      </div>
                    </div>

                    <textarea
                      value={note}
                      onChange={(event) => setDraftNotes((prev) => ({ ...prev, [withdrawal._id]: event.target.value }))}
                      rows={3}
                      placeholder="Ghi chú admin cho lần rút tiền này..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        marginTop: '14px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        padding: '12px',
                        resize: 'vertical',
                        fontSize: '0.95rem',
                        background: '#fff'
                      }}
                    />

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                      {withdrawal.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => void handleWithdrawalAction(withdrawal._id, 'approve')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: 'none',
                              background: '#16A34A',
                              color: '#fff',
                              fontWeight: 700,
                              cursor: acting ? 'wait' : 'pointer'
                            }}
                          >
                            <CheckCircle2 size={16} />
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => void handleWithdrawalAction(withdrawal._id, 'reject')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: 'none',
                              background: '#DC2626',
                              color: '#fff',
                              fontWeight: 700,
                              cursor: acting ? 'wait' : 'pointer'
                            }}
                          >
                            <XCircle size={16} />
                            Từ chối
                          </button>
                        </>
                      ) : null}

                      {withdrawal.status === 'approved' ? (
                        <button
                          type="button"
                          disabled={acting}
                          onClick={() => void handleWithdrawalAction(withdrawal._id, 'pay')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#2563EB',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: acting ? 'wait' : 'pointer'
                          }}
                        >
                          <Wallet size={16} />
                          Đánh dấu đã chuyển
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0F172A' }}>Đơn hàng phát sinh hoa hồng</h2>
              <p style={{ margin: '6px 0 0', color: '#64748B' }}>Theo dõi trạng thái pending / available / paid_out / void của từng conversion.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['pending', 'available', 'void', 'paid_out'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEarningStatus(status)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '999px',
                    border: earningStatus === status ? '2px solid #0F172A' : '1px solid #CBD5E1',
                    background: earningStatus === status ? '#E2E8F0' : '#fff',
                    color: '#0F172A',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loadingEarnings && !earnings ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Đang tải conversions...</div>
          ) : earnings && earnings.earnings.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
              Không có conversion nào trong trạng thái này.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {earnings?.earnings.map((earning) => {
                const badge = getEarningBadge(earning.status);
                return (
                  <div key={earning._id} style={{ border: '1px solid #E2E8F0', borderRadius: '14px', padding: '16px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A' }}>{earning.productName}</div>
                        <div style={{ color: '#475569', marginTop: '6px', lineHeight: 1.6 }}>
                          Referrer: {getUserLabel(earning.referrerUserId as any)} • Buyer: {getUserLabel(earning.buyerUserId as any) || earning.buyerEmail || '--'}
                        </div>
                        <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '6px' }}>
                          Đơn #{earning.orderCode || earning.orderId.slice(-6)} • Tạo lúc {formatDate(earning.createdAt)} • Tỷ lệ {earning.commissionRate}%
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#16A34A', fontWeight: 800, fontSize: '1.1rem' }}>
                          {formatPrice(earning.commissionAmount, earning.currency || 'VND')}
                        </div>
                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '999px', marginTop: '8px', background: badge.background, color: badge.color, fontWeight: 700, fontSize: '0.8rem' }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
