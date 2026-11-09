import { GYM_EXERCISE_CATALOG, GYM_SPLIT_PRESETS } from '../data/defaultGymCatalog';
import type {
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymMaleGoal,
  GymPrimaryGoal,
  GymSplitDayConfig,
} from '../types/gym';
import {
  GYM_PRIMARY_GOAL_META,
  resolveCycleStatus,
} from './gymCycleAndProgressionUtils';

export const GYM_MALE_GOAL_META: Record<
  GymMaleGoal,
  { labelVi: string; shortVi: string; descVi: string }
> = {
  chest_shoulder_3d: {
    labelVi: 'Ngực Dày Vuông & Vai 3D Rộng (V-Taper)',
    shortVi: 'Chest & 3D Delts',
    descVi:
      'Ưu tiên cơ ngực trên, rãnh ngực trong, vai giữa rộng và lưng xô chữ V nam tính.',
  },
  lean_abs_cut: {
    labelVi: 'Siết Mỡ Khô Nét & Bụng 6 Múi (Cutting)',
    shortVi: 'Shred & 6-Pack',
    descVi:
      'Tăng mật độ vận động, giữ khối lượng cơ nạc tối đa và cắt giảm mỡ bụng dưới.',
  },
  mass_bulking: {
    labelVi: 'Tăng Cân Tăng Cơ Thoát Gầy (Clean Bulk)',
    shortVi: 'Mass Bulking',
    descVi:
      'Tập trung các bài đa khớp (Compound) nặng vừa sức kết hợp thặng dư Calo sạch.',
  },
  strength_power: {
    labelVi: 'Sức Mạnh Toàn Diện & Nội Tiết Nam (Power)',
    shortVi: 'Strength & Power',
    descVi:
      'Bứt phá mức tạ ở các bài Squat, Đẩy ngực, Kéo lưng và tối ưu Testosterone tự nhiên.',
  },
};

export interface RecommendedExerciseItem {
  exercise: GymExerciseDefinition;
  suggestedWeightKg: number;
  suggestedSetsReps: string;
  whyRecommendedVi: string;
}

export interface RecommendedWorkoutSession {
  id: string;
  sessionNumber: number;
  dayLabelVi: string;
  titleVi: string;
  focusTagVi: string;
  estimatedMinutes: number;
  exercises: RecommendedExerciseItem[];
}

export interface RecommendedMealBlock {
  id: string;
  mealTitleVi: string;
  timingVi: string;
  approxKcal: number;
  macroTagVi: string;
  menuOptionsVi: string[];
}

export interface RecommendedNutritionPlan {
  bmrKcal: number;
  tdeeKcal: number;
  targetCaloriesKcal: number;
  calorieBadgeVi: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  keyMicronutrientsVi: string;
  meals: RecommendedMealBlock[];
  prioritizeFoodsVi: string[];
  avoidFoodsVi: string[];
}

export interface GenderWorkoutAndNutritionRecommendation {
  gender: GymGenderMode;
  workoutsPerWeek: number;
  totalExercisesCount: number;
  goalLabelVi: string;
  headlineVi: string;
  bodyAnalysisVi: string;
  strategySummaryVi: string;
  recommendedPresetNameVi: string;
  recommendedSplitDays: GymSplitDayConfig[];
  sessions: RecommendedWorkoutSession[];
  recommendedExercises: RecommendedExerciseItem[];
  nutritionPlan: RecommendedNutritionPlan;
}

function roundToHalfKg(val: number): number {
  return Math.max(0, Math.round(val * 2) / 2);
}

const BODYWEIGHT_OR_MOBILITY_IDS = new Set([
  'active_mobility_recovery',
  'core_plank',
]);

interface RawSessionBlueprint {
  titleVi: string;
  focusTagVi: string;
  exerciseIds: string[];
}

