import React from 'react';
import { NavTab } from '../types';
import { Home, Film, Award, BookOpen, Bookmark } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface BottomDockProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  bookmarkCount: number;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  setActiveTab,
  bookmarkCount
}) => {
  return (
    <nav 
      id="bottom-navigation-dock"
      aria-label="เมนูหลักด้านล่าง"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-2"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* 1. Home Button */}
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('home');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative ${
            activeTab === 'home'
              ? 'text-amber-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-amber-100' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-display mt-0.5 tracking-tight">หน้าแรก</span>
          {activeTab === 'home' && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-amber-600 rounded-full" />
          )}
        </button>

        {/* 2. Videos Button */}
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('videos');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative ${
            activeTab === 'videos'
              ? 'text-rose-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'videos' ? 'bg-rose-100' : ''}`}>
            <Film className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-display mt-0.5 tracking-tight">วิดีโอชีต</span>
          {activeTab === 'videos' && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-rose-600 rounded-full" />
          )}
        </button>

        {/* 3. Center 100-Question Exam Button */}
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('exam');
          }}
          className="flex flex-col items-center justify-center flex-1 -mt-5 group"
        >
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
            activeTab === 'exam'
              ? 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white border-amber-300 ring-4 ring-amber-100'
              : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-300 border-slate-700 hover:scale-105'
          }`}>
            <Award className="w-6 h-6" />
          </div>
          <span className={`text-[11px] font-display mt-1 font-bold ${
            activeTab === 'exam' ? 'text-amber-700' : 'text-slate-700'
          }`}>
            ข้อสอบ ๑๐๐ ข้อ
          </span>
        </button>

        {/* 4. Books / PDF & Doc Viewer Button (ปรับเป็น หนังสือ ตามคำขอ) */}
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('books');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative ${
            activeTab === 'books'
              ? 'text-amber-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'books' ? 'bg-amber-100 text-amber-800' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-display mt-0.5 tracking-tight">ตำรา/หนังสือ</span>
          {activeTab === 'books' && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-amber-600 rounded-full" />
          )}
        </button>

        {/* 5. Bookmarks Button */}
        <button
          onClick={() => {
            playTapSound();
            setActiveTab('bookmarks');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all relative ${
            activeTab === 'bookmarks'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'bookmarks' ? 'bg-teal-100' : ''}`}>
            <Bookmark className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-display mt-0.5 tracking-tight">บันทึกไว้</span>
          {bookmarkCount > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-amber-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-2xs">
              {bookmarkCount}
            </span>
          )}
          {activeTab === 'bookmarks' && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-teal-600 rounded-full" />
          )}
        </button>

      </div>
    </nav>
  );
};
