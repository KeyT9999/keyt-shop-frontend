import type { VideoMetadata } from '../types';

const extractVideoId = (url: string): string | null => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

export const fetchVideoMetadata = async (url: string): Promise<VideoMetadata> => {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error('URL YouTube không hợp lệ.');
  }

  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      id: videoId,
      url,
      title: data.title || 'Video YouTube',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: data.author_name || 'YouTube Channel',
    };
  } catch (error) {
    return {
      id: videoId,
      url,
      title: 'YouTube Video (Không lấy được tiêu đề)',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: 'Unknown Channel',
    };
  }
};

