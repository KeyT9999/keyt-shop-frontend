import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GymMuscleRegion } from '../types/gym';
import { buildGymMachinePropMesh } from './gym3DMachineProps';
import type { GymMachinePropSpec } from './gym3DMachinePoses';
import type { ComputedGymPoseFrame, Vec3Tuple } from './gym3DPoseData';

/**
 * Optional Blender .glb registry:
 * Whenever you export a custom rigged .glb from Blender (e.g. Z-Anatomy or Sketchfab)
 * into `public/models/gym/<exerciseId>.glb`, add its ID here so Three.js loads it directly
 * without causing 404 requests for exercises that use the built-in procedural mannequin.
 */
export const REGISTERED_BLENDER_GLB_EXERCISES = new Set<string>([]);

const glbBufferCache = new Map<string, Promise<ArrayBuffer>>();

const COLOR_NEUTRAL = new THREE.Color(0xcbd5e1);
const COLOR_JOINT = new THREE.Color(0x475569);
const COLOR_PRIMARY = new THREE.Color(0xf05a28);
const COLOR_SECONDARY = new THREE.Color(0xfbbf24);
const COLOR_EQUIP_METAL = new THREE.Color(0xe2e8f0);
const COLOR_EQUIP_PLATE = new THREE.Color(0x1e293b);
const COLOR_BENCH_PAD = new THREE.Color(0x334155);

const UP_AXIS = new THREE.Vector3(0, 1, 0);

interface LimbSegmentHandle {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  region?: GymMuscleRegion;
}

export interface GymProceduralSceneRig {
  root: THREE.Group;
  mannequinGroup: THREE.Group;
  propsGroup: THREE.Group;
  updateFrame: (
    frame: ComputedGymPoseFrame,
    primary: GymMuscleRegion[],
    secondary: GymMuscleRegion[],
    contractionFactor: number
  ) => void;
  dispose: () => void;
}

function makeRegionMaterial(baseColor = COLOR_NEUTRAL): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: baseColor.clone(),
    roughness: 0.34,
    metalness: 0.22,
  });
}

function placeSegmentBetween(
  mesh: THREE.Object3D,
  a: Vec3Tuple,
  b: Vec3Tuple,
  radius: number
): void {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const dir = vb.clone().sub(va);
  const len = Math.max(dir.length(), 0.001);
  const mid = va.add(vb).multiplyScalar(0.5);

  mesh.position.copy(mid);
  mesh.scale.set(radius, len, radius);
  mesh.quaternion.setFromUnitVectors(UP_AXIS, dir.normalize());
}

function styleMuscleMaterial(
  mat: THREE.MeshStandardMaterial,
  region: GymMuscleRegion | undefined,
  primary: GymMuscleRegion[],
  secondary: GymMuscleRegion[],
  contractionFactor: number
): void {
  if (region && primary.includes(region)) {
    mat.color.copy(COLOR_PRIMARY);
    mat.emissive.copy(COLOR_PRIMARY);
    mat.emissiveIntensity = 0.42 + contractionFactor * 0.58;
  } else if (region && secondary.includes(region)) {
    mat.color.copy(COLOR_SECONDARY);
    mat.emissive.copy(COLOR_SECONDARY);
    mat.emissiveIntensity = 0.22 + contractionFactor * 0.3;
  } else {
    mat.color.copy(COLOR_NEUTRAL);
    mat.emissive.setHex(0x0f172a);
    mat.emissiveIntensity = 0.08;
  }
}

