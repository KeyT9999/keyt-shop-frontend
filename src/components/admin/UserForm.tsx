import { useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';

interface UserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    _id: string;
    username: string;
    email: string;
    admin: boolean;
  };
}

export default function UserForm({ onSuccess, onCancel, initialData }: UserFormProps) {
  const { token } = useAuthContext();
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    admin: initialData?.admin || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (initialData) {
        // Update mode
        const updateData: any = {};
        if (formData.username !== initialData.username) updateData.username = formData.username;
        if (formData.email !== initialData.email) updateData.email = formData.email;
        if (formData.password) updateData.password = formData.password;
        if (formData.admin !== initialData.admin) updateData.admin = formData.admin;

        await adminService.updateUser(initialData._id, updateData, token!);
      } else {
        // Create mode
        if (!formData.password) {
          setError('Password là bắt buộc khi tạo user mới');
          setLoading(false);
          return;
        }
        await adminService.createUser(formData, token!);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff',
        /* Container styling handled by parent */
      }}
    >
      <h3 style={{ color: '#1E293B', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>
        {initialData ? 'Chỉnh sửa User' : 'Thêm User mới'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Username <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            minLength={6}
            placeholder="Nhập username..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Email <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="example@email.com"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Password {initialData ? <span style={{ fontWeight: 400, color: '#64748B' }}>(Để trống nếu không đổi)</span> : <span style={{ color: '#EF4444' }}>*</span>}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!initialData}
            minLength={6}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#ffffff',
              color: '#1E293B',
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Vai trò (Role)
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '12px 16px',
              border: formData.admin ? '1px solid #E2E8F0' : '2px solid #E2E8F0',
              borderRadius: '8px',
              background: !formData.admin ? '#F8FAFC' : 'white',
              opacity: !formData.admin ? 1 : 0.6
            }}>
              <input
                type="radio"
                name="role"
                checked={!formData.admin}
                onChange={() => setFormData({ ...formData, admin: false })}
                style={{ accentColor: '#F05A28' }}
              />
              <span style={{ fontWeight: 500, color: '#1E293B' }}>User</span>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '12px 16px',
              border: formData.admin ? '2px solid #F05A28' : '1px solid #E2E8F0',
              borderRadius: '8px',
              background: formData.admin ? '#FFF7ED' : 'white'
            }}>
              <input
                type="radio"
                name="role"
                checked={formData.admin}
                onChange={() => setFormData({ ...formData, admin: true })}
                style={{ accentColor: '#F05A28' }}
              />
              <span style={{ fontWeight: 600, color: '#9A3412' }}>Admin</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '8px', color: '#B91C1C', marginBottom: '24px', border: '1px solid #FECACA', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            color: '#64748B',
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
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 32px',
            background: loading ? '#94A3B8' : '#F05A28',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(240, 90, 40, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.2)';
            }
          }}
        >
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật User' : 'Thêm User'}
        </button>
      </div>
    </form>
  );
}
