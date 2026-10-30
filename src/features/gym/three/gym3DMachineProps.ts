import * as THREE from 'three';
import type { Vec3Tuple } from './gym3DPoseData';
import type { GymMachinePropSpec } from './gym3DMachinePoses';

export interface GymMachinePropBuildHelpers {
  addBar: (a: Vec3Tuple, b: Vec3Tuple, rad: number, mat: THREE.Material) => void;
  addBox: (
    pos: Vec3Tuple,
    scale: Vec3Tuple,
    mat: THREE.Material,
    rotX?: number,
    rotY?: number
  ) => void;
  addDisc: (pos: Vec3Tuple, axisDir: Vec3Tuple, rad: number, thick: number) => void;
  frameMat: THREE.Material;
  chromeMat: THREE.Material;
  leatherMat: THREE.Material;
  leverMat: THREE.Material;
}

function buildPressAndRowMachineProps(
  pr: GymMachinePropSpec,
  h: GymMachinePropBuildHelpers
): boolean {
  switch (pr.kind) {
    case 'machine_incline_press': {
      // BRTW Incline Chest Press: brown angled seat + overhead pivot + green lever arms + foot pedal
      h.addBar([0, 0.46, -0.02], [0, 0.46, 0.28], 0.12, h.leatherMat);
      h.addBar([0, 0.46, -0.04], [0, 1.18, -0.46], 0.12, h.leatherMat);
      h.addBar([-0.46, 0.02, -0.48], [-0.46, 1.56, -0.42], 0.036, h.frameMat);
      h.addBar([0.46, 0.02, -0.48], [0.46, 1.56, -0.42], 0.036, h.frameMat);
      h.addBar([-0.46, 1.54, -0.42], [0.46, 1.54, -0.42], 0.034, h.frameMat);
      h.addBar([-0.42, 1.52, -0.40], pr.lGrip, 0.024, h.leverMat);
      h.addBar([0.42, 1.52, -0.40], pr.rGrip, 0.024, h.leverMat);
      h.addDisc([-0.54, 1.05, -0.32], [1, 0, 0], 0.15, 0.036);
      h.addDisc([0.54, 1.05, -0.32], [1, 0, 0], 0.15, 0.036);
      h.addBar([-0.14, 0.10, 0.56], [0.14, 0.10, 0.56], 0.022, h.chromeMat);
      return true;
    }

    case 'machine_laydown_press': {
      // BRTW Laydown Flat Chest Press: supine brown pad + converging lever arms from sides
      h.addBar([0, 0.47, -0.58], [0, 0.47, 0.38], 0.13, h.leatherMat);
      h.addBar([0, 0.02, -0.46], [0, 0.46, -0.46], 0.035, h.frameMat);
      h.addBar([0, 0.02, 0.28], [0, 0.46, 0.28], 0.035, h.frameMat);
      h.addBar([-0.56, 0.02, -0.18], [-0.56, 0.52, -0.18], 0.036, h.frameMat);
      h.addBar([0.56, 0.02, -0.18], [0.56, 0.52, -0.18], 0.036, h.frameMat);
      h.addBar([-0.54, 0.48, -0.18], pr.lGrip, 0.024, h.leverMat);
      h.addBar([0.54, 0.48, -0.18], pr.rGrip, 0.024, h.leverMat);
      h.addDisc([-0.64, 0.56, -0.18], [1, 0, 0], 0.15, 0.036);
      h.addDisc([0.64, 0.56, -0.18], [1, 0, 0], 0.15, 0.036);
      return true;
    }

    case 'machine_chest_row': {
      // Impulse Chest-Supported Row: straddle seat + front chest pad + forward lever arms
      h.addBar([0, 0.46, -0.24], [0, 0.46, 0.04], 0.11, h.leatherMat);
      h.addBar([0, 0.78, 0.15], [0, 1.08, 0.21], 0.10, h.leatherMat);
      h.addBar([0, 0.02, -0.10], [0, 0.46, -0.10], 0.036, h.frameMat);
      h.addBar([0, 0.02, 0.22], [0, 0.80, 0.17], 0.034, h.frameMat);
      h.addBar([0, 0.04, 0.22], [0, 0.04, 0.78], 0.038, h.frameMat);
      h.addBar([-0.28, 0.12, 0.74], pr.lGrip, 0.022, h.leverMat);
      h.addBar([0.28, 0.12, 0.74], pr.rGrip, 0.022, h.leverMat);
      h.addDisc([0, 0.42, 0.70], [0, 0.4, 0.9], 0.16, 0.04);
      return true;
    }

    case 'machine_iso_pulldown': {
      // BRTW Iso-Lateral High Pulldown: seat + thigh rollers + overhead converging levers
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.18], 0.12, h.leatherMat);
      h.addBar([-0.22, 0.60, 0.24], [0.22, 0.60, 0.24], 0.045, h.leatherMat);
      h.addBar([-0.42, 0.02, 0.36], [-0.42, 1.98, 0.28], 0.038, h.frameMat);
      h.addBar([0.42, 0.02, 0.36], [0.42, 1.98, 0.28], 0.038, h.frameMat);
      h.addBar([-0.42, 1.96, 0.28], [0.42, 1.96, 0.28], 0.036, h.frameMat);
      h.addBar([-0.40, 1.94, 0.28], pr.lGrip, 0.024, h.leverMat);
      h.addBar([0.40, 1.94, 0.28], pr.rGrip, 0.024, h.leverMat);
      h.addDisc([-0.52, 1.38, 0.34], [1, 0, 0], 0.15, 0.036);
      h.addDisc([0.52, 1.38, 0.34], [1, 0, 0], 0.15, 0.036);
      return true;
    }

    case 'machine_assisted_station': {
      // BRTW Assisted Pull-Up & Parallel Dip Station with moving counterweight knee pad
      h.addBar([-0.44, 0.02, -0.22], [-0.44, 2.02, -0.22], 0.038, h.frameMat);
      h.addBar([0.44, 0.02, -0.22], [0.44, 2.02, -0.22], 0.038, h.frameMat);
      h.addBar([-0.44, 2.0, -0.22], [0.44, 2.0, -0.22], 0.034, h.frameMat);
      h.addBar([-0.44, 1.96, -0.22], [-0.36, 1.92, 0.06], 0.022, h.chromeMat);
      h.addBar([0.44, 1.96, -0.22], [0.36, 1.92, 0.06], 0.022, h.chromeMat);
      h.addBar([-0.44, 1.10, -0.22], [-0.27, 1.10, 0.14], 0.024, h.chromeMat);
      h.addBar([0.44, 1.10, -0.22], [0.27, 1.10, 0.14], 0.024, h.chromeMat);
      h.addBox([0, pr.kneePadY, -0.02], [0.42, 0.07, 0.28], h.leatherMat);
      h.addBar([0, pr.kneePadY, -0.16], [0, pr.kneePadY, -0.22], 0.028, h.leverMat);
      return true;
    }

    default:
      return false;
  }
}

