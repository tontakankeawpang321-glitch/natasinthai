import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { getQuestionsByChapter, getFull100MockExam, CHAPTER_NAMES } from '../data/examQuestionsData';
import { LESSONS_DATA } from '../data/lessonsData';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  Clock, 
  Check, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Shuffle, 
  GraduationCap,
  Layers,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playTapSound, playCorrectSound, playWrongSound, playCelebrationFanfare } from '../utils/audio';

interface ExamViewProps {
  initialChapterId?: number;
}

export const ExamView: React.FC<ExamViewProps> = ({ initialChapterId }) => {
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>(initialChapterId || 'all');
  const [questionCount, setQuestionCount] = useState<number>(100); // Default to full 100 questions per chapter!
  const [examMode, setExamMode] = useState<'practice' | 'test'>('practice');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // User answers map: questionId -> selectedOptionIndex
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Timer for Test Mode
  const [timeRemaining, setTimeRemaining] = useState<number>(60 * 60); // 60 minutes for 100 questions
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Active question set based on selected chapter and questionCount
  const activeQuestions: QuizQuestion[] = React.useMemo(() => {
    if (selectedChapter === 'all') {
      const fullSet = getFull100MockExam();
      return questionCount >= 100 ? fullSet : fullSet.slice(0, questionCount);
    }
    return getQuestionsByChapter(selectedChapter, questionCount);
  }, [selectedChapter, questionCount]);

  // Reset when chapter, count, or mode changes
  useEffect(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    if (examMode === 'test') {
      const minutes = Math.max(10, Math.round((activeQuestions.length / 100) * 60));
      setTimeRemaining(minutes * 60);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  }, [selectedChapter, questionCount, examMode]);

  // Sync initialChapterId prop
  useEffect(() => {
    if (initialChapterId !== undefined) {
      setSelectedChapter(initialChapterId);
    }
  }, [initialChapterId]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && !isSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, isSubmitted, timeRemaining]);

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted && examMode === 'test') return;
    
    playTapSound();
    const newAnswers = { ...userAnswers, [currentQ.id]: optIndex };
    setUserAnswers(newAnswers);

    if (examMode === 'practice') {
      if (optIndex === currentQ.correctIndex) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
  };

  const handleNext = () => {
    playTapSound();
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    playTapSound();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setIsTimerActive(false);
    
    // Calculate score
    let score = 0;
    activeQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const percent = Math.round((score / activeQuestions.length) * 100);
    if (percent >= 70) {
      playCelebrationFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else {
      playTapSound();
    }
  };

  const handleRestart = () => {
    playTapSound();
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIndex(0);
    if (examMode === 'test') {
      const minutes = Math.max(10, Math.round((activeQuestions.length / 100) * 60));
      setTimeRemaining(minutes * 60);
      setIsTimerActive(true);
    }
  };

  // Score calculation
  const totalScore = activeQuestions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);
  const percentage = Math.round((totalScore / activeQuestions.length) * 100);

  const getGrade = (pct: number) => {
    if (pct >= 80) return { grade: '4.0', label: 'ยอดเยี่ยมระดับเกียรตินิยม', color: 'text-emerald-700' };
    if (pct >= 75) return { grade: '3.5', label: 'ดีมาก', color: 'text-emerald-600' };
    if (pct >= 70) return { grade: '3.0', label: 'ดี', color: 'text-amber-700' };
    if (pct >= 65) return { grade: '2.5', label: 'ค่อนข้างดี', color: 'text-amber-600' };
    if (pct >= 60) return { grade: '2.0', label: 'ผ่านเกณฑ์มาตรฐาน', color: 'text-amber-700' };
    return { grade: '1.0', label: 'ควรทบทวนเนื้อหาเพิ่มเติม', color: 'text-rose-700' };
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Exam Master Header (Light Theme) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-bold uppercase font-display border border-amber-200 mb-1">
              <Award className="w-3 h-3 text-amber-700" />
              <span>คลังข้อสอบ ๑,๐๐๐ ข้อ (๑๐ บท)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <span>คลังข้อสอบมาตรฐาน</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                {selectedChapter === 'all' ? `รวมทุกบท (${activeQuestions.length} ข้อ)` : `บทที่ ${selectedChapter}`}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              แบบทดสอบมาตรฐานพร้อมเฉลยและสรุปผลประเมิน
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto text-xs font-display">
            <button
              onClick={() => {
                playTapSound();
                setExamMode('practice');
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                examMode === 'practice'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💡 ฝึกฝน (เฉลยทันที)
            </button>
            <button
              onClick={() => {
                playTapSound();
                setExamMode('test');
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                examMode === 'test'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏱️ สอบจริง (จับเวลา)
            </button>
          </div>
        </div>

        {/* Chapter Selection Bar with Dropdown & Slide Options */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <label className="text-xs font-semibold text-slate-700 font-display whitespace-nowrap">
                เลือกบทเรียน:
              </label>
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedChapter}
                onChange={(e) => {
                  playTapSound();
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setSelectedChapter(val);
                }}
                aria-label="เลือกบทเรียนที่ต้องการสอบ"
                className="w-full sm:w-auto text-xs font-display font-bold py-1.5 pl-3 pr-8 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer truncate"
              >
                <option value="all">⭐ รวมทุกบท (สุ่ม ๑๐๐ ข้อ)</option>
                {LESSONS_DATA.map((l) => (
                  <option key={l.chapterNumber} value={l.chapterNumber}>
                    บทที่ {l.chapterNumber}: {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-display">
            <button
              onClick={() => {
                playTapSound();
                setSelectedChapter('all');
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedChapter === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>รวมทุกบท</span>
            </button>

            {LESSONS_DATA.map((l) => (
              <button
                key={l.chapterNumber}
                onClick={() => {
                  playTapSound();
                  setSelectedChapter(l.chapterNumber);
                }}
                title={l.title}
                className={`shrink-0 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  selectedChapter === l.chapterNumber
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                บทที่ {l.chapterNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Question Length Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs font-display">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">จำนวนข้อ:</span>
          </div>
          <div className="flex items-center gap-1">
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                onClick={() => {
                  playTapSound();
                  setQuestionCount(num);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  questionCount === num
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {num} {num === 100 ? '(เต็มชุด)' : 'ข้อ'}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-display">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 text-[10px] block">ทำแล้ว</span>
              <span className="font-bold text-slate-900 text-sm">
                {Object.keys(userAnswers).length} / {activeQuestions.length} ข้อ
              </span>
            </div>
            {examMode === 'practice' && (
              <div>
                <span className="text-slate-500 text-[10px] block">คะแนน</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {totalScore} คะแนน
                </span>
              </div>
            )}
            {examMode === 'test' && (
              <div>
                <span className="text-slate-500 text-[10px] block">เวลาคงเหลือ</span>
                <span className={`font-bold text-sm flex items-center gap-1 ${
                  timeRemaining < 300 ? 'text-rose-600 animate-pulse' : 'text-amber-800'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimer(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isSubmitted && (
              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
              >
                ส่งคำตอบ
              </button>
            )}
            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 shadow-2xs"
              title="เริ่มทำใหม่"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. RESULTS SUMMARY CARD (When Submitted) */}
      {isSubmitted && (
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-4 animate-in zoom-in-95 duration-300">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center text-3xl mx-auto shadow-xs">
            🏆
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-display">
              ผลสัมฤทธิ์ทางการทดสอบวิชาการนาฏศิลป์ไทย
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              คะแนนรวม {totalScore} / {activeQuestions.length} ({percentage}%)
            </h3>
            <div className={`text-base font-bold font-display ${getGrade(percentage).color}`}>
              เกรด {getGrade(percentage).grade} : {getGrade(percentage).label}
            </div>
          </div>

          {/* Certificate Badge */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-2 text-left font-body">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <span className="font-display font-bold text-amber-900">ใบรับรองผลการสอบดิจิทัล</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: TH-DANCE-{Date.now().toString().slice(-6)}</span>
            </div>
            <p>
              ผู้ทดสอบได้ผ่านการวัดประเมินผลองค์ความรู้มาตรฐานนาฏศิลป์ไทย {selectedChapter === 'all' ? 'ชุดรวมทุกบท' : `บทที่ ${selectedChapter}: ${CHAPTER_NAMES[Number(selectedChapter)]}`} จำนวน {activeQuestions.length} ข้ออย่างสมบูรณ์
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                playTapSound();
                setIsSubmitted(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display text-xs font-semibold border border-slate-200 transition-colors"
            >
              ตรวจสอบข้อสอบและเฉลยทีละข้อ
            </button>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              🔄 ทำแบบทดสอบใหม่อีกครั้ง
            </button>
          </div>

        </div>
      )}

      {/* 3. QUESTION CARD PLAY AREA */}
      {currentQ && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          
          {/* Question Index & Chapter Tag */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold font-display shadow-2xs">
                ข้อที่ {currentIndex + 1} / {activeQuestions.length}
              </span>
              <span className="text-xs font-semibold text-slate-600 font-display">
                บทที่ {currentQ.chapterId}: {currentQ.chapterName}
              </span>
            </div>

            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-display ${
              currentQ.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentQ.difficulty === 'medium'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              ระดับ: {currentQ.difficulty === 'easy' ? 'พื้นฐาน' : currentQ.difficulty === 'medium' ? 'ปานกลาง' : 'ท้าทาย'}
            </span>
          </div>

          {/* Question Stem */}
          <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* 4 Choices */}
          <div className="space-y-3">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = userAnswers[currentQ.id] === oIdx;
              const isCorrect = currentQ.correctIndex === oIdx;
              const showResult = (examMode === 'practice' && isSelected) || isSubmitted;

              let btnClass = "border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 text-slate-800";

              if (showResult) {
                if (isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs font-semibold";
                } else if (isSelected && !isCorrect) {
                  btnClass = "border-rose-400 bg-rose-50 text-rose-900 font-semibold";
                }
              } else if (isSelected) {
                btnClass = "border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-200 font-semibold";
              }

              const thaiChoiceLetters = ['ก.', 'ข.', 'ค.', 'ง.'];

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full min-h-[52px] p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 active:scale-[0.99] touch-manipulation font-body text-xs sm:text-sm ${btnClass}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-amber-800 font-display font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {thaiChoiceLetters[oIdx] || `${oIdx + 1}.`}
                    </span>
                    <span className="leading-relaxed">{opt}</span>
                  </div>

                  {showResult && (
                    <div className="shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      ) : null}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box (Practice Mode or After Submission) */}
          {((examMode === 'practice' && userAnswers[currentQ.id] !== undefined) || isSubmitted) && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-slate-800 space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-bold font-display text-indigo-900">
                <HelpCircle className="w-4 h-4 text-indigo-700" />
                <span>คำอธิบายเฉลยละเอียด:</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-body">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation Controls Bottom */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:pointer-events-none font-display text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ข้อก่อนหน้า</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 font-display">
              {currentIndex + 1} / {activeQuestions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-30 disabled:pointer-events-none font-display text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>ข้อถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 4. QUESTION FAST JUMP DRAWER / GRID */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-display flex items-center justify-between">
          <span>ตารางข้อสอบ ({activeQuestions.length} ข้อ)</span>
          <span className="text-[10px] text-amber-800 font-semibold">แตะเพื่อเลือกข้อ</span>
        </h4>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
          {activeQuestions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCurrent = currentIndex === idx;
            const isCorrect = userAnswers[q.id] === q.correctIndex;
            const showCorrect = (examMode === 'practice' && isAnswered) || isSubmitted;

            let gridClass = "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100";

            if (isCurrent) {
              gridClass = "ring-2 ring-amber-500 bg-amber-600 text-white font-bold border-amber-600";
            } else if (showCorrect) {
              gridClass = isCorrect
                ? "bg-emerald-100 text-emerald-900 border-emerald-400 font-bold"
                : "bg-rose-100 text-rose-900 border-rose-400 font-bold";
            } else if (isAnswered) {
              gridClass = "bg-indigo-50 text-indigo-900 border-indigo-300 font-medium";
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  playTapSound();
                  setCurrentIndex(idx);
                }}
                className={`h-9 rounded-xl border text-xs font-display flex items-center justify-center transition-all ${gridClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
