import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { msg } = await request.json();
    const logPath = path.join(process.cwd(), 'scratch', 'browser_debug.txt');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
