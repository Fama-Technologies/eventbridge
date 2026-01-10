'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, MoreVertical, Calendar, MapPin, Users, Paperclip, Smile, Send, Download, CheckCircle, Mic, X, FileText } from 'lucide-react';
import Image from 'next/image';
import type {
    Conversation,
    Message,
    Booking,
} from '@/lib/messages-data';
import {
    EMOJI_CATEGORIES,
    MOCK_CONVERSATIONS,
    MOCK_BOOKINGS,
    findConversationByEventName
} from '@/lib/messages-data';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
}

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeTab, setActiveTab] = useState('all');
    const [messageInput, setMessageInput] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Fetch user profile
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/users/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            }
        }
        fetchUser();
    }, []);

    // Handle URL parameters to auto-select conversation
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        const newChatId = searchParams.get('newChat');
        const newChatName = searchParams.get('name');

        if (conversationId) {
            // Find and select the conversation by ID
            const conversation = conversations.find(c => c.id === conversationId);
            if (conversation) {
                setSelectedConversation(conversation);
            }
        } else if (newChatId && newChatName) {
            // Create a new conversation placeholder for new chat
            const existingConversation = conversations.find(c =>
                c.name.toLowerCase().includes(newChatName.toLowerCase())
            );
            if (existingConversation) {
                setSelectedConversation(existingConversation);
            }
            // TODO: If no existing conversation, could create a new one here
        }
    }, [searchParams, conversations]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'quotes', label: 'Quotes' }
    ];

    const handleEmojiSelect = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
    };

    const handleSendMessage = () => {
        if (messageInput.trim() || attachments.length > 0) {
            if (selectedConversation) {
                const newMessage: Message = {
                    id: `m${Date.now()}`,
                    content: messageInput,
                    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    sender: 'vendor',
                    attachments: attachments.map(file => ({
                        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file',
                        url: URL.createObjectURL(file),
                        name: file.name,
                        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
                    }))
                };

                const updatedConversation = {
                    ...selectedConversation,
                    messages: [...selectedConversation.messages, newMessage],
                    lastMessage: messageInput || `Sent ${attachments.length} attachment(s)`
                };

                setSelectedConversation(updatedConversation);
                setConversations(prev =>
                    prev.map(c => c.id === selectedConversation.id ? updatedConversation : c)
                );
            }
            setMessageInput('');
            setAttachments([]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
        const files = e.target.files;
        if (files) {
            setAttachments(prev => [...prev, ...Array.from(files)]);
        }
        e.target.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAudioRecord = () => {
        if (!isRecording) {
            setIsRecording(true);
            // Start recording logic here
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const mediaRecorder = new MediaRecorder(stream);
                    const audioChunks: BlobPart[] = [];

                    mediaRecorder.ondataavailable = (e) => {
                        audioChunks.push(e.data);
                    };

                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const audioFile = new File([audioBlob], `voice_message_${Date.now()}.wav`, { type: 'audio/wav' });
                        setAttachments(prev => [...prev, audioFile]);
                        stream.getTracks().forEach(track => track.stop());
                        setIsRecording(false);
                    };

                    mediaRecorder.start();
                    // Auto stop after 60 seconds
                    setTimeout(() => {
                        if (mediaRecorder.state === 'recording') {
                            mediaRecorder.stop();
                        }
                    }, 60000);

                    // Store mediaRecorder reference for manual stop
                    (window as any).currentMediaRecorder = mediaRecorder;
                })
                .catch(err => {
                    console.error('Audio recording error:', err);
                    setIsRecording(false);
                });
        } else {
            // Stop recording
            const mediaRecorder = (window as any).currentMediaRecorder;
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Confirmed
                    </span>
                );
            case 'pending-quote':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-primary-01">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-01"></span>
                        Pending Quote
                    </span>
                );
            default:
                return null;
        }
    };

    // Conversation Detail View
    if (selectedConversation) {
        return (
            <div className="flex h-[calc(100vh-80px)] -m-6 overflow-hidden">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Chat Header - merged with top */}
                    <div className="flex items-center justify-between px-6 py-3 bg-shades-white border-b border-neutrals-02">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="p-2 hover:bg-neutrals-01 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} className="text-neutrals-07" />
                            </button>
                            <div className="relative">
                                {selectedConversation.avatar ? (
                                    <Image
                                        src={selectedConversation.avatar}
                                        alt={selectedConversation.name}
                                        width={44}
                                        height={44}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-neutrals-02 flex items-center justify-center text-lg font-semibold text-neutrals-07">
                                        {selectedConversation.name.charAt(0)}
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-shades-black">{selectedConversation.name}</span>
                                    {selectedConversation.isVerified && (
                                        <CheckCircle size={16} className="text-blue-500 fill-blue-500" />
                                    )}
                                </div>
                                <span className="text-sm text-neutrals-06">{selectedConversation.eventType} • Oct 24, 2024</span>
                            </div>
                        </div>
                        <button className="p-2 hover:bg-neutrals-01 rounded-lg transition-colors">
                            <MoreVertical size={20} className="text-neutrals-07" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutrals-01">
                        {selectedConversation.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'vendor' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end gap-3 max-w-[70%] `}>
                                    {message.sender === 'user' && (
                                        <Image
                                            src={selectedConversation.avatar || '/avatars/default.jpg'}
                                            alt=""
                                            width={36}
                                            height={36}
                                            className="rounded-full object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className={`flex flex-col ${message.sender === 'vendor' ? 'items-end' : 'items-start'}`}>
                                        {message.content && (
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${message.sender === 'vendor'
                                                    ? 'bg-primary-01 text-white rounded-br-sm'
                                                    : 'bg-shades-white text-shades-black rounded-bl-sm shadow-sm'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            </div>
                                        )}
                                        {message.image && (
                                            <div className="mt-3 rounded-xl overflow-hidden w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500">
                                                {/* Placeholder for attached image */}
                                            </div>
                                        )}
                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {message.attachments.map((attachment, idx) => (
                                                    <div key={idx}>
                                                        {attachment.type === 'image' && (
                                                            <div className="rounded-xl overflow-hidden max-w-[200px]">
                                                                <img src={attachment.url} alt="" className="w-full h-auto" />
                                                            </div>
                                                        )}
                                                        {attachment.type === 'audio' && (
                                                            <div className={`px-3 py-2 rounded-xl ${message.sender === 'vendor' ? 'bg-primary-02' : 'bg-shades-white shadow-sm'}`}>
                                                                <audio controls src={attachment.url} className="h-8 max-w-[200px]" />
                                                            </div>
                                                        )}
                                                        {attachment.type === 'file' && (
                                                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${message.sender === 'vendor' ? 'bg-primary-02 text-white' : 'bg-shades-white shadow-sm'}`}>
                                                                <FileText size={16} />
                                                                <span className="text-xs truncate max-w-[150px]">{attachment.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-xs text-neutrals-06 mt-1.5">{message.timestamp}</span>
                                    </div>
                                    {message.sender === 'vendor' && (
                                        <div className="w-9 h-9 rounded-full overflow-hidden bg-neutrals-02 flex-shrink-0 flex items-center justify-center">
                                            {user?.image ? (
                                                <Image
                                                    src={user.image}
                                                    alt="Me"
                                                    width={36}
                                                    height={36}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-neutrals-07">
                                                    {user?.firstName?.charAt(0) || 'Me'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input - Fixed at bottom */}
                    <div className="bg-shades-white border-t border-neutrals-02">
                        {/* Attachments Preview */}
                        {attachments.length > 0 && (
                            <div className="px-6 pt-3 flex gap-2 flex-wrap">
                                {attachments.map((file, index) => (
                                    <div key={index} className="relative group">
                                        {file.type.startsWith('image/') ? (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutrals-02">
                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : file.type.startsWith('audio/') ? (
                                            <div className="px-3 py-2 rounded-lg bg-neutrals-01 flex items-center gap-2">
                                                <Mic size={16} className="text-primary-01" />
                                                <span className="text-xs text-neutrals-07">Voice message</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-2 rounded-lg bg-neutrals-01 flex items-center gap-2">
                                                <FileText size={16} className="text-neutrals-07" />
                                                <span className="text-xs text-neutrals-07 truncate max-w-[80px]">{file.name}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="px-4 py-2 flex items-center gap-2 relative">
                            {/* Hidden file input - accepts images and documents */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                onChange={(e) => handleFileSelect(e, 'file')}
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-neutrals-01 rounded-full transition-colors flex-shrink-0"
                                title="Attach file or image"
                            >
                                <Paperclip size={22} className="text-neutrals-06" />
                            </button>

                            {/* Emoji Picker */}
                            <div className="relative" ref={emojiPickerRef}>
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? 'bg-neutrals-02' : 'hover:bg-neutrals-01'}`}
                                    title="Add emoji"
                                >
                                    <Smile size={22} className="text-neutrals-06" />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 left-0 bg-shades-white rounded-2xl shadow-xl border border-neutrals-02 w-[320px] z-50">
                                        {/* Category Tabs */}
                                        <div className="flex border-b border-neutrals-02 px-2 pt-2">
                                            {EMOJI_CATEGORIES.map((cat, index) => (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => setActiveEmojiCategory(index)}
                                                    className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${activeEmojiCategory === index
                                                        ? 'bg-neutrals-01 text-primary-01'
                                                        : 'text-neutrals-06 hover:text-shades-black'
                                                        }`}
                                                >
                                                    {cat.emojis[0]}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Emoji Grid */}
                                        <div className="p-3 h-[200px] overflow-y-auto">
                                            <p className="text-xs text-neutrals-06 mb-2 font-medium">{EMOJI_CATEGORIES[activeEmojiCategory].name}</p>
                                            <div className="grid grid-cols-8 gap-1">
                                                {EMOJI_CATEGORIES[activeEmojiCategory].emojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            handleEmojiSelect(emoji);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center text-xl hover:bg-neutrals-01 rounded-lg transition-colors"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAudioRecord}
                                className={`p-2 rounded-full transition-colors flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-neutrals-01'}`}
                                title={isRecording ? 'Stop recording' : 'Record voice message'}
                            >
                                <Mic size={22} className={isRecording ? 'text-white' : 'text-neutrals-06'} />
                            </button>

                            <div className="flex-1 flex items-center bg-neutrals-01 rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-transparent outline-none text-sm text-shades-black placeholder:text-neutrals-06"
                                />
                            </div>

                            <button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() && attachments.length === 0}
                                className="p-2.5 bg-primary-01 hover:bg-primary-02 disabled:bg-neutrals-04 rounded-full transition-colors flex-shrink-0"
                            >
                                <Send size={18} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Event Details Sidebar */}
                <div className="w-[300px] bg-shades-white flex-shrink-0 hidden lg:flex flex-col border-l border-neutrals-02">
                    {/* Fixed Header */}
                    <div className="p-6 pb-4 border-b border-neutrals-02">
                        <h2 className="text-lg font-semibold text-shades-black">Event Details</h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-neutrals-01 rounded-lg">
                                    <Calendar size={18} className="text-primary-01" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutrals-06 uppercase tracking-wider font-medium">Date & Time</p>
                                    <p className="text-sm font-medium text-shades-black">
                                        {selectedConversation.eventDetails?.date} • {selectedConversation.eventDetails?.time}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-neutrals-01 rounded-lg">
                                    <MapPin size={18} className="text-primary-01" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutrals-06 uppercase tracking-wider font-medium">Venue</p>
                                    <p className="text-sm font-medium text-shades-black">{selectedConversation.eventDetails?.venue}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-neutrals-01 rounded-lg">
                                    <Users size={18} className="text-primary-01" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutrals-06 uppercase tracking-wider font-medium">Guests</p>
                                    <p className="text-sm font-medium text-shades-black">{selectedConversation.eventDetails?.guests} People</p>
                                </div>
                            </div>
                        </div>

                        {/* Shared Files */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-shades-black">Shared Files</h3>
                                <button className="text-xs font-medium text-primary-01 hover:underline">View All</button>
                            </div>

                            <div className="space-y-3">
                                {selectedConversation.sharedFiles?.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-neutrals-01 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'}`}>
                                                {file.type === 'pdf' ? (
                                                    <span className="text-red-500 text-xs font-bold">PDF</span>
                                                ) : (
                                                    <span className="text-blue-500 text-xs font-bold">IMG</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-shades-black truncate max-w-[100px]">{file.name}</p>
                                                <p className="text-xs text-neutrals-06">{file.size} • {file.date}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 bg-primary-01 hover:bg-primary-02 rounded-full transition-colors flex-shrink-0">
                                            <Download size={14} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reschedule Button - Fixed at bottom */}
                    <div className="p-6 border-t border-neutrals-02">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-shades-black text-white rounded-xl font-medium hover:bg-neutrals-08 transition-colors">
                            <Calendar size={18} />
                            Reschedule Event
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Messages List View
    return (
        <div className="flex h-[calc(100vh-88px)] -m-6 overflow-hidden">
            {/* Messages List - Main Content */}
            <div className="flex-1 flex flex-col bg-neutrals-01 min-w-0">
                <div className="p-6 pb-4">
                    <h1 className="text-2xl font-bold text-shades-black mb-6">Messages</h1>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-shades-white rounded-full w-fit border border-neutrals-02">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-shades-black text-white'
                                    : 'text-neutrals-07 hover:bg-neutrals-01'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-4 space-y-3">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className="flex items-start gap-4 p-4 bg-shades-white rounded-2xl cursor-pointer hover:shadow-sm transition-all border border-neutrals-02"
                        >
                            <div className="relative flex-shrink-0">
                                {conversation.avatar ? (
                                    <Image
                                        src={conversation.avatar}
                                        alt={conversation.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-01/10 flex items-center justify-center text-lg font-semibold text-primary-01">
                                        {conversation.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                )}
                                {conversation.unread && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-semibold text-shades-black truncate">{conversation.name}</span>
                                        <span className="text-sm text-neutrals-06 flex-shrink-0">• {conversation.eventType}</span>
                                    </div>
                                    <span className="text-xs text-neutrals-06 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                                </div>
                                <p className="text-sm text-neutrals-07 truncate mb-2">{conversation.lastMessage}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {getStatusBadge(conversation.status)}
                                    {conversation.status === 'pending-quote' && (
                                        <button className="text-xs font-medium text-primary-01 hover:underline">
                                            Review Request
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Bookings Sidebar - Right */}
            <div className="w-[280px] flex-shrink-0 bg-shades-white p-6 hidden lg:block overflow-y-auto border-l border-neutrals-02">
                <h2 className="text-lg font-semibold text-shades-black mb-6">Recent Bookings</h2>

                <div className="space-y-4">
                    {MOCK_BOOKINGS.map((booking) => (
                        <div
                            key={booking.id}
                            onClick={() => {
                                // Find and open the conversation related to this booking
                                const conversation = findConversationByEventName(conversations, booking.eventName);
                                if (conversation) {
                                    setSelectedConversation(conversation);
                                }
                            }}
                            className="p-4 bg-accents-peach/20 rounded-xl border border-accents-peach/30 cursor-pointer hover:bg-accents-peach/30 transition-colors"
                        >
                            <span className="text-xs font-semibold text-primary-01">{booking.dateRange}</span>
                            <h3 className="text-sm font-semibold text-shades-black mt-1">{booking.eventName}</h3>
                            <p className="text-xs text-neutrals-06 mt-1">
                                {booking.guests} Guests • {booking.amount}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
