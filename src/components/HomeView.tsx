import React, { useState, useEffect, useRef } from 'react';
import { Lesson, VideoItem, NavTab } from '../types';
import { LESSONS_DATA } from '../data/lessonsData';
import { ThaiDanceFact, getNextRandomFact } from '../data/factsData';
import { 
  Play, 
  Pause,
  BookOpen, 
  Bookmark, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Flame, 
  Award,
  BookMarked,
  CheckCircle2,
  FileText,
  Lightbulb,
  Shuffle,
  Volume2,
  VolumeX,
  Copy,
  Check
} from 'lucide-react';
import { ThaiDancerIcon } from './ThaiDancerIcon';
import { playTapSound, playSuccessSound } from '../utils/audio';

interface HomeViewProps {
  onSelectLesson: (lesson: Lesson) => void;
  onPlayVideo: (youtubeId: string, title: string) => void;
  onStartExam: (chapterId?: number) => void;
  setActiveTab: (tab: NavTab) => void;
  videos: VideoItem[];
  bookmarks: number[];
  onToggleBookmark: (chapterNumber: number) => void;
  onOpenDidYouKnow?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectLesson,
  onPlayVideo,
  onStartExam,
  videos,
  bookmarks,
  onToggleBookmark
}) => {
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [expandedSummaryChapter, setExpandedSummaryChapter] = useState<number | null>(null);

  // Did You Know Board State
  const [currentFact, setCurrentFact] = useState<ThaiDanceFact | null>(null);
  const [factIndex, setFactIndex] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(1000);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0); // 0 to 100%
  const [fadeKey, setFadeKey] = useState<number>(0);

  const SLIDE_DURATION_MS = 8000;
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNextFact(false);
    return () => {
      stopSpeech();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // 8-second auto-slide runner
  useEffect(() => {
    if (!isAutoPlay || isSpeaking || isHovered) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    const stepMs = 100;
    const increment = (stepMs / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          loadNextFact(false);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isAutoPlay, isSpeaking, isHovered, currentFact]);

  const loadNextFact = (playSound = true) => {
    stopSpeech();
    if (playSound) playTapSound();
    const result = getNextRandomFact();
    setCurrentFact(result.fact);
    setFactIndex(result.currentIndex);
    setTotalCount(result.totalCount);
    setSlideProgress(0);
    setFadeKey((prev) => prev + 1);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSpeak = () => {
    if (!currentFact) return;
    playTapSound();

    if (isSpeaking) {
      stopSpeech();
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `รู้หรือไม่ เรื่อง ${currentFact.title}. หมวด ${currentFact.category}. ${currentFact.content}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'th-TH';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    if (!currentFact) return;
    playSuccessSound();
    const text = `💡 รู้หรือไม่? นาฏศิลป์ไทย: ${currentFact.title} (${currentFact.category})\n${currentFact.content}\n[ที่มา: ${currentFact.sourceOrPeriod}]`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleAutoPlay = () => {
    playTapSound();
    setIsAutoPlay(!isAutoPlay);
    if (!isAutoPlay) {
      setSlideProgress(0);
    }
  };

  const safeVideos = Array.isArray(videos) ? videos : [];
  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : [];
  const safeLessons = Array.isArray(LESSONS_DATA) ? LESSONS_DATA : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. DID YOU KNOW AUTO-SLIDING KNOWLEDGE BOARD (สไลด์เปลี่ยนทุก 8 วิ กระชับ สวยงาม) */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-white to-amber-100/35 border border-amber-200/90 shadow-xs transition-all"
      >
        {/* Continuous 8-second Progress Bar */}
        <div className="h-1 w-full bg-amber-100 relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-100 ease-linear"
            style={{ width: `${isAutoPlay && !isSpeaking && !isHovered ? slideProgress : isAutoPlay ? slideProgress : 0}%` }}
          />
        </div>

        <div className="p-4 sm:p-5 space-y-3 relative z-10">
          
          {/* Header Row: Compact Title & Slide Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
            
            {/* Left: Emblem + Title + Index */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-2xs flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                  <ThaiDancerIcon className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold font-display text-slate-900 truncate">
                    รู้หรือไม่? นาฏศิลป์ไทย
                  </h2>
                  {currentFact && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-200 shrink-0">
                      #{currentFact.id}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-display">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{isHovered ? 'หยุดชั่วคราวขณะชี้เมาส์' : isAutoPlay ? 'สไลด์ทุก ๘ วิ' : 'หยุดสไลด์'}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Play/Pause 8s Auto-slide */}
              <button
                onClick={toggleAutoPlay}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold font-display flex items-center gap-1 border transition-all active:scale-95 ${
                  isAutoPlay 
                    ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200' 
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
                title={isAutoPlay ? 'กดเพื่อหยุดสไลด์อัตโนมัติ' : 'กดเพื่อเล่นสไลด์อัตโนมัติทุก 8 วินาที'}
              >
                {isAutoPlay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span className="hidden sm:inline text-[11px]">{isAutoPlay ? '๘ วิ' : 'หยุด'}</span>
              </button>

              {/* Read Aloud Button */}
              <button
                onClick={handleSpeak}
                className={`p-1.5 sm:p-2 rounded-xl text-xs border transition-all active:scale-95 ${
                  isSpeaking
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
                title="ฟังเสียงอ่าน"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs transition-all active:scale-95"
                title="คัดลอกเกร็ดความรู้"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              </button>

              {/* Next Slide Button */}
              <button
                onClick={() => loadNextFact(true)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold font-display text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                title="เปลี่ยนเรื่องถัดไปทันที"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden md:inline">เรื่องถัดไป</span>
              </button>

            </div>

          </div>

          {/* Fact Body (Concise, Clean & Smooth Fade) */}
          {currentFact && (
            <div key={fadeKey} className="space-y-1.5 animate-in fade-in duration-300">
              
              {/* Category & Period */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold font-display text-[10px] sm:text-[11px] border border-amber-200">
                  {currentFact.category}
                </span>
                <span className="text-[11px] text-slate-500 font-display">
                  • {currentFact.sourceOrPeriod}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 leading-snug">
                {currentFact.title}
              </h3>

              {/* Story Content */}
              <div className="bg-white/95 rounded-2xl p-3 sm:p-4 border border-amber-200/80 shadow-2xs">
                <p className="text-xs sm:text-sm text-slate-800 font-body leading-relaxed text-justify">
                  {currentFact.content}
                </p>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 2. SLIDE-DOWN CHAPTER EXAM SELECTOR (เลือกบทเรียนที่ต้องการสอบ แบบสไลด์ลงด้านล่าง) */}
      <section className="bg-white border border-amber-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>เลือกบทเรียนที่ต้องการสอบ (มี ๑๐๐ ข้อต่อบท)</span>
            </h3>
            <p className="text-xs text-slate-500 font-body">
              กดเลือกบทเรียนเพื่อเริ่มทำข้อสอบมาตรฐานในระบบได้ทันที
            </p>
          </div>

          <button
            onClick={() => {
              playTapSound();
              setIsExamDropdownOpen(!isExamDropdownOpen);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-display text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <span>{isExamDropdownOpen ? 'ซ่อนรายการบทเรียน' : 'สไลด์เปิดเลือกบทเรียนที่จะสอบ'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Slide-down Exam Chapters Grid */}
        {isExamDropdownOpen && (
          <div className="pt-3 border-t border-slate-100 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              
              {/* All Chapters Mixed Option */}
              <button
                onClick={() => {
                  playTapSound();
                  onStartExam(undefined);
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white text-left hover:scale-[1.02] transition-all flex items-center justify-between group shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-bold font-display uppercase tracking-wider text-amber-300 block">
                    ชุดรวมข้อสอบมาตรฐาน
                  </span>
                  <h4 className="font-bold font-display text-xs sm:text-sm">
                    รวมทุกบท (สุ่ม ๑๐๐ ข้อ)
                  </h4>
                </div>
                <Flame className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </button>

              {/* 10 Chapters List */}
              {safeLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    playTapSound();
                    onStartExam(lesson.chapterNumber);
                  }}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-left hover:scale-[1.02] transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold font-display text-amber-800 block">
                      บทที่ {lesson.chapterNumber} • ๑๐๐ ข้อ
                    </span>
                    <h4 className="font-bold font-display text-xs sm:text-sm text-slate-900 truncate">
                      {lesson.title}
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}

            </div>
          </div>
        )}
      </section>

      {/* 3. 10 ACADEMIC CHAPTERS CARDS LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-slate-900">
              ๑๐ บทเรียนวิชาการนาฏศิลป์ไทย
            </h3>
          </div>
          <span className="text-xs font-display text-slate-500">
            ครบถ้วน ๑๐ บทเรียน
          </span>
        </div>

        {/* Chapters Cards */}
        <div className="space-y-3.5">
          {safeLessons.map((lesson) => {
            const isBookmarked = safeBookmarks.includes(lesson.chapterNumber);
            const isSummaryExpanded = expandedSummaryChapter === lesson.chapterNumber;
            const relatedVideo = safeVideos.find(v => v?.chapterNumber === lesson.chapterNumber) || 
              (lesson.youtubeId ? { id: lesson.id, category: lesson.category, title: lesson.videoTitle || lesson.title, description: lesson.shortDesc, url: '', youtubeId: lesson.youtubeId, thumbnailUrl: '' } : null);

            return (
              <div
                key={lesson.id}
                className="bg-white border border-slate-200 hover:border-amber-300 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all group"
              >
                
                {/* Card Top Header: Badge, Info, and Bookmark Button nicely aligned */}
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left: Chapter Badge & Info */}
                  <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col items-center justify-center shrink-0 font-display font-bold shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <span className="text-[10px] uppercase font-bold leading-none">บทที่</span>
                      <span className="text-sm sm:text-base leading-tight">{lesson.chapterNumber}</span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold font-display px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                          {lesson.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-display truncate">
                          • {lesson.subtitle}
                        </span>
                      </div>

                      <h4 
                        onClick={() => {
                          playTapSound();
                          onSelectLesson(lesson);
                        }}
                        className="font-bold font-display text-base sm:text-lg text-slate-900 hover:text-amber-700 cursor-pointer transition-colors leading-snug"
                      >
                        {lesson.title}
                      </h4>

                      <p className="text-xs text-slate-600 font-body leading-relaxed line-clamp-2">
                        {lesson.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Bookmark / รายการโปรด Button (Clean, perfectly fitted) */}
                  <button
                    onClick={() => {
                      playTapSound();
                      onToggleBookmark(lesson.chapterNumber);
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 text-xs font-display font-semibold whitespace-nowrap shadow-2xs ${
                      isBookmarked
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                    title={isBookmarked ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{isBookmarked ? 'บันทึกแล้ว' : 'รายการโปรด'}</span>
                  </button>

                </div>

                {/* Quick Summary Dropdown Preview */}
                {isSummaryExpanded && lesson.detailedContent && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 bg-amber-50/40 rounded-2xl p-3.5 text-xs text-slate-700 font-body space-y-2 animate-in fade-in duration-200">
                    <p className="font-semibold text-amber-950 font-display">
                      💡 สรุปสาระสำคัญ:
                    </p>
                    <p className="leading-relaxed">
                      {lesson.detailedContent.introduction}
                    </p>
                    {lesson.detailedContent.keyTakeaways && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {lesson.detailedContent.keyTakeaways.slice(0, 4).map((k, kIdx) => (
                          <div key={kIdx} className="flex items-start gap-1.5 text-[11px] text-slate-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{k}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Left Action: Toggle Summary Preview */}
                  <button
                    onClick={() => {
                      playTapSound();
                      setExpandedSummaryChapter(isSummaryExpanded ? null : lesson.chapterNumber);
                    }}
                    className="text-xs font-bold font-display text-slate-600 hover:text-amber-800 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isSummaryExpanded ? 'ซ่อนสรุปย่อ' : 'ดูสรุปสาระสำคัญ'}</span>
                  </button>

                  {/* Right Actions: Read Modal, Video & Exam */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                    
                    {/* Read Chapter Details */}
                    <button
                      onClick={() => {
                        playTapSound();
                        onSelectLesson(lesson);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-display flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>อ่านบทเรียน</span>
                    </button>

                    {/* Play Video if available */}
                    {relatedVideo && (
                      <button
                        onClick={() => {
                          playTapSound();
                          onPlayVideo(relatedVideo.youtubeId, relatedVideo.title);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold font-display flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-3 h-3 text-red-600 fill-red-600" />
                        <span>คลิปสาธิต</span>
                      </button>
                    )}

                    {/* Start Exam 100 Questions */}
                    <button
                      onClick={() => {
                        playTapSound();
                        onStartExam(lesson.chapterNumber);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-display flex items-center gap-1 shadow-2xs transition-colors active:scale-95"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-200" />
                      <span>สอบบทนี้ (๑๐๐ ข้อ)</span>
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
