'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Heart,
  MapPin,
  Clock,
  Calendar,
  MessageSquare,
  Shield,
  Flag,
  Check,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  BadgeCheck,
  LayoutGrid
} from 'lucide-react';
import { CategoryHeader, PlanningEventCTA, CategoryFooter } from '@/components/category';

// Types
interface VendorPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'fixed' | 'custom';
  features: string[];
  badge?: 'Best Value' | 'Popular';
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
  guestCapacity: string;
  description: string;
  images: string[];
  packages: VendorPackage[];
}

// MOCK_VENDOR and SIMILAR_VENDORS removed. Data will be fetched from API.

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Tab type
type TabType = 'overview' | 'packages' | 'reviews' | 'portfolio';

// FloatingHearts component for Instagram-style animation
function FloatingHearts({ show }: { show: boolean }) {
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);

  useEffect(() => {
    if (show) {
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        left: 20 + Math.random() * 60, // Random position between 20% and 80%
        delay: i * 80, // Stagger the animation
        size: 14 + Math.random() * 8 // Random size between 14-22px
      }));
      setHearts(newHearts);

      // Clear hearts after animation
      const timer = setTimeout(() => {
        setHearts([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || hearts.length === 0) return null;

  return (
    <>
      <style>{`
        .ig-hearts-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
          z-index: 1000;
        }
        .ig-heart {
          position: absolute;
          bottom: 50%;
          color: #e91e63;
          animation: igFloat 1.8s ease-out forwards;
        }
        @keyframes igFloat {
          0% {
            transform: translateY(0) translateX(-50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            transform: translateY(-8px) translateX(-50%) scale(1.3) rotate(-5deg);
            opacity: 1;
          }
          20% {
            transform: translateY(-16px) translateX(-45%) scale(1.1) rotate(5deg);
            opacity: 0.9;
          }
          40% {
            transform: translateY(-35px) translateX(-55%) scale(0.9) rotate(-3deg);
            opacity: 0.7;
          }
          70% {
            transform: translateY(-60px) translateX(-50%) scale(0.6) rotate(2deg);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-90px) translateX(-50%) scale(0.2) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="ig-hearts-container">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="ig-heart"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}ms`,
              fontSize: `${heart.size}px`
            }}
          >
            ❤️
          </div>
        ))}
      </div>
    </>
  );
}

