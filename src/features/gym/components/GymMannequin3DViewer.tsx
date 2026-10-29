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
  GymPoseMode,
} from '../types/gym';

interface GymMannequin3DViewerProps {
  exercise: GymExerciseDefinition;
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

const CAMERA_PRESET_POSITIONS: Record<GymCameraPreset, [number, number, number]> = {
  iso: [1.85, 1.38, 2.35],
  front: [0, 1.22, 2.95],
  side: [2.85, 1.18, 0.12],
};

export default function GymMannequin3DViewer({ exercise }: GymMannequin3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(() => checkWebGLSupport());
  const [poseMode, setPoseMode] = useState<GymPoseMode>('loop');
  const [camPreset, setCamPreset] = useState<GymCameraPreset>('iso');
  const [breathText, setBreathText] = useState<string>('THỞ RA – Phát lực');
  const [isExhalePhase, setIsExhalePhase] = useState<boolean>(true);

  const exerciseRef = useRef<GymExerciseDefinition>(exercise);
  const poseModeRef = useRef<GymPoseMode>(poseMode);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    exerciseRef.current = exercise;
  }, [exercise]);

  useEffect(() => {
    poseModeRef.current = poseMode;
  }, [poseMode]);

  const applyCameraPreset = (preset: GymCameraPreset) => {
    setCamPreset(preset);
    if (cameraRef.current && controlsRef.current) {
      const [cx, cy, cz] = CAMERA_PRESET_POSITIONS[preset];
      cameraRef.current.position.set(cx, cy, cz);
      controlsRef.current.target.set(0, 0.92, 0);
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
    const height = Math.max(container.clientHeight || 300, 180);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const domCanvas = renderer.domElement;
    domCanvas.style.width = '100%';
    domCanvas.style.height = '100%';
    domCanvas.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(domCanvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 5.5, 11);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 30);
    camera.position.set(...CAMERA_PRESET_POSITIONS.iso);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, domCanvas);
    controls.target.set(0, 0.92, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.65;
    controls.maxDistance = 4.6;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.update();
    controlsRef.current = controls;

    // Studio lighting + floor grid
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2.8, 4.2, 3.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf05a28, 1.05);
    rimLight.position.set(-2.5, 2.2, -2.5);
    scene.add(rimLight);

    const grid = new THREE.GridHelper(3.4, 14, 0x334155, 0x1e293b);
    grid.position.y = 0.005;
    scene.add(grid);

    const ringGeo = new THREE.RingGeometry(0.68, 0.72, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf05a28,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const platformRing = new THREE.Mesh(ringGeo, ringMat);
    platformRing.rotation.x = -Math.PI / 2;
    platformRing.position.y = 0.01;
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
      const h = Math.max(container.clientHeight || 300, 180);
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
        // Realistic hypertrophy tempo: 1.25s concentric -> 0.35s squeeze -> 1.7s eccentric
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
          ? 'HÍT SÂU – Chuẩn bị vào thế'
          : mode === 'peak'
            ? 'SIẾT CƠ – Đỉnh biên độ'
            : exhale
              ? 'THỞ RA – Phát lực đẩy/kéo'
              : 'HÍT VÀO – Hạ chậm kiểm soát';

      if (nextCue !== prevBreathCue) {
        prevBreathCue = nextCue;
        setBreathText(nextCue);
        setIsExhalePhase(exhale);
      }

      const frame = computeGym3DPoseKeyframes(ex.animType, p);
      const contraction = ex.isEccentricFirst ? 1 - p * 0.4 : p;
      proceduralRig.updateFrame(
        frame,
        ex.primaryMuscles,
        ex.secondaryMuscles,
        contraction
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
      ringGeo.dispose();
      ringMat.dispose();
      proceduralRig.dispose();
      renderer?.dispose();
    };
  }, [webglSupported]);

  // Optional custom Blender GLB hook check whenever exercise changes
  useEffect(() => {
    if (!exercise.customGlbPath) return;
    loadOptionalBlenderExerciseGlb(exercise.id, exercise.customGlbPath).catch(() => {
      // Built-in procedural rig remains active cleanly
    });
  }, [exercise.id, exercise.customGlbPath]);

  const primaryLabels = exercise.primaryMuscles
    .map((m) => GYM_MUSCLE_LABELS_VI[m])
    .join(', ');

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm">
      {/* Top 3D Control Toolbar */}
      <div className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Rotate3d size={15} className="text-[#F05A28]" />
          <span>Mô phỏng 3D Xoay 360°</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          {(
            [
              { id: 'loop', label: '3D Động' },
              { id: 'start', label: 'Tư thế Đầu' },
              { id: 'peak', label: 'Đỉnh Co Cơ' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPoseMode(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer ${
                poseMode === item.id
                  ? 'bg-[#F05A28] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Stage */}
      <div className="relative h-72 sm:h-80 w-full bg-slate-950">
        {webglSupported ? (
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            aria-label={`Mô hình 3D bài tập ${exercise.name}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-2">
            <Activity size={32} className="text-[#F05A28]" />
            <p className="text-sm font-bold text-white">
              Trình duyệt đang tắt tăng tốc phần cứng 3D (WebGL)
            </p>
            <p className="text-xs text-slate-400 max-w-md">
              Bạn vẫn có thể xem đầy đủ 2 ảnh tư thế Bắt đầu &amp; Đỉnh co cơ thực tế ngay bên dưới!
            </p>
          </div>
        )}

        {/* Live Breathing Indicator */}
        <div className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-md">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
              isExhalePhase ? 'bg-[#F05A28]' : 'bg-sky-400'
            }`}
          />
          <span className="text-xs font-bold text-white">{breathText}</span>
        </div>

        {/* Highlighted Muscle Legend */}
        <div className="pointer-events-none absolute top-3 right-3 hidden sm:flex flex-col gap-1 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F05A28]" />
            <span>Cơ chính: {primaryLabels}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Cơ phụ giữ ổn định khớp</span>
          </div>
        </div>

        {/* Bottom Camera Presets */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="pointer-events-auto inline-flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80">
            {(
              [
                { id: 'iso', label: 'Góc 3/4' },
                { id: 'front', label: 'Chính diện' },
                { id: 'side', label: 'Góc Ngang (Check Lưng)' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                type="button"
                onClick={() => applyCameraPreset(cam.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors duration-200 cursor-pointer flex items-center gap-1 ${
                  camPreset === cam.id
                    ? 'bg-white text-slate-900'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye size={12} />
                <span>{cam.label}</span>
              </button>
            ))}
          </div>

          <span className="hidden md:inline-block px-2.5 py-1 rounded-lg bg-slate-900/85 border border-slate-700/80 text-xs text-slate-300">
            Vuốt / kéo để xoay quanh nhân vật
          </span>
        </div>
      </div>
    </div>
  );
}
