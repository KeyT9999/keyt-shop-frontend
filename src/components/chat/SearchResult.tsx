import React from 'react';
import type { SearchResult as SearchResultType } from '../../api/chatApi';

interface SearchResultProps {
  result: SearchResultType;
  query: string;
  onResultClick: (messageId: string) => void;
}

/**
 * Helper function to highlight matching text in search results
 */
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  
  try {
    // Escape special regex characters in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 text-slate-900">{part}</mark>
        : part
    );
  } catch {
    // If regex fails, return original text
    return text;
  }
}

/**
 * Format timestamp to readable format
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

const SearchResult: React.FC<SearchResultProps> = ({ result, query, onResultClick }) => {
  const senderLabel = result.senderType === 'customer' ? 'Bạn' : 'Admin';

  return (
    <div
      onClick={() => onResultClick(result._id)}
      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
    >
      {/* Header: Sender and timestamp */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-600">{senderLabel}</span>
        <span className="text-xs text-slate-400">{formatTime(result.timestamp)}</span>
      </div>

      {/* Snippet with highlighted text */}
      <p className="text-sm text-slate-700 line-clamp-2">
        {highlightText(result.snippet, query)}
      </p>
    </div>
  );
};

export default SearchResult;
