import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { chatgptService } from '../../services/chatgptService';
import type { ChatGptAccount } from '../../types/chatgpt';
import ChatGptAccountForm from '../../components/admin/ChatGptAccountForm';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { isValid2FAKey } from '../../utils/validation';

export default function ChatGptAccountsPage() {
  const { token, user } = useAuthContext();
  const [accounts, setAccounts] = useState<ChatGptAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChatGptAccount | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, domainFilter, dateFilter, keyStatusFilter, sortBy]);

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

  // Filter and Sort Logic
  const filteredAccounts = accounts.filter(account => {
    // 1. Search term (Email & Secret Key)
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const emailMatch = account.chatgptEmail.toLowerCase().includes(term);
      const keyMatch = account.secretKey.toLowerCase().replace(/\s+/g, '').includes(term.replace(/\s+/g, ''));
      if (!emailMatch && !keyMatch) return false;
    }

    // 2. Domain Filter
    if (domainFilter) {
      const email = account.chatgptEmail.toLowerCase();
      if (domainFilter === 'gmail') {
        if (!email.endsWith('@gmail.com')) return false;
      } else if (domainFilter === 'icloud') {
        if (!email.endsWith('@icloud.com')) return false;
      } else if (domainFilter === 'outlook') {
        if (!email.endsWith('@outlook.com') && !email.endsWith('@hotmail.com')) return false;
      } else if (domainFilter === 'other') {
        if (email.endsWith('@gmail.com') || email.endsWith('@icloud.com') || email.endsWith('@outlook.com') || email.endsWith('@hotmail.com')) return false;
      }
    }

    // 3. Date Filter (createdAt)
    if (dateFilter && account.createdAt) {
      const createdDate = new Date(account.createdAt);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (dateFilter === 'today') {
        if (createdDate < startOfToday) return false;
      } else if (dateFilter === 'yesterday') {
        if (createdDate < startOfYesterday || createdDate >= startOfToday) return false;
      } else if (dateFilter === '7days') {
        if (diffDays > 7) return false;
      } else if (dateFilter === '30days') {
        if (diffDays > 30) return false;
      }
    }

    // 4. 2FA Key Status Filter
    if (keyStatusFilter) {
      const isValid = isValid2FAKey(account.secretKey);
      if (keyStatusFilter === 'valid' && !isValid) return false;
      if (keyStatusFilter === 'invalid' && isValid) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'az') {
      return a.chatgptEmail.localeCompare(b.chatgptEmail);
    }
    if (sortBy === 'za') {
      return b.chatgptEmail.localeCompare(a.chatgptEmail);
    }
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const paginatedAccounts = sortedAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setDomainFilter('');
    setDateFilter('');
    setKeyStatusFilter('');
    setSortBy('newest');
  };

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

        {/* Stats Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Tổng số tài khoản</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>{accounts.length}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Đang hiển thị</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F05A28' }}>{filteredAccounts.length}</div>
          </div>
          <div style={{ 
            background: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#FEF2F2' : '#ffffff', 
            padding: '20px', 
            borderRadius: '16px', 
            border: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '1px solid #FEE2E2' : '1px solid #E2E8F0', 
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' 
          }}>
            <div style={{ color: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#EF4444' : '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Key lỗi 2FA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#EF4444' : '#1E293B' }}>
              {accounts.filter(a => !isValid2FAKey(a.secretKey)).length}
            </div>
          </div>
        </div>

        {/* Filters Bar Section */}
        <div style={{ 
          background: '#ffffff', 
          padding: '20px', 
          borderRadius: '16px', 
          border: '1px solid #F1F5F9', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo email hoặc secret key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                fontSize: '0.9rem',
                color: '#1E293B',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Domain Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả tên miền</option>
              <option value="gmail">Gmail (@gmail.com)</option>
              <option value="icloud">iCloud (@icloud.com)</option>
              <option value="outlook">Outlook/Hotmail</option>
              <option value="other">Tên miền khác</option>
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
            </select>
          </div>

          {/* 2FA Key Validity Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={keyStatusFilter}
              onChange={(e) => setKeyStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Trạng thái Key 2FA</option>
              <option value="valid">Key hợp lệ</option>
              <option value="invalid">Key không hợp lệ</option>
            </select>
          </div>

          {/* Sort selection */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Ngày tạo: Mới nhất</option>
              <option value="oldest">Ngày tạo: Cũ nhất</option>
              <option value="az">Email: A → Z</option>
              <option value="za">Email: Z → A</option>
            </select>
          </div>
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
              {paginatedAccounts.map((account) => {
                const isKeyValid = isValid2FAKey(account.secretKey);
                return (
                  <tr key={account._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '20px 24px', color: '#1E293B', fontWeight: 500 }}>{account.chatgptEmail}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        {!isKeyValid && (
                          <span style={{
                            background: '#FEF2F2',
                            color: '#EF4444',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            border: '1px solid #FEE2E2',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            Lỗi Key 2FA
                          </span>
                        )}
                      </div>
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
                );
              })}
            </tbody>
          </table>
          
          {filteredAccounts.length === 0 && accounts.length > 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
              <button 
                onClick={handleResetFilters} 
                style={{ 
                  marginTop: '12px', 
                  padding: '10px 20px', 
                  background: '#F05A28', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {accounts.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có tài khoản nào trong hệ thống.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Bắt đầu bằng bước thêm email mới.</p>
            </div>
          )}

          {/* Pagination & Total Count */}
          {filteredAccounts.length > 0 && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAFAF9'
            }}>
              <div style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredAccounts.length)}</strong> của <strong>{filteredAccounts.length}</strong> accounts
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
        <div style={{ marginTop: '16px', color: '#94A3B8', fontSize: '0.875rem', textAlign: 'right', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filteredAccounts.length !== accounts.length && (
              <>Đang lọc ra <strong style={{ color: '#64748B' }}>{filteredAccounts.length}</strong> trên </>
            )}
            Tổng số lượng tài khoản trong hệ thống: <strong style={{ color: '#1E293B' }}>{accounts.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
