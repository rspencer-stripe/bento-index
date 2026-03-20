import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch Google Drive files
export async function GET() {
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Drive not configured. Set GOOGLE_ACCESS_TOKEN in .env.local' },
      { status: 503 }
    );
  }

  try {
    // Get files modified in the last 14 days
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const params = new URLSearchParams({
      q: `modifiedTime > '${twoWeeksAgo.toISOString()}' and trashed = false`,
      orderBy: 'modifiedTime desc',
      pageSize: '50',
      fields: 'files(id,name,mimeType,modifiedTime,createdTime,webViewLink,owners,description)',
    });
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Drive API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Drive files' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    const files: MindItem[] = (data.files || [])
      .filter((file: DriveFile) => isRelevantFile(file))
      .map(transformDriveFile);
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Drive files' },
      { status: 500 }
    );
  }
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  owners?: Array<{ displayName: string }>;
  description?: string;
}

function isRelevantFile(file: DriveFile): boolean {
  // Filter out system files and folders
  const skipMimeTypes = [
    'application/vnd.google-apps.folder',
    'application/vnd.google-apps.form',
    'application/vnd.google-apps.map',
  ];
  
  if (skipMimeTypes.includes(file.mimeType)) return false;
  
  // Skip files with generic names
  const skipNames = ['Untitled', 'Copy of', 'Test'];
  if (skipNames.some(skip => file.name.startsWith(skip))) return false;
  
  return true;
}

function transformDriveFile(file: DriveFile): MindItem {
  const mimeToType: Record<string, string> = {
    'application/vnd.google-apps.document': 'doc',
    'application/vnd.google-apps.spreadsheet': 'sheet',
    'application/vnd.google-apps.presentation': 'slides',
  };
  
  const fileType = mimeToType[file.mimeType] || 'file';
  const tag = extractTagFromFileName(file.name);
  
  // Determine priority based on recency
  const modifiedTime = new Date(file.modifiedTime || '');
  const hoursAgo = (Date.now() - modifiedTime.getTime()) / (1000 * 60 * 60);
  const priority = hoursAgo < 24 ? 5 : hoursAgo < 72 ? 4 : 3;
  
  return {
    id: `drive-${file.id}`,
    tag,
    type: 'artifact',
    priority,
    title: file.name,
    snippet: file.description || `${fileType} - Last modified ${formatRelativeTime(modifiedTime)}`,
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: file.name,
        executiveSummary: file.description || '',
        lastEditors: file.owners?.map(o => ({
          name: o.displayName,
          editedAt: file.modifiedTime,
        })) || [],
        webUrl: file.webViewLink,
      },
    },
    createdAt: file.createdTime || file.modifiedTime || new Date().toISOString(),
    lastTouchedAt: file.modifiedTime || new Date().toISOString(),
  };
}

function extractTagFromFileName(name: string): string {
  if (/radar/i.test(name)) return '#Radar';
  if (/disputes?/i.test(name)) return '#Disputes';
  if (/terminal/i.test(name)) return '#Terminal';
  if (/payintel|payment.*intel/i.test(name)) return '#PayIntel';
  if (/design/i.test(name)) return '#Design';
  return '#Docs';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
