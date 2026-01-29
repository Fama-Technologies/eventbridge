'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Star, MapPin, BadgeCheck, Clock, Calendar, Check, ChevronRight, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import InquiryModal from '@/components/vendor/inquiry-modal';

interface Review {
    id: string;
    author: string;
    avatar: string; // API uses 'avatar', UI used 'image'
    location: string;
    date: string;
    text: string;
    rating: number;
}

interface VendorData {
    id: string;
    name: string;
    category: string;
    location: string;
    country: string;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    startingPrice: number;
    priceUnit: string;
    yearsExperience: number;
    responseTime: string;
    availability: string;
    description: string;
    profileImage: string;
    images: string[];
    reviews: Review[];
    portfolio: { id: number; src: string; category: string }[];
}

export default function VendorProfilePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [portfolioCategory, setPortfolioCategory] = useState('All');
    const [vendor, setVendor] = useState<VendorData | null>(null);
    const [similarVendors, setSimilarVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        const fetchVendorData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/vendor/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Vendor not found');
                    throw new Error('Failed to fetch vendor details');
                }
                const data = await res.json();
                setVendor(data);

                // Fetch Similar Vendors
                if (data.category) {
                    const similarRes = await fetch(`/api/public/vendors?category=${encodeURIComponent(data.category)}&limit=3`);
                    if (similarRes.ok) {
                        const similarData = await similarRes.json();
                        setSimilarVendors(similarData.filter((v: any) => v.id !== params.id));
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load vendor details');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchVendorData();
            checkFavoriteStatus();
        }
    }, [params.id]);

    const checkFavoriteStatus = async () => {
        try {
            const res = await fetch('/api/customer/favorites');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.favorites)) {
                    const isFav = data.favorites.some((fav: any) => fav.vendorId.toString() === params.id);
                    setIsFavorite(isFav);
                }
            }
        } catch (err) {
            console.error('Failed to check favorite status', err);
        }
    };

    const handleFavorite = async () => {
        // Optimistic update
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        try {
            if (newStatus) {
                // Add to favorites
                const res = await fetch('/api/customer/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ vendorId: parseInt(params.id) })
                });
                if (!res.ok) throw new Error('Failed to add favorite');
            } else {
                // Remove from favorites
                const res = await fetch(`/api/customer/favorites?vendorId=${params.id}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to remove favorite');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setIsFavorite(!newStatus);
        }
    };

    // Filter portfolio
    const filteredPortfolio = vendor?.portfolio?.filter(item =>
        portfolioCategory === 'All' || item.category === portfolioCategory
    ) || [];

    const portfolioCategories = ['All', ...Array.from(new Set(vendor?.portfolio?.map(p => p.category) || []))];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-01"></div>
            </div>
        );
    }

    if (error || !vendor) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-neutrals-06 mb-4">{error || 'Vendor not found'}</p>
                <button onClick={() => router.back()} className="text-primary-01 font-medium hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Image Section */}
            <div className="relative h-72 sm:h-96 w-full">
                <Image
                    src={vendor.images[0] || '/categories/placeholder.jpg'}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=1000&auto=format&fit=crop';
                    }}
                />

                {/* Header Actions Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex gap-3">
                        <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                            <Share2 size={20} />
                        </button>
                        <button
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${isFavorite ? 'bg-primary-01 text-white' : 'bg-white text-neutrals-07 hover:text-primary-01'}`}
                            onClick={handleFavorite}
                        >
                            <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                        </button>
                    </div>
                </div>

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                    1/{vendor.images.length}
                </div>
            </div>

            <div className="px-4 py-6 -mt-6 relative bg-background rounded-t-3xl sm:mt-0 sm:rounded-none">
                {/* Vendor Header Info */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
                        <div className="flex items-center gap-1">
                            <Star className="text-primary-01 fill-current" size={16} />
                            <span className="font-bold text-foreground">{vendor.rating}</span>
                            <span className="text-primary-01 text-sm">({vendor.reviewCount} reviews)</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutrals-06 mb-4">
                        <span className="text-primary-01 font-medium">{vendor.category}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {vendor.location}
                        </div>
                        {vendor.isVerified && (
                            <span className="flex items-center gap-1 text-primary-01 bg-primary-01/10 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <BadgeCheck size={12} fill="currentColor" className="text-white" />
                                VERIFIED
                            </span>
                        )}
                    </div>

                    {/* Highlights Pills */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { icon: <Star size={14} />, text: `${vendor.yearsExperience}+ years experience` },
                            { icon: <Clock size={14} />, text: `Replies in ${vendor.responseTime || '<1h'}` },
                            { icon: <Calendar size={14} />, text: vendor.availability || 'Available now' }
                        ].map((pill, idx) => (
                            <div key={idx} className="flex items-center gap-2 border border-neutrals-03 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap text-foreground flex-shrink-0">
                                <span className="text-primary-01">{pill.icon}</span>
                                {pill.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-neutrals-03 w-full mb-6" />

                {/* Tabs */}
                <div className="flex border-b border-neutrals-03 mb-6">
                    {['Overview', 'Packages', 'Reviews', 'Portfolio'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-3 px-4 text-sm font-semibold transition-colors relative ${activeTab === tab.toLowerCase()
                                ? 'text-primary-01'
                                : 'text-neutrals-06 hover:text-foreground'
                                }`}
                        >
                            {tab}
                            {activeTab === tab.toLowerCase() && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-01 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-8">

                    {/* Overview Tab Content */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Reviews Preview Section */}
                            <section>
                                <h2 className="text-lg font-bold text-foreground mb-4">What couples are saying</h2>
                                {vendor.reviews && vendor.reviews.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                                        {vendor.reviews.slice(0, 5).map((review) => (
                                            <div key={review.id} className="min-w-[280px] bg-white border border-neutrals-03 rounded-xl p-4 shadow-sm flex-shrink-0">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-neutrals-03 rounded-full overflow-hidden">
                                                        <img src={review.avatar || '/placeholder-avatar.jpg'} alt={review.author} className="w-full h-full object-cover"
                                                            onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.author}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-foreground">{review.author}</h4>
                                                        <p className="text-xs text-neutrals-06">{review.location} • {review.date}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-neutrals-07 line-clamp-3 leading-relaxed">
                                                    "{review.text}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-neutrals-06 text-sm">No reviews yet.</p>
                                )}
                            </section>

                            {/* Rating Summary Card */}
                            <section className="bg-white rounded-2xl p-6 border border-neutrals-03 text-center mb-6">
                                <div className="text-4xl font-bold text-primary-01 mb-1">{vendor.rating.toFixed(2)}</div>
                                <h3 className="font-bold text-foreground mb-1">Top Recommended</h3>
                                <p className="text-xs text-neutrals-06 max-w-xs mx-auto">
                                    High and positive reviews from the clients. Delivers with efficiency
                                </p>

                                <button className="mt-4 w-full py-2.5 border border-neutrals-03 rounded-lg text-sm font-semibold text-foreground hover:bg-neutrals-02 transition-colors">
                                    Show all {vendor.reviewCount} reviews
                                </button>
                            </section>

                            {/* Vendor Profile Card - UPDATED DESIGN */}
                            <section className="bg-white rounded-[2rem] p-6 border border-neutrals-03 shadow-sm flex items-center gap-6 sm:gap-10">
                                {/* Profile Image & Badge */}
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-2">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-neutrals-02">
                                            <img
                                                src={vendor?.profileImage || '/avatars/default.jpg'}
                                                alt={vendor?.name || 'Vendor'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${vendor?.name || 'Vendor'}&background=random`}
                                            />
                                        </div>
                                        {/* Badge - Always show even if not verified to match design, or use isVerified logic */}
                                        <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#FF5A1F] rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                            <Check size={16} className="text-white" strokeWidth={3} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-foreground text-center leading-tight mb-1">
                                        {(vendor?.name?.split(' ')[0] || 'David')}
                                    </h3>
                                    <p className="text-neutrals-06 font-medium">Vendor</p>
                                </div>

                                {/* Stats */}
                                <div className="flex-1 space-y-6">
                                    <div className="border-b border-neutrals-03 pb-4">
                                        <div className="text-2xl font-bold text-foreground mb-1">{vendor?.reviewCount || 0}</div>
                                        <div className="text-sm text-neutrals-06 font-medium">Reviews</div>
                                    </div>

                                    <div className="border-b border-neutrals-03 pb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl font-bold text-foreground">{vendor?.rating?.toFixed(2) || '5.0'}</span>
                                            <Star size={18} className="text-foreground fill-foreground" />
                                        </div>
                                        <div className="text-sm text-neutrals-06 font-medium">Rating</div>
                                    </div>

                                    <div>
                                        <div className="text-2xl font-bold text-foreground mb-1">{vendor?.yearsExperience || 0}</div>
                                        <div className="text-sm text-neutrals-06 font-medium">Years hosting</div>
                                    </div>
                                </div>
                            </section>

                            {/* Similar Services (Only show on Overview tab) */}
                            {similarVendors.length > 0 && (
                                <section className="mt-8">
                                    <h2 className="text-lg font-bold text-foreground mb-4">Similar services</h2>
                                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                                        {similarVendors.map((similar) => (
                                            <div key={similar.id} className="min-w-[260px]">
                                                <div className="h-40 bg-neutrals-03 rounded-xl mb-3 relative overflow-hidden">
                                                    <img src={similar.images?.[0] || '/categories/placeholder.jpg'} className="w-full h-full object-cover"
                                                        onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000'} />
                                                    <button className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full text-white"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            // For now just alert, implementing fully requires state for each
                                                            // or using ServiceCard component (which is preferred)
                                                            alert('Use the main vendor cards to favorite these!');
                                                        }}
                                                    ><Heart size={14} /></button>
                                                </div>
                                                <h4 className="font-bold text-sm text-foreground truncate">{similar.name}</h4>
                                                <p className="text-xs text-neutrals-06 mb-1 truncate">{similar.category}</p>
                                                <div className="text-xs font-bold text-foreground">
                                                    UGX {formatCurrency(similar.startingPrice || 0)} <span className="text-neutrals-06 font-normal">/ {similar.priceUnit || 'event'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {/* Portfolio Tab Content */}
                    {activeTab === 'portfolio' && (
                        <section>
                            <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
                                {portfolioCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setPortfolioCategory(cat)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${portfolioCategory === cat
                                            ? 'bg-primary-01 text-white'
                                            : 'bg-neutrals-02 text-foreground hover:bg-neutrals-03'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                {filteredPortfolio.map((item) => (
                                    <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-neutrals-02 cursor-pointer group">
                                        <img
                                            src={item.src}
                                            alt={item.category}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => (e.target as HTMLImageElement).src = '/categories/placeholder.jpg'}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </div>
                                ))}
                                {filteredPortfolio.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-neutrals-06">
                                        No photos found in this category.
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Other Tabs (Placeholder) */}
                    {(activeTab === 'packages' || activeTab === 'reviews') && (
                        <div className="py-12 text-center text-neutrals-06 bg-neutrals-02 rounded-xl">
                            Content for {activeTab} will appear here.
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutrals-03 p-4 px-6 z-[60] pb-safe-area-inset-bottom">
                <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                    <div>
                        <p className="text-xs text-neutrals-06">Starting from</p>
                        <div className="font-bold text-foreground text-lg sm:text-xl">
                            UGX {formatCurrency(vendor.startingPrice)} <span className="text-sm font-normal text-neutrals-06">/{vendor.priceUnit}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsInquiryModalOpen(true)}
                        className="flex-1 max-w-xs bg-primary-01 hover:bg-primary-02 text-white font-bold py-3.5 rounded-full shadow-lg shadow-primary-01/20 transition-all"
                    >
                        Make Inquiry
                    </button>
                </div>
            </div>
            {/* Inquiry Modal */}
            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                vendorName={vendor.name}
            />
        </div>
    );
}
