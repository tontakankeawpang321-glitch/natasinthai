import { VideoItem } from '../types';
import { fetchRawSheetRows } from './googleSheetsHelper';

export const VIDEOS_SHEET_STORAGE_KEY = 'thai_dance_videos_sheet_url';
export const DEFAULT_VIDEOS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/15EHZk9MYukY-RrYTSTCoO0pVo5PZtNzIOOLhNd18RvM/edit';

export function getStoredVideosSheetUrl(): string {
  try {
    const saved = localStorage.getItem(VIDEOS_SHEET_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return DEFAULT_VIDEOS_SHEET_URL;
}

export function saveVideosSheetUrl(url: string): void {
  try {
    localStorage.setItem(VIDEOS_SHEET_STORAGE_KEY, url.trim());
  } catch {}
}

export const FALLBACK_SHEET_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    category: "ระบำมาตรฐาน",
    title: "ระบำพรหมาสตร์",
    description: "การร่ายรำนำทัพพระอินทร์แปลงในโขนรามเกียรติ์",
    url: "https://youtu.be/-OQ44qkgpaw",
    youtubeId: "-OQ44qkgpaw",
    thumbnailUrl: "https://img.youtube.com/vi/-OQ44qkgpaw/hqdefault.jpg"
  },
  {
    id: "vid-2",
    category: "ระบำมาตรฐาน",
    title: "ระบำกฤดาภินิหาร",
    description: "ระบำอวยพรอันวิจิตร ประดิษฐ์ท่ารำโดยครูลมุลและครูละม่อม",
    url: "https://youtu.be/UVKCFAhXaPM",
    youtubeId: "UVKCFAhXaPM",
    thumbnailUrl: "https://img.youtube.com/vi/UVKCFAhXaPM/hqdefault.jpg"
  },
  {
    id: "vid-3",
    category: "ประวัติศาสตร์",
    title: "วิวัฒนาการนาฏศิลป์ไทย",
    description: "ประวัติศาสตร์และกำเนิดนาฏศิลป์ไทยสุโขทัย อยุธยา รัตนโกสินทร์",
    url: "https://youtu.be/QTNSDTI9Yr0",
    youtubeId: "QTNSDTI9Yr0",
    thumbnailUrl: "https://img.youtube.com/vi/QTNSDTI9Yr0/hqdefault.jpg"
  },
  {
    id: "vid-4",
    category: "นาฏยศัพท์",
    title: "ภาษาท่านาฏศิลป์ไทยพื้นฐาน",
    description: "สาธิตการตั้งวง จีบ เอียงคอ ประเท้า และภาษาท่าสื่ออารมณ์",
    url: "https://youtu.be/iN_4HUSAJ80",
    youtubeId: "iN_4HUSAJ80",
    thumbnailUrl: "https://img.youtube.com/vi/iN_4HUSAJ80/hqdefault.jpg"
  },
  {
    id: "vid-5",
    category: "หลักสูตร",
    title: "ดนตรี-นาฏศิลป์ ม.๑ มาตรฐานการศึกษา",
    description: "สื่อการสอนหลักสูตรแกนกลาง กลุ่มสาระการเรียนรู้ศิลปะ",
    url: "https://youtu.be/leByi36xHW4",
    youtubeId: "leByi36xHW4",
    thumbnailUrl: "https://img.youtube.com/vi/leByi36xHW4/hqdefault.jpg"
  },
  {
    id: "vid-6",
    category: "ดนตรีไทย",
    title: "เครื่องดนตรีและวงดนตรีไทยประกอบการแสดง",
    description: "โครงสร้างวงปี่พาทย์และเครื่องประกอบจังหวะสำหรับโขนละคร",
    url: "https://youtu.be/z0fSPjUq5bk",
    youtubeId: "z0fSPjUq5bk",
    thumbnailUrl: "https://img.youtube.com/vi/z0fSPjUq5bk/hqdefault.jpg"
  },
  {
    id: "vid-7",
    category: "สุนทรียภาพ",
    title: "ความงามและสุนทรียภาพแห่งนาฏศิลป์ไทย",
    description: "ปรัชญาความงาม เส้นสายลายรำ และสุนทรียะแห่งท่วงท่า",
    url: "https://youtu.be/gL9gH9RowzE",
    youtubeId: "gL9gH9RowzE",
    thumbnailUrl: "https://img.youtube.com/vi/gL9gH9RowzE/hqdefault.jpg"
  },
  {
    id: "vid-8",
    category: "โขน",
    title: "ศาสตร์แห่งการพากย์เจรจาโขนหลวง",
    description: "ศิลปะการเปล่งเสียง กาพย์ยานี กาพย์ฉบัง และไม้กรับพากย์",
    url: "https://youtu.be/W1j8m8QVWJM",
    youtubeId: "W1j8m8QVWJM",
    thumbnailUrl: "https://img.youtube.com/vi/W1j8m8QVWJM/hqdefault.jpg"
  },
  {
    id: "vid-9",
    category: "พิธีกรรม",
    title: "พิธีไหว้ครูและครอบครูนาฏศิลป์",
    description: "ระเบียบปฏิบัติและความกตัญญูในพิธีไหว้ครูโขน-ละคร",
    url: "https://youtu.be/HdVbJb2ydlA",
    youtubeId: "HdVbJb2ydlA",
    thumbnailUrl: "https://img.youtube.com/vi/HdVbJb2ydlA/hqdefault.jpg"
  },
  {
    id: "vid-10",
    category: "เครื่องแต่งกาย",
    title: "ศิลปะการแต่งกายยืนเครื่องและหัวโขน",
    description: "พัสตราภรณ์ ศิราภรณ์ และกรรมวิธีการทำหัวโขนช่างสิบหมู่",
    url: "https://youtu.be/vyYodwR7Pms",
    youtubeId: "vyYodwR7Pms",
    thumbnailUrl: "https://img.youtube.com/vi/vyYodwR7Pms/hqdefault.jpg"
  }
];

