import API_BASE_URL from '../config/api';

export interface SearchResult {
  _id: string;
  content: string;
  sender: string;
  senderType: 'customer' | 'admin';
  timestamp: string;
  snippet: string;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search messages within a conversation
 * @param conversationId - The conversation ID to search in
 * @param query - The search query string
 * @param page - Page number (default: 1)
 * @param limit - Results per page (default: 20)
 * @returns Search results with pagination info
 */
export async function searchMessages(
  conversationId: string,
  query: string,
  page: number = 1,
  limit: number = 20,
  auth?: { token?: string | null; sessionId?: string | null }
): Promise<SearchResponse> {
  const sessionId = auth?.sessionId ?? localStorage.getItem('keyt_chat_session_id') ?? '';
  
  const url = `${API_BASE_URL}/chat/conversations/${conversationId}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  } else if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Search failed' }));
    throw new Error(error.error || 'Search failed');
  }
  
  return response.json();
}
