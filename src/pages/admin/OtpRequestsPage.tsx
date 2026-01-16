import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { UserOtpInfo } from '../../types/admin';

export default function OtpRequestsPage() {
  const { token, user } = useAuthContext();
  const [otpInfos, setOtpInfos] = useState<UserOtpInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedUserHistory, setSelectedUserHistory] = useState<UserOtpInfo['user'] | null>(null);
  const [historyData, setHistoryData] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (token && user?.admin) {
      loadOtpRequests();
    }
  }, [token, user]);

  const loadOtpRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOtpRequests(token!);
      // Ensure data is an array and has valid structure
      if (Array.isArray(data)) {
        setOtpInfos(data.filter(item => item && item.user && item.user._id));
      } else {
        setOtpInfos([]);
      }
    } catch (err) {
      console.error('Error loading OTP requests:', err);
      setOtpInfos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (userId: string, user: UserOtpInfo['user']) => {
    setSelectedUserHistory(user);
    setHistoryLoading(true);
    setHistoryData(null);
    try {
      const data = await adminService.getUserLoginHistory(userId, token!);
      setHistoryData(data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải lịch sử');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistoryModal = () => {
    setSelectedUserHistory(null);
    setHistoryData(null);
  };

  if (!user?.admin) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div></div>;
  }

  if (loading) {
    return <div className="main-content"><div style={{ padding: '2rem', color: '#1f2937' }}>Đang tải...</div></div>;
  }

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <style>{`
        @media (max-width: 768px) {
          .main-content {
            padding: 16px !important;
          }
          #desktop-otp-table {
            display: none !important;
          }
          #mobile-otp-cards {
            display: block !important;
          }
          .otp-header h1 {
            font-size: 1.5rem !important;
          }
        }
        @media (min-width: 769px) {
          #desktop-otp-table {
            display: table !important;
          }
          #mobile-otp-cards {
            display: none !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header Section */}
        <div className="otp-header" style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>OTP Request Statistics</h1>
          <p style={{ color: '#64748B', margin: 0 }}>Thống kê yêu cầu OTP và lịch sử truy cập của người dùng</p>
        </div>

        {/* Desktop Table */}
        <div id="desktop-otp-table" style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Số lần yêu cầu</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lần cuối</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748B', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {otpInfos && otpInfos.length > 0 ? (
                otpInfos.map((info) => {
                  if (!info || !info.user || !info.user._id) {
                    return null;
                  }
                  return (
                    <tr key={info.user._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{info.user.username || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>ID: {info.user._id}</div>
                      </td>
                      <td style={{ padding: '20px 24px', color: '#1E293B' }}>{info.user.email || 'N/A'}</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{
                          background: '#F1F5F9',
                          color: '#1E293B',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          {info.count || 0}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', color: '#64748B' }}>
                        {info.lastRequest ? new Date(info.lastRequest).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => info.user && handleViewHistory(info.user._id, info.user)}
                          style={{
                            padding: '8px 16px',
                            background: '#F05A28',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px -1px rgba(240, 90, 40, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(240, 90, 40, 0.2)';
                          }}
                        >
                          Xem lịch sử
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có yêu cầu OTP nào.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div id="mobile-otp-cards" style={{ display: 'none' }}>
          {otpInfos && otpInfos.length > 0 ? (
            otpInfos.map((info) => {
              if (!info || !info.user || !info.user._id) {
                return null;
              }
              return (
                <div
                  key={info.user._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>User</div>
                    <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', marginBottom: '4px' }}>{info.user.username || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>ID: {info.user._id}</div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#1E293B', fontSize: '0.9rem', wordBreak: 'break-word' }}>{info.user.email || 'N/A'}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Số lần yêu cầu</div>
                      <span style={{
                        background: '#F1F5F9',
                        color: '#1E293B',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'inline-block'
                      }}>
                        {info.count || 0}
                      </span>
                    </div>
                    <div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Lần cuối</div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        {info.lastRequest ? new Date(info.lastRequest).toLocaleString('vi-VN') : '-'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => info.user && handleViewHistory(info.user._id, info.user)}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#F05A28',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px -1px rgba(240, 90, 40, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(240, 90, 40, 0.2)';
                    }}
                  >
                    Xem lịch sử
                  </button>
                </div>
              );
            })
          ) : (
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có yêu cầu OTP nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {selectedUserHistory && (
        <div 
          className="history-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px'
          }}
          onClick={closeHistoryModal}
        >
          <div 
            className="history-modal" 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-header" style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Lịch sử đăng nhập
                </h2>
                <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '4px', wordBreak: 'break-word' }}>
                  User: <span style={{ fontWeight: 600, color: '#F05A28' }}>{selectedUserHistory.username}</span> ({selectedUserHistory.email})
                </div>
              </div>
              <button
                onClick={closeHistoryModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  flexShrink: 0,
                  marginLeft: '12px'
                }}
              >
                ✕
              </button>
            </div>

            <div className="history-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <style>{`
                @media (max-width: 768px) {
                  .history-modal-overlay {
                    padding: 0 !important;
                    align-items: flex-start !important;
                  }
                  .history-modal {
                    max-width: 100% !important;
                    max-height: 100vh !important;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    height: 100vh !important;
                  }
                  .history-stats-grid {
                    grid-template-columns: 1fr !important;
                    gap: 12px !important;
                    margin-bottom: 16px !important;
                  }
                  .history-stats-grid > div {
                    padding: 12px !important;
                  }
                  .history-stats-grid > div > div:first-child {
                    font-size: 0.75rem !important;
                  }
                  .history-stats-grid > div > div:last-child {
                    font-size: 1.25rem !important;
                  }
                  .history-table {
                    display: none !important;
                  }
                  .history-cards {
                    display: block !important;
                  }
                  .history-header {
                    padding: 16px !important;
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                  }
                  .history-header > div {
                    width: 100% !important;
                  }
                  .history-header h2 {
                    font-size: 1.1rem !important;
                    margin-bottom: 4px !important;
                  }
                  .history-header > div > div {
                    font-size: 0.8rem !important;
                    line-height: 1.4 !important;
                  }
                  .history-content {
                    padding: 16px !important;
                  }
                }
                @media (min-width: 769px) {
                  .history-table {
                    display: table !important;
                  }
                  .history-cards {
                    display: none !important;
                  }
                }
              `}</style>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Đang tải dữ liệu...</div>
              ) : historyData ? (
                <>
                  <div className="history-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Tổng số IP khác nhau</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{historyData.distinctIpCount}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>IP thường dùng</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1E293B', wordBreak: 'break-all' }}>
                        {historyData.first2Ips?.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Desktop History Table */}
                  <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Thời gian</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>IP</th>
                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748B', fontSize: '0.85rem', fontWeight: 600 }}>Thiết bị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.history.map((entry: any) => (
                        <tr key={entry._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px', color: '#1E293B', fontSize: '0.9rem' }}>
                            {new Date(entry.loginTime).toLocaleString('vi-VN')}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontSize: '0.85rem' }}>
                              {entry.ipAddress}
                            </code>
                          </td>
                          <td style={{ padding: '12px', color: '#64748B', fontSize: '0.85rem' }}>
                            {entry.userAgent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile History Cards */}
                  <div className="history-cards" style={{ display: 'none' }}>
                    {historyData.history.map((entry: any) => (
                      <div
                        key={entry._id}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: '8px',
                          padding: '12px',
                          marginBottom: '8px',
                          border: '1px solid #E2E8F0'
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Thời gian</div>
                          <div style={{ color: '#1E293B', fontSize: '0.85rem' }}>
                            {new Date(entry.loginTime).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>IP</div>
                          <code style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontSize: '0.8rem', wordBreak: 'break-all', display: 'inline-block' }}>
                            {entry.ipAddress}
                          </code>
                        </div>
                        <div>
                          <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Thiết bị</div>
                          <div style={{ color: '#64748B', fontSize: '0.8rem', wordBreak: 'break-word' }}>
                            {entry.userAgent}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#EF4444' }}>Không có dữ liệu</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
