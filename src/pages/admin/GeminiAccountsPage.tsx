import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { ChevronLeft, ChevronRight, ClipboardPaste, CheckCircle, XCircle, Loader2, Trash2, Search, X } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import GeminiAccountForm from '../../components/admin/GeminiAccountForm';
import { isValid2FAKey } from '../../utils/validation';

interface GeminiAccount {
  _id: string;
  geminiEmail: string;
  secretKey: string;
  createdAt: string;
}

interface ParsedRow {
  geminiEmail: string;
  secretKey: string;
  status: 'pending' | 'saving' | 'success' | 'error';
  error?: string;
}

// Parse một dòng theo format: email|secretkey | (bỏ qua phần sau | thứ 2)
function parseLine(line: string): ParsedRow | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('|');
  if (parts.length < 2) return null;

  const geminiEmail = parts[0].trim().toLowerCase();
  // Lấy phần thứ 2 (index 1) làm secretKey, bỏ qua các phần sau
  const secretKey = parts[1].trim().replace(/\s+/g, ' ');

  if (!geminiEmail || !secretKey) return null;
  if (!geminiEmail.includes('@')) return null;

  return { geminiEmail, secretKey, status: 'pending' };
}

export default function GeminiAccountsPage() {
  const { token, user } = useAuthContext();
  const [accounts, setAccounts] = useState<GeminiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<GeminiAccount | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, domainFilter, dateFilter, keyStatusFilter, sortBy]);

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  useEffect(() => {
    if (token && user?.admin) fetchAccounts();
  }, [token, user]);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/gemini/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err) {
      console.error('Error fetching Gemini accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài khoản Gemini này?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/gemini/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch {
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  // --- Bulk Import Handlers ---
  const handleParseBulk = () => {
    const lines = bulkText.split('\n');
    const rows: ParsedRow[] = [];
    lines.forEach(line => {
      const parsed = parseLine(line);
      if (parsed) rows.push(parsed);
    });
    setParsedRows(rows);
    setBulkDone(false);
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (parsedRows.length === 0) return;
    setBulkSaving(true);

    const updated = [...parsedRows];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'pending') continue;
      updated[i] = { ...updated[i], status: 'saving' };
      setParsedRows([...updated]);

      try {
        await axios.post(
          `${API_BASE_URL}/gemini/accounts`,
          { geminiEmail: updated[i].geminiEmail, secretKey: updated[i].secretKey },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updated[i] = { ...updated[i], status: 'success' };
      } catch (err: any) {
        updated[i] = {
          ...updated[i],
          status: 'error',
          error: err.response?.data?.message || 'Lỗi không xác định'
        };
      }
      setParsedRows([...updated]);
    }

    setBulkSaving(false);
    setBulkDone(true);
    fetchAccounts();
  };

  const handleClearBulk = () => {
    setBulkText('');
    setParsedRows([]);
    setBulkDone(false);
  };

  if (!user?.admin) return <div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div>;
  if (loading) return <div style={{ padding: '2rem', color: '#1f2937' }}>Đang tải...</div>;

  // Filter and Sort Logic
  const filteredAccounts = accounts.filter(account => {
    // 1. Search term (Email & Secret Key)
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const emailMatch = account.geminiEmail.toLowerCase().includes(term);
      const keyMatch = account.secretKey.toLowerCase().replace(/\s+/g, '').includes(term.replace(/\s+/g, ''));
      if (!emailMatch && !keyMatch) return false;
    }

    // 2. Domain Filter
    if (domainFilter) {
      const email = account.geminiEmail.toLowerCase();
      if (domainFilter === 'gmail') {
        if (!email.endsWith('@gmail.com')) return false;
      } else if (domainFilter === 'icloud') {
        if (!email.endsWith('@icloud.com')) return false;
      } else if (domainFilter === 'outlook') {
        if (!email.endsWith('@outlook.com') && !email.endsWith('@hotmail.com')) return false;
      } else if (domainFilter === 'other') {
        if (email.endsWith('@gmail.com') || email.endsWith('@icloud.com') || email.endsWith('@outlook.com') || email.endsWith('@hotmail.com')) return false;
      }
    }

    // 3. Date Filter (createdAt)
    if (dateFilter && account.createdAt) {
      const createdDate = new Date(account.createdAt);
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (dateFilter === 'today') {
        if (createdDate < startOfToday) return false;
      } else if (dateFilter === 'yesterday') {
        if (createdDate < startOfYesterday || createdDate >= startOfToday) return false;
      } else if (dateFilter === '7days') {
        if (diffDays > 7) return false;
      } else if (dateFilter === '30days') {
        if (diffDays > 30) return false;
      }
    }

    // 4. 2FA Key Status Filter
    if (keyStatusFilter) {
      const isValid = isValid2FAKey(account.secretKey);
      if (keyStatusFilter === 'valid' && !isValid) return false;
      if (keyStatusFilter === 'invalid' && isValid) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'az') {
      return a.geminiEmail.localeCompare(b.geminiEmail);
    }
    if (sortBy === 'za') {
      return b.geminiEmail.localeCompare(a.geminiEmail);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedAccounts.length / itemsPerPage);
  const paginatedAccounts = sortedAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDomainFilter('');
    setDateFilter('');
    setKeyStatusFilter('');
    setSortBy('newest');
  };

  const geminiBlue = '#4285F4';
  const geminiPurple = '#9B72CB';

  const successCount = parsedRows.filter(r => r.status === 'success').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;
  const pendingCount = parsedRows.filter(r => r.status === 'pending').length;

  return (
    <div className="main-content" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <svg width="28" height="28" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M96 0C96 53.0193 53.0193 96 0 96C53.0193 96 96 138.981 96 192C96 138.981 138.981 96 192 96C138.981 96 96 53.0193 96 0Z" fill="url(#gem-grad)"/>
              <defs>
                <linearGradient id="gem-grad" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={geminiBlue}/>
                  <stop offset="50%" stopColor={geminiPurple}/>
                  <stop offset="100%" stopColor="#D96570"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: 0 }}>Gemini Accounts</h1>
          </div>
          <p style={{ color: '#64748B', margin: 0 }}>Quản lý kho tài khoản Gemini tự động</p>
        </div>

        {/* Stats Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Tổng số tài khoản</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>{accounts.length}</div>
          </div>
          <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Đang hiển thị</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: geminiBlue }}>{filteredAccounts.length}</div>
          </div>
          <div style={{ 
            background: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#FEF2F2' : '#ffffff', 
            padding: '20px', 
            borderRadius: '16px', 
            border: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '1px solid #FEE2E2' : '1px solid #E2E8F0', 
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)' 
          }}>
            <div style={{ color: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#EF4444' : '#64748B', fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Key lỗi 2FA</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: accounts.some(a => !isValid2FAKey(a.secretKey)) ? '#EF4444' : '#1E293B' }}>
              {accounts.filter(a => !isValid2FAKey(a.secretKey)).length}
            </div>
          </div>
        </div>

        {/* Filters Bar Section */}
        <div style={{ 
          background: '#ffffff', 
          padding: '20px', 
          borderRadius: '16px', 
          border: `1.5px solid ${geminiBlue}15`, 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo email hoặc secret key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                fontSize: '0.9rem',
                color: '#1E293B',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = geminiBlue; e.target.style.boxShadow = `0 0 0 3px ${geminiBlue}12`; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Domain Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả tên miền</option>
              <option value="gmail">Gmail (@gmail.com)</option>
              <option value="icloud">iCloud (@icloud.com)</option>
              <option value="outlook">Outlook/Hotmail</option>
              <option value="other">Tên miền khác</option>
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
            </select>
          </div>

          {/* 2FA Key Validity Filter */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={keyStatusFilter}
              onChange={(e) => setKeyStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Trạng thái Key 2FA</option>
              <option value="valid">Key hợp lệ</option>
              <option value="invalid">Key không hợp lệ</option>
            </select>
          </div>

          {/* Sort selection */}
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #E2E8F0',
                background: '#ffffff',
                color: '#1E293B',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Ngày tạo: Mới nhất</option>
              <option value="oldest">Ngày tạo: Cũ nhất</option>
              <option value="az">Email: A → Z</option>
              <option value="za">Email: Z → A</option>
            </select>
          </div>
        </div>

        {/* ====== BULK IMPORT SECTION ====== */}
        <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${geminiBlue}20` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ClipboardPaste size={20} color={geminiBlue} />
            <h3 style={{ margin: 0, color: '#1E293B', fontWeight: 700, fontSize: '1rem' }}>Nhập nhiều tài khoản (Bulk Import)</h3>
          </div>

          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0 0 12px 0' }}>
            Dán danh sách theo format: <code style={{ background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', color: geminiBlue }}>email|secretkey</code>&nbsp;
            (mỗi dòng 1 tài khoản, phần sau <code style={{ background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', color: geminiBlue }}>| thứ 2</code> sẽ được bỏ qua)
          </p>

          <textarea
            value={bulkText}
            onChange={(e) => { setBulkText(e.target.value); setParsedRows([]); setBulkDone(false); }}
            placeholder={`fefalzontdb34@gmail.com|q63i 4mnt nzfp z76j c6mr iloc gmk3 ne3n\njalisaackihu75@gmail.com|tfrk fj27 pmdu s3pj mj5e teoo bs2s ruv6 | PIXEL 1 NĂM\nBowenRubiela@gmail.com|zow45wrtvvui6xudbmauscpugc5u5gyp`}
            rows={5}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: '1.5px solid #e2e8f0', fontFamily: 'monospace',
              fontSize: '0.875rem', color: '#1E293B', background: '#f8fafc',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => { e.target.style.borderColor = geminiBlue; e.target.style.boxShadow = `0 0 0 3px ${geminiBlue}18`; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleParseBulk}
              disabled={!bulkText.trim()}
              style={{
                padding: '10px 20px', background: !bulkText.trim() ? '#CBD5E1' : `linear-gradient(135deg, ${geminiBlue}, ${geminiPurple})`,
                color: 'white', border: 'none', borderRadius: '9px', cursor: !bulkText.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🔍 Phân tích & Preview
            </button>
            {parsedRows.length > 0 && (
              <button
                onClick={handleClearBulk}
                style={{ padding: '10px 16px', background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={15} /> Xóa hết
              </button>
            )}
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', background: '#eff6ff', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: geminiBlue }}>
                  {parsedRows.length} dòng hợp lệ
                </span>
                {bulkDone && successCount > 0 && (
                  <span style={{ padding: '4px 12px', background: '#f0fdf4', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>
                    ✓ {successCount} thành công
                  </span>
                )}
                {bulkDone && errorCount > 0 && (
                  <span style={{ padding: '4px 12px', background: '#fef2f2', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                    ✗ {errorCount} lỗi
                  </span>
                )}
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #eff6ff, #f5f0ff)', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: geminiBlue, fontWeight: 600, fontSize: '0.8rem' }}>#</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: geminiBlue, fontWeight: 600, fontSize: '0.8rem' }}>Email</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left', color: geminiBlue, fontWeight: 600, fontSize: '0.8rem' }}>Secret Key</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', color: geminiBlue, fontWeight: 600, fontSize: '0.8rem' }}>Trạng thái</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center', color: geminiBlue, fontWeight: 600, fontSize: '0.8rem' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: row.status === 'success' ? '#f0fdf4' : row.status === 'error' ? '#fef2f2' : 'white'
                      }}>
                        <td style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 500 }}>{idx + 1}</td>
                        <td style={{ padding: '10px 16px', color: '#1E293B', fontWeight: 500 }}>{row.geminiEmail}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <code style={{ background: '#eff6ff', padding: '3px 8px', borderRadius: '4px', color: geminiBlue, fontSize: '0.8rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {row.secretKey}
                          </code>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {row.status === 'pending' && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chờ lưu</span>}
                          {row.status === 'saving' && <Loader2 size={16} color={geminiBlue} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />}
                          {row.status === 'success' && <CheckCircle size={18} color="#16a34a" />}
                          {row.status === 'error' && (
                            <span title={row.error} style={{ color: '#dc2626', fontSize: '0.8rem', cursor: 'help' }}>
                              <XCircle size={16} style={{ display: 'inline', marginRight: 4 }} />{row.error}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                          {row.status === 'pending' && (
                            <button onClick={() => handleRemoveRow(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save button */}
              {pendingCount > 0 && !bulkSaving && (
                <button
                  onClick={handleSaveAll}
                  style={{
                    marginTop: '14px', padding: '12px 28px',
                    background: `linear-gradient(135deg, ${geminiBlue}, ${geminiPurple})`,
                    color: 'white', border: 'none', borderRadius: '10px',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
                    boxShadow: `0 4px 12px ${geminiBlue}40`, display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  ✅ Lưu {pendingCount} tài khoản vào hệ thống
                </button>
              )}
              {bulkSaving && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: geminiBlue, fontWeight: 600 }}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...
                </div>
              )}
              {bulkDone && pendingCount === 0 && (
                <div style={{ marginTop: '14px', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
                  ✓ Hoàn tất! {successCount}/{parsedRows.length} tài khoản đã được lưu.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ====== SINGLE FORM ====== */}
        <div style={{ marginBottom: '32px', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${geminiBlue}20` }}>
          {editingAccount ? (
            <GeminiAccountForm
              accountId={editingAccount._id}
              initialData={{ _id: editingAccount._id, geminiEmail: editingAccount.geminiEmail, secretKey: editingAccount.secretKey }}
              onSuccess={() => { setEditingAccount(null); fetchAccounts(); }}
              onCancel={() => setEditingAccount(null)}
            />
          ) : (
            <GeminiAccountForm
              onSuccess={() => fetchAccounts()}
              onCancel={() => {}}
              hideCancelButton
            />
          )}
        </div>

        {/* ====== TABLE ====== */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f0ff 100%)', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: geminiBlue, fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Gemini</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: geminiBlue, fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', color: geminiBlue, fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account) => {
                const isKeyValid = isValid2FAKey(account.secretKey);
                return (
                  <tr key={account._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '20px 24px', color: '#1E293B', fontWeight: 500 }}>{account.geminiEmail}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', color: geminiBlue, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          {account.secretKey}
                        </code>
                        {!isKeyValid && (
                          <span style={{
                            background: '#FEF2F2',
                            color: '#EF4444',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            border: '1px solid #FEE2E2',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            Lỗi Key 2FA
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingAccount(account)}
                          style={{ padding: '8px 16px', background: '#1E293B', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(account._id)}
                          style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAccounts.length === 0 && accounts.length > 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Không tìm thấy tài khoản nào khớp với bộ lọc.</p>
              <button 
                onClick={handleResetFilters} 
                style={{ 
                  marginTop: '12px', 
                  padding: '10px 20px', 
                  background: `linear-gradient(135deg, ${geminiBlue}, ${geminiPurple})`, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: `0 4px 12px ${geminiBlue}30`
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {accounts.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có tài khoản Gemini nào trong hệ thống.</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>Bắt đầu bằng bước thêm email mới.</p>
            </div>
          )}

          {filteredAccounts.length > 0 && (
            <div style={{ padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAF9' }}>
              <div style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, filteredAccounts.length)}</strong> của <strong>{filteredAccounts.length}</strong> accounts
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: currentPage === 1 ? '#CBD5E1' : '#64748B', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    style={{ width: '32px', height: '32px', borderRadius: '8px', border: page === currentPage ? 'none' : '1px solid #E2E8F0', background: page === currentPage ? geminiBlue : 'white', color: page === currentPage ? 'white' : '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: currentPage === totalPages ? '#CBD5E1' : '#64748B', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px', color: '#94A3B8', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filteredAccounts.length !== accounts.length && (
              <>Đang lọc ra <strong style={{ color: '#64748B' }}>{filteredAccounts.length}</strong> trên </>
            )}
            Tổng số lượng tài khoản Gemini: <strong style={{ color: '#1E293B' }}>{accounts.length}</strong>
          </span>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
