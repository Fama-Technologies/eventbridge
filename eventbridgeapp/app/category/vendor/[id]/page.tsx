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
import { InquiryModal } from '@/components/category/inquiry-modal';

// ... (existing interfaces)

export default function VendorProfilePage() {
  const params = useParams();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('packages');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);
  const [packageScrollIndex, setPackageScrollIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // State for similar vendors
  const [similarVendors, setSimilarVendors] = useState<any[]>([]);

  // ... (useEffect and loading checks)

  {/* Action Buttons */ }
              <button 
                onClick={() => setShowInquiryModal(true)}
                className="w-full bg-primary-01 text-shades-white py-3 rounded-lg font-medium mb-3 hover:bg-primary-02 transition-colors"
              >
                Make Inquiry
              </button>

              <button 
                onClick={() => setShowInquiryModal(true)}
                className="w-full border border-neutrals-03  text-foreground py-3 rounded-lg font-medium mb-4 hover:border-foreground transition-colors flex items-center justify-center gap-2"
              >
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

              <div className="mt-4 pt-4 border-t border-neutrals-03 ">
                <button className="flex items-center gap-2 text-neutrals-06 text-sm hover:text-foreground transition-colors">
                  <Flag size={14} />
                  Report this listing
                </button>
              </div>
            </div >
          </div >
        </div >

    {/* Inquiry Modal */ }
  {
    vendor && (
      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        vendorName={vendor.name}
        vendorId={vendor.id}
      />
    )
  }

  {/* Similar Vendors Section */ }

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

  {/* Planning Event CTA */ }
  <section className="my-12">
    <PlanningEventCTA />
  </section>
      </main >

    {/* Footer */ }
    < CategoryFooter />
    </div >
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
            ? 'bg-primary-01 text-shades-white'
            : 'bg-white/20 backdrop-blur-sm text-shades-white hover:bg-white/30'
            }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-shades-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-shades-white" fill="white" />
          <span className="text-shades-white text-xs font-medium">{vendor.rating.toFixed(2)}</span>
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
          {vendor.description}
        </p>
        <p>
          With over {vendor.yearsExperience} years of experience, {vendor.name} is dedicated to making your event special.
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

function ReviewsTab({ reviews = [], reviewCount }: { reviews?: Review[]; reviewCount: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border border-neutrals-03 rounded-xl p-5">
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
          ))
        ) : (
          <p className="text-neutrals-06">No reviews yet.</p>
        )}

        {/* Load More Button */}
        <button className="w-full py-3 border border-neutrals-03  rounded-lg text-foreground text-sm font-medium hover:border-foreground transition-colors">
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
              <div className="flex-1 h-2 bg-neutrals-03  rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutrals-08  rounded-full"
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
// Portfolio Tab Component
interface PortfolioItem {
  id: number;
  src: string;
  category: string;
}

function PortfolioTab({ portfolio = [] }: { portfolio?: PortfolioItem[] }) {
  // Extract unique categories from portfolio or default to empty
  const categories = ['All Photos', ...Array.from(new Set(portfolio.map((item) => item.category)))];
  const [activeCategory, setActiveCategory] = useState('All Photos');

  const filteredImages = activeCategory === 'All Photos'
    ? portfolio
    : portfolio.filter(img => img.category === activeCategory);

  return (
    <div>
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
              ? 'bg-primary-01 text-shades-white'
              : 'bg-neutrals-02  text-foreground hover:bg-neutrals-03  '
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filteredImages.length > 0 ? (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {filteredImages.map((image, index) => (
            <div
              key={image.id || index}
              className={`break-inside-avoid relative rounded-xl overflow-hidden ${index % 3 === 0 ? 'aspect-3/4' : index % 3 === 1 ? 'aspect-square' : 'aspect-4/3'
                }`}
            >
              <Image
                src={image.src}
                alt={`Portfolio ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">{image.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-neutrals-06">No photos available.</p>
      )}
    </div>
  );
}