export default function VendorProfilePage() {
  const params = useParams();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('packages');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);
  const [packageScrollIndex, setPackageScrollIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // State for similar vendors
  const [similarVendors, setSimilarVendors] = useState<any[]>([]);

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // Fetch Vendor Details
        const vendorRes = await fetch(`/api/vendor/${params.id}`);
        if (!vendorRes.ok) throw new Error('Failed to fetch vendor');
        const vendorData = await vendorRes.json();
        setVendor(vendorData);

        // Fetch Similar Vendors (using the vendor's category)
        if (vendorData && vendorData.category) {
          const similarRes = await fetch(`/api/public/vendors?category=${encodeURIComponent(vendorData.category)}&limit=3`);
          if (similarRes.ok) {
            const similarData = await similarRes.json();
            // Filter out the current vendor from similar results
            setSimilarVendors(similarData.filter((v: any) => v.id !== params.id));
          }
        }
      } catch (error) {
        console.error('Error loading vendor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVendorData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CategoryHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-01"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <CategoryHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vendor Not Found</h1>
          <p className="text-neutrals-06">The vendor you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/" className="mt-4 text-primary-01 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'packages', label: 'Packages' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'portfolio', label: 'Portfolio' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CategoryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Image Gallery */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[300px] sm:h-[400px] lg:h-[450px] mb-6 rounded-xl overflow-hidden">
          {/* Main Image */}
          <div className="col-span-4 sm:col-span-2 row-span-2 relative group">
            <Image
              src={vendor.images[0]}
              alt={vendor.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Secondary Images */}
          <div className="hidden sm:block relative">
            <Image
              src={vendor.images[1] || vendor.images[0]}
              alt={`${vendor.name} gallery`}
              fill
              className="object-cover"
            />
          </div>

          <div className="hidden sm:block relative">
            {/* Verified Badge */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              {vendor.isVerified && (
                <span className="bg-shades-white text-shades-black  px-4 py-2 rounded-4xl flex items-center gap-1">
                  <BadgeCheck size={24} className='text-primary-01' />
                  VERIFIED
                </span>
              )}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsFavorite(!isFavorite);
                    setShowFloatingHearts(false); // Reset first
                    setTimeout(() => setShowFloatingHearts(true), 50); // Then trigger
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFavorite
                      ? 'bg-primary-01 text-white'
                      : 'bg-shades-white text-neutrals-07 hover:bg-white'
                    }`}
                >
                  <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <FloatingHearts show={showFloatingHearts} />
              </div>
            </div>
            <Image
              src={vendor.images[2] || vendor.images[0]}
              alt={`${vendor.name} gallery`}
              fill
              className="object-cover"
            />
          </div>

          <div className="hidden sm:block relative">
            <Image
              src={vendor.images[3] || vendor.images[0]}
              alt={`${vendor.name} gallery`}
              fill
              className="object-cover"
            />
          </div>

          <div className="hidden sm:block relative">
            <Image
              src={vendor.images[4] || vendor.images[0]}
              alt={`${vendor.name} gallery`}
              fill
              className="object-cover"
            />
            {/* Show All Photos Button */}
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute bottom-3 right-3  bg-shades-white text-shades-black px-3 py-1.5 font-semibold rounded-4xl flex items-center gap-2 text-sm transition-colors"
            >
              <LayoutGrid size={14} />
              Show all photos
            </button>
          </div>
        </div>

        {/* Photo Gallery Modal */}
        {showAllPhotos && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="absolute top-4 right-4 text-shades-white hover:text-gray-300"
            >
              ✕
            </button>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl max-h-[90vh] overflow-auto">
              {vendor.images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image src={img} alt={`Gallery ${index + 1}`} fill className="object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Vendor Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-primary-01">{vendor.category}</span>
                    <span className="text-neutrals-06">•</span>
                    <span className="flex items-center gap-1 text-neutrals-06">
                      <MapPin size={14} />
                      {vendor.location}, {vendor.country}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-foreground" fill="currentColor" />
                  <span className="font-semibold text-foreground">{vendor.rating}</span>
                  <span className="text-neutrals-06 text-sm">({vendor.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-neutrals-02 dark:bg-neutrals-08 text-foreground text-xs px-3 py-1.5 rounded-full">
                  <Clock size={14} />
                  {vendor.yearsExperience}+ years experience
                </span>
                <span className="inline-flex items-center gap-1.5 bg-neutrals-02 dark:bg-neutrals-08 text-foreground text-xs px-3 py-1.5 rounded-full">
                  <MessageSquare size={14} />
                  Replies in {vendor.responseTime}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-neutrals-02 dark:bg-neutrals-08 text-foreground text-xs px-3 py-1.5 rounded-full">
                  <Calendar size={14} />
                  {vendor.availability}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-neutrals-03 dark:border-neutrals-07 mb-6">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key
                        ? 'text-primary-01 border-primary-01'
                        : 'text-neutrals-06 border-transparent hover:text-foreground'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'packages' && (
              <div>
                {/* Package Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Popular Packages</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPackageScrollIndex(Math.max(0, packageScrollIndex - 1))}
                      className="w-8 h-8 rounded-full border border-neutrals-04 dark:border-neutrals-07 flex items-center justify-center text-neutrals-06 hover:border-primary-01 hover:text-primary-01 transition-colors disabled:opacity-50"
                      disabled={packageScrollIndex === 0}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPackageScrollIndex(Math.min(vendor.packages.length - 1, packageScrollIndex + 1))}
                      className="w-8 h-8 rounded-full border border-neutrals-04 dark:border-neutrals-07 flex items-center justify-center text-neutrals-06 hover:border-primary-01 hover:text-primary-01 transition-colors disabled:opacity-50"
                      disabled={packageScrollIndex >= vendor.packages.length - 1}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendor.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="border border-neutrals-03 dark:border-neutrals-07 rounded-xl p-5 hover:border-primary-01 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                        {pkg.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded ${pkg.badge === 'Best Value'
                              ? 'bg-primary-01 text-white'
                              : 'bg-primary-01/20 text-primary-01'
                            }`}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-neutrals-06 text-sm mb-4">{pkg.description}</p>

                      {pkg.priceType === 'custom' ? (
                        <div className="mb-4">
                          <span className="text-lg font-bold text-foreground">Custom</span>
                          <span className="text-neutrals-06 text-sm"> pricing</span>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <span className="text-lg font-bold text-foreground">
                            UGX {formatCurrency(pkg.price)}
                          </span>
                          <span className="text-neutrals-06 text-sm">/ event</span>
                        </div>
                      )}

                      <ul className="space-y-2 mb-4">
                        {pkg.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-neutrals-07">
                            <Check size={14} className="text-primary-01 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button className="w-full py-2 px-4 border border-primary-01 text-primary-01 rounded-lg text-sm font-medium hover:bg-primary-01 hover:text-white transition-colors">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <OverviewTab vendor={vendor} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab reviewCount={vendor.reviewCount} />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioTab />
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-shades-white dark:bg-shades-black border border-neutrals-03 dark:border-neutrals-07 rounded-xl p-6 shadow-sm">
              <p className="text-neutrals-06 text-sm mb-1">Starting from</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-foreground">
                  UGX {formatCurrency(vendor.startingPrice)}
                </span>
                <span className="text-neutrals-06">/{vendor.priceUnit}</span>
              </div>

              <div className="flex items-center gap-1 mb-4">
                <Star size={14} className="text-foreground" fill="currentColor" />
                <span className="text-sm text-foreground">{vendor.rating}</span>
              </div>

              {/* Date and Guests */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="border border-neutrals-03 dark:border-neutrals-07 rounded-lg p-3">
                  <p className="text-xs text-neutrals-06 mb-1">DATE</p>
                  <p className="text-primary-01 text-sm font-medium">Add Date</p>
                </div>
                <div className="border border-neutrals-03 dark:border-neutrals-07 rounded-lg p-3">
                  <p className="text-xs text-neutrals-06 mb-1">GUESTS</p>
                  <p className="text-primary-01 text-sm font-medium">{vendor.guestCapacity}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <button className="w-full bg-primary-01 text-white py-3 rounded-lg font-medium mb-3 hover:bg-primary-02 transition-colors">
                Make Inquiry
              </button>

              <button className="w-full border border-neutrals-03 dark:border-neutrals-07 text-foreground py-3 rounded-lg font-medium mb-4 hover:border-foreground transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={16} />
                Chat with Vendor
              </button>

              <p className="text-center text-xs text-neutrals-06 mb-4">
                🔒 You won&apos;t be charged yet
              </p>

              <div className="flex items-center justify-center gap-2 text-sm">
                <Shield size={14} className="text-primary-01" />
                <span className="text-neutrals-07">Verified by EventBridge</span>
              </div>

              <div className="mt-4 pt-4 border-t border-neutrals-03 dark:border-neutrals-07">
                <button className="flex items-center gap-2 text-neutrals-06 text-sm hover:text-foreground transition-colors">
                  <Flag size={14} />
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Vendors Section */}
        <section className="mt-16 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Similar vendors in {vendor.location}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVendors.length > 0 ? (
              similarVendors.map((similarVendor) => (
                <SimilarVendorCard key={similarVendor.id} vendor={similarVendor} />
              ))
            ) : (
              <p className="text-neutrals-06 col-span-full">No similar vendors found.</p>
            )}
          </div>
        </section>

        {/* Planning Event CTA */}
        <section className="my-12">
          <PlanningEventCTA />
        </section>
      </main>

      {/* Footer */}
      <CategoryFooter />
    </div>
  );
}

