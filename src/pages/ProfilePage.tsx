import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { profileService } from '../services/profileService';
import type { UserProfile } from '../types/profile';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mobile when tab changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

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
    { id: 'personal' as TabType, label: 'Thông tin cá nhân' },
    { id: 'security' as TabType, label: 'Bảo mật & Đăng nhập' },
    { id: 'orders' as TabType, label: 'Đơn hàng của tôi' },
    { id: 'activity' as TabType, label: 'Hoạt động' }
  ];

  const displayName = profile.displayName || profile.username;
  const avatarUrl = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=F1F5F9&color=1E293B&size=128`;

  return (
    <div className="profile-page">
      {/* Mobile Menu Button */}
      <button
        className="profile-menu-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="profile-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="profile-container">
        {/* Left Sidebar */}
        <div className={`profile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          {/* User Summary */}
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              <img src={avatarUrl} alt={displayName} />
            </div>
            <div className="sidebar-info">
              <h3>{displayName}</h3>
              <p>{profile.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth <= 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="profile-content" style={{ width: '100%', minHeight: '400px' }}>
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
