import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'files');

async function ensureDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDir();
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    const validEntries = entries.filter((entry) => entry.isFile() && !entry.name.startsWith('.'));
    
    const fileStats = await Promise.all(
      validEntries.map(async (entry) => {
        const filePath = path.join(UPLOAD_DIR, entry.name);
        const stat = await fs.stat(filePath);
        return {
          name: entry.name,
          size: stat.size,
          modified: stat.mtimeMs,
          type: path.extname(entry.name),
        };
      })
    );
    
    fileStats.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ files: fileStats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
