import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'scratch', 'api_logs.txt');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const msg = searchParams.get('msg') || '';
  
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[BROWSER-LOG] [${timestamp}] ${msg}\n`);
  } catch (e) {}

  return NextResponse.json({ success: true });
}
