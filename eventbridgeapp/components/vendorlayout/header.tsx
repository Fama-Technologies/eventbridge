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
                    <Link
                        href="/"
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-primary-01 hover:bg-primary-01/10 transition-colors"
                    >
                        <span>View profile as Customer</span>
                    </Link>

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

                        {/* Advanced Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-14 w-[360px] bg-white border border-neutrals-03 rounded-xl shadow-xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Header & Tabs */}
                                <div className="px-4 pt-4 pb-0 bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-shades-black">Notifications</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleMarkAsRead()} className="text-primary-01 hover:bg-primary-01/10 p-1.5 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </button>
                                            <button className="text-neutrals-06 hover:bg-neutrals-02 p-1.5 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 border-b border-neutrals-02">
                                        {(['all', 'unread', 'archived'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`pb-3 px-1 text-sm font-medium capitalize relative ${activeTab === tab
                                                        ? 'text-shades-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-shades-black'
                                                        : 'text-neutrals-06 hover:text-shades-black'
                                                    }`}
                                            >
                                                {tab}
                                                {tab === 'all' && <span className="ml-1.5 bg-shades-black text-white px-1.5 py-0.5 text-[10px] rounded-md">{notifications.length}</span>}
                                                {tab === 'unread' && unreadCount > 0 && <span className="ml-1.5 bg-primary-01/10 text-primary-01 px-1.5 py-0.5 text-[10px] rounded-md">{unreadCount}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="overflow-y-auto max-h-[400px] bg-[#F9FAFB]">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-neutrals-06 text-sm">No notifications found</p>
                                        </div>
                                    ) : (
                                        filteredNotifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 border-b border-neutrals-02 hover:bg-white transition-colors cursor-pointer group flex gap-3 ${!notif.isRead ? 'bg-white' : 'bg-[#F9FAFB]/50'}`}
                                                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                            >
                                                <div className="flex-none">
                                                    {notif.sender?.avatar ? (
                                                        <img src={notif.sender.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary-01/10 flex items-center justify-center text-primary-01">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v10zM6 17v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"></path></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-shades-black">
                                                        <span className="font-semibold">{notif.sender?.name || 'System'}</span> {notif.title}
                                                    </p>
                                                    <p className="text-xs text-neutrals-06 mt-1">{notif.message}</p>

                                                    {notif.content && (
                                                        <div className="mt-3 p-3 bg-white border border-neutrals-02 rounded-lg text-sm text-neutrals-06">
                                                            {notif.content}
                                                        </div>
                                                    )}

                                                    {notif.actions && notif.actions.length > 0 && (
                                                        <div className="flex gap-2 mt-3">
                                                            {notif.actions.map((action: string) => (
                                                                <button
                                                                    key={action}
                                                                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${action === 'Accept' || action === 'Reply'
                                                                            ? 'bg-shades-black text-white hover:bg-shades-black/90'
                                                                            : 'bg-white border border-neutrals-03 text-shades-black hover:bg-neutrals-02'
                                                                        }`}
                                                                >
                                                                    {action}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="flex-none pt-2">
                                                        <div className="w-2.5 h-2.5 bg-primary-01 rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-neutrals-02 bg-white text-center">
                                    <button className="text-sm font-semibold text-shades-black hover:underline">
                                        View all
                                    </button>
                                </div>
                            </div>
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