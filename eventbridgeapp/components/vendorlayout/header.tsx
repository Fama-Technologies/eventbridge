'use client';

import Link from 'next/link';
import { Globe, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/providers/theme-provider';

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
        <header className="bg-[#222222] dark:bg-[#1E1E1E] px-6 py-4 border-b border-neutrals-04 dark:border-[#2C2C2C]">
            <div className="flex items-center justify-between md:justify-end gap-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onOpenMobileMenu}
                    className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors"
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
                        <span>View as Customer</span>
                    </Link>

                    {/* Language Toggle */}
                    <button
                        className="w-10 h-10 rounded-full border border-neutrals-04 dark:border-[#2C2C2C] flex items-center justify-center text-[#FFFFFF] dark:text-gray-400 transition-all duration-200 hover:text-primary-01 hover:border-primary-01"
                        aria-label="Language"
                    >
                        <Globe size={20} />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full border border-neutrals-04 dark:border-[#2C2C2C] flex items-center justify-center text-[#FFFFFF] dark:text-gray-400 transition-all duration-300 hover:text-primary-01 hover:border-primary-01"
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
                                <Moon
                                    size={20}
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