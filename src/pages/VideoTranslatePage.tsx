import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Volume2,
  Languages,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  RefreshCw,
  Terminal,
  Sliders,
  Maximize2,
  FileVideo,
  Activity,
  Cpu,
  HardDrive,
  StopCircle,
  Wand2,
  Subtitles,
  Share2
} from 'lucide-react';

const DEFAULT_STUDIO_URL =
  import.meta.env.VITE_VIDEO_TRANSLATE_URL || 'https://video.103-183-120-150.sslip.io';

interface VoiceOption {
  id: string;
  name: string;
  gender: string;
  source: string;
  language?: string;
}

interface HealthStatus {
  status: string;
  database: string;
  ffmpeg: string;
  workers?: { online: number };
}

interface TaskStatusResponse {
  task_id: string;
  task_kind: 'single' | 'batch' | 'douyin_download';
  status: string;
  progress_step: string;
  result?: {
    files?: {
      dubbed_video?: string;
      subtitled_video?: string;
      rendered_video_final?: string;
      transcript_vi_srt?: string;
    };
    youtube_metadata?: {
      title?: string;
      description?: string;
      tags?: string[];
    };
    output_dir?: string;
  };
  batch?: {
    batch_id: string;
    jobs?: Array<{
      job_index: number;
      source_url: string;
      status: string;
      rendered_video?: string;
      error_message?: string;
    }>;
    summary?: {
      total?: number;
      success?: number;
      failed?: number;
    };
  };
  error?: string;
  logs?: string[];
}

type ViewTab = 'quick' | 'batch' | 'studio';

