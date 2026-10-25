import { describe, expect, it, vi } from 'vitest';
import {
  clampRobotScreenPosition,
  computeRobotProceduralPose,
  emitRobotStatusEvent,
  getContextualRobotGreeting,
  PRIMARY_ROBOT_STATES,
  ROBOT_STATUS_EVENT_NAME,
  ROBOT_STATUS_META,
} from './robotMotionUtils';

describe('robotMotionUtils', () => {
  it('defines metadata for all primary 4 states and listening state', () => {
    expect(PRIMARY_ROBOT_STATES).toEqual(['idle', 'thinking', 'speaking', 'happy']);
    expect(ROBOT_STATUS_META.idle.shortLabel).toBe('Chờ');
    expect(ROBOT_STATUS_META.thinking.shortLabel).toBe('Nghĩ');
    expect(ROBOT_STATUS_META.speaking.shortLabel).toBe('Nói');
    expect(ROBOT_STATUS_META.happy.shortLabel).toBe('Vui');
    expect(ROBOT_STATUS_META.listening.shortLabel).toBe('Nghe');
  });

  it('computes distinct procedural poses for idle, thinking, speaking, and happy states', () => {
    const idlePose = computeRobotProceduralPose(1.2, 'idle', { x: 0.5, y: -0.2 }, 0, false);
    const speakingPose = computeRobotProceduralPose(1.2, 'speaking', { x: 0, y: 0 }, 0.8, false);
    const draggingPose = computeRobotProceduralPose(1.2, 'idle', { x: 0, y: 0 }, 0, true);

    expect(idlePose.rotationY).not.toBe(0);
    expect(speakingPose.mouthScaleY).toBeGreaterThan(idlePose.mouthScaleY);
    expect(draggingPose.bodyScale).toBeCloseTo(1.07, 2);
  });

  it('clamps screen coordinates inside viewport boundaries when dragging', () => {
    const viewport = { width: 1280, height: 720 };

    const topLeftOverflow = clampRobotScreenPosition({ x: -100, y: -50 }, viewport, 140, 150, 12);
    expect(topLeftOverflow).toEqual({ x: 12, y: 12 });

    const bottomRightOverflow = clampRobotScreenPosition(
      { x: 2000, y: 1500 },
      viewport,
      140,
      150,
      12
    );
    expect(bottomRightOverflow).toEqual({
      x: 1280 - 140 - 12,
      y: 720 - 150 - 12,
    });
  });

  it('returns contextual greetings tailored to KeyT routes', () => {
    expect(getContextualRobotGreeting('/courses/jpd123/speaking').greeting).toContain('Sensei');
    expect(getContextualRobotGreeting('/get-otp').greeting).toContain('OTP');
    expect(getContextualRobotGreeting('/photo-frame').greeting).toContain('Studio');
    expect(getContextualRobotGreeting('/').greeting).toContain('KeyT Robot 3D');
  });

  it('dispatches global robot status events', () => {
    const listener = vi.fn();
    window.addEventListener(ROBOT_STATUS_EVENT_NAME, listener);

    emitRobotStatusEvent('happy', 'Test celebration', 1500);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ROBOT_STATUS_EVENT_NAME, listener);
  });
});
