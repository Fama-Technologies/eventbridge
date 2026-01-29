"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageThread {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorAvatar?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    online: boolean;
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

    // Fetch message threads
    useEffect(() => {
        fetchMessageThreads();
        
        // Set up WebSocket for real-time updates
        setupWebSocket();
        
        // Cleanup
        return () => {
            // Cleanup WebSocket
        };
    }, []);

    const fetchMessageThreads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/customer/messages/threads');
            const data = await response.json();
            
            if (data.success) {
                const formattedThreads = data.threads.map((thread: any) => ({
                    ...thread,
                    lastMessageTime: new Date(thread.lastMessageTime),
                }));
                setThreads(formattedThreads);
            }
        } catch (error) {
            console.error('Error fetching message threads:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupWebSocket = () => {
        // You can implement WebSocket or use polling
        // For now, we'll use polling
        const interval = setInterval(fetchMessageThreads, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    };

    const filteredThreads = threads.filter(thread => {
        if (activeFilter === "Unread") return thread.unreadCount > 0;
        if (activeFilter === "Urgent") return thread.vendorName.includes("Echo Beats"); // Example filter
        if (searchQuery) return thread.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
        return true;
    });

    const formatTime = (date: Date) => {
        return formatDistanceToNow(date, { addSuffix: true });
    };

    return (
        <div className="min-h-screen bg-neutrals-01 pb-20">
            {/* Header */}
            <div className="bg-shades-white sticky top-0 z-20 px-4 py-3 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="p-1">
                    <ArrowLeft size={24} className="text-shades-black" />
                </button>
                <h1 className="text-lg font-bold text-shades-black">Messages</h1>
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

                {/* Message List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
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
                                className="bg-shades-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.99] transition-transform"
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
                                                {thread.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}