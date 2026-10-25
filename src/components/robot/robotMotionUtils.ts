export type RobotStatus = 'idle' | 'thinking' | 'speaking' | 'happy' | 'listening';

export interface RobotStatusMeta {
  status: RobotStatus;
  shortLabel: string;
  label: string;
  description: string;
  ledColorHex: number;
  accentHex: string;
  badgeClass: string;
  speed: number;
  height: number;
  tilt: number;
  timeScale: number;
}

export interface RobotPointer {
  x: number; // Normalized [-1, 1]
  y: number; // Normalized [-1, 1]
}

export interface RobotProceduralPose {
  positionY: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  bodyScale: number;
  mouthScaleY: number;
  leftHandRotZ: number;
  rightHandRotZ: number;
  thrusterScale: number;
}

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface RobotQuickAction {
  label: string;
  href?: string;
  action?: 'open-chat' | 'test-happy' | 'test-speaking';
}

export interface ContextualRobotPrompt {
  greeting: string;
  subtext: string;
  quickActions: RobotQuickAction[];
}

export const ROBOT_STATUS_EVENT_NAME = 'keyt:robot-status-change';
export const OPEN_SUPPORT_CHAT_EVENT_NAME = 'keyt:open-support-chat';

export interface RobotStatusEventDetail {
  status: RobotStatus;
  bubbleText?: string;
  durationMs?: number;
}

export const ROBOT_STATUS_META: Record<RobotStatus, RobotStatusMeta> = {
  idle: {
    status: 'idle',
    shortLabel: 'Chờ',
    label: 'Đang trực chờ',
    description: 'Bay lơ lửng, nghiêng đầu nhẹ theo trỏ chuột',
    ledColorHex: 0x38bdf8,
    accentHex: '#0EA5E9',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    speed: 1.6,
    height: 0.065,
    tilt: 0.045,
    timeScale: 0.85,
  },
  thinking: {
    status: 'thinking',
    shortLabel: 'Nghĩ',
    label: 'AI Đang xử lý',
    description: 'Quét radar, xoay nhanh và đổi đèn LED cam KeyT',
    ledColorHex: 0xf05a28,
    accentHex: '#F05A28',
    badgeClass: 'bg-orange-50 text-[#F05A28] border-orange-200',
    speed: 4.2,
    height: 0.095,
    tilt: 0.135,
    timeScale: 1.75,
  },
  speaking: {
    status: 'speaking',
    shortLabel: 'Nói',
    label: 'AI Đang trả lời',
    description: 'Nhép miệng theo nhịp âm thanh & lắc nhẹ thân thiện',
    ledColorHex: 0x0ea5e9,
    accentHex: '#0284C7',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    speed: 5.2,
    height: 0.1,
    tilt: 0.1,
    timeScale: 1.35,
  },
  happy: {
    status: 'happy',
    shortLabel: 'Vui',
    label: 'Hoàn thành xuất sắc',
    description: 'Nhún nhảy vui vẻ, sáng đèn xanh lá & vẫy 2 tay',
    ledColorHex: 0x22c55e,
    accentHex: '#16A34A',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    speed: 7.0,
    height: 0.175,
    tilt: 0.17,
    timeScale: 2.1,
  },
  listening: {
    status: 'listening',
    shortLabel: 'Nghe',
    label: 'Đang lắng nghe Mic',
    description: 'Hướng tai thu âm và đồng bộ sóng theo giọng nói',
    ledColorHex: 0xf43f5e,
    accentHex: '#E11D48',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    speed: 3.0,
    height: 0.075,
    tilt: 0.08,
    timeScale: 1.25,
  },
};

export const PRIMARY_ROBOT_STATES: RobotStatus[] = ['idle', 'thinking', 'speaking', 'happy'];

/**
 * Pure calculation of procedural 3D robot pose for any frame timestamp.
 * Works alongside the embedded GLTF "Scene" animation to guarantee rich
 * 4-state + listening + mouse-tracking + lip-sync motion.
 */
export function computeRobotProceduralPose(
  elapsedSeconds: number,
  status: RobotStatus,
  pointer: RobotPointer = { x: 0, y: 0 },
  audioLevel = 0,
  isDragging = false
): RobotProceduralPose {
  const meta = ROBOT_STATUS_META[status] || ROBOT_STATUS_META.idle;
  const clampedAudio = Math.max(0, Math.min(1, audioLevel));

  const dragLift = isDragging ? 0.12 : 0;
  const positionY = Math.sin(elapsedSeconds * meta.speed) * meta.height + dragLift;

  const baseTiltZ = Math.sin(elapsedSeconds * meta.speed * 0.55) * meta.tilt;
  const dragTiltZ = isDragging ? Math.sin(elapsedSeconds * 10) * 0.12 : 0;
  const rotationZ = baseTiltZ + dragTiltZ - pointer.x * 0.08;

  const thinkingSpin = status === 'thinking' ? Math.sin(elapsedSeconds * 2.8) * 0.38 : 0;
  const idleSwayY = Math.sin(elapsedSeconds * 0.85) * 0.14;
  const rotationY = idleSwayY + thinkingSpin + pointer.x * 0.42;

  const listeningLeanX = status === 'listening' ? 0.12 : 0;
  const rotationX = -pointer.y * 0.24 + listeningLeanX;

  let bodyScale = 1;
  if (isDragging) {
    bodyScale = 1.07;
  } else if (status === 'happy') {
    bodyScale = 1 + Math.sin(elapsedSeconds * 7.2) * 0.045;
  } else if (status === 'listening' && clampedAudio > 0.05) {
    bodyScale = 1 + clampedAudio * 0.04;
  }

  let mouthScaleY = 1;
  if (status === 'speaking') {
    const wave = Math.abs(Math.sin(elapsedSeconds * 14.5)) * 1.45;
    mouthScaleY = 0.55 + wave + clampedAudio * 1.25;
  } else if (status === 'happy') {
    mouthScaleY = 1.38 + Math.sin(elapsedSeconds * 8) * 0.25;
  } else if (status === 'listening') {
    mouthScaleY = 0.85 + clampedAudio * 1.6;
  } else if (status === 'thinking') {
    mouthScaleY = 0.65 + Math.abs(Math.sin(elapsedSeconds * 6)) * 0.35;
  }

  const handWaveAmp = status === 'happy' ? 0.55 : status === 'speaking' ? 0.26 : 0.06;
  const leftHandRotZ = Math.sin(elapsedSeconds * meta.speed * 1.1) * handWaveAmp;
  const rightHandRotZ = -Math.sin(elapsedSeconds * meta.speed * 1.1 + 0.6) * handWaveAmp;

  const thrusterScale =
    1 + Math.sin(elapsedSeconds * meta.speed * 1.6) * 0.12 + clampedAudio * 0.25;

  return {
    positionY,
    rotationX,
    rotationY,
    rotationZ,
    bodyScale,
    mouthScaleY,
    leftHandRotZ,
    rightHandRotZ,
    thrusterScale,
  };
}

