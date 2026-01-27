'use client';

import { useState } from 'react';
import { ArrowLeft, Heart, Search, Star, MessageSquare, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Mock data for favourites
const mockFavourites = [
    {
        id: '1',
        name: 'Royal Touch Décor',
        category: 'Event Décor & Styling',
        location: 'Kampala',
        price: '1,200,000',
        unit: 'event',
        rating: 4.91,
        image: '/images/royal-touch-decor.jpg', // Placeholder
        isFeatured: true,
    },
    {
        id: '2',
        name: 'Echo Beats Entertainment',
        category: 'DJ & Sound System',
        location: 'Kampala',
        price: '600,000',
        unit: 'day',
        rating: 4.8,
        image: '/images/echo-beats.jpg', // Placeholder
        isFeatured: false,
    },
];

export default function SavedPage() {
    const router = useRouter();
    const [favourites, setFavourites] = useState(mockFavourites);

    // Toggle empty state for demonstration if needed, or just handle empty array
    const isEmpty = favourites.length === 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-1 text-foreground">
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">Favourites</h1>
                    <Heart className="text-primary-01 fill-primary-01" size={20} />
                </div>

                <button className="p-1 text-foreground">
                    <Search size={24} />
                </button>
            </div>

            {isEmpty ? (
                // Empty State (Image 2)
                <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                    <div className="relative mb-8">
                        <div className="w-40 h-40 bg-primary-01/10 rounded-full flex items-center justify-center">
                            <Heart className="w-20 h-20 text-primary-01" strokeWidth={1.5} />
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary-01/30 rounded-full" />
                        <div className="absolute bottom-4 left-2 w-6 h-6 bg-primary-01/20 rounded-full" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-3">No favourite vendors yet</h2>
                    <p className="text-neutrals-06 mb-8 max-w-xs mx-auto">
                        Start exploring to build you dream event team. Save the ones you like here!
                    </p>

                    <Link
                        href="/customer/dashboard"
                        className="bg-primary-01 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-02 transition-colors shadow-lg shadow-primary-01/20"
                    >
                        Browse Vendors
                    </Link>
                </div>
            ) : (
                // List State (Image 1)
                <div className="p-4 space-y-6">
                    {favourites.map((vendor) => (
                        <div key={vendor.id} className="bg-white rounded-[2rem] shadow-sm border border-neutrals-03 overflow-hidden mb-6">
                            {/* Image Section */}
                            <div className="relative h-72 bg-neutrals-02">
                                {/* Featured Badge */}
                                {vendor.isFeatured && (
                                    <span className="absolute bottom-4 left-4 bg-white text-primary-01 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-widest shadow-sm">
                                        Featured
                                    </span>
                                )}

                                {/* Heart Button */}
                                <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95 transition-transform">
                                    <Heart className="text-primary-01" size={20} />
                                </button>

                                <img
                                    src={vendor.image}
                                    alt={vendor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000&auto=format&fit=crop'; // Fallback
                                    }}
                                />
                            </div>

                            {/* Content Section */}
                            <div className="p-5 pt-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">{vendor.name}</h3>
                                    <div className="flex items-center gap-1.5 bg-neutrals-02 px-2.5 py-1 rounded-lg shrink-0 mt-1">
                                        <Star size={11} className="text-primary-01 fill-current" />
                                        <span className="text-xs font-bold text-foreground">{vendor.rating}</span>
                                    </div>
                                </div>

                                <p className="text-neutrals-06 text-sm mb-4 font-medium">
                                    {vendor.category} • {vendor.location}
                                </p>

                                <div className="flex items-baseline gap-1 mb-5">
                                    <span className="text-lg font-bold text-foreground">UGX {vendor.price}</span>
                                    <span className="text-sm text-neutrals-06 font-normal">/ {vendor.unit}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-6 py-3 rounded-full text-sm transition-colors min-w-[100px]">
                                        <MessageSquare size={16} strokeWidth={2.5} />
                                        Chat
                                    </button>
                                    <button className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-5 py-3 rounded-full text-sm transition-colors">
                                        <div className="w-4 h-4 rounded-full border border-foreground flex items-center justify-center">
                                            <Plus size={10} strokeWidth={3} />
                                        </div>
                                        Add to Event
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
