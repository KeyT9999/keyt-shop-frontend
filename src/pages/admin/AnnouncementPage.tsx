import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { announcementService } from '../../services/announcementService';
import { Bell, Save } from 'lucide-react';

export default function AnnouncementPage() {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const current = await announcementService.getAdminCurrent(token);
      if (current) {
        setTitle(current.title || '');
        setMessage(current.message || '');
        setIsActive(!!current.isActive);
        setUpdatedAt(current.updatedAt || null);
      } else {
        setTitle('');
        setMessage('');
        setIsActive(false);
        setUpdatedAt(null);
      }
    } catch (err) {
      console.error('Failed to load announcement:', err);
      alert('Không thể tải thông báo hiện tại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!message.trim()) {
      alert('Vui lòng nhập nội dung thông báo');
      return;
    }
    try {
      setSaving(true);
      const resp = await announcementService.updateAdminCurrent(
        { title: title.trim(), message: message.trim(), isActive },
        token
      );
      setUpdatedAt(resp.announcement.updatedAt || null);
      alert('Đã lưu thông báo');
    } catch (err: any) {
      console.error('Failed to save announcement:', err);
      alert(err?.response?.data?.message || 'Không thể lưu thông báo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(240, 90, 40, 0.12)',
            color: '#F05A28',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Bell size={20} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>Thông báo</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            User sẽ thấy thông báo này ngay sau khi đăng nhập (có thể tắt bằng dấu X).
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '900px'
        }}
      >
        {loading ? (
          <div style={{ padding: '24px', color: '#64748B' }}>Đang tải...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                Tiêu đề (tuỳ chọn)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bảo trì hệ thống"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                Nội dung <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Nhập nội dung thông báo..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ marginTop: '6px', color: '#94A3B8', fontSize: '0.8rem' }}>
                Hỗ trợ xuống dòng. (Plain text, không HTML)
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#F05A28', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 800, color: '#1E293B' }}>Bật thông báo</div>
                <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                  Nếu bật, tất cả user đăng nhập sẽ thấy modal thông báo.
                </div>
              </div>
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                {updatedAt ? `Cập nhật: ${new Date(updatedAt).toLocaleString('vi-VN')}` : 'Chưa có bản ghi'}
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 18px',
                  background: saving ? '#94A3B8' : '#F05A28',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={18} />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

