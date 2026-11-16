import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'files');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }
    
    const safeName = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, safeName);
    const textContent = await fs.readFile(filePath, 'utf-8');
    
    return new NextResponse(textContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'File not found or failed to read' }, { status: 404 });
  }
}