// Similar Vendor Card Component
interface SimilarVendorCardProps {
  vendor: {
    id: string;
    name: string;
    category: string;
    location: string;
    availability: string;
    price: string;
    priceUnit: string;
    rating: number;
    images: string[];
  };
}

function SimilarVendorCard({ vendor }: SimilarVendorCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link href={`/category/vendor/${vendor.id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-neutrals-03">
        <Image
          src={vendor.images[currentImageIndex] || '/categories/placeholder.jpg'}
          alt={vendor.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFavorite
              ? 'bg-primary-01 text-white'
              : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
            }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-white" fill="white" />
          <span className="text-white text-xs font-medium">{vendor.rating.toFixed(2)}</span>
        </div>

        {/* Image Dots */}
        {vendor.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {vendor.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
                    ? 'bg-white w-3'
                    : 'bg-white/50 hover:bg-white/70'
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-0.5">{vendor.name}</h3>
        <p className="text-neutrals-06 text-xs mb-0.5">
          {vendor.category} - {vendor.location}
        </p>
        <p className="text-neutrals-07 text-xs mb-2">{vendor.availability}</p>
        <p className="text-foreground font-medium text-sm">
          ${vendor.price} <span className="text-neutrals-06 font-normal">/{vendor.priceUnit}</span>
        </p>
      </div>
    </Link>
  );
}
// Overview Tab Component
function OverviewTab({ vendor }: { vendor: VendorData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className={`text-neutrals-07 leading-relaxed ${!expanded ? 'line-clamp-6' : ''}`}>
        <p className="mb-4">
          Royal Touch Décor specializes in transforming spaces into breathtaking experiences. With over {vendor.yearsExperience} years of styling premium weddings in Kampala and beyond, we bring a sophisticated blend of modern elegance and timeless tradition to every event. From intimate garden ceremonies to grand ballroom receptions, our team ensures every petal and drape is perfectly placed.
        </p>
        <p>
          We offer full-service floral design, custom backdrops, lighting, and furniture rentals. Our mission is to tell your unique love story through exquisite design.
        </p>
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-primary-01 text-sm font-medium hover:underline flex items-center gap-1"
      >
        {expanded ? 'Show less' : 'Read more'}
        <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
    </div>
  );
}

// Reviews Tab Component
interface Review {
  id: string;
  author: string;
  avatar: string;
  location: string;
  date: string;
  text: string;
  rating: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sarah K.',
    avatar: '/avatars/avatar1.jpg',
    location: 'Kampala',
    date: 'October 2023',
    text: 'Absolutely stunning! The team went above and beyond for our reception. The flowers were fresh and the lighting transformed the entire hall. Highly...',
    rating: 5,
  },
  {
    id: '2',
    author: 'James M.',
    avatar: '/avatars/avatar2.jpg',
    location: 'Kampala',
    date: 'August 2023',
    text: 'Professional and timely. They handled our corporate gala decor with such class. The branding integration was seamless.',
    rating: 5,
  },
];

function ReviewsTab({ reviewCount }: { reviewCount: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Reviews List */}
      <div className="space-y-6">
        {MOCK_REVIEWS.map((review) => (
          <div key={review.id} className="border border-neutrals-03 dark:border-neutrals-07 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-neutrals-03 overflow-hidden relative">
                <Image
                  src={review.avatar}
                  alt={review.author}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{review.author}</h4>
                <p className="text-neutrals-06 text-xs">{review.location} • {review.date}</p>
              </div>
            </div>
            <p className="text-neutrals-07 text-sm leading-relaxed">&ldquo;{review.text}&rdquo;</p>
          </div>
        ))}

        {/* Load More Button */}
        <button className="w-full py-3 border border-neutrals-03 dark:border-neutrals-07 rounded-lg text-foreground text-sm font-medium hover:border-foreground transition-colors">
          Show all reviews
        </button>
      </div>

      {/* Rating Summary */}
      <div className="flex flex-col items-center justify-start pt-4">
        <Star size={32} className="text-primary-01 mb-2" />
        <p className="text-neutrals-06 text-sm">based on {reviewCount} reviews</p>
        <div className="mt-6 w-full max-w-xs space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-xs text-neutrals-06 w-3">{stars}</span>
              <div className="flex-1 h-2 bg-neutrals-03 dark:bg-neutrals-07 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutrals-08 dark:bg-neutrals-04 rounded-full"
                  style={{ width: stars === 5 ? '85%' : stars === 4 ? '10%' : '5%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Portfolio Tab Component
const PORTFOLIO_CATEGORIES = ['All Photos', 'Weddings', 'Corporate', 'Birthdays', 'Bridal Showers', 'Baby Showers'];

const PORTFOLIO_IMAGES = [
  { src: '/categories/weddings.jpg', category: 'Weddings' },
  { src: '/categories/Corporate.jpg', category: 'Corporate' },
  { src: '/categories/Birthdays.jpg', category: 'Birthdays' },
  { src: '/categories/Parties.jpg', category: 'Weddings' },
  { src: '/categories/weddings.jpg', category: 'Bridal Showers' },
  { src: '/categories/Corporate.jpg', category: 'Corporate' },
  { src: '/categories/Birthdays.jpg', category: 'Baby Showers' },
  { src: '/categories/Parties.jpg', category: 'Weddings' },
];

function PortfolioTab() {
  const [activeCategory, setActiveCategory] = useState('All Photos');

  const filteredImages = activeCategory === 'All Photos'
    ? PORTFOLIO_IMAGES
    : PORTFOLIO_IMAGES.filter(img => img.category === activeCategory);

  return (
    <div>
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PORTFOLIO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                ? 'bg-primary-01 text-white'
                : 'bg-neutrals-02 dark:bg-neutrals-08 text-foreground hover:bg-neutrals-03 dark:hover:bg-neutrals-07'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {filteredImages.map((image, index) => (
          <div
            key={index}
            className={`break-inside-avoid relative rounded-xl overflow-hidden ${index % 3 === 0 ? 'aspect-3/4' : index % 3 === 1 ? 'aspect-square' : 'aspect-4/3'
              }`}
          >
            <Image
              src={image.src}
              alt={`Portfolio ${index + 1}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}