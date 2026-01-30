// lib/websocket/server.ts
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;

export function setupWebSocketServer(server: Server) {
  wss = new WebSocketServer({ 
    server,
    path: '/api/socketio'
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    // Send connection established message
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to EventBridge WebSocket server',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch(data.type) {
          case 'ping':
            ws.send(JSON.stringify({ 
              type: 'pong', 
              timestamp: new Date().toISOString() 
            }));
            break;
            
          case 'authenticate':
            // Add authentication logic here
            ws.send(JSON.stringify({ 
              type: 'authentication_success',
              message: 'Authenticated'
            }));
            break;
            
          default:
            // Echo for testing
            ws.send(JSON.stringify({
              type: 'echo',
              data: data,
              timestamp: new Date().toISOString()
            }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  console.log('WebSocket server started on path /api/socketio');
}

export function broadcastMessage(message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
