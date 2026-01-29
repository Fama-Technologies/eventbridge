'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Search, Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Favorite {
    id: number;
    vendorId: number;
    createdAt: string;
    vendor: {
        id: number;
        businessName: string | null;
        description: string | null;
        city: string | null;
        rating: number | null;
        reviewCount: number | null;
        profileImage: string | null;
        coverImage: string | null;
        isVerified: boolean | null;
    };
    category: {
        id: number;
        name: string;
    } | null;
    startingPrice: number | null;
}

export default function SavedPage() {
    const router = useRouter();
    const [favourites, setFavourites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/customer/favorites');
            const data = await response.json();

            if (data.success) {
                setFavourites(data.favorites);
            } else {
                setError(data.error || 'Failed to load favorites');
            }
        } catch (err) {
            setError('Failed to load favorites');
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (vendorId: number) => {
        try {
            const response = await fetch(`/api/customer/favorites?vendorId=${vendorId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setFavourites((prev) => prev.filter((f) => f.vendorId !== vendorId));
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    const formatPrice = (price: number | null) => {
        if (!price) return null;
        return new Intl.NumberFormat('en-UG').format(price);
    };

    const isEmpty = favourites.length === 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-01" />
            </div>
        );
    }

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

            {error ? (
                <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={fetchFavorites}
                        className="bg-primary-01 text-white px-6 py-2 rounded-full font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            ) : isEmpty ? (
                // Empty State
                <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
                    <div className="relative mb-8">
                        <div className="w-40 h-40 bg-primary-01/10 rounded-full flex items-center justify-center">
                            <Heart className="w-20 h-20 text-primary-01" strokeWidth={1.5} />
                        </div>
                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary-01/30 rounded-full" />
                        <div className="absolute bottom-4 left-2 w-6 h-6 bg-blue-200 rounded-full" />
                    </div>

                    <h2 className="text-2xl font-bold text-foreground mb-3">No favourite vendors yet</h2>
                    <p className="text-neutrals-06 mb-8 max-w-xs mx-auto">
                        Start exploring to build your dream event team. Save the ones you like here!
                    </p>

                    <Link
                        href="/customer/dashboard"
                        className="bg-primary-01 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-02 transition-colors shadow-lg shadow-primary-01/20"
                    >
                        Browse Vendors
                    </Link>
                </div>
            ) : (
                // List State
                <div className="p-4 space-y-6">
                    {favourites.map((fav) => (
                        <div key={fav.id} className="bg-white rounded-[2rem] shadow-sm border border-neutrals-03 overflow-hidden mb-6">
                            {/* Image Section */}
                            <div className="relative h-72 bg-neutrals-02">
                                {/* Featured Badge */}
                                {fav.vendor.isVerified && (
                                    <span className="absolute bottom-4 left-4 bg-white text-primary-01 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-widest shadow-sm">
                                        Featured
                                    </span>
                                )}

                                {/* Heart Button */}
                                <button
                                    onClick={() => removeFavorite(fav.vendorId)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95 transition-transform"
                                >
                                    <Heart className="text-primary-01 fill-primary-01" size={20} />
                                </button>

                                {fav.vendor.coverImage || fav.vendor.profileImage ? (
                                    <Image
                                        src={fav.vendor.coverImage || fav.vendor.profileImage || ''}
                                        alt={fav.vendor.businessName || 'Vendor'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary-01/20 to-primary-02/20 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary-01">
                                            {fav.vendor.businessName?.[0] || 'V'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="p-5 pt-4">
                                <div className="flex justify-between items-start mb-1">
                                    <Link href={`/customer/vendor-profile/${fav.vendorId}`}>
                                        <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight hover:text-primary-01 transition-colors">
                                            {fav.vendor.businessName || 'Vendor'}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-1.5 bg-neutrals-02 px-2.5 py-1 rounded-lg shrink-0 mt-1">
                                        <Star size={11} className="text-primary-01 fill-current" />
                                        <span className="text-xs font-bold text-foreground">
                                            {fav.vendor.rating ? (fav.vendor.rating / 10).toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-neutrals-06 text-sm mb-4 font-medium">
                                    {fav.category?.name || 'Service'} • {fav.vendor.city || 'Uganda'}
                                </p>

                                {fav.startingPrice && (
                                    <div className="flex items-baseline gap-1 mb-5">
                                        <span className="text-lg font-bold text-foreground">
                                            UGX {formatPrice(fav.startingPrice)}
                                        </span>
                                        <span className="text-sm text-neutrals-06 font-normal">/ event</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Link
                                        href={`/customer/messages?vendorId=${fav.vendorId}`}
                                        className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-6 py-3 rounded-full text-sm transition-colors min-w-[100px]"
                                    >
                                        <MessageSquare size={16} strokeWidth={2.5} />
                                        Chat
                                    </Link>
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
