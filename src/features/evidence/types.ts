export type VerificationStatus = 'verified' | 'unverified' | 'unknown' | 'trusted';

export type VerdictStatus = 'supported' | 'contested' | 'disputed' | 'insufficient';

export interface EvidenceRequest {
  query: string;
  apiKey: string;
  maxResults?: number;
}

export interface EvidenceItem {
  title: string;
  url: string;
  snippet: string;
  claim?: string;
  location?: string;
  reasoning?: string;
  confidence?: number;
  verification: VerificationStatus;
  verificationScore?: number;
  verificationNote?: string;
  sourceType?: 'pdf' | 'html' | 'unknown';
  sourceLabel?: string;
  sourceScore?: number;
  /** true nếu URL không truy cập được (4xx/5xx/timeout/DNS fail) */
  broken?: boolean;
  // ── Semantic Scholar metadata ──────────────────────────────
  /** Danh sách tác giả (tối đa 3 + "et al.") */
  authors?: string;
  /** Năm xuất bản */
  year?: number | string;
  /** Tên journal/conference */
  journal?: string;
  /** true nếu có PDF mở (Open Access) */
  isOpenAccess?: boolean;
  /** Semantic Scholar paper ID */
  paperId?: string;
}

export interface VerdictResult {
  verdict: VerdictStatus;
  /** 0-100 */
  confidence: number;
  summary: string;
  supporting_count: number;
  opposing_count: number;
}

export interface EvidenceResponse {
  evidence: EvidenceItem[];
  verdict: VerdictResult | null;
}

export interface ClaimSplitResult {
  claims: string[];
  originalText: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
  verdict: VerdictStatus | null;
}
