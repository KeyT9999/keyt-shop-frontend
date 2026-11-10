import type {
  GymCyclePhase,
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymGenderMode,
  GymPrimaryGoal,
  GymSetDetailItem,
  GymSymptomCode,
} from '../types/gym';

export interface ResolvedCycleStatus {
  phase: GymCyclePhase;
  phaseTitleVi: string;
  phaseShortVi: string;
  dayOfCycle: number;
  daysUntilNextPeriod: number;
  energyPercent: number;
  loadMultiplier: number;
  coachingBannerVi: string;
  nutritionTipVi: string;
  isDeloadRecommended: boolean;
  isHighSpinalLoadWarning: boolean;
  isMaleMode?: boolean;
}

export interface SmartSetRecommendation {
  recommendedWeightKg: number;
  baseWeightKg: number;
  adjustmentCause: 'progression' | 'deload' | 'repeat';
  badgeTextVi: string;
  reasonVi: string;
}

export interface SessionEnergyStats {
  estimatedMinutes: number;
  trainedMinutesToday: number;
  estimatedTotalKcal: number;
  burnedKcalToday: number;
  completionPercent: number;
  funEquivalenceVi: string;
}

export interface PlateBreakdownResult {
  targetPerSideKg: number;
  achievedKg: number;
  remainderKg: number;
  plates: Array<{ weightKg: number; count: number }>;
  summaryVi: string;
}

export const GYM_PRIMARY_GOAL_META: Record<
  GymPrimaryGoal,
  { labelVi: string; shortVi: string; descVi: string }
> = {
  glute_sculpt: {
    labelVi: 'Độ Mông Đào • Hạn Chế To Đùi Trước',
    shortVi: 'Glute Sculpt',
    descVi: 'Tập trung làm đầy cơ mông trên & mông lớn, cô lập hông, giảm tải cơ đùi trước.',
  },
  fat_loss: {
    labelVi: 'Đốt Mỡ Siết Eo • Săn Chắc Toàn Thân',
    shortVi: 'Fat Loss & Core',
    descVi: 'Tăng mật độ vận động, đốt Calo cao, kết hợp siết cơ bụng sâu và mở vai.',
  },
  toned_curves: {
    labelVi: 'Đường Cong S-Line & Chống Gù Lưng',
    shortVi: 'S-Line Curves',
    descVi: 'Cân bằng lưng V-taper, vai thon mắc áo và vòng 3 săn chắc tự nhiên.',
  },
  strength_health: {
    labelVi: 'Tăng Thể Lực & Cân Bằng Nội Tiết',
    shortVi: 'Strength & Flow',
    descVi: 'Rèn luyện sức mạnh nền tảng, bảo vệ xương khớp và cải thiện giấc ngủ.',
  },
};

export const GYM_SYMPTOM_META: Record<GymSymptomCode, { labelVi: string }> = {
  cramps: { labelVi: 'Đau bụng dưới' },
  back_pain: { labelVi: 'Mỏi lưng dưới' },
  bloating: { labelVi: 'Đầy hơi / Giữ nước' },
  fatigue: { labelVi: 'Uể oải / Nhanh mệt' },
  headache: { labelVi: 'Đau đầu nhẹ' },
  cravings: { labelVi: 'Thèm đồ ngọt' },
  low_mood: { labelVi: 'Tụt mood / Nhạy cảm' },
};

const HIGH_AXIAL_OR_ABDOMINAL_EXERCISE_IDS = new Set([
  'super_squat_machine',
  'barbell_squat',
  'leg_press_45',
  'romanian_deadlift',
  'back_extension_45',
]);

const HIGH_SHOULDER_STRESS_EXERCISE_IDS = new Set([
  'barbell_bench_press',
  'assisted_chest_dip',
  'assisted_tricep_dip',
  'smith_shoulder_press',
  'bench_dips',
]);

/**
 * Rounds weight cleanly to real gym equipment increments:
 * - Dumbbells (`kg / quả`): 1kg steps up to 10kg, 2kg steps above 10kg
 * - Cables / Plates / Machines: 2.5kg steps (or exercise.equipmentStepKg)
 */
