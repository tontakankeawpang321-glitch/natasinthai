import React, { useState } from 'react';
import { BookItem } from '../types';
import { getEmbedUrl, getDirectDownloadUrl } from '../services/booksService';
import { LESSONS_DATA } from '../data/lessonsData';
import { 
  BookOpen, 
  Search, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Download, 
  RefreshCw, 
  Eye, 
  X, 
  Clock, 
  Database,
  FolderOpen,
  AlertCircle
} from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface BooksViewProps {
  books: BookItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onStartExam: (chapterNumber: number) => void;
  lastUpdated?: string;
  sheetSource?: 'sheet' | 'empty' | 'fallback';
  onOpenDidYouKnow?: () => void;
}

export const BooksView: React.FC<BooksViewProps> = ({
  books = [],
  isLoading = false,
  onRefresh,
  onStartExam,
  lastUpdated = 'อัปเดตล่าสุด',
  sheetSource = 'empty'
}) => {
  const safeBooks = Array.isArray(books) ? books : [];
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Active WebView Modal State
  const [activeWebviewBook, setActiveWebviewBook] = useState<BookItem | null>(null);
  const [modalViewMode, setModalViewMode] = useState<'webview' | 'summary'>('webview');
  const [isModalFullscreen, setIsModalFullscreen] = useState<boolean>(false);

  // Extract unique categories safely
  const categories = ['ทั้งหมด', ...Array.from(new Set(safeBooks.map(b => b?.category).filter(Boolean)))];

  const filteredBooks = safeBooks.filter(b => {
    if (!b) return false;
    const matchesCat = selectedCategory === 'ทั้งหมด' || b.category === selectedCategory;
    const matchesSearch = !searchTerm || (
      (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesCat && matchesSearch;
  });

  const handleOpenWebview = (book: BookItem) => {
    playTapSound();
    setActiveWebviewBook(book);
    setModalViewMode('webview');
    setIsModalFullscreen(false);
  };

  const handleDownload = (book: BookItem, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    const downloadUrl = getDirectDownloadUrl(book.url);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      
      {/* 1. Header Banner with Live Google Sheet Sync & Refresh */}
      <div className="bg-gradient-to-br from-amber-500/15 via-white to-amber-100/30 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-600 text-white shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
                  ตำราและเอกสารวิชาการนาฏศิลป์
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-display border ${
                    safeBooks.length > 0 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    <Database className="w-3 h-3 text-amber-700" />
                    <span>{safeBooks.length > 0 ? `โหลดแล้ว ${safeBooks.length} เล่ม` : 'เชื่อมต่อ Google Sheets'}</span>
                  </span>
                  
                  <span className="text-[11px] text-slate-500 font-display flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>อัปเดต: {lastUpdated}</span>
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-body max-w-xl">
              ดึงข้อมูลรายชื่อหนังสือและตำราจาก Google Sheet เมื่อกรอกในชีตแล้วกดรีเฟรช ข้อมูลจะขึ้นทันที
            </p>
          </div>

          {/* Action Button: Refresh Sheet Only */}
          {onRefresh && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  playTapSound();
                  onRefresh();
                }}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-display flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 active:scale-95"
                title="กดเพื่อดึงข้อมูลหนังสือล่าสุดจาก Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชชีต'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. BOOKS LIST VIEW OR CLEAN EMPTY STATE */}
      {safeBooks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 shadow-inner">
            <FolderOpen className="w-8 h-8" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold font-display text-slate-800">
              ยังไม่พบรายการหนังสือ หรือยังไม่ได้เปิดสิทธิ์แชร์ชีต
            </h3>
            <p className="text-xs text-slate-500 font-body leading-relaxed">
              เมื่อกรอกหรืออัปเดตข้อมูลหนังสือใน Google Sheet แล้ว กรุณากดปุ่ม <strong>"รีเฟรชชีต"</strong> เพื่อดึงข้อมูลล่าสุด
            </p>
          </div>

          {onRefresh && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => {
                  playTapSound();
                  onRefresh();
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'กำลังตรวจเช็ค...' : 'รีเฟรชชีต'}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search & Filter only shown when there are books */}
          {categories.length > 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-display">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      playTapSound();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book rows */}
          <div className="space-y-3">
            {filteredBooks.map((book, idx) => {
              return (
                <div
                  key={book.id || idx}
                  className="bg-white border border-slate-200 hover:border-amber-300 rounded-3xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left Side */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-col items-center justify-center shrink-0 font-display font-bold shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <span className="text-[10px] uppercase font-bold leading-none">เล่มที่</span>
                      <span className="text-sm leading-tight">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold font-display px-2.5 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-200">
                          {book.category || 'เอกสาร'}
                        </span>
                        {book.type && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                            {book.type === 'gdoc' ? 'Google Doc' : book.type.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold font-display text-sm sm:text-base text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                        {book.title}
                      </h3>

                      {book.description && (
                        <p className="text-xs text-slate-600 font-body leading-relaxed line-clamp-2">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side Actions: Read WebView & Download */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    {book.url && (
                      <button
                        onClick={() => handleOpenWebview(book)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-display flex items-center justify-center gap-1.5 shadow-2xs transition-colors active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>อ่าน WebView</span>
                      </button>
                    )}

                    {book.url && (
                      <button
                        onClick={(e) => handleDownload(book, e)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold font-display flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                        title="ดาวน์โหลดเอกสารต้นฉบับ"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span className="hidden sm:inline">ดาวน์โหลด</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 4. MODAL WEBVIEW READER */}
      {activeWebviewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 border border-amber-300/80 ${
              isModalFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[90vh]'
            }`}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white flex items-center justify-between gap-3 shadow-md shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-xl bg-white/20">
                  <BookOpen className="w-4 h-4 text-amber-100" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold font-display truncate leading-tight">
                    {activeWebviewBook.title}
                  </h3>
                  <span className="text-[10px] text-amber-100 font-display">
                    {activeWebviewBook.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => handleDownload(activeWebviewBook, e)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                  title="ดาวน์โหลดไฟล์"
                >
                  <Download className="w-4 h-4" />
                </button>

                <a
                  href={activeWebviewBook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                  title="เปิดหน้าต่างใหม่ใน Google Drive"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors hidden sm:flex"
                  title={isModalFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มจอ'}
                >
                  {isModalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    playTapSound();
                    setActiveWebviewBook(null);
                  }}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors ml-1"
                  title="ปิด"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Iframe Body */}
            <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
              <iframe
                src={getEmbedUrl(activeWebviewBook.url, activeWebviewBook.type)}
                className="w-full h-full border-0"
                title={activeWebviewBook.title}
                allow="autoplay; encrypted-media; fullscreen"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
