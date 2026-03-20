import { NextResponse } from 'next/server';
import { MindItem } from '@/lib/types';

// Fetch Google Drive files
export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Google Drive not configured' },
      { status: 503 }
    );
  }

  try {
    const files: MindItem[] = [];
    
    // TODO: Implement actual Google Drive API call
    // 1. Get user's OAuth token from session
    // 2. Search for recently modified files
    // 3. Transform to MindItem format
    
    // Example:
    // const response = await fetch(
    //   'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    //     q: "modifiedTime > '2024-01-01'",
    //     orderBy: 'modifiedTime desc',
    //     pageSize: '50',
    //     fields: 'files(id,name,mimeType,modifiedTime,webViewLink,owners)',
    //   }),
    //   { headers: { Authorization: `Bearer ${accessToken}` } }
    // );
    // const data = await response.json();
    // files = data.files.map(transformDriveFile);
    
    return NextResponse.json(files);
  } catch (error) {
    console.error('Drive API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Drive files' },
      { status: 500 }
    );
  }
}

// Transform Google Drive file to MindItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDriveFile(file: any): MindItem {
  const mimeToType: Record<string, string> = {
    'application/vnd.google-apps.document': 'doc',
    'application/vnd.google-apps.spreadsheet': 'sheet',
    'application/vnd.google-apps.presentation': 'slides',
    'application/vnd.google-apps.folder': 'folder',
  };
  
  return {
    id: `drive-${file.id}`,
    tag: '#Docs',
    type: 'artifact',
    priority: 3,
    title: file.name,
    snippet: `${mimeToType[file.mimeType] || 'file'} - Last modified ${new Date(file.modifiedTime).toLocaleDateString()}`,
    source: 'drive',
    sourceMeta: {
      source: 'drive',
      meta: {
        docTitle: file.name,
        executiveSummary: '',
        lastEditors: file.owners?.map((o: { displayName: string; photoLink?: string }) => ({
          name: o.displayName,
          editedAt: file.modifiedTime,
        })) || [],
        webUrl: file.webViewLink,
      },
    },
    createdAt: file.createdTime || file.modifiedTime,
    lastTouchedAt: file.modifiedTime,
  };
}

// Suppress unused variable warning
void transformDriveFile;
