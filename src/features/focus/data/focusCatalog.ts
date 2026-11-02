import type {
  FocusAmbientId,
  FocusAmbientItem,
  FocusSceneItem,
  FocusTrackItem,
  LoftWeatherVariant,
} from '../types/focusTypes';

export const POMODORO_PRESET_MINUTES = [15, 25, 45, 60] as const;

export const LOFT_VARIANT_MEDIA: Record<
  LoftWeatherVariant,
  { label: string; videoUrl: string; posterUrl: string; isNight: boolean; isRainy: boolean }
> = {
  'night-rainy': {
    label: 'Đêm mưa',
    videoUrl: '/focus/scenes/loft-night-rainy.mp4',
    posterUrl: '/focus/posters/loft-night-rainy.jpg',
    isNight: true,
    isRainy: true,
  },
  'night-clear': {
    label: 'Đêm quang',
    videoUrl: '/focus/scenes/loft-night-clear.mp4',
    posterUrl: '/focus/posters/loft-night-clear.jpg',
    isNight: true,
    isRainy: false,
  },
  'day-sunny': {
    label: 'Ngày nắng',
    videoUrl: '/focus/scenes/loft-day-sunny.mp4',
    posterUrl: '/focus/posters/loft-day-sunny.jpg',
    isNight: false,
    isRainy: false,
  },
  'day-rainy': {
    label: 'Ngày mưa',
    videoUrl: '/focus/scenes/loft-day-rainy.mp4',
    posterUrl: '/focus/posters/loft-day-rainy.jpg',
    isNight: false,
    isRainy: true,
  },
};

export const FOCUS_SCENES: FocusSceneItem[] = [
  {
    id: 'cozy-window',
    title: 'Quán Nhỏ Ánh Nến',
    subtitle: 'Viết bài dưới ánh nến ấm, mèo trắng ngủ ngoan & vườn đêm',
    badge: 'MẶC ĐỊNH',
    videoUrl: '/focus/scenes/cozy-window.mp4',
    posterUrl: '/focus/posters/cozy-window.jpg',
    recommendedAmbient: { cafe: 0.25, forest: 0.2 },
  },
  {
    id: 'loft-room',
    title: 'Căn Gác Xép Học Bài',
    subtitle: 'Đổi 4 chế độ Ngày / Đêm / Mưa rơi theo tâm trạng',
    badge: '4 THỜI TIẾT',
    videoUrl: '/focus/scenes/loft-night-rainy.mp4',
    posterUrl: '/focus/posters/loft-night-rainy.jpg',
    supportsWeatherVariants: true,
    recommendedAmbient: { rain: 0.45, keyboard: 0.2 },
  },
  {
    id: 'city-rain-girl',
    title: 'Bàn Học Đêm Mưa',
    subtitle: 'Nữ sinh ghi chép bài bên mèo đen & đèn cao ốc thành phố',
    badge: 'KINH ĐIỂN',
    videoUrl: '/focus/scenes/city-rain-girl.mp4',
    posterUrl: '/focus/posters/city-rain-girl.jpg',
    recommendedAmbient: { rain: 0.5 },
  },
  {
    id: 'pixel-midnight',
    title: 'Phòng Đêm Pixel Art',
    subtitle: 'Trăng khuyết, sao băng lướt qua cửa sổ & bể cá nhỏ',
    badge: 'PIXEL',
    videoUrl: '/focus/scenes/pixel-midnight.mp4',
    posterUrl: '/focus/posters/pixel-midnight.jpg',
    recommendedAmbient: { forest: 0.3 },
  },
  {
    id: 'forest-camp',
    title: 'Xe Van & Lửa Trại',
    subtitle: 'Đọc sách bên đống lửa bập bùng dưới bầu trời sao rừng thông',
    badge: 'CHILL',
    videoUrl: '/focus/scenes/forest-camp.mp4',
    posterUrl: '/focus/posters/forest-camp.jpg',
    recommendedAmbient: { campfire: 0.55, forest: 0.3 },
  },
  {
    id: 'tokyo-sunset-train',
    title: 'Hoàng Hôn Ga Tàu Nhật',
    subtitle: 'Cà phê nóng, mèo vàng dạo chơi & tàu điện lướt ngang',
    badge: 'NHẬT BẢN',
    videoUrl: '/focus/scenes/tokyo-sunset-train.mp4',
    posterUrl: '/focus/posters/tokyo-sunset-train.jpg',
    recommendedAmbient: { cafe: 0.3 },
  },
];

export const FOCUS_TRACKS: FocusTrackItem[] = [
  {
    id: 'midnight-candlelight',
    title: 'Midnight Candlelight',
    artist: 'KeyT Lofi Radio',
    mood: 'chill',
    moodLabel: 'Chill Lofi',
    audioUrl: '/focus/audio/tracks/midnight-candlelight.mp3',
  },
  {
    id: 'rainy-window-notes',
    title: 'Rainy Window Notes',
    artist: 'KeyT Lofi Radio',
    mood: 'chill',
    moodLabel: 'Chill Lofi',
    audioUrl: '/focus/audio/tracks/rainy-window-notes.mp3',
  },
  {
    id: 'espresso-warmth',
    title: 'Espresso Warmth',
    artist: 'KeyT Café Session',
    mood: 'jazzy',
    moodLabel: 'Jazzy Café',
    audioUrl: '/focus/audio/tracks/espresso-warmth.mp3',
  },
  {
    id: 'tokyo-evening-breeze',
    title: 'Tokyo Evening Breeze',
    artist: 'KeyT Café Session',
    mood: 'jazzy',
    moodLabel: 'Jazzy Café',
    audioUrl: '/focus/audio/tracks/tokyo-evening-breeze.mp3',
  },
  {
    id: 'starlight-dreaming',
    title: 'Starlight Dreaming',
    artist: 'KeyT Late Night',
    mood: 'midnight',
    moodLabel: 'Đêm Khuya',
    audioUrl: '/focus/audio/tracks/starlight-dreaming.mp3',
  },
  {
    id: 'quiet-pages',
    title: 'Quiet Pages',
    artist: 'KeyT Late Night',
    mood: 'midnight',
    moodLabel: 'Đêm Khuya',
    audioUrl: '/focus/audio/tracks/quiet-pages.mp3',
  },
];

export const FOCUS_AMBIENT_SOUNDS: FocusAmbientItem[] = [
  { id: 'rain', label: 'Mưa rơi', audioUrl: '/focus/audio/ambient/rain.mp3' },
  { id: 'cafe', label: 'Quán Cafe', audioUrl: '/focus/audio/ambient/cafe.mp3' },
  { id: 'campfire', label: 'Lửa trại', audioUrl: '/focus/audio/ambient/campfire.mp3' },
  { id: 'keyboard', label: 'Gõ phím cơ', audioUrl: '/focus/audio/ambient/keyboard.mp3' },
  { id: 'forest', label: 'Rừng đêm', audioUrl: '/focus/audio/ambient/forest.mp3' },
  { id: 'waves', label: 'Sóng biển', audioUrl: '/focus/audio/ambient/waves.mp3' },
];

export const DEFAULT_AMBIENT_VOLUMES: Record<FocusAmbientId, number> = {
  rain: 0.25,
  cafe: 0,
  campfire: 0,
  keyboard: 0,
  forest: 0,
  waves: 0,
};

export const FOCUS_BELL_AUDIO_URL = '/focus/audio/ambient/bell.mp3';
