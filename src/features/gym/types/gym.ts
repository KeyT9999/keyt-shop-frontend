/**
 * Single Source of Truth for KeyT Gym 3D Coach (/gym)
 * Covers 5-day customizable split, exercise library, 3D pose animations, and LocalStorage/MongoDB sync.
 */

export type GymMuscleRegion =
  | 'chest'
  | 'back'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'shoulders'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core';

export type Gym3DAnimType =
  | 'incline_press'
  | 'leverage_incline_press'
  | 'laydown_chest_press'
  | 'bench_press'
  | 'pec_fly'
  | 'cable_crossover'
  | 'lat_pulldown'
  | 'iso_high_pulldown'
  | 'chest_supported_row'
  | 'cable_row'
  | 'assisted_pullup'
  | 'tricep_pushdown'
  | 'assisted_dip'
  | 'assisted_chest_dip'
  | 'overhead_tricep'
  | 'hammer_curl'
  | 'barbell_curl'
  | 'preacher_curl'
  | 'shoulder_press'
  | 'leverage_shoulder_press'
  | 'lateral_raise'
  | 'machine_lateral_raise'
  | 'reverse_pec_fly'
  | 'face_pull'
  | 'squat'
  | 'super_squat'
  | 'leg_press'
  | 'leg_extension'
  | 'seated_leg_curl'
  | 'rdl'
  | 'leg_curl'
  | 'hip_thrust'
  | 'hip_abduction'
  | 'hip_adduction'
  | 'calf_raise'
  | 'back_extension'
  | 'recovery';

export type GymPoseMode = 'loop' | 'start' | 'peak';

export type GymCameraPreset = 'iso' | 'front' | 'side';

export interface GymExerciseDefinition {
  id: string;
  name: string;
  vietnameseName: string;
  categoryLabel: string;
  muscleTag: string;
  primaryMuscles: GymMuscleRegion[];
  secondaryMuscles: GymMuscleRegion[];
  machineName: string;
  machineSetupTip: string;
  defaultWeightKg: number;
  weightUnitLabel: string;
  sets: string;
  reps: string;
  restSeconds: number;
  restLabel: string;
  animType: Gym3DAnimType;
  /** Optional custom Blender .glb path under public/models/gym/<id>.glb */
  customGlbPath?: string;
  /** Optional optimized photo of the exact real machine inside user's gym */
  realGymPhoto?: string;
  /** Real 2-pose reference photos (Start & Peak contraction) from Free Exercise DB (Public Domain) */
  referenceImages: [string, string];
  benefit: string;
  steps: string[];
  mistakes: string;
  isEccentricFirst?: boolean;
}

export interface GymSplitDayConfig {
  id: string;
  dayLabel: string;
  title: string;
  subtitle: string;
  isRestDay?: boolean;
  exerciseIds: string[];
}

export interface GymExerciseUserLog {
  exerciseId: string;
  weightKg: number;
  repsNote: string;
  personalTip: string;
  updatedAtMs: number;
}

export type GymPrimaryGoal =
  | 'glute_sculpt'
  | 'fat_loss'
  | 'toned_curves'
  | 'strength_health';

export type GymExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type GymCyclePhase =
  | 'menstrual'
  | 'follicular'
  | 'ovulatory'
  | 'luteal';

export type GymManualPhaseOverride = 'auto' | GymCyclePhase;

export type GymSymptomCode =
  | 'cramps'
  | 'back_pain'
  | 'bloating'
  | 'fatigue'
  | 'headache'
  | 'cravings'
  | 'low_mood';

export type GymRestrictionKind = 'dislike' | 'injury' | 'busy';

export interface GymFemaleBodyProfile {
  nickname: string;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  primaryGoal: GymPrimaryGoal;
  experienceLevel: GymExperienceLevel;
  avoidHeavyQuads: boolean;
  protectLowerBackKnee: boolean;
  personalNotes: string;
  updatedAtMs: number;
}

export interface GymCycleTrackingState {
  enabled: boolean;
  lastPeriodStartDate: string;
  cycleLengthDays: number;
  periodDurationDays: number;
  manualPhaseOverride: GymManualPhaseOverride;
  todayEnergyLevel: 1 | 2 | 3 | 4 | 5;
  todaySymptoms: GymSymptomCode[];
  updatedAtMs: number;
}

export interface GymExerciseRestriction {
  exerciseId: string;
  kind: GymRestrictionKind;
  updatedAtMs: number;
}

export interface GymAiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  createdAtMs: number;
}

export interface GymClientPersistedState {
  activeDayId: string;
  completedExerciseIdsToday: string[];
  sessionDateKey: string;
  workoutStreak: number;
  lastCompletedSessionDate: string;
  customDays: GymSplitDayConfig[];
  exerciseLogs: Record<string, GymExerciseUserLog>;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  exerciseRestrictions: GymExerciseRestriction[];
  aiChatHistory: GymAiChatMessage[];
  clientUpdatedAt: number;
}

export interface GymServerProfilePayload {
  activeDayId: string;
  completedExerciseIdsToday: string[];
  sessionDateKey: string;
  workoutStreak: number;
  lastCompletedSessionDate: string;
  customDays: GymSplitDayConfig[];
  exerciseLogs: GymExerciseUserLog[];
  userProfile?: GymFemaleBodyProfile;
  cycleTracking?: GymCycleTrackingState;
  exerciseRestrictions?: GymExerciseRestriction[];
  aiChatHistory?: GymAiChatMessage[];
  clientUpdatedAt: number;
  updatedAt?: string;
}

export interface GymSplitPresetTemplate {
  id: string;
  name: string;
  description: string;
  badge?: string;
  days: GymSplitDayConfig[];
}
