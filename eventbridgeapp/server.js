const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Store connected users and their sockets
const connectedUsers = new Map(); // userId -> { socketId, userType, threadIds }
const threadParticipants = new Map(); // threadId -> Set of userIds

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    path: '/api/socketio',
    cors: {
      origin: dev ? 'http://localhost:3000' : ['https://eventbridge.africa', 'https://www.eventbridge.africa'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    let currentUserId = null;
    let currentUserType = null;

    // Handle authentication
    socket.on('authenticate', (data) => {
      const { userId, userType, token } = data;
      
      // TODO: Validate token with your auth system
      // For now, we'll trust the client data
      
      currentUserId = userId;
      currentUserType = userType;
      
      // Store user connection
      connectedUsers.set(userId, {
        socketId: socket.id,
        userType,
        threadIds: new Set()
      });
      
      console.log(`User ${userId} (${userType}) authenticated`);
      socket.emit('authenticated', { success: true });
      
      // Broadcast user online status
      io.emit('user_status', { userId, isOnline: true });
    });

    // Handle joining a thread/conversation
    socket.on('join_thread', (threadId) => {
      if (!currentUserId) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      const roomName = `thread_${threadId}`;
      socket.join(roomName);
      
      // Track thread participants
      if (!threadParticipants.has(threadId)) {
        threadParticipants.set(threadId, new Set());
      }
      threadParticipants.get(threadId).add(currentUserId);
      
      // Track user's threads
      const userConnection = connectedUsers.get(currentUserId);
      if (userConnection) {
        userConnection.threadIds.add(threadId);
      }
      
      console.log(`User ${currentUserId} joined thread ${threadId}`);
    });

    // Handle leaving a thread
    socket.on('leave_thread', (threadId) => {
      const roomName = `thread_${threadId}`;
      socket.leave(roomName);
      
      // Remove from thread participants
      const participants = threadParticipants.get(threadId);
      if (participants) {
        participants.delete(currentUserId);
      }
      
      // Remove from user's threads
      const userConnection = connectedUsers.get(currentUserId);
      if (userConnection) {
        userConnection.threadIds.delete(threadId);
      }
      
      console.log(`User ${currentUserId} left thread ${threadId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data, callback) => {
      const { threadId, content, attachments } = data;
      
      if (!currentUserId) {
        if (callback) callback({ success: false, error: 'Not authenticated' });
        return;
      }
      
      try {
        // Create message object
        const message = {
          id: Date.now(), // Temporary ID, will be replaced by DB ID
          threadId,
          senderId: currentUserId,
          senderType: currentUserType.toUpperCase(),
          content,
          attachments: attachments || [],
          timestamp: new Date(),
          read: false
        };
        
        // Broadcast to all users in the thread (including sender for confirmation)
        const roomName = `thread_${threadId}`;
        io.to(roomName).emit('new_message', { message });
        
        console.log(`Message sent in thread ${threadId} by user ${currentUserId}`);
        
        if (callback) callback({ success: true, message });
      } catch (error) {
        console.error('Error sending message:', error);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { threadId, isTyping } = data;
      
      if (!currentUserId) return;
      
      const roomName = `thread_${threadId}`;
      // Broadcast to others in the thread (not the sender)
      socket.to(roomName).emit('typing_indicator', {
        threadId,
        userId: currentUserId,
        userType: currentUserType,
        isTyping
      });
    });

    // Handle marking messages as read
    socket.on('mark_read', (data) => {
      const { threadId, messageIds } = data;
      
      if (!currentUserId) return;
      
      const roomName = `thread_${threadId}`;
      // Notify others that messages were read
      socket.to(roomName).emit('messages_read', {
        threadId,
        readerId: currentUserId,
        messageIds
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected:`, reason);
      
      if (currentUserId) {
        // Clean up user connection
        const userConnection = connectedUsers.get(currentUserId);
        if (userConnection) {
          // Remove from all thread participants
          userConnection.threadIds.forEach(threadId => {
            const participants = threadParticipants.get(threadId);
            if (participants) {
              participants.delete(currentUserId);
            }
          });
        }
        
        connectedUsers.delete(currentUserId);
        
        // Broadcast user offline status
        io.emit('user_status', { userId: currentUserId, isOnline: false });
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Server ready on http://localhost:${PORT}`);
    console.log(`> WebSocket server ready on ws://localhost:${PORT}/api/socketio`);
  });
});
