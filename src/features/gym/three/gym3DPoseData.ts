import type { Gym3DAnimType } from '../types/gym';

export type Vec3Tuple = [number, number, number];

export interface GymJointMap {
  pelvis: Vec3Tuple;
  waist: Vec3Tuple;
  chest: Vec3Tuple;
  neck: Vec3Tuple;
  head: Vec3Tuple;
  /** Unit-ish forward vector indicating where the face/chest points */
  facingDir: Vec3Tuple;
  lShoulder: Vec3Tuple;
  rShoulder: Vec3Tuple;
  lElbow: Vec3Tuple;
  rElbow: Vec3Tuple;
  lWrist: Vec3Tuple;
  rWrist: Vec3Tuple;
  lHip: Vec3Tuple;
  rHip: Vec3Tuple;
  lKnee: Vec3Tuple;
  rKnee: Vec3Tuple;
  lAnkle: Vec3Tuple;
  rAnkle: Vec3Tuple;
}

export type GymEquipmentPropSpec =
  | { kind: 'bench_flat' }
  | { kind: 'bench_incline' }
  | { kind: 'bench_upright' }
  | { kind: 'bench_prone' }
  | { kind: 'dumbbell_hammer'; pos: Vec3Tuple }
  | { kind: 'dumbbell_horiz'; pos: Vec3Tuple }
  | { kind: 'dumbbell_single_vertical'; pos: Vec3Tuple }
  | { kind: 'barbell'; lPos: Vec3Tuple; rPos: Vec3Tuple }
  | { kind: 'cable_lat_bar'; lPos: Vec3Tuple; rPos: Vec3Tuple }
  | { kind: 'cable_high_rope'; lPos: Vec3Tuple; rPos: Vec3Tuple; anchor: Vec3Tuple }
  | { kind: 'cable_dual_crossover'; lPos: Vec3Tuple; rPos: Vec3Tuple }
  | { kind: 'cable_low_row'; lPos: Vec3Tuple; rPos: Vec3Tuple }
  | { kind: 'leg_press_sled'; lFoot: Vec3Tuple; rFoot: Vec3Tuple };

