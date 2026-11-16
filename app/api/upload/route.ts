import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'files');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const safeName = path.basename(file.name);
    const filePath = path.join(UPLOAD_DIR, safeName);
    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({ success: true, name: safeName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