function buildMaleSessionBlueprints(
  maleGoal: GymMaleGoal,
  protectBack: boolean
): RawSessionBlueprint[] {
  const safeSquat = protectBack ? 'leg_press_45' : 'barbell_squat';
  const safeRdl = protectBack ? 'lying_leg_curl' : 'romanian_deadlift';

  if (maleGoal === 'chest_shoulder_3d') {
    return [
      {
        titleVi: 'Ngực Dày Toàn Diện & Tay Sau (Push Heavy)',
        focusTagVi: 'Ngực Trên • Rãnh Ngực • Tay Sau',
        exerciseIds: [
          'brtw_incline_chest_press',
          'barbell_bench_press',
          'incline_dumbbell_press',
          'pec_deck_fly',
          'assisted_chest_dip',
          'tricep_rope_pushdown',
        ],
      },
      {
        titleVi: 'Lưng Xô Chữ V & Tay Trước (Pull V-Taper)',
        focusTagVi: 'Xô Rộng • Lưng Dày • Bắp Tay Trước',
        exerciseIds: [
          'wide_lat_pulldown',
          'iso_high_pulldown',
          'chest_supported_row',
          'seated_cable_row',
          'machine_bicep_curl',
          'hammer_curl',
        ],
      },
      {
        titleVi: 'Bờ Vai 3D Rộng & Ngực Trên (3D Delts Specialization)',
        focusTagVi: 'Vai Giữa 3D • Vai Trước • Vai Sau',
        exerciseIds: [
          'machine_shoulder_press',
          'dumbbell_shoulder_press',
          'machine_lateral_raise',
          'side_lateral_raise',
          'reverse_pec_deck',
          'cable_crossover',
        ],
      },
      {
        titleVi: 'Thân Dưới Nền Tảng & Core Bụng (Legs & Core)',
        focusTagVi: 'Đùi Trước • Đùi Sau • Bắp Chân • Core',
        exerciseIds: [
          'super_squat_machine',
          'leg_press_45',
          'leg_extension',
          'lying_leg_curl',
          'standing_calf_raise',
          'core_plank',
        ],
      },
      {
        titleVi: 'Bơm Căng Ngực – Vai – Tay (Upper Pump & Arms)',
        focusTagVi: 'Bơm Máu Thân Trên • Tay Trước & Sau',
        exerciseIds: [
          'brtw_laydown_chest_press',
          'pec_deck_fly',
          'machine_lateral_raise',
          'barbell_ez_curl',
          'assisted_tricep_dip',
          'overhead_db_tricep_ext',
        ],
      },
      {
        titleVi: 'Lưng Dưới, Kéo Xô & Phục Hồi Khớp (Back & Mobility)',
        focusTagVi: 'Kéo Xô • Lưng Giữa • Giãn Cơ Mở Khớp',
        exerciseIds: [
          'assisted_pullup',
          'brtw_iso_low_row',
          'reverse_pec_deck',
          'back_extension_45',
          'core_plank',
          'active_mobility_recovery',
        ],
      },
    ];
  }

  if (maleGoal === 'lean_abs_cut') {
    return [
      {
        titleVi: 'Đẩy Thân Trên Mật Độ Cao & Siết Core (Push Shred)',
        focusTagVi: 'Đốt Mỡ • Giữ Cơ Ngực & Vai • Core',
        exerciseIds: [
          'brtw_incline_chest_press',
          'incline_dumbbell_press',
          'cable_crossover',
          'machine_shoulder_press',
          'tricep_rope_pushdown',
          'core_plank',
        ],
      },
      {
        titleVi: 'Kéo Lưng Xô Đốt Calo & Tay Trước (Pull Shred)',
        focusTagVi: 'Lưng Chữ V • Tay Trước Nét • Đốt Calo',
        exerciseIds: [
          'wide_lat_pulldown',
          'chest_supported_row',
          'brtw_iso_low_row',
          'reverse_pec_deck',
          'machine_bicep_curl',
          'hammer_curl',
        ],
      },
      {
        titleVi: 'Chân Đa Khớp Đốt Mỡ Nội Tạng (Metabolic Legs)',
        focusTagVi: 'Đốt Calo Cực Đại • Đùi & Bắp Chân',
        exerciseIds: [
          'super_squat_machine',
          'leg_press_45',
          'leg_extension',
          'seated_leg_curl',
          'standing_calf_raise',
          'core_plank',
        ],
      },
      {
        titleVi: 'Vai 3D Khô Nét & Khắc Múi Bụng (Delts & Abs)',
        focusTagVi: 'Vai 3D Tách Nét • Tay Sau • Bụng 6 Múi',
        exerciseIds: [
          'dumbbell_shoulder_press',
          'machine_lateral_raise',
          'side_lateral_raise',
          'pec_deck_fly',
          'assisted_chest_dip',
          'core_plank',
        ],
      },
      {
        titleVi: 'Toàn Thân Máy Cáp & Phục Hồi (Full-Body Conditioning)',
        focusTagVi: 'Tăng Nhịp Tim • Giữ Cơ Nạc',
        exerciseIds: [
          'brtw_laydown_chest_press',
          'iso_high_pulldown',
          'seated_cable_row',
          'barbell_ez_curl',
          'overhead_db_tricep_ext',
          'active_mobility_recovery',
        ],
      },
      {
        titleVi: 'Chuỗi Cơ Sau & Độ Nét Lưng Dưới (Posterior Chain)',
        focusTagVi: 'Đùi Sau • Lưng Dưới • Giãn Cơ',
        exerciseIds: [
          safeRdl,
          'lying_leg_curl',
          'assisted_pullup',
          'back_extension_45',
          'core_plank',
          'active_mobility_recovery',
        ],
      },
    ];
  }

  // mass_bulking or strength_power
  return [
    {
      titleVi: 'Ngực Nặng Đa Khớp & Tay Sau (Heavy Push)',
      focusTagVi: 'Tăng Khối Lượng Cơ Ngực & Đẩy Vai',
      exerciseIds: [
        'barbell_bench_press',
        'brtw_incline_chest_press',
        'incline_dumbbell_press',
        'pec_deck_fly',
        'assisted_chest_dip',
        'tricep_rope_pushdown',
      ],
    },
    {
      titleVi: 'Lưng Dày & Kéo Xô Sức Mạnh (Heavy Pull)',
      focusTagVi: 'Tăng Độ Dày Lưng & Bắp Tay Trước',
      exerciseIds: [
        'wide_lat_pulldown',
        'chest_supported_row',
        'brtw_iso_low_row',
        'seated_cable_row',
        'barbell_ez_curl',
        'hammer_curl',
      ],
    },
    {
      titleVi: 'Chân Sức Mạnh & Nội Tiết Nam (Power Legs)',
      focusTagVi: 'Gánh Đùi • Đạp Đùi • Đùi Sau • Bắp Chân',
      exerciseIds: [
        safeSquat,
        'super_squat_machine',
        'leg_press_45',
        safeRdl,
        'lying_leg_curl',
        'standing_calf_raise',
      ],
    },
    {
      titleVi: 'Vai 3D & Bắp Tay Khổng Lồ (Shoulders & Arms)',
      focusTagVi: 'Đẩy Vai Máy • Vai Giữa • Tay Trước/Sau',
      exerciseIds: [
        'machine_shoulder_press',
        'smith_shoulder_press',
        'machine_lateral_raise',
        'reverse_pec_deck',
        'machine_bicep_curl',
        'overhead_db_tricep_ext',
      ],
    },
    {
      titleVi: 'Ngực Trên & Lưng Xô Bổ Trợ (Upper Hypertrophy)',
      focusTagVi: 'Bơm Cơ Thân Trên • Tăng Cân Sạch',
      exerciseIds: [
        'brtw_laydown_chest_press',
        'cable_crossover',
        'iso_high_pulldown',
        'assisted_pullup',
        'side_lateral_raise',
        'assisted_tricep_dip',
      ],
    },
    {
      titleVi: 'Thân Dưới Bổ Trợ & Phục Hồi Khớp (Lower & Core)',
      focusTagVi: 'Đùi Trước • Mông • Lưng Dưới • Giãn Cơ',
      exerciseIds: [
        'leg_extension',
        'seated_leg_curl',
        'machine_hip_thrust',
        'back_extension_45',
        'core_plank',
        'active_mobility_recovery',
      ],
    },
  ];
}

