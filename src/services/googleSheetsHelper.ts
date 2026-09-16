/**
 * Universal Google Sheets Fetcher & URL Resolver
 * Handles:
 * 1. Standard Google Sheets URL (https://docs.google.com/spreadsheets/d/{id}/edit...)
 * 2. Published to Web CSV URL (https://docs.google.com/spreadsheets/d/e/{pubId}/pub?output=csv)
 * 3. Raw Sheet ID
 */

export interface ParsedSheetConfig {
  rawUrl: string;
  type: 'published' | 'sheet_id' | 'invalid';
  sheetId?: string;
  gid?: string;
  pubCsvUrl?: string;
}

/**
 * Parses user-provided Google Sheet link or ID into accessible query endpoints
 */
export function parseGoogleSheetUrl(inputUrl: string): ParsedSheetConfig {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { rawUrl: '', type: 'invalid' };
  }

  const url = inputUrl.trim();

  // Case 1: Published to web URL (contains /d/e/2PACX-.../)
  if (url.includes('/d/e/')) {
    let cleanPubUrl = url;
    if (!cleanPubUrl.includes('output=csv')) {
      cleanPubUrl = cleanPubUrl.replace(/\/pub(\?.*)?$/, '/pub?output=csv');
      if (!cleanPubUrl.includes('output=csv')) {
        cleanPubUrl += (cleanPubUrl.includes('?') ? '&' : '?') + 'output=csv';
      }
    }
    return {
      rawUrl: url,
      type: 'published',
      pubCsvUrl: cleanPubUrl
    };
  }

  // Case 2: Standard Google Sheet URL (docs.google.com/spreadsheets/d/{id}/...)
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const sheetId = sheetMatch[1];
    // Extract gid if present
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return {
      rawUrl: url,
      type: 'sheet_id',
      sheetId,
      gid
    };
  }

  // Case 3: Just the ID itself (alphanumeric, dashes, underscores, length >= 20)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url)) {
    return {
      rawUrl: url,
      type: 'sheet_id',
      sheetId: url,
      gid: '0'
    };
  }

  return { rawUrl: url, type: 'invalid' };
}

/**
 * Parses CSV lines properly handling quotes and newlines
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip newline
      }
      row.push(currentCell.trim());
      if (row.some(cell => cell.length > 0)) {
        lines.push(row);
      }
      row = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || row.length > 0) {
    row.push(currentCell.trim());
    if (row.some(cell => cell.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Checks if raw text returned is Google HTML error page
 */
export function isHtmlErrorPage(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  if (lower.includes('<!doctype html') || lower.includes('<html') || lower.includes('找不到網頁') || lower.includes('檔案不存在') || lower.includes('google drive – page not found') || lower.includes('class="errormessage"')) {
    return true;
  }
  return false;
}

/**
 * Fetches sheet data using multiple fallback strategies with cache-busting
 */
export async function fetchRawSheetRows(rawUrlOrId: string): Promise<{
  rows: string[][];
  error?: string;
  sourceType: 'published' | 'gviz' | 'csv_export';
}> {
  const parsed = parseGoogleSheetUrl(rawUrlOrId);

  if (parsed.type === 'invalid') {
    throw new Error('รูปแบบลิงก์ Google Sheet ไม่ถูกต้อง กรุณาใช้ลิงก์แชร์จากเบราว์เซอร์หรือลิงก์เผยแพร่');
  }

  const timestamp = Date.now();

  // Strategy 1: If it's a published link
  if (parsed.type === 'published' && parsed.pubCsvUrl) {
    const targetUrl = `${parsed.pubCsvUrl}&_t=${timestamp}`;
    const res = await fetch(targetUrl, { cache: 'no-store' });
    const text = await res.text();
    if (!res.ok || isHtmlErrorPage(text)) {
      throw new Error('ไม่สามารถเข้าถึงไฟล์จากลิงก์เผยแพร่ได้ (Google แจ้งว่าไม่พบไฟล์ หรือหยุดการเผยแพร่แล้ว)');
    }
    const rows = parseCSV(text);
    return { rows, sourceType: 'published' };
  }

  // Strategy 2: If it's a standard Sheet ID, try CSV export first (fastest and cleanest)
  if (parsed.type === 'sheet_id' && parsed.sheetId) {
    const sheetId = parsed.sheetId;
    const gid = parsed.gid || '0';

    // 2.1 Try Direct CSV Export
    try {
      const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&_t=${timestamp}`;
      const res = await fetch(csvExportUrl, { cache: 'no-store' });
      const text = await res.text();
      if (res.ok && !isHtmlErrorPage(text)) {
        const rows = parseCSV(text);
        if (rows.length > 0) {
          return { rows, sourceType: 'csv_export' };
        }
      }
    } catch {
      // try GViz next
    }

    // 2.2 Try GViz JSON format
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}&_t=${timestamp}`;
      const res = await fetch(gvizUrl, { cache: 'no-store' });
      const text = await res.text();
      if (res.ok && !isHtmlErrorPage(text)) {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const json = JSON.parse(text.substring(start, end + 1));
          const tableRows = json.table?.rows || [];
          const rows: string[][] = [];

          // Include column headers if present
          if (json.table?.cols) {
            const header = json.table.cols.map((c: { label?: string; id?: string }) => c.label || c.id || '');
            if (header.some((h: string) => h.length > 0)) {
              rows.push(header);
            }
          }

          tableRows.forEach((r: { c?: Array<{ v?: string | number | boolean | null } | null> }) => {
            const cells = (r.c || []).map(cell => (cell?.v !== undefined && cell?.v !== null) ? String(cell.v).trim() : '');
            if (cells.some(c => c.length > 0)) {
              rows.push(cells);
            }
          });

          if (rows.length > 0) {
            return { rows, sourceType: 'gviz' };
          }
        }
      }
    } catch {
      // GViz failed
    }

    throw new Error('ไม่สามารถเข้าถึง Google Sheet นี้ได้ กรุณาตรวจเช็คการตั้งค่าการแชร์ใน Google Sheets ให้เป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู"');
  }

  throw new Error('ไม่พบข้อมูลใน Google Sheet');
}
