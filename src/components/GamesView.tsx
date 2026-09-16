import React, { useState, useEffect } from 'react';
import { Gamepad2, Zap, Layers, RotateCcw, Trophy, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTapSound, playCorrectSound, playWrongSound, playCelebrationFanfare } from '../utils/audio';

interface SpeedQuestion {
  icon: string;
  name: string;
  options: string[];
  correctIndex: number;
}

const SPEED_GESTURES: SpeedQuestion[] = [
  {
    icon: "🙆‍♂️",
    name: "ตั้งวงบน (ตัวพระ)",
    options: ["ปลายนิ้วระดับแง่ศีรษะ ข้อศอกผึ่งผาย", "มืออยู่ระดับชายพก", "หงายมือระดับเอว", "ไขว้มือระดับอก"],
    correctIndex: 0
  },
  {
    icon: "👌",
    name: "จีบหงาย",
    options: ["หงายมือ นิ้วชี้จรดนิ้วโป้ง หักข้อมือขึ้น", "คว่ำมือลง นิ้วเหยียดตรง", "ตั้งวงระดับอก", "สลัดมือออกด้านข้าง"],
    correctIndex: 0
  },
  {
    icon: "💎",
    name: "จีบล่อแก้ว",
    options: ["นิ้วหัวแม่มือกดทับบนเล็บนิ้วกลาง", "นิ้วชี้แตะนิ้วก้อย", "กำมือแน่นทั้งห้านิ้ว", "กางนิ้วออกทุกนิ้ว"],
    correctIndex: 0
  },
  {
    icon: "🦶",
    name: "ประเท้า",
    options: ["ย่อเข่า ส้นเท้าติดพื้น จมูกเท้าตบพื้นเบาๆ", "ก้าวเท้าไปข้างหลัง", "กระโดดสลับเท้า", "หมุนตัวรอบทิศ"],
    correctIndex: 0
  },
  {
    icon: "🙇‍♂️",
    name: "ตั้งวงล่าง",
    options: ["ทอดแขนลง ปลายนิ้วระดับชายพก", "ปลายนิ้วระดับหางตา", "ตั้งวงชูเหนือศีรษะ", "กางแขนออกสุดตัว"],
    correctIndex: 0
  },
  {
    icon: "👑",
    name: "ศิราภรณ์",
    options: ["เครื่องประดับศีรษะ เช่น ชฎา มงกุฎ หัวโขน", "เครื่องแต่งกายท่อนล่าง", "รองเท้าผ้าใบ", "กำไลข้อเท้า"],
    correctIndex: 0
  },
  {
    icon: "🎭",
    name: "หัวโขนทศกัณฐ์",
    options: ["หน้ายักษ์สีเขียว ปากแสยะ ตาโพลง ๑๐ พักตร์", "หน้าพระสีทอง มงกุฎยอดบวช", "หน้าลิงเผือกสีขาว", "หน้ามนุษย์ธรรมดา"],
    correctIndex: 0
  },
  {
    icon: "🐒",
    name: "หัวโขนหนุมาน",
    options: ["หน้าลิงสีขาวเผือก ปากอ้า เขี้ยวแก้ว", "หน้าสีเขียว ปากขบ", "หน้าสีทอง ปากแสยะ", "หน้าสีดำสนิท"],
    correctIndex: 0
  }
];

interface SortItem {
  name: string;
  category: 'โขน' | 'ละคร' | 'ระบำ' | 'พื้นบ้าน';
}

const SORT_ITEMS: SortItem[] = [
  { name: "ระบำพรหมาสตร์", category: "ระบำ" },
  { name: "หนุมานจับนางเบญกาย", category: "โขน" },
  { name: "ละครนอก เรื่องสังข์ทอง", category: "ละคร" },
  { name: "เซิ้งกระติบข้าว", category: "พื้นบ้าน" },
  { name: "ระบำกฤดาภินิหาร", category: "ระบำ" },
  { name: "ฟ้อนเล็บเมืองเหนือ", category: "พื้นบ้าน" },
  { name: "พากย์เมือง-ยกทัพรบ", category: "โขน" },
  { name: "ละครใน เรื่องอิเหนา", category: "ละคร" },
  { name: "เต้นกำรำเคียว", category: "พื้นบ้าน" },
  { name: "ระบำดาวดึงส์", category: "ระบำ" },
  { name: "โนราโรงครู", category: "พื้นบ้าน" },
  { name: "ละครดึกดำบรรพ์ เรื่องคาวี", category: "ละคร" }
];