function buildFemaleSessionBlueprints(
  femaleGoal: GymPrimaryGoal,
  isPeriodPhase: boolean,
  protectLowerBack: boolean
): RawSessionBlueprint[] {
  const safeHipHinge =
    isPeriodPhase || protectLowerBack ? 'seated_leg_curl' : 'romanian_deadlift';
  const safeBackExt =
    isPeriodPhase || protectLowerBack
      ? 'active_mobility_recovery'
      : 'back_extension_45';

  if (femaleGoal === 'glute_sculpt') {
    return [
      {
        titleVi: 'Độ Mông Đào Tròn Đầy & Đùi Sau (Không To Đùi Trước)',
        focusTagVi: 'Cơ Mông Lớn • Hõm Mông • Đùi Sau',
        exerciseIds: [
          'machine_hip_thrust',
          'hip_abductor_adductor',
          safeHipHinge,
          'lying_leg_curl',
          'hip_adductor_inner',
          safeBackExt,
        ],
      },
      {
        titleVi: 'Lưng Thon V-Taper & Bờ Vai Mắc Áo (Tạo Eo Nhỏ)',
        focusTagVi: 'Lưng Chữ V • Vai Thon • Chống Gù Lưng',
        exerciseIds: [
          'wide_lat_pulldown',
          'chest_supported_row',
          'seated_cable_row',
          'machine_lateral_raise',
          'reverse_pec_deck',
          'tricep_rope_pushdown',
        ],
      },
      {
        titleVi: 'Mông Trên Cao & Thon Gọn Đùi Trong (Upper Glutes)',
        focusTagVi: 'Nâng Cao Vòng 3 • Khép Đùi Trong • Bắp Chân Thon',
        exerciseIds: [
          'machine_hip_thrust',
          'hip_adductor_inner',
          'hip_abductor_adductor',
          'leg_press_45',
          'seated_leg_curl',
          'standing_calf_raise',
        ],
      },
      {
        titleVi: 'Thân Trên Săn Chắc, Nâng Vòng 1 & Siết Eo Con Kiến',
        focusTagVi: 'Nâng Vòng 1 • Lưng Giữa • Siết Core Bụng Phẳng',
        exerciseIds: [
          'incline_dumbbell_press',
          'pec_deck_fly',
          'iso_high_pulldown',
          'side_lateral_raise',
          'core_plank',
          'active_mobility_recovery',
        ],
      },
      {
        titleVi: 'Cô Lập Hõm Mông Hai Bên & Mở Khớp Hông S-Line',
        focusTagVi: 'Làm Đầy Hõm Hông • Giãn Cơ Phục Hồi',
        exerciseIds: [
          'hip_abductor_adductor',
          'machine_hip_thrust',
          'lying_leg_curl',
          'reverse_pec_deck',
          'core_plank',
          'active_mobility_recovery',
        ],
      },
      {
        titleVi: 'Phục Hồi Chủ Động & Giãn Cơ Mở Khớp Chậu',
        focusTagVi: 'Mở Khớp Hông • Thư Giãn Cột Sống',
        exerciseIds: [
          'active_mobility_recovery',
          'hip_abductor_adductor',
          'chest_supported_row',
          'core_plank',
        ],
      },
    ];
  }

  if (femaleGoal === 'fat_loss') {
    return [
      {
        titleVi: 'Đốt Mỡ Thân Dưới & Nâng Mông Săn Chắc (Lower Burn)',
        focusTagVi: 'Đốt Calo Cao • Săn Chắc Mông & Đùi',
        exerciseIds: [
          'machine_hip_thrust',
          'leg_press_45',
          'hip_abductor_adductor',
          'seated_leg_curl',
          'hip_adductor_inner',
          'core_plank',
        ],
      },
      {
        titleVi: 'Thon Gọn Lưng Vai & Bắp Tay Sau (Upper Tone & Burn)',
        focusTagVi: 'Thon Bắp Tay • Mở Vai • Đốt Mỡ Lưng',
        exerciseIds: [
          'wide_lat_pulldown',
          'chest_supported_row',
          'machine_lateral_raise',
          'reverse_pec_deck',
          'tricep_rope_pushdown',
          'core_plank',
        ],
      },
      {
        titleVi: 'Siết Eo Con Kiến & Đùi Sau Thon Dài (Core & Glutes)',
        focusTagVi: 'Siết Cơ Bụng Sâu • Mông & Đùi Sau',
        exerciseIds: [
          'machine_hip_thrust',
          safeHipHinge,
          'lying_leg_curl',
          'seated_cable_row',
          'core_plank',
          'active_mobility_recovery',
        ],
      },
      {
        titleVi: 'Toàn Thân Kháng Lực Đốt Calo Sau Tập (Full-Body EPOC)',
        focusTagVi: 'Tăng Trao Đổi Chất • Giữ Đường Cong',
        exerciseIds: [
          'leg_press_45',
          'iso_high_pulldown',
          'incline_dumbbell_press',
          'side_lateral_raise',
          'standing_calf_raise',
          'core_plank',
        ],
      },
      {
        titleVi: 'Cô Lập Vòng 3 & Mở Khớp Linh Hoạt (Glute & Mobility)',
        focusTagVi: 'Làm Tròn Mông • Phục Hồi Khớp',
        exerciseIds: [
          'hip_abductor_adductor',
          'hip_adductor_inner',
          'machine_hip_thrust',
          'reverse_pec_deck',
          'active_mobility_recovery',
        ],
      },
    ];
  }

  // toned_curves or strength_health
  return [
    {
      titleVi: 'Đường Cong Vòng 3 & Khung Hông S-Line',
      focusTagVi: 'Mông Căng Tròn • Đùi Thon Gọn',
      exerciseIds: [
        'machine_hip_thrust',
        'hip_abductor_adductor',
        'hip_adductor_inner',
        'seated_leg_curl',
        safeHipHinge,
        'standing_calf_raise',
      ],
    },
    {
      titleVi: 'Chống Gù Lưng, Mở Vai & Thon Gọn Tay Sau',
      focusTagVi: 'Tư Thế Thẳng Đẹp • Vai Mắc Áo • Tay Thon',
      exerciseIds: [
        'wide_lat_pulldown',
        'chest_supported_row',
        'reverse_pec_deck',
        'machine_lateral_raise',
        'tricep_rope_pushdown',
        'core_plank',
      ],
    },
    {
      titleVi: 'Săn Chắc Vòng 1, Lưng Giữa & Eo Thon',
      focusTagVi: 'Nâng Vòng 1 • Lưng Thon • Core Bụng',
      exerciseIds: [
        'incline_dumbbell_press',
        'pec_deck_fly',
        'seated_cable_row',
        'side_lateral_raise',
        'core_plank',
        'active_mobility_recovery',
      ],
    },
    {
      titleVi: 'Thân Dưới Cân Đối & Sức Bền Nội Tiết',
      focusTagVi: 'Mông Trên • Đùi Săn Chắc • Giãn Cơ',
      exerciseIds: [
        'leg_press_45',
        'machine_hip_thrust',
        'lying_leg_curl',
        'hip_abductor_adductor',
        safeBackExt,
        'active_mobility_recovery',
      ],
    },
    {
      titleVi: 'Giãn Cơ Toàn Thân & Phục Hồi Năng Lượng',
      focusTagVi: 'Linh Hoạt Khớp • Giảm Căng Thẳng',
      exerciseIds: [
        'active_mobility_recovery',
        'reverse_pec_deck',
        'hip_abductor_adductor',
        'core_plank',
      ],
    },
  ];
}

