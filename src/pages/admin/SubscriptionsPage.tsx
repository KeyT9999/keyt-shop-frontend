import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import type { ServiceSubscription } from '../../types/subscription';
import SubscriptionForm from '../../components/admin/SubscriptionForm';
import SubscriptionImport from '../../components/admin/SubscriptionImport';
import {
  Search,
  Plus,
  Upload,
  Download,
  X,
  RotateCcw,
  Mail,
  Check,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarPlus,
  Layers,
  Copy,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  CheckCheck
} from 'lucide-react';

type SortOption =
  | 'expiring_soon_first' // Ưu tiên sắp hết hạn (≤ 7 ngày) lên đầu (Mặc định)
  | 'end_date_asc'        // Hạn gần nhất -> xa nhất
  | 'end_date_desc'       // Hạn xa nhất -> gần nhất
  | 'email_asc'           // Email A -> Z
  | 'newest';             // Mới cập nhật/tạo gần đây

type QuickFilterType = 'all' | 'ending_soon' | 'active' | 'expired';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

// Hàm sinh màu avatar ngẫu nhiên nhưng ổn định dựa trên ký tự đầu
function getAvatarGradient(char: string): string {
  const gradients = [
    'from-orange-500 to-amber-500 text-white',
    'from-blue-600 to-indigo-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-rose-500 to-pink-500 text-white',
    'from-purple-600 to-violet-600 text-white',
    'from-cyan-600 to-blue-600 text-white'
  ];
  const code = char.charCodeAt(0) || 0;
  return gradients[code % gradients.length];
}

