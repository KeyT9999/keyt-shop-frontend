import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import GeminiAccountForm from '../../components/admin/GeminiAccountForm';

interface GeminiAccount {
  _id: string;
  geminiEmail: string;
  secretKey: string;
  createdAt: string;
}

export default function GeminiAccountsPage() {
  const { token, user } = useAuthContext();
  const [accounts, setAccounts] = useState<GeminiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<GeminiAccount | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (token && user?.admin) fetchAccounts();
  }, [token, user]);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/gemini/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err) {
      console.error('Error fetching Gemini accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản Gemini này?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/gemini/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  if (!user?.admin) return <div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div>;
  if (loading) return <div style={{ padding: '2rem', color: '#1f2937' }}>Đang tải...</div>;

  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const paginatedAccounts = accounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const geminiBlue = '#4285F4';
  const geminiPurple = '#9B72CB';

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {/* Gemini icon */}
            <svg width="28" height="28" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z" fill="url(#gem-grad)"/>
              <defs>
                <linearGradient id="gem-grad" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={geminiBlue}/>
                  <stop offset="50%" stopColor={geminiPurple}/>
                  <stop offset="100%" stopColor="#D96570"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Gemini Accounts</h1>
          </div>
          <p style={{ color: '#64748B', margin: 0 }}>Quản lý kho tài khoản Gemini tự động</p>
        </div>

        {/* Form thêm mới luôn hiện / Form sửa khi chọn */}
        <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${geminiBlue}20` }}>
          {editingAccount ? (
            <GeminiAccountForm
              accountId={editingAccount._id}
              initialData={{ _id: editingAccount._id, geminiEmail: editingAccount.geminiEmail, secretKey: editingAccount.secretKey }}
              onSuccess={() => { setEditingAccount(null); fetchAccounts(); }}
              onCancel={() => setEditingAccount(null)}
            />
          ) : (
            <GeminiAccountForm
              onSuccess={() => fetchAccounts()}
              onCancel={() => {}}
              hideCancelButton
            />
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f0ff 100%)', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#4285F4', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Gemini</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#4285F4', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', color: '#4285F4', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account) => (
                <tr key={account._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '20px 24px', color: '#1E293B', fontWeight: 500 }}>{account.geminiEmail}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <code style={{ background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', color: '#4285F4', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {account.secretKey}
                    </code>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditingAccount(account); setShowAddForm(false); }}
                        style={{ padding: '8px 16px', background: '#1E293B', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {accounts.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có tài khoản Gemini nào trong hệ thống.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Bắt đầu bằng bước thêm email mới.</p>
            </div>
          )}

          {accounts.length > 0 && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF9' }}>
              <div style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, accounts.length)}</strong> của <strong>{accounts.length}</strong> accounts
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: currentPage === 1 ? '#CBD5E1' : '#64748B', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: page === currentPage ? 'none' : '1px solid #E2E8F0', background: page === currentPage ? geminiBlue : 'white', color: page === currentPage ? 'white' : '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: currentPage === totalPages ? '#CBD5E1' : '#64748B', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', color: '#94A3B8', fontSize: '0.875rem', textAlign: 'right' }}>
          Tổng số lượng tài khoản Gemini: <strong style={{ color: '#1E293B' }}>{accounts.length}</strong>
        </div>
      </div>
    </div>
  );
}
