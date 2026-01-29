import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { initializeWebSocketServer } from '@/lib/websocket-server';

// This is a special handler for Socket.io in Next.js
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // This route will be handled by the WebSocket server
  return NextResponse.json({ message: 'Use WebSocket connection' });
}

export async function POST(req: NextRequest) {
  // Handle HTTP requests for Socket.io
  return NextResponse.json({ message: 'Socket.io HTTP endpoint' });
}