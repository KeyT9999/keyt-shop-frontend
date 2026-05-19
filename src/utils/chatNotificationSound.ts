/**
 * chatNotificationSound.ts
 *
 * Shared utility để phát âm thanh thông báo tin nhắn chat mới.
 *
 * Tại sao dùng Web Audio API thay vì file âm thanh:
 * - Không cần file asset bên ngoài, không phụ thuộc CDN
 * - Programmatic generation đảm bảo luôn có sẵn
 * - Kích thước bundle không tăng
 *
 * Trade-off: Âm thanh đơn giản hơn file mp3 thực sự,
 * nhưng đủ để người dùng nhận biết có tin nhắn mới.
 */

// Singleton AudioContext — không tạo lại nhiều lần, tránh resource leak
let audioCtx: AudioContext | null = null;

// Debounce: thời gian tối thiểu giữa hai lần phát âm thanh (ms)
const DEBOUNCE_MS = 500;
let lastPlayedAt = 0;

/**
 * Lấy hoặc tạo AudioContext singleton.
 * Trả về null nếu browser không hỗ trợ Web Audio API.
 */
function getOrCreateAudioContext(): AudioContext | null {
  try {
    if (audioCtx && audioCtx.state !== 'closed') {
      return audioCtx;
    }
    // webkitAudioContext cho Safari cũ
    const AudioCtxClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;
    audioCtx = new AudioCtxClass();
    return audioCtx;
  } catch {
    // Browser không hỗ trợ
    return null;
  }
}

/**
 * Thực sự tạo và phát âm thanh ping thông báo.
 * Gọi hàm này sau khi AudioContext đã ở state 'running'.
 *
 * Âm thanh: sine wave A5 (880Hz) → A4 (440Hz) fade-out trong 0.4s
 * Nghe giống tiếng ping/chime nhẹ nhàng.
 */
function playPing(ctx: AudioContext): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Âm thanh: bắt đầu ở A5, glide xuống A4
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);

  // Volume: bắt đầu 0.4, fade out về gần 0
  gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.4);
}

/**
 * Phát âm thanh thông báo tin nhắn mới.
 *
 * - Debounce 500ms: nếu nhiều tin nhắn đến liên tiếp, chỉ phát 1 lần
 * - Fail-silent: mọi lỗi đều bị bắt, không throw, không alert
 * - Xử lý browser autoplay policy: resume AudioContext nếu bị suspend
 */
export function playChatNotificationSound(): void {
  const now = Date.now();
  // Debounce: bỏ qua nếu vừa mới phát xong
  if (now - lastPlayedAt < DEBOUNCE_MS) return;
  lastPlayedAt = now;

  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return; // Browser không hỗ trợ, bỏ qua

    if (ctx.state === 'suspended') {
      // Browser đã suspend AudioContext do autoplay policy
      // Cần resume trước, rồi mới phát được
      ctx.resume().then(() => {
        try { playPing(ctx); } catch { /* fail silently */ }
      }).catch(() => { /* fail silently nếu resume thất bại */ });
    } else if (ctx.state === 'running') {
      playPing(ctx);
    }
    // state === 'closed': bỏ qua, không làm gì
  } catch {
    // Bắt mọi lỗi bất ngờ, fail silently
  }
}
