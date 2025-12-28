'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    TrendingUp,
    Calendar,
    Wallet,
    MessageSquare,
    Bell,
    Settings,
    LogOut,
    PlusCircle,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
    { name: 'Leads & Sales', href: '/vendor/leads', icon: TrendingUp },
    {
        name: 'Bookings',
        href: '/vendor/bookings',
        icon: Calendar,
        // This puts the Plus icon next to Bookings
        action: <PlusCircle size={18} className="text-gray-400" />
    },
    {
        name: 'Earnings',
        href: '/vendor/earnings',
        icon: Wallet,
        action: <ChevronDown size={18} className="text-gray-400" />
    },
];


export default function Sidebar() {
    const pathname = usePathname();
    const [messageBadge, setMessageBadge] = useState(2);
    const [notificationBadge, setNotificationBadge] = useState(2);

    // Handlers for badge clicks (optional, can be used later)
    // Badge click handlers removed (no longer needed)

    const secondaryNavigation = [
        { name: 'Messages', href: '/vendor/messages', icon: MessageSquare, badge: messageBadge },
        { name: 'Notifications', href: '/vendor/notifications', icon: Bell, badge: notificationBadge },
        { name: 'Settings', href: '/vendor/settings', icon: Settings },
        { name: 'Logout', href: '/', icon: LogOut },
    ];


    return (
        <div className="flex h-screen w-[288px] flex-col bg-[#222222] text-white shrink-0">
            {/*the first div contaings logo and links*/}
            <div className='flex flex-col h-full p-5'>
                {/*the logo*/}
                <div className='flex gap-2 items-center'>
                    <Image src="/logo.svg" alt="Logo" width={50} height={50} />
                    <h1 className='text-2xl font-bold'>EventBridge</h1>
                </div>

                {/*the links*/}
                <div className='flex flex-col gap-2 mt-5 flex-1'>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center justify-between gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary-01/10 transition-colors',
                                pathname === item.href ? 'bg-[rgba(255,112,67,0.4)] text-[#FF7043]' : 'text-gray-400'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </div>
                            {/* Renders the Plus icon for Bookings or Chevron for Earnings */}
                            {item.action && (
                                <div onClick={(e) => e.preventDefault()}>
                                    {item.action}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

            </div>

            <div className='flex flex-col gap-2 px-5 mt-auto'>
                {secondaryNavigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex items-center justify-between gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary-01/10 transition-colors',
                            pathname === item.href ? 'bg-[rgba(255,112,67,0.4)] text-[#FF7043]' : 'text-gray-400'
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </div>
                        {item.badge && (
                            <div
                                onClick={(e) => e.preventDefault()}
                                className='bg-[#FF6B4F] text-white flex flex-col items-center justify-center min-w-[20px] h-[20px] rounded-full px-[6px] py-[2px] text-[10px] font-bold'
                            >
                                {item.badge}
                            </div>
                        )}
                    </Link>
                ))}
                <div>
                    <div className='flex items-center gap-2 pb-5'>
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-600 bg-gray-700 shrink-0">
                            <img
                                src="/avatar.svg"
                                alt="DL"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = 'DL';
                                    e.currentTarget.parentElement!.style.display = 'flex';
                                    e.currentTarget.parentElement!.style.alignItems = 'center';
                                    e.currentTarget.parentElement!.style.justifyContent = 'center';
                                    e.currentTarget.parentElement!.style.fontSize = '12px';
                                }}
                            />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-[#FF7043] truncate">David Letterman</span>
                            <span className="text-xs text-gray-400 truncate">michaelsmith12@gmail.com</span>
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
}