export interface ComputedGymPoseFrame {
  joints: GymJointMap;
  props: GymEquipmentPropSpec[];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: Vec3Tuple, b: Vec3Tuple, t: number): Vec3Tuple {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function createStandingBase(): GymJointMap {
  // Character stands on y = 0 floor, facing +Z (towards default camera at +Z)
  return {
    pelvis: [0, 0.92, 0],
    waist: [0, 1.10, 0],
    chest: [0, 1.33, 0],
    neck: [0, 1.49, 0],
    head: [0, 1.66, 0.02],
    facingDir: [0, 0, 1],
    lShoulder: [-0.23, 1.43, 0],
    rShoulder: [0.23, 1.43, 0],
    lElbow: [-0.26, 1.13, -0.02],
    rElbow: [0.26, 1.13, -0.02],
    lWrist: [-0.26, 0.86, 0.06],
    rWrist: [0.26, 0.86, 0.06],
    lHip: [-0.13, 0.90, 0],
    rHip: [0.13, 0.90, 0],
    lKnee: [-0.15, 0.49, 0.02],
    rKnee: [0.15, 0.49, 0.02],
    lAnkle: [-0.16, 0.07, -0.02],
    rAnkle: [0.16, 0.07, -0.02],
  };
}

function applySeatedUprightBase(j: GymJointMap): void {
  j.pelvis = [0, 0.56, -0.08];
  j.waist = [0, 0.76, -0.10];
  j.chest = [0, 0.98, -0.12];
  j.neck = [0, 1.14, -0.13];
  j.head = [0, 1.31, -0.11];
  j.facingDir = [0, 0.1, 0.99];
  j.lShoulder = [-0.23, 1.09, -0.12];
  j.rShoulder = [0.23, 1.09, -0.12];
  j.lHip = [-0.14, 0.55, -0.06];
  j.rHip = [0.14, 0.55, -0.06];
  j.lKnee = [-0.18, 0.52, 0.34];
  j.rKnee = [0.18, 0.52, 0.34];
  j.lAnkle = [-0.19, 0.07, 0.36];
  j.rAnkle = [0.19, 0.07, 0.36];
}

export function computeGym3DPoseKeyframes(
  animType: Gym3DAnimType,
  p: number
): ComputedGymPoseFrame {
  const j = createStandingBase();
  const props: GymEquipmentPropSpec[] = [];

  switch (animType) {
    case 'hammer_curl': {
      const ang = lerp(0.18, 2.24, p);
      j.lElbow = [-0.25, 1.14, -0.01];
      j.rElbow = [0.25, 1.14, -0.01];
      j.lWrist = [-0.24, 1.14 - Math.cos(ang) * 0.27, -0.01 + Math.sin(ang) * 0.27];
      j.rWrist = [0.24, 1.14 - Math.cos(ang) * 0.27, -0.01 + Math.sin(ang) * 0.27];
      props.push({ kind: 'dumbbell_hammer', pos: j.lWrist });
      props.push({ kind: 'dumbbell_hammer', pos: j.rWrist });
      break;
    }

    case 'barbell_curl': {
      const ang = lerp(0.22, 2.3, p);
      j.lElbow = [-0.24, 1.14, 0.01];
      j.rElbow = [0.24, 1.14, 0.01];
      j.lWrist = [-0.23, 1.14 - Math.cos(ang) * 0.27, 0.01 + Math.sin(ang) * 0.27];
      j.rWrist = [0.23, 1.14 - Math.cos(ang) * 0.27, 0.01 + Math.sin(ang) * 0.27];
      props.push({ kind: 'barbell', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'lateral_raise': {
      const ang = lerp(0.12, 1.48, p);
      j.lElbow = [-0.23 - Math.sin(ang) * 0.28, 1.43 - Math.cos(ang) * 0.28, 0.04];
      j.rElbow = [0.23 + Math.sin(ang) * 0.28, 1.43 - Math.cos(ang) * 0.28, 0.04];
      j.lWrist = [-0.23 - Math.sin(ang) * 0.53, 1.43 - Math.cos(ang) * 0.50, 0.10];
      j.rWrist = [0.23 + Math.sin(ang) * 0.53, 1.43 - Math.cos(ang) * 0.50, 0.10];
      props.push({ kind: 'dumbbell_horiz', pos: j.lWrist });
      props.push({ kind: 'dumbbell_horiz', pos: j.rWrist });
      break;
    }

    case 'shoulder_press': {
      applySeatedUprightBase(j);
      j.lElbow = lerp3([-0.43, 0.96, -0.02], [-0.27, 1.38, -0.08], p);
      j.rElbow = lerp3([0.43, 0.96, -0.02], [0.27, 1.38, -0.08], p);
      j.lWrist = lerp3([-0.41, 1.22, 0.0], [-0.17, 1.66, -0.06], p);
      j.rWrist = lerp3([0.41, 1.22, 0.0], [0.17, 1.66, -0.06], p);
      props.push({ kind: 'bench_upright' });
      props.push({ kind: 'dumbbell_horiz', pos: j.lWrist });
      props.push({ kind: 'dumbbell_horiz', pos: j.rWrist });
      break;
    }

    case 'incline_press': {
      j.pelvis = [0, 0.55, 0.05];
      j.waist = [0, 0.70, -0.09];
      j.chest = [0, 0.87, -0.23];
      j.neck = [0, 1.00, -0.34];
      j.head = [0, 1.15, -0.43];
      j.facingDir = [0, 0.72, 0.69];
      j.lShoulder = [-0.23, 0.93, -0.27];
      j.rShoulder = [0.23, 0.93, -0.27];
      j.lHip = [-0.14, 0.54, 0.05];
      j.rHip = [0.14, 0.54, 0.05];
      j.lKnee = [-0.19, 0.50, 0.44];
      j.rKnee = [0.19, 0.50, 0.44];
      j.lAnkle = [-0.20, 0.07, 0.46];
      j.rAnkle = [0.20, 0.07, 0.46];

      j.lElbow = lerp3([-0.42, 0.78, -0.20], [-0.24, 1.23, -0.12], p);
      j.rElbow = lerp3([0.42, 0.78, -0.20], [0.24, 1.23, -0.12], p);
      j.lWrist = lerp3([-0.36, 1.04, -0.14], [-0.14, 1.48, -0.03], p);
      j.rWrist = lerp3([0.36, 1.04, -0.14], [0.14, 1.48, -0.03], p);
      props.push({ kind: 'bench_incline' });
      props.push({ kind: 'dumbbell_horiz', pos: j.lWrist });
      props.push({ kind: 'dumbbell_horiz', pos: j.rWrist });
      break;
    }

    case 'bench_press': {
      // p=0 top lockout, p=1 bar lowered to chest (since isEccentricFirst=true)
      const press = 1 - p;
      j.pelvis = [0, 0.57, 0.22];
      j.waist = [0, 0.59, 0.02];
      j.chest = [0, 0.62, -0.18];
      j.neck = [0, 0.63, -0.34];
      j.head = [0, 0.66, -0.50];
      j.facingDir = [0, 1, 0];
      j.lShoulder = [-0.23, 0.62, -0.22];
      j.rShoulder = [0.23, 0.62, -0.22];
      j.lHip = [-0.14, 0.57, 0.22];
      j.rHip = [0.14, 0.57, 0.22];
      j.lKnee = [-0.20, 0.54, 0.58];
      j.rKnee = [0.20, 0.54, 0.58];
      j.lAnkle = [-0.21, 0.07, 0.58];
      j.rAnkle = [0.21, 0.07, 0.58];

      j.lElbow = lerp3([-0.42, 0.48, -0.12], [-0.28, 0.90, -0.18], press);
      j.rElbow = lerp3([0.42, 0.48, -0.12], [0.28, 0.90, -0.18], press);
      j.lWrist = lerp3([-0.38, 0.74, -0.12], [-0.34, 1.16, -0.18], press);
      j.rWrist = lerp3([0.38, 0.74, -0.12], [0.34, 1.16, -0.18], press);
      props.push({ kind: 'bench_flat' });
      props.push({ kind: 'barbell', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'pec_fly': {
      applySeatedUprightBase(j);
      const spread = lerp(1.24, 0.14, p);
      j.lElbow = [-0.12 - Math.sin(spread) * 0.34, 1.02, -0.08 + Math.cos(spread) * 0.28];
      j.rElbow = [0.12 + Math.sin(spread) * 0.34, 1.02, -0.08 + Math.cos(spread) * 0.28];
      j.lWrist = [-0.06 - Math.sin(spread) * 0.52, 1.02, -0.05 + Math.cos(spread) * 0.48];
      j.rWrist = [0.06 + Math.sin(spread) * 0.52, 1.02, -0.05 + Math.cos(spread) * 0.48];
      props.push({ kind: 'bench_upright' });
      break;
    }

    case 'cable_crossover': {
      j.chest = [0, 1.31, 0.06];
      j.neck = [0, 1.46, 0.10];
      j.head = [0, 1.63, 0.14];
      j.lShoulder = [-0.23, 1.41, 0.06];
      j.rShoulder = [0.23, 1.41, 0.06];
      j.lAnkle = [-0.16, 0.07, 0.18];
      j.rAnkle = [0.16, 0.07, -0.16];
      j.lElbow = lerp3([-0.46, 1.48, -0.04], [-0.18, 1.10, 0.24], p);
      j.rElbow = lerp3([0.46, 1.48, -0.04], [0.18, 1.10, 0.24], p);
      j.lWrist = lerp3([-0.64, 1.62, -0.10], [-0.06, 0.94, 0.36], p);
      j.rWrist = lerp3([0.64, 1.62, -0.10], [0.06, 0.94, 0.36], p);
      props.push({ kind: 'cable_dual_crossover', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'lat_pulldown': {
      applySeatedUprightBase(j);
      j.lElbow = lerp3([-0.38, 1.42, -0.04], [-0.36, 0.88, -0.12], p);
      j.rElbow = lerp3([0.38, 1.42, -0.04], [0.36, 0.88, -0.12], p);
      j.lWrist = lerp3([-0.46, 1.72, 0.02], [-0.44, 1.15, -0.04], p);
      j.rWrist = lerp3([0.46, 1.72, 0.02], [0.44, 1.15, -0.04], p);
      props.push({ kind: 'bench_upright' });
      props.push({ kind: 'cable_lat_bar', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'cable_row': {
      j.pelvis = [0, 0.36, -0.24];
      j.waist = lerp3([0, 0.56, -0.20], [0, 0.57, -0.24], p);
      j.chest = lerp3([0, 0.76, -0.16], [0, 0.78, -0.24], p);
      j.neck = lerp3([0, 0.92, -0.14], [0, 0.94, -0.24], p);
      j.head = lerp3([0, 1.09, -0.12], [0, 1.11, -0.22], p);
      j.lShoulder = lerp3([-0.22, 0.86, -0.15], [-0.23, 0.88, -0.26], p);
      j.rShoulder = lerp3([0.22, 0.86, -0.15], [0.23, 0.88, -0.26], p);
      j.lHip = [-0.14, 0.36, -0.24];
      j.rHip = [0.14, 0.36, -0.24];
      j.lKnee = [-0.16, 0.40, 0.14];
      j.rKnee = [0.16, 0.40, 0.14];
      j.lAnkle = [-0.16, 0.34, 0.52];
      j.rAnkle = [0.16, 0.34, 0.52];

      j.lElbow = lerp3([-0.22, 0.75, 0.14], [-0.24, 0.65, -0.42], p);
      j.rElbow = lerp3([0.22, 0.75, 0.14], [0.24, 0.65, -0.42], p);
      j.lWrist = lerp3([-0.08, 0.71, 0.38], [-0.08, 0.63, -0.12], p);
      j.rWrist = lerp3([0.08, 0.71, 0.38], [0.08, 0.63, -0.12], p);
      props.push({ kind: 'cable_low_row', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'tricep_pushdown': {
      j.chest = [0, 1.31, 0.04];
      j.neck = [0, 1.47, 0.06];
      j.head = [0, 1.64, 0.09];
      j.lShoulder = [-0.22, 1.42, 0.04];
      j.rShoulder = [0.22, 1.42, 0.04];
      j.lElbow = [-0.23, 1.12, 0.02];
      j.rElbow = [0.23, 1.12, 0.02];
      j.lWrist = lerp3([-0.14, 1.24, 0.24], [-0.25, 0.85, 0.06], p);
      j.rWrist = lerp3([0.14, 1.24, 0.24], [0.25, 0.85, 0.06], p);
      props.push({
        kind: 'cable_high_rope',
        lPos: j.lWrist,
        rPos: j.rWrist,
        anchor: [0, 1.96, 0.36],
      });
      break;
    }

    case 'overhead_tricep': {
      // p=0 arms extended overhead, p=1 lowered behind neck (isEccentricFirst=true)
      const ext = 1 - p;
      j.lElbow = [-0.18, 1.66, -0.02];
      j.rElbow = [0.18, 1.66, -0.02];
      const wristPos = lerp3([0, 1.40, -0.18], [0, 1.92, -0.02], ext);
      j.lWrist = [-0.05, wristPos[1], wristPos[2]];
      j.rWrist = [0.05, wristPos[1], wristPos[2]];
      props.push({ kind: 'dumbbell_single_vertical', pos: wristPos });
      break;
    }

    case 'face_pull': {
      j.lElbow = lerp3([-0.24, 1.40, 0.28], [-0.42, 1.48, -0.06], p);
      j.rElbow = lerp3([0.24, 1.40, 0.28], [0.42, 1.48, -0.06], p);
      j.lWrist = lerp3([-0.10, 1.42, 0.52], [-0.24, 1.62, 0.04], p);
      j.rWrist = lerp3([0.10, 1.42, 0.52], [0.24, 1.62, 0.04], p);
      props.push({
        kind: 'cable_high_rope',
        lPos: j.lWrist,
        rPos: j.rWrist,
        anchor: [0, 1.56, 0.78],
      });
      break;
    }

    case 'squat': {
      j.pelvis = lerp3([0, 0.92, 0], [0, 0.50, -0.18], p);
      j.waist = lerp3([0, 1.10, 0], [0, 0.68, -0.08], p);
      j.chest = lerp3([0, 1.32, 0], [0, 0.88, 0.02], p);
      j.neck = lerp3([0, 1.48, 0], [0, 1.04, 0.08], p);
      j.head = lerp3([0, 1.66, 0.02], [0, 1.22, 0.12], p);
      j.lShoulder = [j.chest[0] - 0.23, j.chest[1] + 0.10, j.chest[2]];
      j.rShoulder = [j.chest[0] + 0.23, j.chest[1] + 0.10, j.chest[2]];
      j.lElbow = [j.lShoulder[0] - 0.12, j.lShoulder[1] - 0.22, j.lShoulder[2] - 0.10];
      j.rElbow = [j.rShoulder[0] + 0.12, j.rShoulder[1] - 0.22, j.rShoulder[2] - 0.10];
      j.lWrist = [j.lShoulder[0] - 0.18, j.lShoulder[1] + 0.03, j.lShoulder[2] - 0.04];
      j.rWrist = [j.rShoulder[0] + 0.18, j.rShoulder[1] + 0.03, j.rShoulder[2] - 0.04];

      j.lHip = [-0.15, j.pelvis[1], j.pelvis[2]];
      j.rHip = [0.15, j.pelvis[1], j.pelvis[2]];
      j.lKnee = lerp3([-0.17, 0.49, 0.03], [-0.24, 0.48, 0.26], p);
      j.rKnee = lerp3([0.17, 0.49, 0.03], [0.24, 0.48, 0.26], p);
      j.lAnkle = [-0.19, 0.07, -0.02];
      j.rAnkle = [0.19, 0.07, -0.02];
      props.push({
        kind: 'barbell',
        lPos: [-0.45, j.neck[1] - 0.02, j.neck[2] - 0.04],
        rPos: [0.45, j.neck[1] - 0.02, j.neck[2] - 0.04],
      });
      break;
    }

    case 'leg_press': {
      // Seated angled back, pressing sled at 45 deg
      const flex = p; // p=0 extended, p=1 knees flexed toward chest
      j.pelvis = [0, 0.34, -0.28];
      j.waist = [0, 0.48, -0.42];
      j.chest = [0, 0.64, -0.56];
      j.neck = [0, 0.78, -0.66];
      j.head = [0, 0.94, -0.72];
      j.facingDir = [0, 0.6, 0.8];
      j.lShoulder = [-0.22, 0.70, -0.58];
      j.rShoulder = [0.22, 0.70, -0.58];
      j.lElbow = [-0.26, 0.48, -0.44];
      j.rElbow = [0.26, 0.48, -0.44];
      j.lWrist = [-0.24, 0.36, -0.26];
      j.rWrist = [0.24, 0.36, -0.26];
      j.lHip = [-0.15, 0.35, -0.26];
      j.rHip = [0.15, 0.35, -0.26];

      j.lKnee = lerp3([-0.17, 0.68, 0.08], [-0.22, 0.68, -0.22], flex);
      j.rKnee = lerp3([0.17, 0.68, 0.08], [0.22, 0.68, -0.22], flex);
      j.lAnkle = lerp3([-0.18, 1.02, 0.44], [-0.18, 0.74, 0.14], flex);
      j.rAnkle = lerp3([0.18, 1.02, 0.44], [0.18, 0.74, 0.14], flex);
      props.push({ kind: 'leg_press_sled', lFoot: j.lAnkle, rFoot: j.rAnkle });
      break;
    }

    case 'rdl': {
      j.pelvis = lerp3([0, 0.92, 0], [0, 0.86, -0.24], p);
      j.waist = lerp3([0, 1.10, 0], [0, 0.92, -0.05], p);
      j.chest = lerp3([0, 1.32, 0], [0, 0.98, 0.14], p);
      j.neck = lerp3([0, 1.48, 0], [0, 1.02, 0.30], p);
      j.head = lerp3([0, 1.66, 0.02], [0, 1.08, 0.46], p);
      j.lShoulder = [-0.22, j.chest[1] + 0.06, j.chest[2] + 0.05];
      j.rShoulder = [0.22, j.chest[1] + 0.06, j.chest[2] + 0.05];
      j.lElbow = [-0.23, j.lShoulder[1] - 0.28, j.lShoulder[2] + 0.02];
      j.rElbow = [0.23, j.rShoulder[1] - 0.28, j.rShoulder[2] + 0.02];
      j.lWrist = [-0.23, j.lElbow[1] - 0.25, j.lElbow[2] + 0.02];
      j.rWrist = [0.23, j.rElbow[1] - 0.25, j.rElbow[2] + 0.02];

      j.lHip = [-0.14, j.pelvis[1], j.pelvis[2]];
      j.rHip = [0.14, j.pelvis[1], j.pelvis[2]];
      j.lKnee = lerp3([-0.15, 0.49, 0.02], [-0.15, 0.47, -0.04], p);
      j.rKnee = lerp3([0.15, 0.49, 0.02], [0.15, 0.47, -0.04], p);
      props.push({ kind: 'barbell', lPos: j.lWrist, rPos: j.rWrist });
      break;
    }

    case 'leg_curl': {
      // Lying prone on bench curling heels toward glutes
      j.pelvis = [0, 0.56, -0.05];
      j.waist = [0, 0.57, 0.14];
      j.chest = [0, 0.59, 0.34];
      j.neck = [0, 0.62, 0.50];
      j.head = [0, 0.65, 0.64];
      j.facingDir = [0, -1, 0];
      j.lShoulder = [-0.22, 0.59, 0.38];
      j.rShoulder = [0.22, 0.59, 0.38];
      j.lElbow = [-0.26, 0.46, 0.54];
      j.rElbow = [0.26, 0.46, 0.54];
      j.lWrist = [-0.22, 0.42, 0.72];
      j.rWrist = [0.22, 0.42, 0.72];
      j.lHip = [-0.14, 0.55, -0.08];
      j.rHip = [0.14, 0.55, -0.08];
      j.lKnee = [-0.15, 0.52, -0.46];
      j.rKnee = [0.15, 0.52, -0.46];

      const curlAng = lerp(0.15, 2.05, p);
      j.lAnkle = [-0.15, 0.52 + Math.sin(curlAng) * 0.38, -0.46 - Math.cos(curlAng) * 0.38];
      j.rAnkle = [0.15, 0.52 + Math.sin(curlAng) * 0.38, -0.46 - Math.cos(curlAng) * 0.38];
      props.push({ kind: 'bench_prone' });
      break;
    }

    case 'calf_raise': {
      const lift = p * 0.09;
      j.pelvis[1] += lift;
      j.waist[1] += lift;
      j.chest[1] += lift;
      j.neck[1] += lift;
      j.head[1] += lift;
      j.lShoulder[1] += lift;
      j.rShoulder[1] += lift;
      j.lElbow[1] += lift;
      j.rElbow[1] += lift;
      j.lWrist[1] += lift;
      j.rWrist[1] += lift;
      j.lHip[1] += lift;
      j.rHip[1] += lift;
      j.lKnee[1] += lift;
      j.rKnee[1] += lift;
      j.lAnkle[1] = 0.06 + lift;
      j.rAnkle[1] = 0.06 + lift;
      props.push({ kind: 'dumbbell_hammer', pos: j.lWrist });
      props.push({ kind: 'dumbbell_hammer', pos: j.rWrist });
      break;
    }

    case 'recovery':
    default: {
      j.lElbow = [-0.36, 1.58 + p * 0.08, 0];
      j.rElbow = [0.36, 1.58 + p * 0.08, 0];
      j.lWrist = [-0.20, 1.84 + p * 0.08, 0];
      j.rWrist = [0.20, 1.84 + p * 0.08, 0];
      break;
    }
  }

  return { joints: j, props };
}
