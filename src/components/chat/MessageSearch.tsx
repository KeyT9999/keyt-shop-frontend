import React, { useCallback, useState, useEffect } from 'react';
import { Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchMessages, type SearchResult as SearchResultType } from '../../api/chatApi';
import SearchResult from './SearchResult';

interface MessageSearchProps {
  conversationId: string;
  onResultClick: (messageId: string) => void;
  onClose: () => void;
  token?: string | null;
  sessionId?: string | null;
}

const MessageSearch: React.FC<MessageSearchProps> = ({
  conversationId,
  onResultClick,
  onClose,
  token,
  sessionId,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  });

  const performSearch = useCallback(async (searchQuery: string, page: number) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchMessages(conversationId, searchQuery, page, 20, {
        token,
        sessionId,
      });
      setResults(response.results);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Search error:', err);
      setError('Tìm kiếm thất bại. Vui lòng thử lại.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, sessionId, token]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setPagination({ page: 1, totalPages: 1, total: 0, limit: 20 });
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [performSearch, query]);

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      performSearch(query, pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      performSearch(query, pagination.page + 1);
    }
  };

  const handleResultClick = (messageId: string) => {
    onResultClick(messageId);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm tin nhắn..."
          className="flex-1 text-sm outline-none"
          autoFocus
        />
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
          aria-label="Đóng tìm kiếm"
        >
          <X size={18} />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}

        {error && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!isLoading && !error && query.trim() && results.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-400">Không tìm thấy kết quả</p>
          </div>
        )}

        {!isLoading && !error && query.trim() && results.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
              Tìm thấy {pagination.total} kết quả
            </div>
            {results.map((result) => (
              <SearchResult
                key={result._id}
                result={result}
                query={query}
                onResultClick={handleResultClick}
              />
            ))}
          </>
        )}

        {!query.trim() && (
          <div className="px-4 py-8 text-center">
            <Search size={48} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Nhập từ khóa để tìm kiếm</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && results.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200">
          <button
            onClick={handlePreviousPage}
            disabled={pagination.page === 1}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Trước</span>
          </button>

          <span className="text-xs text-slate-500">
            Trang {pagination.page} / {pagination.totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Sau</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
