// app/api/socketio/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'WebSocket endpoint',
    instructions: 'Connect using WebSocket protocol to /api/socketio',
    status: 'active'
  });
}