/**
 * Pure clamping helper so the draggable floating robot always stays visible inside viewport bounds.
 */
export function clampRobotScreenPosition(
  pos: ScreenPosition,
  viewport: ViewportSize,
  widgetWidth = 148,
  widgetHeight = 158,
  margin = 12
): ScreenPosition {
  const maxX = Math.max(margin, viewport.width - widgetWidth - margin);
  const maxY = Math.max(margin, viewport.height - widgetHeight - margin);

  return {
    x: Math.min(Math.max(margin, Math.round(pos.x)), maxX),
    y: Math.min(Math.max(margin, Math.round(pos.y)), maxY),
  };
}

/**
 * Returns context-aware Vietnamese greeting & quick actions based on current route.
 */
export function getContextualRobotGreeting(pathname: string): ContextualRobotPrompt {
  const path = pathname.toLowerCase();

  if (path.includes('/speaking')) {
    return {
      greeting: 'Sensei Robot sẵn sàng chấm thi nói 1-1 cùng ní!',
      subtext: 'Bật Micro đọc đoạn văn hoặc trả lời Q&A để mình phân tích phát âm nhé.',
      quickActions: [
        { label: 'Chế độ Vấn đáp Q&A', href: '?tab=qa' },
        { label: 'Thi thử 1-1 (Mock)', href: '?tab=mock' },
        { label: 'Chat hỗ trợ Admin', action: 'open-chat' },
      ],
    };
  }

  if (path.includes('/get-otp') || path.includes('/2fa')) {
    return {
      greeting: 'Trạm Radar OTP & 2FA Live đang trực chiến 24/7!',
      subtext: 'Dán email ChatGPT/Gemini hoặc Secret Key 2FA để mình quét mã 6 số trong 1 giây.',
      quickActions: [
        { label: 'Học Viện Ngoại Ngữ', href: '/courses' },
        { label: 'Khung Ảnh EXIF 4K', href: '/photo-frame' },
        { label: 'Chat hỗ trợ Admin', action: 'open-chat' },
      ],
    };
  }

  if (path.includes('/compress') || path.includes('/ai-image') || path.includes('/photo-frame')) {
    return {
      greeting: 'Chào mừng ní đến Studio Nhiếp Ảnh & AI KeyT!',
      subtext: 'Xử lý ảnh 4K/8K, gắn EXIF Leica/Fujifilm, tách nền AI và nén ảnh giảm 90% dung lượng.',
      quickActions: [
        { label: 'Tạo Khung Ảnh EXIF', href: '/photo-frame' },
        { label: 'Nén Ảnh 90% Free', href: '/compress' },
        { label: 'Xóa Nền & AI Image', href: '/ai-image' },
      ],
    };
  }

  if (path.includes('/courses')) {
    return {
      greeting: 'Hôm nay ní luyện Tiếng Nhật, Trung hay Anh?',
      subtext: 'Thử ngay Phòng Thi Nói AI 1-1 hoặc chế độ Nghe Thụ Động rảnh tay cực cuốn!',
      quickActions: [
        { label: 'Phòng Thi Nói JPD123', href: '/courses/jpd123/speaking' },
        { label: 'Luyện Bảng Chữ Kana', href: '/courses/kana' },
        { label: 'Lấy Mã OTP 2FA', href: '/get-otp' },
      ],
    };
  }

  return {
    greeting: 'Xin chào! Mình là KeyT Robot 3D — Trợ lý AI của bạn!',
    subtext: 'Ní có thể nắm chuột kéo mình bay đi bất cứ đâu trên màn hình hoặc bấm vào mình để mở bảng điều khiển nha!',
    quickActions: [
      { label: 'Lấy Mã OTP & 2FA 30s', href: '/get-otp' },
      { label: 'Phòng Thi Nói AI 1-1', href: '/courses/jpd123/speaking' },
      { label: 'Chat trực tiếp Admin', action: 'open-chat' },
    ],
  };
}

/**
 * Dispatches a global custom event to synchronize floating Robot status from anywhere in the app.
 */
export function emitRobotStatusEvent(
  status: RobotStatus,
  bubbleText?: string,
  durationMs = 2600
): void {
  if (typeof window === 'undefined') return;
  const detail: RobotStatusEventDetail = { status, bubbleText, durationMs };
  window.dispatchEvent(new CustomEvent<RobotStatusEventDetail>(ROBOT_STATUS_EVENT_NAME, { detail }));
}

export function emitOpenSupportChatEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_CHAT_EVENT_NAME));
}
