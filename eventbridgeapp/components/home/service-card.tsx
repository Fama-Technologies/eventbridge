'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ServiceCardProps {
  id: string;
  businessName: string;
  category: string;
  location: string;
  availableDates: string;
  pricePerDay: string;
  rating: number;
  images: string[];
  isFavorite?: boolean;
}

export default function ServiceCard({
  id,
  businessName,
  category,
  location,
  availableDates,
  pricePerDay,
  rating,
  images,
  isFavorite = false,
}: ServiceCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use provided images or fallback to default if empty
  const categoryImages = images.length > 0 ? images : ['/categories/weddings.jpg'];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % categoryImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [categoryImages.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % categoryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? categoryImages.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const shouldShowCategoryLocation =
    category &&
    location &&
    !(category === 'Event Service' && ['Location not specified', 'New York'].includes(location));

  const shouldShowAvailability =
    availableDates && availableDates.toLowerCase() !== 'check availability';

  const shouldShowPrice =
    pricePerDay && pricePerDay.toLowerCase() !== 'contact for pricing';

  return (
    <Link href={`/category/vendor/${id}`} className="group block">
      {/* Image Carousel */}
      <div className="relative h-44 w-full bg-neutrals-03 rounded-xl overflow-hidden mb-3">
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {categoryImages.map((src, index) => (
            <div key={index} className="relative min-w-full h-full">
              <Image
                src={src}
                alt={`${businessName} - Image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Show on hover */}
        {categoryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} className="text-shades-black" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight size={16} className="text-shades-black" />
            </button>
          </>
        )}

        {/* Favorite Button */}
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Optimistic update
            const newStatus = !favorite;
            setFavorite(newStatus);

            try {
              if (newStatus) {
                // Add to favorites
                const res = await fetch('/api/customer/favorites', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ vendorId: parseInt(id) })
                });
                if (!res.ok) throw new Error('Failed to add favorite');
              } else {
                // Remove from favorites
                const res = await fetch(`/api/customer/favorites?vendorId=${id}`, {
                  method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to remove favorite');
              }
            } catch (error) {
              console.error('Error toggling favorite:', error);
              // Revert on error
              setFavorite(!newStatus);
            }
          }}
          className="absolute top-3 right-3 z-10"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={22}
            className={`transition-all duration-300 ${favorite
              ? 'fill-primary-01 text-primary-01 scale-110'
              : 'text-white hover:text-neutrals-02 drop-shadow-md hover:scale-105'
              }`}
            strokeWidth={1.5}
          />
        </button>

        {/* Carousel Indicators */}
        {categoryImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {categoryImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToImage(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${index === currentImageIndex
                  ? 'bg-shades-white w-4'
                  : 'bg-shades-white/60 hover:bg-shades-white/80 w-1.5'
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-black">{businessName}</h3>
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-black text-black" />
            <span className="text-sm text-black">{rating.toFixed(2)}</span>
          </div>
        </div>

        {shouldShowCategoryLocation && (
          <p className="text-sm text-neutrals-06 mb-0.5">
            {category} - {location}
          </p>
        )}
        {shouldShowAvailability && (
          <p className="text-xs text-neutrals-06 mb-1">
            {availableDates}
          </p>
        )}
        {shouldShowPrice && (
          <p className="text-sm text-black">
            {pricePerDay} <span className="text-neutrals-06">/event</span>
          </p>
        )}
      </div>
    </Link>
  );
}
