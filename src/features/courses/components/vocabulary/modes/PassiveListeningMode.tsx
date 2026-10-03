import { useState } from 'react';
import { Headphones, Pause, Play, RotateCcw, Square } from 'lucide-react';
import type { VocabularyItem } from '../../../types';
import { usePassiveVocabularyPlayer } from '../../../hooks/usePassiveVocabularyPlayer';
import { parsePassiveListeningDuration } from '../../../utils/passiveListeningSequence';
import type { PassiveSpeechAdapter } from '../../../services/passiveSpeechSynthesis';

const PRESET_DURATIONS = [5, 10, 15, 20, 30] as const;
type DurationChoice = (typeof PRESET_DURATIONS)[number] | 'custom';

interface PassiveListeningModeProps {
  items: VocabularyItem[];
  speechAdapter?: PassiveSpeechAdapter;
}

function formatRemainingTime(milliseconds: number) {
  const totalSeconds = Math.ceil(Math.max(0, milliseconds) / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PassiveListeningMode({ items, speechAdapter }: PassiveListeningModeProps) {
  const player = usePassiveVocabularyPlayer(items, speechAdapter);
  const [durationChoice, setDurationChoice] = useState<DurationChoice>(5);
  const [customDuration, setCustomDuration] = useState('5');
  const isSessionLocked = player.status === 'playing' || player.status === 'paused';
  const selectedDuration =
    durationChoice === 'custom' ? parsePassiveListeningDuration(customDuration) : durationChoice;
  const canStart = player.isSupported && player.totalCount > 0 && selectedDuration !== null && !isSessionLocked;

  const missingVoices = [
    !player.voiceAvailability.japanese ? 'tiếng Nhật' : null,
    !player.voiceAvailability.vietnamese ? 'tiếng Việt' : null
  ].filter((language): language is string => language !== null);

  let statusMessage = 'Chọn thời lượng rồi bắt đầu nghe danh sách từ của bài này.';
  if (player.status === 'playing') {
    if (player.phase === 'japanese') statusMessage = 'Đang đọc cách đọc tiếng Nhật';
    else if (player.phase === 'vietnamese') statusMessage = 'Đang đọc nghĩa tiếng Việt';
    else if (player.phase === 'gap-before-meaning') statusMessage = 'Đang nghỉ trước khi đọc nghĩa';
    else if (player.phase === 'gap-before-next') statusMessage = 'Đang nghỉ trước từ tiếp theo';
  } else if (player.status === 'paused') {
    statusMessage = 'Đã tạm dừng. Thời gian còn lại được giữ nguyên.';
  } else if (player.status === 'completed') {
    statusMessage = 'Đã nghe xong thời lượng đã chọn.';
  } else if (player.status === 'stopped') {
    statusMessage = 'Đã dừng lượt nghe.';
  } else if (player.status === 'error') {
    statusMessage = player.errorMessage ?? 'Không thể phát giọng đọc. Hãy thử lại.';
  }

  return (
    <section
      aria-labelledby="passive-listening-title"
      className="overflow-hidden rounded-3xl border border-orange-200/80 bg-white shadow-sm"
    >
      <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-5 py-6 sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F05A28] text-white shadow-sm shadow-orange-900/15">
            <Headphones aria-hidden="true" size={23} />
          </div>
          <div className="min-w-0">
            <h2 id="passive-listening-title" className="text-xl font-extrabold text-[#1E293B] sm:text-2xl">
              Nghe thụ động
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Nghe cách đọc tiếng Nhật, nghỉ ngắn rồi nghe nghĩa tiếng Việt. Danh sách tự lặp lại đến hết thời gian bạn chọn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)]">
        <div className="space-y-6">
          <fieldset disabled={isSessionLocked} className="space-y-3 disabled:opacity-75">
            <legend className="mb-3 text-sm font-bold text-slate-800">Thời lượng nghe</legend>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {PRESET_DURATIONS.map((minutes) => {
                const isSelected = durationChoice === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setDurationChoice(minutes)}
                    className={`min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-bold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-[#F05A28] bg-orange-50 text-[#9A3412]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/60'
                    }`}
                  >
                    {minutes} phút
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={durationChoice === 'custom'}
                onClick={() => setDurationChoice('custom')}
                className={`min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-bold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F05A28] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                  durationChoice === 'custom'
                    ? 'border-[#F05A28] bg-orange-50 text-[#9A3412]'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/60'
                }`}
              >
                Tùy chỉnh
              </button>
            </div>

            {durationChoice === 'custom' && (
              <label className="flex max-w-xs flex-col gap-1.5 text-sm font-semibold text-slate-700">
                Thời lượng tùy chỉnh (phút)
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={60}
                  step={1}
                  value={customDuration}
                  onChange={(event) => setCustomDuration(event.target.value)}
                  aria-describedby="passive-duration-help"
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none transition-shadow duration-200 motion-reduce:transition-none focus:border-[#F05A28] focus:ring-2 focus:ring-orange-200"
                />
                <span id="passive-duration-help" className="text-xs font-normal text-slate-500">
                  Nhập số nguyên từ 1 đến 60 phút.
                </span>
              </label>
            )}
          </fieldset>

          <div className="flex flex-wrap gap-2">
            {player.status === 'playing' && (
              <button
                type="button"
                onClick={player.pause}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E293B] px-4 text-sm font-bold text-white transition-colors duration-200 motion-reduce:transition-none hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                <Pause aria-hidden="true" size={17} />
                Tạm dừng
              </button>
            )}
            {player.status === 'paused' && (
              <button
                type="button"
                onClick={player.resume}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F05A28] px-4 text-sm font-bold text-slate-950 transition-colors duration-200 motion-reduce:transition-none hover:bg-[#D94B1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2"
              >
                <Play aria-hidden="true" size={17} />
                Tiếp tục
              </button>
            )}
            {!isSessionLocked && (
              <button
                type="button"
                onClick={() => selectedDuration !== null && player.start(selectedDuration)}
                disabled={!canStart}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#F05A28] px-4 text-sm font-bold text-slate-950 transition-colors duration-200 motion-reduce:transition-none hover:bg-[#D94B1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                {player.status === 'completed' || player.status === 'stopped' || player.status === 'error' ? (
                  <RotateCcw aria-hidden="true" size={17} />
                ) : (
                  <Play aria-hidden="true" size={17} />
                )}
                {player.status === 'completed' || player.status === 'stopped' || player.status === 'error'
                  ? 'Nghe lại'
                  : 'Bắt đầu nghe'}
              </button>
            )}
            {isSessionLocked && (
              <button
                type="button"
                onClick={player.stop}
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-colors duration-200 motion-reduce:transition-none hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
              >
                <Square aria-hidden="true" size={15} />
                Dừng
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {player.totalCount > 0
                  ? `Từ ${player.currentIndex + 1} / ${player.totalCount} · Vòng ${player.cycleNumber}`
                  : 'Danh sách từ'}
              </p>
              <p role="status" aria-live="polite" className="mt-2 text-sm font-semibold text-[#1E293B]">
                {statusMessage}
              </p>
            </div>
            {isSessionLocked && (
              <p aria-label="Thời gian còn lại" className="shrink-0 font-mono text-xl font-extrabold tabular-nums text-[#1E293B]">
                {formatRemainingTime(player.remainingMs)}
              </p>
            )}
          </div>

          {player.currentEntry ? (
            <div className="mt-5 border-t border-slate-200 pt-4" aria-live="polite">
              <p className="text-3xl font-extrabold leading-tight text-[#1E293B] sm:text-4xl">
                {player.currentEntry.term}
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-700">{player.currentEntry.reading || player.currentEntry.japaneseText}</p>
              {player.currentEntry.romaji && <p className="mt-1 text-sm text-slate-500">{player.currentEntry.romaji}</p>}
              <p className="mt-3 text-base font-semibold text-[#9A3412]">{player.currentEntry.vietnameseText}</p>
            </div>
          ) : (
            <p className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
              Chưa có mục từ hợp lệ để hiển thị.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 px-5 py-4 sm:px-8">
        {!player.isSupported && (
          <p className="text-sm font-medium text-rose-800" role="alert">
            Trình duyệt này chưa hỗ trợ đọc văn bản.
          </p>
        )}
        {player.totalCount === 0 && (
          <p className="text-sm font-medium text-amber-800" role="alert">
            Bài học chưa có từ vựng và nghĩa hợp lệ để phát.
          </p>
        )}
        {player.skippedCount > 0 && (
          <p className="text-sm text-amber-800">
            Đã bỏ qua {player.skippedCount} mục vì thiếu cách đọc hoặc nghĩa tiếng Việt.
          </p>
        )}
        {missingVoices.length > 0 && player.isSupported && player.totalCount > 0 && (
          <p className="text-sm text-amber-800">
            Thiết bị chưa cung cấp giọng đọc {missingVoices.join(' và ')}. Trình duyệt sẽ thử giọng mặc định; cách phát âm có thể khác.
          </p>
        )}
        <p className="text-xs leading-5 text-slate-500">
          Giọng đọc dùng trên thiết bị của bạn. Một số trình duyệt có thể dừng phát khi chuyển ứng dụng hoặc khóa màn hình.
        </p>
      </div>
    </section>
  );
}
