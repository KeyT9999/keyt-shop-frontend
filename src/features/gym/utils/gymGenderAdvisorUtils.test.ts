import { describe, expect, it } from 'vitest';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
} from './gymStateUtils';
import { generateGenderWorkoutAndNutritionPlan } from './gymGenderAdvisorUtils';

describe('gymGenderAdvisorUtils', () => {
  it('generates male chest/shoulder 3D workout & high-protein nutrition plan for /gym/nam', () => {
    const profile = {
      ...createDefaultFemaleBodyProfile(),
      gender: 'male' as const,
      nickname: 'Minh Tuấn',
      heightCm: 175,
      weightKg: 70,
      chestCm: 100,
      waistCm: 76,
      armCm: 37,
      workoutsPerWeek: 4,
      maleGoal: 'chest_shoulder_3d' as const,
    };
    const cycle = createDefaultCycleTracking();

    const plan = generateGenderWorkoutAndNutritionPlan({
      gender: 'male',
      userProfile: profile,
      cycleTracking: cycle,
    });

    expect(plan.gender).toBe('male');
    expect(plan.headlineVi).toContain('Minh Tuấn');
    expect(plan.bodyAnalysisVi).toContain('Ngực 100cm');
    expect(plan.recommendedExercises.length).toBeGreaterThanOrEqual(5);
    expect(
      plan.recommendedExercises.some((item) =>
        item.exercise.primaryMuscles.includes('chest')
      )
    ).toBe(true);
    expect(plan.nutritionPlan.proteinGrams).toBe(140);
    expect(plan.nutritionPlan.meals).toHaveLength(4);
  });

  it('generates female glute-sculpt workout & cycle-aware nutrition plan for /gym/nu', () => {
    const profile = {
      ...createDefaultFemaleBodyProfile(),
      gender: 'female' as const,
      nickname: 'Quỳnh Anh',
      heightCm: 162,
      weightKg: 50,
      waistCm: 62,
      hipCm: 93,
      primaryGoal: 'glute_sculpt' as const,
    };
    const cycle = {
      ...createDefaultCycleTracking(),
      manualPhaseOverride: 'follicular' as const,
      todayEnergyLevel: 4 as const,
    };

    const plan = generateGenderWorkoutAndNutritionPlan({
      gender: 'female',
      userProfile: profile,
      cycleTracking: cycle,
    });

    expect(plan.gender).toBe('female');
    expect(plan.headlineVi).toContain('Quỳnh Anh');
    expect(plan.bodyAnalysisVi).toContain('Vòng Eo 62cm • Vòng Mông 93cm');
    expect(
      plan.recommendedExercises.some(
        (item) => item.exercise.id === 'machine_hip_thrust'
      )
    ).toBe(true);
    expect(plan.nutritionPlan.proteinGrams).toBe(90);
    expect(plan.nutritionPlan.meals).toHaveLength(4);
  });

  it('switches female workout recommendation to gentle deload during menstrual phase', () => {
    const profile = createDefaultFemaleBodyProfile();
    const cycle = {
      ...createDefaultCycleTracking(),
      manualPhaseOverride: 'menstrual' as const,
      todayEnergyLevel: 2 as const,
    };

    const plan = generateGenderWorkoutAndNutritionPlan({
      gender: 'female',
      userProfile: profile,
      cycleTracking: cycle,
    });

    expect(plan.strategySummaryVi).toContain('Deload');
    expect(
      plan.recommendedExercises.some(
        (item) => item.exercise.id === 'active_mobility_recovery'
      )
    ).toBe(true);
    expect(plan.nutritionPlan.keyMicronutrientsVi).toContain('Kỳ Dâu');
  });
});
