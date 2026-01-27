'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Calendar, User, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Home',
            icon: Home,
            href: '/customer/dashboard',
            active: pathname === '/customer/dashboard' || pathname === '/customer/landingpage',
        },
        {
            label: 'Saved',
            icon: Heart,
            href: '/customer/saved',
            active: pathname.includes('/customer/saved'),
        },
        {
            label: 'Bookings',
            icon: Calendar,
            href: '/customer/bookings',
            active: pathname.includes('/customer/bookings'),
        },
        {
            label: 'Chat',
            icon: MessageSquare,
            href: '/customer/chat',
            active: pathname.includes('/customer/chat'),
        },
        {
            label: 'Profile',
            icon: User,
            href: '/customer/profile',
            active: pathname.includes('/customer/profile'),
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-shades-white border-t border-neutrals-03 pb-safe-area-inset-bottom z-50">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                            item.active
                                ? "text-primary-01"
                                : "text-neutrals-06 hover:text-neutrals-07"
                        )}
                    >
                        <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
