import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Activity, Eye, Rotate3d } from 'lucide-react';
import { GYM_MUSCLE_LABELS_VI } from '../data/defaultGymCatalog';
import { computeGym3DPoseKeyframes } from '../three/gym3DPoseData';
import {
  createGymProceduralSceneRig,
  loadOptionalBlenderExerciseGlb,
} from '../three/gym3DSceneRig';
import type {
  GymCameraPreset,
  GymExerciseDefinition,
  GymGenderMode,
  GymPoseMode,
} from '../types/gym';

interface GymMannequin3DViewerProps {
  exercise: GymExerciseDefinition;
  gender?: GymGenderMode;
  compact?: boolean;
  tall?: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Decision: Closer studio camera framing ([1.42, 1.18, 1.76]) so the mannequin
 * and gym machine fill ~75% of mobile viewports without pinching to zoom first.
 */
const CAMERA_PRESET_POSITIONS: Record<GymCameraPreset, [number, number, number]> = {
  iso: [1.42, 1.18, 1.76],
  front: [0, 1.08, 2.15],
  side: [2.05, 1.08, 0.08],
};

export default function GymMannequin3DViewer({
  exercise,
  gender = 'female',
  compact = false,
  tall = false,
}: GymMannequin3DViewerProps) {
  const isMale = gender === 'male';
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(() => checkWebGLSupport());
  const [poseMode, setPoseMode] = useState<GymPoseMode>('loop');
  const [camPreset, setCamPreset] = useState<GymCameraPreset>('iso');
  const [breathText, setBreathText] = useState<string>('THỞ RA • Phát lực');
  const [isExhalePhase, setIsExhalePhase] = useState<boolean>(true);

  const exerciseRef = useRef<GymExerciseDefinition>(exercise);
  const genderRef = useRef<GymGenderMode>(gender);
  const poseModeRef = useRef<GymPoseMode>(poseMode);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    exerciseRef.current = exercise;
  }, [exercise]);

  useEffect(() => {
    genderRef.current = gender;
  }, [gender]);

  useEffect(() => {
    poseModeRef.current = poseMode;
  }, [poseMode]);

  const applyCameraPreset = (preset: GymCameraPreset) => {
    setCamPreset(preset);
    if (cameraRef.current && controlsRef.current) {
      const [cx, cy, cz] = CAMERA_PRESET_POSITIONS[preset];
      cameraRef.current.position.set(cx, cy, cz);
      controlsRef.current.target.set(0, 0.88, 0);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (!webglSupported || !mountRef.current) return;

    const container = mountRef.current;
    let disposed = false;
    let rafId = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed) setWebglSupported(false);
      });
      return;
    }

    const width = Math.max(container.clientWidth || 320, 160);
    const height = Math.max(container.clientHeight || 220, 160);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;

    const domCanvas = renderer.domElement;
    domCanvas.style.width = '100%';
    domCanvas.style.height = '100%';
    domCanvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(domCanvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    scene.fog = new THREE.Fog(0xf1f5f9, 5.2, 11);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 30);
    camera.position.set(...CAMERA_PRESET_POSITIONS.iso);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, domCanvas);
    controls.target.set(0, 0.88, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 4.2;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.update();
    controlsRef.current = controls;

    // Bright daylight studio 3-point lighting for Clean Light Sport aesthetic
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 2.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2.6, 4.2, 3.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf05a28, 0.9);
    rimLight.position.set(-2.4, 2.2, -2.2);
    scene.add(rimLight);

    const coolFillLight = new THREE.DirectionalLight(0x93c5fd, 0.7);
    coolFillLight.position.set(-1.8, 1.6, 2.4);
    scene.add(coolFillLight);

    const grid = new THREE.GridHelper(3.2, 14, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = 0.004;
    scene.add(grid);

    const discGeo = new THREE.CircleGeometry(0.76, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.85,
    });
    const floorDisc = new THREE.Mesh(discGeo, discMat);
    floorDisc.rotation.x = -Math.PI / 2;
    floorDisc.position.y = 0.008;
    scene.add(floorDisc);

    const ringGeo = new THREE.RingGeometry(0.74, 0.78, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf05a28,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const platformRing = new THREE.Mesh(ringGeo, ringMat);
    platformRing.rotation.x = -Math.PI / 2;
    platformRing.position.y = 0.011;
    scene.add(platformRing);

    const proceduralRig = createGymProceduralSceneRig();
    scene.add(proceduralRig.root);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(container.clientWidth || 320, 160);
      const h = Math.max(container.clientHeight || 220, 160);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObs =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObs?.observe(container);

    const clock = new THREE.Clock();
    let prevBreathCue = '';

    const animate = () => {
      if (disposed) return;
      rafId = window.requestAnimationFrame(animate);
      if (typeof document !== 'undefined' && document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const ex = exerciseRef.current;
      const mode = poseModeRef.current;

      let p = 0;
      let concentric = true;

      if (mode === 'start') {
        p = 0.02;
        concentric = false;
      } else if (mode === 'peak' || prefersReducedMotion) {
        p = 0.98;
        concentric = true;
      } else {
        const tCycle = elapsed % 3.3;
        if (tCycle < 1.25) {
          const t = tCycle / 1.25;
          p = 0.5 - 0.5 * Math.cos(Math.PI * t);
          concentric = true;
        } else if (tCycle < 1.6) {
          p = 1.0;
          concentric = true;
        } else {
          const t = (tCycle - 1.6) / 1.7;
          p = 0.5 + 0.5 * Math.cos(Math.PI * t);
          concentric = false;
        }
      }

      const exhale = ex.isEccentricFirst ? !concentric : concentric;
      const nextCue =
        mode === 'start'
          ? 'HÍT SÂU • Vào thế'
          : mode === 'peak'
            ? 'SIẾT CƠ • Đỉnh biên độ'
            : exhale
              ? 'THỞ RA • Phát lực'
              : 'HÍT VÀO • Hạ chậm';

      if (nextCue !== prevBreathCue) {
        prevBreathCue = nextCue;
        setBreathText(nextCue);
        setIsExhalePhase(exhale);
      }

      const frame = computeGym3DPoseKeyframes(ex.animType, p);
      const contraction = ex.isEccentricFirst ? 1 - p * 0.4 : p;
      const activeGender = genderRef.current;
      ringMat.color.setHex(activeGender === 'male' ? 0x1e293b : 0xf05a28);
      rimLight.color.setHex(0xf05a28);
      proceduralRig.updateFrame(
        frame,
        ex.primaryMuscles,
        ex.secondaryMuscles,
        contraction,
        activeGender
      );

      controls.update();
      renderer?.render(scene, camera);
    };

    rafId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      resizeObs?.disconnect();
      controls.dispose();
      discGeo.dispose();
      discMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      proceduralRig.dispose();
      renderer?.dispose();
    };
  }, [webglSupported]);

  useEffect(() => {
    if (!exercise.customGlbPath) return;
    loadOptionalBlenderExerciseGlb(exercise.id, exercise.customGlbPath).catch(() => {
      // Built-in procedural rig remains active cleanly
    });
  }, [exercise.id, exercise.customGlbPath]);

  const primaryLabels = exercise.primaryMuscles
    .map((m) => GYM_MUSCLE_LABELS_VI[m])
    .join(', ');

  const heightClass = compact
    ? 'h-44 sm:h-48'
    : tall
      ? 'h-56 sm:h-72'
      : 'h-52 sm:h-64';

  const fallbackImg =
    exercise.realGymPhoto || exercise.referenceImages?.[1] || exercise.referenceImages?.[0];

  return (
    <div
      className={`relative ${heightClass} w-full rounded-2xl overflow-hidden border border-slate-200 bg-[#F1F5F9] select-none`}
    >
      {webglSupported ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label={`Mô hình 3D bài tập ${exercise.name}`}
        />
      ) : fallbackImg ? (
        <div className="relative w-full h-full bg-slate-100">
          <img
            src={fallbackImg}
            alt={exercise.vietnameseName}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-600 gap-1">
          <Activity
            size={24}
            className={isMale ? 'text-[#1E293B]' : 'text-[#F05A28]'}
          />
          <p className="text-xs font-bold text-slate-900">{exercise.vietnameseName}</p>
        </div>
      )}

      {/* Top Overlay: Left Breathing Cue + Right Pose Mode Pills */}
      <div className="pointer-events-none absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md border border-slate-200/90 shadow-xs min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-200 ${
              isExhalePhase ? 'bg-[#F05A28]' : 'bg-emerald-500'
            }`}
          />
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">
            {breathText}
          </span>
        </div>

        {!compact && (
          <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-white/92 backdrop-blur-md p-0.5 rounded-full border border-slate-200/90 shadow-xs shrink-0">
            {(
              [
                { id: 'loop', label: 'Động' },
                { id: 'start', label: 'Đầu' },
                { id: 'peak', label: 'Đỉnh' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPoseMode(item.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  poseMode === item.id
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Overlay: Compact Camera Angle Pills + Target Muscle Chip */}
      <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
        <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-white/92 backdrop-blur-md p-0.5 rounded-full border border-slate-200/90 shadow-xs shrink-0">
          {(
            [
              { id: 'iso', label: '3/4' },
              { id: 'front', label: 'Trước' },
              { id: 'side', label: 'Ngang' },
            ] as const
          ).map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                applyCameraPreset(cam.id);
              }}
              className={`px-2 py-0.5 sm:py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1 ${
                camPreset === cam.id
                  ? 'bg-[#F05A28] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={10} />
              <span>{cam.label}</span>
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md border border-slate-200/90 shadow-xs text-[11px] text-slate-800 font-bold min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#F05A28] shrink-0" />
          <span className="truncate">{primaryLabels}</span>
          <Rotate3d size={11} className="text-slate-400 hidden sm:inline shrink-0" />
        </div>
      </div>
    </div>
  );
}
