'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import VendorHeader from '@/components/vendorlayout/header';
import Sidebar from '@/components/vendorlayout/sidebar';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[288px] flex-col flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Sidebar Panel */}
                    <div className="fixed inset-y-0 left-0 w-[288px] bg-[#222222] shadow-xl animate-in slide-in-from-left duration-300">
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-white hover:bg-white/10 rounded-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <VendorHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-[#1A1A1A]">
                    {children}
                </main>
            </div>
        </div>
    );
}
