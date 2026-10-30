import type { Gym3DAnimType } from '../types/gym';
import type { GymJointMap, Vec3Tuple } from './gym3DPoseData';

export type GymMachinePropSpec =
  | { kind: 'machine_incline_press'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_laydown_press'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_chest_row'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_iso_pulldown'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_assisted_station'; kneePadY: number }
  | { kind: 'machine_preacher_curl'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_lateral_raise'; lElbow: Vec3Tuple; rElbow: Vec3Tuple }
  | { kind: 'machine_reverse_fly'; lGrip: Vec3Tuple; rGrip: Vec3Tuple }
  | { kind: 'machine_leg_extension'; lAnkle: Vec3Tuple; rAnkle: Vec3Tuple }
  | { kind: 'machine_super_squat'; lShoulder: Vec3Tuple; rShoulder: Vec3Tuple }
  | { kind: 'machine_hip_thrust'; pelvis: Vec3Tuple }
  | { kind: 'machine_hip_abductor'; lKnee: Vec3Tuple; rKnee: Vec3Tuple }
  | { kind: 'machine_roman_chair'; chest: Vec3Tuple }
  | { kind: 'step_calf_block' };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerp3(a: Vec3Tuple, b: Vec3Tuple, t: number): Vec3Tuple {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function setSeatedMachineBase(j: GymJointMap): void {
  j.pelvis = [0, 0.56, -0.08];
  j.waist = [0, 0.76, -0.10];
  j.chest = [0, 0.98, -0.12];
  j.neck = [0, 1.14, -0.13];
  j.head = [0, 1.31, -0.11];
  j.facingDir = [0, 0.08, 0.99];
  j.lShoulder = [-0.23, 1.09, -0.12];
  j.rShoulder = [0.23, 1.09, -0.12];
  j.lHip = [-0.14, 0.55, -0.06];
  j.rHip = [0.14, 0.55, -0.06];
  j.lKnee = [-0.18, 0.52, 0.34];
  j.rKnee = [0.18, 0.52, 0.34];
  j.lAnkle = [-0.19, 0.07, 0.36];
  j.rAnkle = [0.19, 0.07, 0.36];
}

function poseUpperBodyMachines(
  animType: Gym3DAnimType,
  j: GymJointMap,
  p: number
): GymMachinePropSpec[] | null {
  switch (animType) {
    case 'leverage_incline_press': {
      j.pelvis = [0, 0.54, 0.04];
      j.waist = [0, 0.70, -0.09];
      j.chest = [0, 0.88, -0.22];
      j.neck = [0, 1.02, -0.32];
      j.head = [0, 1.18, -0.40];
      j.facingDir = [0, 0.65, 0.76];
      j.lShoulder = [-0.23, 0.94, -0.25];
      j.rShoulder = [0.23, 0.94, -0.25];
      j.lHip = [-0.14, 0.54, 0.04];
      j.rHip = [0.14, 0.54, 0.04];
      j.lKnee = [-0.19, 0.50, 0.42];
      j.rKnee = [0.19, 0.50, 0.42];
      j.lAnkle = [-0.20, 0.07, 0.46];
      j.rAnkle = [0.20, 0.07, 0.46];
      j.lElbow = lerp3([-0.40, 0.76, -0.18], [-0.23, 1.18, 0.06], p);
      j.rElbow = lerp3([0.40, 0.76, -0.18], [0.23, 1.18, 0.06], p);
      j.lWrist = lerp3([-0.34, 0.98, -0.06], [-0.13, 1.38, 0.24], p);
      j.rWrist = lerp3([0.34, 0.98, -0.06], [0.13, 1.38, 0.24], p);
      return [{ kind: 'machine_incline_press', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'laydown_chest_press': {
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
      j.lElbow = lerp3([-0.42, 0.46, -0.12], [-0.24, 0.92, -0.15], press);
      j.rElbow = lerp3([0.42, 0.46, -0.12], [0.24, 0.92, -0.15], press);
      j.lWrist = lerp3([-0.36, 0.72, -0.12], [-0.16, 1.16, -0.14], press);
      j.rWrist = lerp3([0.36, 0.72, -0.12], [0.16, 1.16, -0.14], press);
      return [{ kind: 'machine_laydown_press', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'chest_supported_row': {
      j.pelvis = [0, 0.54, -0.12];
      j.waist = [0, 0.74, -0.04];
      j.chest = [0, 0.95, 0.06];
      j.neck = [0, 1.11, 0.12];
      j.head = [0, 1.27, 0.18];
      j.facingDir = [0, -0.28, 0.96];
      j.lShoulder = lerp3([-0.22, 1.04, 0.12], [-0.24, 1.05, 0.02], p);
      j.rShoulder = lerp3([0.22, 1.04, 0.12], [0.24, 1.05, 0.02], p);
      j.lHip = [-0.15, 0.53, -0.12];
      j.rHip = [0.15, 0.53, -0.12];
      j.lKnee = [-0.22, 0.48, 0.24];
      j.rKnee = [0.22, 0.48, 0.24];
      j.lAnkle = [-0.23, 0.07, 0.20];
      j.rAnkle = [0.23, 0.07, 0.20];
      j.lElbow = lerp3([-0.26, 0.92, 0.36], [-0.34, 0.86, -0.18], p);
      j.rElbow = lerp3([0.26, 0.92, 0.36], [0.34, 0.86, -0.18], p);
      j.lWrist = lerp3([-0.22, 0.88, 0.60], [-0.24, 0.84, 0.08], p);
      j.rWrist = lerp3([0.22, 0.88, 0.60], [0.24, 0.84, 0.08], p);
      return [{ kind: 'machine_chest_row', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'iso_high_pulldown': {
      setSeatedMachineBase(j);
      j.lElbow = lerp3([-0.34, 1.46, 0.08], [-0.36, 0.84, -0.14], p);
      j.rElbow = lerp3([0.34, 1.46, 0.08], [0.36, 0.84, -0.14], p);
      j.lWrist = lerp3([-0.40, 1.74, 0.22], [-0.38, 1.12, -0.02], p);
      j.rWrist = lerp3([0.40, 1.74, 0.22], [0.38, 1.12, -0.02], p);
      return [{ kind: 'machine_iso_pulldown', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'assisted_pullup': {
      const lift = p * 0.40;
      const basePelvisY = 0.88 + lift;
      j.pelvis = [0, basePelvisY, 0.02];
      j.waist = [0, basePelvisY + 0.19, 0.02];
      j.chest = [0, basePelvisY + 0.41, 0.03];
      j.neck = [0, basePelvisY + 0.57, 0.03];
      j.head = [0, basePelvisY + 0.74, 0.05];
      j.lShoulder = [-0.23, basePelvisY + 0.51, 0.02];
      j.rShoulder = [0.23, basePelvisY + 0.51, 0.02];
      j.lWrist = [-0.36, 1.92, 0.04];
      j.rWrist = [0.36, 1.92, 0.04];
      j.lElbow = lerp3([-0.32, 1.66, 0.04], [-0.38, 1.56, -0.06], p);
      j.rElbow = lerp3([0.32, 1.66, 0.04], [0.38, 1.56, -0.06], p);
      j.lHip = [-0.13, basePelvisY - 0.02, 0.02];
      j.rHip = [0.13, basePelvisY - 0.02, 0.02];
      j.lKnee = [-0.14, basePelvisY - 0.42, 0.04];
      j.rKnee = [0.14, basePelvisY - 0.42, 0.04];
      j.lAnkle = [-0.14, basePelvisY - 0.40, -0.30];
      j.rAnkle = [0.14, basePelvisY - 0.40, -0.30];
      return [{ kind: 'machine_assisted_station', kneePadY: j.lKnee[1] - 0.05 }];
    }

    case 'assisted_dip': {
      const drop = p * 0.28;
      const basePelvisY = 1.00 - drop;
      j.pelvis = [0, basePelvisY, -0.02];
      j.waist = [0, basePelvisY + 0.18, 0.0];
      j.chest = [0, basePelvisY + 0.40, 0.04];
      j.neck = [0, basePelvisY + 0.56, 0.06];
      j.head = [0, basePelvisY + 0.72, 0.09];
      j.facingDir = [0, -0.14, 0.99];
      j.lShoulder = [-0.23, basePelvisY + 0.50, 0.03];
      j.rShoulder = [0.23, basePelvisY + 0.50, 0.03];
      j.lWrist = [-0.27, 1.10, 0.06];
      j.rWrist = [0.27, 1.10, 0.06];
      j.lElbow = lerp3([-0.26, 1.30, -0.02], [-0.29, 1.24, -0.22], p);
      j.rElbow = lerp3([0.26, 1.30, -0.02], [0.29, 1.24, -0.22], p);
      j.lHip = [-0.13, basePelvisY - 0.02, -0.02];
      j.rHip = [0.13, basePelvisY - 0.02, -0.02];
      j.lKnee = [-0.14, basePelvisY - 0.40, 0.02];
      j.rKnee = [0.14, basePelvisY - 0.40, 0.02];
      j.lAnkle = [-0.14, basePelvisY - 0.38, -0.30];
      j.rAnkle = [0.14, basePelvisY - 0.38, -0.30];
      return [{ kind: 'machine_assisted_station', kneePadY: j.lKnee[1] - 0.05 }];
    }

    default:
      return null;
  }
}

function poseArmShoulderAndLowerMachines(
  animType: Gym3DAnimType,
  j: GymJointMap,
  p: number
): GymMachinePropSpec[] | null {
  switch (animType) {
    case 'preacher_curl': {
      setSeatedMachineBase(j);
      j.pelvis = [0, 0.56, -0.18];
      j.waist = [0, 0.75, -0.16];
      j.chest = [0, 0.96, -0.12];
      j.neck = [0, 1.12, -0.10];
      j.head = [0, 1.28, -0.06];
      j.lShoulder = [-0.21, 1.06, -0.12];
      j.rShoulder = [0.21, 1.06, -0.12];
      j.lElbow = [-0.18, 0.88, 0.14];
      j.rElbow = [0.18, 0.88, 0.14];
      const ang = lerp(-0.55, 1.35, p);
      j.lWrist = [-0.18, 0.88 + Math.sin(ang) * 0.27, 0.14 + Math.cos(ang) * 0.27];
      j.rWrist = [0.18, 0.88 + Math.sin(ang) * 0.27, 0.14 + Math.cos(ang) * 0.27];
      return [{ kind: 'machine_preacher_curl', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'machine_lateral_raise': {
      setSeatedMachineBase(j);
      const ang = lerp(0.14, 1.52, p);
      j.lElbow = [-0.23 - Math.sin(ang) * 0.27, 1.09 - Math.cos(ang) * 0.27, -0.08];
      j.rElbow = [0.23 + Math.sin(ang) * 0.27, 1.09 - Math.cos(ang) * 0.27, -0.08];
      j.lWrist = [j.lElbow[0], j.lElbow[1] + 0.02, j.lElbow[2] + 0.25];
      j.rWrist = [j.rElbow[0], j.rElbow[1] + 0.02, j.rElbow[2] + 0.25];
      return [{ kind: 'machine_lateral_raise', lElbow: j.lElbow, rElbow: j.rElbow }];
    }

    case 'reverse_pec_fly': {
      setSeatedMachineBase(j);
      j.chest = [0, 0.98, 0.02];
      j.neck = [0, 1.14, 0.04];
      j.head = [0, 1.31, 0.06];
      j.lShoulder = [-0.22, 1.08, 0.02];
      j.rShoulder = [0.22, 1.08, 0.02];
      const spread = lerp(0.18, 1.62, p);
      j.lElbow = [-0.14 - Math.sin(spread) * 0.30, 1.04, 0.04 + Math.cos(spread) * 0.28];
      j.rElbow = [0.14 + Math.sin(spread) * 0.30, 1.04, 0.04 + Math.cos(spread) * 0.28];
      j.lWrist = [-0.10 - Math.sin(spread) * 0.54, 1.04, 0.04 + Math.cos(spread) * 0.50];
      j.rWrist = [0.10 + Math.sin(spread) * 0.54, 1.04, 0.04 + Math.cos(spread) * 0.50];
      return [{ kind: 'machine_reverse_fly', lGrip: j.lWrist, rGrip: j.rWrist }];
    }

    case 'leg_extension': {
      setSeatedMachineBase(j);
      j.lElbow = [-0.26, 0.80, -0.08];
      j.rElbow = [0.26, 0.80, -0.08];
      j.lWrist = [-0.26, 0.56, 0.04];
      j.rWrist = [0.26, 0.56, 0.04];
      j.lKnee = [-0.16, 0.54, 0.34];
      j.rKnee = [0.16, 0.54, 0.34];
      const extAng = lerp(0.08, 1.48, p);
      j.lAnkle = [-0.16, 0.54 - Math.cos(extAng) * 0.41, 0.34 + Math.sin(extAng) * 0.41];
      j.rAnkle = [0.16, 0.54 - Math.cos(extAng) * 0.41, 0.34 + Math.sin(extAng) * 0.41];
      return [{ kind: 'machine_leg_extension', lAnkle: j.lAnkle, rAnkle: j.rAnkle }];
    }

    case 'super_squat': {
      j.pelvis = lerp3([0, 0.94, -0.06], [0, 0.50, -0.22], p);
      j.waist = lerp3([0, 1.12, -0.12], [0, 0.68, -0.28], p);
      j.chest = lerp3([0, 1.34, -0.18], [0, 0.90, -0.34], p);
      j.neck = lerp3([0, 1.49, -0.22], [0, 1.05, -0.38], p);
      j.head = lerp3([0, 1.66, -0.20], [0, 1.22, -0.36], p);
      j.facingDir = [0, 0.25, 0.97];
      j.lShoulder = [-0.23, j.chest[1] + 0.09, j.chest[2]];
      j.rShoulder = [0.23, j.chest[1] + 0.09, j.chest[2]];
      j.lElbow = [-0.28, j.lShoulder[1] - 0.20, j.lShoulder[2] + 0.14];
      j.rElbow = [0.28, j.rShoulder[1] - 0.20, j.rShoulder[2] + 0.14];
      j.lWrist = [-0.20, j.lShoulder[1] + 0.02, j.lShoulder[2] + 0.20];
      j.rWrist = [0.20, j.rShoulder[1] + 0.02, j.rShoulder[2] + 0.20];
      j.lHip = [-0.15, j.pelvis[1], j.pelvis[2]];
      j.rHip = [0.15, j.pelvis[1], j.pelvis[2]];
      j.lKnee = lerp3([-0.17, 0.54, 0.12], [-0.23, 0.54, 0.32], p);
      j.rKnee = lerp3([0.17, 0.54, 0.12], [0.23, 0.54, 0.32], p);
      j.lAnkle = [-0.18, 0.14, 0.28];
      j.rAnkle = [0.18, 0.14, 0.28];
      return [{ kind: 'machine_super_squat', lShoulder: j.lShoulder, rShoulder: j.rShoulder }];
    }

    case 'hip_thrust': {
      const hipY = lerp(0.24, 0.56, p);
      j.pelvis = [0, hipY, 0.02];
      j.waist = [0, lerp(0.36, 0.56, p), -0.14];
      j.chest = [0, 0.55, -0.32];
      j.neck = [0, 0.62, -0.44];
      j.head = lerp3([0, 0.72, -0.52], [0, 0.66, -0.56], p);
      j.facingDir = [0, 0.90, 0.42];
      j.lShoulder = [-0.22, 0.56, -0.32];
      j.rShoulder = [0.22, 0.56, -0.32];
      j.lElbow = [-0.28, hipY + 0.14, -0.12];
      j.rElbow = [0.28, hipY + 0.14, -0.12];
      j.lWrist = [-0.22, hipY + 0.09, 0.02];
      j.rWrist = [0.22, hipY + 0.09, 0.02];
      j.lHip = [-0.14, hipY, 0.02];
      j.rHip = [0.14, hipY, 0.02];
      j.lKnee = [-0.17, 0.55, 0.38];
      j.rKnee = [0.17, 0.55, 0.38];
      j.lAnkle = [-0.18, 0.12, 0.44];
      j.rAnkle = [0.18, 0.12, 0.44];
      return [{ kind: 'machine_hip_thrust', pelvis: j.pelvis }];
    }

    case 'hip_abduction': {
      setSeatedMachineBase(j);
      j.lElbow = [-0.26, 0.80, -0.08];
      j.rElbow = [0.26, 0.80, -0.08];
      j.lWrist = [-0.26, 0.56, 0.04];
      j.rWrist = [0.26, 0.56, 0.04];
      const wide = lerp(0.11, 0.38, p);
      const zKnee = lerp(0.36, 0.25, p);
      j.lKnee = [-wide, 0.52, zKnee];
      j.rKnee = [wide, 0.52, zKnee];
      j.lAnkle = [-wide * 0.95, 0.14, zKnee];
      j.rAnkle = [wide * 0.95, 0.14, zKnee];
      return [{ kind: 'machine_hip_abductor', lKnee: j.lKnee, rKnee: j.rKnee }];
    }

    case 'back_extension': {
      j.lAnkle = [-0.14, 0.20, -0.44];
      j.rAnkle = [0.14, 0.20, -0.44];
      j.lKnee = [-0.14, 0.44, -0.22];
      j.rKnee = [0.14, 0.44, -0.22];
      j.pelvis = [0, 0.68, 0.0];
      j.lHip = [-0.13, 0.68, 0.0];
      j.rHip = [0.13, 0.68, 0.0];
      const hingeAng = lerp(0.76, -0.62, p);
      const s = Math.sin(hingeAng);
      const c = Math.cos(hingeAng);
      j.waist = [0, 0.68 + s * 0.20, c * 0.20];
      j.chest = [0, 0.68 + s * 0.44, c * 0.44];
      j.neck = [0, 0.68 + s * 0.59, c * 0.59];
      j.head = [0, 0.68 + s * 0.75, c * 0.75];
      j.facingDir = [0, -c, s];
      j.lShoulder = [-0.21, j.chest[1], j.chest[2]];
      j.rShoulder = [0.21, j.chest[1], j.chest[2]];
      j.lElbow = [-0.22, j.chest[1] - 0.12, j.chest[2] + 0.06];
      j.rElbow = [0.22, j.chest[1] - 0.12, j.chest[2] + 0.06];
      j.lWrist = [-0.06, j.chest[1] - 0.04, j.chest[2] + 0.12];
      j.rWrist = [0.06, j.chest[1] - 0.04, j.chest[2] + 0.12];
      return [{ kind: 'machine_roman_chair', chest: j.chest }];
    }

    default:
      return null;
  }
}

export function computeGym3DMachinePose(
  animType: Gym3DAnimType,
  j: GymJointMap,
  p: number
): GymMachinePropSpec[] | null {
  return (
    poseUpperBodyMachines(animType, j, p) ??
    poseArmShoulderAndLowerMachines(animType, j, p)
  );
}
