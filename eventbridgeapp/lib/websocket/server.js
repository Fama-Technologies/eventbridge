// lib/websocket/server.js (Note: .js extension, not .ts)
const { WebSocketServer } = require('ws');

let wss;

function setupWebSocketServer(server) {
  wss = new WebSocketServer({ 
    server,
    path: '/api/socketio'
  });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send connection established message
    ws.send(JSON.stringify({
      type: 'connection_established',
      message: 'Connected to EventBridge WebSocket server',
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ 
            type: 'pong', 
            timestamp: new Date().toISOString() 
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  console.log('WebSocket server started on path /api/socketio');
}

module.exports = { setupWebSocketServer };
