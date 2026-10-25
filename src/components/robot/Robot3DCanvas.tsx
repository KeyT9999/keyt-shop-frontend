import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Bot } from 'lucide-react';
import {
  computeRobotProceduralPose,
  ROBOT_STATUS_META,
  type RobotPointer,
  type RobotStatus,
} from './robotMotionUtils';
import { instantiateRobotRig, type LoadedRobotRig } from './robotSceneLoader';

export interface Robot3DCanvasProps {
  status?: RobotStatus;
  audioLevel?: number;
  isDragging?: boolean;
  trackMouse?: boolean;
  className?: string;
  targetModelSize?: number;
  showAttribution?: boolean;
}

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent || '')) {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function Robot3DCanvas({
  status = 'idle',
  audioLevel = 0,
  isDragging = false,
  trackMouse = true,
  className = 'w-full h-full',
  targetModelSize = 2.35,
  showAttribution = false,
}: Robot3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(() => !isWebGLAvailable());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Live refs so the requestAnimationFrame loop reads latest props without recreating WebGL context
  const statusRef = useRef<RobotStatus>(status);
  const audioLevelRef = useRef<number>(audioLevel);
  const isDraggingRef = useRef<boolean>(isDragging);
  const pointerTargetRef = useRef<RobotPointer>({ x: 0, y: 0 });
  const pointerSmoothRef = useRef<RobotPointer>({ x: 0, y: 0 });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Global mouse tracking
  useEffect(() => {
    if (!trackMouse || typeof window === 'undefined') return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth * 0.45)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight * 0.45)));
      pointerTargetRef.current = { x: normX, y: normY };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [trackMouse]);

  // WebGL & GLB Scene Lifecycle
  useEffect(() => {
    if (fallbackMode || !containerRef.current) return;

    const container = containerRef.current;
    let disposed = false;
    let frameId = 0;
    let rig: LoadedRobotRig | null = null;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('[Robot3D] WebGLRenderer init failed, using SVG fallback:', err);
      queueMicrotask(() => {
        if (!disposed) setFallbackMode(true);
      });
      return;
    }

    const width = Math.max(container.clientWidth || 160, 64);
    const height = Math.max(container.clientHeight || 160, 64);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const domCanvas = renderer.domElement;
    domCanvas.style.width = '100%';
    domCanvas.style.height = '100%';
    domCanvas.style.display = 'block';
    domCanvas.style.pointerEvents = 'none';
    container.innerHTML = '';
    container.appendChild(domCanvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 0.08, 4.6);

    // Studio Lighting tailored for glossy white shell + glowing LED visor
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.15);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    const statusPointLight = new THREE.PointLight(0x38bdf8, 1.8, 6);
    statusPointLight.position.set(0, 0.2, 1.8);
    scene.add(statusPointLight);

    const targetColor = new THREE.Color(ROBOT_STATUS_META[statusRef.current].ledColorHex);
    const currentLedColor = targetColor.clone();

    instantiateRobotRig('/models/robot.glb', targetModelSize)
      .then((loadedRig) => {
        if (disposed) {
          loadedRig.dispose();
          return;
        }
        rig = loadedRig;
        scene.add(rig.rootGroup);
        setIsLoaded(true);
        console.info('[Robot3D] Loaded /models/robot.glb successfully');
      })
      .catch((err) => {
        console.warn('[Robot3D] Failed to load GLB model, falling back:', err);
        if (!disposed) setFallbackMode(true);
      });

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = Math.max(container.clientWidth || 160, 64);
      const h = Math.max(container.clientHeight || 160, 64);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      frameId = window.requestAnimationFrame(animate);

      if (typeof document !== 'undefined' && document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const activeStatus = statusRef.current;
      const meta = ROBOT_STATUS_META[activeStatus] || ROBOT_STATUS_META.idle;

      pointerSmoothRef.current.x = THREE.MathUtils.lerp(
        pointerSmoothRef.current.x,
        pointerTargetRef.current.x,
        0.08
      );
      pointerSmoothRef.current.y = THREE.MathUtils.lerp(
        pointerSmoothRef.current.y,
        pointerTargetRef.current.y,
        0.08
      );

      if (rig) {
        if (rig.primaryAction) {
          rig.primaryAction.timeScale = THREE.MathUtils.lerp(
            rig.primaryAction.timeScale,
            meta.timeScale,
            0.1
          );
        }
        rig.mixer.update(delta);

        const pose = computeRobotProceduralPose(
          elapsed,
          activeStatus,
          pointerSmoothRef.current,
          audioLevelRef.current,
          isDraggingRef.current
        );

        rig.rootGroup.position.y = THREE.MathUtils.lerp(
          rig.rootGroup.position.y,
          pose.positionY,
          0.14
        );
        rig.rootGroup.rotation.x = THREE.MathUtils.lerp(
          rig.rootGroup.rotation.x,
          pose.rotationX,
          0.12
        );
        rig.rootGroup.rotation.y = THREE.MathUtils.lerp(
          rig.rootGroup.rotation.y,
          pose.rotationY,
          0.12
        );
        rig.rootGroup.rotation.z = THREE.MathUtils.lerp(
          rig.rootGroup.rotation.z,
          pose.rotationZ,
          0.14
        );
        rig.rootGroup.scale.setScalar(
          THREE.MathUtils.lerp(rig.rootGroup.scale.x, pose.bodyScale, 0.15)
        );

        // Lip-sync on Mouth node
        if (rig.mouthNode) {
          rig.mouthNode.scale.y = THREE.MathUtils.lerp(
            rig.mouthNode.scale.y,
            pose.mouthScaleY,
            0.25
          );
        }

        // Expressive hand gestures
        if (rig.leftHandNode) {
          rig.leftHandNode.rotation.z += pose.leftHandRotZ * 0.15;
        }
        if (rig.rightHandNode) {
          rig.rightHandNode.rotation.z += pose.rightHandRotZ * 0.15;
        }

        // Smooth LED emissive color transition by status
        targetColor.setHex(meta.ledColorHex);
        currentLedColor.lerp(targetColor, 0.12);
        statusPointLight.color.copy(currentLedColor);

        const pulseIntensity =
          activeStatus === 'thinking' || activeStatus === 'speaking'
            ? 1.6 + Math.sin(elapsed * 8) * 0.45
            : 1.55;

        rig.emissiveMaterials.forEach((mat) => {
          mat.emissive.copy(currentLedColor);
          mat.color.copy(currentLedColor);
          mat.emissiveIntensity = pulseIntensity;
        });
      }

      renderer?.render(scene, camera);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      rig?.dispose();
      renderer?.dispose();
    };
  }, [fallbackMode, targetModelSize]);

  const meta = ROBOT_STATUS_META[status] || ROBOT_STATUS_META.idle;

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      data-testid="robot-3d-canvas"
      data-robot-status={status}
    >
      {/* WebGL Mount Container */}
      {!fallbackMode && (
        <div
          ref={containerRef}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Loading / Fallback Futuristic Robot Badge */}
      {(fallbackMode || !isLoaded) && (
        <div
          className="flex flex-col items-center justify-center gap-1.5 p-2 text-center pointer-events-none"
          aria-label={`Robot AI (${meta.label})`}
        >
          <div
            className="w-14 h-14 rounded-2xl bg-slate-900 border-2 flex items-center justify-center shadow-lg transition-transform duration-300 animate-bounce"
            style={{
              borderColor: meta.accentHex,
              boxShadow: `0 0 18px -2px ${meta.accentHex}55`,
            }}
          >
            <Bot size={28} style={{ color: meta.accentHex }} />
          </div>
        </div>
      )}

      {/* Optional CC-BY Attribution Tooltip */}
      {showAttribution && (
        <a
          href="https://sketchfab.com/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900/70 text-[9px] text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-auto"
          title="Futuristic flying animated Robot - Low Poly by Shayan (CC BY)"
        >
          3D: Shayan (CC BY)
        </a>
      )}
    </div>
  );
}
