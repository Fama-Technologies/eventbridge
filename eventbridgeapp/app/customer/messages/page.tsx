"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageThread {
    id: number;
    vendorId: number;
    vendorName: string;
    vendorAvatar?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    online: boolean;
    vendor?: {
        businessName: string;
        city: string;
        rating: number;
        responseTime: string;
    };
}

interface Message {
    id: string;
    threadId: string;
    senderId: string;
    senderType: 'customer' | 'vendor';
    content: string;
    attachments?: Array<{
        type: 'image' | 'document' | 'audio' | 'video';
        url: string;
        name?: string;
        size?: number;
    }>;
    timestamp: Date;
    read: boolean;
}

const FILTERS = ["All", "Unread", "Urgent"];

export default function MessagesPage() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState("All");
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);

    // Get WebSocket URL based on environment
    const getWebSocketUrl = () => {
        if (typeof window === 'undefined') return '';
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        return `${protocol}//${host}/api/socketio`;
    };

    // Fetch message threads
    useEffect(() => {
        fetchMessageThreads();
        
        // Initialize WebSocket connection
        const wsUrl = getWebSocketUrl();
        console.log('Connecting to WebSocket:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        setSocket(ws);
        
        ws.onopen = () => {
            console.log('WebSocket connected successfully');
            setSocketConnected(true);
            
            // Send authentication if user is logged in
            // You can add your authentication logic here
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                ws.send(JSON.stringify({ 
                    type: 'authenticate', 
                    token: token 
                }));
            }
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('WebSocket message received:', data.type);
                
                if (data.type === 'new_message' || 
                    data.type === 'message_received' || 
                    data.type === 'message_notification') {
                    // Refresh threads when new message arrives
                    fetchMessageThreads();
                }
                
                // Handle other message types
                switch(data.type) {
                    case 'connection_established':
                        console.log('WebSocket connection established');
                        break;
                    case 'error':
                        console.error('WebSocket error:', data.message);
                        break;
                    case 'ping':
                        // Respond to ping
                        ws.send(JSON.stringify({ type: 'pong' }));
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setSocketConnected(false);
        };
        
        ws.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            setSocketConnected(false);
            
            // Attempt reconnection after 5 seconds
            setTimeout(() => {
                if (ws.readyState === WebSocket.CLOSED) {
                    console.log('Attempting to reconnect WebSocket...');
                    // Reconnection logic could go here
                }
            }, 5000);
        };
        
        // Send periodic ping to keep connection alive
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Every 30 seconds
        
        // Cleanup
        return () => {
            clearInterval(pingInterval);
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close(1000, 'Component unmounting');
            }
        };
    }, []);

    const fetchMessageThreads = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/customer/messages/threads', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                const formattedThreads = data.threads.map((thread: any) => ({
                    id: thread.id || 0,
                    vendorId: thread.vendorId || 0,
                    vendorName: thread.vendorName || thread.vendor?.businessName || 'Vendor',
                    vendorAvatar: thread.vendorAvatar || thread.vendor?.profileImage,
                    lastMessage: thread.lastMessage || 'No messages yet',
                    lastMessageTime: new Date(thread.lastMessageTime),
                    unreadCount: thread.unreadCount || 0,
                    online: thread.online || false,
                    vendor: thread.vendor
                }));
                setThreads(formattedThreads);
            } else {
                setError(data.error || 'Failed to fetch messages');
            }
        } catch (error: any) {
            console.error('Error fetching message threads:', error);
            setError(error.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const filteredThreads = threads.filter(thread => {
        if (activeFilter === "Unread") return thread.unreadCount > 0;
        if (activeFilter === "Urgent") {
            return thread.unreadCount > 3 || 
                   thread.vendorName.toLowerCase().includes("urgent") ||
                   (thread.lastMessage && thread.lastMessage.toLowerCase().includes("urgent"));
        }
        if (searchQuery) {
            return thread.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   (thread.lastMessage && thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return true;
    });

    const formatTime = (date: Date) => {
        try {
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            return 'Recently';
        }
    };

    return (
        <div className="min-h-screen bg-neutrals-01 pb-20">
            {/* Header */}
            <div className="bg-shades-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-shades-black">Messages</h1>
                    {socketConnected && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="WebSocket connected"></div>
                    )}
                </div>
                <button 
                    onClick={() => setShowSearch(!showSearch)} 
                    className="p-1"
                >
                    <Search size={24} className="text-shades-black" />
                </button>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="px-4 py-3 bg-white border-b border-neutrals-03">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutrals-06" size={20} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutrals-02 border border-neutrals-03 rounded-lg text-shades-black placeholder:text-neutrals-06 focus:outline-none focus:border-primary-01"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutrals-06 hover:text-shades-black"
                            >
                                X
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
                {/* Filters */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-colors border whitespace-nowrap",
                                activeFilter === filter
                                    ? "bg-primary-01 text-shades-white border-primary-01"
                                    : "bg-shades-white text-shades-black border-neutrals-03 hover:bg-neutrals-02"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Connection Status */}
                {!socketConnected && !loading && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Real-time updates are temporarily unavailable. Messages will update when you refresh.
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-8 bg-red-50 rounded-xl mb-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <div className="text-red-500 text-xl">!</div>
                        </div>
                        <h3 className="text-lg font-bold text-shades-black mb-2">
                            Error Loading Messages
                        </h3>
                        <p className="text-neutrals-06 mb-4">{error}</p>
                        <button
                            onClick={fetchMessageThreads}
                            className="inline-block bg-primary-01 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-02 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Message List */}
                {loading ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-shades-white rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-neutrals-03"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-neutrals-03 rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-neutrals-03 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredThreads.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-neutrals-02 flex items-center justify-center">
                            <Search size={40} className="text-neutrals-06" />
                        </div>
                        <h3 className="text-lg font-bold text-shades-black mb-2">
                            {searchQuery ? "No messages found" : "No messages yet"}
                        </h3>
                        <p className="text-neutrals-06 mb-6">
                            {searchQuery 
                                ? "Try a different search term" 
                                : "Start a conversation with a vendor"
                            }
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/customer/dashboard/find-vendors"
                                className="inline-block bg-primary-01 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-02 transition-colors"
                            >
                                Browse Vendors
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredThreads.map((thread) => (
                            <Link
                                key={thread.id}
                                href={`/customer/messages/${thread.id}`}
                                className="bg-shades-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-transform hover:shadow-md"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-neutrals-03 overflow-hidden">
                                        {thread.vendorAvatar ? (
                                            <Image
                                                src={thread.vendorAvatar}
                                                alt={thread.vendorName}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary-01/20 flex items-center justify-center text-primary-01 font-bold text-lg">
                                                {thread.vendorName[0]}
                                            </div>
                                        )}
                                    </div>
                                    {thread.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-shades-white"></div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-base font-bold text-shades-black truncate">
                                            {thread.vendorName}
                                        </h3>
                                        <span className="text-xs text-neutrals-06 flex-shrink-0">
                                            {formatTime(thread.lastMessageTime)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-neutrals-06 truncate pr-2">
                                            {thread.lastMessage}
                                        </p>
                                        {thread.unreadCount > 0 && (
                                            <div className="w-5 h-5 bg-primary-01 text-shades-white text-xs font-bold flex items-center justify-center rounded-full flex-shrink-0">
                                                {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Optional: Show vendor location if available */}
                                    {thread.vendor?.city && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs text-neutrals-06">
                                                Location: {thread.vendor.city}
                                            </span>
                                            {thread.vendor.rating && (
                                                <span className="text-xs text-neutrals-06 ml-2">
                                                    Rating: {thread.vendor.rating}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}