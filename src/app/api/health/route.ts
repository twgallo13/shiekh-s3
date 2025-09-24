import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/app/version';

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
}
