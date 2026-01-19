'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    TrendingUp,
    Calendar,
    Wallet,
    MessageSquare,
    Settings,
    LogOut,
    PlusCircle,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const navigation = [
    { name: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
    { name: 'Leads', href: '/vendor/leads', icon: TrendingUp },
    {
        name: 'Bookings',
        href: '/vendor/bookings',
        icon: Calendar,
        action: <PlusCircle size={18} className="text-neutrals-05" />
    },
    {
        name: 'Earnings',
        href: '/vendor/earnings',
        icon: Wallet,
        hasSubmenu: true,
        action: <ChevronDown size={18} className="text-neutrals-05" />,
        submenu: [
            { name: 'Overview', href: '/vendor/earnings' },
            { name: 'Transaction History', href: '/vendor/earnings/history' },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [messageBadge, setMessageBadge] = useState(0);
    const [earningsExpanded, setEarningsExpanded] = useState(false);
    const [user, setUser] = useState<{ firstName: string; lastName: string; email: string; image?: string } | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch User
                const userRes = await fetch('/api/users/me');
                if (userRes.ok) {
                    const data = await userRes.json();
                    setUser(data);
                }

                // Fetch Unread Messages Count
                const msgRes = await fetch('/api/vendor/conversations');
                if (msgRes.ok) {
                    const data = await msgRes.json();
                    const convs = data.conversations || [];
                    // Count unread conversations or sum unread messages
                    // For now, assuming simply counting conversations with unread=true
                    const unreadCount = convs.filter((c: any) => c.unread).length;
                    setMessageBadge(unreadCount);
                }
            } catch (error) {
                console.error('Failed to fetch sidebar data', error);
            }
        }
        fetchData();
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/logout', { method: 'POST' });
            toast.success('Logged out successfully');
            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        } catch (error) {
            console.error('Logout failed', error);
            toast.error('Logout failed');
        }
    };

    const secondaryNavigation = [
        { name: 'Messages', href: '/vendor/messages', icon: MessageSquare, badge: messageBadge },
        { name: 'Settings', href: '/vendor/settings', icon: Settings },
        { name: 'Logout', href: '#', icon: LogOut, onClick: handleLogout },
    ];

    return (
        <div className="flex h-screen w-[250px] flex-col bg-shades-white text-shades-black shrink-0 border-r border-neutrals-03 transition-colors duration-300">
            {/* Logo Section - Fixed at top */}
            <div className='flex gap-2 items-center p-5 pb-6 shrink-0 border-b border-neutrals-02'>
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                <div className="flex flex-col">
                    <h1 className='text-xl font-bold text-shades-black leading-tight'>Event Bridge</h1>
                    <span className="text-[10px] font-semibold text-white bg-primary-01 px-2 py-0.5 rounded-full w-fit shadow-[0px_4px_30px_0px_var(--primary012)]">FREE PLAN</span>
                </div>
            </div>

            {/* Scrollable Middle Section */}
            <div className='flex-1 overflow-y-auto'>
                {/* Main Navigation */}
                <div className='flex flex-col gap-1 px-3 py-3'>
                    {navigation.map((item) => (
                        <div key={item.name}>
                            {item.hasSubmenu ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setEarningsExpanded(!earningsExpanded)}
                                        className={cn(
                                            'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm',
                                            pathname.startsWith(item.href)
                                                ? 'bg-[#FFD7C9] text-primary-01'
                                                : 'text-shades-black hover:bg-neutrals-02'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={20} />
                                            <span>{item.name}</span>
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={cn(
                                                "text-neutrals-06 transition-transform duration-200",
                                                earningsExpanded && "rotate-180"
                                            )}
                                        />
                                    </button>

                                    {/* Submenu */}
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-300 ease-in-out pl-9 space-y-1",
                                        earningsExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                        {item.submenu?.map((subItem) => (
                                            <Link
                                                key={subItem.name}
                                                href={subItem.href}
                                                className={cn(
                                                    'block px-4 py-2 rounded-lg text-sm transition-colors',
                                                    pathname === subItem.href
                                                        ? 'text-primary-01 font-semibold bg-primary-01/5'
                                                        : 'text-neutrals-06 hover:text-shades-black hover:bg-neutrals-02'
                                                )}
                                            >
                                                {subItem.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'flex items-center justify-between gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm',
                                        pathname === item.href
                                            ? 'bg-[#FFD7C9] text-primary-01'
                                            : 'text-shades-black hover:bg-neutrals-02'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span>{item.name}</span>
                                    </div>
                                    {item.action && !item.hasSubmenu && (
                                        <div onClick={(e) => e.preventDefault()}>
                                            {item.action}
                                        </div>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Upgrade Card */}
                <div className="px-3 py-4">
                    <div className="bg-primary-01 rounded-2xl p-4 text-white shadow-[0px_1.79px_3.58px_-1.79px_#0000001A,0px_3.58px_5.37px_-0.9px_#0000001A]">
                        <div className="flex gap-2 items-center mb-2">
                            <Image src="/logo.svg" alt="Logo" width={28} height={28} className="brightness-0 invert" />
                            <span className="font-bold text-sm">Event Bridge</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">PRO</span>
                        <p className="text-xs mt-3 opacity-90 leading-relaxed">
                            Upgrade now and unlock more exclusive features
                        </p>
                        <Link
                            href="/vendor/upgrade"
                            className="mt-3 block w-full bg-white text-primary-01 font-semibold text-xs py-2 px-4 rounded-full hover:bg-white/90 transition-colors text-center"
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>

                {/* Secondary Navigation - Messages, Settings, Logout */}
                <div className='flex flex-col gap-1 px-3 pb-4'>
                    {secondaryNavigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={item.onClick}
                            className={cn(
                                'flex items-center justify-between gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm',
                                pathname === item.href
                                    ? 'bg-[#FFD7C9] text-primary-01'
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
                <div className='px-4 py-4'>
                    <div className='flex items-center gap-3'>
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutrals-02 shrink-0 flex items-center justify-center text-sm font-semibold text-shades-black">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt="User"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerText = user?.firstName?.charAt(0) || 'U';
                                    }}
                                />
                            ) : (
                                <span>{user?.firstName?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <div className="flex flex-col overflow-hidden flex-1">
                            <span className="text-sm font-semibold text-primary-01 truncate">
                                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                            </span>
                            <span className="text-xs text-neutrals-06 truncate">{user?.email || ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}