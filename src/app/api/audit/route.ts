import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { actor, action, payload, reason } = body;
    
    if (!actor || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: actor, action' },
        { status: 400 }
      );
    }

    await logAudit({
      actor,
      action,
      payload,
      reason,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
