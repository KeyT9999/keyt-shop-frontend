import { GYM_EXERCISE_CATALOG, GYM_SPLIT_PRESETS } from '../data/defaultGymCatalog';
import type {
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymMaleGoal,
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
  goalLabelVi: string;
  headlineVi: string;
  bodyAnalysisVi: string;
  strategySummaryVi: string;
  recommendedPresetNameVi: string;
  recommendedSplitDays: GymSplitDayConfig[];
  recommendedExercises: RecommendedExerciseItem[];
  nutritionPlan: RecommendedNutritionPlan;
}

function roundToHalfKg(val: number): number {
  return Math.max(0, Math.round(val * 2) / 2);
}

function findExercisesByIds(
  ids: string[],
  catalog: GymExerciseDefinition[]
): GymExerciseDefinition[] {
  const map = new Map(catalog.map((e) => [e.id, e]));
  return ids.map((id) => map.get(id)).filter((e): e is GymExerciseDefinition => Boolean(e));
}

/**
 * Pure generator that computes personalized workout recommendations and a 4-meal
 * Vietnamese nutrition plan immediately after Male or Female questionnaire submission.
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
    Math.min(7, Number(userProfile.workoutsPerWeek) || 4)
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
    const goalMeta = GYM_MALE_GOAL_META[maleGoal] || GYM_MALE_GOAL_META.chest_shoulder_3d;
    const chestCm = Number(userProfile.chestCm) || 96;
    const waistCm = Number(userProfile.waistCm) || 78;
    const armCm = Number(userProfile.armCm) || 35;
    const chestToWaist = (chestCm / Math.max(50, waistCm)).toFixed(2);

    // Pick exercise IDs & split preset based on Male Goal
    let targetExerciseIds: string[] = [];
    let presetId = 'ppl_3day';
    let strategySummaryVi = '';

    if (maleGoal === 'chest_shoulder_3d') {
      presetId = 'upper_lower_4day';
      targetExerciseIds = [
        'brtw_incline_chest_press',
        'incline_dumbbell_press',
        'pec_deck_fly',
        'wide_lat_pulldown',
        'machine_shoulder_press',
        'machine_lateral_raise',
      ];
      strategySummaryVi =
        'Tập trung mở rộng khung thân trên chữ V (V-Taper): ưu tiên đẩy ngực trên tạo độ dày sát xương quai xanh, kết hợp máy bay vai giữa cô lập cơ Delta và kéo xô rộng tay.';
    } else if (maleGoal === 'lean_abs_cut') {
      presetId = 'ppl_3day';
      targetExerciseIds = [
        'brtw_laydown_chest_press',
        'chest_supported_row',
        'super_squat_machine',
        'cable_crossover',
        'tricep_rope_pushdown',
        'core_plank',
      ];
      strategySummaryVi =
        'Chiến lược Siết Cơ Nét & Bụng 6 Múi: kết hợp các bài máy đa khớp đốt nhiều Calo với thời gian nghỉ ngắn (60–75 giây/hiệp) và bài siết cơ lõi (Core) cuối buổi.';
    } else if (maleGoal === 'mass_bulking') {
      presetId = 'bro_split_5day';
      targetExerciseIds = [
        'barbell_bench_press',
        'brtw_incline_chest_press',
        'wide_lat_pulldown',
        'chest_supported_row',
        'leg_press_45',
        'machine_bicep_curl',
      ];
      strategySummaryVi =
        'Chiến lược Tăng Cân Tăng Cơ (Clean Bulking): tập trung 80% năng lượng vào các bài Compound đa khớp trên máy BRTW/Impulse với mức tạ tăng tiến (Progressive Overload) 8–10 reps.';
    } else {
      presetId = 'upper_lower_4day';
      targetExerciseIds = [
        'barbell_squat',
        'barbell_bench_press',
        'brtw_iso_low_row',
        'machine_shoulder_press',
        'romanian_deadlift',
        'hammer_curl',
      ];
      strategySummaryVi =
        'Chiến lược Sức Mạnh & Phong Độ Nam Giới: ưu tiên chuỗi bài tập nền tảng thân dưới & thân trên kích thích hệ thần kinh cơ và tối ưu sản sinh Testosterone tự nhiên.';
    }

    const foundPreset =
      GYM_SPLIT_PRESETS.find((p) => p.id === presetId) || GYM_SPLIT_PRESETS[0];

    const pickedExercises = findExercisesByIds(targetExerciseIds, catalog);
    const recommendedExercises: RecommendedExerciseItem[] = pickedExercises.map((ex) => {
      const baseKg = ex.defaultWeightKg || 20;
      const bodyScale = Math.max(0.75, Math.min(1.45, weightKg / 65));
      const suggestedWeightKg =
        baseKg > 0
          ? roundToHalfKg(baseKg * bodyScale * expMultiplier * energyFactor)
          : 0;

      const suggestedSetsReps =
        maleGoal === 'strength_power'
          ? '4 hiệp × 6–8 lần (Tạ nặng kiểm soát)'
          : maleGoal === 'lean_abs_cut'
            ? '4 hiệp × 12–15 lần (Nghỉ 60s đốt mỡ)'
            : '4 hiệp × 8–12 lần (Tăng cơ chuẩn Hypertrophy)';

      let whyRecommendedVi = ex.benefit;
      if (ex.primaryMuscles.includes('chest')) {
        whyRecommendedVi = `Làm dày bản ngực trên & rãnh ngực nam giới (Vòng ngực hiện tại ${chestCm}cm). Hạ tạ chậm 2–3 giây để căng sợi cơ tối đa.`;
      } else if (ex.primaryMuscles.includes('shoulders')) {
        whyRecommendedVi = `Mở rộng bờ vai 3D giúp tỷ lệ Ngực/Eo (${chestToWaist}) trông vạm vỡ hơn rõ rệt.`;
      } else if (ex.primaryMuscles.includes('back')) {
        whyRecommendedVi = `Tạo độ rộng xô chữ V (V-Taper) và bảo vệ cột sống khi nâng tạ nặng.`;
      }

      return {
        exercise: ex,
        suggestedWeightKg,
        suggestedSetsReps,
        whyRecommendedVi,
      };
    });

    // Male Nutrition Calculation (Mifflin-St Jeor Male: 10*W + 6.25*H - 5*A + 5)
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
    const proteinGrams = Math.round(weightKg * (maleGoal === 'lean_abs_cut' ? 2.2 : 2.0));
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
          `3 quả trứng gà nguyên quả + 100g ức gà áp chảo + 2 lát bánh mì nguyên cám (hoặc 1 củ khoai lang vừa) + 1 quả chuối.`,
          `1 tô phở bò tái nạm (nhiều thịt bò ~150g, ít bánh phở nếu đang siết mỡ, không húp hết nước béo) + 1 quả trứng chần.`,
          `60g yến mạch nấu sữa tươi không đường + 1 muỗng Whey Protein + 15g hạnh nhân/óc chó.`,
        ],
      },
      {
        id: 'lunch',
        mealTitleVi: 'Bữa Trưa Xây Dựng Khối Cơ',
        timingVi: '11:30 – 12:30',
        approxKcal: Math.round(targetCaloriesKcal * 0.35),
        macroTagVi: `~${Math.round(proteinGrams * 0.35)}g Đạm • Đủ Carb nuôi cơ`,
        menuOptionsVi: [
          `${maleGoal === 'lean_abs_cut' ? '1 chén' : '2 chén'} cơm trắng/gạo lứt + 180g ức gà (hoặc thăn bò/thăn heo nạc) áp chảo + 1 đĩa bông cải xanh luộc.`,
          `180g cá hồi hoặc cá thu sốt cà + ${maleGoal === 'mass_bulking' ? '2 chén' : '1.5 chén'} cơm + canh rau cải nấu thịt bằm nạc.`,
        ],
      },
      {
        id: 'pre_workout',
        mealTitleVi: 'Bữa Phụ Trước Tập 45–60 Phút (Pre-Workout)',
        timingVi: '16:00 – 17:00',
        approxKcal: Math.round(targetCaloriesKcal * 0.15),
        macroTagVi: 'Bơm máu cơ bắp (Pump) & Chống tụt huyết áp',
        menuOptionsVi: [
          `1–2 quả chuối chín + 1 hộp sữa chua Hy Lạp (hoặc 2 quả trứng luộc) + 1 ly cà phê đen không đường giúp tỉnh táo đẩy tạ.`,
          `1 củ khoai lang nhỏ + 1 muỗng Whey Protein pha 250ml nước lọc.`,
        ],
      },
      {
        id: 'dinner',
        mealTitleVi: 'Bữa Tối Phục Hồi Cơ Bắp Sau Tập (Post-Workout)',
        timingVi: '19:00 – 20:00',
        approxKcal: Math.round(targetCaloriesKcal * 0.25),
        macroTagVi: `~${Math.round(proteinGrams * 0.3)}g Đạm • Hồi phục sợi cơ`,
        menuOptionsVi: [
          `180g ức gà / thăn bò nạc / tôm hấp + ${maleGoal === 'lean_abs_cut' ? '1/2 củ khoai lang' : '1.5 chén cơm'} + salad dầu oliu & dưa leo.`,
          `150g cá áp chảo + 2 lòng trắng trứng + đậu hũ non + rau củ luộc thập cẩm.`,
        ],
      },
    ];

    return {
      gender: 'male',
      goalLabelVi: goalMeta.labelVi,
      headlineVi: `Phác Đồ Nam Giới • ${userProfile.nickname || 'Bro'} (${heightCm}cm • ${weightKg}kg • BMI ${bmi})`,
      bodyAnalysisVi: `Số đo Ngực ${chestCm}cm • Eo ${waistCm}cm (Tỷ lệ V-Taper Ngực/Eo: ${chestToWaist}, chuẩn đẹp nam giới ≥ 1.30) • Bắp tay ${armCm}cm • Năng lượng hôm nay ${energyLevel}/5.`,
      strategySummaryVi,
      recommendedPresetNameVi: foundPreset.name,
      recommendedSplitDays: foundPreset.days,
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
        keyMicronutrientsVi:
          'Creatine Monohydrate (5g/ngày giúp tăng sức mạnh & độ phồng cơ), Kẽm (Zinc), Magie và Vitamin D3 hỗ trợ Testosterone tự nhiên.',
        meals,
        prioritizeFoodsVi: [
          'Ức gà, thăn bò nạc, cá hồi, trứng gà, tôm (Đạm chất lượng cao)',
          'Khoai lang, yến mạch, cơm gạo lứt/trắng, chuối chín (Năng lượng đẩy tạ)',
          'Bông cải xanh, cải bó xôi, bơ, dầu oliu, các loại hạt (Hỗ trợ hormone nam)',
        ],
        avoidFoodsVi: [
          'Rượu bia (Làm giảm tổng hợp Protein cơ bắp và tăng tích mỡ nội tạng bụng)',
          'Đồ chiên ngập dầu, trà sữa, nước ngọt có gas',
          'Thức khuya sau 23h30 (Giảm Hormone tăng trưởng GH và Testosterone)',
        ],
      },
    };
  }

  // ============================================================================
  // FEMALE RECOMMENDATION ENGINE (/gym/nu)
  // ============================================================================
  const femaleGoal = userProfile.primaryGoal || 'glute_sculpt';
  const goalMeta =
    GYM_PRIMARY_GOAL_META[femaleGoal] || GYM_PRIMARY_GOAL_META.glute_sculpt;
  const waistCm = Number(userProfile.waistCm) || 63;
  const hipCm = Number(userProfile.hipCm) || 92;
  const whr = (waistCm / Math.max(55, hipCm)).toFixed(2);
  const cycleStatus = resolveCycleStatus(cycleTracking);

  let targetExerciseIds: string[] = [];
  let presetId = 'female_glute_sculpt_5day';
  let strategySummaryVi = '';

  if (cycleStatus.phase === 'menstrual' || cycleStatus.isDeloadRecommended) {
    presetId = 'female_period_gentle_5day';
    targetExerciseIds = [
      'active_mobility_recovery',
      'hip_abductor_adductor',
      'hip_adductor_inner',
      'seated_leg_curl',
      'chest_supported_row',
      'reverse_pec_deck',
    ];
    strategySummaryVi = `Đang trong ${cycleStatus.phaseTitleVi}: Hệ thống tự động giảm 15–20% mức tạ (Deload), loại bỏ các bài nén ổ bụng/lưng dưới nặng và ưu tiên cô lập mông nhẹ nhàng + mở khớp hông giảm đau mỏi.`;
  } else if (femaleGoal === 'glute_sculpt') {
    presetId = 'female_glute_sculpt_5day';
    targetExerciseIds = [
      'machine_hip_thrust',
      'hip_abductor_adductor',
      'romanian_deadlift',
      'seated_leg_curl',
      'hip_adductor_inner',
      'wide_lat_pulldown',
    ];
    strategySummaryVi =
      'Chiến lược Độ Mông Đào S-Line & Hạn Chế To Đùi Trước: Tập trung cô lập Cơ Mông Lớn & Mông Trên (Hip Thrust, Mở mông, RDL) kết hợp Kéo xô tạo lưng chữ V giúp vòng eo trông nhỏ gọn hơn.';
  } else if (femaleGoal === 'fat_loss') {
    presetId = 'female_glute_sculpt_5day';
    targetExerciseIds = [
      'machine_hip_thrust',
      'leg_press_45',
      'wide_lat_pulldown',
      'chest_supported_row',
      'machine_lateral_raise',
      'core_plank',
    ];
    strategySummaryVi =
      'Chiến lược Đốt Mỡ Toàn Thân & Siết Eo Con Kiến: Kết hợp các bài nhóm cơ lớn thân dưới và lưng giúp đốt Calo tối đa ngay cả sau buổi tập (hiệu ứng EPOC), kết thúc bằng siết cơ bụng sâu.';
  } else {
    presetId = 'female_glute_sculpt_5day';
    targetExerciseIds = [
      'machine_hip_thrust',
      'hip_abductor_adductor',
      'wide_lat_pulldown',
      'reverse_pec_deck',
      'machine_lateral_raise',
      'incline_dumbbell_press',
    ];
    strategySummaryVi =
      'Chiến lược Đường Cong S-Line & Chống Gù Lưng: Mở vai sau, tạo bờ vai mắc áo thanh thoát, nâng đỡ vòng 1 săn chắc và làm đầy vòng 3 tự nhiên.';
  }

  const foundPreset =
    GYM_SPLIT_PRESETS.find((p) => p.id === presetId) || GYM_SPLIT_PRESETS[0];

  const pickedExercises = findExercisesByIds(targetExerciseIds, catalog);
  const recommendedExercises: RecommendedExerciseItem[] = pickedExercises.map((ex) => {
    const baseKg = ex.defaultWeightKg || 15;
    const bodyScale = Math.max(0.7, Math.min(1.3, weightKg / 50));
    const suggestedWeightKg =
      baseKg > 0
        ? roundToHalfKg(
            baseKg * bodyScale * expMultiplier * cycleStatus.loadMultiplier
          )
        : 0;

    const suggestedSetsReps = cycleStatus.isDeloadRecommended
      ? '3 hiệp × 12–15 lần (Nhịp êm, không gồng nén bụng)'
      : '4 hiệp × 12–15 lần (Giữ đỉnh co cơ mông 1 giây)';

    let whyRecommendedVi = ex.benefit;
    if (ex.primaryMuscles.includes('glutes')) {
      whyRecommendedVi = `Tác động trực tiếp vòng 3 (hiện tại ${hipCm}cm) giúp nâng cao mông đào mà không làm to cơ đùi trước.`;
    } else if (ex.primaryMuscles.includes('back')) {
      whyRecommendedVi = `Tạo khung lưng thon chữ V giúp vòng eo ${waistCm}cm trông nhỏ gọn hơn và khắc phục gù lưng công sở.`;
    }

    return {
      exercise: ex,
      suggestedWeightKg,
      suggestedSetsReps,
      whyRecommendedVi,
    };
  });

  // Female Nutrition Calculation (Mifflin-St Jeor Female: 10*W + 6.25*H - 5*A - 161)
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
        `45g yến mạch nấu sữa hạt/sữa tươi không đường + 1 hộp sữa chua Hy Lạp + hạt chia & dâu tây/chuối.`,
      ],
    },
    {
      id: 'lunch',
      mealTitleVi: 'Bữa Trưa Nuôi Cơ Mông & Giữ Eo Thon',
      timingVi: '11:30 – 12:30',
      approxKcal: Math.round(targetCaloriesKcal * 0.35),
      macroTagVi: `~${Math.round(proteinGrams * 0.35)}g Đạm • Tinh bột phức`,
      menuOptionsVi: [
        `1 chén cơm gạo lứt (hoặc 150g khoai lang) + 130g ức gà áp chảo / cá hồi / thăn bò + 1 đĩa rau luộc xanh đậm.`,
        `Bún gạo lứt trộn 130g thịt bò xào ít dầu + nhiều rau sống + 1 quả trứng luộc.`,
      ],
    },
    {
      id: 'pre_workout',
      mealTitleVi: 'Bữa Phụ Trước Tập 45 Phút (Năng Lượng Độ Mông)',
      timingVi: '16:00 – 17:00',
      approxKcal: Math.round(targetCaloriesKcal * 0.15),
      macroTagVi: 'Năng lượng sạch • Không gây đầy bụng',
      menuOptionsVi: [
        `1 quả chuối nhỏ (hoặc 1/2 củ khoai lang) + 1 hộp sữa chua không đường / 15g hạt hạnh nhân.`,
        `Nếu đang Kỳ Dâu / PMS: 1 ly cacao nóng ít đường hoặc 20g socola đen 75% + 1 quả trứng luộc.`,
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
        `Đậu hũ non sốt nấm + 120g thịt nạc thăn/ức gà + canh bí xanh hoặc bông cải luộc.`,
      ],
    },
  ];

  return {
    gender: 'female',
    goalLabelVi: goalMeta.labelVi,
    headlineVi: `Phác Đồ Nữ Giới S-Line • ${userProfile.nickname || 'Challenger'} (${heightCm}cm • ${weightKg}kg • BMI ${bmi})`,
    bodyAnalysisVi: `Số đo Vòng Eo ${waistCm}cm • Vòng Mông ${hipCm}cm (Tỷ lệ Eo/Mông WHR: ${whr}, chuẩn S-Line vàng ≈ 0.68–0.70) • ${cycleStatus.phaseShortVi} (Năng lượng ${energyLevel}/5).`,
    strategySummaryVi,
    recommendedPresetNameVi: foundPreset.name,
    recommendedSplitDays: foundPreset.days,
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
        'Ức gà, cá hồi, tôm, trứng gà, đậu hũ, sữa chua Hy Lạp (Nuôi cơ mông săn chắc)',
        'Khoai lang, yến mạch, gạo lứt, quả bơ, hạt chia (Giữ bụng phẳng, không tích mỡ eo)',
        'Rau bina, bông cải xanh, socola đen 70%, quả mọng (Cân bằng nội tiết & đẹp da)',
      ],
      avoidFoodsVi: [
        'Trà sữa nhiều kem béo, bánh ngọt tinh luyện (Tích mỡ bụng dưới rất nhanh)',
        'Đồ ăn quá mặn, mì gói đêm (Gây giữ nước mặt & đùi, đặc biệt trước kỳ kinh)',
        'Nhịn ăn sáng hoặc cắt sạch tinh bột (Làm rụng tóc, rối loạn kinh nguyệt và mất cơ mông)',
      ],
    },
  };
}
