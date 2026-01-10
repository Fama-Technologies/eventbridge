/**
 * ===========================================
 * MESSAGES DATA SERVICE
 * ===========================================
 * 
 * This file contains mock data and API functions for the messaging system.
 * 
 * TO SWITCH TO REAL API:
 * 1. Set USE_MOCK_DATA = false
 * 2. Update the API_BASE_URL to your actual API endpoint
 * 3. The functions will automatically use fetch() instead of mock data
 * 
 * ===========================================
 */

// ============================================
// CONFIGURATION - Change this to switch between mock and real API
// ============================================
export const USE_MOCK_DATA = true;
export const API_BASE_URL = '/api/vendor';

// ============================================
// TYPES
// ============================================
export interface MessageAttachment {
    type: 'image' | 'file' | 'audio';
    url: string;
    name?: string;
    size?: string;
}

export interface Message {
    id: string;
    conversationId?: string;
    content: string;
    timestamp: string;
    sender: 'user' | 'vendor';
    image?: string;
    attachments?: MessageAttachment[];
}

export interface SharedFile {
    name: string;
    size: string;
    date: string;
    type: 'pdf' | 'image';
    url?: string;
}

export interface EventDetails {
    date: string;
    time: string;
    venue: string;
    guests: number;
}

export interface Conversation {
    id: string;
    name: string;
    avatar: string;
    eventId?: string;
    eventName: string;
    eventType: string;
    lastMessage: string;
    timestamp: string;
    status: 'confirmed' | 'pending-quote' | 'unread';
    isVerified?: boolean;
    unread?: boolean;
    unreadCount?: number;
    eventDetails?: EventDetails;
    sharedFiles?: SharedFile[];
    messages: Message[];
}

export interface Booking {
    id: string;
    conversationId?: string; // Links booking to conversation
    dateRange: string;
    eventName: string;
    guests: number;
    amount: string;
}

// ============================================
// MOCK DATA
// ============================================
export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1',
        name: 'Sarah Jenkins',
        avatar: '/avatars/sarah.png',
        eventId: 'evt_001',
        eventName: "Sarah's Wedding",
        eventType: "Sarah's Wedding",
        lastMessage: 'Hello! Just wanted to confirm the floral arrangements for the main hall. Will you be using the peonies we...',
        timestamp: 'Oct 24, 02:45 PM',
        status: 'confirmed',
        isVerified: true,
        unreadCount: 0,
        eventDetails: {
            date: 'Oct 24, 2024',
            time: '04:00 PM',
            venue: 'Grand Regency Hall, Room 4B',
            guests: 150
        },
        sharedFiles: [
            { name: 'Floral_Proposal_v2....', size: '2.4 MB', date: 'Oct 15', type: 'pdf' },
            { name: 'Mood_Board_Ref.png', size: '1.1 MB', date: 'Today', type: 'image' }
        ],
        messages: [
            {
                id: 'm1',
                conversationId: 'conv-1',
                content: 'Hi David! We were just reviewing the floral proposal you sent last week. Everything looks amazing! We just had one question about the peonies.',
                timestamp: '02:45 PM',
                sender: 'user'
            },
            {
                id: 'm2',
                conversationId: 'conv-1',
                content: "Hello Sarah! I'm so glad to hear that. I'm happy to answer any questions. What would you like to know about the peonies?",
                timestamp: '02:48 PM',
                sender: 'vendor'
            },
            {
                id: 'm3',
                conversationId: 'conv-1',
                content: "We wanted to make sure they match this color palette we found. I've attached a photo for reference!",
                timestamp: '03:12 PM',
                sender: 'user',
                image: '/categories/gradient-sample.jpg'
            }
        ]
    },
    {
        id: 'conv-2',
        name: 'Tech Corp Mixer',
        avatar: '',
        eventId: 'evt_002',
        eventName: 'Tech Corp Mixer',
        eventType: 'Corporate Event',
        lastMessage: 'We have reviewed the initial quote and would like to request some changes to the catering menu...',
        timestamp: 'Nov 02, 10:15 AM',
        status: 'pending-quote',
        unreadCount: 1,
        eventDetails: {
            date: 'Dec 12, 2024',
            time: '06:00 PM',
            venue: 'Tech Hub Conference Center',
            guests: 500
        },
        sharedFiles: [],
        messages: [
            {
                id: 'm4',
                conversationId: 'conv-2',
                content: 'We have reviewed the initial quote and would like to request some changes to the catering menu...',
                timestamp: '10:15 AM',
                sender: 'user'
            }
        ]
    }
];

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        conversationId: 'conv-1', // Links to Sarah Jenkins conversation
        dateRange: 'NOV 24-26',
        eventName: "Sarah's Wedding",
        guests: 150,
        amount: 'UGX 4,500,000'
    },
    {
        id: 'b2',
        conversationId: 'conv-2', // Links to Tech Corp conversation
        dateRange: 'DEC 12',
        eventName: 'Corporate Gala',
        guests: 500,
        amount: 'UGX 450,000,000'
    }
];

