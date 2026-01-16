import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { UserOtpInfo } from '../../types/admin';
import UserForm from '../../components/admin/UserForm';
import { Plus, Search, Trash2, Edit, History, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  admin: boolean;
}

export default function UsersPage() {
  const { token, user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [otpInfoMap, setOtpInfoMap] = useState<Record<string, UserOtpInfo>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filter & Pagination State
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState<User | null>(null);
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (token && currentUser?.admin) {
      loadUsers();
    }
  }, [token, currentUser]);

  // Handle page reset when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      const data = await adminService.getUsers(token!);
      setUsers(data.users);
      setOtpInfoMap(data.otpInfoMap);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Bạn có chắc muốn xóa user "${username}"?`)) return;
    try {
      await adminService.deleteUser(userId, token!);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowAddForm(false);
  };

  const handleViewHistory = async (user: User) => {
    setSelectedUserHistory(user);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const data = await adminService.getUserLoginHistory(user._id, token!);
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải lịch sử');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setSelectedUserHistory(null);
    setHistoryData(null);
  };

  if (!currentUser?.admin) {
    return (
      <div className="p-8 text-center text-red-500">403 - Access Denied</div>
    );
  }

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' ? u.admin : !u.admin);

    return matchesSearch && matchesRole;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-page-content" style={{ background: '#F8FAFC', padding: '40px 20px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>Quản lý Users</h1>
            <p style={{ color: '#64748B', margin: 0 }}>Quản lý tài khoản, phân quyền và lịch sử hoạt động</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Role Filter */}
            <div style={{ display: 'flex', background: 'white', borderRadius: '9999px', padding: '4px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
              <button
                onClick={() => setRoleFilter('all')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: roleFilter === 'all' ? '#1E293B' : 'transparent',
                  color: roleFilter === 'all' ? 'white' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                All
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: roleFilter === 'admin' ? '#F05A28' : 'transparent',
                  color: roleFilter === 'admin' ? 'white' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Admin
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: roleFilter === 'user' ? '#64748B' : 'transparent',
                  color: roleFilter === 'user' ? 'white' : '#64748B',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                User
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  borderRadius: '9999px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  fontSize: '0.9rem',
                  background: 'white',
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

            {/* Add Button */}
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingUser(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: showAddForm ? '#64748B' : '#F05A28',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
              }}
            >
              {showAddForm ? 'Hủy bỏ' : <><Plus size={18} /> Thêm User</>}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="table-container" style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px' }}>
            <UserForm
              onSuccess={() => {
                setShowAddForm(false);
                loadUsers();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {editingUser && (
          <div className="table-container" style={{ marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '16px' }}>
            <UserForm
              initialData={editingUser}
              onSuccess={() => {
                setEditingUser(null);
                loadUsers();
              }}
              onCancel={() => setEditingUser(null)}
            />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>Loading users...</div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Username</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Email</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>OTP Requests</th>
                  <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => {
                  const otpInfo = otpInfoMap[u._id];
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '20px 24px', fontWeight: 600, color: '#1E293B' }}>
                        {u.username}
                      </td>
                      <td style={{ padding: '20px 24px', color: '#1E293B' }}>{u.email}</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          background: u.admin ? '#FFF7ED' : '#F1F5F9',
                          color: u.admin ? '#C2410C' : '#475569',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          {u.admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', color: '#64748B' }}>
                        {otpInfo ? (
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>
                            {otpInfo.count}
                          </span>
                        ) : '0'}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleViewHistory(u)}
                            title="View History"
                            style={{
                              padding: '8px',
                              background: '#F05A28',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <History size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(u)}
                            title="Edit User"
                            style={{
                              padding: '8px',
                              background: '#1E293B',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.username)}
                            disabled={u._id === currentUser?.id}
                            title={u._id === currentUser?.id ? 'Cannot delete self' : 'Delete User'}
                            style={{
                              padding: '8px',
                              background: u._id === currentUser?.id ? '#F1F5F9' : '#FEF2F2',
                              color: u._id === currentUser?.id ? '#94A3B8' : '#EF4444',
                              border: u._id === currentUser?.id ? 'none' : '1px solid #FECACA',
                              borderRadius: '8px',
                              cursor: u._id === currentUser?.id ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No users found matching "{searchQuery}"</p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredUsers.length > 0 && (
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#FAFAF9'
              }}>
                <div style={{ color: '#64748B', fontSize: '0.875rem' }}>
                  Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> của <strong>{filteredUsers.length}</strong> kết quả
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
        )}

        <div style={{ marginTop: '16px', color: '#94A3B8', fontSize: '0.875rem' }}>
          Total users: <strong>{users.length}</strong>
        </div>
      </div>

      {/* History Modal */}
      {historyModalOpen && selectedUserHistory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Lịch sử đăng nhập
                </h2>
                <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px' }}>
                  User: <span style={{ fontWeight: 600, color: '#F05A28' }}>{selectedUserHistory.username}</span> ({selectedUserHistory.email})
                </div>
              </div>
              <button
                onClick={closeHistoryModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Đang tải dữ liệu...</div>
              ) : historyData ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Tổng số IP khác nhau</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{historyData.distinctIpCount}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>IP thường dùng</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', wordBreak: 'break-all' }}>
                        {historyData.first2Ips?.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Thời gian</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>IP</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Thiết bị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.history.map((entry: any) => (
                        <tr key={entry._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px', color: '#1E293B', fontSize: '0.9rem' }}>
                            {new Date(entry.loginTime).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontSize: '0.85rem' }}>
                              {entry.ipAddress}
                            </code>
                          </td>
                          <td style={{ padding: '12px', color: '#64748B', fontSize: '0.85rem' }}>
                            {entry.userAgent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#EF4444' }}>Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
