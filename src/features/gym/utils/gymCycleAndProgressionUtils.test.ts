import { describe, expect, it } from 'vitest';
import { GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
} from './gymStateUtils';
import {
  computeEstimated1RM,
  computePlateBreakdownPerSide,
  computeSessionEnergyStats,
  computeSmartSetRecommendation,
  getGenderDefaultWeightKg,
  resolveCycleStatus,
  resolveGenderReadinessStatus,
  roundToEquipmentStep,
} from './gymCycleAndProgressionUtils';

describe('gymCycleAndProgressionUtils', () => {
  it('recommends deload (-18%) and flags high spinal load during menstrual phase or cramps', () => {
    const cycle = {
      ...createDefaultCycleTracking(),
      manualPhaseOverride: 'menstrual' as const,
      todayEnergyLevel: 2 as const,
      todaySymptoms: ['cramps' as const, 'back_pain' as const],
    };

    const squatEx = GYM_EXERCISE_MAP.barbell_squat;
    const status = resolveCycleStatus(cycle, squatEx);

    expect(status.phase).toBe('menstrual');
    expect(status.isDeloadRecommended).toBe(true);
    expect(status.isHighSpinalLoadWarning).toBe(true);
    expect(status.loadMultiplier).toBeLessThan(1);

    const rec = computeSmartSetRecommendation(
      squatEx,
      {
        exerciseId: squatEx.id,
        weightKg: 30,
        repsNote: '3x10',
        personalTip: '',
        updatedAtMs: 1000,
      },
      status
    );

    expect(rec.adjustmentCause).toBe('deload');
    expect(rec.recommendedWeightKg).toBeLessThan(30);
  });

  it('recommends weight progression during follicular / ovulatory phase when energy is high', () => {
    const cycle = {
      ...createDefaultCycleTracking(),
      manualPhaseOverride: 'ovulatory' as const,
      todayEnergyLevel: 5 as const,
      todaySymptoms: [],
    };

    const hipThrust = GYM_EXERCISE_MAP.machine_hip_thrust;
    const status = resolveCycleStatus(cycle, hipThrust);

    expect(status.phase).toBe('ovulatory');
    expect(status.isDeloadRecommended).toBe(false);

    const rec = computeSmartSetRecommendation(
      hipThrust,
      {
        exerciseId: hipThrust.id,
        weightKg: 40,
        repsNote: '4x12',
        personalTip: '',
        updatedAtMs: 2000,
      },
      status
    );

    expect(rec.adjustmentCause).toBe('progression');
    expect(rec.recommendedWeightKg).toBe(42.5);
  });

  it('calculates session trained minutes, calories burned, and completion percentage accurately', () => {
    const profile = {
      ...createDefaultFemaleBodyProfile(),
      weightKg: 52,
    };
    const exercises = [
      GYM_EXERCISE_MAP.machine_hip_thrust,
      GYM_EXERCISE_MAP.hip_abductor_adductor,
      GYM_EXERCISE_MAP.romanian_deadlift,
      GYM_EXERCISE_MAP.seated_leg_curl,
    ];

    const stats = computeSessionEnergyStats(
      exercises,
      [exercises[0].id, exercises[1].id],
      profile
    );

    expect(stats.completionPercent).toBe(50);
    expect(stats.trainedMinutesToday).toBe(12);
    expect(stats.estimatedTotalKcal).toBeGreaterThan(100);
  });

  it('provides realistic female starting weights, dumbbell step rounding, Plate Calculator, and Male readiness isolation', () => {
    const dbPress = GYM_EXERCISE_MAP.incline_dumbbell_press;
    const latRaise = GYM_EXERCISE_MAP.side_lateral_raise;

    expect(getGenderDefaultWeightKg(dbPress, 'female')).toBe(4);
    expect(getGenderDefaultWeightKg(dbPress, 'male')).toBe(16);
    expect(getGenderDefaultWeightKg(latRaise, 'female')).toBe(2);

    // Dumbbells <= 10kg round to 1kg; > 10kg round to 2kg
    expect(roundToEquipmentStep(4.4, dbPress)).toBe(4);
    expect(roundToEquipmentStep(15.1, dbPress)).toBe(16);

    // Plate Calculator per side: 37.5kg = 20 + 10 + 5 + 2.5
    const plates = computePlateBreakdownPerSide(37.5);
    expect(plates.achievedKg).toBe(37.5);
    expect(plates.summaryVi).toBe('1×20kg + 1×10kg + 1×5kg + 1×2.5kg');

    // Epley 1RM: 60kg x 10 reps = 80kg
    expect(computeEstimated1RM(60, 10)).toBe(80);

    // Male readiness NEVER leaks menstrual phase even if cycleTracking says menstrual
    const cycleInPeriod = {
      ...createDefaultCycleTracking(),
      manualPhaseOverride: 'menstrual' as const,
    };
    const maleStatus = resolveGenderReadinessStatus(
      'male',
      {
        ...createDefaultFemaleBodyProfile(),
        gender: 'male',
        maleEnergyLevel: 2,
        shoulderSafe: true,
      },
      cycleInPeriod,
      GYM_EXERCISE_MAP.barbell_bench_press
    );
    expect(maleStatus.isMaleMode).toBe(true);
    expect(maleStatus.phaseTitleVi).not.toContain('Kỳ Dâu');
    expect(maleStatus.isDeloadRecommended).toBe(true);
    expect(maleStatus.isHighSpinalLoadWarning).toBe(true);
  });
});