// ============================================
// EMOJI DATA
// ============================================
export const EMOJI_CATEGORIES = [
    {
        name: 'Smileys',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐']
    },
    {
        name: 'Gestures',
        emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄']
    },
    {
        name: 'Hearts',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💋', '💌', '💐', '🌹', '🥀', '🌷', '🌸', '💮', '🏵️', '🌻', '🌼', '🌺']
    },
    {
        name: 'Celebration',
        emojis: ['🎉', '🎊', '🎈', '🎂', '🎁', '🎀', '🎗️', '🎟️', '🎫', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂']
    },
    {
        name: 'Objects',
        emojis: ['📱', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰']
    }
];

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
    if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_CONVERSATIONS;
    }

    const response = await fetch(`${API_BASE_URL}/conversations`);
    if (!response.ok) throw new Error('Failed to fetch conversations');
    const data = await response.json();
    return data.conversations;
}

/**
 * Fetch a single conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation | null> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_CONVERSATIONS.find(c => c.id === id) || null;
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.conversation;
}

/**
 * Fetch messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
        return conversation?.messages || [];
    }

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    const data = await response.json();
    return data.messages;
}

/**
 * Send a new message
 */
export async function sendMessage(
    conversationId: string,
    content: string,
    attachments?: File[]
): Promise<Message> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));

        const attachmentData: MessageAttachment[] = attachments?.map(file => ({
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file',
            url: URL.createObjectURL(file),
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
        })) || [];

        return {
            id: `m${Date.now()}`,
            conversationId,
            content,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sender: 'vendor',
            attachments: attachmentData
        };
    }

    const formData = new FormData();
    formData.append('content', content);
    attachments?.forEach(file => formData.append('attachments', file));

    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data.message;
}

/**
 * Fetch recent bookings
 */
export async function getRecentBookings(): Promise<Booking[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_BOOKINGS;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/recent`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const data = await response.json();
    return data.bookings;
}

/**
 * Find conversation by booking ID
 */
export async function getConversationByBookingId(bookingId: string): Promise<Conversation | null> {
    if (USE_MOCK_DATA) {
        const booking = MOCK_BOOKINGS.find(b => b.id === bookingId);
        if (!booking?.conversationId) return null;
        return MOCK_CONVERSATIONS.find(c => c.id === booking.conversationId) || null;
    }

    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/conversation`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.conversation;
}

/**
 * Find conversation by event name (for linking bookings to conversations)
 */
export function findConversationByEventName(
    conversations: Conversation[],
    eventName: string
): Conversation | null {
    return conversations.find(c =>
        c.eventName.toLowerCase().includes(eventName.toLowerCase()) ||
        eventName.toLowerCase().includes(c.eventName.toLowerCase())
    ) || null;
}

/**
 * Upload files and get URLs
 */
export async function uploadFiles(files: File[]): Promise<string[]> {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return files.map(file => URL.createObjectURL(file));
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error('Failed to upload files');
    const data = await response.json();
    return data.urls;
}

/**
 * Filter conversations by tab
 */
export function filterConversationsByTab(
    conversations: Conversation[],
    tab: string
): Conversation[] {
    switch (tab) {
        case 'unread':
            return conversations.filter(c => c.unread || (c.unreadCount && c.unreadCount > 0));
        case 'bookings':
            return conversations.filter(c => c.status === 'confirmed');
        case 'quotes':
            return conversations.filter(c => c.status === 'pending-quote');
        default:
            return conversations;
    }
}