function buildArmAndShoulderMachineProps(
  pr: GymMachinePropSpec,
  h: GymMachinePropBuildHelpers
): boolean {
  switch (pr.kind) {
    case 'machine_preacher_curl': {
      // BRTW Plate-Loaded Biceps Curl: seat + 45 deg sloped arm pad + cam curl levers
      h.addBar([0, 0.46, -0.28], [0, 0.46, -0.04], 0.11, h.leatherMat);
      h.addBox([0, 0.84, 0.12], [0.48, 0.08, 0.28], h.leatherMat, 0.68);
      h.addBar([0, 0.02, -0.18], [0, 0.46, -0.18], 0.034, h.frameMat);
      h.addBar([0, 0.02, 0.16], [0, 0.80, 0.14], 0.036, h.frameMat);
      h.addBar([-0.26, 0.82, 0.22], pr.lGrip, 0.020, h.leverMat);
      h.addBar([0.26, 0.82, 0.22], pr.rGrip, 0.020, h.leverMat);
      h.addBar(pr.lGrip, pr.rGrip, 0.016, h.chromeMat);
      h.addDisc([0.36, 0.76, 0.24], [1, 0, 0], 0.14, 0.035);
      return true;
    }

    case 'machine_shoulder_press': {
      // BRTW Plate-Loaded Shoulder Press: upright brown pad + rear frame + green converging arms
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.18], 0.12, h.leatherMat);
      h.addBar([0, 0.48, -0.18], [0, 1.24, -0.26], 0.12, h.leatherMat);
      h.addBar([-0.46, 0.02, -0.36], [-0.46, 1.38, -0.32], 0.036, h.frameMat);
      h.addBar([0.46, 0.02, -0.36], [0.46, 1.38, -0.32], 0.036, h.frameMat);
      h.addBar([-0.46, 1.36, -0.32], [0.46, 1.36, -0.32], 0.032, h.frameMat);
      h.addBar([-0.42, 0.96, -0.30], pr.lGrip, 0.022, h.leverMat);
      h.addBar([0.42, 0.96, -0.30], pr.rGrip, 0.022, h.leverMat);
      h.addDisc([-0.54, 0.98, -0.28], [1, 0, 0], 0.15, 0.036);
      h.addDisc([0.54, 0.98, -0.28], [1, 0, 0], 0.15, 0.036);
      return true;
    }

    case 'machine_lateral_raise': {
      // BRTW Seated Lateral Raise: seat + backrest + overhead pivot + forearm roller pads
      h.addBar([0, 0.47, -0.18], [0, 0.47, 0.16], 0.12, h.leatherMat);
      h.addBar([0, 0.48, -0.20], [0, 1.18, -0.24], 0.11, h.leatherMat);
      h.addBar([0, 0.02, -0.32], [0, 1.46, -0.32], 0.042, h.frameMat);
      h.addBar([-0.24, 1.12, -0.26], pr.lElbow, 0.020, h.leverMat);
      h.addBar([0.24, 1.12, -0.26], pr.rElbow, 0.020, h.leverMat);
      h.addBar(
        [pr.lElbow[0], pr.lElbow[1] - 0.04, pr.lElbow[2]],
        [pr.lElbow[0], pr.lElbow[1] - 0.04, pr.lElbow[2] + 0.22],
        0.042,
        h.leatherMat
      );
      h.addBar(
        [pr.rElbow[0], pr.rElbow[1] - 0.04, pr.rElbow[2]],
        [pr.rElbow[0], pr.rElbow[1] - 0.04, pr.rElbow[2] + 0.22],
        0.042,
        h.leatherMat
      );
      return true;
    }

    case 'machine_reverse_fly': {
      // BRTW Rear Deltoid / Reverse Pec Deck: seat + front sternum pad + overhead fly arms
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.12], 0.12, h.leatherMat);
      h.addBar([0, 0.72, 0.13], [0, 1.14, 0.13], 0.10, h.leatherMat);
      h.addBar([0, 0.02, 0.62], [0, 1.88, 0.62], 0.042, h.frameMat);
      h.addBar([-0.18, 1.82, 0.56], pr.lGrip, 0.018, h.leverMat);
      h.addBar([0.18, 1.82, 0.56], pr.rGrip, 0.018, h.leverMat);
      return true;
    }

    default:
      return false;
  }
}

