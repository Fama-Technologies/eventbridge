'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Search, Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

// Types based on your schema
interface FavoriteVendor {
    id: number;
    vendorId: number;
    createdAt: Date;
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

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteVendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Fetch favorites from API
    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/customer/favorites');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFavorites(data.favorites);
                } else {
                    toast.error(data.error || 'Failed to load favorites');
                }
            } else {
                toast.error('Failed to load favorites');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast.error('Error loading favorites');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (vendorId: number) => {
        try {
            setRemovingId(vendorId);
            
            const response = await fetch(`/api/customer/favorites?vendorId=${vendorId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFavorites(prev => prev.filter(f => f.vendorId !== vendorId));
                    toast.success('Removed from favorites');
                } else {
                    toast.error(data.error || 'Failed to remove favorite');
                }
            } else {
                toast.error('Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast.error('Error removing favorite');
        } finally {
            setRemovingId(null);
        }
    };

    const addFavorite = async (vendorId: number) => {
        try {
            const response = await fetch('/api/customer/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ vendorId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    toast.success('Added to favorites!');
                    // Refresh the list
                    fetchFavorites();
                } else {
                    toast.error(data.error || 'Failed to add favorite');
                }
            } else {
                toast.error('Failed to add favorite');
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
            toast.error('Error adding favorite');
        }
    };

    const isEmpty = favorites.length === 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-01 mx-auto mb-4" />
                    <p className="text-neutrals-06">Loading favorites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center justify-between">
                <button 
                    onClick={() => router.back()} 
                    className="p-1 text-foreground"
                    aria-label="Go back"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">Favourites</h1>
                    <Heart className="text-primary-01 fill-primary-01" size={20} />
                </div>

                <button 
                    className="p-1 text-foreground"
                    aria-label="Search"
                    onClick={() => toast.info('Search feature coming soon!')}
                >
                    <Search size={24} />
                </button>
            </div>

            {isEmpty ? (
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
                <div className="p-4 space-y-6 pb-20">
                    {favorites.map(({ vendor, category, startingPrice, id }) => (
                        <div key={id} className="bg-white rounded-[2rem] shadow-sm border border-neutrals-03 overflow-hidden mb-6">
                            {/* Image Section */}
                            <div className="relative h-72 bg-neutrals-02">
                                {/* Featured Badge */}
                                {vendor.isVerified && (
                                    <span className="absolute bottom-4 left-4 bg-white text-green-600 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-widest shadow-sm">
                                        Verified
                                    </span>
                                )}

                                {/* Heart Button */}
                                <button
                                    onClick={() => removeFavorite(vendor.id)}
                                    disabled={removingId === vendor.id}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                                    aria-label={`Remove ${vendor.businessName} from favorites`}
                                >
                                    {removingId === vendor.id ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-primary-01" />
                                    ) : (
                                        <Heart className="text-primary-01 fill-primary-01" size={20} />
                                    )}
                                </button>

                                <div className="relative w-full h-full">
                                    <Image
                                        src={vendor.coverImage || vendor.profileImage || '/placeholder.jpg'}
                                        alt={vendor.businessName || 'Vendor'}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority={vendor.id === 1}
                                    />
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 pt-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                                        {vendor.businessName || 'Unnamed Vendor'}
                                    </h3>
                                    {(vendor.rating || vendor.rating === 0) && (
                                        <div className="flex items-center gap-1.5 bg-neutrals-02 px-2.5 py-1 rounded-lg shrink-0 mt-1">
                                            <Star size={11} className="text-primary-01 fill-current" />
                                            <span className="text-xs font-bold text-foreground">
                                                {vendor.rating.toFixed(1)}
                                                <span className="text-neutrals-06 font-normal ml-1">
                                                    ({vendor.reviewCount || 0})
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-neutrals-06 text-sm mb-4 font-medium">
                                    {category?.name || 'Various Services'} • {vendor.city || 'Multiple Locations'}
                                </p>

                                <div className="flex items-baseline gap-1 mb-5">
                                    {startingPrice ? (
                                        <>
                                            <span className="text-lg font-bold text-foreground">UGX {startingPrice.toLocaleString()}</span>
                                            <span className="text-sm text-neutrals-06 font-normal">/ hour</span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold text-foreground">Contact for pricing</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button 
                                        className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-6 py-3 rounded-full text-sm transition-colors min-w-[100px]"
                                        onClick={() => toast.info('Chat feature coming soon!')}
                                    >
                                        <MessageSquare size={16} strokeWidth={2.5} />
                                        Chat
                                    </button>
                                    <button 
                                        className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-5 py-3 rounded-full text-sm transition-colors"
                                        onClick={() => toast.info('Add to Event feature coming soon!')}
                                    >
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