import { useCallback, useEffect, useState } from 'react';
import type { SearchHistoryItem, VerdictStatus } from '../types';

const STORAGE_KEY = 'evidence_search_history';
const MAX_HISTORY = 10;

function loadHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items: SearchHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage có thể đầy - bỏ qua silently
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>(loadHistory);

  // Sync state từ localStorage khi mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((query: string, resultCount: number, verdict: VerdictStatus | null) => {
    setHistory((prev) => {
      // Xóa item trùng query (case-insensitive)
      const deduplicated = prev.filter(
        (item) => item.query.trim().toLowerCase() !== query.trim().toLowerCase()
      );
      const newItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        query: query.trim(),
        timestamp: Date.now(),
        resultCount,
        verdict,
      };
      // Thêm mới nhất lên đầu, giới hạn MAX_HISTORY
      const updated = [newItem, ...deduplicated].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, removeItem, clearHistory };
}
