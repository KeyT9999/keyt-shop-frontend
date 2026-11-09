import type {
  GymExerciseDefinition,
  GymExerciseRestriction,
  GymFemaleBodyProfile,
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

const GLUTE_ISOLATION_FAVORITE_IDS = new Set([
  'machine_hip_thrust',
  'hip_abductor_adductor',
  'seated_leg_curl',
  'lying_leg_curl',
  'hip_adductor_inner',
]);

/**
 * Pure 0-cost exercise substitution scoring algorithm inspired by musclog-app's
 * `utils/exerciseSubstitution.ts`, customized for female gym priorities:
 * - Same primary muscle region (+100)
 * - Overlapping secondary muscles (+25)
 * - Glute isolation & Quad-sparing bonus when `avoidHeavyQuads` is enabled (+35)
 * - Lower-back / knee protection bonus when `protectLowerBackKnee` or menstrual deload is active (+25)
 * - Excludes exercises marked as `injury` or `busy`
 */
export function rankExerciseSubstitutes(
  targetExercise: GymExerciseDefinition,
  catalog: GymExerciseDefinition[],
  options: {
    currentDayExerciseIds?: string[];
    restrictions?: GymExerciseRestriction[];
    userProfile?: Partial<GymFemaleBodyProfile>;
    isDeloadOrPeriod?: boolean;
    limit?: number;
  } = {}
): RankedExerciseSubstitute[] {
  const {
    currentDayExerciseIds = [],
    restrictions = [],
    userProfile,
    isDeloadOrPeriod = false,
    limit = 4,
  } = options;

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

    // Lower back / knee protection or menstrual period safety
    if (userProfile?.protectLowerBackKnee || isDeloadOrPeriod) {
      if (!LOW_BACK_HEAVY_IDS.has(candidate.id)) {
        score += 25;
        reasonBadgesVi.push('Êm lưng dưới & khớp gối');
      } else {
        score -= 40;
      }
    }

    // Prefer exercises not already in today's queue, but still allow them with slight tie-breaker
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
