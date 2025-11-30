import React from 'react';
import { Clock, Youtube } from 'lucide-react';
import type { VideoMetadata } from '../types';

interface Props {
  metadata: VideoMetadata;
  onClear: () => void;
}

export const VideoMetadataCard: React.FC<Props> = ({ metadata, onClear }) => {
  return (
    <div className="metadata-card">
      <div className="metadata-card__media">
        <img src={metadata.thumbnail} alt={metadata.title} loading="lazy" />
      </div>
      <div className="metadata-card__details">
        <div className="metadata-card__type">
          <Youtube size={18} />
          <span>YouTube Video</span>
        </div>
        <a href={metadata.url} target="_blank" rel="noreferrer" className="metadata-card__title">
          {metadata.title}
        </a>
        <p className="metadata-card__channel">Kênh: {metadata.channelName || 'Không rõ'}</p>
        <div className="metadata-card__actions">
          <div className="metadata-card__duration">
            <Clock size={14} />
            <span>Tự động xác định</span>
          </div>
          <button className="metadata-card__reset" onClick={onClear}>
            Chọn video khác
          </button>
        </div>
      </div>
    </div>
  );
};

