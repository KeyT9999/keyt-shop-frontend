import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PassiveListeningMode from './PassiveListeningMode';
import type { VocabularyItem } from '../../../types';
import type { PassiveSpeechAdapter } from '../../../services/passiveSpeechSynthesis';

const vocabulary: VocabularyItem[] = [
  {
    _id: 'north',
    order: 1,
    term: '北',
    reading: 'きた',
    romaji: 'kita',
    partOfSpeech: 'Danh từ',
    meaning: 'Phía bắc'
  },
  {
    _id: 'south',
    order: 2,
    term: '南',
    reading: 'みなみ',
    romaji: 'minami',
    partOfSpeech: 'Danh từ',
    meaning: 'Phía nam'
  }
];

function createSpeechAdapter(overrides: Partial<PassiveSpeechAdapter> = {}): PassiveSpeechAdapter {
  return {
    isSupported: true,
    getVoiceAvailability: () => ({ japanese: true, vietnamese: true }),
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    subscribeVoicesChanged: () => () => undefined,
    ...overrides
  };
}

describe('PassiveListeningMode', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('shows the current vocabulary and starts with the five-minute preset', () => {
    const speechAdapter = createSpeechAdapter();
    render(<PassiveListeningMode items={vocabulary} speechAdapter={speechAdapter} />);

    expect(screen.getByRole('heading', { name: 'Nghe thụ động' })).not.toBeNull();
    expect(screen.getByText('北')).not.toBeNull();
    expect(screen.getByText('きた')).not.toBeNull();
    expect(screen.getByText('kita')).not.toBeNull();
    expect(screen.getByText('Phía bắc')).not.toBeNull();
    expect(screen.getByRole('button', { name: '5 phút' }).getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu nghe' }));
    expect(speechAdapter.speak).toHaveBeenCalledWith('きた', 'ja-JP', expect.any(Object));
  });

  it('accepts a custom duration and supports pause, resume, and stop', () => {
    const speechAdapter = createSpeechAdapter();
    render(<PassiveListeningMode items={vocabulary} speechAdapter={speechAdapter} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Thời lượng tùy chỉnh \(phút\)/ }), {
      target: { value: '2' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu nghe' }));
    expect(screen.getByText('02:00')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Tạm dừng' }));
    expect(speechAdapter.pause).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
    expect(speechAdapter.resume).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(speechAdapter.cancel).toHaveBeenCalled();
    expect((screen.getByRole('button', { name: 'Nghe lại' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('does not allow starting when speech synthesis is unavailable', () => {
    const speechAdapter = createSpeechAdapter({ isSupported: false });
    render(<PassiveListeningMode items={vocabulary} speechAdapter={speechAdapter} />);

    expect(screen.getByText('Trình duyệt này chưa hỗ trợ đọc văn bản.')).not.toBeNull();
    expect((screen.getByRole('button', { name: 'Bắt đầu nghe' }) as HTMLButtonElement).disabled).toBe(true);
    expect(speechAdapter.speak).not.toHaveBeenCalled();
  });

  it('explains when no valid vocabulary entries can be played', () => {
    const speechAdapter = createSpeechAdapter();
    render(
      <PassiveListeningMode
        items={[{ ...vocabulary[0], reading: '', term: '', meaning: '' }]}
        speechAdapter={speechAdapter}
      />
    );

    expect(screen.getByText('Bài học chưa có từ vựng và nghĩa hợp lệ để phát.')).not.toBeNull();
    expect((screen.getByRole('button', { name: 'Bắt đầu nghe' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('warns about fallback voices and rejects a custom duration outside 1–60 minutes', () => {
    const speechAdapter = createSpeechAdapter({
      getVoiceAvailability: () => ({ japanese: false, vietnamese: false })
    });
    render(<PassiveListeningMode items={vocabulary} speechAdapter={speechAdapter} />);

    expect(screen.getByText(/chưa cung cấp giọng đọc tiếng Nhật và tiếng Việt/i)).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tùy chỉnh' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Thời lượng tùy chỉnh \(phút\)/ }), {
      target: { value: '61' }
    });
    expect((screen.getByRole('button', { name: 'Bắt đầu nghe' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows saved Mandarin audio coverage and plays it for HSK2', () => {
    const playAudio = vi.fn();
    const speechAdapter = createSpeechAdapter({
      getVoiceAvailability: () => ({ japanese: false, vietnamese: true }),
      playAudio
    });
    const chinese: VocabularyItem[] = [{
      ...vocabulary[0], term: '就', reading: 'jiù', meaning: 'thì, liền',
      audioUrl: 'https://example.com/jiu.mp3'
    }];
    render(<PassiveListeningMode items={chinese} courseCode="hsk2" speechAdapter={speechAdapter} />);

    expect(screen.getByText('Âm thanh tiếng Trung: 1/1 từ')).not.toBeNull();
    expect(screen.queryByText(/chưa cung cấp giọng đọc tiếng Trung/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu nghe' }));
    expect(playAudio).toHaveBeenCalledWith(chinese[0].audioUrl, expect.any(Object));
    expect(speechAdapter.speak).not.toHaveBeenCalled();
  });
});
