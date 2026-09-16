import React, { useState } from 'react';
import { Lesson } from '../types';
import { EXTERNAL_MAIN_SITE } from '../data/lessonsData';
import { 
  X, 
  ExternalLink, 
  Play, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  CheckCircle, 
  Bookmark,
  Sparkles,
  Info
} from 'lucide-react';
import { speakText, stopSpeech, playTapSound } from '../utils/audio';

interface ChapterModalProps {
  lesson: Lesson | null;
  onClose: () => void;
  onPlayVideo: (youtubeId: string, title: string) => void;
  onStartExam?: (chapterId: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (chapterNumber: number) => void;
}

export const ChapterModal: React.FC<ChapterModalProps> = ({
  lesson,
  onClose,
  onPlayVideo,
  isBookmarked,
  onToggleBookmark
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!lesson) return null;

  const content = lesson.detailedContent || {
    introduction: lesson.shortDesc || '',
    sections: [],
    keyTakeaways: [],
    historicalContext: ''
  };

  const handleToggleAudio = () => {
    playTapSound();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const sectionTexts = (content.sections || []).map(s => `${s.heading}. ${s.body}`).join('. ');
      const takeaways = (content.keyTakeaways || []).join('. ');
      const textToRead = `${lesson.title}. ${lesson.subtitle}. ${content.introduction}. ${sectionTexts}. สาระสำคัญ: ${takeaways}`;
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  const handleCloseModal = () => {
    stopSpeech();
    setIsSpeaking(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Container (Light Theme) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-display text-xs font-bold shadow-2xs">
              บทที่ {lesson.chapterNumber}
            </span>
            <span className="text-xs font-semibold text-amber-900 font-display">
              {lesson.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Reader TTS */}
            <button
              onClick={handleToggleAudio}
              className={`p-2 rounded-xl border transition-all ${
                isSpeaking
                  ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={isSpeaking ? "หยุดอ่านออกเสียง" : "อ่านออกเสียงเนื้อหา"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => {
                playTapSound();
                onToggleBookmark(lesson.chapterNumber);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={isBookmarked ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-600' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={handleCloseModal}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-slate-800 font-body leading-relaxed no-scrollbar">
          
          {/* Header Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-1">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-display">
              {lesson.subtitle}
            </p>
          </div>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playTapSound();
                onPlayVideo(lesson.youtubeId, `${lesson.title} - ${lesson.videoTitle}`);
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold font-display flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ชมคลิปวิดีโอสาธิต</span>
            </button>

            <a
              href={`${EXTERNAL_MAIN_SITE}/${lesson.externalPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold font-display flex items-center gap-1.5 transition-colors ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดตำราฉบับเต็มภายนอก</span>
            </a>
          </div>

          {/* Introduction Box */}
          {content.introduction && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-body">
              <div className="flex items-center gap-1.5 font-display font-bold text-amber-900 mb-1 text-xs">
                <Info className="w-4 h-4 text-amber-700" />
                <span>บทนำและความเป็นมา</span>
              </div>
              <p>{content.introduction}</p>
            </div>
          )}

          {/* Academic Sections */}
          {(content.sections || []).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 font-display flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>สาระสำคัญและองค์ความรู้เชิงลึก</span>
              </h3>

              <div className="space-y-3">
                {content.sections.map((sec, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold font-display text-sm text-slate-900 text-amber-950">
                      {sec.heading}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-body">
                      {sec.body}
                    </p>
                    {Array.isArray(sec.bulletPoints) && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pt-1 pl-1">
                        {sec.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2 text-xs text-slate-700 font-body">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Takeaways */}
          {Array.isArray(content.keyTakeaways) && content.keyTakeaways.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>สาระสำคัญที่ควรทราบ:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {content.keyTakeaways.map((kp, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-display shadow-2xs flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historical Context */}
          {content.historicalContext && (
            <div className="p-3.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-body italic border border-slate-200">
              <span className="font-semibold text-slate-700 not-italic">บริบททางประวัติศาสตร์: </span>
              {content.historicalContext}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleToggleAudio}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display flex items-center gap-1.5 border transition-all ${
              isSpeaking
                ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSpeaking ? 'หยุดอ่านเสียง' : 'ฟังเสียงอ่าน'}</span>
          </button>

          <button
            onClick={handleCloseModal}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold font-display text-xs transition-colors shadow-2xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>

    </div>
  );
};
