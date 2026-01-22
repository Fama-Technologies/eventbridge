'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    ListTodo,
    Calculator,
    FileText,
    Heart,
    LogOut,
    Settings,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { signOut } from 'next-auth/react';

const navigation = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Events', href: '/customer/events', icon: Calendar },
    { name: 'Checklist', href: '/customer/checklist', icon: ListTodo },
    { name: 'Budget Tracker', href: '/customer/budget', icon: Calculator },
    { name: 'Bookings & Quotes', href: '/customer/bookings', icon: FileText },
    { name: 'Favorites', href: '/customer/favorites', icon: Heart },
];

export default function PlannerSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession(); // Access session data
    const [messageBadge, setMessageBadge] = useState(3); // Mocked for now based on screenshot

    const user = session?.user; // Use session user

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await signOut({ callbackUrl: '/login' });
    };

    const secondaryNavigation = [
        { name: 'Messages', href: '/customer/messages', icon: MessageSquare, badge: messageBadge },
        { name: 'Settings', href: '/customer/settings', icon: Settings },
        { name: 'Logout', href: '#', icon: LogOut, onClick: handleLogout },
    ];

    return (
        <div className="flex h-screen w-[250px] flex-col bg-shades-white text-shades-black shrink-0 border-r border-neutrals-03 transition-colors duration-300">
            {/* Logo Section - Fixed at top */}
            <div className='flex gap-2 items-center p-5 pb-6 shrink-0 border-b border-neutrals-02'>
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                <div className="flex flex-col">
                    <h1 className='text-xl font-bold text-shades-black leading-tight'>Event Bridge</h1>
                </div>
            </div>

            {/* Scrollable Middle Section */}
            <div className='flex-1 overflow-y-auto'>
                {/* Main Navigation */}
                <div className='flex flex-col gap-1 px-3 py-3'>
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center justify-between gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm',
                                pathname.startsWith(item.href)
                                    ? 'bg-primary-01/10 text-primary-01'
                                    : 'text-shades-black hover:bg-neutrals-02'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Secondary Navigation */}
                <div className='flex flex-col gap-1 px-3 pb-4 mt-auto'>
                    {secondaryNavigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={item.onClick}
                            className={cn(
                                'flex items-center justify-between gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm',
                                pathname === item.href
                                    ? 'bg-primary-01/10 text-primary-01'
                                    : 'text-shades-black hover:bg-neutrals-02'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </div>
                            {(item as any).badge && (
                                <div className='bg-primary-01 text-white flex items-center justify-center min-w-[20px] h-[20px] rounded-full px-1.5 text-[10px] font-semibold'>
                                    {(item as any).badge}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Profile - Fixed at bottom */}
            <div className='shrink-0 px-3 pb-5 border-t border-neutrals-02'>
                <div className='px-4 py-4 border border-neutrals-03 rounded-xl mt-3 flex items-center gap-3'>
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-neutrals-02 shrink-0 flex items-center justify-center text-sm font-semibold text-shades-black relative">
                        {user?.image ? (
                            <Image
                                src={user.image}
                                alt={user.name || 'User'}
                                width={40}
                                height={40}
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-01 text-white font-bold">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-shades-black truncate">
                                {user?.name || 'Loading...'}
                            </span>
                        </div>
                        <span className="text-[10px] text-primary-01 font-semibold bg-primary-01/10 px-2 py-0.5 rounded w-fit">
                            {user?.accountType || 'PLANNER'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
