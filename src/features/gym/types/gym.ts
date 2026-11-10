/**
 * Single Source of Truth for KeyT Gym 3D Coach (/gym, /gym/nam, /gym/nu)
 * Covers per-gender customizable splits, exercise library, 3D pose animations, set-by-set tracking,
 * PR / 1RM / Workout History / Body Metrics, and LocalStorage <-> MongoDB Cloud sync.
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
  /** Safe, realistic starting weight for Female (/gym/nu) */
  defaultFemaleWeightKg?: number;
  /** Real gym increment step (e.g. 1 or 2 for dumbbells, 2.5 or 5 for cables/plates) */
  equipmentStepKg?: number;
  /** True when weight is loaded per side on barbell/machine horns (enables Plate Calculator) */
  isPlateLoadedPerSide?: boolean;
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

export interface GymSetDetailItem {
  setNumber: number;
  weightKg: number;
  reps: number;
  isWarmup?: boolean;
  completed: boolean;
}

export interface GymExerciseUserLog {
  exerciseId: string;
  weightKg: number;
  repsNote: string;
  personalTip: string;
  seatPinNote?: string;
  personalRecordKg?: number;
  estimated1RM?: number;
  setsCompletedToday?: number[];
  setsCompletedDateKey?: string;
  setsDetail?: GymSetDetailItem[];
  updatedAtMs: number;
}

export type GymGenderMode = 'male' | 'female';

export type GymPrimaryGoal =
  | 'glute_sculpt'
  | 'fat_loss'
  | 'toned_curves'
  | 'strength_health';

export type GymMaleGoal =
  | 'chest_shoulder_3d'
  | 'lean_abs_cut'
  | 'mass_bulking'
  | 'strength_power';

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
  gender?: GymGenderMode;
  nickname: string;
  age: number;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  chestCm?: number;
  armCm?: number;
  workoutsPerWeek?: number;
  primaryGoal: GymPrimaryGoal;
  maleGoal?: GymMaleGoal;
  experienceLevel: GymExperienceLevel;
  avoidHeavyQuads: boolean;
  protectLowerBackKnee: boolean;
  shoulderSafe?: boolean;
  maleEnergyLevel?: 1 | 2 | 3 | 4 | 5;
  waterIntakeMlToday?: number;
  waterDateKey?: string;
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

export interface GymWorkoutHistoryEntry {
  id: string;
  dateKey: string;
  gender: GymGenderMode;
  dayId: string;
  dayTitle: string;
  durationMinutes: number;
  totalVolumeKg: number;
  completedExercisesCount: number;
  caloriesBurned: number;
  prCount: number;
  prHighlights: string[];
  createdAtMs: number;
}

export interface GymBodyMetricEntry {
  dateKey: string;
  gender: GymGenderMode;
  weightKg: number;
  waistCm: number;
  hipCm: number;
  chestCm: number;
  armCm: number;
  createdAtMs: number;
}

export interface GymClientPersistedState {
  activeDayId: string;
  activeMaleDayId?: string;
  activeFemaleDayId?: string;
  completedExerciseIdsToday: string[];
  sessionDateKey: string;
  workoutStreak: number;
  lastCompletedSessionDate: string;
  customDays: GymSplitDayConfig[];
  maleCustomDays?: GymSplitDayConfig[];
  femaleCustomDays?: GymSplitDayConfig[];
  exerciseLogs: Record<string, GymExerciseUserLog>;
  workoutHistory?: GymWorkoutHistoryEntry[];
  bodyMetricsHistory?: GymBodyMetricEntry[];
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  exerciseRestrictions: GymExerciseRestriction[];
  aiChatHistory: GymAiChatMessage[];
  clientUpdatedAt: number;
}

export interface GymServerProfilePayload {
  activeDayId: string;
  activeMaleDayId?: string;
  activeFemaleDayId?: string;
  completedExerciseIdsToday: string[];
  sessionDateKey: string;
  workoutStreak: number;
  lastCompletedSessionDate: string;
  customDays: GymSplitDayConfig[];
  maleCustomDays?: GymSplitDayConfig[];
  femaleCustomDays?: GymSplitDayConfig[];
  exerciseLogs: GymExerciseUserLog[];
  workoutHistory?: GymWorkoutHistoryEntry[];
  bodyMetricsHistory?: GymBodyMetricEntry[];
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
