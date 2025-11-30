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
        marginBottom: '2rem',
        padding: '1.5rem',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{ color: '#1f2937', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
        {initialData ? 'Sửa User' : 'Thêm User'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
            Username *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
            Password {initialData ? '(để trống nếu không đổi)' : '*'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!initialData}
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: 500 }}>
            Role
          </label>
          <select
            value={formData.admin ? 'admin' : 'user'}
            onChange={(e) => setFormData({ ...formData, admin: e.target.value === 'admin' })}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#1f2937',
              fontSize: '1rem'
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '6px', color: '#dc2626', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: loading ? '#9ca3af' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#2563eb';
          }}
        >
          {loading ? 'Đang xử lý...' : initialData ? 'Cập nhật' : 'Thêm'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}

