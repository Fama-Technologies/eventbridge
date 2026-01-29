import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Determine WebSocket endpoint based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For production, use secure WebSocket (wss://)
  const wsProtocol = isProduction ? 'wss' : 'ws';
  
  // Get host from request or use environment variable
  const host = req.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL || 'localhost:3000';
  
  // Extract domain without port for production
  let wsHost = host;
  if (isProduction) {
    wsHost = host.split(':')[0]; // Remove port for production
  }
  
  // WebSocket endpoint
  const wsEndpoint = process.env.WS_ENDPOINT || `${wsProtocol}://${wsHost}`;
  
  return NextResponse.json({
    success: true,
    wsEndpoint,
    wsPath: '/api/socketio',
    supportedEvents: [
      'authenticate',
      'join_thread',
      'send_message',
      'typing_indicator',
      'mark_read',
      'new_message',
      'messages_read',
      'typing_indicator',
      'user_status'
    ],
    environment: process.env.NODE_ENV,
    domain: wsHost,
    instructions: 'Connect to WebSocket using the provided endpoint and path'
  });
}