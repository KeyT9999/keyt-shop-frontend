import { useEffect, useState, useMemo } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import type { ServiceSubscription } from '../../types/subscription';
import SubscriptionForm from '../../components/admin/SubscriptionForm';
import SubscriptionImport from '../../components/admin/SubscriptionImport';
import {
  Search,
  Plus,
  Upload,
  X,
  RotateCcw,
  Mail,
  Check,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { token, user } = useAuthContext();
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'active' | 'ending_soon' | 'expired'>('all');
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewDate, setRenewDate] = useState('');

  useEffect(() => {
    if (token && user?.admin) {
      fetchSubscriptions();
    }
  }, [token, user, searchQuery, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAll(token!, {
        q: searchQuery || undefined,
        status: statusFilter || undefined
      });
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói đăng ký này?')) return;
    try {
      await subscriptionService.delete(id, token!);
      fetchSubscriptions();
    } catch (err) {
      alert('Có lỗi xảy ra khi xóa gói đăng ký');
    }
  };

  const handleSendReminder = async (id: string) => {
    try {
      await subscriptionService.sendReminder(id, token!);
      alert('Đã gửi email nhắc nhở gia hạn cho khách hàng thành công!');
      fetchSubscriptions();
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi email nhắc nhở');
    }
  };

  const handleRenew = async (id: string) => {
    if (!renewDate) {
      alert('Vui lòng chọn ngày hết hạn mới');
      return;
    }
    try {
      await subscriptionService.renew(id, renewDate, token!);
      setRenewingId(null);
      setRenewDate('');
      alert('Gia hạn thành công!');
      fetchSubscriptions();
    } catch (err) {
      alert('Có lỗi xảy ra khi gia hạn');
    }
  };

  // Quick filter metrics calculation
  const stats = useMemo(() => {
    const now = new Date().getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    let active = 0;
    let endingSoon = 0;
    let expired = 0;

    subscriptions.forEach((sub) => {
      const end = new Date(sub.endDate).getTime();
      if (end < now) {
        expired++;
      } else {
        active++;
        if (end - now <= threeDaysMs) {
          endingSoon++;
        }
      }
    });

    return {
      total: subscriptions.length,
      active,
      endingSoon,
      expired
    };
  }, [subscriptions]);

  // Apply quick filter on top of current list
  const filteredSubscriptions = useMemo(() => {
    const now = new Date().getTime();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    return subscriptions.filter((sub) => {
      const end = new Date(sub.endDate).getTime();
      if (quickFilter === 'active') return end >= now;
      if (quickFilter === 'expired') return end < now;
      if (quickFilter === 'ending_soon') return end >= now && end - now <= threeDaysMs;
      return true;
    });
  }, [subscriptions, quickFilter]);

  if (!user?.admin) {
    return (
      <div className="p-8 text-center text-slate-700">
        <h2 className="text-xl font-bold text-rose-600">403 - Không có quyền truy cập</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Quản lý Subscriptions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi thời hạn và quản lý các gói tài khoản premium của khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setShowImport(!showImport);
              setShowAddForm(false);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
              showImport
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {showImport ? <X size={16} /> : <Upload size={16} />}
            <span>{showImport ? 'Đóng Import' : 'Import CSV'}</span>
          </button>

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowImport(false);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm ${
              showAddForm
                ? 'bg-slate-700 hover:bg-slate-800 text-white'
                : 'bg-[#F05A28] hover:bg-[#d84515] text-white'
            }`}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showAddForm ? 'Hủy thêm mới' : 'Thêm Subscription'}</span>
          </button>
        </div>
      </div>

      {/* Quick Status Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setQuickFilter('all')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            quickFilter === 'all'
              ? 'bg-white border-[#F05A28] ring-2 ring-[#F05A28]/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-medium text-slate-500">Tất cả gói</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </button>

        <button
          onClick={() => setQuickFilter('active')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            quickFilter === 'active'
              ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Đang hoạt động
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">{stats.active}</div>
        </button>

        <button
          onClick={() => setQuickFilter('ending_soon')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            quickFilter === 'ending_soon'
              ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500" />
            Sắp hết hạn (≤ 3 ngày)
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1">{stats.endingSoon}</div>
        </button>

        <button
          onClick={() => setQuickFilter('expired')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            quickFilter === 'expired'
              ? 'bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <AlertCircle size={13} className="text-rose-500" />
            Đã hết hạn
          </div>
          <div className="text-xl font-bold text-rose-600 mt-1">{stats.expired}</div>
        </button>
      </div>

      {/* Forms Drawer / Inset Sections */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Thêm gói Subscription mới</h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <SubscriptionForm
            onSuccess={() => {
              setShowAddForm(false);
              fetchSubscriptions();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {showImport && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">Import danh sách từ CSV</h3>
            <button onClick={() => setShowImport(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <SubscriptionImport
            onSuccess={() => {
              setShowImport(false);
              fetchSubscriptions();
            }}
            onCancel={() => setShowImport(false)}
          />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo email, tên dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F05A28] focus:bg-white transition-all text-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
            <Filter size={14} /> Lọc API:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F05A28] text-slate-700 font-medium cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active (Hoạt động)</option>
            <option value="expired">Expired (Hết hạn)</option>
            <option value="pending">Pending Notification</option>
            <option value="notified">Notified (Đã nhắc)</option>
          </select>

          <button
            onClick={() => fetchSubscriptions()}
            title="Tải lại dữ liệu"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F05A28]' : ''} />
          </button>
        </div>
      </div>

      {/* Main Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Dịch vụ</th>
                <th className="px-5 py-3.5">Ngày bắt đầu</th>
                <th className="px-5 py-3.5">Ngày hết hạn</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubscriptions.map((sub) => {
                const endDate = new Date(sub.endDate);
                const now = new Date();
                const isExpired = endDate < now;
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isEndingSoon = !isExpired && diffDays <= 3;

                return (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                          {sub.customerEmail?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-slate-800">{sub.customerEmail}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {sub.serviceName}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600 text-xs sm:text-sm">
                      {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                          {endDate.toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-xs text-slate-400">
                          {isExpired ? 'Đã hết hạn' : `Còn ${diffDays} ngày`}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <AlertCircle size={12} /> Hết hạn
                        </span>
                      ) : isEndingSoon ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          <Clock size={12} /> Sắp hết hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {renewingId === sub._id ? (
                        <div className="inline-flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <input
                            type="date"
                            value={renewDate}
                            onChange={(e) => setRenewDate(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                          />
                          <button
                            onClick={() => handleRenew(sub._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                          >
                            <Check size={13} /> Lưu
                          </button>
                          <button
                            onClick={() => {
                              setRenewingId(null);
                              setRenewDate('');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRenewingId(sub._id);
                              setRenewDate('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/80 transition-colors cursor-pointer"
                            title="Gia hạn gói"
                          >
                            <RotateCcw size={12} />
                            <span>Gia hạn</span>
                          </button>

                          {sub.manualReminderSentAt ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200/80">
                              <CheckCircle2 size={12} />
                              <span>Đã nhắc</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendReminder(sub._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Gửi email nhắc nhở"
                            >
                              <Mail size={12} />
                              <span>Nhắc hạn</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa gói này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-[#F05A28]" />
                <span>Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-semibold text-slate-700">Không tìm thấy gói subscription nào</p>
                <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filteredSubscriptions.map((sub) => {
          const endDate = new Date(sub.endDate);
          const now = new Date();
          const isExpired = endDate < now;
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          const isEndingSoon = !isExpired && diffDays <= 3;

          return (
            <div key={sub._id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-800 text-sm break-all">{sub.customerEmail}</div>
                  <div className="inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {sub.serviceName}
                  </div>
                </div>
                <div>
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                      Hết hạn
                    </span>
                  ) : isEndingSoon ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                      Sắp hết hạn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Hoạt động
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>
                  <span className="block text-slate-400">Ngày bắt đầu:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400">Ngày hết hạn:</span>
                  <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                    {endDate.toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {renewingId === sub._id ? (
                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <input
                    type="date"
                    value={renewDate}
                    onChange={(e) => setRenewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRenew(sub._id)}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        setRenewingId(null);
                        setRenewDate('');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setRenewingId(sub._id);
                        setRenewDate('');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <RotateCcw size={12} /> Gia hạn
                    </button>
                    {sub.manualReminderSentAt ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg">
                        <CheckCircle2 size={12} /> Đã nhắc
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(sub._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200"
                      >
                        <Mail size={12} /> Nhắc hạn
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            {loading ? 'Đang tải dữ liệu...' : 'Không có gói đăng ký nào'}
          </div>
        )}
      </div>
    </div>
  );
}
