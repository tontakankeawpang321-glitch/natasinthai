import { BookItem } from '../types';
import { fetchRawSheetRows } from './googleSheetsHelper';

export const BOOKS_SHEET_STORAGE_KEY = 'thai_dance_books_sheet_url';

// Default Books Sheet URL
export const DEFAULT_BOOKS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmQXLUHWXh8thNFtyfLd3U-kz3f2io7M-Dby9iAN2yqdPBC3wWfnJlt7SPyr4yXNSc_LzOblW48BVZ/pub?output=csv';

export function getStoredBooksSheetUrl(): string {
  try {
    const saved = localStorage.getItem(BOOKS_SHEET_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return DEFAULT_BOOKS_SHEET_URL;
}

export function saveBooksSheetUrl(url: string): void {
  try {
    localStorage.setItem(BOOKS_SHEET_STORAGE_KEY, url.trim());
  } catch {}
}

/**
 * Extracts Google Drive / Docs File ID from any standard Google Drive URL format
 */
export function extractGoogleDriveId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const url = rawUrl.trim();

  // 1. drive.google.com/file/d/{id}/...
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // 2. docs.google.com/document/d/{id}/...
  const matchDocD = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (matchDocD && matchDocD[1]) return matchDocD[1];

  // 3. docs.google.com/presentation/d/{id}/...
  const matchPresD = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (matchPresD && matchPresD[1]) return matchPresD[1];

  // 4. docs.google.com/spreadsheets/d/{id}/...
  const matchSheetD = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (matchSheetD && matchSheetD[1]) return matchSheetD[1];

  // 5. Query params: id=... or ?id=... (e.g. drive.google.com/open?id=XYZ or /uc?id=XYZ)
  const matchQueryId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchQueryId && matchQueryId[1]) return matchQueryId[1];

  return null;
}

/**
 * Converts Google Drive / Docs / Web link into an interactive iframe WebView / PDF Preview URL
 */
export function getEmbedUrl(rawUrl: string, type?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  const fileId = extractGoogleDriveId(trimmed);

  // If Google Drive file ID is found
  if (fileId) {
    if (trimmed.includes('docs.google.com/document')) {
      return `https://docs.google.com/document/d/${fileId}/preview`;
    }
    if (trimmed.includes('docs.google.com/presentation')) {
      return `https://docs.google.com/presentation/d/${fileId}/preview`;
    }
    if (trimmed.includes('docs.google.com/spreadsheets')) {
      return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    }
    // Google Drive standard preview
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // Direct PDF/Docx URL via Google Docs Viewer
  if (trimmed.endsWith('.pdf') || trimmed.endsWith('.docx') || trimmed.endsWith('.doc') || type === 'pdf' || type === 'docx') {
    return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Converts Google Drive link to Direct Download Link
 */
export function getDirectDownloadUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  const fileId = extractGoogleDriveId(trimmed);

  if (fileId) {
    if (trimmed.includes('docs.google.com/document')) {
      return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
    }
    if (trimmed.includes('docs.google.com/presentation')) {
      return `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
    }
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return trimmed;
}

/**
 * Fetches real books from Google Sheet in category,title,description,url format
 */
export async function fetchBooksFromGoogleSheet(customUrl?: string): Promise<{
  books: BookItem[];
  source: 'sheet' | 'empty';
  count: number;
  lastUpdated: string;
  error?: string;
}> {
  const now = new Date();
  const formattedTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const targetUrl = (customUrl && customUrl.trim()) ? customUrl.trim() : getStoredBooksSheetUrl();

  try {
    const { rows } = await fetchRawSheetRows(targetUrl);
    const parsed: BookItem[] = [];

    // Iterate through rows (skipping header row 0)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const category = (row[0] || '').trim();
      const title = (row[1] || '').trim();
      const description = (row[2] || '').trim();
      const rawUrl = (row[3] || '').trim();

      // Skip header row if it contains 'category' or 'title'
      if (
        i === 0 && 
        (category.toLowerCase().includes('category') || title.toLowerCase().includes('title') || category === 'หมวดหมู่')
      ) {
        continue;
      }

      // Only include if there is actual content (title or url)
      if (title || rawUrl || category) {
        let docType: 'pdf' | 'gdoc' | 'docx' | 'sheet' | 'web' = 'web';
        if (rawUrl.includes('drive.google.com') || rawUrl.endsWith('.pdf')) docType = 'pdf';
        else if (rawUrl.includes('docs.google.com/document')) docType = 'gdoc';
        else if (rawUrl.endsWith('.docx')) docType = 'docx';

        parsed.push({
          id: `sheet-book-${i + 1}`,
          chapterNumber: i,
          category: category || 'ทั่วไป',
          title: title || `เอกสารลำดับที่ ${parsed.length + 1}`,
          description: description || '',
          url: rawUrl || '',
          type: docType,
          author: 'Google Drive',
          pages: ''
        });
      }
    }

    return {
      books: parsed,
      source: parsed.length > 0 ? 'sheet' : 'empty',
      count: parsed.length,
      lastUpdated: formattedTime
    };
  } catch (error: any) {
    console.error('Error fetching books from Google Sheets:', error);
    return {
      books: [],
      source: 'empty',
      count: 0,
      lastUpdated: formattedTime,
      error: error?.message || 'ไม่สามารถเชื่อมต่อ Google Sheets ได้'
    };
  }
}
