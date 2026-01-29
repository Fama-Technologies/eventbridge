const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Determine allowed origins
const getAllowedOrigins = () => {
  const origins = [];
  
  // Development origins
  origins.push('http://localhost:3000');
  origins.push('http://localhost:3001');
  
  // Production domains
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }
  
  // Main domain
  origins.push('https://eventbridge.africa');
  origins.push('https://www.eventbridge.africa');
  
  // For preview deployments
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  return origins;
};

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io with domain configuration
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = getAllowedOrigins();
        
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          // Check if origin matches pattern
          const isAllowed = allowedOrigins.some(allowed => {
            if (allowed.includes('*')) {
              const pattern = allowed.replace('*', '.*');
              return new RegExp(pattern).test(origin);
            }
            return allowed === origin;
          });
          
          if (isAllowed) {
            callback(null, true);
          } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
          }
        }
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
    path: '/api/socketio',
    // Additional production settings
    connectTimeout: 45000,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, socket.handshake.headers.origin);

    // Authentication
    socket.on('authenticate', (data) => {
      console.log('User authenticated:', data.userId);
      socket.emit('authenticated', { success: true });
    });

    // Join message thread
    socket.on('join_thread', (threadId) => {
      socket.join(`thread:${threadId}`);
      console.log(`Socket ${socket.id} joined thread ${threadId}`);
    });

    // Send message
    socket.on('send_message', (data) => {
      console.log('Message received:', data);
      // Broadcast to thread room
      io.to(`thread:${data.threadId}`).emit('new_message', {
        message: data,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`thread:${data.threadId}`).emit('typing_indicator', {
        threadId: data.threadId,
        userId: data.userId,
        isTyping: data.isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
    console.log(`> WebSocket running on ws://${hostname}:${port}/api/socketio`);
    console.log(`> Production URL: https://eventbridge.africa`);
    console.log(`> Allowed origins:`, getAllowedOrigins());
  });
});