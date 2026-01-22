'use client';

import { ArrowRight, MapPin } from 'lucide-react';

export default function DashboardBanner() {
    return (
        <div className="relative w-full h-[280px] rounded-3xl overflow-hidden mb-10 group">
            {/* Background Image / Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop")' }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-8 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold tracking-wider mb-3 uppercase">
                            Next Landmark Event
                        </div>
                        <h2 className="text-4xl font-bold mb-2">Wedding Reception</h2>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <MapPin size={16} />
                            <span>Grand Ballroom, Fairmont Hotel</span>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 bg-white text-shades-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl active:scale-95">
                        Manage Event
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold tracking-tight">145</span>
                        <span className="text-sm font-bold tracking-widest uppercase opacity-80 mb-2">Days to go</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
