"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, MessageSquare, Info, CheckCircle2, Loader2, Check } from "lucide-react";
import { format } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string; // ISO string or relative time
    isRead: boolean;
    type: 'booking' | 'message' | 'system' | 'payment';
    link?: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        async function fetchNotifications() {
            setIsLoading(true);
            try {
                const response = await fetch('/api/vendor/notifications');
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || (Array.isArray(data) ? data : []));
                } else {
                    // Fallback for demo if API fails/doesn't exist yet
                    console.warn("API not ready, using empty state");
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            await fetch(`/api/vendor/notifications/${id}/read`, { method: 'POST' });
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        try {
            await fetch(`/api/vendor/notifications/read-all`, { method: 'POST' });
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.isRead;
        return true;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar className="text-primary-01" size={20} />;
            case 'message': return <MessageSquare className="text-blue-500" size={20} />;
            case 'payment': return <CheckCircle2 className="text-green-500" size={20} />;
            default: return <Info className="text-neutrals-06" size={20} />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-shades-black">Notifications</h1>
                    <p className="text-neutrals-06 mt-1">Stay updated with your latest activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-neutrals-01 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-shades-white shadow-sm text-shades-black' : 'text-neutrals-06 hover:text-shades-black'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${filter === 'unread' ? 'bg-shades-white shadow-sm text-shades-black' : 'text-neutrals-06 hover:text-shades-black'}`}
                        >
                            Unread
                        </button>
                    </div>
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm font-medium text-primary-01 hover:text-primary-02 px-3 py-2"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-primary-01 h-8 w-8" />
                </div>
            ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-5 rounded-xl border transition-all hover:shadow-sm flex gap-4 ${notification.isRead ? 'bg-shades-white border-neutrals-02' : 'bg-primary-01/5 border-primary-01/20'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.isRead ? 'bg-neutrals-01' : 'bg-shades-white'}`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className={`text-base font-semibold truncate ${notification.isRead ? 'text-shades-black' : 'text-primary-01'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-neutrals-06 whitespace-nowrap">{notification.timestamp}</span>
                                </div>
                                <p className="text-sm text-neutrals-06 mt-1 line-clamp-2">{notification.message}</p>
                            </div>
                            {!notification.isRead && (
                                <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-2 text-neutrals-04 hover:text-primary-01 transition-colors self-center"
                                    title="Mark as read"
                                >
                                    <Check size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-neutrals-01 rounded-2xl border border-dashed border-neutrals-03">
                    <Bell className="mx-auto text-neutrals-04 mb-4" size={40} />
                    <h3 className="text-lg font-semibold text-shades-black">No notifications using this filter</h3>
                    <p className="text-neutrals-06 mt-1">You're all caught up!</p>
                </div>
            )}
        </div>
    );
}