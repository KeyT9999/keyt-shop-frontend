import type {
  GymExerciseDefinition,
  GymExerciseRestriction,
  GymFemaleBodyProfile,
  GymGenderMode,
} from '../types/gym';

export interface RankedExerciseSubstitute {
  exercise: GymExerciseDefinition;
  score: number;
  reasonBadgesVi: string[];
}

const LOW_BACK_HEAVY_IDS = new Set([
  'barbell_squat',
  'super_squat_machine',
  'romanian_deadlift',
  'back_extension_45',
]);

const SHOULDER_STRESS_IDS = new Set([
  'barbell_bench_press',
  'assisted_chest_dip',
  'assisted_tricep_dip',
  'smith_shoulder_press',
  'bench_dips',
]);

const GLUTE_ISOLATION_FAVORITE_IDS = new Set([
  'machine_hip_thrust',
  'hip_abductor_adductor',
  'seated_leg_curl',
  'lying_leg_curl',
  'hip_adductor_inner',
]);

const MALE_HYPERTROPHY_COMPOUND_FAVORITE_IDS = new Set([
  'brtw_incline_chest_press',
  'brtw_laydown_chest_press',
  'incline_dumbbell_press',
  'chest_supported_row',
  'wide_lat_pulldown',
  'iso_high_pulldown',
  'machine_shoulder_press',
  'machine_lateral_raise',
  'machine_bicep_curl',
  'super_squat_machine',
  'leg_press_45',
]);

/**
 * Pure 0-cost exercise substitution scoring algorithm:
 * - Same primary muscle region (+100)
 * - Overlapping secondary muscles (+35..65)
 * - Gender-isolated biomechanics:
 *   • Female (`/gym/nu`): Glute isolation & Quad-sparing bonus when `avoidHeavyQuads` is enabled
 *   • Male (`/gym/nam`): Compound V-Taper hypertrophy & Guided BRTW machine priority (NEVER applies female quad avoidance!)
 * - Joint protection: Lower-back/knee protection + Shoulder protection (`shoulderSafe`)
 * - Excludes exercises marked as `injury` or `busy`
 */
export function rankExerciseSubstitutes(
  targetExercise: GymExerciseDefinition,
  catalog: GymExerciseDefinition[],
  options: {
    gender?: GymGenderMode;
    currentDayExerciseIds?: string[];
    restrictions?: GymExerciseRestriction[];
    userProfile?: Partial<GymFemaleBodyProfile>;
    isDeloadOrPeriod?: boolean;
    limit?: number;
  } = {}
): RankedExerciseSubstitute[] {
  const {
    gender: explicitGender,
    currentDayExerciseIds = [],
    restrictions = [],
    userProfile,
    isDeloadOrPeriod = false,
    limit = 4,
  } = options;

  const activeGender: GymGenderMode =
    explicitGender || (userProfile?.gender === 'male' ? 'male' : 'female');
  const isMale = activeGender === 'male';

  const restrictionMap = new Map<string, GymExerciseRestriction['kind']>();
  for (const r of restrictions) {
    restrictionMap.set(r.exerciseId, r.kind);
  }

  const targetPrimary = new Set(targetExercise.primaryMuscles);
  const targetSecondary = new Set(targetExercise.secondaryMuscles);
  const candidates: RankedExerciseSubstitute[] = [];

  for (const candidate of catalog) {
    if (candidate.id === targetExercise.id) continue;

    const restrictionKind = restrictionMap.get(candidate.id);
    if (restrictionKind === 'injury' || restrictionKind === 'busy') {
      continue;
    }

    let score = 0;
    const reasonBadgesVi: string[] = [];

    const sharesPrimary = candidate.primaryMuscles.some((m) => targetPrimary.has(m));
    const sharesCategory = candidate.categoryLabel === targetExercise.categoryLabel;

    if (sharesPrimary) {
      score += 100;
      reasonBadgesVi.push('Cùng nhóm cơ chính');
    } else if (sharesCategory) {
      score += 65;
      reasonBadgesVi.push(`Cùng nhóm ${candidate.categoryLabel}`);
    } else {
      const crossMatch =
        candidate.primaryMuscles.some((m) => targetSecondary.has(m)) ||
        candidate.secondaryMuscles.some((m) => targetPrimary.has(m));
      if (!crossMatch) continue;
      score += 35;
      reasonBadgesVi.push('Nhóm cơ bổ trợ');
    }

    if (isMale) {
      // Male V-Taper & Guided Hypertrophy preference (no quad-sparing leak!)
      if (MALE_HYPERTROPHY_COMPOUND_FAVORITE_IDS.has(candidate.id)) {
        score += 30;
        reasonBadgesVi.push('Tối ưu bơm cơ & V-Taper');
      }
    } else {
      // Female Glute-Sculpt & Quad-Sparing preference
      const hitsGlutes = candidate.primaryMuscles.includes('glutes');
      const hitsQuadsPrimary = candidate.primaryMuscles.includes('quads');

      if (userProfile?.avoidHeavyQuads !== false) {
        if (hitsGlutes && !hitsQuadsPrimary) {
          score += 40;
          reasonBadgesVi.push('Ăn mông • Không to đùi trước');
        } else if (GLUTE_ISOLATION_FAVORITE_IDS.has(candidate.id)) {
          score += 25;
          reasonBadgesVi.push('Cô lập thân dưới thon gọn');
        }
      }
    }

    // Shoulder protection (especially valuable on Chest/Delt days)
    if (userProfile?.shoulderSafe) {
      if (SHOULDER_STRESS_IDS.has(candidate.id)) {
        score -= 45;
      } else if (
        candidate.primaryMuscles.includes('chest') ||
        candidate.primaryMuscles.includes('shoulders') ||
        candidate.primaryMuscles.includes('triceps')
      ) {
        score += 22;
        reasonBadgesVi.push('Êm khớp vai trước');
      }
    }

    // Lower back / knee protection or deload safety
    if (userProfile?.protectLowerBackKnee || isDeloadOrPeriod) {
      if (!LOW_BACK_HEAVY_IDS.has(candidate.id)) {
        score += 25;
        reasonBadgesVi.push('Êm lưng dưới & khớp gối');
      } else {
        score -= 40;
      }
    }

    // Prefer exercises not already in today's queue
    if (!currentDayExerciseIds.includes(candidate.id)) {
      score += 15;
    } else {
      reasonBadgesVi.push('Đã có trong buổi');
    }

    if (restrictionKind === 'dislike') {
      score -= 60;
    }

    candidates.push({
      exercise: candidate,
      score,
      reasonBadgesVi: reasonBadgesVi.slice(0, 3),
    });
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}
