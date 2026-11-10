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
    scene.background = new THREE.Color(0x0b1220);
    scene.fog = new THREE.Fog(0x0b1220, 4.8, 10);

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

    // Bright studio 3-point lighting for crisp pearl-silver silhouette contrast
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.35);
    keyLight.position.set(2.6, 4.2, 3.0);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x5ce1e6, 1.35);
    rimLight.position.set(-2.4, 2.2, -2.2);
    scene.add(rimLight);

    const coolFillLight = new THREE.DirectionalLight(0xa3f77b, 0.65);
    coolFillLight.position.set(-1.8, 1.6, 2.4);
    scene.add(coolFillLight);

    const grid = new THREE.GridHelper(3.2, 14, 0x334155, 0x1e293b);
    grid.position.y = 0.004;
    scene.add(grid);

    const discGeo = new THREE.CircleGeometry(0.76, 48);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x17253b,
      transparent: true,
      opacity: 0.72,
    });
    const floorDisc = new THREE.Mesh(discGeo, discMat);
    floorDisc.rotation.x = -Math.PI / 2;
    floorDisc.position.y = 0.008;
    scene.add(floorDisc);

    const ringGeo = new THREE.RingGeometry(0.74, 0.78, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: genderRef.current === 'male' ? 0x5ce1e6 : 0xff5c8a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
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
      ringMat.color.setHex(activeGender === 'male' ? 0x5ce1e6 : 0xff5c8a);
      rimLight.color.setHex(activeGender === 'male' ? 0x5ce1e6 : 0xff5c8a);
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
      ? 'h-72 sm:h-[400px]'
      : 'h-60 sm:h-80';

  const fallbackImg =
    exercise.realGymPhoto || exercise.referenceImages?.[1] || exercise.referenceImages?.[0];

  return (
    <div
      className={`relative ${heightClass} w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0B1220] shadow-sm select-none`}
    >
      {webglSupported ? (
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label={`Mô hình 3D bài tập ${exercise.name}`}
        />
      ) : fallbackImg ? (
        <div className="relative w-full h-full bg-[#0B1220]">
          <img
            src={fallbackImg}
            alt={exercise.vietnameseName}
            className="w-full h-full object-cover opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0B1220] via-transparent to-transparent" />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-300 gap-1">
          <Activity
            size={24}
            className={isMale ? 'text-[#5CE1E6]' : 'text-[#FF5C8A]'}
          />
          <p className="text-xs font-bold text-white">{exercise.vietnameseName}</p>
        </div>
      )}

      {/* Top Overlay: Left Breathing Cue + Right Pose Mode Pills */}
      <div className="pointer-events-none absolute top-2 left-2 right-2 flex items-center justify-between gap-1.5">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-xs min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-200 ${
              isExhalePhase
                ? isMale
                  ? 'bg-[#5CE1E6]'
                  : 'bg-[#FF5C8A]'
                : 'bg-[#A3F77B]'
            }`}
          />
          <span className="text-[10px] sm:text-xs font-extrabold text-white truncate">
            {breathText}
          </span>
        </div>

        {!compact && (
          <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-700/80 shrink-0">
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
                className={`px-2 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  poseMode === item.id
                    ? isMale
                      ? 'bg-[#5CE1E6] text-[#111114]'
                      : 'bg-[#FF5C8A] text-[#111114]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Overlay: Compact Camera Angle Pills + Target Muscle Chip */}
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1.5">
        <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md p-0.5 rounded-xl border border-slate-700/80 shrink-0">
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
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-extrabold whitespace-nowrap transition-colors duration-150 cursor-pointer flex items-center gap-1 ${
                camPreset === cam.id
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye size={10} />
              <span>{cam.label}</span>
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-xs text-slate-200 font-bold min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isMale ? 'bg-[#5CE1E6]' : 'bg-[#FF5C8A]'
            }`}
          />
          <span className="truncate">{primaryLabels}</span>
          <Rotate3d size={11} className="text-slate-400 hidden sm:inline shrink-0" />
        </div>
      </div>
    </div>
  );
}