function buildLegAndCoreMachineProps(
  pr: GymMachinePropSpec,
  h: GymMachinePropBuildHelpers
): boolean {
  switch (pr.kind) {
    case 'machine_leg_extension': {
      // BRTW Leg Curl/Extension: seat + backrest + side stack + shin roller bar
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.28], 0.13, h.leatherMat);
      h.addBar([0, 0.48, -0.18], [0, 1.18, -0.26], 0.12, h.leatherMat);
      h.addBar([0, 0.02, -0.06], [0, 0.47, -0.06], 0.038, h.frameMat);
      h.addBox([-0.48, 0.68, 0.06], [0.16, 1.28, 0.30], h.frameMat);
      const midAnkle: Vec3Tuple = [
        0,
        (pr.lAnkle[1] + pr.rAnkle[1]) * 0.5 + 0.04,
        (pr.lAnkle[2] + pr.rAnkle[2]) * 0.5 + 0.05,
      ];
      h.addBar([0.24, 0.54, 0.34], [0.24, midAnkle[1], midAnkle[2]], 0.022, h.leverMat);
      h.addBar(
        [-0.24, midAnkle[1], midAnkle[2]],
        [0.24, midAnkle[1], midAnkle[2]],
        0.048,
        h.leatherMat
      );
      return true;
    }

    case 'machine_seated_leg_curl': {
      // BRTW Leg Curl/Extension (Seated Curl mode): seat + thigh lock pad + rear heel roller
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.28], 0.13, h.leatherMat);
      h.addBar([0, 0.48, -0.18], [0, 1.18, -0.26], 0.12, h.leatherMat);
      h.addBar([-0.24, 0.62, 0.22], [0.24, 0.62, 0.22], 0.046, h.leatherMat);
      h.addBox([-0.48, 0.68, 0.06], [0.16, 1.28, 0.30], h.frameMat);
      const heelPos: Vec3Tuple = [
        0,
        (pr.lAnkle[1] + pr.rAnkle[1]) * 0.5 - 0.04,
        (pr.lAnkle[2] + pr.rAnkle[2]) * 0.5 - 0.05,
      ];
      h.addBar([0.24, 0.54, 0.34], [0.24, heelPos[1], heelPos[2]], 0.022, h.leverMat);
      h.addBar(
        [-0.24, heelPos[1], heelPos[2]],
        [0.24, heelPos[1], heelPos[2]],
        0.048,
        h.leatherMat
      );
      return true;
    }

    case 'machine_super_squat': {
      // BRTW Super Squat: angled footplate + dual guide rails + moving backrest & shoulder pads
      h.addBox([0, 0.10, 0.30], [0.64, 0.06, 0.46], h.frameMat, -0.28);
      h.addBar([-0.36, 0.04, -0.52], [-0.36, 1.72, -0.08], 0.032, h.frameMat);
      h.addBar([0.36, 0.04, -0.52], [0.36, 1.72, -0.08], 0.032, h.frameMat);
      const shY = pr.lShoulder[1];
      const shZ = pr.lShoulder[2];
      h.addBox([0, shY - 0.26, shZ - 0.10], [0.46, 0.62, 0.08], h.leatherMat, -0.26);
      h.addBar(
        [pr.lShoulder[0], shY + 0.05, shZ - 0.08],
        [pr.lShoulder[0], shY + 0.05, shZ + 0.16],
        0.052,
        h.leatherMat
      );
      h.addBar(
        [pr.rShoulder[0], shY + 0.05, shZ - 0.08],
        [pr.rShoulder[0], shY + 0.05, shZ + 0.16],
        0.052,
        h.leatherMat
      );
      h.addDisc([-0.46, shY - 0.18, shZ - 0.12], [1, 0, 0], 0.16, 0.038);
      h.addDisc([0.46, shY - 0.18, shZ - 0.12], [1, 0, 0], 0.16, 0.038);
      return true;
    }

    case 'machine_hip_thrust': {
      // BRTW Hip Thrust: rear back pad bench + angled footplate + padded hip bar + side plates
      h.addBox([0, 0.44, -0.44], [0.54, 0.14, 0.26], h.leatherMat, 0.22);
      h.addBar([-0.24, 0.02, -0.46], [-0.24, 0.42, -0.46], 0.032, h.frameMat);
      h.addBar([0.24, 0.02, -0.46], [0.24, 0.42, -0.46], 0.032, h.frameMat);
      h.addBox([0, 0.08, 0.48], [0.56, 0.06, 0.36], h.frameMat, -0.26);
      const barY = pr.pelvis[1] + 0.09;
      const barZ = pr.pelvis[2] + 0.02;
      h.addBar([-0.48, barY, barZ], [0.48, barY, barZ], 0.020, h.leverMat);
      h.addBar([-0.20, barY, barZ], [0.20, barY, barZ], 0.046, h.leatherMat);
      h.addDisc([-0.46, barY, barZ], [1, 0, 0], 0.16, 0.038);
      h.addDisc([0.46, barY, barZ], [1, 0, 0], 0.16, 0.038);
      return true;
    }

    case 'machine_hip_abductor': {
      // BRTW Hip Abductor/Adductor: seat + backrest + front stack + swivel knee pads
      h.addBar([0, 0.47, -0.16], [0, 0.47, 0.20], 0.12, h.leatherMat);
      h.addBar([0, 0.48, -0.18], [0, 1.16, -0.26], 0.11, h.leatherMat);
      h.addBox([0, 0.62, 0.68], [0.28, 1.18, 0.22], h.frameMat);
      h.addBar([0, 0.06, 0.0], [0, 0.06, 0.66], 0.036, h.frameMat);
      h.addBox([pr.lKnee[0] - 0.05, pr.lKnee[1], pr.lKnee[2]], [0.06, 0.16, 0.22], h.leatherMat);
      h.addBox([pr.rKnee[0] + 0.05, pr.rKnee[1], pr.rKnee[2]], [0.06, 0.16, 0.22], h.leatherMat);
      return true;
    }

    case 'machine_roman_chair': {
      // 45-degree Roman Chair / Back Extension + 10kg plate at chest
      h.addBar([0, 0.04, -0.52], [0, 0.68, 0.02], 0.036, h.frameMat);
      h.addBar([-0.26, 0.02, -0.52], [0.26, 0.02, -0.52], 0.034, h.frameMat);
      h.addBar([-0.26, 0.02, 0.14], [0.26, 0.02, 0.14], 0.034, h.frameMat);
      h.addBar([0, 0.02, 0.14], [0, 0.66, 0.02], 0.032, h.frameMat);
      h.addBar([-0.22, 0.22, -0.42], [0.22, 0.22, -0.42], 0.045, h.leatherMat);
      h.addBox([0, 0.66, -0.02], [0.42, 0.09, 0.22], h.leatherMat, 0.72);
      h.addDisc(
        [pr.chest[0], pr.chest[1] - 0.04, pr.chest[2] + 0.10],
        [0, -0.5, 0.86],
        0.13,
        0.03
      );
      return true;
    }

    case 'step_calf_block': {
      h.addBox([0, 0.04, 0.02], [0.54, 0.08, 0.24], h.frameMat);
      return true;
    }

    default:
      return false;
  }
}

export function buildGymMachinePropMesh(
  pr: GymMachinePropSpec,
  helpers: GymMachinePropBuildHelpers
): boolean {
  return (
    buildPressAndRowMachineProps(pr, helpers) ||
    buildArmAndShoulderMachineProps(pr, helpers) ||
    buildLegAndCoreMachineProps(pr, helpers)
  );
}
