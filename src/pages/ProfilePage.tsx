import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile';
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInfoTab from '../components/profile/PersonalInfoTab';
import SecurityTab from '../components/profile/SecurityTab';
import OrdersTab from '../components/profile/OrdersTab';
import ActivityTab from '../components/profile/ActivityTab';

import './ProfilePage.css';

type TabType = 'personal' | 'security' | 'orders' | 'activity';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedProfile });
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tabs = [
    { id: 'personal' as TabType, label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'security' as TabType, label: 'Bảo mật', icon: '🔒' },
    { id: 'orders' as TabType, label: 'Đơn hàng', icon: '📦' },
    { id: 'activity' as TabType, label: 'Hoạt động', icon: '📊' }
  ];

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <p className="profile-eyebrow">MY ACCOUNT</p>
        <h1 className="profile-title">Profile Settings</h1>
      </div>

      <ProfileHeader profile={profile} onUpdate={handleProfileUpdate} />

      <div className="profile-tabs">
        <div className="profile-tabs__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-tabs__button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="profile-tabs__icon">{tab.icon}</span>
              <span className="profile-tabs__label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="profile-tabs__content">
          {activeTab === 'personal' && (
            <PersonalInfoTab profile={profile} onUpdate={handleProfileUpdate} />
          )}
          {activeTab === 'security' && (
            <SecurityTab profile={profile} />
          )}
          {activeTab === 'orders' && (
            <OrdersTab />
          )}
          {activeTab === 'activity' && (
            <ActivityTab />
          )}

        </div>
      </div>
    </div>
  );
}

