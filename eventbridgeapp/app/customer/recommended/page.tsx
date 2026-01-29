'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Vendor {
    id: string;
    businessName: string;
    category: string;
    location: string;
    availableDates: string;
    pricePerDay: string;
    rating: number;
    images: string[];
}

// Capitalize first letter of each word
function formatEventType(eventType: string): string {
    return eventType
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function RecommendedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventType = searchParams.get('event') || 'all';
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchVendors() {
            try {
                const response = await fetch(`/api/public/vendors/featured?category=${eventType}`);
                if (response.ok) {
                    const data = await response.json();
                    const fetchedVendors = Array.isArray(data) ? data : (data.services || data.data || []);
                    setVendors(fetchedVendors);
                }
            } catch (error) {
                console.error('Error fetching vendors:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchVendors();
    }, [eventType]);

    const toggleFavorite = (vendorId: string) => {
        setFavorites((prev) => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(vendorId)) {
                newFavorites.delete(vendorId);
            } else {
                newFavorites.add(vendorId);
            }
            return newFavorites;
        });
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center gap-3">
                <button onClick={() => router.back()} className="p-1 text-foreground">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-foreground">
                    Top recommended in {formatEventType(eventType)}
                </h1>
            </div>

            {/* Vendor List */}
            <div className="p-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-01"></div>
                    </div>
                ) : vendors.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-neutrals-06 text-lg">No vendors found for this category.</p>
                    </div>
                ) : (
                    vendors.map((vendor) => (
                        <div
                            key={vendor.id}
                            className="bg-white rounded-3xl shadow-sm border border-neutrals-03 overflow-hidden"
                        >
                            {/* Image Carousel */}
                            <div className="relative h-72 bg-neutrals-02">
                                {/* Heart Button */}
                                <button
                                    onClick={() => toggleFavorite(vendor.id)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95 transition-transform"
                                >
                                    <Heart
                                        className={cn(
                                            'transition-colors',
                                            favorites.has(vendor.id)
                                                ? 'text-primary-01 fill-primary-01'
                                                : 'text-neutrals-05'
                                        )}
                                        size={20}
                                    />
                                </button>

                                {vendor.images && vendor.images.length > 0 ? (
                                    <Image
                                        src={vendor.images[0]}
                                        alt={vendor.businessName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-01/20 to-primary-02/20 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary-01">
                                            {vendor.businessName?.[0] || 'V'}
                                        </span>
                                    </div>
                                )}

                                {/* Carousel Dots */}
                                {vendor.images && vendor.images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {vendor.images.slice(0, 4).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    'w-2 h-2 rounded-full',
                                                    idx === 0 ? 'bg-white' : 'bg-white/50'
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <Link href={`/customer/vendor-profile/${vendor.id}`} className="block p-5">
                                <h3 className="text-xl font-bold text-foreground mb-1">
                                    {vendor.businessName}
                                </h3>
                                <p className="text-neutrals-06 text-sm mb-1">
                                    {vendor.category} - {vendor.location}
                                </p>
                                <p className="text-neutrals-05 text-xs mb-2">
                                    {vendor.availableDates || 'Mon-Sun'}
                                </p>
                                <p className="text-foreground font-bold mb-2">
                                    UGX {vendor.pricePerDay} <span className="font-normal text-neutrals-06">/ package</span>
                                </p>
                                <div className="flex items-center gap-1">
                                    <span className="text-primary-01">★</span>
                                    <span className="text-sm font-medium text-foreground">
                                        {vendor.rating ? (vendor.rating / 10).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
