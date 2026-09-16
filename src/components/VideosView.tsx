import React, { useState } from 'react';
import { VideoItem } from '../types';
import { SheetSettingsModal } from './SheetSettingsModal';
import { Play, RefreshCw, ExternalLink, Search, CheckCircle2, Film, Settings, AlertCircle } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface VideosViewProps {
  videos: VideoItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onPlayVideo: (youtubeId: string, title: string) => void;
  sheetSource: 'sheet' | 'fallback';
}

export const VideosView: React.FC<VideosViewProps> = ({
  videos,
  isLoading,
  onRefresh,
  onPlayVideo,
  sheetSource
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Extract unique categories safely
  const safeVideos = Array.isArray(videos) ? videos : [];
  const categories = ['ทั้งหมด', ...Array.from(new Set(safeVideos.map(v => v?.category).filter(Boolean)))];

  const filteredVideos = safeVideos.filter(v => {
    if (!v) return false;
    const matchesCat = selectedCategory === 'ทั้งหมด' || v.category === selectedCategory;
    const matchesSearch = !searchTerm || (
      (v.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Page Header & Google Sheet Status (Light Theme) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold uppercase font-display border border-amber-200 mb-1.5">
              <Film className="w-3.5 h-3.5" />
              <span>Google Sheets Database</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              คลังวิดีโอนาฏศิลป์ไทย
            </h2>
            <p className="text-xs text-slate-500">
              ดึงข้อมูลจากตาราง Google Sheet (category, title, description, url) เมื่ออัปเดตชีตแล้วกดรีเฟรชได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {/* Sheet Link Settings */}
            <button
              onClick={() => {
                playTapSound();
                setIsSettingsOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 text-xs font-semibold font-display flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              title="ตั้งค่าหรือวางลิงก์ Google Sheet คลิป"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>ตั้งค่าชีต</span>
            </button>

            {/* Sync Button */}
            <button
              onClick={() => {
                playTapSound();
                onRefresh();
              }}
              disabled={isLoading}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold font-display transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              title="รีเฟรชข้อมูลจาก Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชชีต'}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-display">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${
              sheetSource === 'sheet'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {sheetSource === 'sheet' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>เชื่อมต่อ Google Sheets สำเร็จ</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>ใช้ชุดคลิปสำรอง (กดปุ่ม "ตั้งค่าชีต" เพื่อใส่ลิงก์ชีตคลิปของคุณ)</span>
                </>
              )}
            </span>
            <span className="text-slate-500 text-[11px]">
              ทั้งหมด {videos.length} รายการ
            </span>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อคลิป หรือคำอธิบาย..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-display"
          />
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-display">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playTapSound();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            onClick={() => {
              playTapSound();
              if (video.youtubeId) {
                onPlayVideo(video.youtubeId, video.title);
              } else if (video.url) {
                window.open(video.url, '_blank');
              }
            }}
            className="group cursor-pointer rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-amber-400 transition-all flex flex-col"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                onError={(e) => {
                  // Fallback thumbnail if YouTube image fails
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] font-medium font-display text-white/90 bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded">
                  {video.category}
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/30">
                <span className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h3 className="font-bold font-display text-sm sm:text-base text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-xs text-slate-500 font-body line-clamp-2 mt-1">
                    {video.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-display">
                <span>เปิดดูวิดีโอ</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 font-display space-y-2">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <p>ไม่พบคลิปวิดีโอที่ค้นหา</p>
        </div>
      )}

      {/* Google Sheet Settings Modal */}
      <SheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialType="videos"
        onSyncComplete={() => {
          onRefresh();
        }}
      />

    </div>
  );
};
