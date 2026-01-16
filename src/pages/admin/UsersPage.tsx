import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { UserOtpInfo } from '../../types/admin';
import UserForm from '../../components/admin/UserForm';

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

  useEffect(() => {
    if (token && currentUser?.admin) {
      loadUsers();
    }
  }, [token, currentUser]);

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

  if (!currentUser?.admin) {
    return (
      <div className="main-content">
        <div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937', margin: 0 }}>Quản lý Users</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingUser(null);
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
            {showAddForm ? 'Hủy' : 'Thêm User'}
          </button>
        </div>

        {showAddForm && (
          <UserForm
            onSuccess={() => {
              setShowAddForm(false);
              loadUsers();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {editingUser && (
          <UserForm
            initialData={editingUser}
            onSuccess={() => {
              setEditingUser(null);
              loadUsers();
            }}
            onCancel={() => setEditingUser(null)}
          />
        )}

        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo username hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '1rem'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Đang tải...</div>
        ) : (
          <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Username</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>OTP Requests</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: 600 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const otpInfo = otpInfoMap[u._id];
                  return (
                    <tr key={u._id} style={{ borderTop: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>{u.username}</td>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            background: u.admin ? '#fef3c7' : '#f3f4f6',
                            color: u.admin ? '#92400e' : '#1f2937'
                          }}
                        >
                          {u.admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>
                        {otpInfo ? `${otpInfo.count} lần` : '0 lần'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Link
                            to={`/admin/user-login-history/${u._id}`}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#2563eb',
                              color: '#ffffff',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              transition: 'background 0.2s',
                              display: 'inline-block'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                          >
                            Lịch sử
                          </Link>
                          <button
                            onClick={() => handleEdit(u)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.username)}
                            disabled={u._id === currentUser?.id}
                            style={{
                              padding: '0.5rem 1rem',
                              background: u._id === currentUser?.id ? '#9ca3af' : '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: u._id === currentUser?.id ? 'not-allowed' : 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (u._id !== currentUser?.id) e.currentTarget.style.background = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              if (u._id !== currentUser?.id) e.currentTarget.style.background = '#ef4444';
                            }}
                            title={u._id === currentUser?.id ? 'Không thể xóa chính mình' : 'Xóa user'}
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
            {filteredUsers.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                {searchQuery ? 'Không tìm thấy user nào' : 'Chưa có user nào'}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Tổng số users: <strong>{users.length}</strong>
        </div>
      </div>
    </div>
  );
}

