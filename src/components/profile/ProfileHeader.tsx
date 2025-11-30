import { useRef, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { profileService } from '../../services/profileService';
import { uploadService } from '../../services/uploadService';
import type { UserProfile } from '../../types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
  onUpdate?: (updated: Partial<UserProfile>) => void;
}

export default function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
  const { token } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const displayName = profile.displayName || profile.username;
  const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=667eea&color=fff&size=128`;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      const uploadResult = await uploadService.uploadAvatar(file, token);
      
      // Update profile with new avatar URL
      const result = await profileService.updateProfile({ avatar: uploadResult.imageUrl });
      
      if (onUpdate) {
        onUpdate(result.user);
      }
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-header">
      <div 
        className="profile-header__avatar" 
        style={{ position: 'relative', cursor: uploading ? 'wait' : 'pointer' }}
        onClick={handleAvatarClick}
      >
        <img 
          src={avatarUrl} 
          alt={displayName}
          style={{ 
            opacity: uploading ? 0.6 : 1,
            transition: 'opacity 0.2s'
          }}
        />
        {uploading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#2563eb',
            fontSize: '24px'
          }}>
            ⏳
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            background: '#2563eb',
            color: '#ffffff',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            border: '3px solid #ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✏️
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <div className="profile-header__info">
        <h1 className="profile-header__name">{displayName}</h1>
        <p className="profile-header__email">{profile.email}</p>
        <div className="profile-header__meta">
          <span className="profile-header__badge">
            {profile.loginType === 'login-google' ? '🔗 Google' : '📧 Email'}
          </span>
          {profile.admin && (
            <span className="profile-header__badge admin">👑 Admin</span>
          )}
        </div>
      </div>
    </div>
  );
}

