'use client';

import Link from 'next/link';
import { Globe, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/theme-provider';
import Image from 'next/image';

interface VendorHeaderProps {
    onOpenMobileMenu?: () => void;
}

export default function VendorHeader({ onOpenMobileMenu }: VendorHeaderProps) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme: updateTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        updateTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    // Notification state
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch('/api/vendor/notifications');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        }
        if (mounted) fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [mounted]);

    const handleMarkAsRead = async (id?: number) => {
        try {
            await fetch('/api/vendor/notifications', {
                method: 'PATCH',
                body: JSON.stringify({ id }),
            });
            // Optimistic update
            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    // Active tab state
    const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.isRead;
        if (activeTab === 'archived') return n.status === 'archived'; // Using mock status or inference
        return true;
    });

    return (
        <header className="bg-shades-white px-6 py-4 border-b border-neutrals-03 transition-colors duration-300 shadow-sm relative z-20">
            <div className="flex items-center justify-between md:justify-end gap-4">
                {/* ... Mobile Menu Toggle ... */}
                <button
                    onClick={onOpenMobileMenu}
                    className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-shades-black hover:bg-neutrals-02 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* View as Customer Link */}


                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 
                                ${showNotifications ? 'bg-primary-01 text-white shadow-md' : 'border border-neutrals-03 text-neutrals-06 hover:text-primary-01 hover:border-primary-01 hover:bg-primary-01/5'}`}
                            aria-label="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            {/* ion:notifications Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M256 480a80.09 80.09 0 0 0 73.3-48H182.7a80.09 80.09 0 0 0 73.3 48m144-192v-80c0-59.6-35.8-111-88-125V64a56 56 0 0 0-112 0v19c-52.2 14-88 65.4-88 125v80l-32 32v16h352v-16z" />
                            </svg>

                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5630] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Sheet Overlay & Panel */}
                        {showNotifications && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
                                    onClick={() => setShowNotifications(false)}
                                />

                                {/* Sheet from Right (Minimals Style) */}
                                <div className="fixed top-0 right-0 bottom-0 h-screen w-full sm:w-[420px] bg-background shadow-2xl z-50 animate-in slide-in-from-right duration-300 flex flex-col border-l border-border">
                                    {/* Header */}
                                    <div className="px-6 py-5 border-b border-dashed border-border flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-foreground">Notifications</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">You have {notifications.length} unread messages</p>
                                        </div>

                                        {unreadCount > 0 && (
                                            <button
                                                onClick={() => handleMarkAsRead()}
                                                className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                                                title="Mark all as read"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    <div className="px-6 flex gap-8 border-b border-dashed border-border">
                                        {(['all', 'unread', 'archived'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`py-4 text-sm font-semibold capitalize relative transition-all ${activeTab === tab
                                                    ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-foreground'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {tab}
                                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[11px] font-bold ${activeTab === tab
                                                    ? 'bg-foreground text-background'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-accent'
                                                    }`}>
                                                    {tab === 'all' ? notifications.length : tab === 'unread' ? unreadCount : 0}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredNotifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10zM6 17v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"></path></svg>
                                                </div>
                                                <h4 className="text-foreground font-semibold">No notifications</h4>
                                                <p className="text-muted-foreground text-sm mt-1">You have no {activeTab} notifications</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-dashed divide-border">
                                                {filteredNotifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-5 hover:bg-accent/50 transition-all cursor-pointer group flex gap-4 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                                        onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                                    >
                                                        <div className="flex-none pt-1">
                                                            {notif.sender?.avatar ? (
                                                                <img src={notif.sender.avatar} alt="" className="w-12 h-12 rounded-full object-cover shadow-sm bg-background p-0.5 border border-border" />
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10zM6 17v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"></path></svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-1">
                                                                <p className="text-sm text-foreground">
                                                                    <span className="font-bold">{notif.sender?.name || 'System'}</span>
                                                                    <span className="text-muted-foreground font-normal"> {notif.title}</span>
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                                {notif.message.includes('ago') ? notif.message : '2 hours ago'}
                                                            </p>

                                                            {notif.content && (
                                                                <div className="mt-2 p-3 bg-card border border-border rounded-lg text-xs text-muted-foreground font-medium">
                                                                    {notif.content}
                                                                </div>
                                                            )}

                                                            {notif.actions && notif.actions.length > 0 && (
                                                                <div className="flex gap-2 mt-3">
                                                                    {notif.actions.map((action: string) => (
                                                                        <button
                                                                            key={action}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                            }}
                                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${action === 'Accept' || action === 'Reply'
                                                                                ? 'bg-foreground text-background shadow-sm hover:opacity-90'
                                                                                : 'bg-background border border-border text-foreground hover:bg-accent'
                                                                                }`}
                                                                        >
                                                                            {action}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {!notif.isRead && (
                                                            <div className="flex-none self-center">
                                                                <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 border-t border-dashed border-border bg-background text-center">
                                        <Link href="/vendor/notifications" className="block w-full py-2.5 rounded-lg bg-muted text-sm font-bold text-foreground hover:bg-accent transition-colors">
                                            View All
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Language Toggle */}
                    <button
                        className="w-10 h-10 rounded-full border border-neutrals-03 flex items-center justify-center text-neutrals-06 transition-all duration-200 hover:text-primary-01 hover:border-primary-01 hover:bg-primary-01/5"
                        aria-label="Language"
                    >
                        <Globe size={20} />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full border border-neutrals-03 flex items-center justify-center text-neutrals-06 transition-all duration-300 hover:text-primary-01 hover:border-primary-01 hover:bg-primary-01/5"
                        aria-label="Toggle theme"
                    >
                        {mounted && (
                            <div className="relative w-5 h-5">
                                <Sun
                                    size={20}
                                    className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'dark'
                                        ? 'rotate-0 scale-100 opacity-100'
                                        : 'rotate-90 scale-0 opacity-0'
                                        }`}
                                />
                                <Image src="/icons/moon_black.svg"
                                    alt="Dark mode"
                                    width={20}
                                    height={20}
                                    className={`absolute inset-0 transition-all duration-500 ${resolvedTheme === 'light'
                                        ? 'rotate-0 scale-100 opacity-100'
                                        : '-rotate-90 scale-0 opacity-0'
                                        }`}
                                />
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}