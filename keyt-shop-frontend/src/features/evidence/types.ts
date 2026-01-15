export type VerificationStatus = 'verified' | 'unverified' | 'unknown' | 'trusted';

export interface EvidenceRequest {
  query: string;
  apiKey: string;
  maxResults?: number;
}

export interface EvidenceItem {
  title: string;
  url: string;
  snippet: string;
  location?: string;
  reasoning?: string;
  confidence?: number;
  verification: VerificationStatus;
  verificationScore?: number;
  verificationNote?: string;
  sourceType?: 'pdf' | 'html' | 'unknown';
  sourceLabel?: string;
  sourceScore?: number;
}

export interface EvidenceResponse {
  evidence: EvidenceItem[];
}
