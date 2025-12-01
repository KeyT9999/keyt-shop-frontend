import { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import type { UserActivity } from '../../types/profile';

export default function ActivityTab() {
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getActivity();
      setActivity(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải hoạt động');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Hoạt động</h2>
        </div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Hoạt động</h2>
        </div>
        <div className="profile-message error">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Hoạt động</h2>
      </div>

      {activeSection === 'otp' && (
        <div className="activity-section">
          <h3>Lịch sử yêu cầu OTP</h3>
          {activity.otpRequests.length === 0 ? (
            <div className="profile-empty">
              <p>🔐 Bạn chưa yêu cầu OTP nào</p>
            </div>
          ) : (
            <div className="activity-list">
              {activity.otpRequests.map((request) => (
                <div key={request.id} className="activity-item">
                  <div className="activity-item__header">
                    <h4>ChatGPT Email: {request.chatgptEmail}</h4>
                    <span className="activity-item__date">
                      {new Date(request.requestedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

