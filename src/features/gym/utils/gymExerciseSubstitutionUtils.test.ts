import { describe, expect, it } from 'vitest';
import { GYM_EXERCISE_CATALOG, GYM_EXERCISE_MAP } from '../data/defaultGymCatalog';
import { rankExerciseSubstitutes } from './gymExerciseSubstitutionUtils';

describe('gymExerciseSubstitutionUtils (0-cost Smart Substitution)', () => {
  it('ranks glute-focused, quad-sparing exercises highest when replacing heavy squat for women', () => {
    const target = GYM_EXERCISE_MAP.barbell_squat;

    const ranked = rankExerciseSubstitutes(target, GYM_EXERCISE_CATALOG, {
      userProfile: {
        avoidHeavyQuads: true,
        protectLowerBackKnee: true,
      },
      isDeloadOrPeriod: true,
      limit: 4,
    });

    expect(ranked.length).toBeGreaterThan(0);
    // Should include glute/lower-body safe movements like machine_hip_thrust or hip_abductor_adductor
    const topIds = ranked.map((r) => r.exercise.id);
    expect(topIds).toContain('machine_hip_thrust');
    expect(topIds).not.toContain('barbell_squat');
  });

  it('excludes exercises flagged as injury or busy machine', () => {
    const target = GYM_EXERCISE_MAP.machine_hip_thrust;

    const ranked = rankExerciseSubstitutes(target, GYM_EXERCISE_CATALOG, {
      restrictions: [
        {
          exerciseId: 'hip_abductor_adductor',
          kind: 'busy',
          updatedAtMs: 1000,
        },
        {
          exerciseId: 'romanian_deadlift',
          kind: 'injury',
          updatedAtMs: 1000,
        },
      ],
      limit: 5,
    });

    const ids = ranked.map((r) => r.exercise.id);
    expect(ids).not.toContain('hip_abductor_adductor');
    expect(ids).not.toContain('romanian_deadlift');
  });
});
