import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedRobotRig {
  rootGroup: THREE.Group;
  mixer: THREE.AnimationMixer;
  primaryAction: THREE.AnimationAction | null;
  mouthNode: THREE.Object3D | null;
  eyesNode: THREE.Object3D | null;
  earsNode: THREE.Object3D | null;
  leftHandNode: THREE.Object3D | null;
  rightHandNode: THREE.Object3D | null;
  waveNodes: THREE.Object3D[];
  emissiveMaterials: THREE.MeshStandardMaterial[];
  dispose: () => void;
}

const DEFAULT_MODEL_URL = '/models/robot.glb';

// Singleton ArrayBuffer cache so multiple Robot3D instances never re-download the 290KB GLB
const modelBufferCache = new Map<string, Promise<ArrayBuffer>>();

export function fetchRobotModelBuffer(url = DEFAULT_MODEL_URL): Promise<ArrayBuffer> {
  const existing = modelBufferCache.get(url);
  if (existing) return existing;

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`[Robot3D] Failed to fetch GLB (${res.status}): ${url}`);
      }
      return res.arrayBuffer();
    })
    .catch((err) => {
      modelBufferCache.delete(url);
      throw err;
    });

  modelBufferCache.set(url, promise);
  return promise;
}

/**
 * Parses a fresh independent GLTF scene from the cached ArrayBuffer
 * and wires up node references, cloned emissive materials, and AnimationMixer.
 */
export async function instantiateRobotRig(
  modelUrl = DEFAULT_MODEL_URL,
  targetSize = 2.35
): Promise<LoadedRobotRig> {
  const buffer = await fetchRobotModelBuffer(modelUrl);
  const loader = new GLTFLoader();

  const gltf = await new Promise<GLTF>((resolve, reject) => {
    loader.parse(buffer.slice(0), '/models/', resolve, reject);
  });

  const scene = gltf.scene;

  // Compute bounding box to center and normalize scale
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const longestSide = Math.max(size.x, size.y, size.z, 0.001);
  const scale = targetSize / longestSide;

  const offsetGroup = new THREE.Group();
  offsetGroup.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  scene.scale.setScalar(scale);
  offsetGroup.add(scene);

  const rootGroup = new THREE.Group();
  rootGroup.add(offsetGroup);

  let mouthNode: THREE.Object3D | null = null;
  let eyesNode: THREE.Object3D | null = null;
  let earsNode: THREE.Object3D | null = null;
  let leftHandNode: THREE.Object3D | null = null;
  let rightHandNode: THREE.Object3D | null = null;
  const waveNodes: THREE.Object3D[] = [];
  const emissiveMaterials: THREE.MeshStandardMaterial[] = [];

  scene.traverse((obj) => {
    const name = obj.name || '';
    if (name === 'Mouth') mouthNode = obj;
    else if (name === 'Eyes') eyesNode = obj;
    else if (name === 'Ears') earsNode = obj;
    else if (name === 'Hand origin') leftHandNode = obj;
    else if (name === 'Hand origin.002') rightHandNode = obj;
    else if (name.startsWith('Wave') && !name.includes('Blue_Light')) {
      waveNodes.push(obj);
    }

    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (mesh.material) {
        const clonedMat = Array.isArray(mesh.material)
          ? mesh.material.map((m) => m.clone())
          : mesh.material.clone();
        mesh.material = clonedMat;

        const matList = Array.isArray(clonedMat) ? clonedMat : [clonedMat];
        matList.forEach((mat) => {
          const stdMat = mat as THREE.MeshStandardMaterial;
          if (stdMat.name === 'Blue_Light' || name.includes('Blue_Light')) {
            stdMat.emissive = new THREE.Color(0x38bdf8);
            stdMat.emissiveIntensity = 1.65;
            emissiveMaterials.push(stdMat);
          }
        });
      }
    }
  });

  const mixer = new THREE.AnimationMixer(scene);
  let primaryAction: THREE.AnimationAction | null = null;

  if (gltf.animations && gltf.animations.length > 0) {
    // Pick best matching clip or default to first clip ("Scene")
    const clip = gltf.animations[0];
    primaryAction = mixer.clipAction(clip);
    primaryAction.play();
  }

  const dispose = () => {
    mixer.stopAllAction();
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m?.dispose());
      }
    });
  };

  return {
    rootGroup,
    mixer,
    primaryAction,
    mouthNode,
    eyesNode,
    earsNode,
    leftHandNode,
    rightHandNode,
    waveNodes,
    emissiveMaterials,
    dispose,
  };
}
