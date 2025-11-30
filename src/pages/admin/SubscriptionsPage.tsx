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
    <div className="main-content">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937' }}>Quản lý Subscriptions</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => {
                setShowImport(!showImport);
                setShowAddForm(false);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              {showImport ? 'Hủy Import' : 'Import'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowImport(false);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              {showAddForm ? 'Hủy' : 'Thêm Subscription'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          >
            <option value="">Tất cả</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending Notification</option>
            <option value="notified">Notified</option>
          </select>
        </div>

        {showAddForm && <SubscriptionForm onSuccess={() => { setShowAddForm(false); fetchSubscriptions(); }} onCancel={() => setShowAddForm(false)} />}
        {showImport && <SubscriptionImport onSuccess={() => { setShowImport(false); fetchSubscriptions(); }} onCancel={() => setShowImport(false)} />}

        <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'auto', border: '1px solid #e5e5e5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Service</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Start Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>End Date</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const endDate = new Date(sub.endDate);
                const now = new Date();
                const isExpired = endDate < now;
                const isActive = endDate >= now;
                return (
                  <tr key={sub._id} style={{ borderTop: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem', color: '#1f2937' }}>{sub.customerEmail}</td>
                    <td style={{ padding: '1rem', color: '#1f2937' }}>{sub.serviceName}</td>
                    <td style={{ padding: '1rem', color: '#1f2937' }}>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '1rem', color: isExpired ? '#ef4444' : '#1f2937' }}>
                      {endDate.toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: isActive ? '#d1fae5' : '#fee2e2',
                          color: isActive ? '#065f46' : '#991b1b'
                        }}
                      >
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSendReminder(sub._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                        >
                          Gửi nhắc
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
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
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              {loading ? 'Đang tải...' : 'Chưa có subscription nào'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

