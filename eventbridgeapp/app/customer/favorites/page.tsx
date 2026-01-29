'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Search, Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface FavoriteItem {
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
    hourlyRate: number | null;
    user?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  category: {
    id: number;
    name: string;
  } | null;
  startingPrice: number | null;
}

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    // Fetch favorites from database
    const fetchFavorites = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching favorites from API...');
            const response = await fetch('/api/customer/favorites');
            const data = await response.json();
            
            console.log('API response:', data);
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to fetch favorites');
            }
            
            setFavorites(data.favorites || []);
        } catch (err: any) {
            console.error('Error fetching favorites:', err);
            setError(err.message || 'Failed to load favorites');
            setFavorites([]); // Clear favorites on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const removeFavorite = async (vendorId: number) => {
        try {
            setRemovingId(vendorId);
            
            const response = await fetch(`/api/customer/favorites?vendorId=${vendorId}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to remove favorite');
            }
            
            // Update local state
            setFavorites(prev => prev.filter(f => f.vendorId !== vendorId));
            
            // Show success message
            alert('Removed from favorites!');
        } catch (err: any) {
            console.error('Error removing favorite:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setRemovingId(null);
        }
    };

    const isEmpty = favorites.length === 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-01 mx-auto mb-4" />
                    <p className="text-neutrals-06">Loading favorites from database...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background p-4">
                {/* Header */}
                <div className="bg-white sticky top-0 z-10 shadow-sm px-4 py-4 flex items-center justify-between mb-4">
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
                    <button className="p-1 text-foreground opacity-0">
                        <Search size={24} />
                    </button>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <div className="text-red-600 mb-3">
                        <Heart className="h-12 w-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Favorites</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <div className="space-y-3">
                        <button
                            onClick={fetchFavorites}
                            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/customer/dashboard')}
                            className="bg-primary-01 text-white px-6 py-2 rounded-full hover:bg-primary-02"
                        >
                            Browse Vendors
                        </button>
                    </div>
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
                    onClick={() => alert('Search feature coming soon!')}
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
                    <div className="text-sm text-neutrals-06">
                        Showing {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                    </div>
                    
                    {favorites.map((item) => {
                        const vendor = item.vendor;
                        const vendorName = vendor.businessName || 
                                          (vendor.user ? `${vendor.user.firstName} ${vendor.user.lastName}` : 'Vendor');
                        const location = vendor.city || 'Location not specified';
                        const price = vendor.hourlyRate ? `UGX ${vendor.hourlyRate.toLocaleString()}` : 'Contact for pricing';
                        const rating = vendor.rating || 0;
                        const reviewCount = vendor.reviewCount || 0;
                        const imageUrl = vendor.coverImage || vendor.profileImage || '/placeholder.jpg';

                        return (
                            <div key={item.id} className="bg-white rounded-[2rem] shadow-sm border border-neutrals-03 overflow-hidden mb-6">
                                {/* Image Section */}
                                <div className="relative h-72 bg-neutrals-02">
                                    {/* Verified Badge */}
                                    {vendor.isVerified && (
                                        <span className="absolute bottom-4 left-4 bg-white text-green-600 text-[10px] font-bold px-3 py-1.5 rounded-full z-10 uppercase tracking-widest shadow-sm">
                                            ✓ Verified
                                        </span>
                                    )}

                                    {/* Heart Button */}
                                    <button
                                        onClick={() => removeFavorite(vendor.id)}
                                        disabled={removingId === vendor.id}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center z-10 shadow-sm active:scale-95 transition-transform disabled:opacity-50"
                                        aria-label={`Remove ${vendorName} from favorites`}
                                    >
                                        {removingId === vendor.id ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-primary-01" />
                                        ) : (
                                            <Heart className="text-primary-01 fill-primary-01" size={20} />
                                        )}
                                    </button>

                                    <div className="relative w-full h-full">
                                        <Image
                                            src={imageUrl}
                                            alt={vendorName}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5 pt-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-xl font-bold text-foreground leading-tight tracking-tight">
                                            {vendorName}
                                        </h3>
                                        {rating > 0 && (
                                            <div className="flex items-center gap-1.5 bg-neutrals-02 px-2.5 py-1 rounded-lg shrink-0 mt-1">
                                                <Star size={11} className="text-primary-01 fill-current" />
                                                <span className="text-xs font-bold text-foreground">
                                                    {rating.toFixed(1)}
                                                    <span className="text-neutrals-06 font-normal ml-1">
                                                        ({reviewCount})
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-neutrals-06 text-sm mb-4 font-medium">
                                        {item.category?.name || 'Various Services'} • {location}
                                    </p>

                                    {vendor.description && (
                                        <p className="text-neutrals-06 text-sm mb-4 line-clamp-2">
                                            {vendor.description}
                                        </p>
                                    )}

                                    <div className="flex items-baseline gap-1 mb-5">
                                        <span className="text-lg font-bold text-foreground">{price}</span>
                                        {vendor.hourlyRate && (
                                            <span className="text-sm text-neutrals-06 font-normal">/ hour</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button 
                                            className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-6 py-3 rounded-full text-sm transition-colors min-w-[100px]"
                                            onClick={() => alert('Chat feature coming soon!')}
                                        >
                                            <MessageSquare size={16} strokeWidth={2.5} />
                                            Chat
                                        </button>
                                        <button 
                                            className="flex items-center justify-center gap-2 bg-neutrals-02 hover:bg-neutrals-03 text-foreground font-semibold px-5 py-3 rounded-full text-sm transition-colors"
                                            onClick={() => alert('Add to Event feature coming soon!')}
                                        >
                                            <div className="w-4 h-4 rounded-full border border-foreground flex items-center justify-center">
                                                <Plus size={10} strokeWidth={3} />
                                            </div>
                                            Add to Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}