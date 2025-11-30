import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { chatgptService } from '../../services/chatgptService';
import type { ChatGptAccount } from '../../types/chatgpt';
import ChatGptAccountForm from '../../components/admin/ChatGptAccountForm';

export default function ChatGptAccountsPage() {
  const { token, user } = useAuthContext();
  const [accounts, setAccounts] = useState<ChatGptAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (token && user?.admin) {
      fetchAccounts();
    }
  }, [token, user]);

  const fetchAccounts = async () => {
    try {
      const data = await chatgptService.getAllAccounts(token!);
      setAccounts(data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await chatgptService.deleteAccount(id, token!);
      fetchAccounts();
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  if (!user?.admin) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div></div>;
  }

  if (loading) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>Đang tải...</div></div>;
  }

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937' }}>Quản lý Email ChatGPT</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
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
            {showAddForm ? 'Hủy' : 'Thêm Email ChatGPT'}
          </button>
        </div>

        {showAddForm && (
          <ChatGptAccountForm
            onSuccess={() => {
              setShowAddForm(false);
              fetchAccounts();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <div style={{ background: '#ffffff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Secret Key</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id} style={{ borderTop: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '1rem', color: '#1f2937' }}>{account.chatgptEmail}</td>
                  <td style={{ padding: '1rem', color: '#1f2937', fontFamily: 'monospace' }}>{account.secretKey}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleDelete(account._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {accounts.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Chưa có email ChatGPT nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