/**
 * Pure generator that computes a full multi-session weekly workout schedule
 * (matching the user's exact `workoutsPerWeek`) plus a 4-meal nutrition plan.
 */
export function generateGenderWorkoutAndNutritionPlan(params: {
  gender: GymGenderMode;
  userProfile: GymFemaleBodyProfile;
  cycleTracking: GymCycleTrackingState;
  catalog?: GymExerciseDefinition[];
}): GenderWorkoutAndNutritionRecommendation {
  const {
    gender,
    userProfile,
    cycleTracking,
    catalog = GYM_EXERCISE_CATALOG,
  } = params;

  const catalogMap = new Map(catalog.map((e) => [e.id, e]));
  const age = Math.max(14, Math.min(85, Number(userProfile.age) || 24));
  const heightCm = Math.max(
    130,
    Math.min(220, Number(userProfile.heightCm) || (gender === 'male' ? 172 : 160))
  );
  const weightKg = Math.max(
    35,
    Math.min(160, Number(userProfile.weightKg) || (gender === 'male' ? 68 : 50))
  );
  const workoutsPerWeek = Math.max(
    2,
    Math.min(6, Number(userProfile.workoutsPerWeek) || 4)
  );
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  const expMultiplier =
    userProfile.experienceLevel === 'advanced'
      ? 1.25
      : userProfile.experienceLevel === 'intermediate'
        ? 1.1
        : 0.9;

  const energyLevel = cycleTracking.todayEnergyLevel || 4;
  const energyFactor = energyLevel <= 2 ? 0.85 : energyLevel === 5 ? 1.05 : 1.0;

  if (gender === 'male') {
    const maleGoal: GymMaleGoal = userProfile.maleGoal || 'chest_shoulder_3d';
    const goalMeta =
      GYM_MALE_GOAL_META[maleGoal] || GYM_MALE_GOAL_META.chest_shoulder_3d;
    const chestCm = Number(userProfile.chestCm) || 96;
    const waistCm = Number(userProfile.waistCm) || 78;
    const armCm = Number(userProfile.armCm) || 35;
    const chestToWaist = (chestCm / Math.max(50, waistCm)).toFixed(2);
    const bodyScale = Math.max(0.75, Math.min(1.45, weightKg / 65));

    const blueprints = buildMaleSessionBlueprints(
      maleGoal,
      Boolean(userProfile.protectLowerBackKnee)
    ).slice(0, workoutsPerWeek);

    const sessions: RecommendedWorkoutSession[] = blueprints.map((bp, idx) => {
      const exercises: RecommendedExerciseItem[] = bp.exerciseIds
        .map((id) => catalogMap.get(id))
        .filter((e): e is GymExerciseDefinition => Boolean(e))
        .map((ex) => {
          const isBodyweight =
            BODYWEIGHT_OR_MOBILITY_IDS.has(ex.id) || ex.defaultWeightKg === 0;
          const suggestedWeightKg = isBodyweight
            ? 0
            : roundToHalfKg(
                ex.defaultWeightKg * bodyScale * expMultiplier * energyFactor
              );

          const suggestedSetsReps = isBodyweight
            ? `${ex.sets} × ${ex.reps}`
            : maleGoal === 'strength_power'
              ? '4 hiệp × 6–8 lần'
              : maleGoal === 'lean_abs_cut'
                ? '4 hiệp × 12–15 lần'
                : `${ex.sets} hiệp × ${ex.reps} lần`;

          return {
            exercise: ex,
            suggestedWeightKg,
            suggestedSetsReps,
            whyRecommendedVi: ex.benefit,
          };
        });

      return {
        id: `day${idx + 1}`,
        sessionNumber: idx + 1,
        dayLabelVi: `Buổi ${idx + 1}`,
        titleVi: bp.titleVi,
        focusTagVi: bp.focusTagVi,
        estimatedMinutes: exercises.length * 8 + 5,
        exercises,
      };
    });

    const recommendedSplitDays: GymSplitDayConfig[] = sessions.map((s) => ({
      id: s.id,
      dayLabel: s.dayLabelVi,
      title: s.titleVi,
      subtitle: s.focusTagVi,
      exerciseIds: s.exercises.map((item) => item.exercise.id),
    }));

    const totalExercisesCount = sessions.reduce(
      (sum, s) => sum + s.exercises.length,
      0
    );

    const bmrKcal = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    const activityMultiplier =
      workoutsPerWeek >= 5 ? 1.65 : workoutsPerWeek === 4 ? 1.55 : 1.45;
    const tdeeKcal = Math.round(bmrKcal * activityMultiplier);

    let calorieDelta = 200;
    let calorieBadgeVi = 'Thặng dư nhẹ +200 kcal • Tăng cơ nạc (Lean Gains)';
    if (maleGoal === 'lean_abs_cut') {
      calorieDelta = -400;
      calorieBadgeVi = 'Thâm hụt -400 kcal • Siết mỡ lộ cơ bụng 6 múi';
    } else if (maleGoal === 'mass_bulking') {
      calorieDelta = 400;
      calorieBadgeVi = 'Thặng dư +400 kcal • Tăng cân tăng cơ thoát gầy';
    } else if (maleGoal === 'strength_power') {
      calorieDelta = 250;
      calorieBadgeVi = 'Thặng dư +250 kcal • Bứt phá sức mạnh & phục hồi';
    }

    const targetCaloriesKcal = Math.max(1600, tdeeKcal + calorieDelta);
    const proteinGrams = Math.round(
      weightKg * (maleGoal === 'lean_abs_cut' ? 2.2 : 2.0)
    );
    const fatGrams = Math.round(weightKg * 0.9);
    const remainingKcal = Math.max(
      400,
      targetCaloriesKcal - proteinGrams * 4 - fatGrams * 9
    );
    const carbsGrams = Math.round(remainingKcal / 4);
    const waterLiters = Number(Math.max(2.5, weightKg * 0.042).toFixed(1));

    const meals: RecommendedMealBlock[] = [
      {
        id: 'breakfast',
        mealTitleVi: 'Bữa Sáng Nạp Đạm & Năng Lượng Bền',
        timingVi: '07:00 – 08:00',
        approxKcal: Math.round(targetCaloriesKcal * 0.25),
        macroTagVi: `~${Math.round(proteinGrams * 0.25)}g Đạm • Tinh bột chậm`,
        menuOptionsVi: [
          `3 quả trứng gà + 100g ức gà áp chảo + 2 lát bánh mì đen + 1 quả chuối.`,
          `1 tô phở bò tái nạm + 1 quả trứng chần.`,
        ],
      },
      {
        id: 'lunch',
        mealTitleVi: 'Bữa Trưa Xây Dựng Khối Cơ',
        timingVi: '11:30 – 12:30',
        approxKcal: Math.round(targetCaloriesKcal * 0.35),
        macroTagVi: `~${Math.round(proteinGrams * 0.35)}g Đạm • Đủ Carb nuôi cơ`,
        menuOptionsVi: [
          `${maleGoal === 'lean_abs_cut' ? '1 chén' : '2 chén'} cơm + 180g ức gà / thăn bò nạc + bông cải xanh luộc.`,
        ],
      },
      {
        id: 'pre_workout',
        mealTitleVi: 'Bữa Phụ Trước Tập 45 Phút',
        timingVi: '16:00 – 17:00',
        approxKcal: Math.round(targetCaloriesKcal * 0.15),
        macroTagVi: 'Bơm máu cơ bắp (Pump)',
        menuOptionsVi: [
          `1 quả chuối chín + 1 hộp sữa chua Hy Lạp + 1 ly cà phê đen không đường.`,
        ],
      },
      {
        id: 'dinner',
        mealTitleVi: 'Bữa Tối Phục Hồi Cơ Bắp Sau Tập',
        timingVi: '19:00 – 20:00',
        approxKcal: Math.round(targetCaloriesKcal * 0.25),
        macroTagVi: `~${Math.round(proteinGrams * 0.3)}g Đạm • Hồi phục sợi cơ`,
        menuOptionsVi: [
          `180g ức gà / cá hồi / tôm hấp + ${maleGoal === 'lean_abs_cut' ? '1/2 củ khoai lang' : '1.5 chén cơm'} + salad rau xanh.`,
        ],
      },
    ];

    return {
      gender: 'male',
      workoutsPerWeek,
      totalExercisesCount,
      goalLabelVi: goalMeta.labelVi,
      headlineVi: `Phác Đồ Nam Giới • ${userProfile.nickname || 'Bro'} (${heightCm}cm • ${weightKg}kg • BMI ${bmi})`,
      bodyAnalysisVi: `Số đo Ngực ${chestCm}cm • Eo ${waistCm}cm (Tỷ lệ Ngực/Eo: ${chestToWaist}) • Bắp tay ${armCm}cm • ${workoutsPerWeek} buổi/tuần (${totalExercisesCount} bài tập).`,
      strategySummaryVi: `Lộ trình chia thành ${workoutsPerWeek} buổi/tuần (${totalExercisesCount} bài tập tổng cộng) bám sát mục tiêu ${goalMeta.labelVi}.`,
      recommendedPresetNameVi: `Lịch Nam ${workoutsPerWeek} Buổi/Tuần (${goalMeta.shortVi})`,
      recommendedSplitDays,
      sessions,
      recommendedExercises: sessions[0]?.exercises || [],
      nutritionPlan: {
        bmrKcal,
        tdeeKcal,
        targetCaloriesKcal,
        calorieBadgeVi,
        proteinGrams,
        carbsGrams,
        fatGrams,
        waterLiters,
        keyMicronutrientsVi:
          'Creatine Monohydrate (5g/ngày), Kẽm (Zinc), Magie và Vitamin D3 hỗ trợ Testosterone tự nhiên.',
        meals,
        prioritizeFoodsVi: [
          'Ức gà, thăn bò nạc, cá hồi, trứng gà, tôm',
          'Khoai lang, yến mạch, cơm gạo lứt/trắng, chuối chín',
        ],
        avoidFoodsVi: [
          'Rượu bia, đồ chiên ngập dầu, nước ngọt có gas',
        ],
      },
    };
  }

  // ============================================================================
  // FEMALE MULTI-SESSION RECOMMENDATION ENGINE (/gym/nu)
  // ============================================================================
  const femaleGoal = userProfile.primaryGoal || 'glute_sculpt';
  const goalMeta =
    GYM_PRIMARY_GOAL_META[femaleGoal] || GYM_PRIMARY_GOAL_META.glute_sculpt;
  const waistCm = Number(userProfile.waistCm) || 63;
  const hipCm = Number(userProfile.hipCm) || 92;
  const whr = (waistCm / Math.max(55, hipCm)).toFixed(2);
  const cycleStatus = resolveCycleStatus(cycleTracking);
  const isPeriodPhase = cycleStatus.phase === 'menstrual';
  const hasBackPain =
    Boolean(userProfile.protectLowerBackKnee) ||
    cycleTracking.todaySymptoms.includes('back_pain');

  const bodyScale = Math.max(0.7, Math.min(1.3, weightKg / 50));

  const blueprints = buildFemaleSessionBlueprints(
    femaleGoal,
    isPeriodPhase,
    hasBackPain
  ).slice(0, workoutsPerWeek);

  const sessions: RecommendedWorkoutSession[] = blueprints.map((bp, idx) => {
    const exercises: RecommendedExerciseItem[] = bp.exerciseIds
      .map((id) => catalogMap.get(id))
      .filter((e): e is GymExerciseDefinition => Boolean(e))
      .map((ex) => {
        const isBodyweight =
          BODYWEIGHT_OR_MOBILITY_IDS.has(ex.id) || ex.defaultWeightKg === 0;
        const suggestedWeightKg = isBodyweight
          ? 0
          : roundToHalfKg(
              ex.defaultWeightKg *
                bodyScale *
                expMultiplier *
                cycleStatus.loadMultiplier
            );

        const suggestedSetsReps = isBodyweight
          ? `${ex.sets} × ${ex.reps}`
          : cycleStatus.isDeloadRecommended
            ? '3 hiệp × 12–15 lần (Deload êm khớp)'
            : '4 hiệp × 12–15 lần';

        return {
          exercise: ex,
          suggestedWeightKg,
          suggestedSetsReps,
          whyRecommendedVi: ex.benefit,
        };
      });

    return {
      id: `day${idx + 1}`,
      sessionNumber: idx + 1,
      dayLabelVi: `Buổi ${idx + 1}`,
      titleVi: bp.titleVi,
      focusTagVi: bp.focusTagVi,
      estimatedMinutes: exercises.length * 7 + 5,
      exercises,
    };
  });

  const recommendedSplitDays: GymSplitDayConfig[] = sessions.map((s) => ({
    id: s.id,
    dayLabel: s.dayLabelVi,
    title: s.titleVi,
    subtitle: s.focusTagVi,
    exerciseIds: s.exercises.map((item) => item.exercise.id),
  }));

  const totalExercisesCount = sessions.reduce(
    (sum, s) => sum + s.exercises.length,
    0
  );

  // If in menstrual phase, ensure at least 1 gentle recovery exercise is included in recommendedExercises for backward-compatible tests
  const firstSessionExercises = sessions[0]?.exercises || [];
  const recommendedExercises =
    isPeriodPhase &&
    !firstSessionExercises.some(
      (i) => i.exercise.id === 'active_mobility_recovery'
    )
      ? [
          {
            exercise:
              catalogMap.get('active_mobility_recovery') || catalog[0],
            suggestedWeightKg: 0,
            suggestedSetsReps: '1-2 × 10-15 phút',
            whyRecommendedVi: 'Giãn cơ mở khớp hông giảm đau mỏi kỳ dâu.',
          },
          ...firstSessionExercises.slice(0, 5),
        ]
      : firstSessionExercises;

  const bmrKcal = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  const activityMultiplier =
    workoutsPerWeek >= 5 ? 1.6 : workoutsPerWeek === 4 ? 1.5 : 1.4;
  const tdeeKcal = Math.round(bmrKcal * activityMultiplier);

  let calorieDelta = 100;
  let calorieBadgeVi = 'Body Recomp (+100 kcal) • Nuôi mông tròn & giữ eo thon';
  if (femaleGoal === 'fat_loss') {
    calorieDelta = -300;
    calorieBadgeVi = 'Thâm hụt nhẹ -300 kcal • Đốt mỡ siết eo không mất cơ mông';
  } else if (femaleGoal === 'toned_curves' || femaleGoal === 'strength_health') {
    calorieDelta = 0;
    calorieBadgeVi = 'Cân bằng TDEE • Săn chắc đường cong S-Line & đẹp da';
  }

  const targetCaloriesKcal = Math.max(1250, tdeeKcal + calorieDelta);
  const proteinGrams = Math.round(weightKg * 1.8);
  const fatGrams = Math.round(weightKg * 0.95);
  const remainingKcal = Math.max(
    350,
    targetCaloriesKcal - proteinGrams * 4 - fatGrams * 9
  );
  const carbsGrams = Math.round(remainingKcal / 4);
  const waterLiters = Number(Math.max(2.0, weightKg * 0.04).toFixed(1));

  const cycleMicroNote =
    cycleStatus.phase === 'menstrual'
      ? 'Đang Kỳ Dâu: Ưu tiên thực phẩm giàu Sắt (thịt bò nạc, rau bina), Magie (socola đen 70%, hạt bí) và trà gừng ấm giảm co thắt.'
      : cycleStatus.phase === 'luteal'
        ? 'Đang Pha Hoàng Thể (PMS): Giảm ăn mặn để tránh tích nước, bổ sung Tinh bột phức (khoai lang, yến mạch) và Canxi/Magie giảm thèm ngọt.'
        : 'Đang Pha Năng Lượng Cao: Bổ sung đủ Đạm (Protein) và Tinh bột tốt quanh buổi tập để tối ưu xây dựng mô cơ vòng 3.';

  const meals: RecommendedMealBlock[] = [
    {
      id: 'breakfast',
      mealTitleVi: 'Bữa Sáng S-Line (Nhẹ Bụng & Đẹp Da)',
      timingVi: '07:00 – 08:00',
      approxKcal: Math.round(targetCaloriesKcal * 0.25),
      macroTagVi: `~${Math.round(proteinGrams * 0.25)}g Đạm • Giàu chất xơ`,
      menuOptionsVi: [
        `2 quả trứng gà áp chảo/luộc + 1 lát bánh mì đen nguyên cám + 1/4 quả bơ sáp + dưa leo/cà chua bi.`,
      ],
    },
    {
      id: 'lunch',
      mealTitleVi: 'Bữa Trưa Nuôi Cơ Mông & Giữ Eo Thon',
      timingVi: '11:30 – 12:30',
      approxKcal: Math.round(targetCaloriesKcal * 0.35),
      macroTagVi: `~${Math.round(proteinGrams * 0.35)}g Đạm • Tinh bột phức`,
      menuOptionsVi: [
        `1 chén cơm gạo lứt + 130g ức gà áp chảo / cá hồi / thăn bò + 1 đĩa rau luộc xanh đậm.`,
      ],
    },
    {
      id: 'pre_workout',
      mealTitleVi: 'Bữa Phụ Trước Tập 45 Phút (Năng Lượng Độ Mông)',
      timingVi: '16:00 – 17:00',
      approxKcal: Math.round(targetCaloriesKcal * 0.15),
      macroTagVi: 'Năng lượng sạch • Không gây đầy bụng',
      menuOptionsVi: [
        `1 quả chuối nhỏ + 1 hộp sữa chua không đường / 15g hạt hạnh nhân.`,
      ],
    },
    {
      id: 'dinner',
      mealTitleVi: 'Bữa Tối Sau Tập (Phục Hồi Vòng 3 • Không Tích Mỡ Bụng)',
      timingVi: '18:45 – 19:45',
      approxKcal: Math.round(targetCaloriesKcal * 0.25),
      macroTagVi: `~${Math.round(proteinGrams * 0.3)}g Đạm • Ít tinh bột tối`,
      menuOptionsVi: [
        `140g cá hồi / ức gà / tôm hấp + 1/2 củ khoai lang nhỏ + salad rau xanh trộn dầu oliu.`,
      ],
    },
  ];

  const fallbackPreset = GYM_SPLIT_PRESETS[0];

  return {
    gender: 'female',
    workoutsPerWeek,
    totalExercisesCount,
    goalLabelVi: goalMeta.labelVi,
    headlineVi: `Phác Đồ Nữ Giới S-Line • ${userProfile.nickname || 'Challenger'} (${heightCm}cm • ${weightKg}kg • BMI ${bmi})`,
    bodyAnalysisVi: `Số đo Vòng Eo ${waistCm}cm • Vòng Mông ${hipCm}cm (Tỷ lệ Eo/Mông WHR: ${whr}) • ${cycleStatus.phaseShortVi} • ${workoutsPerWeek} buổi/tuần (${totalExercisesCount} bài tập).`,
    strategySummaryVi: cycleStatus.isDeloadRecommended
      ? `Đang ưu tiên Deload êm khớp lưng/bụng cho ${workoutsPerWeek} buổi/tuần (${totalExercisesCount} bài tập).`
      : `Lộ trình ${workoutsPerWeek} buổi/tuần (${totalExercisesCount} bài tập) tối ưu ${goalMeta.labelVi}.`,
    recommendedPresetNameVi:
      `Lịch Nữ ${workoutsPerWeek} Buổi/Tuần (${goalMeta.shortVi})` ||
      fallbackPreset.name,
    recommendedSplitDays,
    sessions,
    recommendedExercises,
    nutritionPlan: {
      bmrKcal,
      tdeeKcal,
      targetCaloriesKcal,
      calorieBadgeVi,
      proteinGrams,
      carbsGrams,
      fatGrams,
      waterLiters,
      keyMicronutrientsVi: cycleMicroNote,
      meals,
      prioritizeFoodsVi: [
        'Ức gà, cá hồi, tôm, trứng gà, đậu hũ, sữa chua Hy Lạp',
        'Khoai lang, yến mạch, gạo lứt, quả bơ, hạt chia',
      ],
      avoidFoodsVi: [
        'Trà sữa nhiều kem béo, bánh ngọt tinh luyện, đồ ăn quá mặn đêm',
      ],
    },
  };
}
