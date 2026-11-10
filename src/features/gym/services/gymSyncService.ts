import type {
  GymAiChatMessage,
  GymCycleTrackingState,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymServerProfilePayload,
  GymWorkoutHistoryEntry,
} from '../types/gym';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface GymAiUserSnapshot {
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  resolvedCyclePhase: string;
  activeDayTitle: string;
  currentExerciseName: string;
  workoutStreak: number;
  customDaysSummary: string[];
  exerciseLogsSummary: string[];
  prSummary?: string[];
  recentWorkoutSummary?: string;
}

export interface GymAiCoachResponse {
  reply: string;
  provider: string;
  model: string;
}

export interface CompleteSessionRequestPayload {
  id?: string;
  dateKey: string;
  gender: GymGenderMode;
  dayId: string;
  dayTitle: string;
  nextDayId?: string;
  durationMinutes: number;
  totalVolumeKg: number;
  completedExercisesCount: number;
  caloriesBurned: number;
  prCount: number;
  prHighlights: string[];
  exerciseLogs: GymExerciseUserLog[];
}

export interface CompleteSessionServerResponse {
  profile: GymServerProfilePayload;
  sessionEntry: GymWorkoutHistoryEntry;
  newPrHighlights: string[];
}

export const gymSyncService = {
  async fetchProfile(token: string): Promise<GymServerProfilePayload | null> {
    const res = await fetch(`${API_BASE_URL}/gym/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Không thể tải hồ sơ lịch tập (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<GymServerProfilePayload | null>;
    return body.data ?? null;
  },

  async saveProfile(
    token: string,
    payload: Omit<GymServerProfilePayload, 'updatedAt'>
  ): Promise<GymServerProfilePayload | null> {
    const res = await fetch(`${API_BASE_URL}/gym/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Không thể đồng bộ lịch tập lên máy chủ (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<GymServerProfilePayload | null>;
    return body.data ?? null;
  },

  async completeSession(
    token: string,
    payload: CompleteSessionRequestPayload
  ): Promise<CompleteSessionServerResponse | null> {
    const res = await fetch(`${API_BASE_URL}/gym/sessions/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Không thể lưu tổng kết buổi tập (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<CompleteSessionServerResponse | null>;
    return body.data ?? null;
  },

  async askAiCoach(params: {
    question: string;
    history: GymAiChatMessage[];
    userSnapshot: GymAiUserSnapshot;
    token?: string | null;
  }): Promise<GymAiCoachResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (params.token) {
      headers.Authorization = `Bearer ${params.token}`;
    }

    const res = await fetch(`${API_BASE_URL}/gym/ai-chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question: params.question,
        history: params.history.slice(-8),
        userSnapshot: params.userSnapshot,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI Coach tạm thời gián đoạn (${res.status}).`);
    }

    const body = (await res.json()) as ApiEnvelope<GymAiCoachResponse>;
    return body.data;
  },
};