export function roundToEquipmentStep(
  val: number,
  exercise?: GymExerciseDefinition
): number {
  if (!Number.isFinite(val) || val <= 0) return 0;

  if (exercise && /quả/i.test(exercise.weightUnitLabel)) {
    if (val <= 10) {
      return Math.max(1, Math.round(val));
    }
    return Math.max(10, Math.round(val / 2) * 2);
  }

  const step = exercise?.equipmentStepKg && exercise.equipmentStepKg > 0
    ? Math.min(2.5, exercise.equipmentStepKg)
    : 2.5;
  return Math.max(step, Math.round(val / step) * step);
}

/**
 * Returns the realistic default starting weight for a given exercise & gender.
 */
export function getGenderDefaultWeightKg(
  exercise: GymExerciseDefinition,
  gender: GymGenderMode
): number {
  if (exercise.defaultWeightKg <= 0) return 0;
  if (gender === 'female') {
    return (
      exercise.defaultFemaleWeightKg ??
      roundToEquipmentStep(exercise.defaultWeightKg * 0.45, exercise)
    );
  }
  return exercise.defaultWeightKg;
}

/**
 * Epley 1-Rep Max estimator (accurate for 1–15 rep hypertrophy sets).
 */
export function computeEstimated1RM(weightKg: number, reps = 10): number {
  const w = Number(weightKg) || 0;
  if (w <= 0) return 0;
  const r = Math.max(1, Math.min(20, Number(reps) || 10));
  if (r <= 1) return Math.round(w * 10) / 10;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

/**
 * Computes optimal plate stack for 1 side of a barbell / plate-loaded BRTW machine
 * using standard commercial gym plates (20kg, 10kg, 5kg, 2.5kg, 1.25kg).
 */
export function computePlateBreakdownPerSide(targetPerSideKg: number): PlateBreakdownResult {
  const cleanTarget = Math.max(0, Math.round(targetPerSideKg * 100) / 100);
  if (cleanTarget <= 0) {
    return {
      targetPerSideKg: 0,
      achievedKg: 0,
      remainderKg: 0,
      plates: [],
      summaryVi: 'Chưa lắp tạ bánh',
    };
  }

  const denominations = [20, 10, 5, 2.5, 1.25];
  let remaining = cleanTarget;
  const plates: Array<{ weightKg: number; count: number }> = [];

  for (const denom of denominations) {
    if (remaining + 0.001 >= denom) {
      const count = Math.floor((remaining + 0.001) / denom);
      if (count > 0) {
        plates.push({ weightKg: denom, count });
        remaining = Math.max(0, Math.round((remaining - count * denom) * 100) / 100);
      }
    }
  }

  const achievedKg = Math.round((cleanTarget - remaining) * 100) / 100;
  const summaryVi =
    plates.length > 0
      ? plates.map((p) => `${p.count}×${p.weightKg}kg`).join(' + ')
      : 'Tạ nhẹ < 1.25kg';

  return {
    targetPerSideKg: cleanTarget,
    achievedKg,
    remainderKg: remaining,
    plates,
    summaryVi,
  };
}

/**
 * Builds interactive Set-by-Set tracking items (optional Warm-up + Working Sets)
 * for 1-handed checkoff at the gym.
 */
export function buildDefaultSetsForExercise(
  exercise: GymExerciseDefinition,
  workingWeightKg: number,
  includeWarmup = false
): GymSetDetailItem[] {
  const setMatch = exercise.sets.match(/(\d+)/g);
  const workingSetCount = setMatch
    ? Math.max(2, Math.min(5, Number(setMatch[setMatch.length - 1]) || 3))
    : 3;

  const repMatch = exercise.reps.match(/(\d+)/g);
  const targetReps = repMatch
    ? Math.max(5, Math.min(25, Number(repMatch[repMatch.length - 1]) || 12))
    : 12;

  const list: GymSetDetailItem[] = [];
  if (includeWarmup && workingWeightKg > 0) {
    const warmupWeight = roundToEquipmentStep(workingWeightKg * 0.5, exercise);
    list.push({
      setNumber: 0,
      weightKg: warmupWeight,
      reps: 12,
      isWarmup: true,
      completed: false,
    });
  }

  for (let i = 1; i <= workingSetCount; i++) {
    list.push({
      setNumber: i,
      weightKg: workingWeightKg,
      reps: targetReps,
      isWarmup: false,
      completed: false,
    });
  }

  return list;
}

/**
 * Resolves Male Readiness & Joint Safety status WITHOUT any menstrual cycle logic!
 */
export function resolveMaleReadinessStatus(
  profile: Partial<GymFemaleBodyProfile>,
  currentExercise?: GymExerciseDefinition
): ResolvedCycleStatus {
  const energy = Math.max(1, Math.min(5, Number(profile.maleEnergyLevel) || 4));
  const isLowEnergy = energy <= 2;

  const isBackWarning = Boolean(
    currentExercise &&
      profile.protectLowerBackKnee &&
      HIGH_AXIAL_OR_ABDOMINAL_EXERCISE_IDS.has(currentExercise.id)
  );
  const isShoulderWarning = Boolean(
    currentExercise &&
      profile.shoulderSafe &&
      HIGH_SHOULDER_STRESS_EXERCISE_IDS.has(currentExercise.id)
  );
  const isHighSpinalLoadWarning = isBackWarning || isShoulderWarning;

  if (isLowEnergy) {
    return {
      phase: 'luteal',
      phaseTitleVi: 'Điều Tiết Tải (Thiếu Ngủ / Hơi Mỏi)',
      phaseShortVi: 'Giảm Tải 10% • Giữ Khớp',
      dayOfCycle: 0,
      daysUntilNextPeriod: 0,
      energyPercent: energy * 22,
      loadMultiplier: 0.9,
      coachingBannerVi:
        'Hôm nay mức sung sức thấp: Hệ thống tự động giảm ~10% mức tạ gợi ý, giữ 2 reps dự trữ (RIR 2) và ưu tiên máy dẫn hướng an toàn khớp.',
      nutritionTipVi:
        'Uống 300ml nước + 1 quả chuối trước tập 30 phút; tối nay ưu tiên ngủ đủ 7.5–8 tiếng để phục hồi Testosterone.',
      isDeloadRecommended: true,
      isHighSpinalLoadWarning,
      isMaleMode: true,
    };
  }

  if (energy === 5) {
    return {
      phase: 'ovulatory',
      phaseTitleVi: 'Đỉnh Phong Độ • Sẵn Sàng Phá PR',
      phaseShortVi: 'Đỉnh Sung Sức • PR',
      dayOfCycle: 0,
      daysUntilNextPeriod: 0,
      energyPercent: 100,
      loadMultiplier: 1.05,
      coachingBannerVi:
        'Thể lực đạt 5/5! Hãy khởi động kỹ 1–2 hiệp nhẹ ở bài đầu rồi tự tin tăng +2kg đến +2.5kg để bứt phá kỷ lục cá nhân (PR).',
      nutritionTipVi:
        'Nạp đủ Tinh bột hấp thu nhanh + 35–40g Protein ngay sau tập để tối đa hóa tổng hợp cơ bắp.',
      isDeloadRecommended: false,
      isHighSpinalLoadWarning,
      isMaleMode: true,
    };
  }

  return {
    phase: 'follicular',
    phaseTitleVi: 'Phong Độ Ổn Định • Tăng Tiến Đều',
    phaseShortVi: 'Sẵn Sàng Tập Nặng',
    dayOfCycle: 0,
    daysUntilNextPeriod: 0,
    energyPercent: energy === 4 ? 88 : 74,
    loadMultiplier: energy === 4 ? 1.02 : 1.0,
    coachingBannerVi:
      'Thể trạng tốt: Tập trung kiểm soát nhịp hạ tạ chậm 2–3 giây, siết đỉnh 1 giây và nghỉ 75–90 giây giữa các hiệp.',
    nutritionTipVi:
      'Chia đều lượng Đạm (Protein) thành 4 bữa và uống đủ 2.5–3 lít nước xuyên suốt ngày.',
    isDeloadRecommended: false,
    isHighSpinalLoadWarning,
    isMaleMode: true,
  };
}

/**
 * Resolves the female user's current menstrual cycle phase, day of cycle, deload multiplier,
 * and coaching guidance.
 */
export function resolveCycleStatus(
  cycle: GymCycleTrackingState,
  currentExercise?: GymExerciseDefinition,
  todayIso = new Date().toISOString().slice(0, 10)
): ResolvedCycleStatus {
  const cycleLen = Math.max(15, Math.min(60, cycle.cycleLengthDays || 28));
  const periodLen = Math.max(2, Math.min(12, cycle.periodDurationDays || 5));

  let dayOfCycle = 10;
  if (cycle.lastPeriodStartDate) {
    const startMs = Date.parse(`${cycle.lastPeriodStartDate}T00:00:00`);
    const todayMs = Date.parse(`${todayIso}T00:00:00`);
    if (Number.isFinite(startMs) && Number.isFinite(todayMs) && todayMs >= startMs) {
      const diffDays = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));
      dayOfCycle = (diffDays % cycleLen) + 1;
    }
  }

  let phase: GymCyclePhase = 'follicular';
  if (cycle.manualPhaseOverride && cycle.manualPhaseOverride !== 'auto') {
    phase = cycle.manualPhaseOverride;
    if (phase === 'menstrual') dayOfCycle = Math.min(dayOfCycle, periodLen);
    if (phase === 'ovulatory') dayOfCycle = Math.round(cycleLen - 14);
    if (phase === 'luteal') dayOfCycle = Math.max(cycleLen - 7, 21);
  } else {
    const ovulationCenter = Math.max(periodLen + 3, cycleLen - 14);
    if (dayOfCycle <= periodLen) {
      phase = 'menstrual';
    } else if (dayOfCycle < ovulationCenter - 1) {
      phase = 'follicular';
    } else if (dayOfCycle <= ovulationCenter + 1) {
      phase = 'ovulatory';
    } else {
      phase = 'luteal';
    }
  }

  const daysUntilNextPeriod = Math.max(1, cycleLen - dayOfCycle + 1);
  const hasPainSymptom =
    cycle.todaySymptoms.includes('cramps') ||
    cycle.todaySymptoms.includes('back_pain') ||
    cycle.todaySymptoms.includes('fatigue');

  const isLowEnergy = cycle.todayEnergyLevel <= 2;
  const isDeloadRecommended =
    phase === 'menstrual' || isLowEnergy || hasPainSymptom;

  const isHighSpinalLoadWarning = Boolean(
    currentExercise &&
      isDeloadRecommended &&
      HIGH_AXIAL_OR_ABDOMINAL_EXERCISE_IDS.has(currentExercise.id)
  );

  if (phase === 'menstrual') {
    return {
      phase,
      phaseTitleVi: 'Pha Hành Kinh (Kỳ Dâu)',
      phaseShortVi: 'Kỳ Dâu • Deload',
      dayOfCycle,
      daysUntilNextPeriod,
      energyPercent: Math.min(65, cycle.todayEnergyLevel * 15),
      loadMultiplier: 0.82,
      coachingBannerVi:
        'Cơ thể đang trong Kỳ Dâu: Tự động giảm ~15–20% mức tạ gợi ý. Ưu tiên cô lập cơ mông nhẹ nhàng (Hip Abductor / Hip Thrust nhẹ) và tránh gồng nén bụng quá gắt.',
      nutritionTipVi:
        'Bổ sung thực phẩm giàu Sắt & Magie (thịt bò nạc, rau bina, socola đen 70%) và uống nước ấm.',
      isDeloadRecommended: true,
      isHighSpinalLoadWarning,
    };
  }

  if (phase === 'ovulatory') {
    return {
      phase,
      phaseTitleVi: 'Pha Rụng Trứng (Đỉnh Sức Mạnh)',
      phaseShortVi: 'Đỉnh Sức Mạnh',
      dayOfCycle,
      daysUntilNextPeriod,
      energyPercent: isLowEnergy ? 70 : 100,
      loadMultiplier: isDeloadRecommended ? 0.9 : 1.05,
      coachingBannerVi: isDeloadRecommended
        ? 'Đang ở pha Rụng trứng nhưng hôm nay cơ thể hơi mỏi: Giữ mức tạ vừa sức và tập trung cảm nhận cơ.'
        : 'Estrogen đạt đỉnh giúp bạn khỏe nhất tháng! Hãy tự tin tăng nhẹ +2.5kg ở bài chủ lực nhưng nhớ khởi động kỹ khớp gối.',
      nutritionTipVi:
        'Tăng cường Protein (ức gà, cá hồi, trứng) và chất chống oxy hóa để phục hồi cơ nhanh.',
      isDeloadRecommended,
      isHighSpinalLoadWarning,
    };
  }

  if (phase === 'luteal') {
    return {
      phase,
      phaseTitleVi: 'Pha Hoàng Thể (Trước Kỳ / PMS)',
      phaseShortVi: 'Pha Hoàng Thể',
      dayOfCycle,
      daysUntilNextPeriod,
      energyPercent: isLowEnergy ? 55 : 78,
      loadMultiplier: isDeloadRecommended ? 0.85 : 0.95,
      coachingBannerVi:
        'Giai đoạn gần kỳ kinh cơ thể dễ giữ nước và nhanh mỏi hơn: Hãy duy trì mức tạ vừa phải (12–15 reps), nghỉ đủ 90s và không cần ép tạ quá nặng.',
      nutritionTipVi:
        'Giảm ăn mặn để đỡ tích nước, chia nhỏ bữa ăn với tinh bột hấp thu chậm (khoai lang, yến mạch) để giảm thèm ngọt.',
      isDeloadRecommended,
      isHighSpinalLoadWarning,
    };
  }

  return {
    phase: 'follicular',
    phaseTitleVi: 'Pha Nang Trứng (Năng Lượng Cao)',
    phaseShortVi: 'Nang Trứng • Sung Sức',
    dayOfCycle,
    daysUntilNextPeriod,
    energyPercent: isLowEnergy ? 68 : 92,
    loadMultiplier: isDeloadRecommended ? 0.88 : 1.05,
    coachingBannerVi: isDeloadRecommended
      ? 'Hôm nay năng lượng hơi thấp: Tập chậm rãi đúng kỹ thuật, ưu tiên kết nối thần kinh - cơ.'
      : 'Thời điểm vàng của chu kỳ để độ mông & tăng cơ! Cơ thể nhạy Insulin và phục hồi cực tốt.',
    nutritionTipVi:
      'Nạp đủ Carb tốt + Protein trước và sau buổi tập 60 phút để tối ưu phát triển vòng 3.',
    isDeloadRecommended,
    isHighSpinalLoadWarning,
  };
}

