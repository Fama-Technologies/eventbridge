import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  threadId: number;
  senderId: number;
  senderType: 'CUSTOMER' | 'VENDOR';
  content: string;
  attachments?: Array<any>;
  timestamp: Date;
  read: boolean;
}

interface TypingIndicator {
  threadId: number;
  userId: number;
  isTyping: boolean;
  userType: 'customer' | 'vendor';
}

export const useSocket = (userId: number, userType: 'customer' | 'vendor', token: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  const getWebSocketUrl = useCallback(async () => {
    try {
      // Fetch WebSocket configuration from API
      const response = await fetch('/api/ws');
      const data = await response.json();
      
      if (data.success) {
        return {
          url: data.wsEndpoint,
          path: data.wsPath
        };
      }
    } catch (error) {
      console.error('Failed to fetch WebSocket config:', error);
    }
    
    // Fallback to environment-based configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const protocol = isProduction ? 'wss' : 'ws';
    const host = isProduction ? 'eventbridge.africa' : 'localhost:3000';
    
    return {
      url: `${protocol}://${host}`,
      path: '/api/socketio'
    };
  }, []);

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return;

    try {
      const wsConfig = await getWebSocketUrl();
      console.log('Attempting to connect to WebSocket:', wsConfig.url + wsConfig.path);
      
      const socket = io(wsConfig.url, {
        path: wsConfig.path,
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        withCredentials: true,
        forceNew: true
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected successfully to:', wsConfig.url + wsConfig.path);
        setIsConnected(true);
        
        // Authenticate with server
        socket.emit('authenticate', { userId, userType, token });
      });

      socket.on('authenticated', () => {
        console.log('Socket authenticated successfully');
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        // Use type guard to safely access extended error properties
        if ('code' in error) {
          console.error('Error code:', (error as any).code);
        }
        if ('context' in error) {
          console.error('Error context:', (error as any).context);
        }
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      socket.on('user_status', (data: { userId: number; isOnline: boolean }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (data.isOnline) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      // Return cleanup function
      return () => {
        if (socket.connected) {
          console.log('Disconnecting WebSocket...');
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      // Return empty cleanup function
      return () => {};
    }
  }, [userId, userType, token, getWebSocketUrl]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const joinThread = useCallback((threadId: number) => {
    if (socketRef.current) {
      socketRef.current.emit('join_thread', threadId);
    }
  }, []);

  const sendMessage = useCallback((threadId: number, content: string, attachments?: any[]) => {
    if (socketRef.current) {
      return new Promise((resolve, reject) => {
        socketRef.current!.emit('send_message', { threadId, content, attachments }, (response: any) => {
          if (response?.success) {
            resolve(response);
          } else {
            reject(response?.error || 'Failed to send message');
          }
        });
      });
    }
    return Promise.reject('Socket not connected');
  }, []);

  const sendTypingIndicator = useCallback((threadId: number, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { threadId, isTyping });
    }
  }, []);

  const markAsRead = useCallback((threadId: number, messageIds?: number[]) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { threadId, messageIds });
    }
  }, []);

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (socketRef.current) {
      const handler = (data: { message: Message }) => {
        callback(data.message);
      };
      socketRef.current.on('new_message', handler);
      
      // Return cleanup function to remove listener
      return () => {
        if (socketRef.current) {
          socketRef.current.off('new_message', handler);
        }
      };
    }
  }, []);

  const onTypingIndicator = useCallback((callback: (data: TypingIndicator) => void) => {
    if (socketRef.current) {
      const handler = (data: TypingIndicator) => {
        callback(data);
      };
      socketRef.current.on('typing_indicator', handler);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('typing_indicator', handler);
        }
      };
    }
  }, []);

  const onMessagesRead = useCallback((callback: (data: { threadId: number; readerId: number }) => void) => {
    if (socketRef.current) {
      const handler = (data: { threadId: number; readerId: number }) => {
        callback(data);
      };
      socketRef.current.on('messages_read', handler);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.off('messages_read', handler);
        }
      };
    }
  }, []);

  const isUserOnline = useCallback((userId: number) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    // Setup connection and get cleanup function
    connect().then((cleanupFn) => {
      cleanup = cleanupFn;
    }).catch(error => {
      console.error('Failed to connect socket:', error);
    });
    
    // Return cleanup function for useEffect
    return () => {
      if (cleanup) {
        cleanup();
      }
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    joinThread,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    onNewMessage,
    onTypingIndicator,
    onMessagesRead,
    isUserOnline,
    disconnect
  };
};