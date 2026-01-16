import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { chatgptService } from '../../services/chatgptService';
import type { ChatGptAccount } from '../../types/chatgpt';
import ChatGptAccountForm from '../../components/admin/ChatGptAccountForm';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ChatGptAccountsPage() {
  const { token, user } = useAuthContext();
  const [accounts, setAccounts] = useState<ChatGptAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChatGptAccount | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Pagination Logic
  const totalPages = Math.ceil(accounts.length / itemsPerPage);
  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>ChatGpt Accounts</h1>
            <p style={{ color: '#64748B', margin: 0 }}>Quản lý kho tài khoản ChatGPT tự động</p>
          </div>

          <button
            onClick={() => {
              if (editingAccount) {
                setEditingAccount(null);
              } else {
                setShowAddForm(!showAddForm);
              }
            }}
            style={{
              padding: '12px 24px',
              background: editingAccount ? '#475569' : '#F05A28',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            {editingAccount ? (
              <>✕ Hủy chỉnh sửa</>
            ) : showAddForm ? (
              <>✕ Hủy thêm mới</>
            ) : (
              <>＋ Thêm Email ChatGPT</>
            )}
          </button>
        </div>

        {/* Forms Container */}
        {(showAddForm || editingAccount) && (
          <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            {showAddForm && !editingAccount && (
              <ChatGptAccountForm
                onSuccess={() => {
                  setShowAddForm(false);
                  fetchAccounts();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            )}
            {editingAccount && (
              <ChatGptAccountForm
                accountId={editingAccount._id}
                initialData={{
                  _id: editingAccount._id,
                  chatgptEmail: editingAccount.chatgptEmail,
                  secretKey: editingAccount.secretKey
                }}
                onSuccess={() => {
                  setEditingAccount(null);
                  fetchAccounts();
                }}
                onCancel={() => setEditingAccount(null)}
              />
            )}
          </div>
        )}

        {/* List Table */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account) => (
                <tr key={account._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '20px 24px', color: '#1E293B', fontWeight: 500 }}>{account.chatgptEmail}</td>
                  <td style={{ padding: '20px 24px' }}>
                    <code style={{
                      background: '#F1F5F9',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace'
                    }}>
                      {account.secretKey}
                    </code>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          setShowAddForm(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#1E293B',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(account._id)}
                        style={{
                          padding: '8px 16px',
                          background: '#FEF2F2',
                          color: '#EF4444',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}
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
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có tài khoản nào trong hệ thống.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Bắt đầu bằng bước thêm email mới.</p>
            </div>
          )}

          {/* Pagination & Total Count */}
          {accounts.length > 0 && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAFAF9'
            }}>
              <div style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, accounts.length)}</strong> của <strong>{accounts.length}</strong> accounts
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    color: currentPage === 1 ? '#CBD5E1' : '#64748B',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: page === currentPage ? 'none' : '1px solid #E2E8F0',
                      background: page === currentPage ? '#F05A28' : 'white',
                      color: page === currentPage ? 'white' : '#64748B',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: 'white',
                    color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total Summary */}
        <div style={{ marginTop: '16px', color: '#94A3B8', fontSize: '0.875rem', textAlign: 'right' }}>
          Tổng số lượng tài khoản trong hệ thống: <strong style={{ color: '#1E293B' }}>{accounts.length}</strong>
        </div>
      </div>
    </div>
  );
}
