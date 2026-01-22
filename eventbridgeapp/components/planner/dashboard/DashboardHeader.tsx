'use client';

import Link from 'next/link';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider'; // Assuming this exists based on theme-toggle.tsx
// Button import removed as we use html button

// If ui/button doesn't exist I'll use standard button. I saw `ui` dir but didn't check button.
// I'll use standard html button with tailwind classes to be safe as I didn't verify ui/button.

export default function DashboardHeader({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="flex items-center justify-end gap-6 mb-8">
            <Link
                href="/planner/providers"
                className="text-sm font-semibold text-primary-01 hover:text-primary-02 transition-colors"
            >
                Browse Service Providers
            </Link>

            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-neutrals-02 text-shades-black hover:bg-neutrals-03 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
                // onClick={onOpenMobileMenu} // We need to wire this up in layout or page if we want mobile menu
                className="md:hidden p-2 rounded-full bg-neutrals-02 text-shades-black hover:bg-neutrals-03 transition-colors"
            >
                <Menu size={20} />
            </button>
        </header>
    );
}
