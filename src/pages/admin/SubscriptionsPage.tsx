import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import type { ServiceSubscription } from '../../types/subscription';
import SubscriptionForm from '../../components/admin/SubscriptionForm';
import SubscriptionImport from '../../components/admin/SubscriptionImport';

export default function SubscriptionsPage() {
  const { token, user } = useAuthContext();
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (token && user?.admin) {
      fetchSubscriptions();
    }
  }, [token, user, searchQuery, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const data = await subscriptionService.getAll(token!, {
        q: searchQuery || undefined,
        status: statusFilter || undefined
      });
      setSubscriptions(data);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await subscriptionService.delete(id, token!);
      fetchSubscriptions();
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await subscriptionService.sendReminder(id, token!);
      alert('Đã gửi email nhắc khách hàng');
      fetchSubscriptions();
    } catch (err) {
      alert('Có lỗi xảy ra');
    }
  };

  if (!user?.admin) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div></div>;
  }

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding: 16px !important;
          }
          #desktop-subscriptions-table {
            display: none !important;
          }
          #mobile-subscriptions-cards {
            display: block !important;
          }
          .subscriptions-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .subscriptions-actions {
            width: 100% !important;
            flex-direction: column !important;
          }
          .subscriptions-actions button {
            width: 100% !important;
          }
          .subscriptions-filters {
            flex-direction: column !important;
            padding: 12px !important;
            margin-bottom: 24px !important;
          }
          .subscriptions-filters select {
            width: 100% !important;
            min-width: auto !important;
          }
          .subscriptions-title {
            font-size: 1.5rem !important;
          }
        }
        @media (min-width: 769px) {
          #desktop-subscriptions-table {
            display: table !important;
          }
          #mobile-subscriptions-cards {
            display: none !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="subscriptions-main-container">

        {/* Header Section */}
        <div className="subscriptions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 className="subscriptions-title" style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>Quản lý Subscriptions</h1>
            <p style={{ color: '#64748B', margin: 0 }}>Theo dõi và quản lý các gói đăng ký dịch vụ</p>
          </div>

          <div className="subscriptions-actions" style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowImport(!showImport);
                setShowAddForm(false);
              }}
              style={{
                padding: '12px 24px',
                background: '#ffffff',
                color: '#1E293B',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              {showImport ? '✕ Hủy Import' : '📥 Import CSV'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowImport(false);
              }}
              style={{
                padding: '12px 24px',
                background: showAddForm ? '#64748B' : '#F05A28',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
              }}
            >
              {showAddForm ? '✕ Hủy thêm mới' : '＋ Thêm Subscription'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="subscriptions-filters" style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Tìm kiếm theo email khách hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F05A28';
                e.target.style.boxShadow = '0 0 0 1px #F05A28';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
              fontSize: '0.95rem',
              fontWeight: 500,
              minWidth: '200px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#F05A28'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">🟢 Active</option>
            <option value="expired">🔴 Expired</option>
            <option value="pending">🟡 Pending Notification</option>
            <option value="notified">🔵 Notified</option>
          </select>
        </div>

        {showAddForm && <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px' }}><SubscriptionForm onSuccess={() => { setShowAddForm(false); fetchSubscriptions(); }} onCancel={() => setShowAddForm(false)} /></div>}
        {showImport && <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px' }}><SubscriptionImport onSuccess={() => { setShowImport(false); fetchSubscriptions(); }} onCancel={() => setShowImport(false)} /></div>}

        {/* Desktop Table */}
        <div id="desktop-subscriptions-table" style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email khách hàng</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dịch vụ</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày bắt đầu</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ngày hết hạn</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trạng thái</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const endDate = new Date(sub.endDate);
                const now = new Date();
                const isExpired = endDate < now;
                const isActive = endDate >= now;
                return (
                  <tr key={sub._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '20px 24px', color: '#1E293B', fontWeight: 500 }}>{sub.customerEmail}</td>
                    <td style={{ padding: '20px 24px', color: '#1E293B' }}>{sub.serviceName}</td>
                    <td style={{ padding: '20px 24px', color: '#64748B' }}>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '20px 24px', color: isExpired ? '#EF4444' : '#1E293B', fontWeight: isExpired ? 600 : 400 }}>
                      {endDate.toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span
                        style={{
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: isActive ? '#ECFDF5' : '#FEF2F2',
                          color: isActive ? '#047857' : '#B91C1C'
                        }}
                      >
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {sub.manualReminderSentAt ? (
                          <span
                            style={{
                              padding: '8px 12px',
                              background: '#ECFDF5',
                              color: '#047857',
                              border: '1px solid #A7F3D0',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            ✓ Đã gửi nhắc
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendReminder(sub._id)}
                            style={{
                              padding: '8px 12px',
                              background: '#F05A28',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                            }}
                          >
                            📩 Gửi nhắc
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sub._id)}
                          style={{
                            padding: '8px 12px',
                            background: '#FEF2F2',
                            color: '#EF4444',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {subscriptions.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              {loading ? 'Đang tải dữ liệu...' : 'Chưa có bản ghi nào'}
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div id="mobile-subscriptions-cards" style={{ display: 'none' }}>
          {subscriptions.map((sub) => {
            const endDate = new Date(sub.endDate);
            const now = new Date();
            const isExpired = endDate < now;
            const isActive = endDate >= now;
            return (
              <div
                key={sub._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Email khách hàng</div>
                  <div style={{ color: '#1E293B', fontWeight: 500, fontSize: '0.9rem', wordBreak: 'break-word' }}>{sub.customerEmail}</div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Dịch vụ</div>
                  <div style={{ color: '#1E293B', fontSize: '0.9rem' }}>{sub.serviceName}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Ngày bắt đầu</div>
                    <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Ngày hết hạn</div>
                    <div style={{ color: isExpired ? '#EF4444' : '#1E293B', fontSize: '0.85rem', fontWeight: isExpired ? 600 : 400 }}>
                      {endDate.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span
                    style={{
                      padding: '6px 16px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: isActive ? '#ECFDF5' : '#FEF2F2',
                      color: isActive ? '#047857' : '#B91C1C',
                      display: 'inline-block'
                    }}
                  >
                    {isActive ? 'Active' : 'Expired'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sub.manualReminderSentAt ? (
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: '#ECFDF5',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      ✓ Đã gửi nhắc
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSendReminder(sub._id)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: '#F05A28',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      📩 Gửi nhắc
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(sub._id)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
          {subscriptions.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', background: '#ffffff', borderRadius: '12px' }}>
              {loading ? 'Đang tải dữ liệu...' : 'Chưa có bản ghi nào'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
