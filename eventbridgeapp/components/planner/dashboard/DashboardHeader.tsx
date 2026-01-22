'use client';

import Link from 'next/link';
import { Menu, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="bg-shades-white px-6 py-4 border-b border-neutrals-03 transition-colors duration-300 shadow-sm relative z-20">
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
                    <Link
                        href="/planner/providers"
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-primary-01 hover:bg-primary-01/10 transition-colors"
                    >
                        Browse Service Providers
                    </Link>

                    {/* Language Toggle (Matching Vendor) */}
                    <button
                        className="w-10 h-10 rounded-full border border-neutrals-03 flex items-center justify-center text-neutrals-06 transition-all duration-200 hover:text-primary-01 hover:border-primary-01 hover:bg-primary-01/5"
                        aria-label="Language"
                    >
                        <Globe size={20} />
                    </button>

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
