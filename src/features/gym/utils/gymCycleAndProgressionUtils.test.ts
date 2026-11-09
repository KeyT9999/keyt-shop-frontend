import { describe, expect, it } from 'vitest';
import { GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
} from './gymStateUtils';
import {
  computeSessionEnergyStats,
  computeSmartSetRecommendation,
  resolveCycleStatus,
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
});
