import { useState } from 'react';
import { profileService } from '../../services/profileService';
import type { UserProfile, UpdateProfileData } from '../../types/profile';

interface SettingsTabProps {
  profile: UserProfile;
  onUpdate: (updated: Partial<UserProfile>) => void;
}

export default function SettingsTab({ profile, onUpdate }: SettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    notifications: {
      email: profile.settings?.notifications?.email ?? true,
      promotions: profile.settings?.notifications?.promotions ?? true
    },
    theme: profile.settings?.theme || 'dark',
    language: profile.settings?.language || 'vi'
  });

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await profileService.updateProfile({ settings });
      onUpdate(result.user);
      setSuccess('Cập nhật cài đặt thành công');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Cài đặt</h2>
        <button className="profile-button primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {success && <div className="profile-message success">{success}</div>}
      {error && <div className="profile-message error">{error}</div>}

      <div className="settings-section">
        <h3>🔔 Thông báo</h3>
        <div className="settings-group">
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })
              }
            />
            <span>Email khi có đơn hàng mới</span>
          </label>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={settings.notifications.promotions}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, promotions: e.target.checked }
                })
              }
            />
            <span>Email khuyến mãi</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3>🎨 Giao diện</h3>
        <div className="settings-group">
          <label>
            <span>Chủ đề</span>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
            >
              <option value="dark">Dark (Tối)</option>
              <option value="light">Light (Sáng)</option>
            </select>
          </label>
          <label>
            <span>Ngôn ngữ</span>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

