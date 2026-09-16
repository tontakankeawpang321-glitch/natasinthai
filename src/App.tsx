import React, { useState, useEffect } from 'react';
import { NavTab, Lesson, VideoItem, BookItem } from './types';
import { LESSONS_DATA } from './data/lessonsData';
import { fetchVideosFromGoogleSheet, FALLBACK_SHEET_VIDEOS } from './services/sheetsService';
import { fetchBooksFromGoogleSheet } from './services/booksService';
import { shouldShowFactAutoPopup, recordFactAutoPopupShown } from './data/factsData';
import { Navbar } from './components/Navbar';
import { BottomDock } from './components/BottomDock';
import { HomeView } from './components/HomeView';
import { VideosView } from './components/VideosView';
import { ExamView } from './components/ExamView';
import { BooksView } from './components/BooksView';
import { GamesView } from './components/GamesView';
import { BookmarksView } from './components/BookmarksView';
import { ChapterModal } from './components/ChapterModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DidYouKnowModal } from './components/DidYouKnowModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedLessonForModal, setSelectedLessonForModal] = useState<Lesson | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ youtubeId: string; title: string } | null>(null);
  
  // "รู้หรือไม่? ๑๐๐ เรื่อง" Did You Know Modal State
  const [isDidYouKnowOpen, setIsDidYouKnowOpen] = useState<boolean>(false);

  // Chapter filter passed to exam
  const [examChapterId, setExamChapterId] = useState<number | undefined>(undefined);

  // Google Sheets Videos State
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_SHEET_VIDEOS);
  const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(false);
  const [sheetSource, setSheetSource] = useState<'sheet' | 'fallback'>('fallback');

  // Google Sheets Books State
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState<boolean>(false);
  const [booksSource, setBooksSource] = useState<'sheet' | 'empty' | 'fallback'>('empty');
  const [booksLastUpdated, setBooksLastUpdated] = useState<string>('กำลังเชื่อมต่อ...');

  // Bookmarks State (Chapter numbers)
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('thai_dance_bookmarks_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load videos and books on mount & check first-time open for "Did You Know" popup
  useEffect(() => {
    // ล้างแคชเบราว์เซอร์ CacheStorage ทุกตัวออก ยกเว้น localStorage ที่บันทึกไว้
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {});
    }

    // ล้าง ServiceWorker ที่อาจแคชไฟล์ไว้
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      }).catch(() => {});
    }

    loadVideos();
    loadBooks();

    // เช็คเปิดแอพครั้งแรกเพื่อแสดง Popup รู้หรือไม่
    const timer = setTimeout(() => {
      if (shouldShowFactAutoPopup()) {
        setIsDidYouKnowOpen(true);
        recordFactAutoPopupShown();
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Save bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('thai_dance_bookmarks_v2', JSON.stringify(bookmarks));
    } catch {}
  }, [bookmarks]);

  const loadVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const result = await fetchVideosFromGoogleSheet();
      setVideos(result.videos);
      setSheetSource(result.source);
    } catch {
      setVideos(FALLBACK_SHEET_VIDEOS);
      setSheetSource('fallback');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const loadBooks = async () => {
    setIsLoadingBooks(true);
    try {
      const result = await fetchBooksFromGoogleSheet();
      setBooks(result.books);
      setBooksSource(result.source);
      setBooksLastUpdated(result.lastUpdated || 'เพิ่งอัปเดต');
    } catch {
      setBooks([]);
      setBooksSource('empty');
      setBooksLastUpdated('เชื่อมต่อชีตแล้ว (ยังไม่มีรายการ)');
    } finally {
      setIsLoadingBooks(false);
    }
  };

  const handleToggleBookmark = (chapterNumber: number) => {
    setBookmarks(prev => {
      if (prev.includes(chapterNumber)) {
        return prev.filter(c => c !== chapterNumber);
      } else {
        return [...prev, chapterNumber];
      }
    });
  };

  const handleStartExam = (chapterId?: number) => {
    setExamChapterId(chapterId);
    setActiveTab('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayVideo = (youtubeId: string, title: string) => {
    setActiveVideoModal({ youtubeId, title });
  };

  const handleOpenDidYouKnow = () => {
    setIsDidYouKnowOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-body selection:bg-amber-200 selection:text-amber-950">
      
      {/* Top Navigation Bar with Thai Dancer Icon & Games tab & Did You Know button */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookmarkCount={bookmarks.length}
        onOpenDidYouKnow={handleOpenDidYouKnow}
      />

      {/* Main Responsive Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-4 pb-24 md:pb-16">
        
        {activeTab === 'home' && (
          <HomeView
            onSelectLesson={(lesson) => setSelectedLessonForModal(lesson)}
            onPlayVideo={handlePlayVideo}
            onStartExam={handleStartExam}
            setActiveTab={setActiveTab}
            videos={videos}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onOpenDidYouKnow={handleOpenDidYouKnow}
          />
        )}

        {activeTab === 'videos' && (
          <VideosView
            videos={videos}
            isLoading={isLoadingVideos}
            onRefresh={loadVideos}
            onPlayVideo={handlePlayVideo}
            sheetSource={sheetSource}
          />
        )}

        {activeTab === 'exam' && (
          <ExamView initialChapterId={examChapterId} />
        )}

        {activeTab === 'books' && (
          <BooksView
            books={books}
            isLoading={isLoadingBooks}
            onRefresh={loadBooks}
            onStartExam={handleStartExam}
            lastUpdated={booksLastUpdated}
            sheetSource={booksSource}
            onOpenDidYouKnow={handleOpenDidYouKnow}
          />
        )}

        {activeTab === 'games' && (
          <GamesView />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onSelectLesson={(lesson) => setSelectedLessonForModal(lesson)}
            onPlayVideo={handlePlayVideo}
            onStartExam={(chapId) => handleStartExam(chapId)}
            setActiveTab={setActiveTab}
          />
        )}

      </main>

      {/* Did You Know? 100 Facts Popup Modal */}
      <DidYouKnowModal
        isOpen={isDidYouKnowOpen}
        onClose={() => setIsDidYouKnowOpen(false)}
      />

      {/* Chapter In-Depth Reader Modal */}
      {selectedLessonForModal && (
        <ChapterModal
          lesson={selectedLessonForModal}
          onClose={() => setSelectedLessonForModal(null)}
          onPlayVideo={handlePlayVideo}
          onStartExam={(chapId) => handleStartExam(chapId)}
          isBookmarked={bookmarks.includes(selectedLessonForModal.chapterNumber)}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Video YouTube Modal Player */}
      {activeVideoModal && (
        <VideoPlayerModal
          youtubeId={activeVideoModal.youtubeId}
          videoTitle={activeVideoModal.title}
          onClose={() => setActiveVideoModal(null)}
        />
      )}

      {/* Modern Stable Mobile Bottom Dock Navigation */}
      <BottomDock
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookmarkCount={bookmarks.length}
      />

    </div>
  );
}
