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
  | 'overhead_tricep'
  | 'hammer_curl'
  | 'barbell_curl'
  | 'preacher_curl'
  | 'shoulder_press'
  | 'lateral_raise'
  | 'machine_lateral_raise'
  | 'reverse_pec_fly'
  | 'face_pull'
  | 'squat'
  | 'super_squat'
  | 'leg_press'
  | 'leg_extension'
  | 'rdl'
  | 'leg_curl'
  | 'hip_thrust'
  | 'hip_abduction'
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

export interface GymClientPersistedState {
  activeDayId: string;
  completedExerciseIdsToday: string[];
  sessionDateKey: string;
  workoutStreak: number;
  lastCompletedSessionDate: string;
  customDays: GymSplitDayConfig[];
  exerciseLogs: Record<string, GymExerciseUserLog>;
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
  clientUpdatedAt: number;
  updatedAt?: string;
}

export interface GymSplitPresetTemplate {
  id: string;
  name: string;
  description: string;
  days: GymSplitDayConfig[];
}
