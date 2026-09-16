import React, { useState, useEffect } from 'react';
import { ThaiDanceFact, getNextRandomFact } from '../data/factsData';
import { 
  Sparkles, 
  X, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';
import { ThaiDancerIcon } from './ThaiDancerIcon';
import { playTapSound, playSuccessSound } from '../utils/audio';

interface DidYouKnowModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoPopup?: boolean;
}

export const DidYouKnowModal: React.FC<DidYouKnowModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentFact, setCurrentFact] = useState<ThaiDanceFact | null>(() => {
    try {
      const res = getNextRandomFact();
      return res.fact;
    } catch {
      return null;
    }
  });
  const [factIndex, setFactIndex] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(1000);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load a random unseen fact when opened
  useEffect(() => {
    if (isOpen) {
      if (!currentFact) {
        loadNextFact();
      }
    } else {
      stopSpeech();
    }
  }, [isOpen]);

  const loadNextFact = () => {
    stopSpeech();
    const result = getNextRandomFact();
    setCurrentFact(result.fact);
    setFactIndex(result.currentIndex);
    setTotalCount(result.totalCount);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
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

    if ('speechSynthesis' in window) {
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
    const text = `💡 รู้หรือไม่? ๑,๐๐๐ เรื่องน่ารู้นาฏศิลป์ไทย\nเรื่อง: ${currentFact.title} (${currentFact.category})\n${currentFact.content}\n[ที่มา/ยุคสมัย: ${currentFact.sourceOrPeriod}]`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClose = () => {
    playTapSound();
    stopSpeech();
    onClose();
  };

  if (!isOpen || !currentFact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-amber-300/90 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Decorative Header */}
        <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 px-5 sm:px-6 py-4 text-white">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-1.5 shadow-inner">
                <ThaiDancerIcon className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold font-display uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>คลังเกร็ดความรู้ ๑,๐๐๐ เรื่อง</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-display leading-snug">
                  รู้หรือไม่? นาฏศิลป์ไทย
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Pill */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-display text-amber-100">
            <span>สุ่มคละไม่ซ้ำ ({factIndex} / {totalCount} เรื่อง)</span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-white font-mono font-bold">
              #{currentFact.id.toString().padStart(4, '0')}
            </span>
          </div>

          <div className="w-full bg-amber-900/40 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-amber-200 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, (factIndex / totalCount) * 100)}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Category & Period Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-100/90 text-amber-950 font-bold font-display text-xs border border-amber-300">
              หมวด: {currentFact.category}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold font-display text-xs">
              ที่มา: {currentFact.sourceOrPeriod}
            </span>
          </div>

          {/* Fact Title */}
          <h4 className="text-lg sm:text-xl font-bold font-display text-slate-900 leading-snug text-transparent bg-clip-text bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950">
            {currentFact.title}
          </h4>

          {/* Fact Content Text */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-sm sm:text-base text-slate-800 font-body leading-relaxed space-y-2">
            <p className="indent-4">{currentFact.content}</p>
          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Audio Speech Button */}
            <button
              onClick={handleSpeak}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold font-display flex items-center justify-center gap-1.5 border transition-all ${
                isSpeaking
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="ฟังเสียงอ่านภาษาไทย"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isSpeaking ? 'หยุดเสียง' : 'ฟังเสียงอ่าน'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold font-display flex items-center justify-center gap-1.5 transition-all"
              title="คัดลอกข้อความเกร็ดความรู้"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Next Fact Random Button */}
            <button
              onClick={() => {
                playTapSound();
                loadNextFact();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold font-display text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-300 shadow-2xs"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-700" />
              <span>อ่านเรื่องถัดไป</span>
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold font-display text-xs flex items-center justify-center transition-colors shadow-2xs"
            >
              <span>ปิด</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