/**
 * Gender-aware dispatcher: returns Male Readiness status on `/gym/nam`
 * and Menstrual Cycle status on `/gym/nu`.
 */
export function resolveGenderReadinessStatus(
  gender: GymGenderMode,
  profile: Partial<GymFemaleBodyProfile>,
  cycle: GymCycleTrackingState,
  currentExercise?: GymExerciseDefinition
): ResolvedCycleStatus {
  if (gender === 'male') {
    return resolveMaleReadinessStatus(profile, currentExercise);
  }
  return resolveCycleStatus(cycle, currentExercise);
}

/**
 * Computes smart weight progression / deload / repeat recommendation for an exercise
 * based on user's saved log, gender default weight, and current readiness/cycle status.
 */
export function computeSmartSetRecommendation(
  exercise: GymExerciseDefinition,
  savedLog: GymExerciseUserLog | undefined,
  cycleStatus: ResolvedCycleStatus,
  gender: GymGenderMode = cycleStatus.isMaleMode ? 'male' : 'female'
): SmartSetRecommendation {
  const baseWeightKg =
    savedLog?.weightKg ?? getGenderDefaultWeightKg(exercise, gender);

  if (baseWeightKg <= 0) {
    return {
      recommendedWeightKg: 0,
      baseWeightKg: 0,
      adjustmentCause: 'repeat',
      badgeTextVi: 'Trọng lượng cơ thể',
      reasonVi: 'Tập trung nhịp thở và biên độ giãn cơ tối đa.',
    };
  }

  if (cycleStatus.isDeloadRecommended) {
    const deloaded = roundToEquipmentStep(
      baseWeightKg * cycleStatus.loadMultiplier,
      exercise
    );
    const reasonLabel = cycleStatus.isMaleMode
      ? `Giảm nhẹ từ ${baseWeightKg}kg xuống ${deloaded}kg để bảo vệ khớp khi năng lượng thấp.`
      : `Giảm nhẹ từ ${baseWeightKg}kg xuống ${deloaded}kg để phù hợp thể trạng & chu kỳ hôm nay.`;
    return {
      recommendedWeightKg: deloaded,
      baseWeightKg,
      adjustmentCause: 'deload',
      badgeTextVi: `Deload gợi ý: ${deloaded}kg`,
      reasonVi: reasonLabel,
    };
  }

  if (savedLog && cycleStatus.loadMultiplier > 1) {
    const isDumbbell = /quả/i.test(exercise.weightUnitLabel);
    const step = isDumbbell
      ? baseWeightKg < 10
        ? 1
        : 2
      : 2.5;
    const progressed = roundToEquipmentStep(baseWeightKg + step, exercise);
    const reasonVi = cycleStatus.isMaleMode
      ? `Buổi trước đã tập ${baseWeightKg}kg tốt • Hôm nay sung sức, hãy thử lên ${progressed}kg!`
      : `Buổi trước đã tập ${baseWeightKg}kg tốt • Pha ${cycleStatus.phaseShortVi} thuận lợi để tăng nhẹ mức tạ.`;

    return {
      recommendedWeightKg: progressed,
      baseWeightKg,
      adjustmentCause: 'progression',
      badgeTextVi: `Thử lên: ${progressed}kg`,
      reasonVi,
    };
  }

  return {
    recommendedWeightKg: baseWeightKg,
    baseWeightKg,
    adjustmentCause: 'repeat',
    badgeTextVi: `Duy trì: ${baseWeightKg}kg`,
    reasonVi: `Giữ mức tạ chuẩn ${baseWeightKg}kg, kiểm soát nhịp hạ tạ 2–3 giây để ăn sâu vào cơ mục tiêu.`,
  };
}

