export const SummaryStyle = {
  BRIEF: 'brief',
  DETAILED: 'detailed',
  LEARNING: 'learning'
} as const;

export type SummaryStyle = (typeof SummaryStyle)[keyof typeof SummaryStyle];

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  channelName?: string;
  duration?: string;
}

export interface SummaryResult {
  shortSummary: string;
  keyPoints: string[];
  fullText: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type AppState = 'idle' | 'analyzing' | 'ready_to_summarize' | 'summarizing' | 'finished';

