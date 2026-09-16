import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  BookOpen, 
  Film,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { getStoredBooksSheetUrl, saveBooksSheetUrl, fetchBooksFromGoogleSheet, DEFAULT_BOOKS_SHEET_URL } from '../services/booksService';
import { getStoredVideosSheetUrl, saveVideosSheetUrl, fetchVideosFromGoogleSheet, DEFAULT_VIDEOS_SHEET_URL } from '../services/sheetsService';
import { playTapSound, playSuccessSound } from '../utils/audio';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'books' | 'videos';
  onSyncComplete?: () => void;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  initialType = 'books',
  onSyncComplete
}) => {
  const [activeType, setActiveType] = useState<'books' | 'videos'>(initialType);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
    count?: number;
  }>({ status: 'idle', message: '' });
  const [copiedHelp, setCopiedHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
      const currentUrl = initialType === 'books' ? getStoredBooksSheetUrl() : getStoredVideosSheetUrl();
      setUrlInput(currentUrl);
      setTestResult({ status: 'idle', message: '' });
    }
  }, [isOpen, initialType]);

  const handleSwitchType = (type: 'books' | 'videos') => {
    playTapSound();
    setActiveType(type);
    const currentUrl = type === 'books' ? getStoredBooksSheetUrl() : getStoredVideosSheetUrl();
    setUrlInput(currentUrl);
    setTestResult({ status: 'idle', message: '' });
  };

  const handleTestAndSave = async () => {
    playTapSound();
    if (!urlInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'กรุณากรอกลิงก์ Google Sheet'
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle', message: 'กำลังทดสอบเชื่อมต่อ Google Sheets...' });

    try {
      if (activeType === 'books') {
        const res = await fetchBooksFromGoogleSheet(urlInput.trim());
        if (res.error) {
          setTestResult({
            status: 'error',
            message: res.error
          });
        } else {
          saveBooksSheetUrl(urlInput.trim());
          playSuccessSound();
          setTestResult({
            status: 'success',
            message: `เชื่อมต่อสำเร็จ! พบข้อมูลตำรา/หนังสือ ${res.count} รายการ`,
            count: res.count
          });
          if (onSyncComplete) onSyncComplete();
        }
      } else {
        const res = await fetchVideosFromGoogleSheet(urlInput.trim());
        if (res.error || res.source === 'fallback') {
          setTestResult({
            status: 'error',
            message: res.error || 'ไม่สามารถดึงข้อมูลคลิปจาก Google Sheet นี้ได้ (อาจเป็นเพราะยังไม่ได้เปิดสิทธิ์แชร์)'
          });
        } else {
          saveVideosSheetUrl(urlInput.trim());
          playSuccessSound();
          setTestResult({
            status: 'success',
            message: `เชื่อมต่อสำเร็จ! พบคลิปวิดีโอในชีต ${res.count} รายการ`,
            count: res.count
          });
          if (onSyncComplete) onSyncComplete();
        }
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetDefault = () => {
    playTapSound();
    const defaultUrl = activeType === 'books' ? DEFAULT_BOOKS_SHEET_URL : DEFAULT_VIDEOS_SHEET_URL;
    setUrlInput(defaultUrl);
    if (activeType === 'books') {
      saveBooksSheetUrl(defaultUrl);
    } else {
      saveVideosSheetUrl(defaultUrl);
    }
    setTestResult({
      status: 'idle',
      message: 'รีเซ็ตเป็นค่าเริ่มต้นแล้ว'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-amber-200/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white flex items-center justify-between gap-3 shadow-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-white/20">
              <Database className="w-5 h-5 text-amber-100" />
            </span>
            <div>
              <h3 className="text-base font-bold font-display leading-tight">
                ตั้งค่าลิงก์ Google Sheets
              </h3>
              <p className="text-[11px] text-amber-100 font-body">
                เชื่อมต่อตารางข้อมูลของท่านเพื่อให้อัปเดตสดทันที
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          
          {/* Tab Selector: Books or Videos */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-display font-semibold">
            <button
              onClick={() => handleSwitchType('books')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeType === 'books'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ชีตหนังสือ / ตำรา</span>
            </button>

            <button
              onClick={() => handleSwitchType('videos')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeType === 'videos'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>ชีตคลิปวิดีโอ</span>
            </button>
          </div>

          {/* Current Target Description */}
          <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-1">
            <div className="font-bold text-amber-900 font-display flex items-center gap-1">
              <span>ชีตเป้าหมาย:</span>
              <span className="underline">{activeType === 'books' ? 'หนังสือ นาฏศิลป์' : 'คลิปนาฏศิลป์'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              วางลิงก์จากแถบเบราว์เซอร์ของ Google Sheet ที่ท่านสร้าง เช่น{' '}
              <code className="bg-white/80 px-1 py-0.5 rounded text-amber-800 font-mono text-[10px]">
                https://docs.google.com/spreadsheets/d/.../edit
              </code>
            </p>
          </div>

          {/* URL Input Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-display text-slate-700 flex items-center justify-between">
              <span>ลิงก์ Google Sheet ({activeType === 'books' ? 'คลังหนังสือ' : 'คลังคลิป'}):</span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[10px] text-slate-500 hover:text-amber-700 underline"
              >
                คืนค่าเริ่มต้น
              </button>
            </label>

            <textarea
              rows={3}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="วางลิงก์ Google Sheet ที่นี่ (เช่น https://docs.google.com/spreadsheets/d/.../edit)"
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          {/* Diagnostic Result Alert */}
          {testResult.status !== 'idle' && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 transition-all ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
              }`}
            >
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1 min-w-0 font-body">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.status === 'error' && (
                  <div className="text-[11px] text-red-800/90 space-y-1 mt-1 pt-1 border-t border-red-200">
                    <p className="font-bold">วิธีแก้ไข:</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>เปิดไฟล์ Google Sheet ในเบราว์เซอร์</li>
                      <li>กดปุ่ม <strong>"แชร์" (Share)</strong> สีเขียว/น้ำเงินมุมขวาบน</li>
                      <li>ในช่อง "การเข้าถึงทั่วไป" เปลี่ยนเป็น <strong>"ทุกคนที่มีลิงก์"</strong> (สิทธิ์: ผู้มีสิทธิ์อ่าน)</li>
                      <li>กด "คัดลอกลิงก์" แล้วนำมาวางในช่องด้านบนอีกครั้ง</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* How to Share Guide Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold font-display text-slate-800">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>วิธีตั้งค่าให้ Google Sheet เชื่อมต่อได้ 100%:</span>
            </div>
            
            <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed font-body">
              <li>
                <strong>หัวคอลัมน์แถวที่ 1:</strong> ต้องเป็น <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">category</code>, <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">title</code>, <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">description</code>, <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">url</code>
              </li>
              <li>
                <strong>การเปิดสิทธิ์แชร์:</strong> ใน Google Sheets กดปุ่ม <strong>แชร์</strong> &gt; ปรับเป็น <strong>"ทุกคนที่มีลิงก์มีสิทธิ์ดู"</strong>
              </li>
              <li>
                หากเผยแพร่เว็บ: ไปที่ <strong>ไฟล์</strong> &gt; <strong>แชร์</strong> &gt; <strong>เผยแพร่ไปยังเว็บ</strong> &gt; เลือก <strong>ค่าที่คั่นด้วยเครื่องหมายจุลภาค (.csv)</strong> &gt; กด <strong>เผยแพร่</strong>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => {
              playTapSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-display text-xs font-semibold transition-colors"
          >
            ปิด
          </button>

          <button
            onClick={handleTestAndSave}
            disabled={isTesting}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'กำลังตรวจสอบ...' : 'ทดสอบ & บันทึกลิงก์ชีต'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
