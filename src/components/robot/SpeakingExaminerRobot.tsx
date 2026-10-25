import { useMemo, useState } from 'react';
import { AudioWaveform, Sparkles } from 'lucide-react';
import Robot3DCanvas from './Robot3DCanvas';
import {
  PRIMARY_ROBOT_STATES,
  ROBOT_STATUS_META,
  type RobotStatus,
} from './robotMotionUtils';

export interface SpeakingExaminerRobotProps {
  isSpeaking?: boolean;
  isRecording?: boolean;
  isEvaluating?: boolean;
  isCompleted?: boolean;
  volumeLevel?: number;
  examinerName?: string;
  dialogueText?: string;
  subText?: string;
}

export default function SpeakingExaminerRobot({
  isSpeaking = false,
  isRecording = false,
  isEvaluating = false,
  isCompleted = false,
  volumeLevel = 0,
  examinerName = 'Giám Thị AI 3D • Sensei Tanaka',
  dialogueText = '「 こんにちは！準備はいいですか？ 」',
  subText = 'Robot 3D tự động nhép miệng khi đọc câu hỏi, dỏng tai nghe khi bạn bật Mic và đổi màu LED khi chấm điểm.',
}: SpeakingExaminerRobotProps) {
  const [manualOverride, setManualOverride] = useState<RobotStatus | null>(null);

  const autoStatus: RobotStatus = useMemo(() => {
    if (isEvaluating) return 'thinking';
    if (isSpeaking) return 'speaking';
    if (isRecording) return 'listening';
    if (isCompleted) return 'happy';
    return 'idle';
  }, [isEvaluating, isSpeaking, isRecording, isCompleted]);

  // Live exam states take priority over manual preview override
  const activeStatus: RobotStatus =
    autoStatus !== 'idle' ? autoStatus : manualOverride || 'idle';

  const normalizedAudio = useMemo(() => {
    if (volumeLevel > 1) return Math.min(1, volumeLevel / 100);
    return Math.max(0, Math.min(1, volumeLevel));
  }, [volumeLevel]);

  const meta = ROBOT_STATUS_META[activeStatus] || ROBOT_STATUS_META.idle;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-4 sm:p-5 border border-slate-800 shadow-lg relative overflow-hidden">
      {/* Ambient LED Glow matching Robot state */}
      <div
        className="pointer-events-none absolute -left-10 -top-10 w-52 h-52 rounded-full blur-3xl opacity-25 transition-colors duration-500"
        style={{ backgroundColor: meta.accentHex }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* 3D Robot Stage */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl bg-slate-950/75 border border-white/10 flex items-center justify-center shadow-inner">
          <Robot3DCanvas
            status={activeStatus}
            audioLevel={normalizedAudio}
            trackMouse={true}
          />
          <span
            className="absolute bottom-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/90 border border-white/15 flex items-center gap-1"
            style={{ color: meta.accentHex }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: meta.accentHex }}
            />
            {meta.label}
          </span>
        </div>

        {/* Examiner Dialogue & Controls */}
        <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F05A28]/20 border border-[#F05A28]/40 text-orange-300 text-xs font-bold">
              <Sparkles size={12} />
              <span>{examinerName}</span>
            </span>

            {isRecording && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
                <AudioWaveform size={12} />
                <span>Mic nhạy: {Math.round(normalizedAudio * 100)}%</span>
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg font-black font-japanese text-white leading-snug">
            {dialogueText}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed">{subText}</p>

          {/* Interactive 4-State Preview Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">
              Thử cử động:
            </span>
            {PRIMARY_ROBOT_STATES.map((st) => {
              const stMeta = ROBOT_STATUS_META[st];
              const isSelected = activeStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    setManualOverride((prev) => (prev === st ? null : st))
                  }
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white shadow-xs'
                      : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: stMeta.accentHex }}
                  />
                  <span>{stMeta.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