export function createGymProceduralSceneRig(): GymProceduralSceneRig {
  const root = new THREE.Group();
  const mannequinGroup = new THREE.Group();
  const propsGroup = new THREE.Group();
  root.add(mannequinGroup);
  root.add(propsGroup);

  const unitCylinderGeo = new THREE.CylinderGeometry(1, 0.88, 1, 18);
  const unitSphereGeo = new THREE.SphereGeometry(1, 20, 16);
  const unitBoxGeo = new THREE.BoxGeometry(1, 1, 1);

  const jointMat = new THREE.MeshStandardMaterial({
    color: COLOR_JOINT,
    roughness: 0.5,
    metalness: 0.25,
  });
  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x38bdf8),
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  const equipMetalMat = new THREE.MeshStandardMaterial({
    color: COLOR_EQUIP_METAL,
    roughness: 0.3,
    metalness: 0.75,
  });
  const equipPlateMat = new THREE.MeshStandardMaterial({
    color: COLOR_EQUIP_PLATE,
    roughness: 0.55,
    metalness: 0.3,
  });
  const benchPadMat = new THREE.MeshStandardMaterial({
    color: COLOR_BENCH_PAD,
    roughness: 0.65,
    metalness: 0.1,
  });
  const brtwLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x7c4a2d,
    roughness: 0.58,
    metalness: 0.12,
  });
  const brtwLeverMat = new THREE.MeshStandardMaterial({
    color: 0x648b78,
    roughness: 0.35,
    metalness: 0.65,
  });

  const handles: Record<string, LimbSegmentHandle> = {};

  function addSegment(
    key: string,
    geo: THREE.BufferGeometry,
    region?: GymMuscleRegion
  ): LimbSegmentHandle {
    const material = makeRegionMaterial();
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = false;
    mannequinGroup.add(mesh);
    const h = { mesh, material, region };
    handles[key] = h;
    return h;
  }

  // Anatomical body parts
  addSegment('coreTorso', unitCylinderGeo, 'core');
  addSegment('chestPlate', unitBoxGeo, 'chest');
  addSegment('backLatPlate', unitBoxGeo, 'back');
  addSegment('glutesPelvis', unitSphereGeo, 'glutes');
  addSegment('lDeltoid', unitSphereGeo, 'shoulders');
  addSegment('rDeltoid', unitSphereGeo, 'shoulders');

  // Split anterior/posterior upper arm & thigh muscles for crystal-clear Biceps vs Triceps & Quads vs Hamstrings!
  addSegment('lBicep', unitCylinderGeo, 'biceps');
  addSegment('rBicep', unitCylinderGeo, 'biceps');
  addSegment('lTricep', unitCylinderGeo, 'triceps');
  addSegment('rTricep', unitCylinderGeo, 'triceps');
  addSegment('lForearm', unitCylinderGeo, 'forearms');
  addSegment('rForearm', unitCylinderGeo, 'forearms');

  addSegment('lQuad', unitCylinderGeo, 'quads');
  addSegment('rQuad', unitCylinderGeo, 'quads');
  addSegment('lHamstring', unitCylinderGeo, 'hamstrings');
  addSegment('rHamstring', unitCylinderGeo, 'hamstrings');
  addSegment('lCalf', unitCylinderGeo, 'calves');
  addSegment('rCalf', unitCylinderGeo, 'calves');
  addSegment('neck', unitCylinderGeo);

  const headGroup = new THREE.Group();
  const headSphere = new THREE.Mesh(unitSphereGeo, makeRegionMaterial());
  headSphere.scale.set(0.105, 0.125, 0.11);
  const visorBar = new THREE.Mesh(unitBoxGeo, visorMat);
  visorBar.scale.set(0.13, 0.028, 0.04);
  visorBar.position.set(0, 0.015, 0.095);
  headGroup.add(headSphere, visorBar);
  mannequinGroup.add(headGroup);

  const jointSpheres = Array.from({ length: 10 }, () => {
    const m = new THREE.Mesh(unitSphereGeo, jointMat);
    mannequinGroup.add(m);
    return m;
  });

  // Reusable equipment pool cleared & rebuilt lightly on frame
  function rebuildProps(frame: ComputedGymPoseFrame): void {
    while (propsGroup.children.length > 0) {
      propsGroup.remove(propsGroup.children[0]);
    }

    const addBar = (a: Vec3Tuple, b: Vec3Tuple, rad: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(unitCylinderGeo, mat);
      placeSegmentBetween(m, a, b, rad);
      propsGroup.add(m);
    };

    const addDisc = (pos: Vec3Tuple, axisDir: Vec3Tuple, rad: number, thick: number) => {
      const m = new THREE.Mesh(unitCylinderGeo, equipPlateMat);
      m.position.set(pos[0], pos[1], pos[2]);
      m.scale.set(rad, thick, rad);
      const dir = new THREE.Vector3(axisDir[0], axisDir[1], axisDir[2]).normalize();
      m.quaternion.setFromUnitVectors(UP_AXIS, dir);
      propsGroup.add(m);
    };

    const addBox = (
      pos: Vec3Tuple,
      scale: Vec3Tuple,
      mat: THREE.Material,
      rotX = 0,
      rotY = 0
    ) => {
      const m = new THREE.Mesh(unitBoxGeo, mat);
      m.position.set(pos[0], pos[1], pos[2]);
      m.scale.set(scale[0], scale[1], scale[2]);
      m.rotation.set(rotX, rotY, 0);
      propsGroup.add(m);
    };

    const machinePropHelpers = {
      addBar,
      addBox,
      addDisc,
      frameMat: equipPlateMat,
      chromeMat: equipMetalMat,
      leatherMat: brtwLeatherMat,
      leverMat: brtwLeverMat,
    };

    for (const pr of frame.props) {
      if (pr.kind === 'dumbbell_hammer') {
        const [x, y, z] = pr.pos;
        addBar([x, y - 0.11, z], [x, y + 0.11, z], 0.018, equipMetalMat);
        addDisc([x, y + 0.09, z], [0, 1, 0], 0.068, 0.035);
        addDisc([x, y - 0.09, z], [0, 1, 0], 0.068, 0.035);
      } else if (pr.kind === 'dumbbell_horiz') {
        const [x, y, z] = pr.pos;
        addBar([x - 0.11, y, z], [x + 0.11, y, z], 0.018, equipMetalMat);
        addDisc([x - 0.09, y, z], [1, 0, 0], 0.068, 0.035);
        addDisc([x + 0.09, y, z], [1, 0, 0], 0.068, 0.035);
      } else if (pr.kind === 'dumbbell_single_vertical') {
        const [x, y, z] = pr.pos;
        addBar([x, y - 0.13, z], [x, y + 0.13, z], 0.02, equipMetalMat);
        addDisc([x, y + 0.10, z], [0, 1, 0], 0.085, 0.04);
        addDisc([x, y - 0.10, z], [0, 1, 0], 0.085, 0.04);
      } else if (pr.kind === 'barbell') {
        const extL: Vec3Tuple = [pr.lPos[0] - 0.28, pr.lPos[1], pr.lPos[2]];
        const extR: Vec3Tuple = [pr.rPos[0] + 0.28, pr.rPos[1], pr.rPos[2]];
        addBar(extL, extR, 0.016, equipMetalMat);
        addDisc([pr.lPos[0] - 0.17, pr.lPos[1], pr.lPos[2]], [1, 0, 0], 0.145, 0.035);
        addDisc([pr.lPos[0] - 0.22, pr.lPos[1], pr.lPos[2]], [1, 0, 0], 0.115, 0.028);
        addDisc([pr.rPos[0] + 0.17, pr.rPos[1], pr.rPos[2]], [1, 0, 0], 0.145, 0.035);
        addDisc([pr.rPos[0] + 0.22, pr.rPos[1], pr.rPos[2]], [1, 0, 0], 0.115, 0.028);
      } else if (pr.kind === 'bench_flat' || pr.kind === 'bench_prone') {
        const zStart = pr.kind === 'bench_prone' ? -0.45 : -0.58;
        const zEnd = pr.kind === 'bench_prone' ? 0.55 : 0.36;
        addBar([0, 0.47, zStart], [0, 0.47, zEnd], 0.13, benchPadMat);
        addBar([0, 0.02, zStart + 0.1], [0, 0.46, zStart + 0.1], 0.032, equipMetalMat);
        addBar([0, 0.02, zEnd - 0.1], [0, 0.46, zEnd - 0.1], 0.032, equipMetalMat);
      } else if (pr.kind === 'bench_incline') {
        addBar([0, 0.48, -0.04], [0, 0.48, 0.26], 0.12, benchPadMat);
        addBar([0, 0.48, -0.04], [0, 1.12, -0.54], 0.12, benchPadMat);
        addBar([0, 0.02, 0.12], [0, 0.48, 0.12], 0.032, equipMetalMat);
        addBar([0, 0.02, -0.34], [0, 0.78, -0.30], 0.032, equipMetalMat);
      } else if (pr.kind === 'bench_upright') {
        addBar([0, 0.48, 0.18], [0, 0.48, -0.18], 0.12, benchPadMat);
        addBar([0, 0.48, -0.18], [0, 1.24, -0.24], 0.12, benchPadMat);
        addBar([0, 0.02, -0.10], [0, 0.48, -0.10], 0.035, equipMetalMat);
      } else if (pr.kind === 'cable_lat_bar') {
        const mid: Vec3Tuple = [
          (pr.lPos[0] + pr.rPos[0]) * 0.5,
          (pr.lPos[1] + pr.rPos[1]) * 0.5,
          (pr.lPos[2] + pr.rPos[2]) * 0.5,
        ];
        addBar([pr.lPos[0] - 0.08, pr.lPos[1], pr.lPos[2]], [pr.rPos[0] + 0.08, pr.rPos[1], pr.rPos[2]], 0.016, equipMetalMat);
        addBar([0, 2.15, 0], mid, 0.007, equipMetalMat);
        addBar([0, 0.02, 0.48], [0, 2.15, 0.48], 0.035, equipPlateMat);
        addBar([0, 2.15, 0.48], [0, 2.15, 0], 0.03, equipPlateMat);
      } else if (pr.kind === 'cable_high_rope') {
        const knot: Vec3Tuple = [
          0,
          (pr.lPos[1] + pr.rPos[1]) * 0.5 + 0.10,
          (pr.lPos[2] + pr.rPos[2]) * 0.5 + 0.04,
        ];
        addBar(pr.anchor, knot, 0.008, equipMetalMat);
        addBar(knot, pr.lPos, 0.014, equipPlateMat);
        addBar(knot, pr.rPos, 0.014, equipPlateMat);
        addBar([pr.anchor[0], 0.02, pr.anchor[2] + 0.15], [pr.anchor[0], 2.05, pr.anchor[2] + 0.15], 0.035, equipPlateMat);
      } else if (pr.kind === 'cable_dual_crossover') {
        addBar([-0.82, 1.95, -0.15], pr.lPos, 0.007, equipMetalMat);
        addBar([0.82, 1.95, -0.15], pr.rPos, 0.007, equipMetalMat);
        addBar([-0.82, 0.02, -0.15], [-0.82, 2.0, -0.15], 0.032, equipPlateMat);
        addBar([0.82, 0.02, -0.15], [0.82, 2.0, -0.15], 0.032, equipPlateMat);
      } else if (pr.kind === 'cable_low_row') {
        const mid: Vec3Tuple = [
          (pr.lPos[0] + pr.rPos[0]) * 0.5,
          (pr.lPos[1] + pr.rPos[1]) * 0.5,
          (pr.lPos[2] + pr.rPos[2]) * 0.5,
        ];
        addBar([0, 0.52, 0.78], mid, 0.008, equipMetalMat);
        addBar(pr.lPos, pr.rPos, 0.022, equipMetalMat);
      } else if (pr.kind === 'leg_press_sled') {
        addBar([0, 0.26, -0.26], [0, 0.90, -0.74], 0.13, benchPadMat);
        const footMid: Vec3Tuple = [
          0,
          (pr.lFoot[1] + pr.rFoot[1]) * 0.5 + 0.06,
          (pr.lFoot[2] + pr.rFoot[2]) * 0.5 + 0.06,
        ];
        const sledPlate = new THREE.Mesh(unitBoxGeo, equipPlateMat);
        sledPlate.position.set(footMid[0], footMid[1], footMid[2]);
        sledPlate.scale.set(0.56, 0.36, 0.05);
        sledPlate.rotation.x = -0.65;
        propsGroup.add(sledPlate);
      } else {
        buildGymMachinePropMesh(pr as GymMachinePropSpec, machinePropHelpers);
      }
    }
  }

  function updateFrame(
    frame: ComputedGymPoseFrame,
    primary: GymMuscleRegion[],
    secondary: GymMuscleRegion[],
    contractionFactor: number
  ): void {
    const { joints: j } = frame;
    const fwd = new THREE.Vector3(j.facingDir[0], j.facingDir[1], j.facingDir[2]).normalize();
    const back = fwd.clone().negate();

    // Torso & Chest/Back anatomical plates
    placeSegmentBetween(handles.coreTorso.mesh, j.pelvis, j.chest, 0.135);

    const vChest = new THREE.Vector3(...j.chest);
    const vPelvis = new THREE.Vector3(...j.pelvis);
    const spineUp = vChest.clone().sub(vPelvis).normalize();

    const chestPos = vChest.clone().addScaledVector(fwd, 0.075).addScaledVector(spineUp, -0.03);
    handles.chestPlate.mesh.position.copy(chestPos);
    handles.chestPlate.mesh.scale.set(0.28, 0.17, 0.09);
    handles.chestPlate.mesh.quaternion.setFromUnitVectors(UP_AXIS, spineUp);

    const backPos = vChest.clone().addScaledVector(back, 0.065).addScaledVector(spineUp, -0.05);
    handles.backLatPlate.mesh.position.copy(backPos);
    handles.backLatPlate.mesh.scale.set(0.30, 0.24, 0.08);
    handles.backLatPlate.mesh.quaternion.setFromUnitVectors(UP_AXIS, spineUp);

    handles.glutesPelvis.mesh.position.set(
      j.pelvis[0] + back.x * 0.02,
      j.pelvis[1],
      j.pelvis[2] + back.z * 0.02
    );
    handles.glutesPelvis.mesh.scale.set(0.17, 0.11, 0.13);

    // Shoulders
    handles.lDeltoid.mesh.position.set(...j.lShoulder);
    handles.lDeltoid.mesh.scale.setScalar(0.074);
    handles.rDeltoid.mesh.position.set(...j.rShoulder);
    handles.rDeltoid.mesh.scale.setScalar(0.074);

    // Split Bicep (anterior) vs Tricep (posterior) along upper arm
    const offF = (pt: Vec3Tuple, sign: number, amt: number): Vec3Tuple => [
      pt[0] + fwd.x * sign * amt,
      pt[1] + fwd.y * sign * amt,
      pt[2] + fwd.z * sign * amt,
    ];

    placeSegmentBetween(handles.lBicep.mesh, offF(j.lShoulder, 1, 0.018), offF(j.lElbow, 1, 0.018), 0.044);
    placeSegmentBetween(handles.rBicep.mesh, offF(j.rShoulder, 1, 0.018), offF(j.rElbow, 1, 0.018), 0.044);
    placeSegmentBetween(handles.lTricep.mesh, offF(j.lShoulder, -1, 0.018), offF(j.lElbow, -1, 0.018), 0.044);
    placeSegmentBetween(handles.rTricep.mesh, offF(j.rShoulder, -1, 0.018), offF(j.rElbow, -1, 0.018), 0.044);

    placeSegmentBetween(handles.lForearm.mesh, j.lElbow, j.lWrist, 0.044);
    placeSegmentBetween(handles.rForearm.mesh, j.rElbow, j.rWrist, 0.044);

    // Split Quad (anterior) vs Hamstring (posterior) along thigh
    placeSegmentBetween(handles.lQuad.mesh, offF(j.lHip, 1, 0.024), offF(j.lKnee, 1, 0.024), 0.062);
    placeSegmentBetween(handles.rQuad.mesh, offF(j.rHip, 1, 0.024), offF(j.rKnee, 1, 0.024), 0.062);
    placeSegmentBetween(handles.lHamstring.mesh, offF(j.lHip, -1, 0.024), offF(j.lKnee, -1, 0.024), 0.058);
    placeSegmentBetween(handles.rHamstring.mesh, offF(j.rHip, -1, 0.024), offF(j.rKnee, -1, 0.024), 0.058);

    placeSegmentBetween(handles.lCalf.mesh, j.lKnee, j.lAnkle, 0.052);
    placeSegmentBetween(handles.rCalf.mesh, j.rKnee, j.rAnkle, 0.052);
    placeSegmentBetween(handles.neck.mesh, j.chest, j.neck, 0.048);

    // Head + directional visor
    headGroup.position.set(...j.head);
    headGroup.lookAt(j.head[0] + fwd.x, j.head[1] + fwd.y, j.head[2] + fwd.z);

    // Joint spheres for elbows, wrists, knees, ankles, hips
    const jointPoints: Vec3Tuple[] = [
      j.lElbow,
      j.rElbow,
      j.lWrist,
      j.rWrist,
      j.lHip,
      j.rHip,
      j.lKnee,
      j.rKnee,
      j.lAnkle,
      j.rAnkle,
    ];
    jointPoints.forEach((pt, idx) => {
      jointSpheres[idx].position.set(pt[0], pt[1], pt[2]);
      jointSpheres[idx].scale.setScalar(idx < 4 ? 0.044 : 0.054);
    });

    // Apply primary (#F05A28) & secondary (#F59E0B) muscle glow
    Object.values(handles).forEach((h) => {
      styleMuscleMaterial(h.material, h.region, primary, secondary, contractionFactor);
    });

    rebuildProps(frame);
  }

  function dispose(): void {
    unitCylinderGeo.dispose();
    unitSphereGeo.dispose();
    unitBoxGeo.dispose();
    jointMat.dispose();
    visorMat.dispose();
    equipMetalMat.dispose();
    equipPlateMat.dispose();
    benchPadMat.dispose();
    brtwLeatherMat.dispose();
    brtwLeverMat.dispose();
    Object.values(handles).forEach((h) => h.material.dispose());
  }

  return {
    root,
    mannequinGroup,
    propsGroup,
    updateFrame,
    dispose,
  };
}

export async function loadOptionalBlenderExerciseGlb(
  exerciseId: string,
  glbUrl: string
): Promise<{ group: THREE.Group; mixer: THREE.AnimationMixer | null } | null> {
  if (!REGISTERED_BLENDER_GLB_EXERCISES.has(exerciseId)) {
    return null;
  }

  let bufPromise = glbBufferCache.get(glbUrl);
  if (!bufPromise) {
    bufPromise = fetch(glbUrl).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch custom GLB: ${glbUrl}`);
      return r.arrayBuffer();
    });
    glbBufferCache.set(glbUrl, bufPromise);
  }

  const buffer = await bufPromise;
  const loader = new GLTFLoader();
  const gltf = await new Promise<GLTF>((resolve, reject) => {
    loader.parse(buffer.slice(0), '/models/gym/', resolve, reject);
  });

  const scene = gltf.scene;
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = 1.75 / Math.max(size.x, size.y, size.z, 0.001);
  scene.scale.setScalar(scale);
  scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

  const wrapper = new THREE.Group();
  wrapper.add(scene);

  let mixer: THREE.AnimationMixer | null = null;
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(scene);
    mixer.clipAction(gltf.animations[0]).play();
  }

  return { group: wrapper, mixer };
}
