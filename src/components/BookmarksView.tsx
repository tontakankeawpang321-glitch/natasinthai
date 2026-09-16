import React from 'react';
import { Lesson, NavTab } from '../types';
import { LESSONS_DATA } from '../data/lessonsData';
import { Bookmark, BookOpen, Play, Trash2, ArrowLeft, Flame } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface BookmarksViewProps {
  bookmarks: number[];
  onToggleBookmark: (chapterNumber: number) => void;
  onSelectLesson: (lesson: Lesson) => void;
  onPlayVideo: (youtubeId: string, title: string) => void;
  onStartExam: (chapterId: number) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onToggleBookmark,
  onSelectLesson,
  onPlayVideo,
  onStartExam,
  setActiveTab
}) => {
  const bookmarkedLessons = LESSONS_DATA.filter(l => bookmarks.includes(l.chapterNumber));

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Header Bar (Light Theme) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold shadow-2xs">
            <Bookmark className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              บทเรียนและเนื้อหาที่บันทึกไว้
            </h2>
            <p className="text-xs text-slate-500">
              เข้าถึงบทเรียนสำคัญและข้อสอบ ๑๐๐ ข้อที่บันทึกไว้ได้อย่างรวดเร็ว
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playTapSound();
            setActiveTab('home');
          }}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-display flex items-center gap-1.5 transition-colors border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน้าแรก</span>
        </button>
      </div>

      {/* Bookmarks List */}
      {bookmarkedLessons.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="text-4xl text-slate-300">🔖</div>
          <h3 className="text-base font-bold font-display text-slate-800">ยังไม่มีบทเรียนที่บันทึกไว้</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-body">
            คุณสามารถกดไอคอน Bookmark บนการ์ดบทเรียนในหน้าแรก เพื่อบันทึกบทความที่ต้องการอ่านทบทวนภายหลังได้
          </p>
          <button
            onClick={() => {
              playTapSound();
              setActiveTab('home');
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            ไปเลือกบันทึกบทเรียน
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarkedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold font-display px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    บทที่ {lesson.chapterNumber} : {lesson.category}
                  </span>
                  <button
                    onClick={() => {
                      playTapSound();
                      onToggleBookmark(lesson.chapterNumber);
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="ลบออกจากรายการบันทึก"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-bold font-display text-base text-slate-900 mb-1">
                  {lesson.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 font-body mb-4">
                  {lesson.shortDesc}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playTapSound();
                      onSelectLesson(lesson);
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800 rounded-xl font-display text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>อ่านสรุปละเอียด</span>
                  </button>

                  <button
                    onClick={() => {
                      playTapSound();
                      onPlayVideo(lesson.youtubeId, lesson.title);
                    }}
                    className="flex-1 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 rounded-xl font-display text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>วิดีโอ</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    playTapSound();
                    onStartExam(lesson.chapterNumber);
                  }}
                  className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-lg text-[11px] font-bold font-display transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>ทำข้อสอบบทนี้ (๑๐๐ ข้อ)</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