export default function SubscriptionsPage() {
  const { token, user } = useAuthContext();
  const [subscriptions, setSubscriptions] = useState<ServiceSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<ServiceSubscription | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('expiring_soon_first');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Quick Renew Modal State
  const [renewTarget, setRenewTarget] = useState<ServiceSubscription | null>(null);
  const [renewDate, setRenewDate] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);
  const [quickRenewingId, setQuickRenewingId] = useState<string | null>(null);

  // Reminder Action State
  const [remindingId, setRemindingId] = useState<string | null>(null);

  // In-app Toast Notification
  const [toast, setToast] = useState<ToastState | null>(null);

  // Hiển thị toast tự tắt sau 3.5s
  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    if (!token || !user?.admin) return;
    try {
      setLoading(true);
      const data = await subscriptionService.getAll(token, {
        q: searchQuery || undefined,
        status: statusFilter || undefined
      });
      setSubscriptions(data || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      showToast('error', 'Không thể tải danh sách gói subscription.');
    } finally {
      setLoading(false);
    }
  }, [token, user, searchQuery, statusFilter, showToast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Danh sách tên dịch vụ duy nhất để lọc
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    subscriptions.forEach((s) => {
      if (s.serviceName?.trim()) set.add(s.serviceName.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [subscriptions]);

  // Tính toán số liệu thống kê KPI (chuẩn hóa 7 ngày cho "Sắp hết hạn")
  const stats = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    let active = 0;
    let endingSoon = 0;
    let expired = 0;

    subscriptions.forEach((sub) => {
      const end = new Date(sub.endDate).getTime();
      if (end < now) {
        expired++;
      } else {
        active++;
        if (end - now <= sevenDaysMs) {
          endingSoon++;
        }
      }
    });

    return {
      total: subscriptions.length,
      active,
      endingSoon,
      expired,
      activePercent: subscriptions.length > 0 ? Math.round((active / subscriptions.length) * 100) : 0
    };
  }, [subscriptions]);

  // Xử lý Xóa gói
  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa gói của khách hàng "${email}"?`)) return;
    try {
      await subscriptionService.delete(id, token!);
      showToast('success', 'Đã xóa gói subscription thành công.');
      fetchSubscriptions();
    } catch (err) {
      console.error('Error deleting subscription:', err);
      showToast('error', 'Có lỗi xảy ra khi xóa gói đăng ký.');
    }
  };

  // Xử lý Gửi nhắc nhở
  const handleSendReminder = async (id: string, email: string) => {
    try {
      setRemindingId(id);
      await subscriptionService.sendReminder(id, token!);
      showToast('success', `Đã gửi email nhắc nhở gia hạn đến ${email}!`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Error sending reminder:', err);
      showToast('error', 'Có lỗi xảy ra khi gửi email nhắc nhở.');
    } finally {
      setRemindingId(null);
    }
  };

  // Mở modal Gia hạn
  const openRenewModal = (sub: ServiceSubscription) => {
    setRenewTarget(sub);
    // Tính toán ngày hết hạn đề xuất: Mặc định +1 tháng từ ngày hết hạn cũ (hoặc từ hôm nay nếu đã hết hạn)
    const baseDate = new Date(sub.endDate) > new Date() ? new Date(sub.endDate) : new Date();
    const nextMonth = new Date(baseDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setRenewDate(nextMonth.toISOString().split('T')[0]);
  };

  // Preset chọn ngày gia hạn nhanh (+7 ngày, +1 tháng, +3 tháng, +6 tháng, +1 năm)
  const applyRenewPreset = (type: '7days' | '1month' | '3months' | '6months' | '1year') => {
    if (!renewTarget) return;
    const baseDate = new Date(renewTarget.endDate) > new Date() ? new Date(renewTarget.endDate) : new Date();
    const target = new Date(baseDate);

    if (type === '7days') target.setDate(target.getDate() + 7);
    if (type === '1month') target.setMonth(target.getMonth() + 1);
    if (type === '3months') target.setMonth(target.getMonth() + 3);
    if (type === '6months') target.setMonth(target.getMonth() + 6);
    if (type === '1year') target.setFullYear(target.getFullYear() + 1);

    setRenewDate(target.toISOString().split('T')[0]);
  };

  // Thực hiện Gia hạn
  const handleRenewSubmit = async () => {
    if (!renewTarget || !renewDate) {
      showToast('error', 'Vui lòng chọn ngày hết hạn mới.');
      return;
    }
    try {
      setRenewLoading(true);
      await subscriptionService.renew(renewTarget._id, renewDate, token!);
      showToast('success', `Gia hạn thành công cho ${renewTarget.customerEmail}!`);
      setRenewTarget(null);
      setRenewDate('');
      fetchSubscriptions();
    } catch (err) {
      console.error('Error renewing subscription:', err);
      showToast('error', 'Có lỗi xảy ra khi gia hạn gói.');
    } finally {
      setRenewLoading(false);
    }
  };

  // Gia hạn nhanh 1 năm kể từ thời điểm bấm
  const handleQuickRenewOneYear = async (sub: ServiceSubscription) => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const newEndDate = `${year}-${month}-${day}`;

    if (!confirm(`Xác nhận gia hạn 1 NĂM (đến ngày ${day}/${month}/${year}) cho khách hàng "${sub.customerEmail}"?`)) {
      return;
    }

    try {
      setQuickRenewingId(sub._id);
      await subscriptionService.renew(sub._id, newEndDate, token!);
      showToast('success', `Đã gia hạn 1 năm cho ${sub.customerEmail}! Hạn mới: ${day}/${month}/${year}`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Error quick renewing 1 year:', err);
      showToast('error', 'Có lỗi xảy ra khi gia hạn 1 năm.');
    } finally {
      setQuickRenewingId(null);
    }
  };

  // Sao chép nhanh văn bản vào clipboard
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('info', `Đã sao chép ${label}: ${text}`);
  };

  // Xuất CSV danh sách hiện tại
  const handleExportCsv = () => {
    if (filteredAndSortedSubscriptions.length === 0) {
      showToast('info', 'Không có dữ liệu để xuất CSV.');
      return;
    }

    const headers = ['Email khách hàng', 'Tên dịch vụ', 'Ngày bắt đầu', 'Ngày hết hạn', 'Trạng thái', 'Zalo', 'Instagram'];
    const rows = filteredAndSortedSubscriptions.map((sub) => {
      const isExpired = new Date(sub.endDate) < new Date();
      const statusText = isExpired ? 'Đã hết hạn' : 'Đang hoạt động';
      return [
        `"${sub.customerEmail}"`,
        `"${sub.serviceName}"`,
        `"${new Date(sub.startDate).toLocaleDateString('vi-VN')}"`,
        `"${new Date(sub.endDate).toLocaleDateString('vi-VN')}"`,
        `"${statusText}"`,
        `"${sub.contactZalo || ''}"`,
        `"${sub.contactInstagram || ''}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Đã xuất ${filteredAndSortedSubscriptions.length} gói ra file CSV.`);
  };

  // LỌC VÀ SẮP XẾP DANH SÁCH (LOGIC TRỌNG TÂM)
  const filteredAndSortedSubscriptions = useMemo(() => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // 1. Lọc theo quickFilter (Bento metrics) & serviceFilter & text search
    let list = subscriptions.filter((sub) => {
      const end = new Date(sub.endDate).getTime();
      const isExpired = end < now;
      const isEndingSoon = !isExpired && end - now <= sevenDaysMs;

      // Quick filter
      if (quickFilter === 'active' && isExpired) return false;
      if (quickFilter === 'expired' && !isExpired) return false;
      if (quickFilter === 'ending_soon' && !isEndingSoon) return false;

      // Service filter
      if (serviceFilter && sub.serviceName !== serviceFilter) return false;

      // Client-side additional search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEmail = sub.customerEmail?.toLowerCase().includes(q);
        const matchService = sub.serviceName?.toLowerCase().includes(q);
        const matchZalo = sub.contactZalo?.toLowerCase().includes(q);
        const matchInsta = sub.contactInstagram?.toLowerCase().includes(q);
        if (!matchEmail && !matchService && !matchZalo && !matchInsta) return false;
      }

      return true;
    });

    // 2. Thuật toán Sắp xếp (Sort Algorithm)
    list.sort((a, b) => {
      const endA = new Date(a.endDate).getTime();
      const endB = new Date(b.endDate).getTime();

      // MẶC ĐỊNH: SẮP XẾP KHÁCH HÀNG SẮP HẾT HẠN DƯỚI 1 TUẦN LÊN ĐẦU
      if (sortBy === 'expiring_soon_first') {
        const isExpiringSoonA = endA >= now && endA - now <= sevenDaysMs;
        const isExpiringSoonB = endB >= now && endB - now <= sevenDaysMs;
        const isExpiredA = endA < now;
        const isExpiredB = endB < now;

        // Bậc 1: Sắp hết hạn ≤ 7 ngày (Tier 1 - Ưu tiên cao nhất, luôn lên đầu)
        if (isExpiringSoonA && !isExpiringSoonB) return -1;
        if (!isExpiringSoonA && isExpiringSoonB) return 1;
        if (isExpiringSoonA && isExpiringSoonB) {
          // Trong nhóm sắp hết hạn: Gói nào sắp hết hạn gần nhất (còn 0, 1, 2 ngày...) đứng trước
          return endA - endB;
        }

        // Bậc 2: Đang hoạt động bình thường (> 7 ngày) (Tier 2 - Đứng giữa)
        const isActiveA = !isExpiredA && !isExpiringSoonA;
        const isActiveB = !isExpiredB && !isExpiringSoonB;
        if (isActiveA && isExpiredB) return -1;
        if (isExpiredA && isActiveB) return 1;
        if (isActiveA && isActiveB) {
          // Xếp theo ngày hết hạn tăng dần
          return endA - endB;
        }

        // Bậc 3: Đã hết hạn (Tier 3 - Đứng cuối)
        // Gói mới hết hạn gần đây nhất xếp trước, gói hết hạn từ lâu xếp sau cùng
        return endB - endA;
      }

      if (sortBy === 'end_date_asc') return endA - endB;
      if (sortBy === 'end_date_desc') return endB - endA;
      if (sortBy === 'email_asc') return a.customerEmail.localeCompare(b.customerEmail);
      if (sortBy === 'newest') {
        const createdA = new Date(a.createdAt || a.startDate).getTime();
        const createdB = new Date(b.createdAt || b.startDate).getTime();
        return createdB - createdA;
      }

      return 0;
    });

    return list;
  }, [subscriptions, quickFilter, serviceFilter, searchQuery, sortBy]);

  // Phân trang danh sách
  const totalItems = filteredAndSortedSubscriptions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset về page 1 khi filter hoặc search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [quickFilter, serviceFilter, searchQuery, sortBy, pageSize]);

  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedSubscriptions.slice(start, start + pageSize);
  }, [filteredAndSortedSubscriptions, currentPage, pageSize]);

  if (!user?.admin) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-md text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">403 - Không có quyền truy cập</h2>
          <p className="text-sm text-slate-500">Khu vực này chỉ dành riêng cho Quản trị viên của Tiệm Tạp Hóa KeyT.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
                : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Sparkles size={18} className="text-amber-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER & ACTION ROW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#F05A28] border border-orange-200/60">
              <ShieldCheck size={13} />
              Quản trị Dịch vụ
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Tổng {stats.total} tài khoản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
            Quản lý Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi vòng đời tài khoản, ưu tiên xử lý khách sắp hết hạn & gửi email nhắc nhở tự động
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Nút Xuất CSV */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            title="Xuất danh sách ra file CSV"
          >
            <Download size={15} className="text-slate-500" />
            <span>Xuất CSV</span>
          </button>

          {/* Nút Import CSV */}
          <button
            onClick={() => {
              setShowImport(!showImport);
              setShowAddForm(false);
              setEditingSubscription(null);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer shadow-xs ${
              showImport
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {showImport ? <X size={15} /> : <Upload size={15} className="text-slate-500" />}
            <span>{showImport ? 'Đóng Import' : 'Import CSV'}</span>
          </button>

          {/* Nút Thêm Subscription */}
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowImport(false);
              setEditingSubscription(null);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-sm ${
              showAddForm
                ? 'bg-slate-800 hover:bg-slate-900'
                : 'bg-[#F05A28] hover:bg-[#d84515] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showAddForm ? 'Hủy thêm mới' : '+ Thêm Subscription'}</span>
          </button>
        </div>
      </div>

      {/* 4 BENTO METRIC STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Tất cả gói */}
        <div
          onClick={() => setQuickFilter('all')}
          className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
            quickFilter === 'all'
              ? 'bg-white border-[#1E293B] ring-2 ring-[#1E293B]/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tất cả gói</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stats.total}</span>
            <span className="text-xs text-slate-400 font-medium">gói lưu trữ</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Nhấn để xem toàn bộ danh sách
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div
          onClick={() => setQuickFilter('active')}
          className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
            quickFilter === 'active'
              ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Đang hoạt động</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{stats.active}</span>
            <span className="text-xs text-emerald-700/80 font-bold">({stats.activePercent}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Còn hạn sử dụng
          </div>
        </div>

        {/* Card 3: SẮP HẾT HẠN (≤ 7 NGÀY) - CARD TRỌNG TÂM */}
        <div
          onClick={() => setQuickFilter('ending_soon')}
          className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
            quickFilter === 'ending_soon'
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/30 shadow-md -translate-y-0.5'
              : 'bg-white border-amber-200/80 hover:border-amber-400 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Sắp hết hạn</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[10px] font-extrabold text-amber-800">
                ≤ 7 ngày
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <AlertTriangle size={16} className={stats.endingSoon > 0 ? 'animate-bounce-short' : ''} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{stats.endingSoon}</span>
            <span className="text-xs text-amber-700/80 font-medium">cần gia hạn</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Ưu tiên liên hệ chăm sóc
          </div>
        </div>

        {/* Card 4: Đã hết hạn */}
        <div
          onClick={() => setQuickFilter('expired')}
          className={`group relative p-4 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
            quickFilter === 'expired'
              ? 'bg-white border-rose-500 ring-2 ring-rose-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Đã hết hạn</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">{stats.expired}</span>
            <span className="text-xs text-rose-600/80 font-medium">gói quá hạn</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Chờ gia hạn lại hoặc thanh lý
          </div>
        </div>
      </div>

      {/* FORM THÊM MỚI / CHỈNH SỬA (DRAWER CONTAINER) */}
      {(showAddForm || editingSubscription) && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F05A28] flex items-center justify-center">
                {editingSubscription ? <Edit3 size={16} /> : <Plus size={16} />}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {editingSubscription ? `Chỉnh sửa gói: ${editingSubscription.customerEmail}` : 'Thêm gói Subscription mới'}
              </h3>
            </div>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingSubscription(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <SubscriptionForm
            initialData={editingSubscription}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingSubscription(null);
              showToast('success', editingSubscription ? 'Cập nhật thành công!' : 'Đã thêm subscription mới!');
              fetchSubscriptions();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingSubscription(null);
            }}
          />
        </div>
      )}

      {/* FORM IMPORT CSV (DRAWER CONTAINER) */}
      {showImport && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Upload size={16} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Import danh sách Subscriptions từ văn bản</h3>
            </div>
            <button
              onClick={() => setShowImport(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <SubscriptionImport
            onSuccess={() => {
              setShowImport(false);
              showToast('success', 'Import danh sách subscriptions hoàn tất!');
              fetchSubscriptions();
            }}
            onCancel={() => setShowImport(false)}
          />
        </div>
      )}

      {/* FILTER & CONTROL BAR (DATA-DENSE TOOLBAR) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between overflow-hidden">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-full md:max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm email, dịch vụ, Zalo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F05A28] focus:bg-white focus:ring-2 focus:ring-[#F05A28]/10 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Sort */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Lọc Dịch vụ */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F05A28] text-slate-700 font-medium cursor-pointer max-w-[140px] truncate"
            title="Lọc theo dịch vụ"
          >
            <option value="">Dịch vụ: Tất cả</option>
            {uniqueServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          {/* Lọc Trạng thái API */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#F05A28] text-slate-700 font-medium cursor-pointer"
            title="Lọc theo trạng thái"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="ending_soon">Sắp hết hạn (≤ 7 ngày)</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Đã hết hạn</option>
            <option value="notified">Đã nhắc nhở</option>
            <option value="pending">Chưa nhắc</option>
          </select>

          {/* Sắp xếp (Sort Selector) - Ngắn gọn, không emoji, không tràn */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-xs sm:text-sm bg-amber-50/80 border border-amber-300 rounded-xl focus:outline-none focus:border-[#F05A28] text-amber-900 font-bold cursor-pointer"
            title="Sắp xếp danh sách"
          >
            <option value="expiring_soon_first">Sắp hết hạn trước</option>
            <option value="end_date_asc">Hạn gần nhất</option>
            <option value="end_date_desc">Hạn xa nhất</option>
            <option value="email_asc">Email A-Z</option>
            <option value="newest">Mới cập nhật</option>
          </select>

          {/* Reload button */}
          <button
            onClick={() => fetchSubscriptions()}
            title="Làm mới danh sách"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#F05A28]' : ''} />
          </button>
        </div>
      </div>

      {/* STATUS BANNER NẾU ĐANG FILTER */}
      {(quickFilter !== 'all' || serviceFilter || statusFilter || searchQuery) && (
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Đang lọc:</span>
            {quickFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                Tab: {quickFilter === 'ending_soon' ? 'Sắp hết hạn (≤ 7 ngày)' : quickFilter === 'active' ? 'Đang hoạt động' : 'Đã hết hạn'}
              </span>
            )}
            {serviceFilter && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                Dịch vụ: {serviceFilter}
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                API Status: {statusFilter}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                Từ khóa: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setQuickFilter('all');
              setServiceFilter('');
              setStatusFilter('');
              setSearchQuery('');
            }}
            className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline shrink-0 ml-2"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* MAIN DATA TABLE (DESKTOP & TABLET) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Dịch vụ</th>
                <th className="px-5 py-3.5">Ngày bắt đầu</th>
                <th className="px-5 py-3.5">Thời hạn & Ngày hết hạn</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Nhắc hạn</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedSubscriptions.map((sub) => {
                const endDate = new Date(sub.endDate);
                const now = new Date();
                const isExpired = endDate < now;
                const diffTime = endDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
                const isExpiringWithinWeek = !isExpired && diffDays <= 7;

                return (
                  <tr
                    key={sub._id}
                    className={`transition-colors ${
                      isExpiringWithinWeek
                        ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Cột Khách hàng */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                            sub.customerEmail || 'U'
                          )} flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                        >
                          {sub.customerEmail?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 tracking-tight">{sub.customerEmail}</span>
                            <button
                              onClick={() => handleCopyText(sub.customerEmail, 'Email')}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded"
                              title="Sao chép email"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          {(sub.contactZalo || sub.contactInstagram) && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {sub.contactZalo && (
                                <a
                                  href={`https://zalo.me/${sub.contactZalo.replace(/\s+/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                  title="Mở Zalo"
                                >
                                  <MessageCircle size={11} />
                                  <span>{sub.contactZalo}</span>
                                </a>
                              )}
                              {sub.contactInstagram && (
                                <span className="text-slate-400">IG: {sub.contactInstagram}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột Dịch vụ */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/60">
                        {sub.serviceName}
                      </span>
                    </td>

                    {/* Cột Ngày bắt đầu */}
                    <td className="px-5 py-4 text-slate-600 text-xs sm:text-sm font-medium">
                      {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Cột Ngày hết hạn & Countdown Badge */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                          {endDate.toLocaleDateString('vi-VN')}
                        </span>
                        {isExpired ? (
                          <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                            <Clock size={11} /> Đã quá {Math.abs(diffDays)} ngày
                          </span>
                        ) : isExpiringWithinWeek ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
                            <AlertTriangle size={11} />
                            {diffDays === 0 ? 'Hết hạn hôm nay' : `Còn ${diffDays} ngày`}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">
                            Còn {diffDays} ngày
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Cột Trạng thái */}
                    <td className="px-5 py-4">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <AlertCircle size={12} /> Hết hạn
                        </span>
                      ) : isExpiringWithinWeek ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Sắp hết hạn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Cột Trạng thái Nhắc hạn */}
                    <td className="px-5 py-4">
                      {sub.manualReminderSentAt ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCheck size={14} /> Đã nhắc
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sub.manualReminderSentAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Chưa gửi</span>
                      )}
                    </td>

                    {/* Cột Thao tác */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* Nút Gia hạn 1 năm trực tiếp kể từ khi bấm */}
                        <button
                          onClick={() => handleQuickRenewOneYear(sub)}
                          disabled={quickRenewingId === sub._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl border border-emerald-300/80 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98 disabled:opacity-50"
                          title="Gia hạn thêm 1 năm kể từ thời điểm bấm"
                        >
                          <CalendarPlus size={13} className={quickRenewingId === sub._id ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
                          <span>{quickRenewingId === sub._id ? 'Đang gia hạn...' : '+1 Năm'}</span>
                        </button>

                        {/* Nút Gia hạn (Tùy chọn ngày) */}
                        <button
                          onClick={() => openRenewModal(sub)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                          title="Gia hạn tùy chọn ngày khác"
                        >
                          <RotateCcw size={12} />
                          <span>Gia hạn</span>
                        </button>

                        {/* Nút Nhắc hạn */}
                        <button
                          onClick={() => handleSendReminder(sub._id, sub.customerEmail)}
                          disabled={remindingId === sub._id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            sub.manualReminderSentAt
                              ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
                              : 'text-[#F05A28] bg-orange-50 hover:bg-orange-100 border-orange-200'
                          }`}
                          title={sub.manualReminderSentAt ? 'Gửi lại email nhắc hạn' : 'Gửi email nhắc nhở gia hạn'}
                        >
                          <Mail size={12} className={remindingId === sub._id ? 'animate-spin' : ''} />
                          <span>{remindingId === sub._id ? 'Đang gửi...' : sub.manualReminderSentAt ? 'Nhắc lại' : 'Nhắc hạn'}</span>
                        </button>

                        {/* Nút Sửa (Edit) */}
                        <button
                          onClick={() => {
                            setEditingSubscription(sub);
                            setShowAddForm(false);
                            setShowImport(false);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 size={14} />
                        </button>

                        {/* Nút Xóa */}
                        <button
                          onClick={() => handleDelete(sub._id, sub.customerEmail)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa gói này"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State Table */}
        {filteredAndSortedSubscriptions.length === 0 && (
          <div className="p-12 text-center text-slate-500 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2.5">
                <RefreshCw size={20} className="animate-spin text-[#F05A28]" />
                <span className="font-semibold text-slate-700">Đang tải danh sách subscriptions...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search size={22} />
                </div>
                <p className="font-bold text-slate-800 text-base">Không tìm thấy gói subscription nào</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Không có kết quả phù hợp với từ khóa hoặc bộ lọc trạng thái hiện tại.
                </p>
                <button
                  onClick={() => {
                    setQuickFilter('all');
                    setServiceFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#F05A28] bg-orange-50 hover:bg-orange-100 rounded-xl cursor-pointer transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Xóa bộ lọc & Hiển thị tất cả</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PAGINATION TOOLBAR (DESKTOP) */}
        {totalItems > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Hiển thị <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalItems)}</strong> trong tổng số{' '}
                <strong className="text-slate-900">{totalItems}</strong> gói
              </span>

              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-400">Số dòng:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 cursor-pointer focus:outline-none focus:border-[#F05A28]"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="px-2.5 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE CARD VIEW (PHONG CÁCH BENTO DI ĐỘNG) */}
      <div className="md:hidden space-y-3">
        {paginatedSubscriptions.map((sub) => {
          const endDate = new Date(sub.endDate);
          const now = new Date();
          const isExpired = endDate < now;
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
          const isExpiringWithinWeek = !isExpired && diffDays <= 7;

          return (
            <div
              key={sub._id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isExpiringWithinWeek
                  ? 'bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Header Card Mobile */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                      sub.customerEmail || 'U'
                    )} flex items-center justify-center font-bold text-xs shrink-0`}
                  >
                    {sub.customerEmail?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm break-all">{sub.customerEmail}</div>
                    <div className="inline-flex mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {sub.serviceName}
                    </div>
                  </div>
                </div>

                <div>
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                      Hết hạn
                    </span>
                  ) : isExpiringWithinWeek ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/30">
                      <AlertTriangle size={11} /> Sắp hết hạn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Hoạt động
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin ngày tháng */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="block text-slate-400 text-[10px]">Ngày bắt đầu</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className={`p-2 rounded-xl ${isExpiringWithinWeek ? 'bg-amber-50' : 'bg-slate-50'}`}>
                  <span className="block text-slate-400 text-[10px]">Hạn sử dụng</span>
                  <span className={`font-bold ${isExpired ? 'text-rose-600' : isExpiringWithinWeek ? 'text-amber-800' : 'text-slate-800'}`}>
                    {endDate.toLocaleDateString('vi-VN')}
                  </span>
                  <div className="text-[10px] font-semibold mt-0.5">
                    {isExpired ? (
                      <span className="text-rose-500">Quá {Math.abs(diffDays)} ngày</span>
                    ) : isExpiringWithinWeek ? (
                      <span className="text-amber-700">Còn {diffDays} ngày</span>
                    ) : (
                      <span className="text-emerald-600">Còn {diffDays} ngày</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Zalo nếu có */}
              {sub.contactZalo && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                  <MessageCircle size={13} />
                  <span>Zalo: {sub.contactZalo}</span>
                </div>
              )}

              {/* Action Buttons Mobile */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                  {/* Nút +1 Năm trực tiếp */}
                  <button
                    onClick={() => handleQuickRenewOneYear(sub)}
                    disabled={quickRenewingId === sub._id}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300/80 cursor-pointer shadow-2xs"
                    title="Gia hạn 1 năm kể từ hôm nay"
                  >
                    <CalendarPlus size={12} className={quickRenewingId === sub._id ? 'animate-spin' : ''} />
                    <span>{quickRenewingId === sub._id ? 'Lưu...' : '+1 Năm'}</span>
                  </button>

                  <button
                    onClick={() => openRenewModal(sub)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 cursor-pointer shadow-2xs"
                  >
                    <RotateCcw size={12} /> Gia hạn
                  </button>

                  <button
                    onClick={() => handleSendReminder(sub._id, sub.customerEmail)}
                    disabled={remindingId === sub._id}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 cursor-pointer shadow-2xs"
                  >
                    <Mail size={12} /> {sub.manualReminderSentAt ? 'Nhắc lại' : 'Nhắc'}
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingSubscription(sub);
                      setShowAddForm(false);
                      setShowImport(false);
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id, sub.customerEmail)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State Mobile */}
        {filteredAndSortedSubscriptions.length === 0 && (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            {loading ? 'Đang tải dữ liệu...' : 'Không có gói đăng ký nào phù hợp'}
          </div>
        )}

        {/* Pagination Mobile */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
            <span>Trang {currentPage} / {totalPages} ({totalItems} gói)</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QUICK RENEW MODAL (POPOVER CHỌN NGÀY GIA HẠN NHANH) */}
      {renewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Gia hạn gói Subscription</h3>
              </div>
              <button
                onClick={() => setRenewTarget(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="text-xs text-slate-500">Khách hàng:</div>
                <div className="font-bold text-slate-900">{renewTarget.customerEmail}</div>
                <div className="text-xs text-slate-600">
                  Dịch vụ: <strong className="text-slate-800">{renewTarget.serviceName}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  Hạn hiện tại:{' '}
                  <span className="font-semibold text-slate-700">
                    {new Date(renewTarget.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Nút Preset chọn nhanh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn thời gian gia hạn nhanh:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyRenewPreset('7days')}
                    className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors text-center"
                  >
                    +7 ngày
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRenewPreset('1month')}
                    className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors text-center"
                  >
                    +1 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRenewPreset('3months')}
                    className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors text-center"
                  >
                    +3 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRenewPreset('6months')}
                    className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors text-center"
                  >
                    +6 tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyRenewPreset('1year')}
                    className="py-1.5 px-2 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 cursor-pointer transition-colors text-center"
                  >
                    +1 năm
                  </button>
                </div>
              </div>

              {/* Input ngày cụ thể */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngày hết hạn mới:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={renewDate}
                    onChange={(e) => setRenewDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-semibold"
                  />
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRenewTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleRenewSubmit}
                disabled={renewLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {renewLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{renewLoading ? 'Đang lưu...' : 'Xác nhận gia hạn'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
