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

    return (
        <header className="bg-shades-white px-6 py-4 border-b border-neutrals-03 transition-colors duration-300 shadow-sm">
            <div className="flex items-center justify-between md:justify-end gap-4">
                {/* Mobile Menu Toggle */}
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
                    <button
                        className="relative w-10 h-10 rounded-full border border-neutrals-03 flex items-center justify-center text-neutrals-06 transition-all duration-200 hover:text-primary-01 hover:border-primary-01 hover:bg-primary-01/5"
                        aria-label="Notifications"
                        onClick={() => {
                            // Simple toast for verification
                            // In a real app, this would open a dropdown
                            import('sonner').then(mod => mod.toast.info('No new notifications'));
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

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