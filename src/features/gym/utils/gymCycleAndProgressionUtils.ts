import type {
  GymCyclePhase,
  GymCycleTrackingState,
  GymExerciseDefinition,
  GymExerciseUserLog,
  GymFemaleBodyProfile,
  GymPrimaryGoal,
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

function roundToHalfKg(val: number): number {
  return Math.max(0, Math.round(val * 2) / 2);
}

/**
 * Resolves the user's current menstrual cycle phase, day of cycle, deload multiplier,
 * and coaching guidance (clean-room implementation inspired by musclog-app cycle utils).
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
 * Computes smart weight progression / deload / repeat recommendation for an exercise
 * based on user's saved log and current cycle/energy status.
 */
export function computeSmartSetRecommendation(
  exercise: GymExerciseDefinition,
  savedLog: GymExerciseUserLog | undefined,
  cycleStatus: ResolvedCycleStatus
): SmartSetRecommendation {
  const baseWeightKg = savedLog?.weightKg ?? exercise.defaultWeightKg;

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
    const deloaded = roundToHalfKg(Math.max(2.5, baseWeightKg * cycleStatus.loadMultiplier));
    return {
      recommendedWeightKg: deloaded,
      baseWeightKg,
      adjustmentCause: 'deload',
      badgeTextVi: `Deload gợi ý: ${deloaded}kg`,
      reasonVi: `Giảm nhẹ từ ${baseWeightKg}kg xuống ${deloaded}kg để phù hợp thể trạng & chu kỳ hôm nay.`,
    };
  }

  if (savedLog && cycleStatus.loadMultiplier > 1) {
    const step = baseWeightKg >= 25 ? 2.5 : 1.5;
    const progressed = roundToHalfKg(baseWeightKg + step);
    return {
      recommendedWeightKg: progressed,
      baseWeightKg,
      adjustmentCause: 'progression',
      badgeTextVi: `Thử lên: ${progressed}kg`,
      reasonVi: `Buổi trước đã tập ${baseWeightKg}kg tốt • Pha ${cycleStatus.phaseShortVi} thuận lợi để tăng nhẹ mức tạ.`,
    };
  }

  return {
    recommendedWeightKg: baseWeightKg,
    baseWeightKg,
    adjustmentCause: 'repeat',
    badgeTextKgText: `${baseWeightKg}kg`,
    badgeTextVi: `Duy trì: ${baseWeightKg}kg`,
    reasonVi: `Giữ mức tạ chuẩn ${baseWeightKg}kg, kiểm soát nhịp hạ tạ 2–3 giây để ăn sâu vào cơ mục tiêu.`,
  } as SmartSetRecommendation;
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

  const weightFactor = Math.max(40, Math.min(110, profile.weightKg || 50)) / 52;
  const estimatedMinutes = totalCount * 6;
  const trainedMinutesToday =
    doneCount > 0 ? doneCount * 6 : Math.min(12, estimatedMinutes);

  const kcalPerExercise = Math.round(38 * weightFactor);
  const estimatedTotalKcal = totalCount * kcalPerExercise;
  const burnedKcalToday = doneCount * kcalPerExercise;
  const completionPercent = Math.round((doneCount / totalCount) * 100);

  const activeKcal = burnedKcalToday > 0 ? burnedKcalToday : estimatedTotalKcal;
  let funEquivalenceVi = '≈ 1 quả táo & 1 hộp sữa chua Hy Lạp';
  if (activeKcal >= 260) {
    funEquivalenceVi = '≈ 1 ly trà sữa ít đường size M';
  } else if (activeKcal >= 160) {
    funEquivalenceVi = '≈ 1 chiếc bánh croissant bơ';
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
