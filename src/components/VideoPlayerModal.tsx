import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface VideoPlayerModalProps {
  youtubeId: string | null;
  videoTitle: string;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  youtubeId,
  videoTitle,
  onClose
}) => {
  if (!youtubeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
      >
        
        {/* Top bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="font-bold font-display text-sm sm:text-base text-slate-900 truncate">
              {videoTitle || 'คลิปวิดีโอนาฏศิลป์ไทย'}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="เปิดดูบน YouTube"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                playTapSound();
                onClose();
              }}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Embed Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={videoTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Bottom Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-display">
          <span>สตรีมจาก Google Sheets & YouTube Player</span>
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>

    </div>
  );
};