export const GamesView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'speed' | 'sort'>('speed');

  // GAME 1: SPEED TAP STATE
  const [speedScore, setSpeedScore] = useState(0);
  const [speedStreak, setSpeedStreak] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(15);
  const [isSpeedRunning, setIsSpeedRunning] = useState(false);
  const [speedQIndex, setSpeedQIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [speedBest, setSpeedBest] = useState(0);
  const [speedFinished, setSpeedFinished] = useState(false);

  // GAME 2: CATEGORY SORT STATE
  const [sortIndex, setSortIndex] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortFeedback, setSortFeedback] = useState<string | null>(null);

  // Load high scores
  useEffect(() => {
    const savedBest = localStorage.getItem('thai_dance_speed_best');
    if (savedBest) {
      setSpeedBest(parseInt(savedBest, 10));
    }
  }, []);

  // Speed timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSpeedRunning && speedTimer > 0) {
      timer = setInterval(() => {
        setSpeedTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleEndSpeedGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSpeedRunning, speedTimer]);

  const loadNewSpeedQuestion = () => {
    const nextIdx = Math.floor(Math.random() * SPEED_GESTURES.length);
    setSpeedQIndex(nextIdx);
    const q = SPEED_GESTURES[nextIdx];
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
  };

  const handleStartSpeedGame = () => {
    playTapSound();
    setSpeedScore(0);
    setSpeedStreak(0);
    setSpeedTimer(15);
    setSpeedFinished(false);
    setIsSpeedRunning(true);
    loadNewSpeedQuestion();
  };

  const handleEndSpeedGame = () => {
    setIsSpeedRunning(false);
    setSpeedFinished(true);
    playCelebrationFanfare();
    
    setSpeedScore(current => {
      const prevBest = parseInt(localStorage.getItem('thai_dance_speed_best') || '0', 10);
      if (current > prevBest) {
        localStorage.setItem('thai_dance_speed_best', current.toString());
        setSpeedBest(current);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      return current;
    });
  };

  const handleSpeedAnswer = (selectedOpt: string) => {
    if (!isSpeedRunning) return;
    const currentQ = SPEED_GESTURES[speedQIndex];
    const correctOpt = currentQ.options[currentQ.correctIndex];

    if (selectedOpt === correctOpt) {
      playCorrectSound();
      const points = 10 + speedStreak * 2;
      setSpeedScore(prev => prev + points);
      setSpeedStreak(prev => prev + 1);
      setSpeedTimer(prev => Math.min(20, prev + 2)); // 2s bonus
      loadNewSpeedQuestion();
    } else {
      playWrongSound();
      setSpeedStreak(0);
      setSpeedTimer(prev => Math.max(0, prev - 3)); // 3s penalty
      loadNewSpeedQuestion();
    }
  };

  // CATEGORY SORT GAME LOGIC
  const handleSortAnswer = (category: 'โขน' | 'ละคร' | 'ระบำ' | 'พื้นบ้าน') => {
    playTapSound();
    const current = SORT_ITEMS[sortIndex];
    if (category === current.category) {
      playCorrectSound();
      setSortScore(prev => prev + 10);
      setSortFeedback(`✓ ถูกต้อง! "${current.name}" คือหมวด${current.category}`);
    } else {
      playWrongSound();
      setSortFeedback(`✕ ยังไม่ถูก ("${current.name}" อยู่ในหมวด${current.category})`);
    }

    setTimeout(() => {
      setSortFeedback(null);
      setSortIndex(prev => prev + 1);
    }, 700);
  };

  const handleRestartSort = () => {
    playTapSound();
    setSortIndex(0);
    setSortScore(0);
    setSortFeedback(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Games Header (Light Theme) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold uppercase font-display border border-amber-200 mb-1">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Interactive Learning Games</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              ศูนย์เกมการเรียนรู้นาฏศิลป์ไทย
            </h2>
            <p className="text-xs text-slate-500">
              มินิเกมฝึกความจำและตอบสนองความเร็วด้วยระบบแตะสัมผัสบนมือถือ
            </p>
          </div>

          {/* Game Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-stretch sm:self-auto text-xs font-display">
            <button
              onClick={() => {
                playTapSound();
                setActiveGame('speed');
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeGame === 'speed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>สปีดแท็ปนาฏยศัพท์</span>
            </button>
            <button
              onClick={() => {
                playTapSound();
                setActiveGame('sort');
              }}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeGame === 'sort'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>แยกหมวดหมู่การแสดง</span>
            </button>
          </div>
        </div>

      </div>

      {/* GAME 1: SPEED TAP GAME */}
      {activeGame === 'speed' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Top Score & Timer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-display">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 text-[10px] block">คะแนน</span>
                <span className="font-bold text-amber-800 text-base">{speedScore}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">คอมโบต่อเนื่อง</span>
                <span className="font-bold text-rose-700 text-base flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-rose-600" />
                  {speedStreak}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">เวลาคงเหลือ</span>
                <span className={`font-bold text-base ${speedTimer <= 5 ? 'text-rose-600 animate-ping' : 'text-emerald-700'}`}>
                  {speedTimer}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-xs hidden sm:inline flex items-center gap-1 font-semibold">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                สถิติดีที่สุด: {speedBest}
              </span>
              <button
                onClick={handleStartSpeedGame}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isSpeedRunning ? 'เริ่มใหม่' : 'เริ่มเล่นเกม'}</span>
              </button>
            </div>
          </div>

          {/* Timer Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 ${
                speedTimer <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${(speedTimer / 15) * 100}%` }}
            />
          </div>

          {/* Speed Game Arena */}
          {!isSpeedRunning && !speedFinished ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-4xl mx-auto shadow-xs">
                ⚡
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900">พร้อมทดสอบความไวหรือยัง?</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-body">
                แตะเลือกคำอธิบายท่ารำและศัพท์นาฏศิลป์ที่ถูกต้องให้เร็วที่สุด เพื่อสะสมคะแนนคอมโบและเพิ่มเวลาพิเศษ!
              </p>
              <button
                onClick={handleStartSpeedGame}
                className="px-8 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-sm shadow-sm active:scale-95 transition-transform"
              >
                🎮 เริ่มจับเวลาเล่นเกม
              </button>
            </div>
          ) : speedFinished ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="text-5xl">🏆</div>
              <h3 className="text-2xl font-bold font-display text-slate-900">หมดเวลาทำคะแนน!</h3>
              <p className="text-sm text-slate-700">
                คุณทำคะแนนได้ทั้งหมด <strong className="text-amber-800 text-lg">{speedScore} คะแนน</strong>
              </p>
              {speedScore >= speedBest && speedScore > 0 && (
                <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-display">
                  🎉 สถิติใหม่สูงสุดของคุณ!
                </div>
              )}
              <button
                onClick={handleStartSpeedGame}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-xs transition-transform active:scale-95"
              >
                🔄 เล่นใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-xl mx-auto text-center animate-in fade-in duration-150">
              
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 border border-slate-200 text-4xl shadow-xs mx-auto">
                {SPEED_GESTURES[speedQIndex].icon}
              </div>

              <div>
                <span className="text-[11px] text-amber-800 font-display block uppercase tracking-wider mb-1 font-bold">
                  ทายความหมายของท่ารำ
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                  "{SPEED_GESTURES[speedQIndex].name}" หมายถึงข้อใด?
                </h3>
              </div>

              {/* 4 Fast Tap Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {shuffledOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSpeedAnswer(opt)}
                    className="min-h-[58px] p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50 text-slate-800 text-xs sm:text-sm font-display font-semibold transition-all active:scale-95 touch-manipulation text-left flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <span>{opt}</span>
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 shrink-0">➔</span>
                  </button>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* GAME 2: CATEGORY SORTING GAME */}
      {activeGame === 'sort' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Header & Score */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-display">
            <div>
              <span className="text-slate-900 font-bold block text-sm">เกมแยกหมวดหมู่ศิลปะการแสดง</span>
              <span className="text-slate-500 text-[11px]">แตะปุ่มหมวดหมู่ด้านล่างเพื่อจัดเก็บโจทย์ให้ถูกต้อง</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-amber-800 text-base">คะแนน: {sortScore}</span>
              <button
                onClick={handleRestartSort}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200"
                title="เริ่มใหม่"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {sortIndex >= SORT_ITEMS.length ? (
            <div className="py-12 text-center space-y-4 max-w-md mx-auto">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl font-bold font-display text-slate-900">จัดหมวดหมู่ครบถ้วนแล้ว!</h3>
              <p className="text-sm text-slate-700">
                คะแนนรวม: <strong className="text-emerald-700 text-lg">{sortScore} / {SORT_ITEMS.length * 10} คะแนน</strong>
              </p>
              <button
                onClick={handleRestartSort}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-xs transition-transform active:scale-95"
              >
                🔄 เล่นใหม่อีกรอบ
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-lg mx-auto text-center">
              
              <span className="inline-block text-[11px] font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-display">
                ข้อที่ {sortIndex + 1} / {SORT_ITEMS.length}
              </span>

              {/* Card Question Box */}
              <div className="p-6 bg-amber-50/60 border-2 border-amber-300 rounded-3xl shadow-xs space-y-2">
                <span className="text-xs text-slate-500 block font-display">ชุดการแสดงนี้จัดอยู่ในหมวดหมู่ใด?</span>
                <h3 className="text-2xl font-bold font-display text-slate-900">
                  "{SORT_ITEMS[sortIndex].name}"
                </h3>
              </div>

              {sortFeedback && (
                <div className="p-2.5 rounded-xl bg-slate-100 text-xs font-bold font-display text-amber-900 border border-slate-200 animate-in fade-in">
                  {sortFeedback}
                </div>
              )}

              {/* 4 Category Mobile Tap Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleSortAnswer('โขน')}
                  className="min-h-[60px] p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-display text-sm font-bold border border-indigo-200 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>🎭</span>
                  <span>โขน</span>
                </button>

                <button
                  onClick={() => handleSortAnswer('ละคร')}
                  className="min-h-[60px] p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-950 font-display text-sm font-bold border border-purple-200 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>💃</span>
                  <span>ละคร</span>
                </button>

                <button
                  onClick={() => handleSortAnswer('ระบำ')}
                  className="min-h-[60px] p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-display text-sm font-bold border border-amber-200 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  <span>ระบำ</span>
                </button>

                <button
                  onClick={() => handleSortAnswer('พื้นบ้าน')}
                  className="min-h-[60px] p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-display text-sm font-bold border border-emerald-200 shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>🌾</span>
                  <span>การแสดงพื้นบ้าน</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
