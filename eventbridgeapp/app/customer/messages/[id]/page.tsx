"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
    ArrowLeft, MoreHorizontal, Paperclip, Smile, Send, 
    Image as ImageIcon, FileText, X, Phone, Video, 
    Check, CheckCheck, Loader2, Upload, AlertCircle
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";

interface Message {
    id: number;
    threadId: number;
    senderId: number;
    senderType: 'CUSTOMER' | 'VENDOR';
    content: string;
    attachments?: Array<{
        type: string;
        url: string;
        name?: string;
        size?: number;
    }>;
    timestamp: Date;
    read: boolean;
    status?: 'sending' | 'sent' | 'delivered' | 'read';
    sender?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

interface VendorInfo {
    id: number;
    name: string;
    avatar?: string;
    online: boolean;
    lastSeen?: Date;
    businessName?: string;
    rating?: number;
    responseTime?: string;
    email?: string;
    phone?: string;
    accountType?: string;
}

interface Quote {
    id: string;
    bookingId?: number;
    title: string;
    description: string;
    amount: number;
    currency?: string;
    formattedPrice: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'negotiating';
    createdAt: Date;
    validUntil?: Date;
}

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const threadId = parseInt(params.id as string);
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [vendor, setVendor] = useState<VendorInfo | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);
    const [typing, setTyping] = useState(false);
    const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Initialize WebSocket
    const { isConnected, sendMessage: sendWsMessage, onNewMessage, onTypingIndicator } = useSocket(
        1, // Replace with actual user ID from auth
        'customer',
        'your-token' // Replace with actual token
    );

    // Fetch messages and vendor info
    useEffect(() => {
        fetchMessages();
        fetchVendorInfo();
        fetchActiveQuote();
        
        // Mark messages as read
        markAsRead();
        
        // Set up WebSocket listeners
        onNewMessage((message: any) => {
            if (message.threadId === threadId) {
                setMessages(prev => [...prev, {
                    id: message.id,
                    threadId: message.threadId,
                    senderId: message.senderId,
                    senderType: message.senderType,
                    content: message.content,
                    attachments: message.attachments || [],
                    timestamp: new Date(message.timestamp),
                    read: message.read,
                    status: 'delivered'
                }]);
                
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        });
        
        onTypingIndicator((data: any) => {
            if (data.threadId === threadId && data.userType === 'vendor') {
                setTyping(data.isTyping);
            }
        });
        
        // Cleanup
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [threadId]);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/customer/messages/${threadId}`);
            const data = await response.json();
            
            if (data.success) {
                const formattedMessages = data.messages.map((msg: any) => ({
                    id: msg.id,
                    threadId: msg.threadId,
                    senderId: msg.sender?.id || msg.senderId,
                    senderType: msg.senderType,
                    content: msg.content,
                    attachments: msg.attachments || [],
                    timestamp: new Date(msg.timestamp),
                    read: msg.read,
                    status: 'sent',
                    sender: msg.sender,
                    isOwn: msg.isOwn
                }));
                setMessages(formattedMessages);
                
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVendorInfo = async () => {
        try {
            const response = await fetch(`/api/customer/messages/${threadId}/vendor`);
            const data = await response.json();
            
            if (data.success) {
                setVendor(data.user);
            }
        } catch (error) {
            console.error('Error fetching vendor info:', error);
        }
    };

    const fetchActiveQuote = async () => {
        try {
            const response = await fetch(`/api/customer/messages/${threadId}/quote`);
            const data = await response.json();
            
            if (data.success && data.quote) {
                setActiveQuote(data.quote);
            }
        } catch (error) {
            console.error('Error fetching quote:', error);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch(`/api/customer/messages/${threadId}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messageIds: [] })
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        setTyping(true);
        sendTypingIndicator();
        
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 1000);
    };

    const sendTypingIndicator = async () => {
        try {
            await fetch(`/api/customer/messages/${threadId}/typing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isTyping: true }),
            });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (!inputValue.trim() && !uploadingFile) return;
        
        try {
            setIsSending(true);
            
            // Create temporary message for optimistic UI
            const tempId = Date.now();
            const tempMessage: Message = {
                id: tempId,
                threadId,
                senderId: 1, // Replace with actual user ID
                senderType: 'CUSTOMER',
                content: inputValue,
                timestamp: new Date(),
                read: false,
                status: 'sending',
            };
            
            setMessages(prev => [...prev, tempMessage]);
            setInputValue("");
            
            // Send via WebSocket first
            if (isConnected) {
                sendWsMessage(threadId, inputValue);
            }
            
            // Also send via REST API for persistence
            const response = await fetch(`/api/customer/messages/${threadId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: inputValue,
                    attachments: []
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update temp message with real data
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? {
                        ...msg,
                        id: data.message.id,
                        status: 'sent'
                    } : msg
                ));
                
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            } else {
                setMessages(prev => prev.filter(msg => msg.id !== tempId));
                toast.error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (files: FileList) => {
        if (files.length === 0) return;
        
        const file = files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }
        
        try {
            setUploadingFile(true);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('threadId', threadId.toString());
            
            const response = await fetch('/api/customer/messages/upload', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            
            if (data.success) {
                const tempId = Date.now();
                const fileMessage: Message = {
                    id: tempId,
                    threadId,
                    senderId: 1,
                    senderType: 'CUSTOMER',
                    content: '',
                    attachments: [{
                        type: getFileType(file.type),
                        url: data.fileUrl || URL.createObjectURL(file),
                        name: file.name,
                        size: file.size,
                    }],
                    timestamp: new Date(),
                    read: false,
                    status: 'sending',
                };
                
                setMessages(prev => [...prev, fileMessage]);
                toast.success('File uploaded successfully');
                
                // Send via WebSocket
                if (isConnected) {
                    sendWsMessage(threadId, `Sent file: ${file.name}`, [{
                        type: getFileType(file.type),
                        url: data.fileUrl,
                        name: file.name,
                        size: file.size
                    }]);
                }
                
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            } else {
                toast.error(data.error || 'Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploadingFile(false);
            setShowAttachments(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const getFileType = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        return 'document';
    };

    const acceptQuote = async () => {
        if (!activeQuote) return;
        
        try {
            const response = await fetch(`/api/customer/messages/${threadId}/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    acceptTerms: true,
                    notes: 'Quote accepted'
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setActiveQuote(prev => prev ? { ...prev, status: 'accepted' } : null);
                toast.success('Quote accepted successfully!');
                
                // Send acceptance message
                setInputValue(`I've accepted the quote (${activeQuote.title}). Looking forward to working together!`);
                setTimeout(() => {
                    sendMessage();
                }, 100);
            } else {
                toast.error(data.error || 'Failed to accept quote');
            }
        } catch (error) {
            console.error('Error accepting quote:', error);
            toast.error('Failed to accept quote');
        }
    };

    const rejectQuote = async () => {
        if (!activeQuote) return;
        
        try {
            const response = await fetch(`/api/customer/messages/${threadId}/quote`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: 'Not interested'
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setActiveQuote(prev => prev ? { ...prev, status: 'rejected' } : null);
                toast.success('Quote rejected');
            } else {
                toast.error(data.error || 'Failed to reject quote');
            }
        } catch (error) {
            console.error('Error rejecting quote:', error);
            toast.error('Failed to reject quote');
        }
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderMessageStatus = (status?: string, read?: boolean) => {
        if (status === 'sending') {
            return <Loader2 size={12} className="animate-spin" />;
        }
        if (read) {
            return <CheckCheck size={12} className="text-primary-01" />;
        }
        if (status === 'delivered') {
            return <CheckCheck size={12} className="text-gray-400" />;
        }
        return <Check size={12} className="text-gray-400" />;
    };

    const renderAttachment = (attachment: any) => {
        switch (attachment.type) {
            case 'image':
                return (
                    <div className="relative rounded-lg overflow-hidden">
                        <Image
                            src={attachment.url}
                            alt={attachment.name || 'Image'}
                            width={200}
                            height={150}
                            className="object-cover"
                        />
                    </div>
                );
            case 'document':
                return (
                    <div className="flex items-center gap-2 p-3 bg-neutrals-02 rounded-lg border border-neutrals-03">
                        <FileText size={20} className="text-primary-01" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-shades-black truncate">
                                {attachment.name || 'Document'}
                            </p>
                            <p className="text-xs text-neutrals-06">
                                {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <a
                            href={attachment.url}
                            download
                            className="text-primary-01 hover:text-primary-02"
                        >
                            Download
                        </a>
                    </div>
                );
            default:
                return (
                    <div className="p-3 bg-neutrals-02 rounded-lg border border-neutrals-03">
                        <p className="text-sm text-shades-black">
                            {attachment.type.toUpperCase()} file
                        </p>
                    </div>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-shades-white">
                <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutrals-03">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-1">
                            <ArrowLeft size={24} className="text-shades-black" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-neutrals-03 animate-pulse" />
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-neutrals-03 rounded animate-pulse" />
                            <div className="w-20 h-3 bg-neutrals-03 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-shades-white">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-neutrals-03 sticky top-0 bg-shades-white z-20">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1">
                        <ArrowLeft size={24} className="text-shades-black" />
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-neutrals-03 overflow-hidden">
                            {vendor?.avatar ? (
                                <Image
                                    src={vendor.avatar}
                                    alt={vendor.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-primary-01/20 flex items-center justify-center text-primary-01 font-bold text-sm">
                                    {vendor?.name?.[0] || 'V'}
                                </div>
                            )}
                        </div>
                        {vendor?.online && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-shades-white"></div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold text-shades-black leading-tight">
                            {vendor?.name || 'Vendor'}
                        </h1>
                        <span className={cn(
                            "text-xs font-medium leading-tight",
                            vendor?.online ? "text-green-500" : "text-neutrals-06"
                        )}>
                            {vendor?.online 
                                ? 'Online' 
                                : vendor?.responseTime || 'Usually responds within a few hours'}
                            {typing && ' • typing...'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        className="p-2 text-neutrals-06 hover:text-primary-01"
                        onClick={() => toast.info('Voice call coming soon!')}
                    >
                        <Phone size={20} />
                    </button>
                    <button 
                        className="p-2 text-neutrals-06 hover:text-primary-01"
                        onClick={() => toast.info('Video call coming soon!')}
                    >
                        <Video size={20} />
                    </button>
                    <div className="relative">
                        <button 
                            className="p-1 text-neutrals-05"
                            onClick={() => setShowVendorMenu(!showVendorMenu)}
                        >
                            <MoreHorizontal size={24} />
                        </button>
                        
                        {showVendorMenu && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutrals-03 py-1 z-30">
                                <button 
                                    className="w-full px-4 py-2 text-left text-sm text-shades-black hover:bg-neutrals-02"
                                    onClick={() => {
                                        router.push(`/customer/vendor/${vendor?.id}`);
                                        setShowVendorMenu(false);
                                    }}
                                >
                                    View Vendor Profile
                                </button>
                                <button 
                                    className="w-full px-4 py-2 text-left text-sm text-shades-black hover:bg-neutrals-02"
                                    onClick={() => {
                                        toast.info('Booking feature coming soon!');
                                        setShowVendorMenu(false);
                                    }}
                                >
                                    Book Service
                                </button>
                                <button 
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to block this vendor?')) {
                                            toast.info('Block feature coming soon!');
                                            setShowVendorMenu(false);
                                        }
                                    }}
                                >
                                    Block Vendor
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-neutrals-01 p-4">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((message, index) => {
                        const isOwn = message.isOwn;
                        const showDate = index === 0 || 
                            formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
                        
                        return (
                            <React.Fragment key={message.id}>
                                {showDate && (
                                    <div className="text-center">
                                        <span className="inline-block px-3 py-1 bg-neutrals-02 text-neutrals-07 text-xs rounded-full">
                                            {formatDate(message.timestamp)}
                                        </span>
                                    </div>
                                )}
                                
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                        <div className={cn(
                                            "rounded-2xl px-4 py-3",
                                            isOwn 
                                                ? 'bg-primary-01 text-white rounded-br-none' 
                                                : 'bg-white border border-neutrals-03 rounded-bl-none'
                                        )}>
                                            {/* Attachments */}
                                            {message.attachments?.map((attachment, idx) => (
                                                <div key={idx} className="mb-2">
                                                    {renderAttachment(attachment)}
                                                </div>
                                            ))}
                                            
                                            {/* Message Content */}
                                            {message.content && (
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            )}
                                            
                                            {/* Message Footer */}
                                            <div className={cn(
                                                "flex items-center gap-1 mt-1 text-xs",
                                                isOwn ? 'justify-end text-primary-01/70' : 'justify-start text-neutrals-06'
                                            )}>
                                                <span>{formatTime(message.timestamp)}</span>
                                                {isOwn && (
                                                    <span className="ml-1">
                                                        {renderMessageStatus(message.status, message.read)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                    
                    {/* Active Quote */}
                    {activeQuote && activeQuote.status === 'pending' && (
                        <div className="flex justify-center my-2 w-full">
                            <div className="bg-shades-white rounded-3xl p-5 shadow-sm border border-neutrals-03 w-full max-w-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-shades-black text-base">
                                        {activeQuote.title}
                                    </h3>
                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                        PENDING
                                    </span>
                                </div>
                                <p className="text-sm text-neutrals-06 italic mb-4">
                                    {activeQuote.description}
                                </p>
                                <div className="mb-4">
                                    <span className="text-[10px] text-neutrals-05 uppercase font-bold block mb-0.5">
                                        PRICE
                                    </span>
                                    <span className="text-lg font-bold text-shades-black">
                                        {activeQuote.formattedPrice || `UGX ${activeQuote.amount.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <button 
                                        onClick={acceptQuote}
                                        className="w-full bg-primary-01 hover:bg-primary-02 text-shades-white font-bold py-3 rounded-full transition-colors shadow-md"
                                    >
                                        Accept Quote
                                    </button>
                                    <button 
                                        onClick={() => toast.info('Negotiation feature coming soon!')}
                                        className="w-full bg-white border border-neutrals-03 hover:bg-neutrals-02 text-shades-black font-medium py-3 rounded-full transition-colors"
                                    >
                                        Negotiate Price
                                    </button>
                                    <button 
                                        onClick={rejectQuote}
                                        className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium py-3 rounded-full transition-colors"
                                    >
                                        Reject Quote
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Attachment Menu */}
            {showAttachments && (
                <div className="bg-white border-t border-neutrals-03 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-shades-black">Attach File</h3>
                        <button 
                            onClick={() => setShowAttachments(false)}
                            className="p-1 text-neutrals-06 hover:text-shades-black"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-neutrals-02 hover:bg-neutrals-03 transition-colors"
                        >
                            <ImageIcon size={24} className="text-primary-01" />
                            <span className="text-xs text-shades-black">Photo</span>
                        </button>
                        <button 
                            onClick={() => {
                                fileInputRef.current?.setAttribute('accept', '.pdf,.doc,.docx,.txt,.xlsx');
                                fileInputRef.current?.click();
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-neutrals-02 hover:bg-neutrals-03 transition-colors"
                        >
                            <FileText size={24} className="text-primary-01" />
                            <span className="text-xs text-shades-black">Document</span>
                        </button>
                        <button 
                            onClick={() => toast.info('Camera access coming soon!')}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-neutrals-02 hover:bg-neutrals-03 transition-colors"
                        >
                            <Upload size={24} className="text-primary-01" />
                            <span className="text-xs text-shades-black">Upload</span>
                        </button>
                        <button 
                            onClick={() => toast.info('Location sharing coming soon!')}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-neutrals-02 hover:bg-neutrals-03 transition-colors"
                        >
                            <AlertCircle size={24} className="text-primary-01" />
                            <span className="text-xs text-shades-black">Location</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={sendMessage} className="bg-shades-white border-t border-neutrals-03 px-4 py-3">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <button 
                        type="button"
                        onClick={() => setShowAttachments(!showAttachments)}
                        className={cn(
                            "p-2 transition-colors",
                            showAttachments ? "text-primary-01" : "text-neutrals-06 hover:text-primary-01"
                        )}
                    >
                        <Paperclip size={24} className="rotate-45" />
                    </button>
                    
                    <div className="flex-1 bg-neutrals-02 rounded-full px-4 py-2.5 flex items-center">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-shades-black placeholder:text-neutrals-05"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                handleTyping();
                            }}
                            onKeyPress={handleKeyPress}
                            disabled={isSending || uploadingFile}
                        />
                        <button 
                            type="button"
                            className="p-1 text-neutrals-06 hover:text-primary-01"
                            onClick={() => toast.info('Emoji picker coming soon!')}
                        >
                            <Smile size={20} />
                        </button>
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={(!inputValue.trim() && !uploadingFile) || isSending || uploadingFile}
                        className={cn(
                            "p-3 rounded-full flex items-center justify-center transition-all",
                            inputValue.trim() || uploadingFile
                                ? "bg-primary-01 hover:bg-primary-02 text-white shadow-lg"
                                : "bg-neutrals-03 text-neutrals-06 cursor-not-allowed"
                        )}
                    >
                        {isSending || uploadingFile ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} className="ml-0.5" />
                        )}
                    </button>
                </div>
                
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files) {
                            handleFileUpload(e.target.files);
                        }
                    }}
                />
            </form>
        </div>
    );
}