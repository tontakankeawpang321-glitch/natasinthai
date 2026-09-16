import React from 'react';
import { NavTab } from '../types';
import { Gamepad2, Bookmark, ExternalLink } from 'lucide-react';
import { EXTERNAL_MAIN_SITE } from '../data/lessonsData';
import { ThaiDancerIcon } from './ThaiDancerIcon';
import { playTapSound } from '../utils/audio';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  bookmarkCount: number;
  onOpenDidYouKnow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title with Thai Dancer Icon */}
        <div 
          onClick={() => {
            playTapSound();
            setActiveTab('home');
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
        >
          {/* Thai Dancer Icon Container */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-amber-50 rounded-[14px] flex items-center justify-center p-1">
              <ThaiDancerIcon className="w-7 h-7 text-amber-600" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-sm sm:text-base md:text-lg text-slate-900 tracking-tight leading-tight group-hover:text-amber-700 transition-colors whitespace-nowrap">
                หอวิชาการนาฏศิลป์ไทย
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-display">
                บทละ ๑๐๐ ข้อ
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-body leading-none mt-0.5 truncate hidden sm:block">
              คลังสารสนเทศ & ชุดข้อสอบมาตรฐาน ๑๐ บทเรียน
            </p>
          </div>
        </div>

        {/* Action Controls - Icons Only */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Learning Games Button - Icon Only */}
          <button
            onClick={() => {
              playTapSound();
              setActiveTab('games');
            }}
            className={`w-10 h-10 rounded-2xl border transition-all flex items-center justify-center shadow-2xs active:scale-95 ${
              activeTab === 'games'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-800'
            }`}
            title="เกมการเรียนรู้นาฏศิลป์ไทย"
            aria-label="เกมการเรียนรู้"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>

          {/* Bookmarks Button - Icon Only */}
          <button
            onClick={() => {
              playTapSound();
              setActiveTab('bookmarks');
            }}
            className={`relative w-10 h-10 rounded-2xl border transition-all flex items-center justify-center shadow-2xs active:scale-95 ${
              activeTab === 'bookmarks'
                ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="บทเรียนที่บันทึกไว้"
            aria-label="รายการโปรดที่บันทึกไว้"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* External Site Direct Link */}
          <a
            href={EXTERNAL_MAIN_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
            title="เปิดเว็บไซต์หลัก (Google Sites)"
            aria-label="เปิดเว็บไซต์หลัก"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </a>

        </div>

      </div>
    </header>
  );
};