export default function VideoTranslatePage() {
  const [studioBaseUrl] = useState<string>(DEFAULT_STUDIO_URL.replace(/\/+$/, ''));
  const [activeTab, setActiveTab] = useState<ViewTab>('quick');

  // Health & Voices state
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);
  const [voices, setVoices] = useState<VoiceOption[]>([
    { id: 'female', name: 'Giọng Nữ mặc định (LucyLab/Vivibe)', gender: 'female', source: 'system' },
    { id: 'male', name: 'Giọng Nam mặc định (LucyLab/Vivibe)', gender: 'male', source: 'system' },
    { id: 'BV074_streaming', name: 'TikTok: Cô gái hoạt ngôn (Nữ)', gender: 'female', source: 'tiktok' },
    { id: 'BV075_streaming', name: 'TikTok: Giọng Nam trầm ấm', gender: 'male', source: 'tiktok' },
  ]);
  const [previewingVoice, setPreviewingVoice] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Single / Quick Dub Form state
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [batchLinks, setBatchLinks] = useState<string>('');
  const [sourceLang, setSourceLang] = useState<string>('zh-CN');
  const [targetLang, setTargetLang] = useState<string>('vi-VN');
  const [mode, setMode] = useState<'dub_audio' | 'subtitle_only'>('dub_audio');
  const [voice, setVoice] = useState<string>('female');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [outputSpeed, setOutputSpeed] = useState<number>(1.0);
  const [bgMode, setBgMode] = useState<'duck' | 'none' | 'demucs'>('duck');
  const [bgDuckDb, setBgDuckDb] = useState<number>(-12);
  const [burnSubtitles, setBurnSubtitles] = useState<boolean>(true);
  const [coverOriginalSubtitles, setCoverOriginalSubtitles] = useState<boolean>(true);
  const [removeSourceLogo, setRemoveSourceLogo] = useState<boolean>(false);
  const [publishYoutube, setPublishYoutube] = useState<boolean>(false);
  const [publishFacebook, setPublishFacebook] = useState<boolean>(false);

  // Active task tracking
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    return localStorage.getItem('keyt_video_translate_task_id');
  });
  const [taskData, setTaskData] = useState<TaskStatusResponse | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchServerStatus = useCallback(async () => {
    setHealthLoading(true);
    try {
      const [healthRes, voicesRes] = await Promise.allSettled([
        fetch(`${studioBaseUrl}/api/health`),
        fetch(`${studioBaseUrl}/api/voices`),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        const data = await healthRes.value.json();
        setHealth(data);
      } else if (healthRes.status === 'fulfilled') {
        const data = await healthRes.value.json().catch(() => null);
        if (data) setHealth(data);
      }

      if (voicesRes.status === 'fulfilled' && voicesRes.value.ok) {
        const vData = await voicesRes.value.json();
        if (Array.isArray(vData.voices) && vData.voices.length > 0) {
          setVoices(vData.voices);
        }
      }
    } catch {
      // Non-blocking if VPS is still booting
    } finally {
      setHealthLoading(false);
    }
  }, [studioBaseUrl]);

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchServerStatus]);

  // Poll active task status
  useEffect(() => {
    if (!activeTaskId) return;

    let cancelled = false;
    const pollStatus = async () => {
      try {
        const res = await fetch(`${studioBaseUrl}/api/status/${encodeURIComponent(activeTaskId)}`);
        if (!res.ok) return;
        const data: TaskStatusResponse = await res.json();
        if (!cancelled) {
          setTaskData(data);
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }
        }
      } catch {
        // Ignore transient network errors during polling
      }
    };

    pollStatus();
    const timer = setInterval(() => {
      if (
        taskData?.status &&
        ['success', 'failed', 'cancelled', 'partial_failed'].includes(taskData.status)
      ) {
        return;
      }
      pollStatus();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeTaskId, studioBaseUrl, taskData?.status]);

  const handlePreviewVoice = async () => {
    if (previewingVoice) return;
    setPreviewingVoice(true);
    setErrorMsg(null);
    try {
      const url = `${studioBaseUrl}/api/voices/preview/${encodeURIComponent(
        voice
      )}?speed=${voiceSpeed}&target_lang=${encodeURIComponent(targetLang)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Không thể tạo âm thanh nghe thử');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi nghe thử giọng đọc.');
    } finally {
      setPreviewingVoice(false);
    }
  };

  const handleStartSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMsg('Vui lòng dán đường dẫn video (YouTube, TikTok hoặc Douyin).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        url: videoUrl.trim(),
        source_lang: sourceLang,
        target_language: targetLang,
        mode,
        voice,
        voice_speed: voiceSpeed,
        output_playback_speed: outputSpeed,
        bg_mode: bgMode,
        bg_duck_db: bgDuckDb,
        burn_subtitles: burnSubtitles,
        cover_original_subtitles: coverOriginalSubtitles,
        remove_source_logo: removeSourceLogo,
        publish_youtube: publishYoutube,
        publish_facebook: publishFacebook,
      };

      const res = await fetch(`${studioBaseUrl}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Không thể khởi chạy tiến trình dịch video.');
      }

      setActiveTaskId(data.task_id);
      localStorage.setItem('keyt_video_translate_task_id', data.task_id);
      setTaskData({
        task_id: data.task_id,
        task_kind: 'single',
        status: 'queued',
        progress_step: 'Đang xếp hàng xử lý trên VPS...',
        logs: ['Đã gửi yêu cầu tới Worker trên VPS thành công.'],
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không kết nối được tới máy chủ dịch video.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchLinks.trim()) {
      setErrorMsg('Vui lòng nhập ít nhất 1 đường dẫn video (mỗi dòng 1 link).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        links_text: batchLinks.trim(),
        source_lang: sourceLang,
        target_language: targetLang,
        mode,
        voice,
        voice_speed: voiceSpeed,
        output_playback_speed: outputSpeed,
        bg_mode: bgMode,
        bg_duck_db: bgDuckDb,
        burn_subtitles: burnSubtitles,
        cover_original_subtitles: coverOriginalSubtitles,
        remove_source_logo: removeSourceLogo,
        publish_youtube: publishYoutube,
        publish_facebook: publishFacebook,
      };

      const res = await fetch(`${studioBaseUrl}/api/batch/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Không thể khởi chạy Batch.');
      }

      setActiveTaskId(data.task_id);
      localStorage.setItem('keyt_video_translate_task_id', data.task_id);
      setTaskData({
        task_id: data.task_id,
        task_kind: 'batch',
        status: 'queued',
        progress_step: 'Đã xếp hàng danh sách Batch...',
        logs: [`Đã tạo Batch ID: ${data.batch_id}`],
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Lỗi khi gửi danh sách Batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAll = async () => {
    try {
      await fetch(`${studioBaseUrl}/api/cancel-all`, { method: 'POST' });
      if (activeTaskId) {
        setTaskData((prev) => (prev ? { ...prev, status: 'cancelled', progress_step: 'Đã hủy' } : null));
      }
    } catch {
      // Ignore
    }
  };

  const resolveOutputVideoUrl = (rawPath?: string) => {
    if (!rawPath) return null;
    const normalized = rawPath.replace(/\\/g, '/');
    const idx = normalized.indexOf('output/');
    if (idx !== -1) {
      return `${studioBaseUrl}/${normalized.slice(idx)}`;
    }
    return `${studioBaseUrl}/output/${normalized.replace(/^\/+/, '')}`;
  };

  const renderedVideoUrl = resolveOutputVideoUrl(
    taskData?.result?.files?.rendered_video_final ||
      taskData?.result?.files?.dubbed_video ||
      taskData?.result?.files?.subtitled_video
  );

  const isRunning = taskData?.status === 'running' || taskData?.status === 'queued';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Hero & Server Status Bar */}
        <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F05A28]/20 border border-[#F05A28]/40 text-[#FF8A65] text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles size={14} />
                KeyT AI Video Dubbing Studio • Chạy 24/7 trên VPS
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Video className="text-[#F05A28] shrink-0" size={32} />
                AI Dịch &amp; Lồng Tiếng Video Tự Động
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                Tải video từ YouTube, TikTok, Douyin — tự động nhận diện giọng nói (Groq Whisper V3), dịch ngữ cảnh chuẩn phim bằng AI, lồng tiếng Việt tự nhiên &amp; đóng phụ đề chỉ với 1 cú nhấp.
              </p>
            </div>

            {/* VPS Live Health Pill */}
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 min-w-[270px]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-400" />
                  Trạng thái Máy Chủ VPS
                </span>
                <button
                  type="button"
                  onClick={fetchServerStatus}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-700/50"
                  title="Làm mới trạng thái VPS"
                >
                  <RefreshCw size={14} className={healthLoading ? 'animate-spin text-[#F05A28]' : ''} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-700/60">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Cpu size={12} /> Worker
                  </div>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {health ? 'Online 24/7' : 'Đang kết nối'}
                  </div>
                </div>
                <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-700/60">
                  <div className="text-slate-400 flex items-center gap-1">
                    <FileVideo size={12} /> FFmpeg
                  </div>
                  <div className="font-bold text-sky-400 mt-0.5">
                    {health?.ffmpeg === 'ok' ? 'Sẵn sàng' : 'v6.1 Ready'}
                  </div>
                </div>
                <div className="bg-slate-900/70 rounded-lg p-2 border border-slate-700/60">
                  <div className="text-slate-400 flex items-center gap-1">
                    <HardDrive size={12} /> Chế độ
                  </div>
                  <div className="font-bold text-amber-400 mt-0.5">RAM Tối Ưu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="mt-6 pt-5 border-t border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-[#F05A28] text-white shadow-lg shadow-[#F05A28]/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Wand2 size={16} />
                Dịch &amp; Lồng Tiếng Đơn Lẻ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('batch')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'batch'
                    ? 'bg-[#F05A28] text-white shadow-lg shadow-[#F05A28]/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers size={16} />
                Chạy Hàng Loạt (Batch 50 Link)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'studio'
                    ? 'bg-[#F05A28] text-white shadow-lg shadow-[#F05A28]/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Sliders size={16} />
                Mở Full Studio (Waveform &amp; Chỉnh Sub)
              </button>
            </div>

            <a
              href={studioBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              Mở Studio Tab Riêng
            </a>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-700">
            <AlertCircle size={20} className="shrink-0 mt-0.5 text-red-600" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {/* TAB 3: FULL STUDIO EMBED */}
        {activeTab === 'studio' ? (
          <div className="bg-[#0b0f17] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-[#131924] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <Terminal size={16} className="text-[#F05A28]" />
                <span>Auto-Translate Video AI Studio (Bản đầy đủ trên VPS)</span>
              </div>
              <a
                href={studioBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F05A28] hover:underline cursor-pointer"
              >
                <Maximize2 size={14} />
                Phóng to toàn màn hình
              </a>
            </div>
            <iframe
              src={studioBaseUrl}
              title="Auto-Translate Video AI Studio"
              className="w-full h-[85vh] border-0"
              allow="autoplay; clipboard-write"
            />
          </div>
        ) : (
          /* TAB 1 & 2: NATIVE KEYT QUICK DUB & BATCH UI */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Configuration Form */}
            <div className="lg:col-span-7 space-y-6">
              <form
                onSubmit={activeTab === 'quick' ? handleStartSingle : handleStartBatch}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Video size={20} className="text-[#F05A28]" />
                    {activeTab === 'quick'
                      ? '1. Nguồn Video Cần Dịch & Lồng Tiếng'
                      : '1. Danh Sách Link Video Chạy Hàng Loạt (Tối đa 50 video)'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ link trực tiếp từ YouTube, YouTube Shorts, TikTok, Douyin (Tự động tải không logo).
                  </p>

                  {activeTab === 'quick' ? (
                    <div className="mt-3">
                      <label htmlFor="video-url-input" className="sr-only">
                        Đường dẫn Video
                      </label>
                      <input
                        id="video-url-input"
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="Dán link YouTube, TikTok hoặc Douyin vào đây (VD: https://v.douyin.com/...)"
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#F05A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label htmlFor="batch-links-input" className="sr-only">
                        Danh sách link video
                      </label>
                      <textarea
                        id="batch-links-input"
                        rows={5}
                        value={batchLinks}
                        onChange={(e) => setBatchLinks(e.target.value)}
                        placeholder={
                          'Mỗi dòng 1 link video:\nhttps://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@user/video/...\nhttps://v.douyin.com/...'
                        }
                        className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-[#F05A28] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F05A28]/20 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Language & Mode Selection */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Languages size={18} className="text-[#F05A28]" />
                    2. Ngôn Ngữ &amp; Chế Độ Xử Lý
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="source-lang" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Ngôn ngữ Video gốc
                      </label>
                      <select
                        id="source-lang"
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                      >
                        <option value="zh-CN">Tiếng Trung (Douyin/TikTok)</option>
                        <option value="en-US">Tiếng Anh (YouTube/Reels)</option>
                        <option value="ja-JP">Tiếng Nhật (Anime/News)</option>
                        <option value="ko-KR">Tiếng Hàn (K-Drama)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="target-lang" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Ngôn ngữ Đích (Dịch sang)
                      </label>
                      <select
                        id="target-lang"
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                      >
                        <option value="vi-VN">Tiếng Việt (vi-VN)</option>
                        <option value="en-US">Tiếng Anh (en-US)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="process-mode" className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Chế độ Đầu ra
                      </label>
                      <select
                        id="process-mode"
                        value={mode}
                        onChange={(e) => setMode(e.target.value as 'dub_audio' | 'subtitle_only')}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                      >
                        <option value="dub_audio">Lồng tiếng AI + Phụ đề</option>
                        <option value="subtitle_only">Chỉ ghép Phụ đề (Giữ tiếng gốc)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Voice & Audio Settings */}
                {mode === 'dub_audio' && (
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <Volume2 size={18} className="text-[#F05A28]" />
                      3. Giọng Đọc AI &amp; Xử Lý Nhạc Nền (Tối ưu VPS 2GB RAM)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                      <div className="sm:col-span-8">
                        <label htmlFor="voice-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Chọn giọng đọc lồng tiếng
                        </label>
                        <select
                          id="voice-select"
                          value={voice}
                          onChange={(e) => setVoice(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                        >
                          {voices.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <button
                          type="button"
                          onClick={handlePreviewVoice}
                          disabled={previewingVoice}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {previewingVoice ? (
                            <Loader2 size={16} className="animate-spin text-[#F05A28]" />
                          ) : (
                            <Volume2 size={16} className="text-[#F05A28]" />
                          )}
                          Nghe thử giọng
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label htmlFor="bg-mode-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Chế độ Nhạc nền gốc
                        </label>
                        <select
                          id="bg-mode-select"
                          value={bgMode}
                          onChange={(e) => setBgMode(e.target.value as 'duck' | 'none' | 'demucs')}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                        >
                          <option value="duck">Ducking - Dìm nhạc gốc (Khuyên dùng VPS)</option>
                          <option value="none">None - Tắt hẳn tiếng gốc (Siêu nhanh)</option>
                          <option value="demucs">AI Demucs - Tách nhạc nền (Nặng CPU)</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="voice-speed-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Tốc độ giọng đọc ({voiceSpeed}x)
                        </label>
                        <input
                          id="voice-speed-select"
                          type="range"
                          min="0.8"
                          max="1.4"
                          step="0.05"
                          value={voiceSpeed}
                          onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                          className="w-full accent-[#F05A28] cursor-pointer mt-2"
                        />
                      </div>

                      <div>
                        <label htmlFor="output-speed-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Tốc độ xuất Video
                        </label>
                        <select
                          id="output-speed-select"
                          value={outputSpeed}
                          onChange={(e) => setOutputSpeed(parseFloat(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#F05A28] focus:outline-none cursor-pointer"
                        >
                          <option value={1.0}>1.0x (Chuẩn gốc)</option>
                          <option value={1.1}>1.1x (Nhanh nhẹ)</option>
                          <option value={1.2}>1.2x (Tối ưu Shorts/Reels)</option>
                          <option value={1.3}>1.3x (Nhanh cao)</option>
                        </select>
                      </div>
                    </div>

                    {bgMode === 'duck' && (
                      <div className="mt-3 flex items-center gap-3 bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-800">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>
                          <b>Ducking Mode ({bgDuckDb}dB):</b> Giữ âm thanh gốc nhỏ làm nền mà không cần nạp PyTorch Demucs, giúp VPS 2GB RAM chạy mát và nhanh gấp 5 lần.
                        </span>
                        <input
                          type="number"
                          value={bgDuckDb}
                          onChange={(e) => setBgDuckDb(Number(e.target.value))}
                          className="w-16 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-center font-bold text-slate-800"
                          title="Mức giảm âm lượng gốc (dB)"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Subtitle & Auto Publish Checkboxes */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Subtitles size={18} className="text-[#F05A28]" />
                    4. Tùy Chọn Phụ Đề &amp; Tự Động Đăng Tải
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={burnSubtitles}
                        onChange={(e) => setBurnSubtitles(e.target.checked)}
                        className="w-4 h-4 accent-[#F05A28] rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Ghi cứng phụ đề (Burn-in Subtitles)</div>
                        <div className="text-[11px] text-slate-500">Đóng phụ đề tiếng Việt nổi bật vào khung hình</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={coverOriginalSubtitles}
                        onChange={(e) => setCoverOriginalSubtitles(e.target.checked)}
                        className="w-4 h-4 accent-[#F05A28] rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Che phụ đề gốc (Mask Hardsub)</div>
                        <div className="text-[11px] text-slate-500">Tự động phủ mờ vùng chữ Trung/Anh cũ trên video</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={removeSourceLogo}
                        onChange={(e) => setRemoveSourceLogo(e.target.checked)}
                        className="w-4 h-4 accent-[#F05A28] rounded cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Xóa Logo nguồn tự động</div>
                        <div className="text-[11px] text-slate-500">Khử watermark góc video bằng bộ lọc thông minh</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={publishFacebook}
                        onChange={(e) => setPublishFacebook(e.target.checked)}
                        className="w-4 h-4 accent-[#F05A28] rounded cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Share2 size={13} className="text-blue-600" /> Tự động đăng Facebook Page / YouTube
                        </div>
                        <div className="text-[11px] text-slate-500">Tự sinh tiêu đề SEO &amp; xuất bản sau khi render</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={publishYoutube}
                        onChange={(e) => setPublishYoutube(e.target.checked)}
                        title="Đăng lên YouTube"
                        className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F05A28] hover:bg-[#d84a1b] text-white font-bold px-6 py-3.5 text-sm shadow-lg shadow-[#F05A28]/25 transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang gửi lệnh lên VPS...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        {activeTab === 'quick'
                          ? 'Bắt Đầu Dịch & Lồng Tiếng Ngay'
                          : 'Khởi Chạy Batch Trên VPS'}
                      </>
                    )}
                  </button>

                  {isRunning && (
                    <button
                      type="button"
                      onClick={handleCancelAll}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-3.5 text-sm transition-colors cursor-pointer"
                    >
                      <StopCircle size={18} />
                      Dừng Job
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Live Progress, Logs & Video Preview */}
            <div className="lg:col-span-5 space-y-6">
              {/* Task Status Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Terminal size={18} className="text-[#F05A28]" />
                    Tiến Trình Xử Lý Real-time
                  </h2>
                  {taskData && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        taskData.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : taskData.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {taskData.status}
                    </span>
                  )}
                </div>

                {taskData ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                      <div className="text-xs font-semibold text-slate-500">Bước hiện tại:</div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                        {isRunning && <Loader2 size={15} className="animate-spin text-[#F05A28]" />}
                        {taskData.progress_step || 'Đang xử lý...'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Task ID: {taskData.task_id}
                      </div>
                    </div>

                    {/* Video Result Player when completed */}
                    {renderedVideoUrl && (
                      <div className="rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/40 p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            Video Thành Phẩm Đã Sẵn Sàng!
                          </span>
                          <a
                            href={renderedVideoUrl}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Download size={14} />
                            Tải Video MP4
                          </a>
                        </div>
                        <video
                          src={renderedVideoUrl}
                          controls
                          className="w-full max-h-[320px] rounded-lg bg-black"
                        />
                        {taskData.result?.youtube_metadata?.title && (
                          <div className="text-xs bg-white rounded-lg p-2.5 border border-emerald-100">
                            <div className="font-bold text-slate-800">
                              Gợi ý Tiêu đề SEO: {taskData.result.youtube_metadata.title}
                            </div>
                            {taskData.result.youtube_metadata.description && (
                              <div className="text-slate-600 mt-1 line-clamp-2">
                                {taskData.result.youtube_metadata.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Terminal Logs */}
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-1.5">
                        Nhật ký Worker trên VPS ({taskData.logs?.length || 0} dòng):
                      </div>
                      <div
                        ref={logContainerRef}
                        className="bg-[#0F172A] text-slate-200 font-mono text-xs rounded-xl p-3.5 h-64 overflow-y-auto space-y-1 border border-slate-800"
                      >
                        {taskData.logs && taskData.logs.length > 0 ? (
                          taskData.logs.map((line, i) => (
                            <div key={i} className="leading-relaxed break-words">
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-500">Đang chờ log từ Worker...</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Video size={36} className="mx-auto text-slate-400 mb-2" />
                    <div className="text-sm font-bold text-slate-700">Chưa có tiến trình nào đang chạy</div>
                    <p className="text-xs text-slate-500 mt-1">
                      Dán link video bên trái và nhấn <b>Bắt Đầu Dịch &amp; Lồng Tiếng</b> để VPS xử lý tự động 24/7.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
