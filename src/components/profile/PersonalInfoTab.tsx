import { useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { profileService } from '../../services/profileService';
import { uploadService } from '../../services/uploadService';
import type { UserProfile, UpdateProfileData } from '../../types/profile';

interface PersonalInfoTabProps {
  profile: UserProfile;
  onUpdate: (updated: Partial<UserProfile>) => void;
}

export default function PersonalInfoTab({ profile, onUpdate }: PersonalInfoTabProps) {
  const { token } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    email: profile.email,
    phone: profile.phone || '',
    displayName: profile.displayName || '',
    avatar: profile.avatar || ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File ảnh không được vượt quá 5MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = formData.avatar;

      // Upload avatar if a new file is selected
      if (selectedFile && token) {
        setUploading(true);
        try {
          const uploadResult = await uploadService.uploadAvatar(selectedFile, token);
          avatarUrl = uploadResult.imageUrl;
        } catch (uploadErr: any) {
          setError(uploadErr.response?.data?.message || 'Không thể upload avatar');
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Clean up form data: convert empty strings to null
      const cleanedData: UpdateProfileData = {
        email: formData.email,
        phone: formData.phone && formData.phone.trim() ? formData.phone.trim() : null,
        displayName: formData.displayName && formData.displayName.trim() ? formData.displayName.trim() : null,
        avatar: avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : null
      };

      const result = await profileService.updateProfile(cleanedData);
      onUpdate(result.user);
      setSuccess(result.message);
      setIsEditing(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Không thể cập nhật thông tin';
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profile.email,
      phone: profile.phone || '',
      displayName: profile.displayName || '',
      avatar: profile.avatar || ''
    });
    setSelectedFile(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Thông tin cá nhân</h2>
        {!isEditing && (
          <button className="profile-button" onClick={() => setIsEditing(true)}>
            ✏️ Chỉnh sửa
          </button>
        )}
      </div>

      {success && <div className="profile-message success">{success}</div>}
      {error && <div className="profile-message error">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form__group">
            <label>Username</label>
            <input type="text" value={profile.username} disabled />
            <small>Username không thể thay đổi</small>
          </div>

          <div className="profile-form__group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="profile-form__group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="profile-form__group">
            <label>Tên hiển thị</label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value || null })}
              placeholder="Nhập tên hiển thị"
            />
          </div>

          <div className="profile-form__actions">
            <button type="button" className="profile-button secondary" onClick={handleCancel}>
              Hủy
            </button>
            <button type="submit" className="profile-button primary" disabled={loading || uploading}>
              {uploading ? 'Đang upload...' : loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="profile-info__item">
            <label>Username</label>
            <p>{profile.username}</p>
          </div>
          <div className="profile-info__item">
            <label>Email</label>
            <p>{profile.email}</p>
          </div>
          {profile.phone && (
            <div className="profile-info__item">
              <label>Số điện thoại</label>
              <p>{profile.phone}</p>
            </div>
          )}
          {profile.displayName && (
            <div className="profile-info__item">
              <label>Tên hiển thị</label>
              <p>{profile.displayName}</p>
            </div>
          )}
          <div className="profile-info__item">
            <label>Ngày tạo tài khoản</label>
            <p>{new Date(profile.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

