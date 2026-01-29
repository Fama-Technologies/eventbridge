import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { db } from '@/lib/db';
import { messages, messageThreads, users } from '@/drizzle/schema';
import { eq, and, ne, inArray } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

interface UserConnection {
  userId: number;
  userType: 'customer' | 'vendor';
  socketId: string;
  lastActive: Date;
}

export class MessagingWebSocketServer {
  private io: SocketIOServer;
  private connections: Map<string, UserConnection> = new Map();
  
  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      path: '/api/socketio'
    });
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      // Authentication
      socket.on('authenticate', async (data: { userId: number; userType: 'customer' | 'vendor'; token: string }) => {
        try {
          // Verify token (implement your JWT verification)
          const isValid = await this.verifyToken(data.token);
          
          if (isValid) {
            this.connections.set(socket.id, {
              userId: data.userId,
              userType: data.userType,
              socketId: socket.id,
              lastActive: new Date()
            });
            
            // Join user-specific room
            socket.join(`user:${data.userId}`);
            socket.emit('authenticated', { success: true });
            
            // Notify others in threads that user is online
            this.notifyOnlineStatus(data.userId, true);
          } else {
            socket.emit('error', { message: 'Authentication failed' });
            socket.disconnect();
          }
        } catch (error) {
          socket.emit('error', { message: 'Authentication error' });
          socket.disconnect();
        }
      });
      
      // Join message thread
      socket.on('join_thread', (threadId: number) => {
        socket.join(`thread:${threadId}`);
        console.log(`Socket ${socket.id} joined thread ${threadId}`);
      });
      
      // Send message
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data);
      });
      
      // Typing indicator
      socket.on('typing', async (data) => {
        await this.handleTypingIndicator(socket, data);
      });
      
      // Mark as read
      socket.on('mark_read', async (data) => {
        await this.handleMarkAsRead(socket, data);
      });
      
      // Disconnect
      socket.on('disconnect', () => {
        const connection = this.connections.get(socket.id);
        if (connection) {
          this.connections.delete(socket.id);
          this.notifyOnlineStatus(connection.userId, false);
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  private async handleSendMessage(socket: any, data: any) {
    const { threadId, content, attachments } = data;
    const connection = this.connections.get(socket.id);
    
    if (!connection) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }
    
    try {
      // Save message to database
      const [message] = await db.insert(messages).values({
        threadId,
        senderId: connection.userId,
        senderType: connection.userType === 'customer' ? 'CUSTOMER' : 'VENDOR',
        content,
        attachments: attachments || [],
        read: false,
        createdAt: new Date()
      }).returning();
      
      // Update thread last message
      await db.update(messageThreads)
        .set({
          lastMessage: content,
          lastMessageTime: new Date(),
          [connection.userType === 'customer' ? 'vendorUnreadCount' : 'customerUnreadCount']: 
            sql`${messageThreads[connection.userType === 'customer' ? 'vendorUnreadCount' : 'customerUnreadCount']} + 1`
        })
        .where(eq(messageThreads.id, threadId));
      
      // Get thread info for notification
      const thread = await db.select()
        .from(messageThreads)
        .where(eq(messageThreads.id, threadId))
        .limit(1);
      
      if (thread[0]) {
        // Emit to thread room
        this.io.to(`thread:${threadId}`).emit('new_message', {
          message: {
            id: message.id,
            threadId: message.threadId,
            senderId: message.senderId,
            senderType: message.senderType,
            content: message.content,
            attachments: message.attachments,
            timestamp: message.createdAt,
            read: message.read
          },
          threadId,
          unreadCounts: {
            customer: thread[0].customerUnreadCount,
            vendor: thread[0].vendorUnreadCount
          }
        });
        
        // Notify specific user if they're not in the thread room
        const targetUserId = connection.userType === 'customer' ? thread[0].vendorId : thread[0].customerId;
        this.io.to(`user:${targetUserId}`).emit('new_message_notification', {
          threadId,
          senderId: connection.userId,
          preview: content.substring(0, 100)
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }
  
  private async handleTypingIndicator(socket: any, data: any) {
    const { threadId, isTyping } = data;
    const connection = this.connections.get(socket.id);
    
    if (!connection) return;
    
    // Emit to everyone in thread except sender
    socket.to(`thread:${threadId}`).emit('typing_indicator', {
      threadId,
      userId: connection.userId,
      isTyping,
      userType: connection.userType
    });
  }
  
  private async handleMarkAsRead(socket: any, data: any) {
    const { threadId, messageIds } = data;
    const connection = this.connections.get(socket.id);
    
    if (!connection) return;
    
    try {
      // Update messages as read in database
      if (messageIds && messageIds.length > 0) {
        // Method 1: Using raw SQL for complex conditions
        await db.execute(sql`
          UPDATE ${messages} 
          SET read = true 
          WHERE thread_id = ${threadId} 
          AND sender_id != ${connection.userId}
          AND id IN (${sql.join(messageIds)})
        `);
      } else {
        // Mark all unread messages from other user in thread
        await db.update(messages)
          .set({ read: true })
          .where(
            and(
              eq(messages.threadId, threadId),
              ne(messages.senderId, connection.userId),
              eq(messages.read, false)
            )
          );
      }
      
      // Update thread unread count
      const fieldToUpdate = connection.userType === 'customer' ? 'customerUnreadCount' : 'vendorUnreadCount';
      await db.update(messageThreads)
        .set({ [fieldToUpdate]: 0 })
        .where(eq(messageThreads.id, threadId));
      
      // Notify other party
      const thread = await db.select()
        .from(messageThreads)
        .where(eq(messageThreads.id, threadId))
        .limit(1);
      
      if (thread[0]) {
        const otherUserId = connection.userType === 'customer' ? thread[0].vendorId : thread[0].customerId;
        this.io.to(`user:${otherUserId}`).emit('messages_read', {
          threadId,
          readerId: connection.userId
        });
      }
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
  
  private notifyOnlineStatus(userId: number, isOnline: boolean) {
    // Find all threads this user is part of
    // Notify other participants
    this.io.emit('user_status', {
      userId,
      isOnline,
      lastSeen: new Date()
    });
  }
  
  private async verifyToken(token: string): Promise<boolean> {
    // Implement your JWT verification logic
    return true; // Simplified for example
  }
  
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Singleton instance
let messagingServer: MessagingWebSocketServer;

export function initializeWebSocketServer(httpServer: HTTPServer) {
  if (!messagingServer) {
    messagingServer = new MessagingWebSocketServer(httpServer);
  }
  return messagingServer;
}

export function getMessagingServer() {
  return messagingServer;
}