/**
 * Estimates workout duration (minutes) and calories burned based on user's body weight
 * and completed exercises in the active split day.
 */
export function computeSessionEnergyStats(
  dayExercises: GymExerciseDefinition[],
  completedIdsToday: string[],
  profile: GymFemaleBodyProfile
): SessionEnergyStats {
  const totalCount = Math.max(1, dayExercises.length);
  const doneCount = dayExercises.filter((e) =>
    completedIdsToday.includes(e.id)
  ).length;

  const weightFactor = Math.max(40, Math.min(115, profile.weightKg || 50)) / 52;
  const estimatedMinutes = totalCount * 6;
  const trainedMinutesToday =
    doneCount > 0 ? doneCount * 6 : Math.min(12, estimatedMinutes);

  const kcalPerExercise = Math.round(38 * weightFactor);
  const estimatedTotalKcal = totalCount * kcalPerExercise;
  const burnedKcalToday = doneCount * kcalPerExercise;
  const completionPercent = Math.round((doneCount / totalCount) * 100);

  const activeKcal = burnedKcalToday > 0 ? burnedKcalToday : estimatedTotalKcal;
  const isMale = profile.gender === 'male';

  let funEquivalenceVi = isMale
    ? '≈ 2 quả trứng gà & 1 quả chuối'
    : '≈ 1 quả táo & 1 hộp sữa chua Hy Lạp';
  if (activeKcal >= 260) {
    funEquivalenceVi = isMale
      ? '≈ 1.5 chén cơm trắng đầy hoặc 1 tô phở nhỏ'
      : '≈ 1 ly trà sữa ít đường size M';
  } else if (activeKcal >= 160) {
    funEquivalenceVi = isMale
      ? '≈ 1 ổ bánh mì thịt nướng vừa'
      : '≈ 1 chiếc bánh croissant bơ';
  }

  return {
    estimatedMinutes,
    trainedMinutesToday,
    estimatedTotalKcal,
    burnedKcalToday,
    completionPercent,
    funEquivalenceVi,
  };
}