export function extractYouTubeId(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes('v=')) return trimmed.split('v=')[1].split('&')[0];
  if (trimmed.includes('youtu.be/')) return trimmed.split('youtu.be/')[1].split('?')[0];
  if (trimmed.includes('embed/')) return trimmed.split('embed/')[1].split('?')[0];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export async function fetchVideosFromGoogleSheet(customUrl?: string): Promise<{
  videos: VideoItem[];
  source: 'sheet' | 'fallback';
  count: number;
  error?: string;
}> {
  const targetUrl = (customUrl && customUrl.trim()) ? customUrl.trim() : getStoredVideosSheetUrl();

  try {
    const { rows } = await fetchRawSheetRows(targetUrl);
    const parsed: VideoItem[] = [];

    // Parse rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const category = (row[0] || '').trim();
      const title = (row[1] || '').trim();
      const description = (row[2] || '').trim();
      const rawUrl = (row[3] || '').trim();

      // Skip header row if matches 'category' or 'title'
      if (
        i === 0 &&
        (category.toLowerCase().includes('category') || title.toLowerCase().includes('title') || category === 'หมวดหมู่')
      ) {
        continue;
      }

      if (title || rawUrl) {
        const ytId = extractYouTubeId(rawUrl || title);
        parsed.push({
          id: `sheet-vid-${i + 1}`,
          category: category || 'ทั่วไป',
          title: title || `วิดีโอที่ ${parsed.length + 1}`,
          description: description || 'สื่อการศึกษานาฏศิลป์ไทย',
          url: rawUrl.startsWith('http') ? rawUrl : (ytId ? `https://youtu.be/${ytId}` : rawUrl),
          youtubeId: ytId,
          thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80'
        });
      }
    }

    if (parsed.length > 0) {
      return { videos: parsed, source: 'sheet', count: parsed.length };
    }
  } catch (error: any) {
    console.error('Error fetching videos from Google Sheets:', error);
    return {
      videos: FALLBACK_SHEET_VIDEOS,
      source: 'fallback',
      count: FALLBACK_SHEET_VIDEOS.length,
      error: error?.message || 'ไม่สามารถเชื่อมต่อ Google Sheets วิดีโอได้'
    };
  }

  return { videos: FALLBACK_SHEET_VIDEOS, source: 'fallback', count: FALLBACK_SHEET_VIDEOS.length };
}
