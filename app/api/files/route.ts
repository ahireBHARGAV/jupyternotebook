import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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
    const files = await fs.readdir(UPLOAD_DIR);
    
    const fileStats = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stat = await fs.stat(filePath);
        return {
          name: filename,
          size: stat.size,
          modified: stat.mtimeMs,
          type: path.extname(filename),
        };
      })
    );
    
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
